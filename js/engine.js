function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function calculatePlayerValue(player) {
  const overallFactor = Math.pow(player.overall / 70, 3);
  const formFactor = 0.8 + player.form / 250;
  const ageFactor = player.age <= 23 ? 1.2 : player.age <= 28 ? 1 : player.age <= 31 ? 0.78 : 0.58;
  return Math.max(200000, Math.round((1000000 * overallFactor * formFactor * ageFactor) / 50000) * 50000);
}

export function getTeamStrength(players, clubId) {
  const squad = players.filter((player) => player.clubId === clubId);
  const effective = squad
    .map((player) => player.overall * 0.75 + player.form * 0.25)
    .sort((a, b) => b - a)
    .slice(0, 11);

  return effective.reduce((sum, value) => sum + value, 0) / Math.max(1, effective.length);
}

function expectedGoals(power, opponentPower, homeAdvantage) {
  const edge = power - opponentPower + homeAdvantage;
  return clamp(1.15 + edge / 13 + randomBetween(-0.55, 0.65), 0.15, 3.8);
}

function sampleGoals(expected) {
  let goals = 0;
  let remaining = expected;
  while (remaining > 0) {
    if (Math.random() < Math.min(0.78, remaining / 2.2)) goals += 1;
    remaining -= 0.72;
  }
  return clamp(goals, 0, 6);
}

export function simulateMatch(state, homeClubId, awayClubId) {
  const homeStrength = getTeamStrength(state.players, homeClubId);
  const awayStrength = getTeamStrength(state.players, awayClubId);
  const homeGoals = sampleGoals(expectedGoals(homeStrength, awayStrength, 2.4));
  const awayGoals = sampleGoals(expectedGoals(awayStrength, homeStrength, 0));

  updateStandings(state, homeClubId, awayClubId, homeGoals, awayGoals);
  updateSquadAfterMatch(state, homeClubId, homeGoals, awayGoals);
  updateSquadAfterMatch(state, awayClubId, awayGoals, homeGoals);

  return {
    id: `match_${Date.now()}`,
    week: state.currentWeek,
    homeClubId,
    awayClubId,
    homeGoals,
    awayGoals,
  };
}

function updateStandings(state, homeClubId, awayClubId, homeGoals, awayGoals) {
  const home = state.standings.find((row) => row.clubId === homeClubId);
  const away = state.standings.find((row) => row.clubId === awayClubId);

  for (const row of [home, away]) row.played += 1;
  home.goalsFor += homeGoals;
  home.goalsAgainst += awayGoals;
  away.goalsFor += awayGoals;
  away.goalsAgainst += homeGoals;

  if (homeGoals > awayGoals) {
    home.won += 1;
    home.points += 3;
    away.lost += 1;
  } else if (awayGoals > homeGoals) {
    away.won += 1;
    away.points += 3;
    home.lost += 1;
  } else {
    home.drawn += 1;
    away.drawn += 1;
    home.points += 1;
    away.points += 1;
  }
}

function updateSquadAfterMatch(state, clubId, scored, conceded) {
  const outcomeBoost = scored > conceded ? 1.2 : scored === conceded ? 0.2 : -1.1;
  const squad = state.players.filter((player) => player.clubId === clubId);

  squad.forEach((player, index) => {
    const started = index < 11;
    if (!started) return;

    const rating = clamp(6.45 + outcomeBoost + randomBetween(-1.05, 1.15), 4, 10);
    player.appearances += 1;
    player.ratingTotal += rating;

    const formDelta = rating >= 8.5 ? 5 : rating >= 7.5 ? 3 : rating >= 6.5 ? 1 : rating < 6 ? -3 : -1;
    player.form = clamp(player.form + formDelta, 0, 100);

    if (player.appearances % 5 === 0) {
      const averageRating = player.ratingTotal / player.appearances;
      if (averageRating > 7.5 && player.age <= 24) player.overall = clamp(player.overall + 1, 45, 95);
      if (averageRating < 6.2 && player.age >= 30) player.overall = clamp(player.overall - 1, 45, 95);
    }

    player.value = calculatePlayerValue(player);
  });
}

export function simulateOtherMatches(state, excludedClubIds) {
  const available = state.clubs.map((club) => club.id).filter((id) => !excludedClubIds.includes(id));
  for (let index = 0; index < available.length - 1; index += 2) {
    simulateMatch(state, available[index], available[index + 1]);
  }
}
