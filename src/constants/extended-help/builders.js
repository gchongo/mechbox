/** @param {'zh'|'en'} locale @param {Record<string, object>} map */
export function pickLocale(locale, map) {
  return map[locale === 'en' ? 'en' : 'zh']
}

/** 三档 calcMode 通用行 */
export function stdCalcModes(locale, { simpleModel, completeModel, proModel, simplePass, completePass, proPass, simpleCaveat, completeCaveat, proCaveat }) {
  const L = locale === 'en'
  return [
    { mode: L ? 'Simplified' : '简化', model: simpleModel, passRule: simplePass ?? (L ? '**pass always false** (estimateOnly)' : '**pass 恒为 false**（estimateOnly）'), caveat: simpleCaveat ?? (L ? 'Magnitude only' : '仅看数量级') },
    { mode: L ? 'Full' : '完整', model: completeModel, passRule: completePass, caveat: completeCaveat },
    { mode: L ? 'Professional' : '专业', model: proModel, passRule: proPass, caveat: proCaveat },
  ]
}

export function faqBlock(title, rows) {
  return { type: 'faq', title, rows }
}

export function limitsBlock(title, items) {
  return { type: 'limitations', title, items }
}

export function examplesBlock(title, rows, subtitle) {
  return { type: 'examples', title, subtitle, rows }
}

export function passBlock(title, rows, subtitle) {
  return { type: 'passChecks', title, subtitle, rows }
}

export function formulasBlock(title, items, subtitle) {
  return { type: 'formulas', title, subtitle, items }
}

export function modesBlock(title, rows, subtitle) {
  return { type: 'modes', title, subtitle, rows }
}

export function guideBlock(title, opts = {}) {
  return { type: 'guide', title, ...opts }
}

export function howToPassBlock(title, items, columns = 3) {
  return { type: 'howToPass', title, items, columns }
}

export function standardsBlock(title, items, intro) {
  return { type: 'standards', title, intro, items }
}
