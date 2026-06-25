const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 资方产品模型 —— 多资方智能匹配
 * 每种产品有不同的准入条件（车龄、车况、额度范围）
 */
const LenderProduct = sequelize.define('LenderProduct', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  lender_name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '资方名称'
  },
  product_name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '产品名称'
  },
  product_code: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '产品编码'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },

  // === 准入条件 ===
  min_car_age: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 0,
    comment: '最小车龄'
  },
  max_car_age: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 15,
    comment: '最大车龄'
  },
  accept_full_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否接受全款车'
  },
  accept_mortgaging: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否接受按揭中'
  },
  accept_new_energy: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否接受新能源'
  },

  // === 额度利率 ===
  min_loan_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 30000,
    comment: '最低贷款额度'
  },
  max_loan_amount: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 1000000,
    comment: '最高贷款额度'
  },
  min_annual_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 3.85,
    comment: '最低年化利率(%)'
  },
  max_annual_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 23.99,
    comment: '最高年化利率(%)'
  },
  max_loan_ratio: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0.90,
    comment: '最高贷款成数 (90% = 0.90)'
  },
  max_term_months: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 60,
    comment: '最长贷款期限(月)'
  },

  // === 服务区域 ===
  service_cities: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '服务城市列表'
  },

  // === 扩展 ===
  sort_order: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '排序优先级'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息'
  }
}, {
  tableName: 'lender_products',
  indexes: [
    { fields: ['is_active'] },
    { fields: ['lender_name'] }
  ]
});

module.exports = LenderProduct;
