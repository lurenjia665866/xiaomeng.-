require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');
const app = express();
const PORT = parseInt(process.env.PORT) || 8765;
const HOST = process.env.HOST || '0.0.0.0';

// ===================== 中间件 =====================

// 安全头
app.use(helmet({ contentSecurityPolicy: false }));

// CORS
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// 请求日志
app.use(morgan(process.env.LOG_LEVEL || 'dev'));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use(express.static(path.join(__dirname, 'public')));

// 全局限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use('/api', limiter);

// ===================== API 路由 =====================

// 所有 API 路由集中挂载
app.use('/api/auth', require('./routes/auth'));
app.use('/api/submit', require('./routes/submit'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/content', require('./routes/content'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/upload', require('./routes/upload'));

// === 兼容 v3 前端 main.js 的公开内容接口 ===
const { PageContent, Article } = require('./models');
app.get('/api/public/content', async (req, res) => {
  try {
    const contents = await PageContent.findAll({
      where: { is_active: true },
      order: [['page', 'ASC'], ['sort_order', 'ASC']]
    });
    const merged = { hero: {}, products: [], advantages: [], faq: [], testimonials: [] };
    const seen = {};
    for (const c of contents) {
      const key = c.section;
      if (seen[key] && c.page !== 'index') continue;
      seen[key] = true;
      if (['products', 'advantages', 'faq', 'testimonials'].includes(key) && Array.isArray(c.content)) {
        merged[key] = c.content;
      } else if (key === 'hero') {
        merged.hero = c.content || {};
        if (!merged.hero.cta_text) merged.hero.cta_text = '免费评估车辆额度';
      }
    }
    const articles = await Article.findAll({ where: { published: true }, order: [['publish_date', 'DESC']], limit: 10 });
    res.json({ ...merged, articles });
  } catch (err) {
    console.error('[Public Content] Error:', err);
    res.json({ hero: {}, products: [], advantages: [], faq: [], testimonials: [], articles: [] });
  }
});

// === 健康检查 ===
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '4.0.0' });
});

// === 管理后台 SPA 路由（admin 下的路径都返回 admin/index.html）===
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// ===================== 错误处理 =====================
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误'
  });
});

// ===================== 启动服务 =====================
async function start() {
  try {
    // 同步数据库（开发环境自动建表，生产环境建议用 migrations）
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('[DB] 数据库同步完成');

    app.listen(PORT, HOST, () => {
      console.log('============================================');
      console.log('  小萌极速融 统一后端 v4.0.0');
    console.log('  地址:    http://' + HOST + ':' + PORT);
      console.log('  主站:    http://localhost:' + PORT);
      console.log('  后台:    http://localhost:' + PORT + '/admin');
      console.log('  API:     http://localhost:' + PORT + '/api/health');
      console.log('  数据库:  ' + (process.env.DB_DIALECT || 'sqlite'));
      console.log('============================================');
    });
  } catch (err) {
    console.error('[FATAL] 启动失败:', err);
    process.exit(1);
  }
}

start();
