/* ============================================
   小萌极速融 — 统一管理后台 v2.0
   兼容 v4 后端 API
   ============================================ */
const API = window.location.origin;
let token = localStorage.getItem('admin_token') || '';
let currentSeoPage = 'home';
let editingArticleId = null;

// ===== 通用 =====
function authHeaders() { return { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }; }
function showMessage(msg, type) {
  type = type || 'success';
  const el = document.getElementById('messageBox');
  el.className = 'message message-' + type + ' show';
  el.textContent = msg;
  setTimeout(() => el.classList.remove('show'), 3000);
}

// ===== 登录 =====
function doLogin() {
  const pwd = document.getElementById('loginPwd').value;
  const err = document.getElementById('loginError');
  fetch(API + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) })
    .then(r => r.json()).then(d => {
      if (d.token) { token = d.token; localStorage.setItem('admin_token', token); showApp(); }
      else { err.style.display = 'block'; }
    }).catch(() => { err.textContent = '网络错误'; err.style.display = 'block'; });
}

function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('adminApp').style.display = 'block';
  loadDashboard(); loadSeo(); loadContent(); loadArticles(); loadLeads();
  document.getElementById('dashboardTime').textContent = '上次登录: ' + new Date().toLocaleString('zh-CN');
}

// ===== 侧边栏 =====
document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(a => {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelectorAll('.sidebar-nav a').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    const tab = this.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    const el = document.getElementById('tab-' + tab);
    if (el) el.classList.add('active');
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'seo') loadSeo();
    if (tab === 'articles') loadArticles();
    if (tab === 'submissions') loadLeads();
  });
});
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('admin_token'); token = '';
  document.getElementById('adminApp').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginPwd').value = '';
});
document.querySelectorAll('#contentTabs .tab').forEach(t => {
  t.addEventListener('click', function () {
    document.querySelectorAll('#contentTabs .tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('#content-hero,#content-products,#content-advantages,#content-faq,#content-testimonials').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    const el = document.getElementById('content-' + this.dataset.section);
    if (el) el.classList.add('active');
    loadContent(this.dataset.section);
  });
});

// ===== SEO 标签切换 =====
function switchSeo(page, data) {
  currentSeoPage = page; data = data || {};
  document.getElementById('seoTitle').value = data.title || '';
  document.getElementById('seoKeywords').value = data.keywords || '';
  document.getElementById('seoDescription').value = data.description || '';
  document.getElementById('seoOgTitle').value = data.og_title || '';
  document.getElementById('seoOgDesc').value = data.og_description || '';
  document.getElementById('seoCanonical').value = data.canonical_url || '';
  document.getElementById('seoTwitterTitle').value = data.twitter_title || '';
  document.getElementById('seoTwitterDesc').value = data.twitter_description || '';
  document.querySelectorAll('#seoTabs .tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector('#seoTabs .tab[data-page="' + page + '"]');
  if (tab) tab.classList.add('active');
}

// ===== 仪表盘 =====
function loadDashboard() {
  fetch(API + '/api/dashboard/stats', { headers: authHeaders() })
    .then(r => r.json()).then(d => {
      document.getElementById('statsRow').innerHTML = '<div class="stat-box"><div class="stat-box-num">' + (d.total || 0) + '</div><div class="stat-box-label">总线索</div></div><div class="stat-box"><div class="stat-box-num">' + (d.today || 0) + '</div><div class="stat-box-label">今日新增</div></div><div class="stat-box"><div class="stat-box-num">' + (d.pending || 0) + '</div><div class="stat-box-label">待跟进</div></div><div class="stat-box"><div class="stat-box-num">' + (d.completed || 0) + '</div><div class="stat-box-label">已处理</div></div>';
    }).catch(() => {});
  fetch(API + '/api/dashboard/recent', { headers: authHeaders() })
    .then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : (d.data || []);
      const tbody = document.getElementById('recentSubmissions');
      tbody.innerHTML = list.length ? list.slice(0, 10).map(s => {
        const st = s.status === 'pending' ? '待跟进' : s.status;
        return '<tr><td>' + (s.name || s.real_name || '-') + '</td><td>' + (s.phone || '-') + '</td><td>' + (s.vehicle_type || s.vehicle_status || '-') + '</td><td>' + (s.source || '-') + '</td><td>' + (s.created_at ? new Date(s.created_at).toLocaleString('zh-CN') : '-') + '</td><td><span class="badge ' + (s.status === 'pending' ? 'badge-pending' : 'badge-done') + '">' + st + '</span></td></tr>';
      }).join('') : '<tr><td colspan="6"><div class="empty">暂无线索</div></td></tr>';
    }).catch(() => {});
}

