const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 线索模型 —— 统一所有来源的客户信息
 *
 * 字段设计预留了大量扩展空间：
 * - meta: JSON 字段，可存放任意自定义属性
 * - extra_*: 预留的常用扩展字段
 * - 后续可加字段无需改表结构，直接写 meta
 */
const Lead = sequelize.define('Lead', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },

  // === 线索标识 ===
  unique_id: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '唯一客户编号'
  },
  source: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '网站',
    comment: '来源：网站/落地页/小程序/手动录入'
  },

  // === 基本信息 ===
  name: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  vehicle_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '车辆类型 (全款车/按揭车) - 主要用于网站表单'
  },

  // === 小程序/详细申请信息 ===
  openid: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '微信小程序 openid'
  },
  referrer_openid: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '邀请人 openid（裂变）'
  },
  real_name: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '真实姓名（小程序端）'
  },
  id_card: {
    type: DataTypes.STRING(18),
    allowNull: true,
    comment: '身份证号'
  },
  city: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '所在城市'
  },
  car_brand: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '车辆品牌'
  },
  car_model: {
    type: DataTypes.STRING(64),
    allowNull: true,
    comment: '车辆型号'
  },
  car_year: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '上牌年份'
  },
  car_age: {
    type: DataTypes.DECIMAL(4, 1),
    allowNull: true,
    comment: '车龄（年）'
  },
  vehicle_status: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '车辆状态: full_paid/mortgaging/mortgage_paid'
  },
  estimated_value: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '车辆估值（元）'
  },
  vin_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '车架号后6位'
  },

  // === 跟进状态 ===
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    comment: '状态: pending/contacted/negotiating/inspecting/approved/disbursed/rejected'
  },
  assigned_to: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '分配给哪位客服/经理'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '跟进备注'
  },
  follow_up_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '下次跟进时间'
  },
  call_record: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '通话记录（JSON 数组）'
  },

  // === 金融信息 ===
  lender_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '匹配资方ID'
  },
  estimate_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '预估额度'
  },
  actual_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: '实际放款额度'
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: '实际利率(%)'
  },
  loan_term: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '贷款期限(月)'
  },

  // === 裂变与奖励 ===
  invite_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '邀请人数'
  },
  rewards_earned: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '已获得奖励列表'
  },

  // === 扩展字段（灵活使用）===
  extra_1: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '预留扩展字段1'
  },
  extra_2: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '预留扩展字段2'
  },
  extra_3: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '预留扩展字段3 (大文本)'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '任意扩展元数据 (JSON)'
  }

}, {
  tableName: 'leads',
  indexes: [
    { fields: ['phone'] },
    { fields: ['source'] },
    { fields: ['status'] },
    { fields: ['openid'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Lead;
