/**
 * 钣金 / O 型圈 / 液压缸 / 热膨胀 / 结构流体 — 扩展帮助（blocks 供 ExtendedHelpReference）
 */
import {
  pickLocale,
  stdCalcModes,
  faqBlock,
  limitsBlock,
  examplesBlock,
  passBlock,
  formulasBlock,
  modesBlock,
  guideBlock,
  howToPassBlock,
  standardsBlock,
} from './builders.js'

// ── Sheet metal ─────────────────────────────────────────────────────────────

const SHEET_METAL_MODES = {
  zh: {
    simpleModel: 'K 因子或折弯扣除 → 展开长度 $L_{flat}$；无工艺门禁',
    completeModel: '展开 + **最小直边 ≥ 4T** 法兰规则（$T$=板厚）',
    proModel: '完整 + **内半径 $R \\ge T$** + 回弹补偿展开长',
    simplePass: '**pass 恒为 false**（无判定项，仅算展开）',
    completePass: '**pass = flangePass**：各直段长度 $\\min(L_{straight}) \\ge 4T$，或无折弯',
    proPass: '**pass = flangePass ∧ radiusPass**（$R_{inner} \\ge T$）',
    simpleCaveat: 'K 因子需试折标定；不含回弹与最小法兰',
    completeCaveat: '4T 为常见模具经验，特殊 V 槽/翻边需另计',
    proCaveat: '回弹系数默认 0.5°/90°·折弯数，压印/大 R 需实测',
  },
  en: {
    simpleModel: 'K-factor or bend deduction → flat length $L_{flat}$; no process gates',
    completeModel: 'Unfold + **min straight leg ≥ 4T** flange rule ($T$ = thickness)',
    proModel: 'Full + **inner radius $R \\ge T$** + springback-compensated flat length',
    simplePass: '**pass always false** (no checks—unfold only)',
    completePass: '**pass = flangePass**: $\\min(L_{straight}) \\ge 4T$, or no bends',
    proPass: '**pass = flangePass ∧ radiusPass** ($R_{inner} \\ge T$)',
    simpleCaveat: 'K-factor needs trial bend; no springback or min flange',
    completeCaveat: '4T is common die practice; special V-die/flanges need separate check',
    proCaveat: 'Default springback 0.5° per 90°·bend count—verify for coining/large R',
  },
}

const SHEET_METAL_FORMULAS = {
  zh: [
    { name: '折弯补偿 (K 因子)', latex: 'BA = \\frac{\\pi}{180} \\cdot \\theta \\cdot (R + K \\cdot T)', note: '$\\theta$ 折弯角 (°)，$R$ 内半径，$K$ 默认 0.33（空气折弯 R≈T）' },
    { name: '折弯扣除', latex: 'BD = 2(R+T)\\tan\\frac{\\theta}{2} - BA', note: '外尺寸法：$L_{flat} = \\sum L_{outer} - \\sum BD$' },
    { name: 'K 因子展开', latex: 'L_{flat} = \\sum L_{straight} + \\sum BA', note: '直段 + 各折弯补偿累加' },
    { name: '回弹补偿 (专业)', latex: "L'_{flat} = L_{flat} \\cdot \\left(1 + \\frac{\\theta_{sb}}{90 \\cdot n_{bend}}\\right)", note: '$\\theta_{sb}$ 回弹角 (°)，$n_{bend}$ 折弯道数' },
  ],
  en: [
    { name: 'Bend allowance (K-factor)', latex: 'BA = \\frac{\\pi}{180} \\cdot \\theta \\cdot (R + K \\cdot T)', note: '$\\theta$ bend angle (°), $R$ inner radius, $K$ default 0.33 (air bend R≈T)' },
    { name: 'Bend deduction', latex: 'BD = 2(R+T)\\tan\\frac{\\theta}{2} - BA', note: 'Outside dimension: $L_{flat} = \\sum L_{outer} - \\sum BD$' },
    { name: 'K-factor unfold', latex: 'L_{flat} = \\sum L_{straight} + \\sum BA', note: 'Straight legs + bend allowances' },
    { name: 'Springback (Professional)', latex: "L'_{flat} = L_{flat} \\cdot \\left(1 + \\frac{\\theta_{sb}}{90 \\cdot n_{bend}}\\right)", note: '$\\theta_{sb}$ springback (°), $n_{bend}$ bend count' },
  ],
}

const SHEET_METAL_PASS = {
  zh: [
    { check: '简化模式', rule: '无 pass；仅输出 $L_{flat}$' },
    { check: '最小法兰 (完整/专业)', rule: '$\\min(L_{straight}) \\ge 4T$ 或 bendCount=0 → flangePass' },
    { check: '内半径 (专业)', rule: '$R_{inner} \\ge T$ → radiusPass' },
    { check: '综合 pass', rule: '完整：pass=flangePass；专业：pass=flangePass∧radiusPass' },
  ],
  en: [
    { check: 'Simplified', rule: 'No pass; outputs $L_{flat}$ only' },
    { check: 'Min flange (Full/Pro)', rule: '$\\min(L_{straight}) \\ge 4T$ or bendCount=0 → flangePass' },
    { check: 'Inner radius (Pro)', rule: '$R_{inner} \\ge T$ → radiusPass' },
    { check: 'Overall pass', rule: 'Full: pass=flangePass; Pro: pass=flangePass∧radiusPass' },
  ],
}

// ── O-ring ──────────────────────────────────────────────────────────────────

const ORING_MODES = {
  zh: {
    simpleModel: '压缩率、沟槽宽、填充率校核（静/动密封不同压缩上下限）',
    completeModel: '简化 + **挤隙** + **材料耐温**',
    proModel: '完整 + **动密封速度** + **许用压力** + 可选热膨胀对压缩量影响',
    simplePass: 'compressionOk ∧ widthOk ∧ fillOk',
    completePass: '简化 pass ∧ extrusionPass ∧ tempPass',
    proPass: '完整 pass ∧ speedPass ∧ pressurePass ∧ thermalPass（若输入热膨胀）',
    simpleCaveat: '静密封 15–25% 压缩；动密封 12–20%',
    completeCaveat: '挤隙上限随压力降低：$g_{max} \\approx 0.25 - 0.008p$ (MPa)',
    proCaveat: '许用压力 $p_{max} \\approx 35 \\cdot 0.25/g$ 为简化，高压需挡圈',
  },
  en: {
    simpleModel: 'Compression, groove width, fill % (static vs dynamic limits)',
    completeModel: 'Simple + **extrusion gap** + **material temperature**',
    proModel: 'Full + **stroke speed** + **allowable pressure** + optional thermal compression',
    simplePass: 'compressionOk ∧ widthOk ∧ fillOk',
    completePass: 'Simple pass ∧ extrusionPass ∧ tempPass',
    proPass: 'Full pass ∧ speedPass ∧ pressurePass ∧ thermalPass (if thermal input)',
    simpleCaveat: 'Static 15–25% compression; dynamic 12–20%',
    completeCaveat: 'Max gap drops with pressure: $g_{max} \\approx 0.25 - 0.008p$ (MPa)',
    proCaveat: '$p_{max} \\approx 35 \\cdot 0.25/g$ is simplified—use backup rings at high p',
  },
}

