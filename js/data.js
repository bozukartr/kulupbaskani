import { defaultLeagues } from "./data/leagues.js";
import { defaultClubs } from "./data/clubs.js";
import { defaultPlayers } from "./data/players.js";
import { createSeasonFixtures, createStandings } from "./season.js";

export function createInitialState() {
  const leagues = structuredClone(defaultLeagues);
  const clubs = structuredClone(defaultClubs);
  const players = structuredClone(defaultPlayers);

  return {
    version: 2,
    selectedClubId: null,
    currentWeek: 1,
    transferWindow: true,
    seasonStatus: "active",
    leagues,
    clubs,
    players,
    fixtures: createSeasonFixtures(leagues, clubs),
    standings: createStandings(clubs),
    history: [],
    notifications: [
      { title: "Sezon fikstürü hazır", meta: "Çift devre" },
      { title: "Transfer dönemi açık", meta: "4 hafta" },
    ],
  };
}
