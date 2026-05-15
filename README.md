# Boyington Remix — pack complet

Fichiers à déposer à la racine du dépôt GitHub :
- `index.html`
- `styles.css`
- `work.js`
- `manifest.json`

Dossier d’assets :
- `assets/favicon.svg`
- `assets/cover.svg`

## Fonctionnement
Le `work.js` lit automatiquement tous les fichiers `.mp3` présents dans le dépôt GitHub via l’API GitHub et construit la playlist.

## Déploiement
1. Dépose tous les fichiers dans le dépôt.
2. Garde les MP3 dans le dépôt.
3. Vérifie que GitHub Pages pointe bien sur la branche principale et le dossier racine.
4. Recharge la page du site.

## Important
Le titre des morceaux est généré à partir du nom du fichier.
Exemple : `Truly-Remix-Emotional.mp3` devient `Truly Remix Emotional`.
