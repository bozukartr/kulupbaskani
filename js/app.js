import { getTeamStrength, simulateMatch } from "./engine.js";
import { rebuildSeason } from "./season.js";
import { loadGameState, resetGameState, saveGameState } from "./storage.js";
const POSITION_GROUPS = {
  GK: ["GK"],
  DEF: ["RB", "CB", "LB"],
  MID: ["DM", "CM", "AM"],
  ATT: ["RW", "LW", "ST"],
};

let state = loadGameState();
let currentRoute = "home";
let squadFilter = "ALL";
let marketQuery = "";
let leagueTab = "standings";
let toastTimer;

const picker = document.querySelector("#club-picker");
const clubList = document.querySelector("#club-list");
const clubSearch = document.querySelector("#club-search");
const game = document.querySelector("#game");
const view = document.querySelector("#view");
const clubIdentity = document.querySelector("#club-identity");
const budgetValue = document.querySelector("#budget-value");
const playerDialog = document.querySelector("#player-dialog");
const playerDialogContent = document.querySelector("#player-dialog-content");
const toast = document.querySelector("#toast");

init();

function init() {
  bindGlobalEvents();

  if (!state.selectedClubId) {
    renderClubPicker();
    return;
  }

  openGame();
}

function bindGlobalEvents() {
  clubSearch.addEventListener("input", (event) => renderClubPicker(event.target.value));

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.route));
  });

  clubIdentity.addEventListener("click", () => navigate("menu"));

  playerDialog.addEventListener("click", (event) => {
    if (event.target === playerDialog) playerDialog.close();
  });
}

function renderClubPicker(query = "") {
  const normalized = query.trim().toLocaleLowerCase("tr-TR");
  const matches = state.clubs.filter((club) => club.name.toLocaleLowerCase("tr-TR").includes(normalized));

  clubList.innerHTML = matches.length
    ? matches.map((club) => `
        <button
          class="club-option"
          type="button"
          data-club-id="${club.id}"
          style="--club-color:${club.color};--club-secondary:${club.secondary}"
          role="listitem"
        >
          ${clubBadge(club)}
          <span>
            <strong>${club.name}</strong>
            <span>${getLeague(club.leagueId)?.name ?? "Lig belirtilmedi"} · ${formatCurrency(club.budget)} bütçe</span>
          </span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      `).join("")
    : '<div class="empty-state">Kulüp bulunamadı.</div>';

  clubList.querySelectorAll("[data-club-id]").forEach((button) => {
    button.addEventListener("click", () => selectClub(button.dataset.clubId));
  });
}

function selectClub(clubId) {
  state.selectedClubId = clubId;
  saveGameState(state);
  openGame();
}

function openGame() {
  picker.hidden = true;
  game.hidden = false;
  updateHud();
  navigate("home");
}

