const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AdminUser } = require('../models');
const { adminAuth } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * 管理后台登录（兼容旧版密码验证）
 */
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;

    // 兼容旧版：先验证 .env 中的 ADMIN_PASSWORD
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword && password === envPassword) {
      const token = jwt.sign(
        { username: 'admin', role: 'super_admin' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );
      return res.json({ token, message: '登录成功' });
    }

    // 新版：数据库中的多管理员验证
    const admin = await AdminUser.findOne({
      where: { username: 'admin', is_active: true }
    });

    if (!admin) {
      // 如果数据库中无管理员，用 env 密码兜底
      return res.status(401).json({ error: '密码错误' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (hash !== admin.password_hash) {
      return res.status(401).json({ error: '密码错误' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    // 更新最后登录时间
    admin.last_login = new Date();
    await admin.save();

    res.json({ token, admin: { username: admin.username, real_name: admin.real_name, role: admin.role } });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: '登录失败' });
  }
});

/**
 * GET /api/auth/me
 * 获取当前登录管理员信息
 */
router.get('/me', adminAuth, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
