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
rsync -a --delete dist/ "${DEPLOY_DIR}/"
chown -R www:www "${DEPLOY_DIR}" 2>/dev/null || chown -R www-data:www-data "${DEPLOY_DIR}"

# aaPanel Nginx 重载
if [ -x /etc/init.d/nginx ]; then
  /etc/init.d/nginx reload
elif command -v bt >/dev/null 2>&1; then
  bt reload
fi

rm -rf "${BUILD_DIR}"
echo "==> Done. Open https://mechbox.cax.do"
