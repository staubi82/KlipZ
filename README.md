# KlipZ

**KlipZ** ist eine moderne Video-Plattform, die es Benutzern ermöglicht, Videos hochzuladen, zu verwalten und zu teilen. Die Anwendung bietet eine intuitive Benutzeroberfläche mit erweiterten Video-Player-Funktionen und sozialen Features.

## Features

- 🎥 **Video-Upload & Management** - Hochladen und Verwalten von Videos mit automatischer Thumbnail-Generierung
- 📺 **Erweiterte Video-Wiedergabe** - Professioneller Video-Player mit Video.js
- 🔗 **URL-Import** - Importieren von Videos über URLs (unterstützt durch yt-dlp)
- ❤️ **Favoriten** - Markieren von Lieblingsvideos und Entdecken beliebter Inhalte
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
cd KlipZ

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

## Roadmap

### ✅ Bereits implementiert
- ✅ **Video-Upload** - Hochladen lokaler Videodateien
- ✅ **Video-Wiedergabe** - Professioneller Player mit Video.js
- ✅ **URL-Import** - Importieren von Videos über URLs
- ✅ **Video-Transkoding** - Automatische Konvertierung und Optimierung
- ✅ **Hell/Dunkel Modus** - Umschaltbare Themes
- ✅ **Favoriten** - Markieren und Verwalten von Lieblingsvideos
- ✅ **Benutzerprofile** - Authentifizierung und Profilverwaltung
- ✅ **Responsive Design** - Mobile und Desktop Optimierung
- ✅ **Download Button** - Videos herunterladen

### 🚧 In Entwicklung
- [ ] **Trending Videos** - Beliebte und häufig angesehene Inhalte
- [ ] **Neue Videos** - Chronologische Übersicht der neuesten Uploads
- [ ] **Wiedergabeverlauf** - Persönlicher Verlauf angesehener Videos
- [ ] **Empfehlungsalgorithmus** - KI-basierte Videovorschläge
- [ ] **Bewertungssystem** - Like/Dislike und Kommentarfunktion
- [ ] **Statistiken & Analytics** - Detaillierte Wiedergabe-Statistiken

### 💡 Geplante Features
- [ ] **Playlists** - Erstellen und Verwalten von Video-Sammlungen
- [ ] **Live-Streaming** - Echtzeit-Übertragungen
- [ ] **Video-Bearbeitung** - Grundlegende Schnitt- und Bearbeitungstools
- [ ] **Untertitel & Captions** - Automatische und manuelle Untertitel
- [ ] **Qualitätsauswahl** - Verschiedene Auflösungen (480p, 720p, 1080p, 4K)
- [ ] **Kapitel & Zeitstempel** - Navigation innerhalb langer Videos
- [ ] **Teilen & Einbetten** - Social Media Integration und Embed-Codes
- [ ] **Benachrichtigungen** - Push-Notifications für neue Inhalte
- [ ] **Suchfunktion** - Erweiterte Video- und Metadatensuche
- [ ] **Kategorien & Tags** - Organisierung nach Themen und Schlagwörtern
- [ ] **Mehrsprachigkeit** - Internationalisierung (i18n)
- [ ] **API & Webhooks** - Entwickler-API für Drittanbieter-Integration

## Lizenz

Dieses Projekt ist privat und nicht für die öffentliche Nutzung bestimmt.
