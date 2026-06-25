const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 管理员账号模型
 * 支持多管理员，每人可分配不同的线索
 */
const AdminUser = sequelize.define('AdminUser', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password_hash: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '密码哈希'
  },
  real_name: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '真实姓名'
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'admin',
    comment: '角色: super_admin / admin / agent'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '联系电话'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息'
  }
}, {
  tableName: 'admin_users',
  indexes: [
    { fields: ['username'] }
  ]
});

module.exports = AdminUser;
