
(() => {
  const stateKey = "boyington-player-state-v2";

  const audio = document.getElementById("audioPlayer");
  const trackList = document.getElementById("trackList");
  const releaseGrid = document.getElementById("releaseGrid");
  const nowTitle = document.getElementById("nowTitle");
  const nowMeta = document.getElementById("nowMeta");
  const featuredTitle = document.getElementById("featuredTitle");
  const featuredMeta = document.getElementById("featuredMeta");
  const totalTracks = document.getElementById("totalTracks");
  const totalPlays = document.getElementById("totalPlays");
  const totalLikes = document.getElementById("totalLikes");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const playPauseBtn = document.getElementById("playPauseBtn");

  let tracks = [];
  let currentIndex = 0;
  let state = loadState();

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(stateKey)) || {};
    } catch {
      return {};
    }
  }

  function saveState() {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  function getTrackState(id) {
    if (!state[id]) {
      state[id] = { plays: 0, likes: 0, dislikes: 0, userLike: 0 };
    }
    return state[id];
  }

  function formatTrackMeta(track) {
    const bits = [track.artist, track.genre, track.duration].filter(Boolean);
    return bits.join(" • ");
  }

  function updateNowPlaying(track) {
    if (!track) return;
    nowTitle.textContent = track.title;
    nowMeta.textContent = formatTrackMeta(track);
    featuredTitle.textContent = track.title;
    featuredMeta.textContent = track.release || "Playlist automatique";
  }

  function setTotals() {
    totalTracks.textContent = String(tracks.length);
    const totals = tracks.reduce((acc, t) => {
      const s = getTrackState(t.id);
      acc.plays += s.plays || 0;
      acc.likes += s.likes || 0;
      return acc;
    }, { plays: 0, likes: 0 });

    totalPlays.textContent = String(totals.plays);
    totalLikes.textContent = String(totals.likes);
  }

  function cleanTitleFromFilename(filename) {
    const base = filename.replace(/\.[^.]+$/, "");
    return base
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function inferGenre(title) {
    const t = title.toLowerCase();
    if (t.includes("emotional")) return "Emotional Mix";
    if (t.includes("funk")) return "Funk Mix";
    if (t.includes("remix")) return "Remix";
    return "Original Mix";
  }

  function inferReleaseLabel(index) {
    const labels = [
      "Featured release",
      "New entry",
      "Latest groove",
      "Signature mood",
      "Fresh upload",
      "Automatic update"
    ];
    return labels[index % labels.length];
  }

  function displayPath(path) {
    return path.replace(/^\.\/+/, "").replace(/^\/+/, "");
  }

  function audioUrlFromPath(path) {
    return encodeURI(displayPath(path));
  }

  function isMp3(filePath) {
    return /\.mp3$/i.test(filePath);
  }

  function isRepositoryPagesUrl() {
    return location.hostname.endsWith("github.io");
  }

  function deriveRepoInfo() {
    const host = location.hostname;
    const parts = location.pathname.split("/").filter(Boolean);

    if (host.endsWith("github.io")) {
      const owner = host.replace(/\.github\.io$/i, "");
      const repo = parts.length > 0 ? parts[0] : owner;
      const rootPrefix = parts.length > 0 ? `/${parts[0]}` : "";
      return { owner, repo, rootPrefix };
    }

    return { owner: "", repo: "", rootPrefix: "" };
  }

  async function fetchRepoTree(owner, repo) {
    const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`;
    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async function discoverTracks() {
    const { owner, repo } = deriveRepoInfo();

    if (!owner || !repo || !isRepositoryPagesUrl()) {
      return [];
    }

    const tree = await fetchRepoTree(owner, repo);
    const blobs = Array.isArray(tree.tree) ? tree.tree : [];

    return blobs
      .filter((entry) => entry.type === "blob" && isMp3(entry.path))
      .map((entry, index) => {
        const filename = entry.path.split("/").pop() || entry.path;
        const title = cleanTitleFromFilename(filename);
        return {
          id: `track-${index + 1}-${entry.path}`,
          title,
          artist: "Boyington Remix",
          duration: "",
          genre: inferGenre(title),
          release: inferReleaseLabel(index),
          path: entry.path,
          file: audioUrlFromPath(entry.path)
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title, "fr"));
  }

  function renderReleases() {
    const items = [
      {
        title: "Auto playlist",
        meta: "Le site lit directement les MP3 présents dans le dépôt GitHub.",
        link: "#playlist"
      },
      {
        title: "Aucune retouche",
        meta: "Ajoute simplement un nouveau MP3 à la racine, puis attends la mise à jour Pages.",
        link: "#player"
      },
      {
        title: "Stats locales",
        meta: "Lectures et votes sont conservés dans le navigateur.",
        link: "#playlist"
      }
    ];

    releaseGrid.innerHTML = items.map((item) => `
      <article class="release-card">
        <div class="release-title">${item.title}</div>
        <div class="release-meta">${item.meta}</div>
        <a class="release-link" href="${item.link}">Ouvrir</a>
      </article>
    `).join("");
  }

  function renderTracks() {
    if (!tracks.length) {
      trackList.innerHTML = `
        <article class="release-card">
          <div class="release-title">Aucun MP3 détecté</div>
          <div class="release-meta">Ajoute tes MP3 à la racine du dépôt GitHub. La playlist se générera automatiquement.</div>
        </article>
      `;
      setTotals();
      return;
    }

    trackList.innerHTML = tracks.map((track, index) => {
      const s = getTrackState(track.id);
      const likeClass = s.userLike === 1 ? "active-like" : "";
      const dislikeClass = s.userLike === -1 ? "active-dislike" : "";
      const meta = [
        track.artist,
        track.genre,
        track.duration,
        `${s.plays || 0} lectures`
      ].filter(Boolean).join(" • ");

      return `
        <article class="track-item">
          <div class="track-index">${String(index + 1).padStart(2, "0")}</div>
          <div class="track-main">
            <div class="track-title">${track.title}</div>
            <div class="track-meta">${meta}</div>
          </div>
          <div class="track-controls">
            <button class="icon-btn" data-play="${index}">Play</button>
            <button class="icon-btn ${likeClass}" data-like="${track.id}">👍 ${s.likes || 0}</button>
            <button class="icon-btn ${dislikeClass}" data-dislike="${track.id}">👎 ${s.dislikes || 0}</button>
            <span class="count-pill">${track.release || "Track"}</span>
          </div>
        </article>
      `;
    }).join("");

    trackList.querySelectorAll("[data-play]").forEach((btn) => {
      btn.addEventListener("click", () => playTrack(Number(btn.dataset.play)));
    });

    trackList.querySelectorAll("[data-like]").forEach((btn) => {
      btn.addEventListener("click", () => toggleLike(btn.dataset.like, 1));
    });

    trackList.querySelectorAll("[data-dislike]").forEach((btn) => {
      btn.addEventListener("click", () => toggleLike(btn.dataset.dislike, -1));
    });

    setTotals();
  }

  function renderAll() {
    renderTracks();
    renderReleases();
    if (tracks[currentIndex]) updateNowPlaying(tracks[currentIndex]);
  }

  function playTrack(index, autoplay = true) {
    if (!tracks.length) return;
    currentIndex = (index + tracks.length) % tracks.length;
    const track = tracks[currentIndex];
    updateNowPlaying(track);
    audio.src = track.file;
    if (autoplay) {
      audio.play().catch(() => {});
    }
    const s = getTrackState(track.id);
    s.plays += 1;
    saveState();
    renderTracks();
  }

  function toggleLike(trackId, value) {
    const s = getTrackState(trackId);

    if (value === 1) {
      if (s.userLike === 1) {
        s.likes = Math.max(0, s.likes - 1);
        s.userLike = 0;
      } else {
        if (s.userLike === -1) s.dislikes = Math.max(0, s.dislikes - 1);
        s.likes += 1;
        s.userLike = 1;
      }
    }

    if (value === -1) {
      if (s.userLike === -1) {
        s.dislikes = Math.max(0, s.dislikes - 1);
        s.userLike = 0;
      } else {
        if (s.userLike === 1) s.likes = Math.max(0, s.likes - 1);
        s.dislikes += 1;
        s.userLike = -1;
      }
    }

    saveState();
    renderTracks();
  }

  async function init() {
    renderReleases();
    setTotals();

    try {
      tracks = await discoverTracks();
    } catch (error) {
      console.error(error);
      tracks = [];
    }

    renderAll();

    if (tracks.length > 0) {
      currentIndex = 0;
      updateNowPlaying(tracks[0]);
      audio.src = tracks[0].file;
    } else {
      nowTitle.textContent = "Aucun titre sélectionné";
      nowMeta.textContent = "Ajoute des MP3 à la racine du dépôt GitHub.";
      featuredTitle.textContent = "Playlist automatique";
      featuredMeta.textContent = "Ajoute un MP3 pour le voir apparaître.";
    }
  }

  prevBtn.addEventListener("click", () => playTrack(currentIndex - 1));
  nextBtn.addEventListener("click", () => playTrack(currentIndex + 1));
  playPauseBtn.addEventListener("click", () => {
    if (!audio.src) {
      playTrack(currentIndex);
      return;
    }
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  audio.addEventListener("ended", () => {
    playTrack(currentIndex + 1);
  });

  audio.addEventListener("play", () => {
    if (tracks[currentIndex]) {
      updateNowPlaying(tracks[currentIndex]);
    }
  });

  init();
})();
