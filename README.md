# Klipzz

Dieses Repository enthält das Frontend-Design im Ordner `src` und ein einfaches Node.js-Backend im Ordner `server`.

## Installation

1. Repository klonen und ins Projektverzeichnis wechseln:
   ```bash
   git clone <REPO-URL>
   cd Klipzz
   ```
2. Abhängigkeiten installieren. Node.js sowie `ffmpeg` und `yt-dlp` müssen auf dem System vorhanden sein.

## Frontend starten

Die Oberfläche kann mit einem beliebigen statischen Webserver aufgerufen werden, z.B. mit `npx serve`:
```bash
npx serve -s .
```
Anschließend `http://localhost:3000` (Standardport von `serve`) im Browser öffnen.


## Backend starten

1. Abhängigkeiten installieren:
   ```bash
   cd server
   npm install
   ```
2. Server starten:
   ```bash
   node index.js
   ```

Der Server speichert hochgeladene Videos sowie via URL importierte Inhalte in `server/uploads` und generiert Vorschaubilder in `server/thumbnails`. Die Metadaten werden in einer SQLite-Datenbank `videos.db` verwaltet.
