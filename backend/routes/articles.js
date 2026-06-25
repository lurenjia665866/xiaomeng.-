const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const { adminAuth } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * GET /api/articles
 * 获取文章列表（公开 - 只显示已发布）
 */
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, pageSize = 10 } = req.query;
    const where = { published: true };
    if (category) where.category = category;

    const { count, rows } = await Article.findAndCountAll({
      where,
      order: [['publish_date', 'DESC'], ['sort_order', 'ASC']],
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      limit: parseInt(pageSize)
    });

    res.json({ total: count, page: parseInt(page), pageSize: parseInt(pageSize), data: rows });
  } catch (err) {
    console.error('[Articles] List error:', err);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

/**
 * GET /api/articles/:id
 * 获取文章详情
 */
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: '文章不存在' });
    res.json(article);
  } catch (err) {
    console.error('[Articles] Get error:', err);
    res.status(500).json({ error: '获取文章失败' });
  }
});

/**
 * POST /api/articles
 * 创建文章（管理员）
 */
router.post('/', adminAuth, async (req, res) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      summary: req.body.summary || null,
      content: req.body.content || null,
      cover_image: req.body.cover_image || null,
      category: req.body.category || null,
      tags: req.body.tags || null,
      published: req.body.published !== false,
      publish_date: req.body.publish_date || new Date().toISOString().split('T')[0],
      author: req.body.author || null,
      sort_order: req.body.sort_order || 0,
      meta: req.body.meta || null
    });
    res.json(article);
  } catch (err) {
    console.error('[Articles] Create error:', err);
    res.status(500).json({ error: '创建文章失败' });
  }
});

/**
 * PUT /api/articles/:id
 * 更新文章（管理员）
 */
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: '文章不存在' });

    const updatable = ['title', 'summary', 'content', 'cover_image', 'category', 'tags', 'published', 'publish_date', 'author', 'sort_order', 'meta'];
    for (const field of updatable) {
      if (req.body[field] !== undefined) article[field] = req.body[field];
    }

    await article.save();
    res.json(article);
  } catch (err) {
    console.error('[Articles] Update error:', err);
    res.status(500).json({ error: '更新文章失败' });
  }
});

/**
 * DELETE /api/articles/:id
 * 删除文章（管理员）
 */
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ error: '文章不存在' });
    await article.destroy();
    res.json({ message: '已删除' });
  } catch (err) {
    console.error('[Articles] Delete error:', err);
    res.status(500).json({ error: '删除文章失败' });
  }
});

module.exports = router;
