/**
 * 全局常量配置
 * 所有枚举值、状态列表、配置常量集中在此，方便后续扩展
 */

// 线索来源
const LEAD_SOURCES = {
  WEBSITE: '网站',
  LANDING: '落地页',
  MINI_PROGRAM: '小程序',
  MANUAL: '手动录入'
};

// 车辆状态
const VEHICLE_STATUSES = {
  FULL_PAID: 'full_paid',
  MORTGAGING: 'mortgaging',
  MORTGAGE_PAID: 'mortgage_paid'
};

const VEHICLE_STATUS_LABELS = {
  [VEHICLE_STATUSES.FULL_PAID]: '全款车',
  [VEHICLE_STATUSES.MORTGAGING]: '按揭中',
  [VEHICLE_STATUSES.MORTGAGE_PAID]: '按揭已还完'
};

// 线索跟进状态
const LEAD_STATUSES = {
  PENDING: 'pending',           // 待跟进
  CONTACTED: 'contacted',       // 已联系
  NEGOTIATING: 'negotiating',   // 洽谈中
  INSPECTING: 'inspecting',     // 验车中
  APPROVED: 'approved',         // 已审批
  DISBURSED: 'disbursed',       // 已放款
  REJECTED: 'rejected'          // 已拒绝
};

const LEAD_STATUS_LABELS = {
  [LEAD_STATUSES.PENDING]: '待跟进',
  [LEAD_STATUSES.CONTACTED]: '已联系',
  [LEAD_STATUSES.NEGOTIATING]: '洽谈中',
  [LEAD_STATUSES.INSPECTING]: '验车中',
  [LEAD_STATUSES.APPROVED]: '已审批',
  [LEAD_STATUSES.DISBURSED]: '已放款',
  [LEAD_STATUSES.REJECTED]: '已拒绝'
};

// 奖励规则
const REWARD_RULES = [
  { trigger: 'invite_2', count: 2, type: 'interest_discount', name: '利息抵扣券', desc: '邀请2人提交申请，享贷款利息9折优惠' },
  { trigger: 'invite_5', count: 5, type: 'gift', name: '实用礼品', desc: '邀请5人提交申请，可获得50元油卡/行车记录仪' },
  { trigger: 'invite_10', count: 10, type: 'credit_upgrade', name: '额度提升', desc: '邀请10人提交申请，贷款预审额度提升20%' }
];

// 综合年化利率区间
const RATE_RANGE = '3.85%-23.99%';
const RATE_DISPLAY = '3.85% - 23.99%';

module.exports = {
  LEAD_SOURCES,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  REWARD_RULES,
  RATE_RANGE,
  RATE_DISPLAY
};
