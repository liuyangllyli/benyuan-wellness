/**
 * 测评与档案相关文案集中，便于统一修改与后续多语言
 */

export const assessmentCopy = {
  /** 弹窗 */
  modalTitle: '温馨提示',
  modalCancel: '暂不填写',
  modalConfirm: '继续填写',

  /** 测评内「查看档案」 */
  viewProfile: '查看完整档案',
  viewProfileHint: '已有档案？查看完整档案',

  /** 体质第37/38题 */
  constitutionNoGenderHint:
    '未选择性别时两道题均需作答；若已在基本信息中填写性别，另一道将自动跳过。',
  constitutionSkipFemale: '本题限女性回答，您已选男性，本题无需填写',
  constitutionSkipMale: '本题限男性回答，您已选女性，本题无需填写',

  /** 身体测试弹窗（动态部分在 assessment 内拼装） */
  bodyTestAgeCompanionNoRange:
    '您选择的年龄段建议在家人陪同下进行线上练习。是否继续填写身体测评？',
  bodyTestAgeCompanionWithRange: (label: string) =>
    `您此前选择的年龄段为「${label}」，建议在家人陪同下进行线上练习。是否继续填写身体测评？`,
  bodyTestDefault:
    '根据您填写的情况，身体测试不建议进行。您也可以选择继续填写，结果仅供参考。',
  bodyTestReasonSpecial: (labels: string) =>
    `您此前在基本信息中选择了「${labels}」`,
  bodyTestReasonAge: (label: string) => `年龄段为「${label}」`,
  bodyTestAdviceBase: '根据该情况，身体测试不建议进行。',
  bodyTestAdviceAge: '若继续填写，建议在家人陪同下进行。',
  bodyTestAdviceEnd: '您也可以选择继续填写，结果仅供参考。',

  /** 结果页 */
  returnHome: '返回首页',
}

export const profileCopy = {
  /** 档案页顶部 */
  heroDescFilled: '可单独编辑任一块，或继续完成未填部分',
  heroDescEmpty: '分三步完成（基本信息 → 体质 → 身体测试），可随时保存',
  heroDescEmptyTip: '约 9 分钟完成三步，结果可随时在档案中查看',

  /** 摘要块 */
  blocksTitle: '完整测评摘要',
  blockEdit: '编辑',
  blockEmptyHint: '尚未填写，点击「编辑」填写',

  /** 测评历史 */
  historyTitle: '测评历史',
  historyRecords: (n: number) => `${n} 条记录`,
  historyToggleView: '查看',
  historyToggleCollapse: '收起',
  historyDetail: '查看详情 ›',
  historyEmpty: '暂无测评历史',

  /** 开始按钮 */
  startFromBasic: '从基本信息开始',
  startConstitution: '继续：体质测评',
  startBodyTest: '继续：身体测试',
  startContinue: '继续测评',
  startFull: '去测评',

  /** 历史类型 */
  typeBasicInfo: '基本信息',
  typeConstitution: '体质测评',
  typeBodyTest: '身体测试',

  /** 详情页 */
  detailNotFound: '未找到该记录',
  back: '返回',
  backProfile: '返回档案',

  /** 错误与空状态 */
  loadError: '加载失败，请重试',
}