// ===== SEO =====
function loadSeo() {
  fetch(API + '/api/content', { headers: authHeaders() })
    .then(r => r.json()).then(d => {
      const pages = ['home', 'landing'];
      const pageLabels = { home: '主站', landing: '落地页' };
      const allSeo = {};
      for (const pg of pages) {
        allSeo[pg] = {};
        const seoBlock = d?.[pg === 'home' ? 'index' : pg]?.seo;
        if (seoBlock && seoBlock.content) allSeo[pg] = seoBlock.content;
      }
      window._seoData = allSeo;
      document.getElementById('seoTabs').innerHTML = pages.map(p => '<div class="tab' + (p === currentSeoPage ? ' active' : '') + '" data-page="' + p + '" onclick="switchSeo(\'' + p + '\', window._seoData[\'' + p + '\'])">' + (pageLabels[p] || p) + '</div>').join('');
      switchSeo(currentSeoPage, allSeo[currentSeoPage]);
    }).catch(() => {});
  document.getElementById('seoForm').onsubmit = function (e) {
    e.preventDefault();
    fetch(API + '/api/content', { headers: authHeaders() })
      .then(r => r.json()).then(d => {
        const pageKey = currentSeoPage === 'home' ? 'index' : currentSeoPage;
        const seoBlock = d?.[pageKey]?.seo;
        if (!seoBlock) { showMessage('未找到SEO配置', 'error'); return; }
        const content = {
          title: document.getElementById('seoTitle').value,
          keywords: document.getElementById('seoKeywords').value,
          description: document.getElementById('seoDescription').value,
          og_title: document.getElementById('seoOgTitle').value,
          og_description: document.getElementById('seoOgDesc').value,
          canonical_url: document.getElementById('seoCanonical').value,
          twitter_title: document.getElementById('seoTwitterTitle').value,
          twitter_description: document.getElementById('seoTwitterDesc').value
        };
        fetch(API + '/api/content/' + seoBlock.id, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ content }) })
          .then(r => r.json()).then(() => showMessage('SEO已保存')).catch(() => showMessage('保存失败', 'error'));
      }).catch(() => showMessage('获取数据失败', 'error'));
  };
}

// ===== 内容编辑 =====
let contentData = {};
function loadContent(section) {
  fetch(API + '/api/content', { headers: authHeaders() })
    .then(r => r.json()).then(d => {
      contentData = { hero: {}, products: [], advantages: [], faq: [], testimonials: [] };
      const page = d?.index || d?.home || {};
      for (const sec of ['hero', 'products', 'advantages', 'faq', 'testimonials']) {
        const block = page[sec];
        if (block) {
          contentData[sec] = block.content || block;
          contentData[sec + '_id'] = block.id;
        }
      }
      if (!section || section === 'hero') {
        document.getElementById('heroBadge').value = contentData.hero?.badge || '';
        document.getElementById('heroTitle').value = contentData.hero?.title || '';
        document.getElementById('heroSubtitle').value = contentData.hero?.subtitle || '';
        document.getElementById('heroCta').value = contentData.hero?.cta_text || '';
        document.getElementById('heroForm').onsubmit = function (e) {
          e.preventDefault();
          saveContent('hero', { badge: document.getElementById('heroBadge').value, title: document.getElementById('heroTitle').value, subtitle: document.getElementById('heroSubtitle').value, cta_text: document.getElementById('heroCta').value });
        };
      }
      if (!section || section === 'products') renderProducts(Array.isArray(contentData.products) ? contentData.products : []);
      if (!section || section === 'advantages') renderAdvantages(Array.isArray(contentData.advantages) ? contentData.advantages : []);
      if (!section || section === 'faq') renderFaq(Array.isArray(contentData.faq) ? contentData.faq : []);
      if (!section || section === 'testimonials') renderTestimonials(Array.isArray(contentData.testimonials) ? contentData.testimonials : []);
    }).catch(() => {});
}
function saveContent(section, data) {
  const id = contentData[section + '_id'];
  if (!id) { showMessage('请先加载内容', 'error'); return; }
  fetch(API + '/api/content/' + id, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ content: data }) })
    .then(r => r.json()).then(() => showMessage(section + '已保存')).catch(() => showMessage('保存失败', 'error'));
}

