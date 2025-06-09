# Klipzz

Dieses Repository enthält das Frontend-Design im Ordner `src` und ein Node.js-Backend im Ordner `server`.

## Installation

1. Repository klonen und ins Projektverzeichnis wechseln:
   ```bash
   git clone <REPO-URL>
   cd Klipzz
   ```
2. Umgebungsvariablen konfigurieren:
   ```bash
   cp .env.example .env
   ```
   Bearbeite die `.env`-Datei und passe die API-URL an deine Bedürfnisse an.

3. Abhängigkeiten installieren. Node.js sowie `ffmpeg` und `yt-dlp` müssen auf dem System vorhanden sein.
   ```bash
   npm install
   ```

## Umgebungsvariablen

Die Anwendung verwendet folgende Umgebungsvariablen:

- `VITE_API_BASE`: Die Basis-URL für das Backend-API (Standard: `http://localhost:3301`)

## Frontend starten

Im Entwicklungsmodus startet ihr die Oberfläche mit Vite:
```bash
npm run dev
```
Nach dem Build kann das fertige Frontend aus dem Ordner `dist` statisch
serviert werden, z.B. so:
```bash
npm run build
npx serve -s dist -l 3300
```
Danach `http://localhost:3300` im Browser öffnen.


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
   Der Backend-Server läuft standardmäßig auf Port **3301**.

Der Server speichert hochgeladene Videos sowie via URL importierte Inhalte in `server/uploads` und generiert Vorschaubilder in `server/thumbnails`. Die Metadaten werden in einer SQLite-Datenbank `videos.db` verwaltet.
