const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 裂变推荐记录 —— 追踪邀请关系
 * 谁邀请了谁，关联哪个线索
 */
const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  referrer_openid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '邀请人 openid'
  },
  referee_openid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '被邀请人 openid'
  },
  referee_lead_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    comment: '被邀请人的线索ID'
  },
  rewarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已触发奖励'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息'
  }
}, {
  tableName: 'referrals',
  indexes: [
    { fields: ['referrer_openid'] },
    { fields: ['referee_openid'] }
  ]
});

module.exports = Referral;
