const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8765;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// --- 中间件 ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// --- Multer 文件上传 ---
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- 工具函数：读写JSON ---
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  } catch { return file.includes('submissions') ? [] : {}; }
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// 简单的Token验证
const ADMIN_PASSWORD = 'admin123';
let adminToken = null;

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== adminToken) return res.status(401).json({ error: '未授权' });
  next();
}

// =================== API 路由 ===================

// --- 登录 ---
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    adminToken = crypto.randomBytes(16).toString('hex');
    return res.json({ token: adminToken, message: '登录成功' });
  }
  res.status(401).json({ error: '密码错误' });
});

// --- SEO: 获取所有页面SEO配置 ---
app.get('/api/seo', requireAuth, (req, res) => {
  const pages = readJSON('pages.json');
  res.json(pages.seo || []);
});

// --- SEO: 更新SEO配置 ---
app.put('/api/seo', requireAuth, (req, res) => {
  const pages = readJSON('pages.json');
  pages.seo = req.body;
  writeJSON('pages.json', pages);
  res.json({ message: 'SEO已更新' });
});

// --- 内容: 获取所有内容区块 ---
app.get('/api/content', requireAuth, (req, res) => {
  const pages = readJSON('pages.json');
  res.json({
    hero: pages.hero || {},
    products: pages.products || [],
    advantages: pages.advantages || [],
    faq: pages.faq || [],
    testimonials: pages.testimonials || []
  });
});

// --- 内容: 更新内容区块 ---
app.put('/api/content/:section', requireAuth, (req, res) => {
  const pages = readJSON('pages.json');
  const { section } = req.params;
  if (!['hero', 'products', 'advantages', 'faq', 'testimonials'].includes(section)) {
    return res.status(400).json({ error: '无效的内容区块' });
  }
  pages[section] = req.body;
  writeJSON('pages.json', pages);
  res.json({ message: '内容已更新' });
});

// --- 文章: 获取列表 ---
app.get('/api/articles', requireAuth, (req, res) => {
  const articles = readJSON('articles.json');
  res.json(articles);
});

// --- 文章: 获取单篇 ---
app.get('/api/articles/:id', requireAuth, (req, res) => {
  const articles = readJSON('articles.json');
  const article = articles.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: '文章不存在' });
  res.json(article);
});

// --- 文章: 创建 ---
app.post('/api/articles', requireAuth, (req, res) => {
  const articles = readJSON('articles.json');
  const maxId = articles.reduce((max, a) => Math.max(max, a.id || 0), 0);
  const article = { id: maxId + 1, ...req.body, date: new Date().toISOString().split('T')[0] };
  articles.push(article);
  writeJSON('articles.json', articles);
  res.json(article);
});

// --- 文章: 更新 ---
app.put('/api/articles/:id', requireAuth, (req, res) => {
  const articles = readJSON('articles.json');
  const idx = articles.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: '文章不存在' });
  articles[idx] = { ...articles[idx], ...req.body, id: parseInt(req.params.id) };
  writeJSON('articles.json', articles);
  res.json(articles[idx]);
});

// --- 文章: 删除 ---
app.delete('/api/articles/:id', requireAuth, (req, res) => {
  let articles = readJSON('articles.json');
  articles = articles.filter(a => a.id !== parseInt(req.params.id));
  writeJSON('articles.json', articles);
  res.json({ message: '已删除' });
});

// --- 表单提交: 前端提交 ---
app.post('/api/submit', (req, res) => {
  const { name, phone, vehicle_type, source } = req.body;
  if (!name || !phone) return res.status(400).json({ error: '请填写完整信息' });
  const submissions = readJSON('submissions.json');
  submissions.unshift({
    id: Date.now(),
    name, phone,
    vehicle_type: vehicle_type || '未选择',
    source: source || '网站',
    time: new Date().toLocaleString('zh-CN'),
    status: '待跟进'
  });
  writeJSON('submissions.json', submissions);
  res.json({ message: '提交成功' });
});

// --- 表单提交: 后台查看 ---
app.get('/api/submissions', requireAuth, (req, res) => {
  const submissions = readJSON('submissions.json');
  res.json(submissions);
});

// --- 表单提交: 更新状态 ---
app.put('/api/submissions/:id', requireAuth, (req, res) => {
  const submissions = readJSON('submissions.json');
  const idx = submissions.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: '记录不存在' });
  submissions[idx].status = req.body.status || submissions[idx].status;
  writeJSON('submissions.json', submissions);
  res.json(submissions[idx]);
});

// --- 埋点统计 ---
app.get('/api/stats', requireAuth, (req, res) => {
  const submissions = readJSON('submissions.json');
  const total = submissions.length;
  const today = submissions.filter(s =>
    s.time?.startsWith(new Date().toLocaleDateString('zh-CN'))
  ).length;
  res.json({
    total_submissions: total,
    today_submissions: today,
    pending: submissions.filter(s => s.status === '待跟进').length,
    completed: submissions.filter(s => s.status !== '待跟进').length
  });
});

// --- 文件上传 ---
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请选择文件' });
  res.json({ url: '/uploads/' + req.file.filename, filename: req.file.filename });
});

// --- 获取公开内容（无需认证，用于动态渲染首页）---
app.get('/api/public/content', (req, res) => {
  const pages = readJSON('pages.json');
  const articles = readJSON('articles.json');
  res.json({
    hero: pages.hero || {},
    products: pages.products || [],
    advantages: pages.advantages || [],
    faq: pages.faq || [],
    testimonials: pages.testimonials || [],
    articles: articles.filter(a => a.published !== false).slice(0, 10)
  });
});

// --- 管理后台页面路由 ---
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// --- 启动 ---
app.listen(PORT, '0.0.0.0', () => {
  console.log('============================================');
  console.log('  小萌极速融 官网 v3 已启动');
  console.log('  主站: http://localhost:' + PORT);
  console.log('  后台: http://localhost:' + PORT + '/admin');
  console.log('  后台默认密码: admin123');
  console.log('============================================');
});
