# REGISTRATION_CONFIG.md wurde ins GitHub Wiki verschoben und kann aus dem Repository entfernt werden.

Diese Anleitung erklärt, wie Sie Neuregistrierungen in Klipz deaktivieren können, sodass nur noch Login möglich ist.

## Konfiguration

### Frontend-Konfiguration

Die Registrierung wird über die Environment-Variable `VITE_ENABLE_REGISTRATION` gesteuert:

- `true` (Standard): Registrierung ist aktiviert
- `false`: Registrierung ist deaktiviert

### Environment-Dateien anpassen

#### Entwicklungsumgebung (.env)
```bash
# Registrierung aktivieren/deaktivieren (true = aktiviert, false = deaktiviert)
VITE_ENABLE_REGISTRATION=false
```

#### Produktionsumgebung (.env.production)
```bash
# Registrierung aktivieren/deaktivieren (true = aktiviert, false = deaktiviert)
VITE_ENABLE_REGISTRATION=false
```

### Backend-Konfiguration

Das Backend prüft die Environment-Variable `ENABLE_REGISTRATION`:

```bash
# Für das Backend (server/.env oder als Systemvariable)
ENABLE_REGISTRATION=false
```

## Was passiert bei deaktivierter Registrierung?

### Frontend-Änderungen:
1. **Registrierungsseite**: Automatische Weiterleitung zur Login-Seite
2. **Login-Seite**: Registrierungslink wird ausgeblendet
3. **Navigation**: Registrierungsbuttons werden ausgeblendet (Desktop & Mobile)

### Backend-Änderungen:
1. **API-Endpoint**: `/api/auth/register` gibt Fehler 403 zurück
2. **Fehlermeldung**: "Registrierung ist derzeit deaktiviert. Nur Login ist möglich."

## Anwendung der Konfiguration

### Entwicklungsumgebung
1. Bearbeiten Sie die `.env` Datei
2. Setzen Sie `VITE_ENABLE_REGISTRATION=false`
3. Starten Sie Frontend und Backend neu

### Produktionsumgebung
1. Bearbeiten Sie die `.env.production` Datei
2. Setzen Sie `VITE_ENABLE_REGISTRATION=false`
3. Setzen Sie die Backend-Variable `ENABLE_REGISTRATION=false`
4. Bauen Sie das Frontend neu: `npm run build`
5. Starten Sie Server neu

## Beispiel-Konfiguration

### Registrierung deaktiviert
```bash
# Frontend
VITE_ENABLE_REGISTRATION=false

# Backend
ENABLE_REGISTRATION=false
```

### Registrierung aktiviert (Standard)
```bash
# Frontend
VITE_ENABLE_REGISTRATION=true

# Backend
ENABLE_REGISTRATION=true
```

## Hinweise

- Die Konfiguration wirkt sich sofort nach einem Neustart aus
- Bestehende Benutzer können sich weiterhin anmelden
- Nur neue Registrierungen werden verhindert
- Die Konfiguration ist sowohl für Frontend als auch Backend erforderlich