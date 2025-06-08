# Upload-Konfiguration für große Dateien

## Problem
Cloudflare hat ein Upload-Limit von 100MB für kostenlose Accounts. Dies verhindert das Hochladen großer Videodateien.

## Lösung
Wir verwenden eine separate Upload-Subdomain, die Cloudflare umgeht und direkt auf den Server zeigt.

## DNS-Konfiguration

### 1. Neue A-Record erstellen
Erstellen Sie einen neuen A-Record in Ihrer DNS-Konfiguration:

```
Name: upload.klipz.staubile.de
Type: A
Value: [IHRE_SERVER_IP]
TTL: 300 (oder Standard)
Proxy: DEAKTIVIERT (wichtig!)
```

**WICHTIG:** Der Proxy-Status muss auf "DNS only" (grauer Cloud-Icon) gesetzt werden, nicht auf "Proxied" (oranges Cloud-Icon).

### 2. Nginx-Konfiguration für Upload-Subdomain

Erstellen Sie eine neue Nginx-Konfiguration:

```bash
sudo nano /etc/nginx/sites-available/upload.klipz.staubile.de
```

Inhalt:
```nginx
server {
    server_name upload.klipz.staubile.de;

    # Große Uploads erlauben
    client_max_body_size 10G;
    client_body_timeout 600s;
    client_body_buffer_size 128k;

    # Nur API-Endpunkte (keine Frontend-Dateien)
    location /api/ {
        proxy_pass              http://127.0.0.1:3301;
        proxy_http_version      1.1;
        proxy_set_header        Upgrade $http_upgrade;
        proxy_set_header        Connection 'upgrade';
        proxy_set_header        Host $host;
        proxy_cache_bypass      $http_upgrade;
        
        # Upload-optimierte Proxy-Einstellungen
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

    # Alle anderen Anfragen ablehnen
    location / {
        return 404;
    }

    listen 80;
}
```

### 3. Nginx-Konfiguration aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/upload.klipz.staubile.de /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL-Zertifikat erstellen

```bash
sudo certbot --nginx -d upload.klipz.staubile.de
```

### 5. Frontend neu builden

```bash
npm run build
```

## Funktionsweise

1. **Kleine Dateien (≤100MB)**: Werden über die normale API (`https://klipz.staubile.de/api/upload`) hochgeladen
2. **Große Dateien (>100MB)**: Werden über die Upload-API (`https://upload.klipz.staubile.de/api/upload`) hochgeladen

Das Frontend erkennt automatisch die Dateigröße und wählt die entsprechende URL.

## Testen

Nach der Konfiguration können Sie testen:

```bash
# Test mit kleiner Datei (sollte über Cloudflare gehen)
curl -X POST -F "video=@small_video.mp4" https://klipz.staubile.de/api/upload

# Test mit großer Datei (sollte direkt gehen)
curl -X POST -F "video=@large_video.mp4" https://upload.klipz.staubile.de/api/upload
```

## Sicherheitshinweise

- Die Upload-Subdomain sollte nur API-Endpunkte bereitstellen, keine statischen Dateien
- CORS ist konfiguriert, um nur Anfragen von der Haupt-Domain zu erlauben
- SSL/TLS ist weiterhin aktiv für sichere Übertragungen