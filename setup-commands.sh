#!/bin/bash

# Setup-Kommandos für alternative Domain
# Ersetzen Sie [IHRE-ALTERNATIVE-DOMAIN] mit Ihrer tatsächlichen Domain

DOMAIN="[IHRE-ALTERNATIVE-DOMAIN]"

echo "Setting up alternative domain: $DOMAIN"

# 1. Nginx-Konfiguration erstellen (ersetzen Sie [IHRE-ALTERNATIVE-DOMAIN] in der Datei)
sudo cp nginx-alternative-domain.conf /etc/nginx/sites-available/$DOMAIN
sudo sed -i "s/\[IHRE-ALTERNATIVE-DOMAIN\]/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN

# 2. Site aktivieren
sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# 3. Nginx-Konfiguration testen
sudo nginx -t

# 4. Nginx neu laden
sudo systemctl reload nginx

# 5. SSL-Zertifikat erstellen
sudo certbot --nginx -d $DOMAIN

# 6. .env.production aktualisieren
echo "Updating .env.production..."
sed -i "s|https://ihre-alternative-domain.de|https://$DOMAIN|g" .env.production

# 7. Frontend neu builden
npm run build

echo "Setup complete!"
echo "Your alternative domain $DOMAIN is now configured for large file uploads."
echo "Files >100MB will automatically use this domain to bypass Cloudflare limits."