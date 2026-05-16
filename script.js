/* =========================================================
   🔥 AJOUTER ICI LES FUTURS LIENS SOUNDCLOUD 🔥
   ========================================================= */
const tracks = [
  // Exemple à décommenter et remplacer par ton lien SoundCloud :
  // { title: "Broken Illusions", url: "https://soundcloud.com/ton-compte/ton-track" },
];
/* =========================================================
   🔥 FIN ZONE AJOUT TRACKS SOUNDCLOUD 🔥
   ========================================================= */

const features = [
  { icon: "⚡", title: "Rapide", text: "Site léger et optimisé pour GitHub Pages." },
  { icon: "🎧", title: "Automatique", text: "Les nouveaux liens SoundCloud s’affichent sans refaire la structure." },
  { icon: "📱", title: "Responsive", text: "Lecture agréable sur smartphone, tablette et desktop." },
  { icon: "🔥", title: "Premium", text: "Ambiance sombre, élégante et compatible avec les visuels du projet." },
];

function renderManifesto() {
  const manifesto = document.querySelector("#manifestoSection");
  if (!manifesto) return;

  manifesto.innerHTML = `
    <section class="manifesto-wrapper">
      <div class="manifesto-image">
        <img src="boyington-studio.jpg" alt="Boyington Remix Studio">
      </div>

      <div class="manifesto-content">
        <h1>🎧 𝐁𝐨𝐲𝐢𝐧𝐠𝐭𝐨𝐧 𝐑𝐞𝐦𝐢𝐱 🎧</h1>
        <h2>✨ 𝐀 𝐒𝐭𝐨𝐫𝐲 𝐁𝐨𝐫𝐧 𝐅𝐫𝐨𝐦 𝐏𝐚𝐬𝐬𝐢𝐨𝐧</h2>

        <p><strong>𝐁𝐨𝐲𝐢𝐧𝐠𝐭𝐨𝐧 𝐑𝐞𝐦𝐢𝐱</strong> was not born from strategy or a desire for fame.
        It is a project born from pure passion — the kind that wakes you up in the middle of the night searching for the right sound 🎹, the perfect drop 🔥, the right emotion ❤️.</p>

        <h3>🎶 𝐒𝐢𝐧𝐜𝐞𝐫𝐞 𝐌𝐮𝐬𝐢𝐜</h3>
        <p>Here, every sound is genuine. Every Remix or Original Mix tells something real 🌌.
        Because music only has meaning when it is shared 🤝🎵.</p>

        <p class="manifesto-highlight">✅ Just authentic music, created with soul and shared without limits ✨</p>

        <h3>🌙 𝐀 𝐃𝐢𝐟𝐟𝐞𝐫𝐞𝐧𝐭 𝐕𝐢𝐬𝐢𝐨𝐧</h3>
        <p>Boyington Remix was born differently — in the silence of a passionate creator 🎧,
        guided by one single belief:</p>

        <blockquote>💭 𝐌𝐮𝐬𝐢𝐜 𝐬𝐡𝐨𝐮𝐥𝐝 𝐭𝐨𝐮𝐜𝐡 𝐩𝐞𝐨𝐩𝐥𝐞 𝐛𝐞𝐟𝐨𝐫𝐞 𝐢𝐭 𝐭𝐫𝐢𝐞𝐬 𝐭𝐨 𝐩𝐥𝐞𝐚𝐬𝐞.</blockquote>

        <h3>❤️ 𝐄𝐯𝐞𝐫𝐲 𝐑𝐞𝐦𝐢𝐱 𝐈𝐬 𝐀 𝐉𝐨𝐮𝐫𝐧𝐞𝐲</h3>
        <ul class="manifesto-list">
          <li>🎵 Every track is a confession</li>
          <li>🌍 Every remix is a journey</li>
          <li>🔥 Nothing here is calculated. Everything is felt.</li>
        </ul>

        <p>Just one man, his sounds, and the sincere desire to share something beautiful ✨</p>

        <div class="manifesto-footer">
          <h2>👑 𝐁𝐨𝐲𝐢𝐧𝐠𝐭𝐨𝐧 𝐑𝐞𝐦𝐢𝐱</h2>
          <p>🎼 𝐁𝐨𝐫𝐧 𝐅𝐫𝐨𝐦 𝐏𝐚𝐬𝐬𝐢𝐨𝐧 𝐀𝐧𝐝 𝐒𝐡𝐚𝐫𝐢𝐧𝐠 🎼</p>
        </div>
      </div>
    </section>
  `;
}

function renderFeatures() {
  const container = document.querySelector("#featuresGrid");
  if (!container) return;
  container.innerHTML = features.map(feature => `
    <article class="feature-card">
      <div class="feature-icon">${feature.icon}</div>
      <h3>${feature.title}</h3>
      <p>${feature.text}</p>
    </article>
  `).join("");
}

function renderPlaylist() {
  const container = document.querySelector("#playlistGrid");
  if (!container) return;

  if (!tracks.length) {
    container.innerHTML = `
      <div class="empty-state">
        Ajoute un lien SoundCloud dans le bloc <strong>tracks</strong> pour afficher le player ici.
      </div>
    `;
    return;
  }

  container.innerHTML = tracks.map(track => `
    <div class="track-card">
      <h4>${track.title}</h4>
      <iframe
        title="${track.title}"
        height="166"
        scrolling="no"
        allow="autoplay"
        src="https://w.soundcloud.com/player/?url=${encodeURIComponent(track.url)}&color=%23d4a43a&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=false">
      </iframe>
    </div>
  `).join("");
}

function removeSocialAccess() {
  document.querySelectorAll(".social-share, .social-icons, .share-buttons, .social-links, [data-social]").forEach(el => el.remove());
}

document.addEventListener("DOMContentLoaded", () => {
  renderManifesto();
  renderFeatures();
  renderPlaylist();
  removeSocialAccess();
});