// ===== 产品编辑 =====
function renderProducts(products) {
  document.getElementById('productsEditor').innerHTML = products.map((p, i) =>
    '<div class="card"><h2>产品 ' + (i + 1) + ': ' + (p.name || '新产品') + '</h2><div class="form-row"><div class="form-group"><label>产品名称</label><input type="text" class="p-name" value="' + (p.name || '') + '"></div><div class="form-group"><label>标签</label><input type="text" class="p-tag" value="' + (p.tag || '') + '"></div></div><div class="form-row"><div class="form-group"><label>额度</label><input type="text" class="p-amount" value="' + (p.amount || '') + '"></div><div class="form-group"><label>CTA文字</label><input type="text" class="p-cta" value="' + (p.cta || '免费评估额度') + '"></div></div><div class="form-group"><label>描述</label><textarea class="p-desc" rows="2">' + (p.desc || '') + '</textarea></div><div class="form-actions"><button class="btn btn-danger btn-sm" onclick="if(confirm(\'确定删除？\'))deleteProduct(' + i + ')">删除</button><button class="btn btn-primary btn-sm" onclick="saveProduct(' + i + ')">保存</button></div></div>'
  ).join('');
}
function saveProduct(idx) {
  const cards = document.querySelectorAll('#productsEditor .card');
  const card = cards[idx]; if (!card) return;
  const products = [...(Array.isArray(contentData.products) ? contentData.products : [])];
  products[idx] = { name: card.querySelector('.p-name')?.value || '', tag: card.querySelector('.p-tag')?.value || '', amount: card.querySelector('.p-amount')?.value || '', cta: card.querySelector('.p-cta')?.value || '', desc: card.querySelector('.p-desc')?.value || '' };
  saveContent('products', products);
}
function deleteProduct(idx) {
  const products = [...(Array.isArray(contentData.products) ? contentData.products : [])];
  products.splice(idx, 1); saveContent('products', products); setTimeout(() => loadContent('products'), 500);
}
function addProduct() {
  const products = [...(Array.isArray(contentData.products) ? contentData.products : [])];
  products.push({ name: '新产品', tag: '', amount: '3-20万', cta: '免费评估额度', desc: '产品描述' });
  saveContent('products', products); setTimeout(() => loadContent('products'), 500);
}

// ===== 优势编辑 =====
function renderAdvantages(advs) {
  document.getElementById('advantagesEditor').innerHTML = advs.map((a, i) =>
    '<div class="card"><div class="form-row"><div class="form-group"><label>标题</label><input type="text" class="a-title" value="' + (a.title || '') + '"></div></div><div class="form-group"><label>描述</label><textarea class="a-desc" rows="2">' + (a.desc || '') + '</textarea></div><div class="form-actions"><button class="btn btn-primary btn-sm" onclick="saveAdvantage(' + i + ')">保存</button></div></div>'
  ).join('');
}
function saveAdvantage(idx) {
  const card = document.querySelectorAll('#advantagesEditor .card')[idx]; if (!card) return;
  const advs = [...(Array.isArray(contentData.advantages) ? contentData.advantages : [])];
  advs[idx] = { title: card.querySelector('.a-title')?.value || '', desc: card.querySelector('.a-desc')?.value || '' };
  saveContent('advantages', advs);
}

