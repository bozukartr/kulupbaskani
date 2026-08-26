import { calculatePlayerValue } from "./engine.js";
import { rebuildSeason } from "./season.js";
import { loadGameState, saveGameState } from "./storage.js";

let state = loadGameState();
let selectedLeagueId = state.leagues[0]?.id ?? null;
let selectedClubId = null;
let toastTimer;

const leagueList = document.querySelector("#league-list");
const clubPanelContent = document.querySelector("#club-panel-content");
const playerPanelContent = document.querySelector("#player-panel-content");
const clubPanelSubtitle = document.querySelector("#club-panel-subtitle");
const playerPanelSubtitle = document.querySelector("#player-panel-subtitle");
const toast = document.querySelector("#admin-toast");

document.querySelector("#league-form").addEventListener("submit", addLeague);
render();

function render() {
  document.querySelector("#league-count").textContent = state.leagues.length;
  document.querySelector("#club-count").textContent = state.clubs.length;
  document.querySelector("#player-count").textContent = state.players.length;
  renderLeagues();
  renderClubs();
  renderPlayers();
}

function renderLeagues() {
  leagueList.innerHTML = state.leagues.length
    ? state.leagues.map((league) => {
        const teamCount = state.clubs.filter((club) => club.leagueId === league.id).length;
        return `
          <div class="entity-row ${league.id === selectedLeagueId ? "is-selected" : ""}">
            <button class="entity-main" type="button" data-select-league="${league.id}">
              <strong>${escapeHtml(league.name)}</strong><span>${teamCount} takım</span>
            </button>
            <button class="delete-entity" type="button" data-delete-league="${league.id}" aria-label="${escapeHtml(league.name)} ligini sil">×</button>
          </div>
        `;
      }).join("")
    : '<div class="entity-empty">Henüz lig eklenmedi.</div>';

  leagueList.querySelectorAll("[data-select-league]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLeagueId = button.dataset.selectLeague;
      selectedClubId = null;
      render();
    });
  });
  leagueList.querySelectorAll("[data-delete-league]").forEach((button) => {
    button.addEventListener("click", () => deleteLeague(button.dataset.deleteLeague));
  });
}

function renderClubs() {
  const league = getLeague(selectedLeagueId);
  if (!league) {
    clubPanelSubtitle.textContent = "Önce bir lig seç";
    clubPanelContent.innerHTML = '<div class="panel-placeholder">Takım eklemek için önce bir lig oluştur ve seç.</div>';
    return;
  }

  const clubs = state.clubs.filter((club) => club.leagueId === league.id);
  clubPanelSubtitle.textContent = league.name;
  clubPanelContent.innerHTML = `
    <form id="club-form" class="admin-form">
      <label><span>TAKIM ADI</span><input id="club-name" maxlength="50" placeholder="Örn. Ankara Gücü" required /></label>
      <button class="admin-add-button" type="submit">${escapeHtml(league.name)} Ligine Ekle</button>
    </form>
    <div class="entity-list">
      ${clubs.length ? clubs.map((club) => {
        const playerCount = state.players.filter((player) => player.clubId === club.id).length;
        return `
          <div class="entity-row ${club.id === selectedClubId ? "is-selected" : ""}">
            <button class="entity-main" type="button" data-select-club="${club.id}">
              <strong>${escapeHtml(club.name)}</strong><span>${playerCount} oyuncu</span>
            </button>
            <button class="delete-entity" type="button" data-delete-club="${club.id}" aria-label="${escapeHtml(club.name)} takımını sil">×</button>
          </div>
        `;
      }).join("") : '<div class="entity-empty">Bu ligde henüz takım yok.</div>'}
    </div>
  `;

  document.querySelector("#club-form").addEventListener("submit", addClub);
  clubPanelContent.querySelectorAll("[data-select-club]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedClubId = button.dataset.selectClub;
      render();
    });
  });
  clubPanelContent.querySelectorAll("[data-delete-club]").forEach((button) => {
    button.addEventListener("click", () => deleteClub(button.dataset.deleteClub));
  });
}

function renderPlayers() {
  const club = getClub(selectedClubId);
  if (!club) {
    playerPanelSubtitle.textContent = "Önce bir takım seç";
    playerPanelContent.innerHTML = '<div class="panel-placeholder">Oyuncu eklemek için bir takım seç.</div>';
    return;
  }

  const players = state.players.filter((player) => player.clubId === club.id).sort((a, b) => b.overall - a.overall);
  playerPanelSubtitle.textContent = club.name;
  playerPanelContent.innerHTML = `
    <form id="player-form" class="admin-form">
      <div class="player-form-grid">
        <label><span>OYUNCU ADI</span><input id="player-name" maxlength="60" placeholder="Ad Soyad" required /></label>
        <label><span>OVERALL</span><input id="player-overall" type="number" min="40" max="99" value="70" required /></label>
      </div>
      <button class="admin-add-button" type="submit">${escapeHtml(club.name)} Kadrosuna Ekle</button>
    </form>
    <div class="entity-list">
      ${players.length ? players.map((player) => `
        <div class="entity-row">
          <div class="entity-main"><strong>${escapeHtml(player.name)}</strong><span>Overall ${player.overall}</span></div>
          <button class="delete-entity" type="button" data-delete-player="${player.id}" aria-label="${escapeHtml(player.name)} oyuncusunu sil">×</button>
        </div>
      `).join("") : '<div class="entity-empty">Bu takımda henüz oyuncu yok.</div>'}
    </div>
  `;

  document.querySelector("#player-form").addEventListener("submit", addPlayer);
  playerPanelContent.querySelectorAll("[data-delete-player]").forEach((button) => {
    button.addEventListener("click", () => deletePlayer(button.dataset.deletePlayer));
  });
}

