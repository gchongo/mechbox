#!/usr/bin/env bash
# MechBox VPS 首次初始化（Ubuntu/Debian）
# 用法: curl 下载后在 VPS 上以 root 或 sudo 执行
set -euo pipefail

DOMAIN="${DOMAIN:-mechbox.cax.do}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/mechbox}"

echo "==> Installing packages..."
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git rsync curl

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

echo "==> Creating deploy directory..."
sudo mkdir -p "${DEPLOY_DIR}"
sudo chown -R "${USER}:${USER}" "${DEPLOY_DIR}"

echo "==> Nginx: copy deploy/nginx/mechbox.conf to /etc/nginx/sites-available/mechbox"
echo "    Then: sudo ln -sf /etc/nginx/sites-available/mechbox /etc/nginx/sites-enabled/"
echo "    Remove default if needed: sudo rm -f /etc/nginx/sites-enabled/default"

echo "==> DNS: add A record  ${DOMAIN}  ->  YOUR_VPS_IP"

echo "==> After first deploy, run SSL:"
echo "    sudo certbot --nginx -d ${DOMAIN}"

echo "==> Done. Next: deploy dist/ to ${DEPLOY_DIR} and reload nginx."
