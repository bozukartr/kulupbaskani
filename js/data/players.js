import { defaultClubs } from "./clubs.js";

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

function calculateInitialValue(overall, form, age) {
  const ageMultiplier = age <= 23 ? 1.2 : age <= 28 ? 1 : age <= 31 ? 0.78 : 0.58;
  const rawValue = (350000 + Math.pow(overall - 61, 2.25) * 14500) * (0.8 + form / 250) * ageMultiplier;
  return Math.max(200000, Math.round(rawValue / 50000) * 50000);
}

export const defaultPlayers = defaultClubs.flatMap((club, clubIndex) =>
  positions.map((position, playerIndex) => {
    const seed = clubIndex * 31 + playerIndex + 1;
    const overall = 66 + Math.floor(seededNumber(seed) * 16) + (clubIndex < 2 ? 2 : 0);
    const form = 53 + Math.floor(seededNumber(seed + 12) * 39);
    const age = 18 + Math.floor(seededNumber(seed + 29) * 17);

    return {
      id: `${club.id}_p${String(playerIndex + 1).padStart(2, "0")}`,
      name: `${firstNames[(seed * 3) % firstNames.length]} ${lastNames[(seed * 7) % lastNames.length]}`,
      clubId: club.id,
      overall,
      position,
      age,
      form,
      value: calculateInitialValue(overall, form, age),
      appearances: 0,
      ratingTotal: 0,
    };
  }),
);
