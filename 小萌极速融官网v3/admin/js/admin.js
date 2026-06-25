/* ============================================
   小萌极速融 — 管理后台 v1.0
   ============================================ */
const API = window.location.origin;
let token = localStorage.getItem('admin_token') || '';
let currentSeoPage = 'home';
let editingArticleId = null;

// ===== 登录 =====
function doLogin(){
  const pwd = document.getElementById('loginPwd').value;
  const err = document.getElementById('loginError');
  fetch(API+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pwd})})
    .then(r=>r.json()).then(d=>{
      if(d.token){token=d.token;localStorage.setItem('admin_token',token);showApp();}
      else{err.style.display='block';}
    }).catch(()=>{err.textContent='网络错误';err.style.display='block';});
}

// ===== 显示管理界面 =====
function showApp(){
  document.getElementById('loginPage').style.display='none';
  document.getElementById('adminApp').style.display='block';
  loadDashboard();
  loadSeo();
  loadContent();
  loadArticles();
  loadSubmissions();
  document.getElementById('dashboardTime').textContent='上次登录: '+new Date().toLocaleString('zh-CN');
}

// ===== 验证token有效性 =====
function authHeaders(){
  return {'Authorization':'Bearer '+token,'Content-Type':'application/json'};
}

function showMessage(msg,type='success'){
  const el=document.getElementById('messageBox');
  el.className='message message-'+type+' show';
  el.textContent=msg;
  setTimeout(()=>el.classList.remove('show'),3000);
}

// ===== 侧边栏导航 =====
document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(a=>{
  a.addEventListener('click',function(e){
    e.preventDefault();
    document.querySelectorAll('.sidebar-nav a').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
    const tab=this.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));
    const el=document.getElementById('tab-'+tab);
    if(el)el.classList.add('active');
    if(tab==='dashboard')loadDashboard();
    if(tab==='seo')loadSeo();
    if(tab==='articles')loadArticles();
    if(tab==='submissions')loadSubmissions();
  });
});

document.getElementById('logoutBtn')?.addEventListener('click',()=>{
  localStorage.removeItem('admin_token');
  token='';
  document.getElementById('adminApp').style.display='none';
  document.getElementById('loginPage').style.display='flex';
  document.getElementById('loginPwd').value='';
});

