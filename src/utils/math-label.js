/**
 * 将 UI 字符串中的工程符号转为 MathContent 可解析的 $...$ LaTeX 片段
 * 已含 $ 的片段保留；其余文本经替换表 + 自动规则补全 LaTeX
 */

const REPLACEMENTS = [
  // 公式短语（术语表 symbol、编辑器提示等）
  ['T=6√(Σ(Tᵢ/Kᵢ)²)', '$T=6\\sqrt{\\sum (T_i/K_i)^2}$'],
  ['T=k·√ΣTᵢ²', '$T=k\\sqrt{\\sum T_i^2}$'],
  ['T=√ΣTᵢ²', '$T=\\sqrt{\\sum T_i^2}$'],
  ['T=ΣTᵢ', '$T=\\sum T_i$'],
  ['σ水平', '$\\sigma_{\\text{水平}}$'],
  ['L₁…Lₙ', '$L_1 \\ldots L_n$'],
  ['F_i = F/n + M×r/I_p', '$F_i = F/n + M \\times r / I_p$'],
  ['F_i = F/n + M*r/I_p', '$F_i = F/n + M \\times r / I_p$'],
  ['F_M', '$F_M$'],
  ['F_V', '$F_V$'],
  ['F_A', '$F_A$'],
  ['F_Z', '$F_Z$'],
  ['F_Kerf', '$F_{\\mathrm{Kerf}}$'],
  ['F_Mmin', '$F_{M\\mathrm{min}}$'],
  ['F_Mmax', '$F_{M\\mathrm{max}}$'],
  ['F_Ax', '$F_{\\mathrm{Ax}}$'],
  ['F_Q', '$F_Q$'],
  ['F_KR', '$F_{KR}$'],
  ['F_S', '$F_S$'],
  ['ΔF_VT', '$\\Delta F_{VT}$'],
  ['σs', '$\\sigma_s$'],
  ['l_K', '$l_K$'],
  ['h_f', '$h_f$'],
  ['T = μFRn', '$T = \\mu F R n$'],
  ['T = K·F·d', '$T = K \\cdot F \\cdot d$'],
  ['T=μdF', '$T = \\mu d F$'],
  ['P = X·Fr + Y·Fa', '$P = X \\cdot F_r + Y \\cdot F_a$'],
  ['μ_G/μ_K', '$\\mu_G / \\mu_K$'],
  ['μ_G、μ_K、D_km', '$\\mu_G$、$\\mu_K$、$D_{km}$'],
  ['μ_G, μ_K, D_km', '$\\mu_G$, $\\mu_K$, $D_{km}$'],
  ['σ_S', '$\\sigma_S$'],
  ['σ_M', '$\\sigma_M$'],
  ['μ_T', '$\\mu_T$'],
  ['d_W', '$d_W$'],
  ['p_max', '$p_{\\max}$'],
  ['m_eff', '$m_{\\mathrm{eff}}$'],
  ['μ_G', '$\\mu_G$'],
  ['μ_K', '$\\mu_K$'],
  ['k_S', '$k_S$'],
  ['k_P', '$k_P$'],
  ['f_Z', '$f_Z$'],
  ['A_s', '$A_s$'],
  ['D_km', '$D_{km}$'],
  ['d₂', '$d_2$'],
  ['d_2', '$d_2$'],
  ['mm²', '$\\mathrm{mm}^{2}$'],
  ['cm²', '$\\mathrm{cm}^{2}$'],
  ['m²', '$\\mathrm{m}^{2}$'],
  ['km²', '$\\mathrm{km}^{2}$'],
  ['in²', '$\\mathrm{in}^{2}$'],
  ['ft²', '$\\mathrm{ft}^{2}$'],
  ['yd²', '$\\mathrm{yd}^{2}$'],
  ['mi²', '$\\mathrm{mi}^{2}$'],
  ['mm³', '$\\mathrm{mm}^{3}$'],
  ['cm³', '$\\mathrm{cm}^{3}$'],
  ['m³', '$\\mathrm{m}^{3}$'],
  ['in³', '$\\mathrm{in}^{3}$'],
  ['ft³', '$\\mathrm{ft}^{3}$'],
  ['g/cm³', '$\\mathrm{g/cm}^{3}$'],
  ['kg/m³', '$\\mathrm{kg/m}^{3}$'],
  ['lb/in³', '$\\mathrm{lb/in}^{3}$'],
  ['lb/ft³', '$\\mathrm{lb/ft}^{3}$'],
  ['N/mm²', '$\\mathrm{N/mm}^{2}$'],
  ['N·m', '$\\mathrm{N \\cdot m}$'],
  ['N·mm', '$\\mathrm{N \\cdot mm}$'],
  ['N/mm', '$\\mathrm{N/mm}$'],
  // 统计 / 公差缩写
  ['X̿', '$\\bar{X}$'],
  ['X̄', '$\\bar{X}$'],
  ['R̄', '$\\bar{R}$'],
  // 复合符号（长匹配优先）
  ['σ_eq', '$\\sigma_{eq}$'],
  ['σ_cr', '$\\sigma_{cr}$'],
  ['σ_op', '$\\sigma_{op}$'],
  ['σ_seat', '$\\sigma_{seat}$'],
  ['σ_c', '$\\sigma_c$'],
  ['σc', '$\\sigma_c$'],
  ['σt', '$\\sigma_t$'],
  ['σ₋₁', '$\\sigma_{-1}$'],
  ['τ_a', '$\\tau_a$'],
  ['S_a', '$S_a$'],
  ['S-N', '$S$-$N$'],
  ['m_eff', '$m_{eff}$'],
  ['D_km · μ_K', '$D_{km} \\cdot \\mu_K$'],
  ['D_stock', '$D_{\\mathrm{stock}}$'],
  ['D_o', '$D_o$'],
  ['D_i', '$D_i$'],
  ['HRC_surface', '$HRC_{\\mathrm{surface}}$'],
  ['f_exc', '$f_{\\mathrm{exc}}$'],
  ['F_r', '$F_r$'],
  ['F_a', '$F_a$'],
  ['F_a1', '$F_{a1}$'],
  ['F_t1', '$F_{t1}$'],
  ['F_t2', '$F_{t2}$'],
  ['F_x', '$F_x$'],
  ['F_y', '$F_y$'],
  ['F^+', '$F^+$'],
  ['Fx', '$F_x$'],
  ['Fy', '$F_y$'],
  ['D₁', '$D_1$'],
  ['D₂', '$D_2$'],
  ['z₁', '$z_1$'],
  ['z₂', '$z_2$'],
  ['d₁', '$d_1$'],
  ['d₂', '$d_2$'],
  ['σ = T/K', '$\\sigma = T/K$'],
  ['σ_H', '$\\sigma_H$'],
  ['σ_F', '$\\sigma_F$'],
  ['σ_M', '$\\sigma_M$'],
  ['σ_b', '$\\sigma_b$'],
  ['σ_s', '$\\sigma_s$'],
  ['d_h', '$d_h$'],
  ['d_W', '$d_W$'],
  ['L_K', '$L_K$'],
  ['f_Z', '$f_Z$'],
  ['k_S', '$k_S$'],
  ['k_P', '$k_P$'],
  ['d_cs', '$d_{cs}$'],
  ['d_g', '$d_g$'],
  ['ε_c', '$\\varepsilon_c$'],
  ['ε_s', '$\\varepsilon_s$'],
  ['Δd', '$\\Delta d$'],

  ['D_A', '$D_A$'],
  ['KHbeta', '$K_{H\\beta}$'],
  ['KHalpha', '$K_{H\\alpha}$'],
  ['KFbeta', '$K_{F\\beta}$'],
  ['KFalpha', '$K_{F\\alpha}$'],
  ['YF', '$Y_F$'],
  ['YS', '$Y_S$'],
  ['ZH', '$Z_H$'],
  ['ZE', '$Z_E$'],
  ['Zepsilon', '$Z_\\varepsilon$'],
  ['Zbeta', '$Z_\\beta$'],
  ['ZB', '$Z_B$'],
  ['KA', '$K_A$'],
  ['KV', '$K_V$'],
  ['Cp', '$C_p$'],
  ['d_2', '$d_2$'],
  ['D_km', '$D_{km}$'],
  ['μ_G', '$\\mu_G$'],
  ['μ_K', '$\\mu_K$'],
  ['μ_T', '$\\mu_T$'],
  ['K_τ', '$K_\\tau$'],
  ['K_t', '$K_t$'],
  ['εα', '$\\varepsilon_\\alpha$'],
  ['Sac/σc', '$S_{ac}/\\sigma_c$'],
  ['Sat/σt', '$S_{at}/\\sigma_t$'],
  ['L₁₀', '$L_{10}$'],
  ['C₀', '$C_0$'],
  ['S₀', '$S_0$'],
  ['P₀', '$P_0$'],
  ['F₀', '$F_0$'],
  ['dn', '$dn$'],
  ['F_e', '$F_e$'],
  ['F_inst', '$F_{\\mathrm{inst}}$'],
  ['L_p', '$L_p$'],
  ['a₁', '$a_1$'],
  ['a₂', '$a_2$'],
  ['α₁', '$\\alpha_1$'],
  ['α₂', '$\\alpha_2$'],
  ['x₁', '$x_1$'],
  ['x₂', '$x_2$'],
  ['L₀', '$L_0$'],
  ['L₁', '$L_1$'],
  ['F₁', '$F_1$'],
  ['F₂', '$F_2$'],
  ['ΔL₁', '$\\Delta L_1$'],
  ['ΔT', '$\\Delta T$'],
  ['ΔL', '$\\Delta L$'],
  ['Δi', '$\\Delta i$'],
  ['Δτ', '$\\Delta \\tau$'],
  ['Δσ_C', '$\\Delta\\sigma_C$'],
  ['ΔσC', '$\\Delta\\sigma_C$'],
  ['k_θ', '$k_{\\theta}$'],
  ['μ_e', '$\\mu_e$'],
  ['K_i', '$K_i$'],
  ['Fmin/Fmax', '$F_{\\mathrm{min}}/F_{\\mathrm{max}}$'],
  ['F_min/F_max', '$F_{\\mathrm{min}}/F_{\\mathrm{max}}$'],
  ['Fmin', '$F_{\\mathrm{min}}$'],
  ['Fmax', '$F_{\\mathrm{max}}$'],
  ['10⁴', '$10^{4}$'],
  ['10⁷', '$10^{7}$'],
  ['N·mm/rad', '$\\mathrm{N\\cdot mm/rad}$'],
  ['A_s', '$A_s$'],
  ['6σ', '$6\\sigma$'],
  ['6σ RSS', '$6\\sigma$ RSS'],
  ['±3σ', '$\\pm 3\\sigma$'],
  ['Φ', '$\\Phi$'],
  ['99.73%', '99.73\\%'],
  ['N·m', '$\\mathrm{N \\cdot m}$'],
  ['N·mm', '$\\mathrm{N \\cdot mm}$'],
  ['×10⁻⁶', '$\\times 10^{-6}$'],
  ['b×h', '$b \\times h$'],
  ['N (log)', '$N$ (log)'],
  // 单字符希腊/拉丁（靠后，避免误伤）
  ['μ', '$\\mu$'],
  ['σ', '$\\sigma$'],
  ['τ', '$\\tau$'],
  ['θ', '$\\theta$'],
  ['γ', '$\\gamma$'],
  ['δ', '$\\delta$'],
  ['Δ', '$\\Delta$'],
  ['ε', '$\\varepsilon$'],
  ['α', '$\\alpha$'],
  ['β', '$\\beta$'],
  ['ν', '$\\nu$'],
  ['π', '$\\pi$'],
  ['ρ', '$\\rho$'],
]

