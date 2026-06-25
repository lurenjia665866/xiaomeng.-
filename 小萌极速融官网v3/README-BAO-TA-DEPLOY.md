# 小萌极速融 — 宝塔面板部署指南

## 前提
- 宝塔面板已安装，能正常访问
- 域名已备案并解析到服务器IP
- 服务器已安装 Node.js（宝塔软件商店安装，版本≥18）

---

## 第一步：上传项目文件

1. 登录宝塔面板
2. 进入 **文件** → 在 `/www/wwwroot/` 下创建文件夹 `xiaomengjisu.com`
3. 把本地 `小萌极速融官网v3/` 文件夹内 **所有文件** 上传到这个目录
   - 包括：`server.js`、`package.json`、`public/`、`admin/`、`data/`、`node_modules/`
   - 如果本地的 `node_modules/` 文件太多，也可以只上传其他文件，到服务器上再安装依赖

> ⚠️ 上传前把 `data/submissions.json` 清空：
> ```json
> []
> ```

---

## 第二步：安装依赖（如果本地没上传node_modules）

宝塔面板 → **文件** → 进入项目目录 → 右侧 **终端**

```bash
cd /www/wwwroot/xiaomengjisu.com
npm install
```

---

## 第三步：创建网站（Node项目）

宝塔面板 → **网站** → **Node项目** → **添加Node项目**

| 设置项 | 填写内容 |
|--------|----------|
| 项目名称 | `小萌极速融` |
| 监听端口 | `8765` |
| 项目路径 | `/www/wwwroot/xiaomengjisu.com/` |
| 启动文件 | `server.js` |
| 项目管理 | 默认即可 |

创建成功后，宝塔会自动启动 Node 进程。

---

## 第四步：绑定域名 + SSL

1. 在 **Node项目列表** 中，点项目右侧 **设置**
2. 进入 **域名管理** → 添加你的域名（如 `www.xiaomengjisu.com`）
3. 进入 **SSL** → **Let's Encrypt** → 申请免费 SSL 证书
4. 宝塔会自动配置 Nginx 反向代理，不需要手动配

---

## 第五步：配置网站设置

在 Node项目 **设置** → **反向代理**，确认配置为：

```
代理路径: /
目标URL: http://127.0.0.1:8765
```

---

## 第六步：验证上线

| 页面 | 地址 |
|------|------|
| 主站 | `https://www.xiaomengjisu.com/` |
| 管理后台 | `https://www.xiaomengjisu.com/admin` |
| 后台密码 | `admin123` |

打开主站，右键查看源代码，确认 `<head>` 内有以下标签：
- `og:title` / `og:description` / `og:image`
- `twitter:card`
- `canonical`
- JSON-LD 结构化数据

---

## 常见问题

**Q: 502 Bad Gateway**
A: Node项目没启动成功。检查 项目设置 → 启动文件 是否为 `server.js`，端口是否为 `8765`

**Q: 后台登录报错 "网络错误"**
A: Nginx 反代没配置好。在 Node项目 **设置** → **反向代理** 确认目标URL正确

**Q: 修改了前端文件不生效**
A: 宝塔面板 → **网站** → **Node项目** → 点 **重启**

**Q: 上传文件后权限不足**
A: 在宝塔终端执行：
```bash
chown -R www:www /www/wwwroot/xiaomengjisu.com
chmod -R 755 /www/wwwroot/xiaomengjisu.com
```

---

## 管理维护命令（宝塔终端执行）

```bash
# 查看运行状态
pm2 list

# 查看日志
pm2 logs xiaomeng-jisu

# 重启
pm2 restart xiaomeng-jisu

# 停止
pm2 stop xiaomeng-jisu
```
