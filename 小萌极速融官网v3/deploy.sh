#!/bin/bash
# ==============================================
# 小萌极速融 — 一键部署脚本
# 适用: CentOS 7+ / Ubuntu 20+ / Debian 10+
# ==============================================

set -e

APP_DIR="/var/www/xiaomeng-jisu"
DOMAIN="${1:-xiaomengjisu.com}"
PORT=8765

echo "================================================"
echo "  小萌极速融 部署脚本"
echo "  域名: $DOMAIN"
echo "  端口: $PORT"
echo "================================================"

# 1. 安装 Node.js (如未安装)
if ! command -v node &> /dev/null; then
  echo "[1/6] 安装 Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs || yum install -y nodejs
fi

# 2. 安装 PM2 (如未安装)
if ! command -v pm2 &> /dev/null; then
  echo "[2/6] 安装 PM2..."
  npm install -g pm2
fi

# 3. 创建目录
echo "[3/6] 创建应用目录..."
mkdir -p $APP_DIR/{logs,data,uploads,node_modules}

# 4. 复制文件（从当前目录）
echo "[4/6] 复制项目文件..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.md' ./ $APP_DIR/

# 5. 安装依赖
echo "[5/6] 安装 npm 依赖..."
cd $APP_DIR
npm install --production

# 6. 启动服务
echo "[6/6] 启动 PM2 服务..."
pm2 delete xiaomeng-jisu 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "================================================"
echo "  ✅ 部署完成！"
echo "  访问地址: http://localhost:$PORT"
echo "  后台地址: http://localhost:$PORT/admin"
echo "  后台密码: admin123"
echo ""
echo "  Nginx 反向代理配置建议:"
echo "  ┌─────────────────────────────────────────┐"
echo "  │ server {                                 │"
echo "  │   listen 80;                              │"
echo "  │   server_name $DOMAIN;                    │"
echo "  │   location / {                            │"
echo "  │     proxy_pass http://127.0.0.1:$PORT;    │"
echo "  │     proxy_set_header Host \$host;           │"
echo "  │     proxy_set_header X-Real-IP \$remote_addr;│"
echo "  │   }                                       │"
echo "  │ }                                         │"
echo "  └─────────────────────────────────────────┘"
echo "================================================"