/** 长匹配优先，避免 F_i 等子串被提前替换破坏整段公式 */
const SORTED_REPLACEMENTS = [...REPLACEMENTS].sort((a, b) => b[0].length - a[0].length)

function normalizeEngineeringText(text) {
  return String(text)
    .replace(/\u00d7/g, '×')
    .replace(/\u2212/g, '-')
    .replace(/(\d)\s*[xX]\s*([A-Za-z_/])/g, '$1×$2')
}

const GREEK_SUB = {
  alpha: '\\alpha',
  beta: '\\beta',
  epsilon: '\\varepsilon',
  mu: '\\mu',
  sigma: '\\sigma',
  tau: '\\tau',
  theta: '\\theta',
  nu: '\\nu',
}

/** 尺寸链步骤 4 公式摘要 — 完整 LaTeX */
export const STACK_METHOD_FORMULA_HINT_ZH =
  '极值法：$T=\\sum T_i$ · RSS：$T=\\sqrt{\\sum T_i^2}$ · 修正 RSS：$T=k\\sqrt{\\sum T_i^2}$ · $6\\sigma$：$T=6\\sqrt{\\sum (T_i/K_i)^2}$'

export const STACK_METHOD_FORMULA_HINT_EN =
  'Worst case: $T=\\sum T_i$ · RSS: $T=\\sqrt{\\sum T_i^2}$ · Modified RSS: $T=k\\sqrt{\\sum T_i^2}$ · $6\\sigma$: $T=6\\sqrt{\\sum (T_i/K_i)^2}$'

