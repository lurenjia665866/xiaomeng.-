const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 短信验证码记录
 */
const SmsCode = sequelize.define('SmsCode', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '手机号'
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    comment: '验证码'
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已使用'
  },
  expire_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '过期时间'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息'
  }
}, {
  tableName: 'sms_codes',
  indexes: [
    { fields: ['phone'] },
    { fields: ['code'] }
  ]
});

module.exports = SmsCode;
