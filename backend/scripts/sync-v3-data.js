/**
 * 数据迁移脚本 —— 将 v3 的 JSON 数据导入 v4 数据库
 * 运行: npm run sync-v3
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { sequelize, Lead } = require('../models');

const V3_DATA_DIR = path.join(__dirname, '..', '..', '小萌极速融官网v3', 'data');

async function sync() {
  console.log('[Sync] 开始同步 v3 数据...');

  await sequelize.sync();

  // 读取 v3 submissions.json
  const submissionsPath = path.join(V3_DATA_DIR, 'submissions.json');
  if (!fs.existsSync(submissionsPath)) {
    console.log('[Sync] 未找到 v3 submissions.json，跳过');
    process.exit(0);
  }

  const submissions = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'));
  if (!Array.isArray(submissions) || submissions.length === 0) {
    console.log('[Sync] v3 无数据，跳过');
    process.exit(0);
  }

  console.log('[Sync] 发现 ' + submissions.length + ' 条 v3 线索');

  let imported = 0;
  for (const s of submissions) {
    // 检查是否已导入（按 phone + time 去重）
    const existing = await Lead.findOne({
      where: {
        phone: s.phone,
        created_at: s.time ? new Date(s.time) : undefined
      }
    });
    if (existing) continue;

    await Lead.create({
      unique_id: 'XM-V3-' + (s.id || Date.now()),
      source: s.source || '网站',
      name: s.name || '',
      phone: s.phone || '',
      vehicle_type: s.vehicle_type || '',
      status: s.status === '待跟进' ? 'pending' : s.status || 'pending',
      created_at: s.time ? new Date(s.time) : new Date(),
      meta: { imported_from_v3: true, original_id: s.id }
    });
    imported++;
  }

  console.log('[Sync] 完成！导入 ' + imported + ' / ' + submissions.length + ' 条线索');
  process.exit(0);
}

sync().catch(err => {
  console.error('[Sync] 失败:', err);
  process.exit(1);
});