// ===== FAQ编辑 =====
function renderFaq(faqs) {
  document.getElementById('faqEditor').innerHTML = faqs.map((f, i) =>
    '<div class="card"><div class="form-group"><label>问题</label><input type="text" class="f-q" value="' + ((f.q || f.question || '')).replace(/"/g, '&quot;') + '"></div><div class="form-group"><label>答案 (支持HTML)</label><textarea class="f-a" rows="3">' + ((f.a || f.answer || '')).replace(/"/g, '&quot;') + '</textarea></div><div class="form-actions"><button class="btn btn-danger btn-sm" onclick="if(confirm(\'确定删除？\'))deleteFaq(' + i + ')">删除</button><button class="btn btn-primary btn-sm" onclick="saveFaq(' + i + ')">保存</button></div></div>'
  ).join('');
}
function saveFaq(idx) {
  const card = document.querySelectorAll('#faqEditor .card')[idx]; if (!card) return;
  const faqs = [...(Array.isArray(contentData.faq) ? contentData.faq : [])];
  faqs[idx] = { q: card.querySelector('.f-q')?.value || '', a: card.querySelector('.f-a')?.value || '' };
  saveContent('faq', faqs);
}
function deleteFaq(idx) {
  const faqs = [...(Array.isArray(contentData.faq) ? contentData.faq : [])];
  faqs.splice(idx, 1); saveContent('faq', faqs); setTimeout(() => loadContent('faq'), 500);
}
function addFaq() {
  const faqs = [...(Array.isArray(contentData.faq) ? contentData.faq : [])];
  faqs.push({ q: '新问题', a: '新答案' }); saveContent('faq', faqs); setTimeout(() => loadContent('faq'), 500);
}

// ===== 证言编辑 =====
function renderTestimonials(tests) {
  document.getElementById('testimonialsEditor').innerHTML = tests.map((t, i) =>
    '<div class="card"><div class="form-group"><label>证言内容</label><textarea class="t-text" rows="2">' + (t.text || '') + '</textarea></div><div class="form-row"><div class="form-group"><label>客户名</label><input type="text" class="t-name" value="' + (t.name || '') + '"></div><div class="form-group"><label>产品标签</label><input type="text" class="t-product" value="' + (t.product || '') + '"></div></div><div class="form-actions"><button class="btn btn-danger btn-sm" onclick="if(confirm(\'确定删除？\'))deleteTestimonial(' + i + ')">删除</button><button class="btn btn-primary btn-sm" onclick="saveTestimonial(' + i + ')">保存</button></div></div>'
  ).join('');
}
function saveTestimonial(idx) {
  const card = document.querySelectorAll('#testimonialsEditor .card')[idx]; if (!card) return;
  const tests = [...(Array.isArray(contentData.testimonials) ? contentData.testimonials : [])];
  tests[idx] = { text: card.querySelector('.t-text')?.value || '', name: card.querySelector('.t-name')?.value || '', product: card.querySelector('.t-product')?.value || '' };
  saveContent('testimonials', tests);
}
function deleteTestimonial(idx) {
  const tests = [...(Array.isArray(contentData.testimonials) ? contentData.testimonials : [])];
  tests.splice(idx, 1); saveContent('testimonials', tests); setTimeout(() => loadContent('testimonials'), 500);
}
function addTestimonial() {
  const tests = [...(Array.isArray(contentData.testimonials) ? contentData.testimonials : [])];
  tests.push({ text: '新证言内容', name: '客户', product: '产品信息' });
  saveContent('testimonials', tests); setTimeout(() => loadContent('testimonials'), 500);
}

// ===== 文章管理 =====
function loadArticles() {
  fetch(API + '/api/articles', { headers: authHeaders() })
    .then(r => r.json()).then(res => {
      const d = Array.isArray(res) ? res : (res.data || []);
      const tbody = document.getElementById('articlesTable');
      const empty = document.getElementById('articlesEmpty');
      if (!d.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
      empty.style.display = 'none';
      tbody.innerHTML = d.map(a => '<tr><td>' + a.id + '</td><td>' + (a.title || '无标题') + '</td><td>' + (a.category || '-') + '</td><td>' + (a.publish_date || a.date || '-') + '</td><td><span class="badge ' + (a.published !== false ? 'badge-done' : 'badge-pending') + '">' + (a.published !== false ? '已发布' : '草稿') + '</span></td><td><button class="btn btn-outline btn-sm" onclick="openArticleModal(' + a.id + ')">编辑</button><button class="btn btn-danger btn-sm" onclick="deleteArticle(' + a.id + ')">删除</button></td></tr>').join('');
    }).catch(() => {});
}
function openArticleModal(id) {
  editingArticleId = id || null;
  document.getElementById('articleModalTitle').textContent = id ? '编辑文章' : '新建文章';
  document.getElementById('articleForm').reset();
  document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('articlePublished').checked = true;
  if (id) {
    fetch(API + '/api/articles/' + id, { headers: authHeaders() })
      .then(r => r.json()).then(a => {
        document.getElementById('articleTitle').value = a.title || '';
        document.getElementById('articleSummary').value = a.summary || '';
        document.getElementById('articleCategory').value = a.category || '';
        document.getElementById('articleDate').value = a.publish_date || a.date || '';
        document.getElementById('articleContent').value = a.content || '';
        document.getElementById('articlePublished').checked = a.published !== false;
      }).catch(() => {});
  }
  document.getElementById('articleModal').classList.add('active');
}
function closeArticleModal() { document.getElementById('articleModal').classList.remove('active'); editingArticleId = null; }
document.getElementById('articleForm').onsubmit = function (e) {
  e.preventDefault();
  const data = { title: document.getElementById('articleTitle').value, summary: document.getElementById('articleSummary').value, category: document.getElementById('articleCategory').value, publish_date: document.getElementById('articleDate').value, content: document.getElementById('articleContent').value, published: document.getElementById('articlePublished').checked };
  const url = editingArticleId ? API + '/api/articles/' + editingArticleId : API + '/api/articles';
  const method = editingArticleId ? 'PUT' : 'POST';
  fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) })
    .then(r => r.json()).then(() => { showMessage('文章已保存'); closeArticleModal(); loadArticles(); }).catch(() => showMessage('保存失败', 'error'));
};
function deleteArticle(id) {
  if (!confirm('确定删除该文章？')) return;
  fetch(API + '/api/articles/' + id, { method: 'DELETE', headers: authHeaders() })
    .then(r => r.json()).then(() => { showMessage('已删除'); loadArticles(); }).catch(() => {});
}

