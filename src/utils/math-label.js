/**
 * 将 UI 字符串中的工程符号转为 MathContent 可解析的 $...$ LaTeX 片段
 * 已含 $ 的字符串原样返回（支持 i18n 手写 LaTeX）
 */

const REPLACEMENTS = [
  // 公式短语（编辑器步骤提示等）
  ['T=6\\sqrt{\\sum (T_i/K_i)^2}', null], // placeholder — handled in FORMULA_HINTS
  ['F_i = F/n + M×r/I_p', '$F_i = F/n + M \\times r / I_p$'],
  ['T = μFRn', '$T = \\mu F R n$'],
  ['T = K·F·d', '$T = K \\cdot F \\cdot d$'],
  ['T=μdF', '$T = \\mu d F$'],
  ['P = X·Fr + Y·Fa', '$P = X \\cdot F_r + Y \\cdot F_a$'],
  ['μ_G/μ_K', '$\\mu_G / \\mu_K$'],
  ['μ_G、μ_K、D_km', '$\\mu_G$、$\\mu_K$、$D_{km}$'],
  ['μ_G, μ_K, D_km', '$\\mu_G$, $\\mu_K$, $D_{km}$'],
  // 复合符号（长匹配优先）
  ['σ_eq', '$\\sigma_{eq}$'],
  ['σ_cr', '$\\sigma_{cr}$'],
  ['σc', '$\\sigma_c$'],
  ['σt', '$\\sigma_t$'],
  ['σ₋₁', '$\\sigma_{-1}$'],
  ['τ_a', '$\\tau_a$'],
  ['m_eff', '$m_{eff}$'],
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
  ['a₁', '$a_1$'],
  ['a₂', '$a_2$'],
  ['α₁', '$\\alpha_1$'],
  ['α₂', '$\\alpha_2$'],
  ['z₁', '$z_1$'],
  ['z₂', '$z_2$'],
  ['x₁', '$x_1$'],
  ['x₂', '$x_2$'],
  ['D₁', '$D_1$'],
  ['D₂', '$D_2$'],
  ['L₀', '$L_0$'],
  ['L₁', '$L_1$'],
  ['F₁', '$F_1$'],
  ['F₂', '$F_2$'],
  ['ΔL₁', '$\\Delta L_1$'],
  ['ΔT', '$\\Delta T$'],
  ['ΔL', '$\\Delta L$'],
  ['Δi', '$\\Delta i$'],
  ['Δτ', '$\\Delta \\tau$'],
  ['I_p', '$I_p$'],
  ['F_i', '$F_i$'],
  ['A_s', '$A_s$'],
  ['6σ', '$6\\sigma$'],
  ['6σ RSS', '$6\\sigma$ RSS'],
  ['±3σ', '$\\pm 3\\sigma$'],
  ['99.73%', '99.73\\%'],
  ['N·m', '$\\mathrm{N \\cdot m}$'],
  ['N·mm', '$\\mathrm{N \\cdot mm}$'],
  ['N·mm', '$\\mathrm{N \\cdot mm}$'],
  ['×10⁻⁶', '$\\times 10^{-6}$'],
  ['b×h', '$b \\times h$'],
  // 单字符希腊/拉丁（靠后，避免误伤）
  ['μ', '$\\mu$'],
  ['σ', '$\\sigma$'],
  ['τ', '$\\tau$'],
  ['θ', '$\\theta$'],
  ['δ', '$\\delta$'],
  ['Δ', '$\\Delta$'],
  ['ε', '$\\varepsilon$'],
  ['α', '$\\alpha$'],
  ['β', '$\\beta$'],
  ['ν', '$\\nu$'],
  ['π', '$\\pi$'],
]

/** 尺寸链步骤 4 公式摘要 — 完整 LaTeX */
export const STACK_METHOD_FORMULA_HINT_ZH =
  '极值法：$T=\\sum T_i$ · RSS：$T=\\sqrt{\\sum T_i^2}$ · 修正 RSS：$T=k\\sqrt{\\sum T_i^2}$ · $6\\sigma$：$T=6\\sqrt{\\sum (T_i/K_i)^2}$'

export const STACK_METHOD_FORMULA_HINT_EN =
  'Worst case: $T=\\sum T_i$ · RSS: $T=\\sqrt{\\sum T_i^2}$ · Modified RSS: $T=k\\sqrt{\\sum T_i^2}$ · $6\\sigma$: $T=6\\sqrt{\\sum (T_i/K_i)^2}$'

export function enrichMathText(text) {
  if (text == null || text === '') return ''
  const s = String(text)
  if (s.includes('$')) return s

  let out = s
  for (const [from, to] of REPLACEMENTS) {
    if (to == null) continue
    out = out.split(from).join(to)
  }
  return out
}
