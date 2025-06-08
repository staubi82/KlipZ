# Schnelle Lösung für Upload-Problem

## Sofortiger Workaround (ohne DNS-Änderungen)

Bis die Upload-Subdomain konfiguriert ist, können Sie diese temporäre Lösung verwenden:

### 1. Temporäre Konfiguration für direkte Server-IP

Bearbeiten Sie die `.env.production` Datei:

```bash
# Produktions-Konfiguration für Klipz

# Standard API Base (über Cloudflare)
VITE_API_BASE=https://klipz.staubile.de

# Upload Base (direkte Server-IP, umgeht Cloudflare)
# Ersetzen Sie [IHRE_SERVER_IP] mit der tatsächlichen IP
VITE_UPLOAD_BASE=https://[IHRE_SERVER_IP]:3301
```

### 2. SSL-Zertifikat für Server-IP (falls nötig)

Wenn Sie HTTPS verwenden möchten, erstellen Sie ein selbstsigniertes Zertifikat:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/server-ip.key \
  -out /etc/ssl/certs/server-ip.crt \
  -subj "/C=DE/ST=State/L=City/O=Organization/CN=[IHRE_SERVER_IP]"
```

### 3. Nginx-Konfiguration für direkte IP

Fügen Sie zu `/etc/nginx/sites-available/klipz.staubile.de` hinzu:

```nginx
# Zusätzlicher Server-Block für direkte IP-Uploads
server {
    listen 3301 ssl;
    server_name [IHRE_SERVER_IP];

    ssl_certificate /etc/ssl/certs/server-ip.crt;
    ssl_certificate_key /etc/ssl/private/server-ip.key;

    # Große Uploads erlauben
    client_max_body_size 10G;
    client_body_timeout 600s;

    location /api/ {
        proxy_pass http://127.0.0.1:3301;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;

        # CORS für Cross-Origin-Uploads
        add_header 'Access-Control-Allow-Origin' 'https://klipz.staubile.de' always;
        add_header 'Access-Control-Allow-Methods' 'POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
```

### 4. Alternative: HTTP-Only für Tests

Für schnelle Tests können Sie auch HTTP verwenden:

```bash
# In .env.production
VITE_UPLOAD_BASE=http://[IHRE_SERVER_IP]:3301
```

Nginx-Konfiguration:
```nginx
server {
    listen 3302;
    server_name [IHRE_SERVER_IP];

    client_max_body_size 10G;
    client_body_timeout 600s;

    location /api/ {
        proxy_pass http://127.0.0.1:3301;
        # ... rest der Konfiguration
    }
}
```

## Testen der Lösung

1. **Frontend neu builden:**
   ```bash
   npm run build
   ```

2. **Nginx neu laden:**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Test mit großer Datei:**
   - Wählen Sie eine Datei >100MB aus
   - Schauen Sie in die Browser-Konsole für Log-Meldungen
   - Der Upload sollte jetzt funktionieren

## Wichtige Hinweise

- Dies ist eine temporäre Lösung
- Browser könnten Sicherheitswarnungen bei selbstsignierten Zertifikaten anzeigen
- Die dauerhafte Lösung ist die Upload-Subdomain aus `UPLOAD_SETUP.md`
- Stellen Sie sicher, dass Port 3301/3302 in der Firewall geöffnet ist

## Firewall-Konfiguration

```bash
# Port für direkten Upload öffnen
sudo ufw allow 3301
sudo ufw allow 3302