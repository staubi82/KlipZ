# Klipzz

Dieses Repository enthält das Frontend-Design im Ordner `src` und ein einfaches Node.js-Backend im Ordner `server`.

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
