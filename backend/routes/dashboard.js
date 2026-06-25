const express = require('express');
const router = express.Router();
const { Lead } = require('../models');
const { adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const { LEAD_STATUSES, LEAD_STATUS_LABELS } = require('../config/constants');

/**
 * GET /api/dashboard/stats
 * 仪表盘统计数据
 */
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const total = await Lead.count();

    // 今日起始
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const today = await Lead.count({
      where: { created_at: { [Op.gte]: todayStart } }
    });

    const pending = await Lead.count({
      where: { status: 'pending' }
    });

    const contacted = await Lead.count({
      where: { status: 'contacted' }
    });

    const completed = await Lead.count({
      where: { status: { [Op.in]: ['approved', 'disbursed'] } }
    });

    // 各状态统计
    const statusCounts = {};
    for (const status of Object.values(LEAD_STATUSES)) {
      statusCounts[status] = await Lead.count({ where: { status } });
    }

    // 来源统计
    const sourceCounts = {};
    const sources = await Lead.findAll({
      attributes: ['source'],
      group: ['source']
    });
    for (const s of sources) {
      sourceCounts[s.source] = await Lead.count({ where: { source: s.source } });
    }

    // 近7日趋势
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Lead.count({
        where: {
          created_at: { [Op.gte]: date, [Op.lt]: nextDate }
        }
      });
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    res.json({
      total,
      today,
      pending,
      contacted,
      completed,
      statusCounts,
      sourceCounts,
      dailyStats
    });
  } catch (err) {
    console.error('[Dashboard] Stats error:', err);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

/**
 * GET /api/dashboard/recent
 * 最近线索（首页展示用）
 */
router.get('/recent', adminAuth, async (req, res) => {
  try {
    const leads = await Lead.findAll({
      order: [['created_at', 'DESC']],
      limit: 10
    });
    res.json(leads);
  } catch (err) {
    console.error('[Dashboard] Recent error:', err);
    res.status(500).json({ error: '获取最近线索失败' });
  }
});

module.exports = router;
