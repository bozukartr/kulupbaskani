function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createLeagueFixtures(leagueId, clubIds) {
  if (clubIds.length < 2) return [];

  const teams = shuffle(clubIds);
  if (teams.length % 2 !== 0) teams.push(null);

  const roundCount = teams.length - 1;
  const firstLeg = [];
  let rotation = [...teams];

  for (let round = 0; round < roundCount; round += 1) {
    for (let matchIndex = 0; matchIndex < rotation.length / 2; matchIndex += 1) {
      const first = rotation[matchIndex];
      const second = rotation[rotation.length - 1 - matchIndex];
      if (!first || !second) continue;

      const reverseHome = (round + matchIndex) % 2 === 1;
      firstLeg.push({
        id: `${leagueId}_w${round + 1}_m${matchIndex + 1}`,
        leagueId,
        week: round + 1,
        homeClubId: reverseHome ? second : first,
        awayClubId: reverseHome ? first : second,
        status: "scheduled",
        homeGoals: null,
        awayGoals: null,
      });
    }

    rotation = [rotation[0], rotation.at(-1), ...rotation.slice(1, -1)];
  }

  const secondLeg = firstLeg.map((fixture) => ({
    ...fixture,
    id: `${leagueId}_w${fixture.week + roundCount}_r_${fixture.id}`,
    week: fixture.week + roundCount,
    homeClubId: fixture.awayClubId,
    awayClubId: fixture.homeClubId,
  }));

  return [...firstLeg, ...secondLeg];
}

export function createSeasonFixtures(leagues, clubs) {
  return leagues.flatMap((league) => {
    const clubIds = clubs.filter((club) => club.leagueId === league.id).map((club) => club.id);
    return createLeagueFixtures(league.id, clubIds);
  });
}

export function createStandings(clubs) {
  return clubs.map((club, index) => ({
    clubId: club.id,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    seedOrder: index,
  }));
}

export function rebuildSeason(state) {
  state.currentWeek = 1;
  state.fixtures = createSeasonFixtures(state.leagues, state.clubs);
  state.standings = createStandings(state.clubs);
  state.history = [];
  state.transferWindow = true;
  state.seasonStatus = "active";
  state.clubs.forEach((club) => {
    club.form = ["D", "D", "D", "D", "D"];
  });
  state.players.forEach((player) => {
    player.appearances = 0;
    player.ratingTotal = 0;
  });
}