// ===== 线索管理 =====
function loadLeads() {
  fetch(API + '/api/leads', { headers: authHeaders() })
    .then(r => r.json()).then(res => {
      const d = Array.isArray(res) ? res : (res.data || []);
      const tbody = document.getElementById('submissionsTable');
      const empty = document.getElementById('submissionsEmpty');
      if (!d.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
      empty.style.display = 'none';
      tbody.innerHTML = d.map(s => {
        const st = s.status === 'pending' ? '待跟进' : s.status;
        const isPending = s.status === 'pending';
        return '<tr><td>' + (s.unique_id || s.id || '-') + '</td><td>' + (s.name || s.real_name || '-') + '</td><td>' + (s.phone || '-') + '</td><td>' + (s.vehicle_type || s.vehicle_status || '-') + '</td><td>' + (s.source || '-') + '</td><td>' + (s.created_at ? new Date(s.created_at).toLocaleString('zh-CN') : '-') + '</td><td><span class="badge ' + (isPending ? 'badge-pending' : 'badge-done') + '">' + st + '</span></td><td><button class="btn btn-outline btn-sm" onclick="updateLead(' + s.id + ',\'' + (isPending ? 'contacted' : 'pending') + '\')">' + (isPending ? '标记已联系' : '重置') + '</button></td></tr>';
      }).join('');
    }).catch(() => {});
}
function updateLead(id, status) {
  fetch(API + '/api/leads/' + id, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) })
    .then(() => { showMessage('已更新'); loadLeads(); }).catch(() => {});
}

// ===== 上传 =====
function doUpload() {
  const input = document.getElementById('uploadInput');
  const file = input.files?.[0];
  if (!file) return showMessage('请选择文件', 'error');
  const fd = new FormData(); fd.append('file', file);
  fetch(API + '/api/upload', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd })
    .then(r => r.json()).then(d => {
      document.getElementById('uploadResult').innerHTML = '<div style="padding:1rem;background:#E8F5E9;border-radius:4px;">✅ 上传成功<br><code style="font-size:0.75rem;">' + (d.url || d.filename || '') + '</code><br><img src="' + d.url + '" style="max-width:200px;margin-top:0.5rem;border-radius:4px;"></div>';
      showMessage('上传成功');
    }).catch(() => showMessage('上传失败', 'error'));
}

// ===== 弹窗 =====
document.querySelectorAll('.modal').forEach(m => { m.addEventListener('click', function (e) { if (e.target === this) this.classList.remove('active'); }); });

// ===== 初始化 =====
if (token) showApp();
document.getElementById('loginPage').style.display = 'flex';
console.log('小萌极速融 统一后台 v2.0');
