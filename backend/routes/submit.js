const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Lead } = require('../models');
const { validateSubmit, validateAppSubmit } = require('../middleware/validate');

/**
 * 生成唯一客户编号
 * 格式: XM + 时间戳36进制 + 随机4字符
 */
function genUniqueId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `XM${ts}${rand}`;
}

/**
 * POST /api/submit
 * 官网 / 落地页表单提交（轻量字段）
 * body: { name, phone, vehicle_type, source }
 */
router.post('/', validateSubmit, async (req, res) => {
  try {
    const { name, phone, vehicle_type, source } = req.body;

    const lead = await Lead.create({
      unique_id: genUniqueId(),
      source: source || '网站',
      name,
      phone,
      vehicle_type: vehicle_type || '未选择',
      status: 'pending'
    });

    res.json({
      message: '提交成功',
      data: { id: lead.id, unique_id: lead.unique_id }
    });
  } catch (err) {
    console.error('[Submit] Error:', err);
    res.status(500).json({ error: '提交失败，请稍后再试' });
  }
});

/**
 * POST /api/leads/submit
 * 小程序端完整申请表单
 * body: { openid, referrer_openid, real_name, id_card, phone, city,
 *         car_brand, car_model, car_year, vehicle_status,
 *         estimated_value, vin_code, source }
 */
router.post('/app', validateAppSubmit, async (req, res) => {
  try {
    const {
      openid, referrer_openid, real_name, id_card, phone, city,
      car_brand, car_model, car_year, vehicle_status,
      estimated_value, vin_code, source
    } = req.body;

    // 检查是否已存在同 openid 的待处理申请
    if (openid) {
      const existing = await Lead.findOne({
        where: {
          openid,
          status: ['pending', 'contacted', 'negotiating']
        }
      });
      if (existing) {
        return res.json({
          code: 0,
          message: '您已提交过申请，客户经理会尽快联系您',
          data: { unique_id: existing.unique_id }
        });
      }
    }

    const lead = await Lead.create({
      unique_id: genUniqueId(),
      source: source || '小程序',
      openid: openid || null,
      referrer_openid: referrer_openid || null,
      real_name,
      id_card: id_card || null,
      name: real_name,
      phone,
      city: city || null,
      car_brand: car_brand || null,
      car_model: car_model || null,
      car_year: car_year || null,
      vehicle_status: vehicle_status || null,
      estimated_value: estimated_value || null,
      vin_code: vin_code || null,
      status: 'pending'
    });

    res.json({
      code: 0,
      message: '资料已提交，客户经理将在1小时内联系您',
      data: {
        unique_id: lead.unique_id,
        id: lead.id
      }
    });
  } catch (err) {
    console.error('[Submit-App] Error:', err);
    res.status(500).json({ code: 500, message: '提交失败，请稍后再试' });
  }
});

module.exports = router;