function navigate(route) {
  currentRoute = route;
  document.querySelectorAll(".nav-item").forEach((button) => {
    const active = button.dataset.route === route;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });

  renderRoute();
  view.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRoute() {
  const routes = {
    home: renderHome,
    squad: renderSquad,
    transfer: renderTransfer,
    league: renderLeague,
    menu: renderMenu,
  };

  routes[currentRoute]?.();
}

function updateHud() {
  const club = getSelectedClub();
  if (!club) return;

  document.documentElement.style.setProperty("--accent", club.color);
  document.documentElement.style.setProperty("--accent-soft", `${club.color}18`);
  clubIdentity.innerHTML = `
    ${clubBadge(club)}
    <span>
      <strong>${club.name}</strong>
      <span>${getLeague(club.leagueId)?.name ?? "Lig belirtilmedi"} · ${getClubRank(club.id)}. sıra</span>
    </span>
  `;
  budgetValue.textContent = formatCurrency(club.budget);
}

function renderHome() {
  const club = getSelectedClub();
  const league = getLeague(club.leagueId);
  const fixture = getCurrentUserFixture();
  const totalWeeks = getSeasonTotalWeeks();
  const seasonFinished = totalWeeks > 0 && state.currentWeek > totalWeeks;
  const lastMatch = state.history.at(-1);
  const rank = getClubRank(club.id);

  view.innerHTML = `
    <div class="page-heading">
      <div>
        <p class="section-kicker">${(league?.name ?? "LİG").toLocaleUpperCase("tr-TR")}</p>
        <h1>${rank}. sıradasın</h1>
      </div>
      <span class="week-pill">${seasonFinished ? "SEZON SONU" : `HAFTA ${state.currentWeek}`}</span>
    </div>

    <section class="card hero-card" style="--club-color:${club.color}">
      ${renderHomeFixture(fixture, seasonFinished, totalWeeks)}
    </section>

    <div class="dashboard-grid">
      <section class="card mini-card">
        <span class="stat-label">TAKIM GÜCÜ</span>
        <strong class="big-number">${Math.round(getTeamStrength(state.players, club.id))}</strong>
        <p class="muted">İlk 11 efektif gücü</p>
      </section>
      <section class="card mini-card">
        <span class="stat-label">FORM</span>
        <div class="form-row">${club.form.map(formChip).join("")}</div>
      </section>
      <section class="card mini-card is-wide">
        <span class="stat-label">KULÜP GÜNDEMİ</span>
        <div class="alert-list">
          ${state.notifications.map((item) => `
            <div class="alert-row"><strong>${item.title}</strong><span>${item.meta}</span></div>
          `).join("")}
        </div>
      </section>
      ${lastMatch ? renderLastMatchCard(lastMatch) : ""}
    </div>
  `;

  document.querySelector("#simulate-week")?.addEventListener("click", playNextWeek);
  document.querySelector("#new-season")?.addEventListener("click", startNewSeason);
}

function renderHomeFixture(fixture, seasonFinished, totalWeeks) {
  if (seasonFinished) {
    return `
      <p class="section-kicker">SEZON TAMAMLANDI</p>
      <div class="season-complete">
        <strong>${getClubRank(state.selectedClubId)}. sıra</strong>
        <span>${totalWeeks} haftalık sezon sona erdi.</span>
      </div>
      <button id="new-season" class="primary-button" type="button">Yeni Sezon Başlat</button>
    `;
  }

  if (!fixture) {
    return `
      <p class="section-kicker">BU HAFTA</p>
      <div class="season-complete">
        <strong>${totalWeeks ? "Bay geçiyorsun" : "Fikstür bekleniyor"}</strong>
        <span>${totalWeeks ? "Diğer lig maçları oynanacak." : "Lige en az iki takım eklemelisin."}</span>
      </div>
      ${totalWeeks ? '<button id="simulate-week" class="primary-button" type="button">Haftayı İlerle</button>' : ""}
    `;
  }

  const home = getClub(fixture.homeClubId);
  const away = getClub(fixture.awayClubId);
  return `
    <p class="section-kicker">SIRADAKİ MAÇ · HAFTA ${fixture.week}</p>
    <div class="fixture-row">
      <div class="fixture-team">${clubBadge(home)}<strong>${home.name}</strong></div>
      <div class="versus">VS</div>
      <div class="fixture-team">${clubBadge(away)}<strong>${away.name}</strong></div>
    </div>
    <button id="simulate-week" class="primary-button" type="button">Haftayı Oyna</button>
  `;
}

function renderLastMatchCard(match) {
  const home = getClub(match.homeClubId);
  const away = getClub(match.awayClubId);
  return `
    <section class="card mini-card is-wide">
      <span class="stat-label">SON MAÇ</span>
      <div class="alert-row" style="margin-top:12px">
        <strong>${home.shortName} ${match.homeGoals} – ${match.awayGoals} ${away.shortName}</strong>
        <span>Hafta ${match.week}</span>
      </div>
    </section>
  `;
}

function playNextWeek() {
  const club = getSelectedClub();
  const weekFixtures = state.fixtures.filter(
    (fixture) => fixture.week === state.currentWeek && fixture.status === "scheduled",
  );
  let userMatch = null;

  weekFixtures.forEach((fixture) => {
    const result = simulateMatch(state, fixture.homeClubId, fixture.awayClubId);
    fixture.status = "played";
    fixture.homeGoals = result.homeGoals;
    fixture.awayGoals = result.awayGoals;
    const savedResult = { ...result, fixtureId: fixture.id, leagueId: fixture.leagueId };
    state.history.push(savedResult);
    if ([fixture.homeClubId, fixture.awayClubId].includes(club.id)) userMatch = savedResult;
  });

  if (userMatch) {
    const isHome = userMatch.homeClubId === club.id;
    const userGoals = isHome ? userMatch.homeGoals : userMatch.awayGoals;
    const opponentGoals = isHome ? userMatch.awayGoals : userMatch.homeGoals;
    const result = userGoals > opponentGoals ? "W" : userGoals === opponentGoals ? "D" : "L";
    club.form = [...club.form.slice(-4), result];
    const opponentId = isHome ? userMatch.awayClubId : userMatch.homeClubId;
    const opponent = getClub(opponentId);
    state.notifications = [
      { title: `${club.shortName} ${userGoals} – ${opponentGoals} ${opponent.shortName}`, meta: result === "W" ? "Galibiyet" : result === "D" ? "Beraberlik" : "Mağlubiyet" },
      { title: "Oyuncu değerleri güncellendi", meta: `${state.players.filter((player) => player.clubId === club.id).length} oyuncu` },
    ];
  } else {
    state.notifications = [{ title: "Bay haftası tamamlandı", meta: `Hafta ${state.currentWeek}` }];
  }

  state.currentWeek += 1;
  const winterStart = Math.floor(getSeasonTotalWeeks() / 2) + 1;
  state.transferWindow = state.currentWeek <= 4 || (state.currentWeek >= winterStart && state.currentWeek <= winterStart + 2);
  state.seasonStatus = state.currentWeek > getSeasonTotalWeeks() ? "completed" : "active";
  saveGameState(state);
  updateHud();
  renderHome();
  showToast(userMatch ? "Haftanın maçları tamamlandı." : "Bay haftası tamamlandı.");
}

function startNewSeason() {
  rebuildSeason(state);
  state.notifications = [{ title: "Yeni sezon fikstürü hazır", meta: "Çift devre" }];
  saveGameState(state);
  updateHud();
  renderHome();
  showToast("Yeni sezon fikstürü oluşturuldu.");
}

function renderSquad() {
  const club = getSelectedClub();
  const allPlayers = state.players.filter((player) => player.clubId === club.id);
  const players = squadFilter === "ALL"
    ? allPlayers
    : allPlayers.filter((player) => POSITION_GROUPS[squadFilter].includes(player.position));

  view.innerHTML = `
    <div class="page-heading">
      <div><p class="section-kicker">${club.shortName}</p><h1>Kadro</h1></div>
      <span class="week-pill">${allPlayers.length} OYUNCU</span>
    </div>
    <div class="filter-row" aria-label="Pozisyon filtresi">
      ${[["ALL", "Tümü"], ["GK", "GK"], ["DEF", "DEF"], ["MID", "MID"], ["ATT", "ATT"]]
        .map(([value, label]) => `<button class="filter-chip ${squadFilter === value ? "is-active" : ""}" type="button" data-filter="${value}">${label}</button>`)
        .join("")}
    </div>
    <div class="player-list">${players.map(playerCard).join("")}</div>
  `;

  view.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      squadFilter = button.dataset.filter;
      renderSquad();
    });
  });
  bindPlayerCards();
}

