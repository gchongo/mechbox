#!/usr/bin/env bash
# MechBox VPS 部署脚本（在 VPS 上执行，或通过 SSH 远程执行）
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/var/www/mechbox}"
REPO_URL="${REPO_URL:-https://github.com/gchongo/mechbox.git}"
BUILD_DIR="${BUILD_DIR:-/tmp/mechbox-build}"

echo "==> MechBox deploy -> ${DEPLOY_DIR}"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js not found. Install Node 20+ first."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm not found."
  exit 1
fi

rm -rf "${BUILD_DIR}"
git clone --depth 1 "${REPO_URL}" "${BUILD_DIR}"
cd "${BUILD_DIR}"

npm ci
npm run build

sudo mkdir -p "${DEPLOY_DIR}"
sudo rsync -a --delete dist/ "${DEPLOY_DIR}/"
sudo chown -R www-data:www-data "${DEPLOY_DIR}"

rm -rf "${BUILD_DIR}"

echo "==> Deploy complete. Site files updated at ${DEPLOY_DIR}"
