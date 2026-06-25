#!/bin/bash
# ==============================================
# 小萌极速融 — SSL/HTTPS 一键配置脚本
# 适用: CentOS 7+ / OpenCloudOS / RHEL 系
# ==============================================

set -e

DOMAIN="${1:-xiaomengjisu.com}"

echo "================================================"
echo "  小萌极速融 — SSL 证书配置"
echo "  域名: $DOMAIN"
echo "================================================"

# 1. 安装 EPEL 仓库
if ! rpm -q epel-release &>/dev/null; then
  echo "[1/4] 安装 EPEL 仓库..."
  dnf install -y epel-release || yum install -y epel-release
else
  echo "[1/4] EPEL 仓库已安装，跳过"
fi

# 2. 安装 certbot 和 nginx 插件
echo "[2/4] 安装 certbot + python3-certbot-nginx..."
dnf install -y certbot python3-certbot-nginx || yum install -y certbot python3-certbot-nginx

# 3. 检查 Nginx 配置
echo "[3/4] 检查 Nginx 配置..."
nginx -t

# 4. 申请 SSL 证书
echo "[4/4] 申请 Let's Encrypt SSL 证书..."
echo ""
echo "  ⚠️  请确认域名 $DOMAIN 已解析到本服务器 IP"
echo "     当前服务器 IP: $(curl -s ifconfig.me 2>/dev/null || echo '未知')"
echo ""
echo "  按回车继续，或 Ctrl+C 取消..."
read -r

certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" || {
  echo ""
  echo "  ❌ 证书申请失败，常见原因："
  echo "     1. 域名还没有解析到本服务器"
  echo "     2. 80 端口被防火墙拦截（已确认开放）"
  echo "     3. 域名写错了"
  echo ""
  echo "  等域名解析生效后手动运行："
  echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN"
  exit 1
}

# 5. 验证
echo ""
echo "================================================"
echo "  ✅ SSL 配置完成！"
echo "  访问地址:"
echo "  https://$DOMAIN/"
echo "  https://www.$DOMAIN/"
echo "================================================"

# 6. 显示自动续期状态
echo ""
echo "  Let's Encrypt 证书 90 天有效，自动续期已内置"
echo "  检查续期是否正常: certbot renew --dry-run"