function renderTransfer() {
  const club = getSelectedClub();
  const market = state.players
    .filter((player) => player.clubId !== club.id)
    .filter((player) => player.name.toLocaleLowerCase("tr-TR").includes(marketQuery.toLocaleLowerCase("tr-TR")))
    .sort((a, b) => b.form - a.form)
    .slice(0, 30);

  view.innerHTML = `
    <div class="page-heading">
      <div><p class="section-kicker">OYUNCU PAZARI</p><h1>Transfer</h1></div>
      <span class="status-pill ${state.transferWindow ? "is-open" : ""}">${state.transferWindow ? "DÖNEM AÇIK" : "DÖNEM KAPALI"}</span>
    </div>
    <div class="search-section">
      <label class="search-field">
        <span class="sr-only">Oyuncu ara</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.4a7.75 7.75 0 1 1-15.5 0 7.75 7.75 0 0 1 15.5 0Z" /></svg>
        <input id="market-search" type="search" value="${marketQuery}" placeholder="Oyuncu ara" autocomplete="off" />
      </label>
      <p class="muted" style="font-size:12px;margin:0">Forma göre öne çıkan oyuncular</p>
    </div>
    <div class="player-list">
      ${market.length ? market.map(playerCard).join("") : '<div class="empty-state">Oyuncu bulunamadı.</div>'}
    </div>
  `;

  document.querySelector("#market-search").addEventListener("input", (event) => {
    marketQuery = event.target.value;
    renderTransfer();
    const input = document.querySelector("#market-search");
    input.focus();
    input.setSelectionRange(marketQuery.length, marketQuery.length);
  });
  bindPlayerCards();
}

