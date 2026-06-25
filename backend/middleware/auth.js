const jwt = require('jsonwebtoken');

/**
 * 管理后台认证中间件
 * 使用 JWT Token 验证管理员身份
 */
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未授权，请登录' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token 无效或已过期' });
  }
}

/**
 * 微信小程序认证中间件
 * 验证小程序的 wx-token
 */
function wxAuth(req, res, next) {
  const token = req.headers['x-wx-token'];
  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    req.openid = decoded.openid;
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: 'Token 无效' });
  }
}

module.exports = { adminAuth, wxAuth };
