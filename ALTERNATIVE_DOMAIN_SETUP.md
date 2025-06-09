# ALTERNATIVE_DOMAIN_SETUP.md wurde ins GitHub Wiki verschoben und kann aus dem Repository entfernt werden.

## Übersicht

Da Sie eine alternative Domain verwenden, die nicht bei Cloudflare liegt, ist das Setup viel einfacher.

## Schritte

### 1. Domain-Konfiguration

Stellen Sie sicher, dass Ihre alternative Domain auf denselben Server zeigt:

```
A-Record: ihre-alternative-domain.de → [IHRE_SERVER_IP]
```

### 2. Nginx-Konfiguration

Erstellen Sie eine neue Nginx-Konfiguration für die alternative Domain:

```bash
sudo nano /etc/nginx/sites-available/ihre-alternative-domain.de
```

Inhalt:
```nginx
server {
    server_name ihre-alternative-domain.de;

    # Große Uploads erlauben
    client_max_body_size 10G;
    client_body_timeout 600s;
    client_body_buffer_size 128k;

    # Backend API
    location /api/ {
        proxy_pass              http://127.0.0.1:3301;
        proxy_http_version      1.1;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection 'upgrade';
        proxy_set_header        Host $host;
        proxy_cache_bypass      $http_upgrade;
        
        # Upload-optimierte Einstellungen
        proxy_buffering         off;
        proxy_request_buffering off;
        proxy_read_timeout      600s;
        proxy_send_timeout      600s;
        proxy_connect_timeout   60s;

        # CORS für Cross-Origin-Uploads
        add_header 'Access-Control-Allow-Origin' 'https://klipz.staubile.de' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Optional: Statische Dateien auch über alternative Domain bereitstellen
    location /uploads/ {
        alias /var/www/KlipZ/server/uploads/;
        access_log off;
        expires 30d;
    }

    location /thumbnails/ {
        alias /var/www/KlipZ/server/thumbnails/;
        access_log off;
        expires 30d;
    }

    # Alle anderen Anfragen ablehnen oder weiterleiten
    location / {
        return 301 https://klipz.staubile.de$request_uri;
    }

    listen 80;
}
```

### 3. Nginx-Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/ihre-alternative-domain.de /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL-Zertifikat erstellen

```bash
sudo certbot --nginx -d ihre-alternative-domain.de
```

### 5. .env.production anpassen

Bearbeiten Sie die `.env.production` Datei:

```bash
# Standard API Base (über Cloudflare)
VITE_API_BASE=https://klipz.staubile.de

# Upload Base (alternative Domain ohne Cloudflare)
VITE_UPLOAD_BASE=https://ihre-alternative-domain.de
```

### 6. Frontend neu builden

```bash
npm run build
```

## Funktionsweise

- **Kleine Dateien (≤100MB)**: Werden über `https://klipz.staubile.de/api/upload` hochgeladen
- **Große Dateien (>100MB)**: Werden über `https://ihre-alternative-domain.de/api/upload` hochgeladen

Das Frontend erkennt automatisch die Dateigröße und wählt die entsprechende URL.

## Testen

Nach der Konfiguration:

1. Öffnen Sie die Upload-Seite
2. Wählen Sie eine große Datei (>100MB)
3. In der Browser-Konsole sollten Sie sehen: "Große Datei erkannt - wird direkte Upload-URL verwenden"
4. Der Upload sollte über die alternative Domain erfolgen

## Vorteile dieser Lösung

- ✅ Keine Cloudflare-Limits
- ✅ Einfache Konfiguration
- ✅ Vollständige Kontrolle über Upload-Limits
- ✅ Bessere Performance für große Dateien
- ✅ Automatische Erkennung der Dateigröße im Frontend