function addLeague(event) {
  event.preventDefault();
  const input = document.querySelector("#league-name");
  const name = cleanName(input.value);
  if (!name) return;
  if (state.leagues.some((league) => league.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"))) {
    showToast("Bu lig zaten kayıtlı.");
    return;
  }

  const league = { id: createId("league", name), name, level: state.leagues.length + 1 };
  state.leagues.push(league);
  selectedLeagueId = league.id;
  selectedClubId = null;
  input.value = "";
  persist("Lig eklendi.");
}

function addClub(event) {
  event.preventDefault();
  const input = document.querySelector("#club-name");
  const name = cleanName(input.value);
  if (!name || !selectedLeagueId) return;
  if (state.clubs.some((club) => club.leagueId === selectedLeagueId && club.name.toLocaleLowerCase("tr-TR") === name.toLocaleLowerCase("tr-TR"))) {
    showToast("Bu takım ligde zaten kayıtlı.");
    return;
  }

  const club = {
    id: createId("club", name),
    name,
    shortName: createShortName(name),
    leagueId: selectedLeagueId,
    budget: 5000000,
    color: colorFromName(name),
    secondary: "#ffffff",
    form: ["D", "D", "D", "D", "D"],
  };
  state.clubs.push(club);
  selectedClubId = club.id;
  rebuildSeason(state);
  persist("Takım eklendi ve fikstür yenilendi.");
}

function addPlayer(event) {
  event.preventDefault();
  const nameInput = document.querySelector("#player-name");
  const overallInput = document.querySelector("#player-overall");
  const name = cleanName(nameInput.value);
  const overall = Math.round(Math.min(99, Math.max(40, Number(overallInput.value))));
  if (!name || !selectedClubId || !Number.isFinite(overall)) return;

  const player = {
    id: createId("player", name),
    name,
    clubId: selectedClubId,
    overall,
    position: "—",
    age: 24,
    form: overall,
    value: 0,
    appearances: 0,
    ratingTotal: 0,
  };
  player.value = calculatePlayerValue(player);
  state.players.push(player);
  nameInput.value = "";
  overallInput.value = "70";
  persist("Oyuncu kadroya eklendi.");
}

function deleteLeague(leagueId) {
  const league = getLeague(leagueId);
  if (!league || !window.confirm(`${league.name} ligi, takımları ve oyuncuları silinecek. Emin misin?`)) return;
  const clubIds = new Set(state.clubs.filter((club) => club.leagueId === leagueId).map((club) => club.id));
  state.leagues = state.leagues.filter((item) => item.id !== leagueId);
  state.clubs = state.clubs.filter((club) => !clubIds.has(club.id));
  state.players = state.players.filter((player) => !clubIds.has(player.clubId));
  if (clubIds.has(state.selectedClubId)) state.selectedClubId = null;
  selectedLeagueId = state.leagues[0]?.id ?? null;
  selectedClubId = null;
  rebuildSeason(state);
  persist("Lig ve bağlı veriler silindi.");
}

function deleteClub(clubId) {
  const club = getClub(clubId);
  if (!club || !window.confirm(`${club.name} ve tüm oyuncuları silinecek. Emin misin?`)) return;
  state.clubs = state.clubs.filter((item) => item.id !== clubId);
  state.players = state.players.filter((player) => player.clubId !== clubId);
  if (state.selectedClubId === clubId) state.selectedClubId = null;
  if (selectedClubId === clubId) selectedClubId = null;
  rebuildSeason(state);
  persist("Takım silindi ve fikstür yenilendi.");
}

function deletePlayer(playerId) {
  const player = state.players.find((item) => item.id === playerId);
  if (!player || !window.confirm(`${player.name} kadrodan silinecek. Emin misin?`)) return;
  state.players = state.players.filter((item) => item.id !== playerId);
  persist("Oyuncu silindi.");
}

function persist(message) {
  saveGameState(state);
  render();
  showToast(message);
}

function getLeague(leagueId) {
  return state.leagues.find((league) => league.id === leagueId);
}

function getClub(clubId) {
  return state.clubs.find((club) => club.id === clubId);
}

function cleanName(value) {
  return value.trim().replace(/[<>]/g, "").replace(/\s+/g, " ");
}

function createId(prefix, name) {
  const slug = name
    .toLocaleLowerCase("tr-TR")
    .replace(/[çÇ]/g, "c").replace(/[ğĞ]/g, "g").replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o").replace(/[şŞ]/g, "s").replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "kayit";
  return `${prefix}_${slug}_${Date.now().toString(36)}`;
}

function createShortName(name) {
  const words = name.split(" ").filter(Boolean);
  const shortName = words.length >= 3
    ? words.slice(0, 3).map((word) => word[0]).join("")
    : name.replace(/\s/g, "").slice(0, 3);
  return shortName.toLocaleUpperCase("tr-TR");
}

function colorFromName(name) {
  let hash = 0;
  for (const character of name) hash = character.charCodeAt(0) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360} 62% 38%)`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}
