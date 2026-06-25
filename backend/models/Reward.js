const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 奖励模型 —— 用户可获得的福利
 * 通过邀请达到一定人数自动解锁
 */
const Reward = sequelize.define('Reward', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  openid: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '获得奖励的用户 openid'
  },
  reward_type: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '奖励类型: interest_discount / gift / credit_upgrade'
  },
  reward_name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: '奖励名称'
  },
  reward_desc: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '奖励描述'
  },
  rule_trigger: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '触发规则: invite_2 / invite_5 / invite_10'
  },
  claimed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已领取'
  },
  claimed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '领取时间'
  },
  expire_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '过期时间'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息'
  }
}, {
  tableName: 'rewards',
  indexes: [
    { fields: ['openid'] },
    { fields: ['rule_trigger'] }
  ]
});

module.exports = Reward;
