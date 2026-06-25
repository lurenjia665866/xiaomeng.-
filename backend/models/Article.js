const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * 文章模型 —— 新闻/资讯内容管理
 */
const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '文章标题'
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '文章摘要'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '文章内容 (HTML/纯文本)'
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '封面图片URL'
  },
  category: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '分类: news / guide / case / notice'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '标签列表'
  },
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否发布'
  },
  publish_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '发布日期'
  },
  author: {
    type: DataTypes.STRING(32),
    allowNull: true,
    comment: '作者'
  },
  sort_order: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    comment: '排序'
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '扩展信息 (如 SEO 关键词)'
  }
}, {
  tableName: 'articles',
  indexes: [
    { fields: ['category'] },
    { fields: ['published'] },
    { fields: ['publish_date'] }
  ]
});

module.exports = Article;
