import { createInitialState } from "./data.js";

export const STORAGE_KEY = "kulupBaskaniSave_v2";

export function loadGameState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.version === 2 && Array.isArray(saved.leagues) && Array.isArray(saved.fixtures)) {
      return saved;
    }
  } catch (error) {
    console.warn("Kayıt okunamadı:", error);
  }

  return createInitialState();
}

export function saveGameState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetGameState() {
  localStorage.removeItem(STORAGE_KEY);
  return createInitialState();
}