function renderLeague() {
  const selectedClub = getSelectedClub();
  const league = getLeague(selectedClub.leagueId);
  const rows = getSortedStandings(selectedClub.leagueId);
  view.innerHTML = `
    <div class="page-heading">
      <div><p class="section-kicker">2026/27</p><h1>${league?.name ?? "Lig"}</h1></div>
      <span class="week-pill">HAFTA ${state.currentWeek}</span>
    </div>
    <div class="filter-row league-tabs" aria-label="Lig görünümü">
      <button class="filter-chip ${leagueTab === "standings" ? "is-active" : ""}" type="button" data-league-tab="standings">Puan Durumu</button>
      <button class="filter-chip ${leagueTab === "fixtures" ? "is-active" : ""}" type="button" data-league-tab="fixtures">Sezon Fikstürü</button>
    </div>
    ${leagueTab === "standings" ? renderStandingsTable(rows) : renderSeasonSchedule(selectedClub.leagueId)}
  `;

  view.querySelectorAll("[data-league-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      leagueTab = button.dataset.leagueTab;
      renderLeague();
    });
  });
}

function renderStandingsTable(rows) {
  if (!rows.length) return '<div class="empty-state">Bu ligde henüz takım yok.</div>';
  return `
    <section class="card table-card">
      <table class="league-table">
        <thead><tr><th>#</th><th>TAKIM</th><th>O</th><th>AV</th><th>P</th></tr></thead>
        <tbody>${rows.map((row, index) => {
          const club = getClub(row.clubId);
          return `
            <tr class="${club.id === state.selectedClubId ? "is-user" : ""}">
              <td>${index + 1}</td>
              <td><div class="table-club">${clubBadge(club)}<span>${club.name}</span></div></td>
              <td>${row.played}</td>
              <td>${formatGoalDifference(row.goalsFor - row.goalsAgainst)}</td>
              <td><strong>${row.points}</strong></td>
            </tr>
          `;
        }).join("")}</tbody>
      </table>
    </section>
  `;
}

function renderSeasonSchedule(leagueId) {
  const fixtures = state.fixtures.filter((fixture) => fixture.leagueId === leagueId);
  if (!fixtures.length) {
    return '<div class="empty-state">Fikstür oluşturmak için bu lige en az iki takım ekle.</div>';
  }

  const weeks = [...new Set(fixtures.map((fixture) => fixture.week))].sort((a, b) => a - b);
  return `<div class="fixture-list">${weeks.map((week) => {
    const matches = fixtures.filter((fixture) => fixture.week === week);
    return `
      <section class="card fixture-week ${week === state.currentWeek ? "is-current" : ""}">
        <div class="fixture-week-head"><strong>${week}. Hafta</strong>${week === state.currentWeek ? "<span>SIRADAKİ</span>" : ""}</div>
        ${matches.map((fixture) => {
          const home = getClub(fixture.homeClubId);
          const away = getClub(fixture.awayClubId);
          const score = fixture.status === "played" ? `${fixture.homeGoals} – ${fixture.awayGoals}` : "VS";
          return `
            <div class="fixture-line ${[home.id, away.id].includes(state.selectedClubId) ? "is-user" : ""}">
              <span>${home.name}</span><strong>${score}</strong><span>${away.name}</span>
            </div>
          `;
        }).join("")}
      </section>
    `;
  }).join("")}</div>`;
}