function splitMathSegments(text) {
  const segments = []
  const regex = /\$([^$]+)\$/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ math: false, content: text.slice(lastIndex, match.index) })
    }
    segments.push({ math: true, content: `$${match[1]}$` })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    segments.push({ math: false, content: text.slice(lastIndex) })
  }
  if (!segments.length) {
    segments.push({ math: false, content: text })
  }
  return segments
}

function formatSubscriptPart(sub) {
  if (GREEK_SUB[sub]) return `{${GREEK_SUB[sub]}}`
  if (/^\d+$/.test(sub)) return sub
  if (sub.length === 1) return sub
  return `{${sub}}`
}

/** 将工程标识符转为行内 LaTeX */
export function identToLatex(ident) {
  if (!ident) return ident
  const unders = ident.indexOf('_')
  if (unders >= 0) {
    const base = ident.slice(0, unders)
    const sub = ident.slice(unders + 1)
    return `$${base}_${formatSubscriptPart(sub)}$`
  }
  if (/^[A-Za-z]$/.test(ident)) return `$${ident}$`
  if (/^[A-Za-z][A-Za-z0-9]{0,12}$/.test(ident)) return `$${ident}$`
  return ident
}

function autoEnrichSymbols(text) {
  let out = text.trim()

  // 整段为单个工程字母（坐标轴 S、N 等）
  if (/^[A-Za-z]$/.test(out)) {
    return identToLatex(out)
  }

  out = text

  // 公差代号（整词）
  out = out.replace(/\bES\b/g, '$ES$')
  out = out.replace(/\bEI\b/g, '$EI$')

  // 尺寸标注：sym = 数值
  out = out.replace(
    /\b([A-Za-z](?:_[A-Za-z0-9]+)?)\s*=\s*([\d.+\-]+(?:e[+-]?\d+)?)/g,
    (match, sym, num) => `${identToLatex(sym)} = ${num}`,
  )

  // 带下划线的标识符（f_pt、D_A 等）
  out = out.replace(/\b([A-Za-z][A-Za-z0-9]*_[A-Za-z0-9]+)\b/g, (match) => identToLatex(match))

  // 疲劳/帮助常用无下划线缩写
  out = out.replace(/\bSa\b/g, '$S_a$')
  out = out.replace(/\bSm\b/g, '$S_m$')
  out = out.replace(/\bNf\b/g, '$N_f$')
  out = out.replace(/\bSe′\b/g, '$S_e\'$')
  out = out.replace(/\bSe'\b/g, '$S_e\'$')

  return out
}

