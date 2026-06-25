/* ============================================
   小萌极速融 — 全站交互逻辑 v2
   ============================================ */
(function() {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* --- 导航滚动 --- */
  const header = $('.header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- 汉堡菜单 --- */
  const hamburger = $('.hamburger');
  const mobileNav = $('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const active = hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active', active);
      document.body.style.overflow = active ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
    }));
  }

  /* --- 滚动渐现 (IntersectionObserver) --- */
  function initReveal() {
    const els = $$('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    els.forEach(el => obs.observe(el));
  }
  initReveal();

  /* --- FAQ 手风琴 --- */
  function initFAQ() {
    const items = $$('.faq-item');
    items.forEach(item => {
      const q = item.querySelector('.faq-q');
      q.addEventListener('click', () => {
        const active = item.classList.contains('active');
        items.forEach(i => i.classList.remove('active'));
        if (!active) item.classList.add('active');
      });
    });
    if (items.length) items[0].classList.add('active');
  }
  initFAQ();

  /* --- 额度测算器 --- */
  function initCalc() {
    const form = $('.calc-form');
    if (!form) return;
    const price = form.querySelector('[name="car_price"]');
    const age = form.querySelector('[name="car_age"]');
    const term = form.querySelector('[name="calc_term"]');
    const btn = form.querySelector('.calc-btn');
    const result = form.querySelector('.calc-result');
    const resultAmount = form.querySelector('.calc-result-amount');
    const resultNote = form.querySelector('.calc-result-note');
    const unlock = form.querySelector('.calc-unlock');
    const unlockBtn = unlock?.querySelector('.btn');
    const unlockInput = unlock?.querySelector('input');

    function calc() {
      const p = parseFloat(price?.value || 0);
      if (p <= 0) { result?.classList.remove('show'); return; }
      const a = parseInt(age?.value || 3);
      const t = parseInt(term?.value || 36);
      // 车龄折旧: 10年以内85%成数，10年以上70%
      const ltv = a <= 10 ? 0.85 : 0.70;
      const amount = p * ltv;
      if (resultAmount) resultAmount.textContent = '¥' + Math.round(amount).toLocaleString();
      if (resultNote) resultNote.textContent = `估值¥${p}万 · 车龄${a}年 · 可贷约${Math.round(ltv*100)}% · ${t}期`;
      result?.classList.add('show');
    }

    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      calc();
    });

    unlockBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const phone = unlockInput?.value?.trim();
      if (phone && phone.length >= 11) {
        unlock.classList.add('show');
        unlockBtn.textContent = '✅ 已解锁';
        unlockBtn.disabled = true;
        showToast('🎉 额度方案已解锁！专属顾问将致电您说明。', 'success');
      } else {
        showToast('请填写正确的手机号', 'error');
      }
    });
  }
  initCalc();

  /* --- Toast --- */
  function showToast(msg, type = 'success') {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.className = 'toast toast-' + type;
    t.textContent = msg;
    void t.offsetWidth;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }

  /* --- 表单提交 --- */
  function initForms() {
    $$('.cta-form, .exit-popup form').forEach(form => {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = this.querySelector('[type="text"]')?.value?.trim();
        const phone = this.querySelector('[type="tel"]')?.value?.trim();
        if (!name || name.length < 2) return showToast('请填写姓名', 'error');
        if (!phone || phone.length < 11) return showToast('请填写正确手机号', 'error');

        const btn = this.querySelector('.btn');
        const orig = btn?.textContent;
        if (btn) { btn.textContent = '提交中...'; btn.disabled = true; }

        setTimeout(() => {
          showToast('🎉 已提交！专属顾问将在1分钟内致电您。', 'success');
          this.querySelectorAll('input, select').forEach(el => el.value = '');
          if (btn) { btn.textContent = '✅ 已提交'; setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 4000); }
          $('.exit-popup')?.classList.remove('active');
        }, 1000);
      });
    });
  }
  initForms();

  /* --- 聊天 --- */
  function initChat() {
    const chatBtn = $('.float-btn-chat');
    const popup = $('.chat-popup');
    const close = popup?.querySelector('.chat-head-close');
    const input = popup?.querySelector('input');
    const send = popup?.querySelector('.chat-foot button');
    const body = popup?.querySelector('.chat-body');
    if (!chatBtn || !popup) return;

    chatBtn.addEventListener('click', () => popup.classList.add('active'));
    close?.addEventListener('click', () => popup.classList.remove('active'));

    function addMsg(text, isUser = false) {
      if (!body) return;
      const b = document.createElement('div');
      b.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-bot');
      b.textContent = text;
      body.appendChild(b);
      body.scrollTop = body.scrollHeight;
    }

    function handleSend() {
      const text = input?.value?.trim();
      if (!text) return;
      addMsg(text, true);
      input.value = '';
      setTimeout(() => addMsg('收到，已为您记录！我们的客户经理将在1分钟内联系您详细了解情况 😊'), 600);
    }

    send?.addEventListener('click', handleSend);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

    // 30秒自动弹窗
    setTimeout(() => {
      if (!popup.classList.contains('active')) {
        popup.classList.add('active');
        addMsg('您好 👋 我是小萌极速融专属顾问。您的车辆想做抵押借款吗？有任何问题都可以问我～');
      }
    }, 30000);
  }
  initChat();

  /* --- 退出意图弹窗 --- */
  function initExitPopup() {
    const popup = $('.exit-popup');
    const closeBtn = popup?.querySelector('.exit-popup-close');
    if (!popup) return;

    closeBtn?.addEventListener('click', () => popup.classList.remove('active'));

    let shown = false;
    document.addEventListener('mouseleave', (e) => {
      if (shown || e.clientY > 0) return;
      // 排除移动端
      if (window.innerWidth < 768) return;
      shown = true;
      popup.classList.add('active');
    });
  }
  initExitPopup();

  /* --- 计数器动画 --- */
  function initCounters() {
    const els = $$('.stat-num');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const n = parseInt(el.textContent.replace(/[^0-9]/g, ''));
          if (n && n > 0) {
            const prefix = el.textContent.match(/^[^0-9]*/)?.[0] || '';
            const suffix = el.textContent.match(/[^0-9]*$/)?.[0] || '';
            const start = performance.now();
            const dur = 1200;
            function update(now) {
              const p = Math.min((now - start) / dur, 1);
              const v = Math.round((1 - Math.pow(2, -10 * p)) * n);
              el.textContent = prefix + v.toLocaleString() + suffix;
              if (p < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  }
  initCounters();

  /* --- 平滑锚点 --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });

  console.log('小萌极速融 v2 已加载 ✓');
})();
