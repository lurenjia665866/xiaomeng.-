require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * 数据库配置
 * 默认使用 SQLite（零配置，文件存储）
 * 生产环境可切换为 MySQL（修改 .env 即可）
 */
const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_DIALECT === 'sqlite' ? (process.env.DB_STORAGE || './data/database.sqlite') : undefined,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'xiaomeng',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,      // 数据库字段使用下划线命名
    timestamps: true,       // 自动添加 createdAt / updatedAt
    paranoid: false         // 暂时不做软删除
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
