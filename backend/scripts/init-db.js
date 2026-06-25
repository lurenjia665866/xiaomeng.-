/**
 * 数据库初始化脚本
 * 创建默认内容、管理员、资方产品等基础数据
 * 运行: npm run init-db
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const crypto = require('crypto');
const { sequelize, AdminUser, PageContent, Article, LenderProduct } = require('../models');

async function init() {
  console.log('[Init] 开始初始化数据库...');

  // 同步所有模型
  await sequelize.sync({ force: true });
  console.log('[Init] 数据库表创建完成');

  // === 创建默认管理员 ===
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  await AdminUser.create({
    username: 'admin',
    password_hash: hash,
    real_name: '超级管理员',
    role: 'super_admin',
    is_active: true
  });
  console.log('[Init] 默认管理员已创建 (admin/' + password + ')');

  // === 创建页面内容区块 ===
  const pageData = {
    index: {
      seo: { title: '小萌极速融 — 全款车抵押|按揭车二押|车辆一押|车抵贷3-100万', keywords: '车辆抵押,车抵贷,全款车抵押,按揭车二押', description: '小萌极速融，长安新生授权代理。全款车抵押、按揭车二押、车辆一押全覆盖。线上预审5分钟出额度。' },
      hero: { badge: '长安新生授权 · 全国头部代理', title: '名下有车想借款？ 押证不押车，免费评估额度', subtitle: '全款车抵押·按揭车二押·车辆一押全覆盖。线上预审5分钟出额度。', cta_text: '免费评估车辆额度', features: ['押证不押车，车照开', '多资金并联审批', '全国可办，远程抵押', '预审0费用'] },
      products: [{ name: '全款车抵押', tag: '已结清', amount: '3-100万', cta: '免费评估额度', desc: '全款车抵押贷款，额度最高可达车辆评估价9成，押证不押车，车辆照常使用。' }, { name: '按揭车二押', tag: '有贷款', amount: '3-50万', cta: '免费评估额度', desc: '按揭车辆二次抵押，无需结清尾款，多资金并联审批，利用车辆剩余价值。' }],
      advantages: [{ title: '押证不押车，车照开', desc: '抵押车辆登记证（绿本），不装GPS、不押车，不影响日常用车。' }, { title: '多资金并联审批', desc: '长安信托、鑫生金融、长安普惠等多资方并联审批，通过率高、放款快。' }, { title: '全国可办，远程抵押', desc: '支持全国大部分城市办理，部分城市支持远程抵押，足不出户完成放款。' }, { title: '预审0费用', desc: '线上预审完全不收取任何费用，客户经理1对1服务，费用透明。' }],
      faq: [{ q: '没有车可以贷款吗？', a: '目前只支持车辆抵押贷款，需要有本人名下车辆。' }, { q: '按揭车可以抵押吗？', a: '可以。按揭车可以做二次抵押，利用车辆剩余价值获取资金。' }, { q: '押证不押车是什么意思？', a: '只需抵押车辆登记证（绿本），车辆本人继续使用，不影响出行。' }, { q: '多久能放款？', a: '线上预审5分钟出额度，线下办理最快当天到账。' }],
      testimonials: [{ text: '车是全款买的，想周转一下资金，没想到3天就拿到钱了，车还是自己开，非常方便。', name: '王先生', product: '全款车抵押' }, { text: '按揭车还有8万没还清，急用钱找了几家都不行。这里给我做了二押，解决了燃眉之急。', name: '张先生', product: '按揭车二押' }]
    },
    landing: {
      seo: { title: '免费车辆额度评估 — 全款车抵押|按揭车二押|押证不押车', keywords: '车辆额度评估,免费评估,车抵贷', description: '免费评估车辆可贷额度，3项信息5分钟出结果。全款车抵押、按揭车二押，押证不押车。' }
    }
  };

  for (const [page, sections] of Object.entries(pageData)) {
    for (const [section, content] of Object.entries(sections)) {
      await PageContent.create({ page, section, title: section, content, sort_order: 0, is_active: true });
    }
  }
  console.log('[Init] 页面内容已创建');

  // === 创建资方产品（用于小程序智能匹配）===
  const lenders = [
    { lender_name: '长安信托', product_name: '车易贷', product_code: 'CA-XT-01', min_car_age: 0, max_car_age: 15, accept_full_paid: true, accept_mortgaging: true, min_loan_amount: 30000, max_loan_amount: 1000000, min_annual_rate: 3.85, max_annual_rate: 19.99, max_loan_ratio: 0.90, max_term_months: 60, sort_order: 1 },
    { lender_name: '鑫生金融', product_name: '车抵融', product_code: 'XS-JR-01', min_car_age: 1, max_car_age: 12, accept_full_paid: true, accept_mortgaging: false, min_loan_amount: 50000, max_loan_amount: 800000, min_annual_rate: 5.50, max_annual_rate: 21.99, max_loan_ratio: 0.85, max_term_months: 48, sort_order: 2 },
    { lender_name: '长安普惠', product_name: '货车专案', product_code: 'CA-PH-01', min_car_age: 0, max_car_age: 10, accept_full_paid: true, accept_mortgaging: false, min_loan_amount: 20000, max_loan_amount: 500000, min_annual_rate: 6.00, max_annual_rate: 23.99, max_loan_ratio: 0.80, max_term_months: 36, sort_order: 3 }
  ];

  for (const product of lenders) {
    await LenderProduct.create(product);
  }
  console.log('[Init] 资方产品已创建');

  // === 创建示例文章 ===
  await Article.create({
    title: '车辆抵押贷款全流程指南',
    summary: '从申请到放款，一步步带你了解车辆抵押贷款的全部流程和注意事项。',
    content: '<p>车辆抵押贷款因其放款快、手续简单而受到广大车主青睐。本文将详细介绍车辆抵押贷款的全流程，帮助您更好地了解和准备。</p><h2>第一步：线上预审</h2><p>填写基本资料（姓名、手机号、车辆信息），系统5分钟出预估额度。</p><h2>第二步：客户经理联系</h2><p>专属客户经理1对1沟通，了解您的具体需求和车辆情况。</p><h2>第三步：线下验车</h2><p>预约验车，评估车辆实际价值。</p><h2>第四步：签约放款</h2><p>签订合同，办理抵押登记，最快当天到账。</p>',
    category: 'guide',
    published: true,
    publish_date: '2026-06-01',
    author: '小萌'
  });
  console.log('[Init] 示例文章已创建');

  console.log('============================================');
  console.log('  数据库初始化完成！');
  console.log('  管理员密码: ' + password);
  console.log('  启动服务: npm start');
  console.log('============================================');
  process.exit(0);
}

init().catch(err => {
  console.error('[Init] 失败:', err);
  process.exit(1);
});