function renderMenu() {
  const club = getSelectedClub();
  const squad = state.players.filter((player) => player.clubId === club.id);
  const average = squad.length ? Math.round(squad.reduce((sum, player) => sum + player.overall, 0) / squad.length) : 0;

  view.innerHTML = `
    <div class="page-heading"><div><p class="section-kicker">KARİYER</p><h1>Menü</h1></div></div>
    <div class="menu-list">
      <section class="card menu-card">
        <h3>${club.name}</h3>
        <p>${getLeague(club.leagueId)?.name ?? "Lig belirtilmedi"} · 2026/27 sezonu · Hafta ${state.currentWeek}</p>
        <div class="summary-stats">
          <div class="summary-stat"><strong>${getClubRank(club.id)}</strong><span>SIRA</span></div>
          <div class="summary-stat"><strong>${average}</strong><span>ORT. OVR</span></div>
          <div class="summary-stat"><strong>${state.history.length}</strong><span>MAÇ</span></div>
        </div>
      </section>
      <section class="card menu-card">
        <h3>Kayıt sistemi</h3>
        <p>Kariyer bu cihazda otomatik olarak saklanır. Firebase bulut kaydı sonraki fazda eklenecek.</p>
      </section>
      <section class="card menu-card">
        <h3>Demo sürümü</h3>
        <p>Gerçek lig verileri yerine oyun motorunu test etmek için kurgusal kulüp ve oyuncular kullanılıyor.</p>
      </section>
      <a class="admin-link" href="admin.html">
        <span><strong>Veri Yönetimi</strong><small>Lig, takım ve oyuncu ekle</small></span>
        <span aria-hidden="true">›</span>
      </a>
      <button id="reset-career" class="danger-button" type="button">Kariyeri Sıfırla</button>
    </div>
  `;

  document.querySelector("#reset-career").addEventListener("click", resetCareer);
}

function resetCareer() {
  if (!window.confirm("Mevcut kariyer silinecek. Emin misin?")) return;
  state = resetGameState();
  currentRoute = "home";
  squadFilter = "ALL";
  marketQuery = "";
  game.hidden = true;
  picker.hidden = false;
  clubSearch.value = "";
  renderClubPicker();
}

function playerCard(player) {
  const club = getClub(player.clubId);
  return `
    <button class="player-card" type="button" data-player-id="${player.id}">
      <span class="position-badge">${player.position}</span>
      <span class="player-main">
        <strong>${player.name}</strong>
        <span>${club.shortName} · ${player.age} yaş</span>
        <span class="market-value">${formatCurrency(player.value)}</span>
      </span>
      <span class="player-numbers">
        <span class="number-cell"><strong>${player.overall}</strong><small>OVR</small></span>
        <span class="number-cell"><strong>${player.form}</strong><small>FORM</small></span>
      </span>
    </button>
  `;
}

function bindPlayerCards() {
  view.querySelectorAll("[data-player-id]").forEach((button) => {
    button.addEventListener("click", () => openPlayer(button.dataset.playerId));
  });
}

