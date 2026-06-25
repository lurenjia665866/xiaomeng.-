const sequelize = require('../config/database');
const Lead = require('./Lead');
const AdminUser = require('./AdminUser');
const LenderProduct = require('./LenderProduct');
const Referral = require('./Referral');
const Reward = require('./Reward');
const SmsCode = require('./SmsCode');
const Article = require('./Article');
const PageContent = require('./PageContent');

// === 模型关联（后续会不断增加）===

// Lead - AdminUser: 线索分配给管理员
Lead.belongsTo(AdminUser, { as: 'assignee', foreignKey: 'assigned_to' });
AdminUser.hasMany(Lead, { as: 'assigned_leads', foreignKey: 'assigned_to' });

// Lead - LenderProduct: 线索匹配的资方产品
Lead.belongsTo(LenderProduct, { as: 'lender', foreignKey: 'lender_id' });
LenderProduct.hasMany(Lead, { as: 'leads', foreignKey: 'lender_id' });

// Referral - Lead
Referral.belongsTo(Lead, { as: 'referee_lead', foreignKey: 'referee_lead_id' });

module.exports = {
  sequelize,
  Lead,
  AdminUser,
  LenderProduct,
  Referral,
  Reward,
  SmsCode,
  Article,
  PageContent
};
