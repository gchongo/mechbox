#!/usr/bin/env bash
# MechBox — aaPanel 环境部署脚本
# 默认网站目录：/www/wwwroot/mechbox.cax.do
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/www/wwwroot/mechbox.cax.do}"
REPO_URL="${REPO_URL:-https://github.com/gchongo/mechbox.git}"
BUILD_DIR="${BUILD_DIR:-/tmp/mechbox-build}"

echo "==> MechBox deploy (aaPanel) -> ${DEPLOY_DIR}"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js not found."
  echo "请在 aaPanel → 软件商店 → 安装 Node.js 版本管理器，或执行 deploy/aapanel/setup-node.sh"
  exit 1
fi

rm -rf "${BUILD_DIR}"
git clone --depth 1 "${REPO_URL}" "${BUILD_DIR}"
cd "${BUILD_DIR}"

npm ci
npm run build

mkdir -p "${DEPLOY_DIR}"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete dist/ "${DEPLOY_DIR}/"
else
  # aaPanel 部分环境未预装 rsync
  find "${DEPLOY_DIR}" -mindepth 1 -maxdepth 1 ! -name '.user.ini' -exec rm -rf {} +
  cp -a dist/. "${DEPLOY_DIR}/"
fi

# .user.ini 由 aaPanel 锁定，跳过即可
find "${DEPLOY_DIR}" -mindepth 1 ! -name '.user.ini' -exec chown -R www:www {} + 2>/dev/null \
  || find "${DEPLOY_DIR}" -mindepth 1 ! -name '.user.ini' -exec chown -R www-data:www-data {} + 2>/dev/null \
  || true

# aaPanel Nginx 重载
if [ -x /etc/init.d/nginx ]; then
  /etc/init.d/nginx reload
elif command -v bt >/dev/null 2>&1; then
  bt reload
fi

rm -rf "${BUILD_DIR}"
echo "==> Done. Open https://mechbox.cax.do"
