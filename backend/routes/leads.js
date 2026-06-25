const express = require('express');
const router = express.Router();
const { Lead, LenderProduct, AdminUser } = require('../models');
const { adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * GET /api/leads
 * 获取线索列表（分页、筛选、搜索）
 * query: page, pageSize, status, source, keyword, startDate, endDate
 */
router.get('/', adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      source,
      keyword,
      startDate,
      endDate
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (source) where.source = source;

    // 关键词搜索（姓名 / 手机号）
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { real_name: { [Op.like]: `%${keyword}%` } },
        { unique_id: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 时间范围筛选
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate + 'T23:59:59');
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        { model: LenderProduct, as: 'lender', attributes: ['id', 'lender_name', 'product_name'] },
        { model: AdminUser, as: 'assignee', attributes: ['id', 'real_name', 'username'] }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      total: count,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize)),
      data: rows
    });
  } catch (err) {
    console.error('[Leads] List error:', err);
    res.status(500).json({ error: '获取线索列表失败' });
  }
});

/**
 * GET /api/leads/:id
 * 获取单条线索详情
 */
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id, {
      include: [
        { model: LenderProduct, as: 'lender' },
        { model: AdminUser, as: 'assignee', attributes: ['id', 'real_name', 'username', 'phone'] }
      ]
    });
    if (!lead) return res.status(404).json({ error: '线索不存在' });
    res.json(lead);
  } catch (err) {
    console.error('[Leads] Get error:', err);
    res.status(500).json({ error: '获取线索详情失败' });
  }
});

/**
 * PUT /api/leads/:id
 * 更新线索状态 / 分配 / 备注
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: '线索不存在' });

    const updatableFields = [
      'status', 'assigned_to', 'remark', 'follow_up_time',
      'actual_amount', 'interest_rate', 'loan_term',
      'extra_1', 'extra_2', 'extra_3', 'meta'
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    }

    // 如果分配了人，记录日志（后续扩展）
    if (req.body.assigned_to) {
      lead.assigned_to = req.body.assigned_to;
    }

    await lead.save();
    res.json({ message: '更新成功', data: lead });
  } catch (err) {
    console.error('[Leads] Update error:', err);
    res.status(500).json({ error: '更新失败' });
  }
});

/**
 * DELETE /api/leads/:id
 * 删除线索（软删除/硬删除待实现）
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: '线索不存在' });

    await lead.destroy();
    res.json({ message: '已删除' });
  } catch (err) {
    console.error('[Leads] Delete error:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

module.exports = router;