const ORING_FORMULAS = {
  zh: [
    { name: '压缩量', latex: '\\delta = CS \\cdot \\frac{C\\%}{100}', note: '目标压缩率 $C\\%$；沟槽深度 $h_g = CS - \\delta$' },
    { name: '填充率', latex: 'Fill\\% = \\frac{A_{ring}}{A_{gland}} \\times 100', note: '推荐 65–85%；$A_{ring}=\\pi CS^2/4$' },
    { name: '沟槽宽度', latex: '1.2 \\cdot CS \\le W_g \\le 1.6 \\cdot CS', note: '推荐 $W_g \\approx 1.4 \\cdot CS$' },
    { name: '安装拉伸', latex: 'ID_{installed} = D_g(1+s\\%)', note: '径向静密封常用 2% 周向拉伸' },
  ],
  en: [
    { name: 'Compression', latex: '\\delta = CS \\cdot \\frac{C\\%}{100}', note: 'Target $C\\%$; groove depth $h_g = CS - \\delta$' },
    { name: 'Fill ratio', latex: 'Fill\\% = \\frac{A_{ring}}{A_{gland}} \\times 100', note: 'Target 65–85%; $A_{ring}=\\pi CS^2/4$' },
    { name: 'Groove width', latex: '1.2 \\cdot CS \\le W_g \\le 1.6 \\cdot CS', note: 'Recommended $W_g \\approx 1.4 \\cdot CS$' },
    { name: 'Install stretch', latex: 'ID_{installed} = D_g(1+s\\%)', note: 'Radial static seals often use ~2% stretch' },
  ],
}

const ORING_PASS = {
  zh: [
    { check: '压缩率', rule: '静：15–25%；动：12–20%（简化动密封上限 25%）' },
    { check: '沟槽宽', rule: '$1.2\\,CS \\le W_g \\le 1.6\\,CS$' },
    { check: '填充率', rule: '65% ≤ Fill% ≤ 85%' },
    { check: '挤隙 (完整+)', rule: '$g \\le g_{max}(p)$；静密封 $g_{max}=0.3$ mm' },
    { check: '温度 (完整+)', rule: '$T_{op} \\le T_{max}$（NBR 100°C，FKM 200°C 等）' },
    { check: '速度 (专业)', rule: '动密封：strokeSpeed ≤ 0.5 m/s' },
    { check: '压力 (专业)', rule: '$p \\le p_{max}(g)$' },
  ],
  en: [
    { check: 'Compression', rule: 'Static 15–25%; dynamic 12–20% (simple cap 25%)' },
    { check: 'Groove width', rule: '$1.2\\,CS \\le W_g \\le 1.6\\,CS$' },
    { check: 'Fill ratio', rule: '65% ≤ Fill% ≤ 85%' },
    { check: 'Extrusion gap (Full+)', rule: '$g \\le g_{max}(p)$; static $g_{max}=0.3$ mm' },
    { check: 'Temperature (Full+)', rule: '$T_{op} \\le T_{max}$ (NBR 100°C, FKM 200°C, etc.)' },
    { check: 'Speed (Pro)', rule: 'Dynamic: strokeSpeed ≤ 0.5 m/s' },
    { check: 'Pressure (Pro)', rule: '$p \\le p_{max}(g)$' },
  ],
}

// ── Cylinder ────────────────────────────────────────────────────────────────

const CYLINDER_MODES = {
  zh: {
    simpleModel: '力 $F=pA$、速度 $v=Q/A$、流量换算；**无载荷/屈曲判定**',
    completeModel: '外载裕度 + **活塞杆 Euler/Johnson 屈曲**（缩回受压默认）',
    proModel: '完整 + **动态载荷** $F_d=mg(1+a/g)$ + 缓冲压力估算',
    simplePass: '**pass 恒为 false**（estimateOnly）',
    completePass: 'loadPass ∧ bucklingPass；无压缩载荷时屈曲跳过',
    proPass: 'extendForce ≥ dynamicLoad 且 bucklingPass',
    simpleCaveat: '1 MPa × mm² = N；未计密封摩擦与背压',
    completeCaveat: '须确认 endFixity 与 compressOnRetract；K·L 为 Euler 等效长度',
    proCaveat: '气缸效率默认 85% 已在 analyzePneumaticCylinder 中乘入',
  },
  en: {
    simpleModel: 'Force $F=pA$, velocity $v=Q/A$, flow conversion; **no load/buckling gate**',
    completeModel: 'Load margin + **rod Euler/Johnson buckling** (retract compression default)',
    proModel: 'Full + **dynamic load** $F_d=mg(1+a/g)$ + cushion pressure estimate',
    simplePass: '**pass always false** (estimateOnly)',
    completePass: 'loadPass ∧ bucklingPass; buckling skipped if no compression',
    proPass: 'extendForce ≥ dynamicLoad and bucklingPass',
    simpleCaveat: '1 MPa × mm² = N; seal friction and back pressure omitted',
    completeCaveat: 'Confirm endFixity and compressOnRetract; K·L is Euler effective length',
    proCaveat: 'Pneumatic efficiency default 85% applied in analyzePneumaticCylinder',
  },
}

const CYLINDER_FORMULAS = {
  zh: [
    { name: '伸出力', latex: 'F_{ext} = p \\cdot \\frac{\\pi D^2}{4}', note: 'MPa × mm² = N' },
    { name: '缩回力 (有杆)', latex: 'F_{ret} = p \\cdot \\frac{\\pi(D^2-d^2)}{4}', note: '$d$ 活塞杆直径' },
    { name: 'Euler 临界力', latex: 'P_{cr} = \\frac{\\pi^2 E I}{(KL)^2}', note: '$I=\\pi d^4/64$；Johnson 段当 $P_e > P_y$' },
    { name: '所需压力', latex: 'p_{req} = F_{load}/A', note: '伸出/缩回分别用 bore / annular 面积' },
  ],
  en: [
    { name: 'Extend force', latex: 'F_{ext} = p \\cdot \\frac{\\pi D^2}{4}', note: 'MPa × mm² = N' },
    { name: 'Retract force (rod)', latex: 'F_{ret} = p \\cdot \\frac{\\pi(D^2-d^2)}{4}', note: '$d$ = rod diameter' },
    { name: 'Euler critical load', latex: 'P_{cr} = \\frac{\\pi^2 E I}{(KL)^2}', note: '$I=\\pi d^4/64$; Johnson when $P_e > P_y$' },
    { name: 'Required pressure', latex: 'p_{req} = F_{load}/A', note: 'Extend/retract use bore / annular area' },
  ],
}

const CYLINDER_PASS = {
  zh: [
    { check: '简化模式', rule: 'estimateOnly → pass=false；评审状态 review' },
    { check: '载荷裕度', rule: 'extendForce ≥ load 且 retractForce ≥ load' },
    { check: '杆屈曲', rule: 'compressiveLoad ≤ P_cr；compressiveLoad≤0 时不检' },
    { check: '动态 (专业)', rule: 'extendForce ≥ dynamicLoad' },
    { check: '关键输入门禁', rule: 'complete/professional + enforceCriticalConfirm：未确认 endFixity/stroke/yield 等 → releaseBlocked' },
  ],
  en: [
    { check: 'Simplified', rule: 'estimateOnly → pass=false; review status' },
    { check: 'Load margin', rule: 'extendForce ≥ load and retractForce ≥ load' },
    { check: 'Rod buckling', rule: 'compressiveLoad ≤ P_cr; skip if compressiveLoad≤0' },
    { check: 'Dynamic (Pro)', rule: 'extendForce ≥ dynamicLoad' },
    { check: 'Critical-input gate', rule: 'complete/pro + enforceCriticalConfirm: unconfirmed endFixity/stroke/yield → releaseBlocked' },
  ],
}

// ── Thermal expansion ───────────────────────────────────────────────────────

