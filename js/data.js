export const clubs = [
  {
    id: "club_ankara",
    name: "Ankara Kalesi",
    shortName: "ANK",
    league: "Süper Lig",
    budget: 12400000,
    color: "#d52b34",
    secondary: "#f7e7a8",
    rank: 4,
    form: ["W", "D", "W", "L", "W"],
  },
  {
    id: "club_bogaz",
    name: "Boğaz FK",
    shortName: "BGZ",
    league: "Süper Lig",
    budget: 18200000,
    color: "#142d70",
    secondary: "#f3c548",
    rank: 2,
    form: ["W", "W", "D", "W", "W"],
  },
  {
    id: "club_izmir",
    name: "İzmir Martıları",
    shortName: "İZM",
    league: "Süper Lig",
    budget: 9800000,
    color: "#1478a8",
    secondary: "#ffffff",
    rank: 6,
    form: ["D", "W", "L", "W", "D"],
  },
  {
    id: "club_bursa",
    name: "Bursa 1963",
    shortName: "BUR",
    league: "Süper Lig",
    budget: 7600000,
    color: "#118449",
    secondary: "#ffffff",
    rank: 8,
    form: ["L", "D", "W", "W", "L"],
  },
  {
    id: "club_trabzon",
    name: "Trabzon Yıldızı",
    shortName: "TRY",
    league: "Süper Lig",
    budget: 14100000,
    color: "#8b1931",
    secondary: "#65b8de",
    rank: 3,
    form: ["W", "W", "L", "D", "W"],
  },
  {
    id: "club_antalya",
    name: "Antalya Güneşi",
    shortName: "ANT",
    league: "Süper Lig",
    budget: 6800000,
    color: "#c4202d",
    secondary: "#ffffff",
    rank: 10,
    form: ["L", "D", "L", "W", "D"],
  },
];

const firstNames = [
  "Mert", "Emir", "Arda", "Kaan", "Kerem", "Berk", "Ozan", "Efe", "Yusuf", "Can",
  "Tolga", "Umut", "Onur", "Baran", "Batuhan", "Alper", "Deniz", "Serkan",
];

const lastNames = [
  "Kaya", "Demir", "Yılmaz", "Şahin", "Aydın", "Çelik", "Koç", "Aksoy", "Öztürk",
  "Arslan", "Kurt", "Bulut", "Tekin", "Özer", "Güneş", "Karaca", "Aslan", "Yalçın",
];

const positions = ["GK", "RB", "CB", "CB", "LB", "DM", "CM", "AM", "RW", "LW", "ST", "ST", "CM", "CB"];

function seededNumber(seed) {
  const value = Math.sin(seed * 9301 + 49297) * 233280;
  return value - Math.floor(value);
}

function createPlayers() {
  return clubs.flatMap((club, clubIndex) =>
    positions.map((position, playerIndex) => {
      const seed = clubIndex * 31 + playerIndex + 1;
      const overall = 66 + Math.floor(seededNumber(seed) * 16) + (clubIndex < 2 ? 2 : 0);
      const form = 53 + Math.floor(seededNumber(seed + 12) * 39);
      const age = 18 + Math.floor(seededNumber(seed + 29) * 17);
      const value = Math.round((350000 + Math.pow(overall - 61, 2.25) * 14500) * (0.8 + form / 250) / 50000) * 50000;

      return {
        id: `${club.id}_p${String(playerIndex + 1).padStart(2, "0")}`,
        name: `${firstNames[(seed * 3) % firstNames.length]} ${lastNames[(seed * 7) % lastNames.length]}`,
        position,
        age,
        clubId: club.id,
        overall,
        form,
        value,
        appearances: 0,
        ratingTotal: 0,
      };
    }),
  );
}

export function createInitialState() {
  return {
    version: 1,
    selectedClubId: null,
    currentWeek: 1,
    transferWindow: true,
    clubs: structuredClone(clubs),
    players: createPlayers(),
    standings: clubs.map((club, index) => ({
      clubId: club.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      seedOrder: index,
    })),
    history: [],
    notifications: [
      { title: "Scout listesi hazır", meta: "6 oyuncu" },
      { title: "Transfer dönemi açık", meta: "4 hafta" },
    ],
  };
}
