
(() => {
  const stateKey = "boyington-player-state-v5";
  const installBtn = document.getElementById("installBtn");
  const audio = document.getElementById("audioPlayer");
  const brandLogo = document.getElementById("brandLogo");
  const trackList = document.getElementById("trackList");
  const releaseGrid = document.getElementById("releaseGrid");
  const filtersEl = document.getElementById("filters");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const nowTitle = document.getElementById("nowTitle");
  const nowInfo = document.getElementById("nowInfo");
  const featuredTitle = document.getElementById("featuredTitle");
  const featuredMeta = document.getElementById("featuredMeta");
  const nowArt = document.getElementById("nowArt");
  const heroCover = document.getElementById("heroCover");
  const totalTracks = document.getElementById("totalTracks");
  const totalPlays = document.getElementById("totalPlays");
  const totalLikes = document.getElementById("totalLikes");
  const currentTime = document.getElementById("currentTime");
  const totalTime = document.getElementById("totalTime");
  const seekBar = document.getElementById("seekBar");
  const volumeBar = document.getElementById("volumeBar");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const repeatBtn = document.getElementById("repeatBtn");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");

  const imageCandidates = ["boyington-official-logo.png", "cover principal.jpg", "studio-boyington a virer.png"];
  const releaseLabels = ["Featured release", "New entry", "Latest groove", "Signature mood", "Fresh upload", "Automatic update"];

  let deferredInstallPrompt = null;
  let tracks = [];
  let filteredTracks = [];
  let activeFilter = "all";
  let currentIndex = 0;
  let repeatMode = false;
  let isShuffled = false;
  let state = loadState();
  let artworkPool = [];

  function loadState() { try { return JSON.parse(localStorage.getItem(stateKey)) || {}; } catch { return {}; } }
  function saveState() { localStorage.setItem(stateKey, JSON.stringify(state)); }
  function getTrackState(id) { if (!state[id]) state[id] = { plays:0, likes:0, dislikes:0, userLike:0, duration:"" }; return state[id]; }
  function normalizeTitleFromFilename(filename) { const base = filename.replace(/\.[^.]+$/, ""); return base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase()); }
  function inferGenre(title) { const t = title.toLowerCase(); if (t.includes("melodic")) return "Melodic Techno"; if (t.includes("tech house")) return "Tech House"; if (t.includes("deep")) return "Deep House"; if (t.includes("trance")) return "Trance"; if (t.includes("techno")) return "Melodic Techno"; if (t.includes("house")) return "House"; if (t.includes("funk")) return "Funk Mix"; if (t.includes("emotional")) return "Emotional Mix"; if (t.includes("eurodance")) return "Eurodance"; if (t.includes("remix")) return "Remix"; return "Original Mix"; }
  function inferMood(title) { const t = title.toLowerCase(); if (t.includes("night") || t.includes("midnight")) return "Night Drive"; if (t.includes("love") || t.includes("heart")) return "Emotion"; if (t.includes("viva") || t.includes("vivo")) return "Latin Energy"; if (t.includes("shadow")) return "Cinematic"; if (t.includes("gold")) return "Luxury Groove"; return "Premium Cut"; }
  function inferBpm(title) { const t = title.toLowerCase(); if (t.includes("trance")) return "138 BPM"; if (t.includes("techno")) return "126 BPM"; if (t.includes("melodic")) return "124 BPM"; if (t.includes("house")) return "123 BPM"; if (t.includes("deep")) return "122 BPM"; if (t.includes("funk")) return "118 BPM"; return "124 BPM"; }
  function formatDuration(seconds) { if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"; const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60).toString().padStart(2, "0"); return `${mins}:${secs}`; }
  function escapeHtml(str) { return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
  function encodePath(path) { return encodeURI(path.replace(/^\.\/+/, "").replace(/^\/+/, "")); }
  function toDataSvg(label) { const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#111116"/><stop offset="100%" stop-color="#1d1d27"/></linearGradient><radialGradient id="r" cx="50%" cy="35%" r="55%"><stop offset="0%" stop-color="#f4d78c" stop-opacity=".9"/><stop offset="30%" stop-color="#d8b15a" stop-opacity=".28"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="600" height="600" rx="42" fill="url(#g)"/><circle cx="300" cy="240" r="170" fill="url(#r)"/><rect x="64" y="64" width="88" height="88" rx="22" fill="#d8b15a"/><text x="108" y="120" text-anchor="middle" font-size="54" font-family="Arial, Helvetica, sans-serif" font-weight="800" fill="#111116">B</text><text x="80" y="520" font-size="26" font-family="Arial, Helvetica, sans-serif" font-weight="700" fill="#f5f1e8">${label}</text></svg>`; return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`; }
  function repoInfoFromLocation() { const host = location.hostname; const pathParts = location.pathname.split("/").filter(Boolean); if (!host.endsWith("github.io")) return { owner:"", repo:"" }; const owner = host.replace(/\.github\.io$/i, ""); const repo = pathParts.length > 0 ? pathParts[0] : owner; return { owner, repo }; }
  async function fetchJson(url) { const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error(`${url} -> ${response.status}`); return response.json(); }
  async function probeImage(path) { const src = encodeURI(path); return new Promise((resolve) => { const img = new Image(); img.onload = () => resolve(src); img.onerror = () => resolve(null); img.src = src; }); }
  async function resolveArtworkPool() { const resolved = []; for (const candidate of imageCandidates) { const ok = await probeImage(candidate); if (ok) resolved.push(ok); } if (!resolved.length) resolved.push(toDataSvg("BOYINGTON REMIX")); while (resolved.length < 3) resolved.push(resolved[0]); return resolved; }
  async function discoverTracks() {
    const { owner, repo } = repoInfoFromLocation();
    if (!owner || !repo) return [];
    const treeUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`;
    const data = await fetchJson(treeUrl);
    const entries = Array.isArray(data.tree) ? data.tree : [];
    return entries.filter((entry) => entry.type === "blob" && /\.mp3$/i.test(entry.path)).map((entry, index) => {
      const filename = entry.path.split("/").pop() || entry.path;
      const title = normalizeTitleFromFilename(filename);
      const art = artworkPool[index % artworkPool.length] || toDataSvg(title);
      return { id:`track-${index + 1}-${entry.path}`, title, artist:"Boyington Remix", genre:inferGenre(title), mood:inferMood(title), bpm:inferBpm(title), file:encodePath(entry.path), path:entry.path, thumb:art, release:releaseLabels[index % releaseLabels.length] };
    }).sort((a, b) => a.title.localeCompare(b.title, "fr"));
  }
  function getTrackStats(track) { return getTrackState(track.id); }
  function buildFilters(list) {
    const genres = Array.from(new Set(list.map((t) => t.genre))).sort((a, b) => a.localeCompare(b, "fr"));
    const buttons = [`<button class="filter-chip active" data-filter="all" type="button">TOUS</button>`, ...genres.map((genre) => `<button class="filter-chip" data-filter="${escapeHtml(genre)}" type="button">${escapeHtml(genre)}</button>`)];
    filtersEl.innerHTML = buttons.join("");
    filtersEl.querySelectorAll("[data-filter]").forEach((btn) => btn.addEventListener("click", () => { activeFilter = btn.dataset.filter || "all"; filtersEl.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active")); btn.classList.add("active"); renderPlaylist(); renderReleases(); }));
  }
  function applySearchSort(list) {
    const q = searchInput.value.trim().toLowerCase();
    let out = [...list];
    if (activeFilter !== "all") out = out.filter((track) => track.genre === activeFilter);
    if (q) out = out.filter((track) => `${track.title} ${track.artist} ${track.genre} ${track.mood} ${track.bpm}`.toLowerCase().includes(q));
    const sort = sortSelect.value;
    if (sort === "za") out.sort((a, b) => b.title.localeCompare(a.title, "fr"));
    else if (sort === "popular") out.sort((a, b) => (getTrackStats(b).plays || 0) - (getTrackStats(a).plays || 0));
    else out.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    return out;
  }
  function setTotals() {
    totalTracks.textContent = String(tracks.length);
    const totals = tracks.reduce((acc, track) => { const s = getTrackStats(track); acc.plays += s.plays || 0; acc.likes += s.likes || 0; return acc; }, { plays:0, likes:0 });
    totalPlays.textContent = String(totals.plays);
    totalLikes.textContent = String(totals.likes);
  }
  function updateNowPlaying(track) {
    if (!track) return;
    const currentArt = track.thumb || artworkPool[0] || toDataSvg("BOYINGTON REMIX");
    nowTitle.textContent = track.title;
    nowInfo.textContent = `${track.artist} · ${track.genre} · ${track.mood} · ${track.bpm}`;
    featuredTitle.textContent = track.title;
    featuredMeta.textContent = `${track.genre} · ${track.bpm}`;
    nowArt.src = currentArt;
    heroCover.src = currentArt;
  }
  function markActiveTrack() { trackList.querySelectorAll(".track-item").forEach((row, index) => row.classList.toggle("active", index === currentIndex)); }
  function updatePlayButton() { playPauseBtn.textContent = audio.paused ? "⏯" : "⏸"; }
  function setAudioSource(track, autoplay = true) {
    if (!track) return;
    audio.src = track.file;
    updateNowPlaying(track);
    const s = getTrackStats(track);
    s.plays = (s.plays || 0) + 1;
    saveState();
    renderCounters();
    renderPlaylist();
    if (autoplay) audio.play().catch(() => {});
  }
  function playTrack(index, autoplay = true) { if (!filteredTracks.length) return; currentIndex = (index + filteredTracks.length) % filteredTracks.length; setAudioSource(filteredTracks[currentIndex], autoplay); markActiveTrack(); }
  function nextTrack() { if (!filteredTracks.length) return; if (isShuffled && filteredTracks.length > 1) { currentIndex = Math.floor(Math.random() * filteredTracks.length); setAudioSource(filteredTracks[currentIndex], true); markActiveTrack(); return; } playTrack(currentIndex + 1, true); }
  function prevTrack() { if (!filteredTracks.length) return; playTrack(currentIndex - 1, true); }
  function toggleLike(trackId, value) {
    const s = getTrackState(trackId);
    if (value === 1) {
      if (s.userLike === 1) { s.likes = Math.max(0, (s.likes || 0) - 1); s.userLike = 0; }
      else { if (s.userLike === -1) s.dislikes = Math.max(0, (s.dislikes || 0) - 1); s.likes = (s.likes || 0) + 1; s.userLike = 1; }
    } else {
      if (s.userLike === -1) { s.dislikes = Math.max(0, (s.dislikes || 0) - 1); s.userLike = 0; }
      else { if (s.userLike === 1) s.likes = Math.max(0, (s.likes || 0) - 1); s.dislikes = (s.dislikes || 0) + 1; s.userLike = -1; }
    }
    saveState(); renderCounters(); renderPlaylist(); renderReleases();
  }
  function renderCounters() { setTotals(); }
  function renderPlaylist() {
    filteredTracks = applySearchSort(tracks);
    if (!filteredTracks.length) {
      trackList.innerHTML = `<div class="track-item"><div class="track-index">--</div><div class="track-main"><div class="track-title">Aucun morceau détecté</div><div class="track-meta">Ajoute des fichiers .mp3 dans le dépôt GitHub.</div></div><div class="track-actions"><span class="badge">Playlist vide</span></div></div>`;
      markActiveTrack(); return;
    }
    trackList.innerHTML = filteredTracks.map((track, index) => {
      const s = getTrackStats(track);
      const active = index === currentIndex ? "active" : "";
      const likeClass = s.userLike === 1 ? "active" : "";
      const dislikeClass = s.userLike === -1 ? "active" : "";
      const duration = s.duration || "0:00";
      return `<article class="track-item ${active}" data-track-id="${escapeHtml(track.id)}"><div class="track-index">${String(index + 1).padStart(2, "0")}</div><img class="track-thumb" src="${escapeHtml(track.thumb)}" alt="" /><div class="track-main"><div class="track-title">${escapeHtml(track.title)}</div><div class="track-meta">${escapeHtml(track.artist)} · ${escapeHtml(track.genre)} · ${escapeHtml(track.bpm)} · ${escapeHtml(duration)} · ${s.plays || 0} lectures</div></div><div class="track-actions"><button class="small-btn" data-play="${index}" type="button">Play</button><button class="small-btn fav ${likeClass}" data-like="${escapeHtml(track.id)}" type="button">👍 ${s.likes || 0}</button><button class="small-btn dislike ${dislikeClass}" data-dislike="${escapeHtml(track.id)}" type="button">👎 ${s.dislikes || 0}</button><span class="badge">${escapeHtml(track.release)}</span></div></article>`;
    }).join("");
    trackList.querySelectorAll("[data-play]").forEach((btn) => btn.addEventListener("click", () => playTrack(Number(btn.dataset.play), true)));
    trackList.querySelectorAll("[data-like]").forEach((btn) => btn.addEventListener("click", () => toggleLike(btn.dataset.like, 1)));
    trackList.querySelectorAll("[data-dislike]").forEach((btn) => btn.addEventListener("click", () => toggleLike(btn.dataset.dislike, -1)));
    markActiveTrack();
  }
  function renderReleases() {
    const items = filteredTracks.slice(0, 6);
    releaseGrid.innerHTML = items.map((track, idx) => `<article class="release-card"><img class="release-cover" src="${escapeHtml(track.thumb)}" alt="" /><div class="release-num">${idx + 1}</div><div class="release-body"><div class="release-title">${escapeHtml(track.title)}</div><div class="release-genre">${escapeHtml(track.genre)} · ${escapeHtml(track.bpm)}</div><button class="release-btn" type="button" data-release-play="${idx}">ÉCOUTER</button></div></article>`).join("");
    releaseGrid.querySelectorAll("[data-release-play]").forEach((btn) => btn.addEventListener("click", () => { const idx = Number(btn.dataset.releasePlay); const track = filteredTracks[idx]; if (!track) return; const realIndex = filteredTracks.findIndex((t) => t.id === track.id); if (realIndex >= 0) playTrack(realIndex, true); }));
  }
  function refreshAll() { renderCounters(); buildFilters(tracks); renderPlaylist(); renderReleases(); if (filteredTracks[currentIndex]) updateNowPlaying(filteredTracks[currentIndex]); }

  audio.addEventListener("loadedmetadata", () => { const track = filteredTracks[currentIndex]; if (!track) return; const s = getTrackStats(track); s.duration = formatDuration(audio.duration); totalTime.textContent = formatDuration(audio.duration); saveState(); renderPlaylist(); });
  audio.addEventListener("timeupdate", () => { if (!Number.isFinite(audio.duration) || audio.duration <= 0) return; const pct = Math.max(0, Math.min(100, (audio.currentTime / audio.duration) * 100)); seekBar.value = String(pct); currentTime.textContent = formatDuration(audio.currentTime); });
  audio.addEventListener("play", updatePlayButton);
  audio.addEventListener("pause", updatePlayButton);
  audio.addEventListener("ended", () => { if (repeatMode) { audio.currentTime = 0; audio.play().catch(() => {}); return; } nextTrack(); });
  seekBar.addEventListener("input", () => { if (!Number.isFinite(audio.duration) || audio.duration <= 0) return; const pct = Number(seekBar.value) / 100; audio.currentTime = pct * audio.duration; });
  volumeBar.addEventListener("input", () => { audio.volume = Number(volumeBar.value); });
  searchInput.addEventListener("input", () => { renderPlaylist(); renderReleases(); });
  sortSelect.addEventListener("change", () => { renderPlaylist(); renderReleases(); });
  prevBtn.addEventListener("click", prevTrack);
  nextBtn.addEventListener("click", nextTrack);
  playPauseBtn.addEventListener("click", () => { if (!audio.src && filteredTracks.length) { playTrack(currentIndex, true); return; } if (audio.paused) audio.play().catch(() => {}); else audio.pause(); });
  shuffleBtn.addEventListener("click", () => { isShuffled = !isShuffled; shuffleBtn.classList.toggle("active", isShuffled); });
  repeatBtn.addEventListener("click", () => { repeatMode = !repeatMode; repeatBtn.classList.toggle("active", repeatMode); });
  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
  window.addEventListener("beforeinstallprompt", (event) => { event.preventDefault(); deferredInstallPrompt = event; if (installBtn) installBtn.hidden = false; });
  if (installBtn) installBtn.addEventListener("click", async () => { if (!deferredInstallPrompt) return; deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice.catch(() => null); deferredInstallPrompt = null; installBtn.hidden = true; });

  async function init() {
    audio.volume = Number(volumeBar.value || 0.9);
    currentTime.textContent = "0:00";
    totalTime.textContent = "0:00";
    brandLogo.onerror = () => { brandLogo.src = toDataSvg("B"); };
    try { artworkPool = await resolveArtworkPool(); tracks = await discoverTracks(); } catch (error) { console.error("Auto discovery failed:", error); tracks = []; artworkPool = [toDataSvg("BOYINGTON REMIX")]; }
    filteredTracks = [...tracks];
    refreshAll();
    if (tracks.length > 0) { currentIndex = 0; updateNowPlaying(filteredTracks[0]); audio.src = filteredTracks[0].file; saveState(); renderPlaylist(); renderReleases(); }
    else { const fallback = artworkPool[0] || toDataSvg("BOYINGTON REMIX"); nowArt.src = fallback; heroCover.src = fallback; nowTitle.textContent = "Aucun titre sélectionné"; nowInfo.textContent = "Ajoute des MP3 dans le dépôt GitHub."; featuredTitle.textContent = "Playlist automatique"; featuredMeta.textContent = "Ajoute un MP3 pour le voir apparaître."; currentTime.textContent = "0:00"; totalTime.textContent = "0:00"; }
  }
  init();
})();