function bindCjkToSymbol(text) {
  return text.replace(/([\u4e00-\u9fff])\s+(?=[A-Za-z_$ΔΦΣ])/g, '$1\u00a0')
}

function applySymbolReplacements(plain) {
  // 只在非 $...$ 片段上替换，避免 A_s → $A_s$ 后再被二次匹配成 $$A_s$$
  let out = plain
  for (const [from, to] of SORTED_REPLACEMENTS) {
    if (to == null) continue
    out = splitMathSegments(out)
      .map((seg) => (seg.math ? seg.content : seg.content.split(from).join(to)))
      .join('')
  }
  return out
}

/** 希腊字母 + 下标（σ_op 等）须先于裸 σ → $\\sigma$，否则会留下明文 _op */
const GREEK_LETTER_LATEX = {
  μ: '\\mu',
  σ: '\\sigma',
  τ: '\\tau',
  θ: '\\theta',
  δ: '\\delta',
  Δ: '\\Delta',
  ε: '\\varepsilon',
  α: '\\alpha',
  β: '\\beta',
  ν: '\\nu',
  π: '\\pi',
  ρ: '\\rho',
  Φ: '\\Phi',
}

function enrichGreekUnderscoreIdents(text) {
  // 勿拆 Δσ_C 一类「希腊+希腊_下标」；负向后顾跳过紧邻前导希腊字母
  return text.replace(/(?<![μστθδΔεαβνπρΦ])([μστθδΔεαβνπρΦ])_([A-Za-z0-9]+)/g, (_, g, sub) => {
    return `$${GREEK_LETTER_LATEX[g]}_${formatSubscriptPart(sub)}$`
  })
}

