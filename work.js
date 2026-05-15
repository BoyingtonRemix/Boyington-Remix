
const tracks = [
  {
    id: "track-1",
    title: "Truly (Remix Emotional)",
    artist: "Boyington Remix",
    duration: "04:12",
    genre: "Emotional Mix",
    release: "Featured release",
    file: "Truly-Remix-Emotional.mp3"
  },
  {
    id: "track-2",
    title: "Chasing Paradise (Original Mix)",
    artist: "Boyington Remix",
    duration: "03:58",
    genre: "Original Mix",
    release: "New entry",
    file: "Chasing-Paradise-Original-Mix.mp3"
  },
  {
    id: "track-3",
    title: "Only My Love (Funk Original Mix)",
    artist: "Boyington Remix",
    duration: "04:25",
    genre: "Funk Original Mix",
    release: "Latest groove",
    file: "Only-My-Love-Funk-Original-Mix.mp3"
  },
  {
    id: "track-4",
    title: "À Travers Ton Regard (Original Mix)",
    artist: "Boyington Remix",
    duration: "04:18",
    genre: "Original Mix",
    release: "Signature mood",
    file: "A-Travers-Ton-Regard-Original-Mix.mp3"
  }
];

const releases = [
  {
    title: "Dernières sorties",
    meta: "Section prête pour tes nouveaux uploads. Remplace les liens audio et les pochettes si besoin.",
    link: "#playlist"
  },
  {
    title: "Format mobile-first",
    meta: "Disposition compacte, lisible et adaptée au téléphone comme au desktop.",
    link: "#player"
  },
  {
    title: "Stats locales",
    meta: "Lectures, likes et dislikes sont mémorisés en localStorage sur le navigateur.",
    link: "#playlist"
  }
];

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

let currentIndex = 0;
let state = loadState();

function loadState() {
  try {
    return JSON.parse(localStorage.getItem("boyington-player-state")) || {};
  } catch {
    return {};
  }
}

function saveState() {
  localStorage.setItem("boyington-player-state", JSON.stringify(state));
}

function getTrackState(id) {
  if (!state[id]) state[id] = { plays: 0, likes: 0, dislikes: 0, userLike: 0 };
  return state[id];
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

function formatTrackMeta(track) {
  return `${track.artist} • ${track.genre} • ${track.duration}`;
}

function updateNowPlaying(track) {
  nowTitle.textContent = track.title;
  nowMeta.textContent = formatTrackMeta(track);
  featuredTitle.textContent = track.title;
  featuredMeta.textContent = track.release;
}

function playTrack(index, autoplay = true) {
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
  render();
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
  render();
}

function renderTracks() {
  trackList.innerHTML = tracks.map((track, index) => {
    const s = getTrackState(track.id);
    const likeClass = s.userLike === 1 ? "active-like" : "";
    const dislikeClass = s.userLike === -1 ? "active-dislike" : "";
    return `
      <article class="track-item">
        <div class="track-index">${String(index + 1).padStart(2, "0")}</div>
        <div class="track-main">
          <div class="track-title">${track.title}</div>
          <div class="track-meta">${formatTrackMeta(track)} • ${s.plays || 0} lectures</div>
        </div>
        <div class="track-controls">
          <button class="icon-btn" data-play="${index}">Play</button>
          <button class="icon-btn ${likeClass}" data-like="${track.id}">👍 ${s.likes || 0}</button>
          <button class="icon-btn ${dislikeClass}" data-dislike="${track.id}">👎 ${s.dislikes || 0}</button>
          <span class="count-pill">${track.release}</span>
        </div>
      </article>
    `;
  }).join("");

  trackList.querySelectorAll("[data-play]").forEach(btn => {
    btn.addEventListener("click", () => playTrack(Number(btn.dataset.play)));
  });

  trackList.querySelectorAll("[data-like]").forEach(btn => {
    btn.addEventListener("click", () => toggleLike(btn.dataset.like, 1));
  });

  trackList.querySelectorAll("[data-dislike]").forEach(btn => {
    btn.addEventListener("click", () => toggleLike(btn.dataset.dislike, -1));
  });
}

function renderReleases() {
  releaseGrid.innerHTML = releases.map(item => `
    <article class="release-card">
      <div class="release-title">${item.title}</div>
      <div class="release-meta">${item.meta}</div>
      <a class="release-link" href="${item.link}">Ouvrir</a>
    </article>
  `).join("");
}

function render() {
  renderTracks();
  renderReleases();
  setTotals();
}

document.getElementById("prevBtn").addEventListener("click", () => playTrack(currentIndex - 1));
document.getElementById("nextBtn").addEventListener("click", () => playTrack(currentIndex + 1));
document.getElementById("playPauseBtn").addEventListener("click", () => {
  if (!audio.src) {
    playTrack(currentIndex);
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});

audio.addEventListener("ended", () => playTrack(currentIndex + 1));
audio.addEventListener("play", () => {
  const track = tracks[currentIndex];
  if (track) {
    nowTitle.textContent = track.title;
    nowMeta.textContent = formatTrackMeta(track);
  }
});

if (tracks.length > 0) {
  const first = tracks[0];
  updateNowPlaying(first);
  audio.src = first.file;
}

render();