const THERMAL_MODES = {
  zh: {
    simpleModel: '线性 $\\Delta L = \\alpha L \\Delta T$；可选双材料；**无配合判定**',
    completeModel: '线性/配合 + **过盈是否变间隙**（becomesClearance）',
    proModel: '完整 + **装配/服役分步 $\\Delta T$** + 可选 $\\alpha(T)$ 均值积分',
    simplePass: '**pass 恒为 false**（estimateOnly）',
    completePass: '**pass = ¬becomesClearance**（最终过盈仍 >0）',
    proPass: '同完整；serviceFit 为装配后 + 服役温升叠加结果',
    simpleCaveat: '界面 α 填 ×10⁻⁶ 数值（钢≈11.5）；公式用物理 α',
    completeCaveat: '双材料配合：$\\Delta I = \\Delta d_{shaft} - \\Delta D_{hole}$；关键字段琥珀色边框 + *',
    proCaveat: '$\\alpha(T)=\\alpha_{ref}(1+k(T-T_{ref}))$ 默认 professional 开启',
  },
  en: {
    simpleModel: 'Linear $\\Delta L = \\alpha L \\Delta T$; optional dual material; **no fit gate**',
    completeModel: 'Linear/fit + **interference stays positive** (not becomesClearance)',
    proModel: 'Full + **assembly/service ΔT steps** + optional $\\alpha(T)$ mean integration',
    simplePass: '**pass always false** (estimateOnly)',
    completePass: '**pass = ¬becomesClearance** (final interference > 0)',
    proPass: 'Same as Full; serviceFit = assembly state + service heating',
    simpleCaveat: 'UI α is ×10⁻⁶ magnitude (steel ≈ 11.5); formulas use physical α',
    completeCaveat: 'Dual material: $\\Delta I = \\Delta d_{shaft} - \\Delta D_{hole}$; critical fields amber + *',
    proCaveat: '$\\alpha(T)=\\alpha_{ref}(1+k(T-T_{ref}))$ on by default in Professional',
  },
}

const THERMAL_FORMULAS = {
  zh: [
    { name: '线性膨胀', latex: '\\Delta L = \\alpha \\cdot L \\cdot \\Delta T', note: '界面 α 按 ×10⁻⁶ 输入（如 11.5）后再换算' },
    { name: 'α(T) 均值 (专业)', latex: '\\Delta L \\approx \\alpha_{ref}\\left(1+\\frac{k\\Delta T}{2}\\right)L\\Delta T', note: '相对温度系数 $k$ (/°C)' },
    { name: '配合变化', latex: '\\Delta I = \\alpha_1 d \\Delta T - \\alpha_2 D \\Delta T', note: '最终过盈 $I_f = I_0 + \\Delta I$' },
    { name: '变间隙判定', latex: 'becomesClearance \\Leftrightarrow I_f < 0', note: 'pass 取反' },
  ],
  en: [
    { name: 'Linear expansion', latex: '\\Delta L = \\alpha \\cdot L \\cdot \\Delta T', note: 'UI α entered as ×10⁻⁶ (e.g. 11.5) then scaled' },
    { name: 'α(T) mean (Pro)', latex: '\\Delta L \\approx \\alpha_{ref}\\left(1+\\frac{k\\Delta T}{2}\\right)L\\Delta T', note: 'Relative temp coeff. $k$ (/°C)' },
    { name: 'Fit change', latex: '\\Delta I = \\alpha_1 d \\Delta T - \\alpha_2 D \\Delta T', note: 'Final interference $I_f = I_0 + \\Delta I$' },
    { name: 'Clearance check', latex: 'becomesClearance \\Leftrightarrow I_f < 0', note: 'pass is negation' },
  ],
}

const THERMAL_PASS = {
  zh: [
    { check: '简化', rule: 'estimateOnly → pass=false' },
    { check: '完整/专业', rule: 'pass = finalInterference ≥ 0（未变间隙）' },
    { check: '专业分步', rule: '先 assemblyΔT 再 serviceΔT−assemblyΔT 叠加至 serviceFit' },
    { check: '关键输入', rule: 'complete：shaftDiameter, holeDiameter, deltaT；professional：assemblyDeltaT, serviceDeltaT；未确认 → 琥珀边框 + *，总判待复核（数值仍显示）' },
  ],
  en: [
    { check: 'Simplified', rule: 'estimateOnly → pass=false' },
    { check: 'Full/Pro', rule: 'pass = finalInterference ≥ 0 (no clearance)' },
    { check: 'Pro stepped', rule: 'assemblyΔT then serviceΔT−assemblyΔT → serviceFit' },
    { check: 'Critical inputs', rule: 'complete: shaftDiameter, holeDiameter, deltaT; pro: assembly/service ΔT; unconfirmed → amber + *, status=review (values still shown)' },
  ],
}

// ── Structural (3 tabs) ─────────────────────────────────────────────────────

const STRUCTURAL_PIPE_FORMULAS = {
  zh: [
    { name: 'Darcy-Weisbach', latex: '\\Delta P = f \\cdot \\frac{L}{D} \\cdot \\frac{\\rho v^2}{2}', note: 'Swamee-Jain 求 $f$；Re<2300 层流 $f=64/Re$' },
    { name: '局部损失', latex: '\\Delta P_{local} = K \\cdot \\frac{\\rho v^2}{2}', note: '完整/专业模式叠加' },
    { name: 'Hazen-Williams (对照)', latex: 'h_f = 10.67 \\frac{L Q^{1.852}}{C^{1.852} D^{4.871}}', note: '仅水；与 Darcy **沿程**对比 deltaPercent（不含局部 K）' },
  ],
  en: [
    { name: 'Darcy-Weisbach', latex: '\\Delta P = f \\cdot \\frac{L}{D} \\cdot \\frac{\\rho v^2}{2}', note: 'Swamee-Jain for $f$; laminar Re<2300: $f=64/Re$' },
    { name: 'Local loss', latex: '\\Delta P_{local} = K \\cdot \\frac{\\rho v^2}{2}', note: 'Added in Full/Professional' },
    { name: 'Hazen-Williams (compare)', latex: 'h_f = 10.67 \\frac{L Q^{1.852}}{C^{1.852} D^{4.871}}', note: 'Water only; vs Darcy **friction** (excludes local K)' },
  ],
}

const STRUCTURAL_PLATE_FORMULAS = {
  zh: [
    { name: '薄板屈曲', latex: '\\sigma_{cr} = k \\cdot \\frac{\\pi^2 E}{12(1-\\nu^2)} \\left(\\frac{t}{b}\\right)^2', note: '$k$ 取边界表值（SSSS=4）；不随 $a/b$ 半波数变化' },
    { name: '安全系数', latex: 'SF = \\sigma_{cr} / \\sigma_{applied}', note: '$\\sigma_{applied}=\\sigma_x + 0.5\\sigma_y$（完整+）；默认要求 SF≥2' },
    { name: '后屈曲 (专业)', latex: '\\sigma_{pb} \\approx \\varphi \\cdot \\sigma_{cr}', note: '默认 $\\varphi=1.5$，估算承载，非 $\\sigma_{ult}-\\sigma_{cr}$' },
    { name: '剪切 (专业)', latex: '\\tau_{cr} \\approx 0.3 \\sigma_{cr}', note: 'τ_pass: $\\tau \\le \\tau_{cr}/SF_{min}$' },
  ],
  en: [
    { name: 'Plate buckling', latex: '\\sigma_{cr} = k \\cdot \\frac{\\pi^2 E}{12(1-\\nu^2)} \\left(\\frac{t}{b}\\right)^2', note: 'Tabulated $k$ (SSSS=4); not refined by $a/b$ half-waves' },
    { name: 'Safety factor', latex: 'SF = \\sigma_{cr} / \\sigma_{applied}', note: '$\\sigma_{applied}=\\sigma_x + 0.5\\sigma_y$ (Full+); default SF≥2' },
    { name: 'Post-buckling (Pro)', latex: '\\sigma_{pb} \\approx \\varphi \\cdot \\sigma_{cr}', note: 'Default $\\varphi=1.5$; capacity estimate, not $\\sigma_{ult}-\\sigma_{cr}$' },
    { name: 'Shear (Pro)', latex: '\\tau_{cr} \\approx 0.3 \\sigma_{cr}', note: 'τ_pass: $\\tau \\le \\tau_{cr}/SF_{min}$' },
  ],
}

