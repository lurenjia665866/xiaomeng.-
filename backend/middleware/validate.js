/**
 * 请求验证中间件
 * 后续可扩展更多验证规则
 */

// 手机号格式验证
function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone);
}

// 表单提交验证
function validateSubmit(req, res, next) {
  const { name, phone } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '请输入姓名' });
  }
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ error: '请输入正确的手机号' });
  }
  next();
}

// 小程序申请表单验证
function validateAppSubmit(req, res, next) {
  const { real_name, phone, car_brand } = req.body;
  if (!real_name || !real_name.trim()) {
    return res.status(400).json({ code: 400, message: '请输入姓名' });
  }
  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ code: 400, message: '请输入正确的手机号' });
  }
  if (!car_brand || !car_brand.trim()) {
    return res.status(400).json({ code: 400, message: '请选择车辆品牌' });
  }
  next();
}

module.exports = { validateSubmit, validateAppSubmit, isValidPhone };
