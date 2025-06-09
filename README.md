# Klipzz

**Klipzz** ist eine moderne Video-Plattform, die es Benutzern ermöglicht, Videos hochzuladen, zu verwalten und zu teilen. Die Anwendung bietet eine intuitive Benutzeroberfläche mit erweiterten Video-Player-Funktionen und sozialen Features.

## Features

- 🎥 **Video-Upload & Management** - Hochladen und Verwalten von Videos mit automatischer Thumbnail-Generierung
- 📺 **Erweiterte Video-Wiedergabe** - Professioneller Video-Player mit Video.js
- 🔗 **URL-Import** - Importieren von Videos über URLs (unterstützt durch yt-dlp)
- ❤️ **Favoriten & Trending** - Markieren von Lieblingsvideos und Entdecken beliebter Inhalte
- 🆕 **New Drops** - Übersicht über die neuesten hochgeladenen Videos
- 👤 **Benutzerprofile** - Personalisierte Profile und Authentifizierung
- 🌙 **Dark/Light Mode** - Umschaltbare Themes für optimale Benutzererfahrung
- 📱 **Responsive Design** - Optimiert für Desktop und mobile Geräte

## Technologie-Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Video-Processing**: FFmpeg + yt-dlp
- **State Management**: Zustand
- **Routing**: React Router
- **UI Components**: Lucide React Icons

## Installation & Konfiguration

Detaillierte Anleitungen zur Installation, Konfiguration und Bereitstellung findest du in unserem **[Wiki](../../wiki)**.

Das Wiki enthält:
- Schritt-für-Schritt Installationsanleitung
- Konfiguration der Umgebungsvariablen
- Server-Setup und Deployment
- Troubleshooting und FAQ

## Schnellstart

```bash
# Repository klonen
git clone <REPO-URL>
cd Klipzz

# Umgebungsvariablen konfigurieren
cp .env.example .env

# Abhängigkeiten installieren
npm install

# Frontend starten
npm run dev

# Backend starten (in separatem Terminal)
cd server
npm install
node index.js
```

## Lizenz

Dieses Projekt ist privat und nicht für die öffentliche Nutzung bestimmt.