const STRUCTURAL_MODAL_FORMULAS = {
  zh: [
    { name: 'SDOF 固有频率', latex: 'f_n = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}', note: '弹簧-质量模型' },
    { name: '简支梁一阶', latex: 'f_n = \\frac{\\pi}{2L^2}\\sqrt{\\frac{EI}{\\rho A}}', note: 'E MPa，尺寸 mm，ρ 按 N·mm·s（tonne/mm³）；$E=210\\,\\mathrm{GPa}$' },
    { name: '共振裕度', latex: 'M = \\frac{|f_{exc}-f_n|}{f_n}', note: '≥20% 安全；10–20% 关注；<10% 危险' },
    { name: '临界转速 (完整+)', latex: 'n_{cr} = f_n \\times 60', note: 'rpm' },
    { name: '传递率 (专业)', latex: 'H(r) = \\frac{1}{\\sqrt{(1-r^2)^2+(2\\zeta r)^2}}', note: '位移传递率，非共振 $Q=1/(2\\zeta)$' },
  ],
  en: [
    { name: 'SDOF natural freq.', latex: 'f_n = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}', note: 'Default modal tab case' },
    { name: 'Simply supported beam', latex: 'f_n = \\frac{\\pi}{2L^2}\\sqrt{\\frac{EI}{\\rho A}}', note: 'E in MPa, mm units, ρ tonne/mm³; $E=210\\,\\mathrm{GPa}$' },
    { name: 'Resonance margin', latex: 'M = \\frac{|f_{exc}-f_n|}{f_n}', note: '≥20% safe; 10–20% caution; <10% danger' },
    { name: 'Critical speed (Full+)', latex: 'n_{cr} = f_n \\times 60', note: 'rpm' },
    { name: 'Transmissibility (Pro)', latex: 'H(r) = \\frac{1}{\\sqrt{(1-r^2)^2+(2\\zeta r)^2}}', note: 'Displacement H(r), not resonant $Q=1/(2\\zeta)$' },
  ],
}