// ===== 内容编辑标签 =====
document.querySelectorAll('#contentTabs .tab').forEach(t=>{
  t.addEventListener('click',function(){
    document.querySelectorAll('#contentTabs .tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('#content-hero, #content-products, #content-advantages, #content-faq, #content-testimonials').forEach(x=>x.classList.remove('active'));
    this.classList.add('active');
    const el=document.getElementById('content-'+this.dataset.section);
    if(el)el.classList.add('active');
    loadContent(this.dataset.section);
  });
});

// ===== SEO标签切换 =====
function switchSeo(page,title,kw,desc,ogTitle,ogDesc,canonical,twTitle,twDesc){
  currentSeoPage=page;
  document.getElementById('seoTitle').value=title||'';
  document.getElementById('seoKeywords').value=kw||'';
  document.getElementById('seoDescription').value=desc||'';
  document.getElementById('seoOgTitle').value=ogTitle||'';
  document.getElementById('seoOgDesc').value=ogDesc||'';
  document.getElementById('seoCanonical').value=canonical||'';
  document.getElementById('seoTwitterTitle').value=twTitle||'';
  document.getElementById('seoTwitterDesc').value=twDesc||'';
  document.querySelectorAll('#seoTabs .tab').forEach(t=>t.classList.remove('active'));
  document.querySelector(`#seoTabs .tab[data-page="${page}"]`)?.classList.add('active');
}

// ===== 仪表盘 =====
function loadDashboard(){
  fetch(API+'/api/stats',{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      document.getElementById('statsRow').innerHTML=`
        <div class="stat-box"><div class="stat-box-num">${d.total_submissions||0}</div><div class="stat-box-label">总线索</div></div>
        <div class="stat-box"><div class="stat-box-num">${d.today_submissions||0}</div><div class="stat-box-label">今日新增</div></div>
        <div class="stat-box"><div class="stat-box-num">${d.pending||0}</div><div class="stat-box-label">待跟进</div></div>
        <div class="stat-box"><div class="stat-box-num">${d.completed||0}</div><div class="stat-box-label">已处理</div></div>
      `;
    }).catch(()=>{});
  // 最近线索
  fetch(API+'/api/submissions',{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      const tbody=document.getElementById('recentSubmissions');
      const recent=d.slice(0,10);
      tbody.innerHTML=recent.length?recent.map(s=>`
        <tr>
          <td>${s.name||'-'}</td><td>${s.phone||'-'}</td>
          <td>${s.vehicle_type||'-'}</td><td>${s.source||'-'}</td>
          <td>${s.time||'-'}</td>
          <td><span class="badge ${s.status==='待跟进'?'badge-pending':'badge-done'}">${s.status||'待跟进'}</span></td>
        </tr>
      `).join(''):'<tr><td colspan="6"><div class="empty">暂无线索</div></td></tr>';
    }).catch(()=>{});
}

// ===== SEO =====
function loadSeo(){
  fetch(API+'/api/seo',{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      const tabs=d.map(p=>{
        const ogTitle=(p.og_title||'').replace(/'/g,"\\'");
        const ogDesc=(p.og_description||'').replace(/'/g,"\\'");
        const canonical=(p.canonical_url||'').replace(/'/g,"\\'");
        const twTitle=(p.twitter_title||'').replace(/'/g,"\\'");
        const twDesc=(p.twitter_description||'').replace(/'/g,"\\'");
        return `<div class="tab${p.page===currentSeoPage?' active':''}" data-page="${p.page}" onclick="switchSeo('${p.page}','${p.title.replace(/'/g,"\\'")}','${p.keywords.replace(/'/g,"\\'")}','${p.description.replace(/'/g,"\\'")}','${ogTitle}','${ogDesc}','${canonical}','${twTitle}','${twDesc}')">${p.page==='home'?'主站':'落地页'}</div>`;
      }).join('');
      document.getElementById('seoTabs').innerHTML=tabs;
      if(d.length){
        const current=d.find(p=>p.page===currentSeoPage)||d[0];
        switchSeo(current.page,current.title,current.keywords,current.description,current.og_title,current.og_description,current.canonical_url,current.twitter_title,current.twitter_description);
      }
    }).catch(()=>{});

  document.getElementById('seoForm').onsubmit=function(e){
    e.preventDefault();
    fetch(API+'/api/seo',{
      method:'PUT',
      headers:authHeaders(),
      body:JSON.stringify([{
        page:currentSeoPage,
        title:document.getElementById('seoTitle').value,
        keywords:document.getElementById('seoKeywords').value,
        description:document.getElementById('seoDescription').value,
        og_title:document.getElementById('seoOgTitle').value,
        og_description:document.getElementById('seoOgDesc').value,
        canonical_url:document.getElementById('seoCanonical').value,
        twitter_title:document.getElementById('seoTwitterTitle').value,
        twitter_description:document.getElementById('seoTwitterDesc').value
      }])
    }).then(r=>r.json()).then(()=>showMessage('SEO已保存','success')).catch(()=>showMessage('保存失败','error'));
  };
}

// ===== 内容编辑 =====
let contentData = {};

function loadContent(section){
  fetch(API+'/api/content',{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      contentData=d;
      // Hero
      if(d.hero&&(!section||section==='hero')){
        document.getElementById('heroBadge').value=d.hero.badge||'';
        document.getElementById('heroTitle').value=d.hero.title||'';
        document.getElementById('heroSubtitle').value=d.hero.subtitle||'';
        document.getElementById('heroCta').value=d.hero.cta_text||'';
        document.getElementById('heroForm').onsubmit=function(e){
          e.preventDefault();
          saveContent('hero',{
            badge:document.getElementById('heroBadge').value,
            title:document.getElementById('heroTitle').value,
            subtitle:document.getElementById('heroSubtitle').value,
            cta_text:document.getElementById('heroCta').value
          });
        };
      }
      // 产品
      if(d.products&&(!section||section==='products')) renderProducts(d.products);
      // 优势
      if(d.advantages&&(!section||section==='advantages')) renderAdvantages(d.advantages);
      // FAQ
      if(d.faq&&(!section||section==='faq')) renderFaq(d.faq);
      // 证言
      if(d.testimonials&&(!section||section==='testimonials')) renderTestimonials(d.testimonials);
    }).catch(()=>{});
}

function saveContent(section,data){
  fetch(API+'/api/content/'+section,{
    method:'PUT',headers:authHeaders(),
    body:JSON.stringify(data)
  }).then(r=>r.json()).then(()=>showMessage(section+'已保存','success')).catch(()=>showMessage('保存失败','error'));
}

// ===== 产品编辑 =====
function renderProducts(products){
  const el=document.getElementById('productsEditor');
  el.innerHTML=products.map((p,i)=>`
    <div class="card">
      <h2>产品 ${i+1}: ${p.name||'新产品'}</h2>
      <div class="form-row">
        <div class="form-group"><label>产品名称</label><input type="text" class="p-name" value="${p.name||''}"></div>
        <div class="form-group"><label>标签</label><input type="text" class="p-tag" value="${p.tag||''}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>额度</label><input type="text" class="p-amount" value="${p.amount||''}"></div>
        <div class="form-group"><label>CTA文字</label><input type="text" class="p-cta" value="${p.cta||'免费评估额度'}"></div>
      </div>
      <div class="form-group"><label>描述</label><textarea class="p-desc" rows="2">${p.desc||''}</textarea></div>
      <div class="form-actions">
        <button class="btn btn-danger btn-sm" onclick="if(confirm('确定删除？'))deleteProduct(${i})">删除</button>
        <button class="btn btn-primary btn-sm" onclick="saveProduct(${i})">保存</button>
      </div>
    </div>
  `).join('');
}

function saveProduct(idx){
  const cards=document.querySelectorAll('#productsEditor .card');
  const card=cards[idx];if(!card)return;
  const data={...contentData.products?.[idx]||{}};
  data.name=card.querySelector('.p-name')?.value||'';
  data.tag=card.querySelector('.p-tag')?.value||'';
  data.amount=card.querySelector('.p-amount')?.value||'';
  data.cta=card.querySelector('.p-cta')?.value||'免费评估额度';
  data.desc=card.querySelector('.p-desc')?.value||'';
  const products=[...contentData.products];
  products[idx]=data;
  saveContent('products',products);
}

function deleteProduct(idx){
  const products=[...contentData.products];
  products.splice(idx,1);
  saveContent('products',products);
  setTimeout(()=>loadContent('products'),500);
}

function addProduct(){
  const products=[...contentData.products||[]];
  products.push({name:'新产品',tag:'',amount:'3-20万',detail_1_label:'期限',detail_1_val:'36期',detail_2_label:'还款',detail_2_val:'等额本息',detail_3_label:'征信',detail_3_val:'单方征信',detail_4_label:'放款',detail_4_val:'抵押后放款',desc:'产品描述',cta:'免费评估额度'});
  saveContent('products',products);
  setTimeout(()=>loadContent('products'),500);
}

// ===== 优势编辑 =====
function renderAdvantages(advs){
  const el=document.getElementById('advantagesEditor');
  el.innerHTML=advs.map((a,i)=>`
    <div class="card">
      <div class="form-row">
        <div class="form-group"><label>标题</label><input type="text" class="a-title" value="${a.title||''}"></div>
      </div>
      <div class="form-group"><label>描述</label><textarea class="a-desc" rows="2">${a.desc||''}</textarea></div>
      <div class="form-actions">
        <button class="btn btn-primary btn-sm" onclick="saveAdvantage(${i})">保存</button>
      </div>
    </div>
  `).join('');
}

function saveAdvantage(idx){
  const cards=document.querySelectorAll('#advantagesEditor .card');
  const card=cards[idx];if(!card)return;
  const advs=[...contentData.advantages];
  advs[idx]={title:card.querySelector('.a-title')?.value||'',desc:card.querySelector('.a-desc')?.value||''};
  saveContent('advantages',advs);
}

// ===== FAQ编辑 =====
function renderFaq(faqs){
  const el=document.getElementById('faqEditor');
  el.innerHTML=faqs.map((f,i)=>`
    <div class="card">
      <div class="form-group"><label>问题</label><input type="text" class="f-q" value="${f.q||''}"></div>
      <div class="form-group"><label>答案 (支持HTML)</label><textarea class="f-a" rows="3">${f.a||''}</textarea></div>
      <div class="form-actions">
        <button class="btn btn-danger btn-sm" onclick="if(confirm('确定删除？'))deleteFaq(${i})">删除</button>
        <button class="btn btn-primary btn-sm" onclick="saveFaq(${i})">保存</button>
      </div>
    </div>
  `).join('');
}

function saveFaq(idx){
  const cards=document.querySelectorAll('#faqEditor .card');
  const card=cards[idx];if(!card)return;
  const faqs=[...contentData.faq];
  faqs[idx]={q:card.querySelector('.f-q')?.value||'',a:card.querySelector('.f-a')?.value||''};
  saveContent('faq',faqs);
}

function deleteFaq(idx){
  const faqs=[...contentData.faq];
  faqs.splice(idx,1);
  saveContent('faq',faqs);
  setTimeout(()=>loadContent('faq'),500);
}

function addFaq(){
  const faqs=[...contentData.faq||[]];
  faqs.push({q:'新问题',a:'新答案'});
  saveContent('faq',faqs);
  setTimeout(()=>loadContent('faq'),500);
}

// ===== 证言编辑 =====
function renderTestimonials(tests){
  const el=document.getElementById('testimonialsEditor');
  el.innerHTML=tests.map((t,i)=>`
    <div class="card">
      <div class="form-group"><label>证言内容</label><textarea class="t-text" rows="2">${t.text||''}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>客户名</label><input type="text" class="t-name" value="${t.name||''}"></div>
        <div class="form-group"><label>产品标签</label><input type="text" class="t-product" value="${t.product||''}"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-danger btn-sm" onclick="if(confirm('确定删除？'))deleteTestimonial(${i})">删除</button>
        <button class="btn btn-primary btn-sm" onclick="saveTestimonial(${i})">保存</button>
      </div>
    </div>
  `).join('');
}

function saveTestimonial(idx){
  const cards=document.querySelectorAll('#testimonialsEditor .card');
  const card=cards[idx];if(!card)return;
  const tests=[...contentData.testimonials];
  tests[idx]={text:card.querySelector('.t-text')?.value||'',name:card.querySelector('.t-name')?.value||'',product:card.querySelector('.t-product')?.value||''};
  saveContent('testimonials',tests);
}

function deleteTestimonial(idx){
  const tests=[...contentData.testimonials];
  tests.splice(idx,1);
  saveContent('testimonials',tests);
  setTimeout(()=>loadContent('testimonials'),500);
}

function addTestimonial(){
  const tests=[...contentData.testimonials||[]];
  tests.push({text:'新证言内容',name:'客户',product:'产品信息'});
  saveContent('testimonials',tests);
  setTimeout(()=>loadContent('testimonials'),500);
}

// ===== 文章管理 =====
function loadArticles(){
  fetch(API+'/api/articles',{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      const tbody=document.getElementById('articlesTable');
      const empty=document.getElementById('articlesEmpty');
      if(!d.length){tbody.innerHTML='';empty.style.display='block';return;}
      empty.style.display='none';
      tbody.innerHTML=d.map(a=>`
        <tr>
          <td>${a.id}</td>
          <td>${a.title||'无标题'}<br><small style="color:#999;">/${a.slug||'id-'+a.id}</small></td>
          <td>${a.category||'-'}</td>
          <td>${a.date||'-'}</td>
          <td><span class="badge ${a.published!==false?'badge-done':'badge-pending'}">${a.published!==false?'已发布':'草稿'}</span>${a.meta_title?'<br><small style="color:#999;">有独立SEO</small>':''}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="openArticleModal(${a.id})">编辑</button>
            <button class="btn btn-danger btn-sm" onclick="deleteArticle(${a.id})">删除</button>
          </td>
        </tr>
      `).join('');
    }).catch(()=>{});
}

function openArticleModal(id){
  editingArticleId=id||null;
  document.getElementById('articleModalTitle').textContent=id?'编辑文章':'新建文章';
  document.getElementById('articleForm').reset();
  document.getElementById('articleDate').value=new Date().toISOString().split('T')[0];
  document.getElementById('articlePublished').checked=true;
  document.getElementById('articleIsNoindex').checked=false;
  if(id){
    fetch(API+'/api/articles/'+id,{headers:authHeaders()})
      .then(r=>r.json()).then(a=>{
        document.getElementById('articleTitle').value=a.title||'';
        document.getElementById('articleSummary').value=a.summary||'';
        document.getElementById('articleCategory').value=a.category||'';
        document.getElementById('articleDate').value=a.date||'';
        document.getElementById('articleContent').value=a.content||'';
        document.getElementById('articlePublished').checked=a.published!==false;
        document.getElementById('articleSlug').value=a.slug||'';
        document.getElementById('articleMetaTitle').value=a.meta_title||'';
        document.getElementById('articleMetaDesc').value=a.meta_description||'';
        document.getElementById('articleKeywords').value=a.meta_keywords||'';
        document.getElementById('articleIsNoindex').checked=a.is_noindex||false;
        document.getElementById('articleCanonical').value=a.canonical||'';
      }).catch(()=>{});
  }
  document.getElementById('articleModal').classList.add('active');
}

function closeArticleModal(){
  document.getElementById('articleModal').classList.remove('active');
  editingArticleId=null;
}

document.getElementById('articleForm').onsubmit=function(e){
  e.preventDefault();
  const slug=document.getElementById('articleSlug').value.trim();
  if(!slug&&!editingArticleId){showMessage('请填写URL标识(slug)','error');return;}
  const data={
    title:document.getElementById('articleTitle').value,
    summary:document.getElementById('articleSummary').value,
    category:document.getElementById('articleCategory').value,
    date:document.getElementById('articleDate').value,
    content:document.getElementById('articleContent').value,
    published:document.getElementById('articlePublished').checked,
    slug:slug||'article-'+Date.now(),
    meta_title:document.getElementById('articleMetaTitle').value,
    meta_description:document.getElementById('articleMetaDesc').value,
    meta_keywords:document.getElementById('articleKeywords').value,
    is_noindex:document.getElementById('articleIsNoindex').checked,
    canonical:document.getElementById('articleCanonical').value
  };
  const url=editingArticleId?API+'/api/articles/'+editingArticleId:API+'/api/articles';
  const method=editingArticleId?'PUT':'POST';
  fetch(url,{method,headers:authHeaders(),body:JSON.stringify(data)})
    .then(r=>r.json()).then(()=>{
      showMessage('文章已保存','success');
      closeArticleModal();
      loadArticles();
    }).catch(()=>showMessage('保存失败','error'));
};

function deleteArticle(id){
  if(!confirm('确定删除该文章？'))return;
  fetch(API+'/api/articles/'+id,{method:'DELETE',headers:authHeaders()})
    .then(r=>r.json()).then(()=>{showMessage('已删除');loadArticles();}).catch(()=>{});
}

// 弹窗关闭
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click',function(e){if(e.target===this)this.classList.remove('active');});
});

// ===== 线索管理 =====
function loadSubmissions(){
  fetch(API+'/api/submissions',{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      const tbody=document.getElementById('submissionsTable');
      const empty=document.getElementById('submissionsEmpty');
      if(!d.length){tbody.innerHTML='';empty.style.display='block';return;}
      empty.style.display='none';
      tbody.innerHTML=d.map(s=>`
        <tr>
          <td>${s.id||'-'}</td>
          <td>${s.name||'-'}</td>
          <td>${s.phone||'-'}</td>
          <td>${s.vehicle_type||'-'}</td>
          <td>${s.source||'-'}</td>
          <td>${s.time||'-'}</td>
          <td><span class="badge ${s.status==='待跟进'?'badge-pending':'badge-done'}">${s.status||'待跟进'}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="updateSubmission(${s.id},'${s.status==='待跟进'?'已跟进':'待跟进'}')">${s.status==='待跟进'?'标记处理':'重置'}</button>
          </td>
        </tr>
      `).join('');
    }).catch(()=>{});
}

function updateSubmission(id,status){
  fetch(API+'/api/submissions/'+id,{method:'PUT',headers:authHeaders(),body:JSON.stringify({status})})
    .then(()=>{showMessage('已更新');loadSubmissions();}).catch(()=>{});
}

// ===== 上传 =====
function doUpload(){
  const input=document.getElementById('uploadInput');
  const file=input.files?.[0];
  if(!file)return showMessage('请选择文件','error');
  const formData=new FormData();
  formData.append('file',file);
  fetch(API+'/api/upload',{
    method:'POST',
    headers:{'Authorization':'Bearer '+token},
    body:formData
  }).then(r=>r.json()).then(d=>{
    document.getElementById('uploadResult').innerHTML=`
      <div style="padding:1rem;background:#E8F5E9;border-radius:4px;">
        ✅ 上传成功<br>
        <code style="font-size:0.75rem;">${d.url||d.filename||''}</code><br>
        <img src="${d.url}" style="max-width:200px;margin-top:0.5rem;border-radius:4px;">
      </div>
    `;
    showMessage('上传成功','success');
  }).catch(()=>showMessage('上传失败','error'));
}

// ===== 初始化：检查token =====
if(token)showApp();
document.getElementById('loginPage').style.display='flex';
console.log('小萌极速融 后台 v1.0 ✓');
