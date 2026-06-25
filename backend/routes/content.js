const express = require('express');
const router = express.Router();
const { PageContent } = require('../models');
const { adminAuth } = require('../middleware/auth');

/**
 * GET /api/content
 * 获取所有内容区块（公开）
 */
router.get('/', async (req, res) => {
  try {
    const contents = await PageContent.findAll({
      where: { is_active: true },
      order: [['page', 'ASC'], ['sort_order', 'ASC']]
    });

    // 按 page 分组
    const grouped = {};
    for (const c of contents) {
      if (!grouped[c.page]) grouped[c.page] = {};
      grouped[c.page][c.section] = c.content || c.title;
    }

    res.json(grouped);
  } catch (err) {
    console.error('[Content] Get error:', err);
    res.status(500).json({ error: '获取内容失败' });
  }
});

/**
 * GET /api/content/:page
 * 获取某个页面的所有区块
 */
router.get('/:page', async (req, res) => {
  try {
    const contents = await PageContent.findAll({
      where: { page: req.params.page, is_active: true },
      order: [['sort_order', 'ASC']]
    });

    const grouped = {};
    for (const c of contents) {
      grouped[c.section] = {
        id: c.id,
        title: c.title,
        content: c.content
      };
    }

    res.json(grouped);
  } catch (err) {
    console.error('[Content] Get page error:', err);
    res.status(500).json({ error: '获取页面内容失败' });
  }
});

/**
 * PUT /api/content/:id
 * 更新内容区块（管理员）
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const content = await PageContent.findByPk(req.params.id);
    if (!content) return res.status(404).json({ error: '内容不存在' });

    if (req.body.title) content.title = req.body.title;
    if (req.body.content) content.content = req.body.content;
    if (req.body.sort_order !== undefined) content.sort_order = req.body.sort_order;
    if (req.body.is_active !== undefined) content.is_active = req.body.is_active;

    await content.save();
    res.json({ message: '内容已更新', data: content });
  } catch (err) {
    console.error('[Content] Update error:', err);
    res.status(500).json({ error: '更新内容失败' });
  }
});

module.exports = router;