function openPlayer(playerId) {
  const player = state.players.find((item) => item.id === playerId);
  const club = getClub(player.clubId);
  const isOwnPlayer = player.clubId === state.selectedClubId;
  const canBid = state.transferWindow && !isOwnPlayer;

  playerDialogContent.innerHTML = `
    <div class="dialog-body">
      <div class="dialog-handle"></div>
      <div class="dialog-head">
        <div><p class="section-kicker">${player.position} · ${club.shortName}</p><h2>${player.name}</h2><p class="muted">${player.age} yaş · ${club.name}</p></div>
        <button id="close-player" class="close-button" type="button" aria-label="Kapat">×</button>
      </div>
      <div class="player-hero-stats">
        <div class="player-hero-stat"><strong>${player.overall}</strong><span>OVERALL</span></div>
        <div class="player-hero-stat"><strong>${player.form}</strong><span>FORM</span></div>
        <div class="player-hero-stat"><strong>${formatCompactCurrency(player.value)}</strong><span>VALUE</span></div>
      </div>
      <div class="dialog-meta">
        <span>${player.appearances} maç</span>
        <span>${player.appearances ? (player.ratingTotal / player.appearances).toFixed(1) : "—"} ort. rating</span>
      </div>
      ${canBid ? `<button id="make-offer" class="primary-button" type="button">${formatCurrency(Math.round(player.value * 1.08 / 50000) * 50000)} Teklif Gönder</button>` : ""}
      ${!state.transferWindow && !isOwnPlayer ? '<p class="muted" style="font-size:12px;text-align:center">Transfer dönemi kapalı.</p>' : ""}
    </div>
  `;

  document.querySelector("#close-player").addEventListener("click", () => playerDialog.close());
  document.querySelector("#make-offer")?.addEventListener("click", () => makeOffer(player));
  playerDialog.showModal();
}

function makeOffer(player) {
  const buyingClub = getSelectedClub();
  const sellingClub = getClub(player.clubId);
  const offer = Math.round((player.value * 1.08) / 50000) * 50000;

  if (buyingClub.budget < offer) {
    showToast("Kulüp bütçesi bu teklif için yetersiz.");
    return;
  }

  const accepted = offer >= player.value * (0.98 + Math.random() * 0.18);
  if (!accepted) {
    showToast(`${sellingClub.shortName} teklifi reddetti.`);
    playerDialog.close();
    return;
  }

  buyingClub.budget -= offer;
  sellingClub.budget += offer;
  player.clubId = buyingClub.id;
  state.notifications.unshift({ title: `${player.name} kadroya katıldı`, meta: formatCurrency(offer) });
  state.notifications = state.notifications.slice(0, 3);
  saveGameState(state);
  updateHud();
  playerDialog.close();
  renderTransfer();
  showToast(`${player.name} transfer edildi.`);
}

function getSelectedClub() {
  return getClub(state.selectedClubId);
}

function getClub(clubId) {
  return state.clubs.find((club) => club.id === clubId);
}

function getLeague(leagueId) {
  return state.leagues.find((league) => league.id === leagueId);
}

function getCurrentUserFixture() {
  return state.fixtures.find(
    (fixture) => fixture.week === state.currentWeek
      && fixture.leagueId === getSelectedClub().leagueId
      && [fixture.homeClubId, fixture.awayClubId].includes(state.selectedClubId),
  );
}

function getSeasonTotalWeeks() {
  const leagueId = getSelectedClub().leagueId;
  const weeks = state.fixtures.filter((fixture) => fixture.leagueId === leagueId).map((fixture) => fixture.week);
  return weeks.length ? Math.max(...weeks) : 0;
}

function getSortedStandings(leagueId) {
  const clubIds = new Set(state.clubs.filter((club) => club.leagueId === leagueId).map((club) => club.id));
  return state.standings.filter((row) => clubIds.has(row.clubId)).sort((a, b) => {
    const pointDifference = b.points - a.points;
    const goalDifference = (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    return pointDifference || goalDifference || b.goalsFor - a.goalsFor || a.seedOrder - b.seedOrder;
  });
}

function getClubRank(clubId) {
  const club = getClub(clubId);
  return getSortedStandings(club.leagueId).findIndex((row) => row.clubId === clubId) + 1;
}

function clubBadge(club) {
  return `<span class="club-badge" style="--club-color:${club.color};--club-secondary:${club.secondary}" aria-hidden="true">${club.shortName}</span>`;
}

function formChip(result) {
  const label = result === "W" ? "G" : result === "D" ? "B" : "M";
  const className = result === "W" ? "win" : result === "L" ? "loss" : "";
  return `<span class="form-chip ${className}" title="${label}">${label}</span>`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value).replace(" ", "");
}

function formatGoalDifference(value) {
  return value > 0 ? `+${value}` : String(value);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}
