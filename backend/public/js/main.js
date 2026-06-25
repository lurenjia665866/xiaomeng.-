(function() {
  'use strict';
  const $ = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));

  // --- API基址 ---
  const API = window.location.origin;

  // --- 导航 ---
  const header = $('.header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // --- 汉堡菜单 ---
  const hamburger = $('.hamburger');
  const mobileNav = $('.mobile-nav');
  if(hamburger&&mobileNav){
    hamburger.addEventListener('click',()=>{
      const a=hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active',a);
      document.body.style.overflow=a?'hidden':'';
    });
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow='';
    }));
  }

  // --- 实时计算器 ---
  function initCalc(){
    const price=$('[name="car_price"]');
    const age=$('[name="car_age"]');
    const term=$('[name="calc_term"]');
    const amount=$('#calcAmount');
    const note=$('#calcNote');
    const unlock=$('#calcUnlock');
    const phone=$('#calcPhone');
    const unlockBtn=$('#calcUnlockBtn');
    if(!price||!amount)return;

    function calc(){
      const p=parseFloat(price.value)||0;
      const a=parseInt(age?.value)||3;
      const ltv=a<=10?0.85:0.70;
      const val=p*ltv;
      amount.textContent='¥'+Math.round(val).toLocaleString();
      if(note)note.textContent=`估值${p}万 · 车龄${a}年 · 可贷约${Math.round(ltv*100)}% · ${term?.value||36}期`;
    }
    // 实时计算
    price.addEventListener('input',calc);
    age?.addEventListener('input',calc);
    term?.addEventListener('change',calc);
    calc();

    // 解锁
    unlockBtn?.addEventListener('click',()=>{
      const p=phone?.value?.trim();
      if(p&&p.length>=11){
        unlock.classList.add('show');
        unlockBtn.textContent='✅ 已解锁';
        unlockBtn.disabled=true;
        // 同时提交
        fetch(API+'/api/submit',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({name:'额度测算用户',phone:p,vehicle_type:'未选择',source:'计算器'})
        }).catch(()=>{});
        showToast('🎉 已解锁！专属顾问将联系您','success');
      }else showToast('请填写正确的手机号','error');
    });
  }
  initCalc();

  // --- 表单提交 ---
  function initForms(){
    $$('#mainForm, #exitForm').forEach(form=>{
      form.addEventListener('submit',function(e){
        e.preventDefault();
        const name=this.querySelector('[type="text"]')?.value?.trim();
        const phone=this.querySelector('[type="tel"]')?.value?.trim();
        if(!name||name.length<2)return showToast('请填写姓名','error');
        if(!phone||phone.length<11)return showToast('请填写正确手机号','error');
        const vt=this.querySelector('select')?.value||'未选择';
        const btn=this.querySelector('.btn');
        const orig=btn?.textContent;
        if(btn){btn.textContent='提交中...';btn.disabled=true;}

        fetch(API+'/api/submit',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({name,phone,vehicle_type:vt,source:'网站'})
        }).then(r=>r.json()).then(d=>{
          showToast('🎉 已提交！专属顾问1分钟内致电您','success');
          this.querySelectorAll('input,select').forEach(el=>el.value='');
          if(btn){btn.textContent='✅ 已提交';setTimeout(()=>{btn.textContent=orig;btn.disabled=false},4000);}
          $('#exitPopup')?.classList.remove('active');
        }).catch(()=>{
          showToast('提交成功，顾问将尽快联系您','success');
          if(btn){btn.textContent=orig;btn.disabled=false;}
          $('#exitPopup')?.classList.remove('active');
        });
      });
    });
  }
  initForms();

  // --- 动态加载内容 ---
  function loadContent(){
    fetch(API+'/api/public/content')
      .then(r=>r.json())
      .then(data=>{
        // 产品卡
        const grid=$('#productGrid');
        if(grid&&data.products?.length){
          grid.innerHTML=data.products.map((p,i)=>`
            <div class="product-card reveal r${i+1}">
              <div class="product-top">
                <div><div class="product-name">${p.name}</div><div class="product-name-sub">${p.tag}</div></div>
                <div class="product-amount">${p.amount}<small> 额度</small></div>
              </div>
              <div class="product-meta">
                <div><div class="product-meta-label">${p.detail_1_label||'期限'}</div><div class="product-meta-value">${p.detail_1_val||'36期'}</div></div>
                <div><div class="product-meta-label">${p.detail_2_label||'还款'}</div><div class="product-meta-value">${p.detail_2_val||'等额本息'}</div></div>
                <div><div class="product-meta-label">${p.detail_3_label||'征信'}</div><div class="product-meta-value">${p.detail_3_val||'单方征信'}</div></div>
                <div><div class="product-meta-label">${p.detail_4_label||'放款'}</div><div class="product-meta-value">${p.detail_4_val||'抵押后放款'}</div></div>
              </div>
              <p class="product-desc">${p.desc}</p>
              <a href="#pre-approval" class="btn btn-outline btn-sm">${p.cta||'免费评估额度'}</a>
            </div>
          `).join('');
          // 重新触发渐现
          setTimeout(initReveal,100);
        }
        // 优势卡
        const adv=$('#advGrid');
        if(adv&&data.advantages?.length){
          const icons=['🏦','📱','💰','🗺️','👤','🔒'];
          adv.innerHTML=data.advantages.map((a,i)=>`
            <div class="adv-card reveal r${(i%3)+1}">
              <div class="adv-icon" style="background:var(--blue-50)">${icons[i]||'✓'}</div>
              <div><div class="adv-title">${a.title}</div><div class="adv-desc">${a.desc}</div></div>
            </div>
          `).join('');
          setTimeout(initReveal,100);
        }
        // FAQ
        const faqList=$('#faqList');
        if(faqList&&data.faq?.length){
          faqList.innerHTML=data.faq.map((f,i)=>`
            <div class="faq-item${i===0?' active':''}">
              <button class="faq-q"><span>${f.q}</span><span class="faq-q-icon">+</span></button>
              <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
            </div>
          `).join('');
          initFAQ();
        }
        // 证言
        const tl=$('#testimonialList');
        if(tl&&data.testimonials?.length){
          tl.innerHTML=data.testimonials.map((t,i)=>`
            <div class="testimonial-card reveal r${(i%3)+1}">
              <div class="testimonial-text">${t.text}</div>
              <div class="testimonial-author">
                <div class="testimonial-avatar">${t.name?.[0]||'客'}</div>
                <div><div class="testimonial-name">${t.name||'客户'}</div><div class="testimonial-product">${t.product||''}</div></div>
              </div>
            </div>
          `).join('');
          setTimeout(initReveal,100);
        }
        // 文章
        const al=$('#articleList');
        if(al&&data.articles?.length){
          al.innerHTML=data.articles.map(a=>`
            <div class="faq-item">
              <button class="faq-q"><span>📄 ${a.title}</span><span class="faq-q-icon">+</span></button>
              <div class="faq-a"><div class="faq-a-inner">${a.summary||a.content?.slice(0,200)||''}<br><span style="font-size:0.75rem;color:var(--color-text-muted);margin-top:0.5rem;display:block;">${a.date||''} · ${a.category||''}</span></div></div>
            </div>
          `).join('');
          initFAQ();
        }
      })
      .catch(()=>{
        // 离线回退：用静态数据
        console.log('API不可用，使用静态数据');
      });
  }
  loadContent();

  // --- 触发渐现 ---
  function initReveal(){
    const els=$$('.reveal');
    if(!els.length)return;
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
    },{threshold:0.06,rootMargin:'0px 0px -20px 0px'});
    els.forEach(el=>obs.observe(el));
  }
  initReveal();

  // --- FAQ ---
  function initFAQ(){
    const items=$$('.faq-item');
    items.forEach(item=>{
      const q=item.querySelector('.faq-q');
      if(!q)return;
      q.addEventListener('click',()=>{
        const a=item.classList.contains('active');
        items.forEach(i=>i.classList.remove('active'));
        if(!a)item.classList.add('active');
      });
    });
  }

  // --- 聊天 ---
  function initChat(){
    const btn=$('.float-btn-chat');
    const popup=$('.chat-popup');
    const close=popup?.querySelector('.chat-head-close');
    const input=popup?.querySelector('input');
    const send=popup?.querySelector('.chat-foot button');
    const body=popup?.querySelector('.chat-body');
    if(!btn||!popup)return;
    btn.addEventListener('click',()=>popup.classList.add('active'));
    close?.addEventListener('click',()=>popup.classList.remove('active'));
    function addMsg(t,u=false){
      if(!body)return;
      const b=document.createElement('div');
      b.className='chat-msg '+(u?'chat-msg-user':'chat-msg-bot');
      b.textContent=t;body.appendChild(b);body.scrollTop=body.scrollHeight;
    }
    function sendMsg(){
      const t=input?.value?.trim();
      if(!t)return;addMsg(t,true);input.value='';
      setTimeout(()=>addMsg('收到！已为您记录，客户经理将在1分钟内联系您 😊'),600);
    }
    send?.addEventListener('click',sendMsg);
    input?.addEventListener('keydown',e=>{if(e.key==='Enter')sendMsg();});
    setTimeout(()=>{
      if(!popup.classList.contains('active')){
        popup.classList.add('active');
        addMsg('您好 👋 您的车辆想做抵押借款吗？有任何问题都可以问我～');
      }
    },30000);
  }
  initChat();

  // --- 退出弹窗 ---
  function initExit(){
    const popup=$('#exitPopup');
    const close=popup?.querySelector('.exit-popup-close');
    if(!popup)return;
    close?.addEventListener('click',()=>popup.classList.remove('active'));
    let shown=false;
    document.addEventListener('mouseleave',e=>{
      if(shown||e.clientY>0||window.innerWidth<768)return;
      shown=true;popup.classList.add('active');
    });
  }
  initExit();

  // --- Toast ---
  function showToast(msg,type='success'){
    let t=$('.toast');
    if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);}
    t.className='toast toast-'+type;
    t.textContent=msg;void t.offsetWidth;t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),4000);
  }

  // --- 计数器 ---
  function initCounters(){
    const els=$$('.stat-num');
    if(!els.length)return;
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const el=e.target;
          const n=parseInt(el.textContent.replace(/[^0-9]/g,''));
          if(n&&n>0){
            const p=el.textContent.match(/^[^0-9]*/)?.[0]||'';
            const s=el.textContent.match(/[^0-9]*$/)?.[0]||'';
            const start=performance.now();
            function up(now){
              const v=Math.round((1-Math.pow(2,-10*Math.min((now-start)/1200,1)))*n);
              el.textContent=p+v.toLocaleString()+s;
              if((now-start)<1200)requestAnimationFrame(up);
            }
            requestAnimationFrame(up);
          }
          obs.unobserve(el);
        }
      });
    },{threshold:0.5});
    els.forEach(el=>obs.observe(el));
  }
  initCounters();

  // --- 平滑锚点 ---
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',function(e){
      const id=this.getAttribute('href');
      if(!id||id==='#')return;
      const t=document.querySelector(id);
      if(!t)return;
      e.preventDefault();
      window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
    });
  });

  console.log('小萌极速融 v3 已加载 ✓');
})();
