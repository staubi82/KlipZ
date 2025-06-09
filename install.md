# KlipZ - Installationsanleitung

Diese Anleitung beschreibt die Installation und Konfiguration der KlipZ-Anwendung von Grund auf.

## 1. System aktualisieren und Abhängigkeiten installieren

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nodejs npm ffmpeg python3 python3-pip
```

> Hinweis: `yt-dlp` wird für Video-Downloads benötigt. Installation mit pip:

```bash
pip3 install yt-dlp
```

## 2. Repository klonen

```bash
git clone https://github.com/staubi82/KlipZ.git
cd KlipZ
```

## 3. Frontend einrichten

- Umgebungsdatei kopieren und anpassen:

```bash
cp .env.example .env
```

- Öffnen Sie `.env` und passen Sie ggf. die API-URL an (Standard: `http://localhost:3301`).

- Abhängigkeiten installieren:

```bash
npm install
```

- (Optional) Frontend im Entwicklungsmodus starten:

```bash
npm run dev
```

## 4. Backend einrichten

- In das Backend-Verzeichnis wechseln:

```bash
cd server
```

- Abhängigkeiten installieren:

```bash
npm install
```

- Umgebungsvariable für JWT-Secret setzen (empfohlen):

```bash
# Im Terminal (nur für die aktuelle Sitzung)
export JWT_SECRET="ein-sicheres-geheimes-token"
```

> Hinweis: Diese Variable muss gesetzt sein, bevor Sie das Backend starten. Für eine dauerhafte Einstellung können Sie die Variable in Ihrer Shell-Konfigurationsdatei (z.B. ~/.bashrc oder ~/.zshrc) hinzufügen oder in einem Prozessmanager wie pm2 konfigurieren.
```
pm2 start index.js --name klipz-backend --env JWT_SECRET="ein-sicheres-geheimes-token"
```

- Backend starten:

```bash
npm start
```

Das Backend läuft standardmäßig auf Port 3301.

## 5. Alternative Domain (optional)

Wenn Sie eine alternative Domain für große Datei-Uploads verwenden möchten, führen Sie das Setup-Skript aus:

```bash
cd ..
./setup-commands.sh
```

Folgen Sie den Anweisungen und ersetzen Sie `[IHRE-ALTERNATIVE-DOMAIN]` durch Ihre Domain.

## 6. Hinweise

- Die SQLite-Datenbank wird automatisch im Backend-Verzeichnis als `videos.db` angelegt.
- Stellen Sie sicher, dass `ffmpeg` und `yt-dlp` korrekt installiert sind, da sie für Videoverarbeitung und Downloads benötigt werden.
- Für den produktiven Einsatz sollten Sie Umgebungsvariablen sicher setzen und das JWT-Secret geheim halten.

---

Diese Anleitung deckt die grundlegende Installation und Konfiguration ab. Für weitere Details siehe die Dokumentation im Repository.

## 7. Prozesse im Hintergrund mit pm2 starten (optional)

Um Backend und Frontend dauerhaft im Hintergrund laufen zu lassen, können Sie `pm2` verwenden.

### pm2 Installation

```bash
npm install -g pm2
```

### Backend mit pm2 starten

```bash
cd server
pm2 start index.js --name klipz-backend
```

### Frontend mit pm2 starten

```bash
cd ..
pm2 start npm --name klipz-frontend -- run dev
```

### Prozesse verwalten

- Liste der laufenden Prozesse anzeigen:

```bash
pm2 list
```

- Logs eines Prozesses anzeigen:

```bash
pm2 logs klipz-backend
pm2 logs klipz-frontend
```

- Prozesse stoppen:

```bash
pm2 stop klipz-backend
pm2 stop klipz-frontend
```

- Prozesse neustarten:

```bash
pm2 restart klipz-backend
pm2 restart klipz-frontend
```