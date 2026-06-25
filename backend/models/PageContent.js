const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 页面内容模型 —— 整站内容管理
 * 所有页面的 hero、产品介绍、优势、FAQ 等区块都存储在这里
 * 支持 SEO 配置
 */
const PageContent = sequelize.define('PageContent', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  page: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '页面标识: index / landing / about / etc.'
  },
  section: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '区块标识: hero / products / advantages / faq / seo / etc.'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '区块标题'
  },
  content: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '区块内容 (结构化 JSON)'
  },
  sort_order: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '排序'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息'
  }
}, {
  tableName: 'page_contents',
  indexes: [
    { fields: ['page', 'section'] }
  ]
});

module.exports = PageContent;