function buildHelpBlocks(locale, {
  titleModes,
  modeOpts,
  titleFormulas,
  formulas,
  formulaSubtitle,
  titlePass,
  passRows,
  passSubtitle,
  titleGuide,
  guideOpts,
  titleExamples,
  exampleRows,
  titleHowToPass,
  howToPassItems,
  titleFaq,
  faqRows,
  titleStandards,
  standardsIntro,
  standardsItems,
  titleLimits,
  limitItems,
}) {
  return {
    blocks: [
      modesBlock(titleModes, stdCalcModes(locale, modeOpts)),
      formulasBlock(titleFormulas, pickLocale(locale, formulas), formulaSubtitle),
      passBlock(titlePass, pickLocale(locale, passRows), passSubtitle),
      guideBlock(titleGuide, guideOpts),
      examplesBlock(titleExamples, pickLocale(locale, exampleRows)),
      howToPassBlock(titleHowToPass, pickLocale(locale, howToPassItems)),
      faqBlock(titleFaq, pickLocale(locale, faqRows)),
      standardsBlock(titleStandards, pickLocale(locale, standardsItems), pickLocale(locale, standardsIntro)),
      limitsBlock(titleLimits, pickLocale(locale, limitItems)),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getSheetMetalHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildHelpBlocks(locale, {
    titleModes: L ? 'Calculation modes' : '计算模式',
    modeOpts: pickLocale(locale, SHEET_METAL_MODES),
    titleFormulas: L ? 'Formulas' : '公式',
    formulas: SHEET_METAL_FORMULAS,
    formulaSubtitle: L ? 'Matches sheet-metal-calc.js (K-factor & bend deduction)' : '与 sheet-metal-calc.js 一致（K 因子 / 折弯扣除）',
    titlePass: L ? 'Pass criteria' : '判定依据',
    passRows: SHEET_METAL_PASS,
    titleGuide: L ? 'Design guide' : '设计指南',
    guideOpts: pickLocale(locale, {
      zh: {
        intro: '钣金展开用于下料长度预算；**完整/专业**模式增加可制造性门禁（最小法兰、内半径、回弹）。',
        sections: [
          { title: 'K 因子选取', body: '与 $R/T$、材料、V 槽开口相关。', bullets: ['空气折弯 R≈T：K≈0.33', '小半径：K≈0.38', '压印：K≈0.42', '铝合金经验：K≈0.35'] },
          { title: '段列表输入', body: 'segments：straight 累加长度；bend 累加 BA 或输出 BD。', bullets: ['method=k_factor：$L_{flat}=\\sum L + \\sum BA$', 'method=bend_deduction：$L_{flat}=L_{outer}-\\sum BD$'] },
        ],
      },
      en: {
        intro: 'Sheet unfold for nest length; **Full/Professional** add manufacturability gates (min flange, inner R, springback).',
        sections: [
          { title: 'K-factor selection', body: 'Depends on $R/T$, material, V-die opening.', bullets: ['Air bend R≈T: K≈0.33', 'Tight radius: K≈0.38', 'Coining: K≈0.42', 'Aluminum empirical: K≈0.35'] },
          { title: 'Segment list', body: 'segments: straight adds length; bend adds BA or reports BD.', bullets: ['method=k_factor: $L_{flat}=\\sum L + \\sum BA$', 'method=bend_deduction: $L_{flat}=L_{outer}-\\sum BD$'] },
        ],
      },
    }),
    titleExamples: L ? 'Worked example' : '算例',
    exampleRows: {
      zh: [
        { step: '输入', detail: 'T=1.5 mm，R=1.5 mm，θ=90°，K=0.33；直段 30+30 mm；完整模式' },
        { step: 'BA', detail: '$BA=\\frac{\\pi}{180}\\cdot90\\cdot(1.5+0.33\\cdot1.5)\\approx 3.53$ mm' },
        { step: '展开', detail: '$L_{flat}=30+3.53+30=63.53$ mm' },
        { step: '法兰', detail: 'min straight=30 mm ≥ 4×1.5=6 → flangePass ✓' },
        { step: '判定', detail: '完整模式 pass=true（若直段任一段 <6 mm 则失败）' },
      ],
      en: [
        { step: 'Inputs', detail: 'T=1.5 mm, R=1.5 mm, θ=90°, K=0.33; straights 30+30 mm; Full mode' },
        { step: 'BA', detail: '$BA=\\frac{\\pi}{180}\\cdot90\\cdot(1.5+0.33\\cdot1.5)\\approx 3.53$ mm' },
        { step: 'Unfold', detail: '$L_{flat}=30+3.53+30=63.53$ mm' },
        { step: 'Flange', detail: 'min straight=30 mm ≥ 4×1.5=6 → flangePass ✓' },
        { step: 'Verdict', detail: 'Full mode pass=true (any straight <6 mm fails)' },
      ],
    },
    titleHowToPass: L ? 'How to pass' : '如何让判定通过',
    howToPassItems: {
      zh: [{ goal: '完整/专业 pass', steps: ['各直段 ≥ 4T', '专业：内半径 R ≥ T', '减小回弹：增大 R、退火或专业模式调低 springbackFactor'] }],
      en: [{ goal: 'Full/Pro pass', steps: ['Each straight leg ≥ 4T', 'Pro: inner radius R ≥ T', 'Reduce springback: larger R, anneal, or lower springbackFactor in Pro'] }],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faqRows: {
      zh: [
        { q: 'K 因子 0.33 与 0.38？', a: '0.33 空气折弯 R≈T；0.38 小半径。试折标定优先。' },
        { q: '简化为何无 pass？', a: '仅算展开，无工艺门禁。' },
      ],
      en: [
        { q: 'K 0.33 vs 0.38?', a: '0.33 air bend R≈T; 0.38 tight radius. Trial bend wins.' },
        { q: 'Why no pass in Simple?', a: 'Unfold only—no process gates.' },
      ],
    },
    titleStandards: L ? 'Standards & references' : '标准与参考',
    standardsIntro: { zh: '钣金展开无单一国标公式；K 因子法广泛见于模具/ CAM 实践。', en: 'No single national standard for unfold; K-factor widely used in die/CAM practice.' },
    standardsItems: {
      zh: ['ASM Handbook Vol. 14A — 折弯与回弹', '各 OEM 内部 K 因子表 / 试折 DOE', '最小法兰 4T 为常见模具经验（非 ASME 强制）'],
      en: ['ASM Handbook Vol. 14A — bending & springback', 'OEM K-factor tables / trial DOE', 'Min flange 4T is common die practice (not ASME mandatory)'],
    },
    titleLimits: L ? 'Limitations' : '适用边界',
    limitItems: {
      zh: ['未计板料变薄、侧向流动、大角度多道次累积误差。', '回弹模型为线性比例，超高强钢需 FEA/试模。', '4T 法兰规则不适用于翻边、压铆等特殊成形。'],
      en: ['No thinning, side flow, or multi-bend cumulative error.', 'Springback model is linear scaling—UHSS needs FEA/trial.', '4T flange rule not for hemming, PEM, special forming.'],
    },
  })
}

/** @param {'zh'|'en'} locale */
export function getORingHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildHelpBlocks(locale, {
    titleModes: L ? 'Calculation modes' : '计算模式',
    modeOpts: pickLocale(locale, ORING_MODES),
    titleFormulas: L ? 'Formulas' : '公式',
    formulas: ORING_FORMULAS,
    titlePass: L ? 'Pass criteria' : '判定依据',
    passRows: ORING_PASS,
    titleGuide: L ? 'Groove design guide' : '沟槽设计指南',
    guideOpts: pickLocale(locale, {
      zh: {
        intro: '基于 Parker / **ISO 3601** / **AS568** 截面系列的简化沟槽校核；动密封压缩上限更严。',
        sections: [
          { title: '截面系列', bullets: ['1.78 / 2.62 / 3.53 / 5.33 / 6.99 mm（AS568 系列）', '沟槽深 ≈ 0.8·CS 对应 ~20% 压缩'] },
          { title: '材料', bullets: ['NBR：通用油封，100°C', 'FKM：耐化学/高温 200°C', 'EPDM：水/蒸汽，膨胀系数略大'] },
        ],
      },
      en: {
        intro: 'Simplified groove check per Parker / **ISO 3601** / **AS568** sections; dynamic seals use tighter compression.',
        sections: [
          { title: 'Cross-sections', bullets: ['1.78 / 2.62 / 3.53 / 5.33 / 6.99 mm (AS568)', 'Groove depth ≈ 0.8·CS → ~20% compression'] },
          { title: 'Materials', bullets: ['NBR: general oil, 100°C', 'FKM: chemical/high temp 200°C', 'EPDM: water/steam, higher swell'] },
        ],
      },
    }),
    titleExamples: L ? 'Worked example' : '算例',
    exampleRows: {
      zh: [
        { step: '输入', detail: 'CS=3.53 mm，动密封 p=10 MPa，C%=18%，W_g=4.8 mm，Fill 计算' },
        { step: '压缩', detail: '18% 在 12–20% → compressionOk ✓' },
        { step: '宽度', detail: '4.8 ∈ [4.24, 5.65] → widthOk ✓' },
        { step: '完整', detail: 'g=0.15 ≤ g_max≈0.17 → extrusionPass ✓' },
      ],
      en: [
        { step: 'Inputs', detail: 'CS=3.53 mm, dynamic p=10 MPa, C%=18%, W_g=4.8 mm' },
        { step: 'Compression', detail: '18% within 12–20% → compressionOk ✓' },
        { step: 'Width', detail: '4.8 ∈ [4.24, 5.65] → widthOk ✓' },
        { step: 'Full', detail: 'g=0.15 ≤ g_max≈0.17 → extrusionPass ✓' },
      ],
    },
    titleHowToPass: L ? 'How to pass' : '如何让判定通过',
    howToPassItems: {
      zh: [
        { goal: '压缩/填充', steps: ['动密封 C% 提到 12–20 内', 'Fill 65–85%：调整沟槽深或宽', '沟槽宽 1.2–1.6·CS'] },
        { goal: '高压动密封', steps: ['减小挤隙 g', '专业模式确认 p ≤ p_max', '必要时加挡圈'] },
      ],
      en: [
        { goal: 'Compression/fill', steps: ['Dynamic C% within 12–20%', 'Fill 65–85%: adjust groove depth/width', 'Width 1.2–1.6·CS'] },
        { goal: 'High-pressure dynamic', steps: ['Reduce extrusion gap g', 'Pro: confirm p ≤ p_max', 'Add backup ring if needed'] },
      ],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faqRows: {
      zh: [
        { q: 'Fill% 超过 85%？', a: '沟槽容积不足，易挤坏 O 圈——加深或加宽沟槽，或减小 CS。' },
        { q: '静密封能否用 30% 压缩？', a: '工具上限 25%（简化）/ 20%（动压完整）；过高永久变形。' },
      ],
      en: [
        { q: 'Fill% above 85%?', a: 'Insufficient gland volume—deepen/widen groove or reduce CS.' },
        { q: '30% compression static?', a: 'Tool caps 25% (simple) / 20% dynamic full—excessive set.' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '沟槽尺寸与公差详见标准原文；本工具为设计初筛。', en: 'See standards for groove tolerances; this tool is for early screening.' },
    standardsItems: {
      zh: ['**ISO 3601-1/2** — O 型圈尺寸与沟槽', '**AS568** — 英寸系列对照', 'Parker O-Ring Handbook — 挤隙/挡圈'],
      en: ['**ISO 3601-1/2** — O-ring sizes & grooves', '**AS568** — inch series', 'Parker O-Ring Handbook — extrusion/backup rings'],
    },
    titleLimits: L ? 'Limitations' : '适用边界',
    limitItems: {
      zh: ['未含旋转密封、挡圈详细设计、化学溶胀全曲线。', '接触应力/密封压力为估算，非 FEA 接触分析。', '热膨胀项为线性 ΔCS，未含材料模量温度曲线。'],
      en: ['No rotary seals, backup ring detail, or full swell curves.', 'Contact/sealing pressure is estimated—not FEA contact.', 'Thermal term is linear ΔCS, no modulus vs T.'],
    },
  })
}

/** @param {'zh'|'en'} locale */
export function getCylinderHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildHelpBlocks(locale, {
    titleModes: L ? 'Calculation modes' : '计算模式',
    modeOpts: pickLocale(locale, CYLINDER_MODES),
    titleFormulas: L ? 'Formulas' : '公式',
    formulas: CYLINDER_FORMULAS,
    titlePass: L ? 'Pass criteria' : '判定依据',
    passRows: CYLINDER_PASS,
    titleGuide: L ? 'Cylinder sizing guide' : '缸径选型指南',
    guideOpts: pickLocale(locale, {
      zh: {
        intro: '液压/气缸共用面积力学；气缸效率 η 默认 0.85 作用于出力。',
        sections: [
          { title: '屈曲边界', body: 'END_FIXITY_PRESETS：fixed_fixed K=0.5 … fixed_free K=2.0', bullets: ['默认 pinned_pinned K=1.0', 'compressOnRetract 默认 true：外载压缩杆在缩回工况'] },
          { title: '专业动态', body: 'dynamicLoad = m(g+a)；须 extendForce 覆盖。' },
        ],
      },
      en: {
        intro: 'Hydraulic/pneumatic share area mechanics; pneumatic η default 0.85 on force.',
        sections: [
          { title: 'Buckling ends', body: 'END_FIXITY_PRESETS: fixed_fixed K=0.5 … fixed_free K=2.0', bullets: ['Default pinned_pinned K=1.0', 'compressOnRetract default true: rod in compression on retract'] },
          { title: 'Pro dynamic', body: 'dynamicLoad = m(g+a); extendForce must cover.' },
        ],
      },
    }),
    titleExamples: L ? 'Worked example' : '算例',
    exampleRows: {
      zh: [
        { step: '输入', detail: 'D=50 mm，d=28 mm，p=16 MPa，F_load=25 kN，完整模式' },
        { step: '伸出力', detail: '$F_{ext}=16\\times\\pi\\cdot50^2/4\\approx 31.4$ kN' },
        { step: '裕度', detail: '31.4 > 25 → loadPass ✓' },
        { step: '屈曲', detail: '若杆长 800 mm、d=28、K=1：校核 P_cr vs 25 kN' },
      ],
      en: [
        { step: 'Inputs', detail: 'D=50 mm, d=28 mm, p=16 MPa, F_load=25 kN, Full mode' },
        { step: 'Extend', detail: '$F_{ext}=16\\times\\pi\\cdot50^2/4\\approx 31.4$ kN' },
        { step: 'Margin', detail: '31.4 > 25 → loadPass ✓' },
        { step: 'Buckling', detail: 'Rod L=800 mm, d=28, K=1: check P_cr vs 25 kN' },
      ],
    },
    titleHowToPass: L ? 'How to pass' : '如何让判定通过',
    howToPassItems: {
      zh: [
        { goal: '载荷', steps: ['增大 D 或 p', '缩回载荷大时关注 annular 面积'] },
        { goal: '屈曲', steps: ['缩短 stroke / 增大 d', '改善端部约束降低 K', '确认 compressOnRetract 与实际工况一致'] },
      ],
      en: [
        { goal: 'Load', steps: ['Increase D or p', 'Retract-heavy load: check annular area'] },
        { goal: 'Buckling', steps: ['Shorten stroke / increase d', 'Better end fixity lowers K', 'Match compressOnRetract to actual case'] },
      ],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faqRows: {
      zh: [
        { q: '为何简化 pass=false？', a: 'estimateOnly；须完整模式输入外载与杆长。' },
        { q: 'Euler 还是 Johnson？', a: '代码取 P_euler 与 Johnson/屈服较小值 governing。' },
      ],
      en: [
        { q: 'Why Simple pass=false?', a: 'estimateOnly; need Full mode with load and rod length.' },
        { q: 'Euler or Johnson?', a: 'Code uses min of Euler and Johnson/yield as governing.' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '缸筒/杆径系列见 GB/T 2348、ISO 6020 等；屈曲参考欧拉/Johnson 柱稳定。', en: 'Bore/rod series: GB/T 2348, ISO 6020; buckling: Euler/Johnson column stability.' },
    standardsItems: {
      zh: ['GB/T 2348 — 液压缸缸筒与活塞杆尺寸', 'ISO 6020 — 缸径系列', '经典柱稳定：Euler / Johnson 过渡'],
      en: ['GB/T 2348 — cylinder bore & rod sizes', 'ISO 6020 — bore series', 'Column stability: Euler / Johnson transition'],
    },
    titleLimits: L ? 'Limitations' : '适用边界',
    limitItems: {
      zh: ['未计密封摩擦、背压、加速度液压冲击。', '屈曲为弹性/Johnson 简化，非 FE 杆系。', '气缸 η 为标况经验值。'],
      en: ['No seal friction, back pressure, or hydraulic shock.', 'Buckling is elastic/Johnson simplified—not FE rod.', 'Pneumatic η is standard-condition empirical.'],
    },
  })
}

/** @param {'zh'|'en'} locale */
export function getThermalExpansionHelp(locale = 'zh') {
  const L = locale === 'en'
  return buildHelpBlocks(locale, {
    titleModes: L ? 'Calculation modes' : '计算模式',
    modeOpts: pickLocale(locale, THERMAL_MODES),
    titleFormulas: L ? 'Formulas' : '公式',
    formulas: THERMAL_FORMULAS,
    titlePass: L ? 'Pass criteria' : '判定依据',
    passRows: THERMAL_PASS,
    titleGuide: L ? 'Thermal fit guide' : '热装/温升指南',
    guideOpts: pickLocale(locale, {
      zh: {
        intro: '材料库 α 含 referenceTemp 与 alphaTempCoeff；专业模式默认 **useAlphaTemperature**。界面 α 填 **×10⁻⁶ 数值**（钢≈11.5），计算时再换算为物理 α。',
        sections: [
          { title: '双材料配合', bullets: ['轴 α₁、孔 α₂ 可不同', 'ΔT>0 且 α_shaft>α_hole → 过盈增大（钢轴铝孔反之）'] },
          { title: '分步温升', bullets: ['assemblyΔT：装配态', 'serviceΔT：服役相对装配再叠加'] },
          { title: '关键输入', bullets: ['完整/专业待确认字段：琥珀色边框 + *', '数值仍显示，总判待复核直至确认', '与过盈配合页不同：彼处专业 α 填物理值'] },
        ],
      },
      en: {
        intro: 'Material library α includes referenceTemp & alphaTempCoeff; Professional defaults **useAlphaTemperature**. UI α is a **×10⁻⁶ magnitude** (steel ≈ 11.5), scaled to physical α in calc.',
        sections: [
          { title: 'Dual-material fit', bullets: ['Shaft α₁, hole α₂ may differ', 'ΔT>0 & α_shaft>α_hole → interference increases'] },
          { title: 'Stepped heating', bullets: ['assemblyΔT: assembly state', 'serviceΔT: service increment over assembly'] },
          { title: 'Critical inputs', bullets: ['Full/Pro pending fields: amber border + *', 'Values stay visible; status=review until confirmed', 'Unlike interference-fit page, which uses physical α'] },
        ],
      },
    }),
    titleExamples: L ? 'Worked example' : '算例',
    exampleRows: {
      zh: [
        { step: '输入', detail: '轴 30H7 孔 29.98 轴，钢/钢，ΔT=80°C，完整' },
        { step: '膨胀', detail: 'Δd≈11.5e-6×30×80=0.0276 mm；ΔD 同' },
        { step: '过盈', detail: 'ΔI≈0 → I_f≈I₀，仍过盈' },
        { step: '判定', detail: 'becomesClearance=false → pass ✓' },
      ],
      en: [
        { step: 'Inputs', detail: 'Shaft 29.98 in 30H7, steel/steel, ΔT=80°C, Full' },
        { step: 'Expansion', detail: 'Δd≈11.5e-6×30×80=0.0276 mm; ΔD same' },
        { step: 'Interference', detail: 'ΔI≈0 → I_f≈I₀, still interference' },
        { step: 'Verdict', detail: 'becomesClearance=false → pass ✓' },
      ],
    },
    titleHowToPass: L ? 'How to pass' : '如何让判定通过',
    howToPassItems: {
      zh: [{ goal: '保持过盈', steps: ['选 α 大者为轴、小者为孔（或降温装配）', '专业：分步核算 service 最高温', '确认关键输入 deltaT / assembly/service'] }],
      en: [{ goal: 'Keep interference', steps: ['Higher α on shaft, lower on hole (or cold assembly)', 'Pro: step service peak temperature', 'Confirm critical deltaT / assembly/service inputs'] }],
    },
    titleFaq: L ? 'FAQ' : '常见问题',
    faqRows: {
      zh: [
        { q: 'α 怎么填？', a: '本页填 ×10⁻⁶ 数值（钢≈11.5）。过盈配合页专业模式填物理 α（如 11.5e-6）。' },
        { q: 'α 是否随温度变？', a: '专业模式可选 α(T) 线性修正；简化/完整用常数 α。' },
        { q: '与干涉配合页关系？', a: '本页温升 ΔI；干涉配合页算装配力/应力。可组合使用。' },
      ],
      en: [
        { q: 'How to enter α?', a: 'This page: ×10⁻⁶ magnitude (steel ≈ 11.5). Interference-fit Professional: physical α (e.g. 11.5e-6).' },
        { q: 'Temperature-dependent α?', a: 'Pro optional linear α(T); Simple/Full use constant α.' },
        { q: 'vs interference-fit page?', a: 'This page: thermal ΔI; interference page: assembly force/stress.' },
      ],
    },
    titleStandards: L ? 'Standards' : '标准',
    standardsIntro: { zh: '线膨胀系数取自材料手册；配合设计见 ISO 286 / GB/T 1800。', en: 'α from material handbooks; fits per ISO 286 / GB/T 1800.' },
    standardsItems: {
      zh: ['ISO 286 / GB/T 1800 — 公差与配合', 'ASM/material tables — α 参考值', 'THERMAL_ALPHA_DEFINITION 见 thermal-expansion-calc.js'],
      en: ['ISO 286 / GB/T 1800 — tolerances & fits', 'ASM/material tables — α reference', 'THERMAL_ALPHA_DEFINITION in thermal-expansion-calc.js'],
    },
    titleLimits: L ? 'Limitations' : '适用边界',
    limitItems: {
      zh: [
        '未含瞬态热应力、非线性 α、相变。',
        '长杆/薄壁非均匀温度场未建模。',
        '变间隙仅判 I_f<0，不给出最小过盈安全裕度（专业仅示 interferenceMargin）。',
        '界面 α 为 ×10⁻⁶ 输入约定，勿与过盈配合页物理 α 混用。',
      ],
      en: [
        'No transient thermal stress, nonlinear α, or phase change.',
        'Non-uniform fields in long/thin parts not modeled.',
        'Clearance check is I_f<0 only—min interference margin shown in Pro only.',
        'UI α uses ×10⁻⁶ entry—do not mix with physical α on the interference-fit page.',
      ],
    },
  })
}

/** @param {'zh'|'en'} locale */
export function getPipeFlowHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: 'Darcy 沿程压降；不计局部损失',
          completeModel: '+局部 K + Hazen-Williams 沿程对照',
          proModel: '流速/压降双限 pass + 冲蚀粗评',
          simplePass: '**无 pass**',
          completePass: '无硬性 pass；展示对照 Δ%',
          proPass: 'velocityPass ∧ pressurePass',
          simpleCaveat: '单段直管',
          completeCaveat: 'H-W 仅适用于水',
          proCaveat: '冲蚀阈值为经验值',
        },
        en: {
          simpleModel: 'Darcy friction only; no local loss',
          completeModel: '+ local K + Hazen-Williams friction compare',
          proModel: 'Velocity/Δp dual limit + coarse erosion',
          simplePass: '**No pass**',
          completePass: 'No hard pass; shows compare Δ%',
          proPass: 'velocityPass ∧ pressurePass',
          simpleCaveat: 'Single straight run',
          completeCaveat: 'H-W is for water only',
          proCaveat: 'Erosion thresholds are empirical',
        },
      }))),
      formulasBlock(L ? 'Pipe (Darcy-Weisbach)' : '管路 (Darcy-Weisbach)', pickLocale(locale, STRUCTURAL_PIPE_FORMULAS)),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [{ check: '专业', rule: 'v ≤ v_max 且 ΔP_total ≤ ΔP_max' }],
        en: [{ check: 'Pro', rule: 'v ≤ v_max and ΔP_total ≤ ΔP_max' }],
      })),
      guideBlock(L ? 'Guide' : '指南', pickLocale(locale, {
        zh: {
          intro: '单页工具：**管路压降**（Darcy / 局部损失 / 流速校核）。',
          sections: [
            { title: '流态', bullets: ['Re<2300 层流；2300–4000 过渡；>4000 湍流', '专业：erosionRisk v>3 中、>5 高', '流体预设：水/油/空气 ρ、μ'] },
          ],
        },
        en: {
          intro: 'Standalone tool: **pipe pressure drop**.',
          sections: [
            { title: 'Regime', bullets: ['Re<2300 laminar; 2300–4000 transition; >4000 turbulent', 'Pro: erosion medium v>3, high v>5', 'Presets: water/oil/air'] },
          ],
        },
      })),
      faqBlock(L ? 'FAQ' : '常见问题', pickLocale(locale, {
        zh: [{ q: 'Darcy 与 Hazen-Williams 差很多？', a: '对照只用沿程压降（不含局部 K）。默认 C=130；油/气不适用 H-W。' }],
        en: [{ q: 'Darcy vs Hazen-Williams differ?', a: 'Compare uses friction Δp only (no local K). Default C=130; H-W is for water.' }],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: ['单直管段，未含配件库、可压缩气体详细模型。'],
        en: ['Single straight run; no fitting library or detailed compressible gas model.'],
      })),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getPlateBucklingHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: '表值 k 的弹性屈曲应力与 SF',
          completeModel: '+横向应力 +缺陷系数 η',
          proModel: '+面内剪切 +后屈曲 σ_pb≈φ·σ_cr',
          simplePass: 'SF ≥ minSafety（默认 2）',
          completePass: '同左',
          proPass: 'SF ∧ τ（有剪切时）',
          simpleCaveat: 'k 不随 a/b 半波数变化',
          completeCaveat: 'η 为经验折减',
          proCaveat: '后屈曲为估算，非极限减临界',
        },
        en: {
          simpleModel: 'Elastic buckling with tabulated k and SF',
          completeModel: '+ transverse stress + imperfection η',
          proModel: '+ in-plane shear + post-buckling σ_pb≈φ·σ_cr',
          simplePass: 'SF ≥ minSafety (default 2)',
          completePass: 'Same as left',
          proPass: 'SF ∧ τ when shear > 0',
          simpleCaveat: 'k not refined by a/b half-waves',
          completeCaveat: 'η is empirical',
          proCaveat: 'Post-buckling is an estimate, not σ_ult−σ_cr',
        },
      }))),
      formulasBlock(L ? 'Plate buckling' : '薄板屈曲', pickLocale(locale, STRUCTURAL_PLATE_FORMULAS)),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [{ check: '薄板', rule: 'SF ≥ minSafety（默认 2）；专业另校 τ' }],
        en: [{ check: 'Plate', rule: 'SF ≥ minSafety (default 2); Pro also checks τ' }],
      })),
      guideBlock(L ? 'Guide' : '指南', pickLocale(locale, {
        zh: {
          intro: '单页工具：**薄板屈曲**。',
          sections: [
            { title: '边界与缺陷', bullets: ['SSSS k=4 … CCCC k≈6.97', 'imperfectionFactor 默认 0.8', 'minSafety 默认 2'] },
          ],
        },
        en: {
          intro: 'Standalone tool: **plate buckling**.',
          sections: [
            { title: 'Edges & imperfection', bullets: ['SSSS k=4 … CCCC k≈6.97', 'imperfectionFactor default 0.8', 'minSafety default 2'] },
          ],
        },
      })),
      faqBlock(L ? 'FAQ' : '常见问题', pickLocale(locale, {
        zh: [{ q: 'SF≈1.5 仍显示可能失稳？', a: '默认要求 SF≥2；可在完整+中调整要求安全系数。' }],
        en: [{ q: 'SF≈1.5 still fails?', a: 'Default required SF is 2; adjust in Full+.' }],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: ['弹性屈曲估算；专业圆筒外压为 Donnell 长筒 estimateOnly。'],
        en: ['Elastic buckling estimate; Pro cylinder external pressure is Donnell long-shell estimateOnly.'],
      })),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getColumnBucklingHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: '欧拉 $P_e$；细长杆估算',
          completeModel: '按 λ 切换 Rankine；$f_y$ 必填',
          proModel: '偏心放大 $\\sigma_{max}$',
          simplePass: 'SF ≥ minSafety（默认 2）；estimateOnly',
          completePass: '同左',
          proPass: 'SF ∧ 偏心屈服',
          simpleCaveat: '端部 μ 与缺陷需人工确认',
          completeCaveat: '中长柱用 Rankine 经验式',
          proCaveat: '偏心模型简化，非完整二阶分析',
        },
        en: {
          simpleModel: 'Euler $P_e$; slender estimate',
          completeModel: 'Rankine by λ; $f_y$ required',
          proModel: 'Eccentric $\\sigma_{max}$ amplification',
          simplePass: 'SF ≥ minSafety (default 2); estimateOnly',
          completePass: 'Same',
          proPass: 'SF ∧ eccentric yield',
          simpleCaveat: 'Confirm μ and imperfections',
          completeCaveat: 'Rankine is empirical',
          proCaveat: 'Simplified eccentricity—not full 2nd-order analysis',
        },
      }))),
      formulasBlock(L ? 'Column buckling' : '柱屈曲', [
        { name: L ? 'Euler' : '欧拉', latex: 'P_e = \\frac{\\pi^2 E I}{(\\mu L)^2}', note: L ? 'Slender' : '细长柱' },
        { name: L ? 'Slenderness' : '长细比', latex: '\\lambda = \\mu L / i', note: 'i=\\sqrt{I/A}' },
        { name: 'Rankine', latex: '\\frac{1}{\\sigma_r}=\\frac{1}{f_y}+\\frac{1}{\\sigma_E}', note: L ? 'Intermediate' : '中长柱' },
      ]),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [{ check: '柱', rule: '$P_{cr}/F \\ge$ minSafety（默认 2）' }],
        en: [{ check: 'Column', rule: '$P_{cr}/F \\ge$ minSafety (default 2)' }],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: ['理想直杆；未含残余应力与局部屈曲。'],
        en: ['Ideal straight member; no residual stress or local buckling.'],
      })),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getPinRetainerHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: '销剪/挤或挡圈环剪/沟槽',
          completeModel: '可调许用 + 推荐销径/轴向许用',
          proModel: '销 Kt；挡圈转速折减',
          simplePass: '应力 ≤ 许用/SF；estimateOnly',
          completePass: '同左',
          proPass: '另计疲劳当量 / 转速',
          simpleCaveat: '默认许用为工程常用值',
          completeCaveat: '材料牌号请自行核对',
          proCaveat: '挡圈转速折减为经验式',
        },
        en: {
          simpleModel: 'Pin shear/bearing or ring/groove',
          completeModel: 'Adjust allowables + recommended Ø / axial',
          proModel: 'Pin Kt; ring speed derating',
          simplePass: 'Stress ≤ allow/SF; estimateOnly',
          completePass: 'Same',
          proPass: 'Plus fatigue equiv. / speed',
          simpleCaveat: 'Default allowables are typical values',
          completeCaveat: 'Confirm material grades',
          proCaveat: 'Speed derating is empirical',
        },
      }))),
      formulasBlock(L ? 'Pin / ring' : '销 / 挡圈', [
        { name: L ? 'Pin shear' : '销剪切', latex: '\\tau = \\frac{4F}{n\\pi d^2}', note: 'n=1|2' },
        { name: L ? 'Pin bearing' : '销挤压', latex: '\\sigma_b = F/(d t)', note: '' },
        { name: L ? 'Ring shear' : '挡圈环剪', latex: '\\tau \\approx F/(\\pi d s)', note: L ? 'Simplified' : '简化' },
      ]),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [{ check: '销/挡圈', rule: '各应力 ≤ 许用 / SF' }],
        en: [{ check: 'Pin/ring', rule: 'Each stress ≤ allowable / SF' }],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: ['挡圈正式选型以厂家样本为准。'],
        en: ['Use manufacturer catalogs for retaining-ring release.'],
      })),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getGasketFlangeHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: '坐落/工况比压估算（estimateOnly）',
          completeModel: 'σ_seat≥y、σ_op≥m·p、总预紧 ≥ 建议值',
          proModel: '完整 + 安全系数 + 螺栓数均匀性提示',
          simplePass: '**pass 恒 false**',
          completePass: '坐落 ∧ 工况 ∧ 容量',
          proPass: '同完整（含 SF）',
          simpleCaveat: '方案级',
          completeCaveat: 'm、y 简化表',
          proCaveat: '非正式 ASME 放行',
        },
        en: {
          simpleModel: 'Seating/operating stress estimate (estimateOnly)',
          completeModel: 'σ_seat≥y, σ_op≥m·p, total preload ≥ required',
          proModel: 'Full + SF + bolt-count uniformity hint',
          simplePass: '**pass always false**',
          completePass: 'seating ∧ operating ∧ capacity',
          proPass: 'Same as full (with SF)',
          simpleCaveat: 'Concept stage',
          completeCaveat: 'Simplified m, y table',
          proCaveat: 'Not formal ASME release',
        },
      }))),
      formulasBlock(L ? 'Gasket seal' : '垫片密封', [
        { name: L ? 'Area' : '面积', latex: 'A_g=\\pi/4(D_o^2-D_i^2)', note: '' },
        { name: L ? 'Seating' : '坐落', latex: '\\sigma_{seat}=n F_0/A_g \\ge y', note: '' },
        { name: L ? 'Operating' : '工况', latex: '\\sigma_{op}=(n F_0-p A_i)/A_g \\ge m p', note: '' },
      ]),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [
          { check: '简化', rule: 'estimateOnly，pass=false' },
          { check: '完整/专业', rule: '坐落 ∧ 工况 ∧ 总预紧容量' },
        ],
        en: [
          { check: 'Simple', rule: 'estimateOnly, pass=false' },
          { check: 'Full/Pro', rule: 'seating ∧ operating ∧ capacity' },
        ],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: ['环形垫片简化；未计法兰刚度、蠕变与热循环。正式设计按垫片样本与法兰标准。'],
        en: ['Annular gasket simplification; no flange stiffness, creep, or thermal cycling. Use catalogs and flange codes for release.'],
      })),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getModalFreqHelp(locale = 'zh') {
  const L = locale === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式', stdCalcModes(locale, pickLocale(locale, {
        zh: {
          simpleModel: 'SDOF/梁一阶 fn；可填激励看裕度',
          completeModel: '+临界转速 +rpm 运行共振',
          proModel: '+阻尼比与位移传递率 H(r)；pass=M≥20%',
          simplePass: '有 f_exc 时显示评估；**无硬性 pass**',
          completePass: '同左',
          proPass: 'resonance.pass（M≥20%）',
          simpleCaveat: '一阶近似',
          completeCaveat: '转速与激励宜一致理解',
          proCaveat: 'H(r) 非共振 Q',
        },
        en: {
          simpleModel: 'SDOF/first beam fn; optional excitation margin',
          completeModel: '+ critical speed + rpm operating resonance',
          proModel: '+ damping and H(r); pass if M≥20%',
          simplePass: 'Shows assessment with f_exc; **no hard pass**',
          completePass: 'Same as left',
          proPass: 'resonance.pass (M≥20%)',
          simpleCaveat: 'First-mode only',
          completeCaveat: 'rpm and f_exc should be interpreted together',
          proCaveat: 'H(r) is not resonant Q',
        },
      }))),
      formulasBlock(L ? 'Modal' : '固有频率', pickLocale(locale, STRUCTURAL_MODAL_FORMULAS)),
      passBlock(L ? 'Pass criteria' : '判定', pickLocale(locale, {
        zh: [{ check: '专业', rule: '有激励时 M≥20%；无激励则 pass=true' }],
        en: [{ check: 'Pro', rule: 'With excitation M≥20%; none → pass=true' }],
      })),
      guideBlock(L ? 'Guide' : '指南', pickLocale(locale, {
        zh: {
          intro: '单页工具：**固有频率 / 共振裕度**。',
          sections: [
            { title: '模型', bullets: ['sdof / beam_ss / beam_cant', 'M<10% 危险；10–20% 关注；≥20% 安全', 'criticalSpeed = fn×60 rpm'] },
          ],
        },
        en: {
          intro: 'Standalone tool: **natural frequency / resonance margin**.',
          sections: [
            { title: 'Models', bullets: ['sdof / beam_ss / beam_cant', 'M<10% danger; 10–20% caution; ≥20% safe', 'criticalSpeed = fn×60 rpm'] },
          ],
        },
      })),
      faqBlock(L ? 'FAQ' : '常见问题', pickLocale(locale, {
        zh: [{ q: '放大因子为何只有 1.04？', a: '显示的是非共振传递率 H(r)，不是 Q=1/(2ζ)。' }],
        en: [{ q: 'Why is amplification only 1.04?', a: 'It is transmissibility H(r), not resonant Q=1/(2ζ).' }],
      })),
      limitsBlock(L ? 'Limitations' : '适用边界', pickLocale(locale, {
        zh: ['一阶近似；未含支撑刚度、连接非线性、完整 FE 模态。'],
        en: ['First mode only; no support stiffness, joint nonlinearity, or full FE modal.'],
      })),
    ],
  }
}