function enrichPlainSegment(text) {
  const normalized = bindCjkToSymbol(normalizeEngineeringText(text))
  return splitMathSegments(normalized)
    .map((seg) => {
      if (seg.math) return seg.content
      // 希腊下标须先于裸 σ→$\sigma$，否则 σ_op 会变成 $\sigma$_op；负向后顾保护 Δσ_C
      const withGreekSubs = enrichGreekUnderscoreIdents(seg.content)
      const replaced = applySymbolReplacements(withGreekSubs)
      return bindCjkToSymbol(
        splitMathSegments(replaced)
          .map((s) => (s.math ? s.content : autoEnrichSymbols(s.content)))
          .join(''),
      )
    })
    .join('')
}

/**
 * 示意图 / 结果行尺寸标注 — 传入符号名与数值，自动 LaTeX 化
 * @example dimLabel('d', 50) → '$d$ = 50 mm'
 */
export function dimLabel(symbol, value, unit = 'mm') {
  const val = value == null || value === '' ? '—' : String(value)
  const unitPart = unit ? ` ${unit}` : ''
  return enrichMathText(`${symbol} = ${val}${unitPart}`)
}

export function enrichMathText(text) {
  if (text == null || text === '') return ''
  const s = String(text)
  return splitMathSegments(s)
    .map((seg) => (seg.math ? seg.content : enrichPlainSegment(seg.content)))
    .join('')
}

/** 示意图图例：符号与说明同一行内联 */
export function legendLine(symbol, desc) {
  const sym = symbol == null ? '' : String(symbol).trim()
  const body = desc == null ? '' : String(desc).trim()
  if (!sym) return enrichMathText(body)
  if (!body) return enrichMathText(sym)
  return `${enrichMathText(sym)} — ${enrichMathText(body)}`
}
