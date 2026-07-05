/** 中文帮助文案中的英文代码/字段名 → 可读中文（长匹配优先） */
const ZH_HELP_TERM_REPLACEMENTS = [
  ['loadMin/loadMax', '载荷上下限'],
  ['enforceCriticalConfirm', '强制关键输入确认'],
  ['useAlphaTemperature', '启用温度相关线胀系数'],
  ['getCalcReviewStatus', '评审状态'],
  ['assessMcWorstGap', '蒙特卡洛与极值差距评估'],
  ['capabilityPassRateOk', '合格率达标指示'],
  ['capabilityCpkOk', 'Cpk 达标指示'],
  ['compare.bothPass', '双标准均通过'],
  ['releaseBlocked', '结果未放行'],
  ['confirmedFields', '已确认字段'],
  ['estimateOnly', '仅估算'],
  ['engagementPass', '旋合长度校核'],
  ['contactPass', '接触安全系数校核'],
  ['bendingPass', '弯曲安全系数校核'],
  ['tensilePass', '拉伸校核'],
  ['shearPass', '剪切校核'],
  ['goodmanPass', 'Goodman 修正校核'],
  ['becomesClearance', '变为间隙'],
  ['combinedPass', '组合校核'],
  ['flangePass', '法兰边校核'],
  ['radiusPass', '内半径校核'],
  ['extrusionPass', '挤隙校核'],
  ['thermalPass', '热膨胀校核'],
  ['pressurePass', '压力校核'],
  ['fatiguePass', '疲劳校核'],
  ['lengthPass', '长度校核'],
  ['staticPass', '静强度校核'],
  ['hoopPass', '环向应力校核'],
  ['speedPass', '速度校核'],
  ['tempPass', '耐温校核'],
  ['peakPass', '峰值校核'],
  ['lifePass', '寿命校核'],
  ['allPass', '全部通过'],
  ['stackAdvice', '尺寸链建议'],
  ['adviceKey', '建议键'],
  ['worstPass', '极值校核通过'],
  ['rssPass', 'RSS 校核通过'],
  ['passRate', '样本合格率'],
  ['ratingKey', '评级'],
  ['highRisk', '高风险'],
  ['defectCount', '缺陷数'],
  ['overall pass', '综合通过判定'],
  ['综合 pass', '综合通过判定'],
  ['单级 pass', '单级通过判定'],
  ['pass 恒为 false', '通过判定恒为否'],
  ['pass 恒 false', '通过判定恒为否'],
  ['pass=false', '通过判定=否'],
  ['pass=true', '通过判定=是'],
  ['pass 只看', '通过判定只看'],
  ['pass 主判据', '通过判定主依据'],
  ['pass 路径', '通过判定路径'],
  ['pass 混用', '通过判定混用'],
  ['pass 代替', '通过判定代替'],
  ['pass 不驱动', '通过判定不驱动'],
  ['不参与综合 pass', '不参与综合通过判定'],
  ['综合 pass', '综合通过判定'],
  ['**不是 bug**', '**并非程序错误**'],
  ['not a bug', '并非程序错误'],
  ['change 确认', '变更确认'],
  ['does not drive', '不驱动'],
  ['independent of', '与…无关'],
]

/**
 * @param {string|null|undefined} text
 * @param {'zh'|'en'} [locale='zh']
 */
export function normalizeHelpText(text, locale = 'zh') {
  if (locale !== 'zh' || text == null || text === '') return text ?? ''
  let out = String(text)
  for (const [from, to] of ZH_HELP_TERM_REPLACEMENTS) {
    out = out.split(from).join(to)
  }
  return out
}
