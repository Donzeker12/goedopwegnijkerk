#!/bin/bash
set -e

# =============================================================
# Deploy script - Goed op Weg Nijkerk
# Gebruik: bash deploy.sh
# =============================================================

APP_DIR="/var/www/goedopwegnijkerk"
PHP="php8.4"
COMPOSER="composer"

echo "===> Deployment gestart: $(date)"

cd "$APP_DIR"

# 1. Maintenance mode aan
echo "---> Maintenance mode aan"
$PHP artisan down --retry=60

# 2. Pull laatste code
echo "---> Code ophalen van GitHub"
git pull origin main

# 3. Composer dependencies
echo "---> Composer dependencies installeren"
$COMPOSER install --no-dev --optimize-autoloader --no-interaction

# 4. Frontend dependencies + build
echo "---> Frontend bouwen"
npm ci --prefer-offline
npm run build

# 5. Migraties uitvoeren
echo "---> Database migraties"
$PHP artisan migrate --force

# 6. Cache leegmaken en opnieuw opbouwen
echo "---> Cache refreshen"
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache
$PHP artisan event:cache

# 7. Storage symlink (indien nog niet aanwezig)
$PHP artisan storage:link --force 2>/dev/null || true

# 8. Rechten instellen
echo "---> Bestandsrechten instellen"
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 9. Maintenance mode uit
echo "---> Maintenance mode uit"
$PHP artisan up

echo "===> Deployment klaar: $(date)"
