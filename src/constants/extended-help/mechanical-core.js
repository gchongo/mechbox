/**
 * 机械核心工具扩展帮助 — 齿轮 / 螺纹 / 螺栓预紧 / 轴承
 * 与 analyzeGear、analyzeThreadStrength、analyzeBoltPreload、analyzeBearingLife 判定一致
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

// ─── Gear ───────────────────────────────────────────────────────────────────

const GEAR = {
  zh: {
    modesSub: '简化 Lewis / 完整 ISO 6336 / 专业 ISO+AGMA 对照 — 与 /gear 页 calcMode 一致',
    formulasSub: '与 gear-calc.js、gear-iso6336.js、gear-agma.js 实现一致',
    passSub: '默认 $S_{H,\\min}=1.0$、$S_{F,\\min}=1.4$；可在表单修改',
    guideSub: '齿面接触与齿根弯曲须分别校核；专业模式两套标准均须通过',
    examplesSub: '典型输入下的判定路径（数量级示意，非唯一解）',
    faqTitle: '齿轮强度 FAQ',
    howToTitle: '如何让齿轮判定通过',
    limitsTitle: '适用边界与简化假设',
    standardsTitle: '相关标准',
    standardsIntro: 'MechBox 齿轮页为 ISO 6336 / AGMA 2101 思路的 **工程简化** 实现，非完整标准计算书。',
    modes: stdCalcModes('zh', {
      simpleModel: 'Lewis 弯曲 + 118·√(…) 接触估算；单材料',
      completeModel: 'ISO 6336 接触/弯曲；$K_A,K_V,K_{H\\beta},K_{H\\alpha}$ 等；ISO 1328 链动载',
      proModel: '完整 + **AGMA 2101 简化** 并排；compare.bothPass',
      simplePass: '**pass 恒为 false**（estimateOnly）；仍显示应力与分项 ✓/✗',
      completePass: '**pass = (S_H\\ge S_{H,\\min}) \\land (S_F\\ge S_{F,\\min})$**；默认 $S_H\\ge1$，$S_F\\ge1.4$',
      proPass: '**pass = compare.bothPass**：ISO 与 AGMA 的 contactPass **且** bendingPass **均须** ✓',
      simpleCaveat: '只看数量级；许用值由材料极限÷安全系数或手填',
      completeCaveat: '未含胶合、胶合温度、微点蚀等 ISO 6336 全套条款',
      proCaveat: 'AGMA 与 ISO 应力式不同，同参 SH/SF 可差 10%～30%',
    }),
    formulas: [
      { name: '圆周力', latex: 'F_t = \\frac{2000 T}{d_1}', note: '$T$ (N·m)，小齿轮分度圆直径 $d_1$ (mm)' },
      { name: 'ISO 6336 接触应力', latex: '\\sigma_H = Z_B Z_H Z_E Z_\\varepsilon Z_\\beta \\sqrt{\\frac{F_t}{b d_1}\\frac{u+1}{u} K_A K_V K_{H\\beta} K_{H\\alpha}}', note: '钢-钢 $Z_E=189.8$ N/mm$^{0.5}$' },
      { name: 'ISO 6336 弯曲应力', latex: '\\sigma_F = \\frac{F_t}{b m_n} Y_F Y_S Y_\\beta K_A K_V K_{F\\beta} K_{F\\alpha}', note: '$Y_F$ 由齿数查表；$Y_S$ 应力修正' },
      { name: '接触安全系数', latex: 'S_H = \\frac{\\sigma_{H,\\lim}}{\\sigma_H}', note: '两齿轮取 $\\min(\\sigma_{H,\\lim})$；contactPass = $S_H\\ge S_{H,\\min}$' },
      { name: '弯曲安全系数', latex: 'S_F = \\frac{\\sigma_{F,\\lim}}{\\sigma_F}', note: 'bendingPass = $S_F\\ge S_{F,\\min}$（默认 1.4）' },
      { name: '简化 Lewis 弯曲', latex: '\\sigma_F = \\frac{F_t}{b m Y}', note: '简化模式；$Y$ 默认 2.65' },
    ],
    passChecks: [
      { check: '简化模式', rule: '**pass 恒 false**（estimateOnly）；bendingPass/contactPass 仍按手填许用比较' },
      { check: '完整 · 接触', rule: 'contactPass ⇔ $S_H=\\sigma_{H,\\lim}/\\sigma_H \\ge S_{H,\\min}$（默认 1.0）' },
      { check: '完整 · 弯曲', rule: 'bendingPass ⇔ $S_F=\\sigma_{F,\\lim}/\\sigma_F \\ge S_{F,\\min}$（默认 1.4）' },
      { check: '完整 · 综合', rule: '**pass = bendingPass ∧ contactPass**' },
      { check: '专业 · 双标准', rule: '**pass = bothPass**：ISO 与 AGMA 各自 contactPass **且** bendingPass 全部为真' },
      { check: 'AGMA 接触/弯曲', rule: 'AGMA 用 $C_p,I,J,K_o,K_v,K_m,K_s$ 独立算应力，再与同一材料极限比 SH/SF' },
    ],
    guide: {
      intro: '齿轮页同时校核 **齿面接触疲劳（点蚀）** 与 **齿根弯曲疲劳（断齿）**。完整模式走 ISO 6336 简化链；专业模式再算 AGMA 对照，**两套都必须过** 才放行。',
      sections: [
        {
          title: '1. 输入与载荷系数',
          bullets: [
            '扭矩 $T$、小齿轮齿数 $z_1$、大齿轮齿数 $z_2$、模数 $m$、齿宽 $b$ 决定 $F_t$',
            '应用系数 $K_A$（默认 1.25）、动载 $K_V$（可由 ISO 1328 精度等级与线速度估算）',
            '齿向/齿间载荷分配 $K_{H\\beta},K_{H\\alpha},K_{F\\beta},K_{F\\alpha}$ 影响接触与弯曲',
            '变位系数 $x_1,x_2$ 改变分度圆直径 $d_1=m(z_1+2x_1)$',
          ],
        },
        {
          title: '2. 材料与极限应力',
          bullets: [
            '小齿轮/大齿轮可分别选材料；极限取两者 **较小** $\\sigma_{H,\\lim},\\sigma_{F,\\lim}$',
            '简化模式用手填 allowBending / allowContact 或材料库 ÷ 安全系数',
            '完整/专业从 GEAR_MATERIALS 读 σHlim、σFlim',
          ],
        },
        {
          title: '3. 专业模式 ISO vs AGMA',
          bullets: [
            '右栏 compare 表并排接触/弯曲应力与 SH、SF',
            '**bothPass** 要求 ISO contactPass ∧ ISO bendingPass ∧ AGMA contactPass ∧ AGMA bendingPass',
            '某一标准 ✓ 另一 ✗ 时综合 **未通过** — 应调参或确认以哪套标准为签审依据',
          ],
        },
      ],
    },
    examples: [
      { step: '简化·估算', detail: '$m=2,z_1=24,T=50$ N·m → $F_t\\approx4167$ N；显示 σF/σH 与分项 ✓/✗，**pass=false**' },
      { step: '完整·双项通过', detail: '调齿宽/材料使 $S_H\\ge1$ 且 $S_F\\ge1.4$ → contactPass ✓ bendingPass ✓ → **pass ✓**' },
      { step: '完整·弯曲不足', detail: '$S_F=1.2<S_{F,\\min}=1.4$ → bendingPass ✗；即使 $S_H=1.5$ 仍 **pass ✗**' },
      { step: '专业·AGMA 卡边', detail: 'ISO 均 ✓ 但 AGMA $S_F=1.35<1.4$ → bothPass ✗ → **pass ✗**' },
      { step: '线速度', detail: '高 rpm 提高 $K_V$ → σH/σF 上升；精度等级 6→8 可显著降 $K_V$' },
    ],
    howToPass: [
      {
        goal: '完整模式通过',
        steps: [
          '优先增大齿宽 $b$ 或模数 $m$（降 σF、σH）',
          '提高材料 σHlim/σFlim 或降低 $K_A$、$K_V$',
          '确认 $S_{H,\\min}$、$S_{F,\\min}$ 与任务书一致（默认 1.0 / 1.4）',
          'contactPass 与 bendingPass **缺一不可**',
        ],
      },
      {
        goal: '专业模式通过',
        steps: [
          '先令 ISO 完整模式通过，再对照 AGMA 列',
          'AGMA 弯曲常更敏感 — 齿数少时查 $J$ 因子',
          '两标准 SH/SF 目标相同；**bothPass** 才显示综合 ✓',
        ],
      },
    ],
    faq: [
      { q: '简化模式分项 ✓ 为何 pass ✗？', a: '简化 **estimateOnly**，pass 恒 false。仅作量级筛选，不能作放行。' },
      { q: 'SH 和 SF 默认下限？', a: '代码默认 $S_{H,\\min}=1.0$、$S_{F,\\min}=1.4$；表单可改 minSafetyContact / minSafetyBending。' },
      { q: '专业模式 ISO 过 AGMA 不过？', a: '正常。AGMA 用 $I,J,K_m$ 等，应力与 ISO 不同。**bothPass** 要求两套都过。' },
      { q: '变位对结果影响？', a: '变位改变 $d_1,d_2$ 进而改变 $F_t$ 与几何系数；大变位需复核 ISO 6336 完整公式。' },
      { q: '斜齿怎么填？', a: '输入螺旋角 β；代码用 $Z_\\beta,Y_\\beta$ 简化修正，非全套斜齿 ISO 6336。' },
      { q: 'ISO 1328 精度链？', a: 'useISO1328 时由精度等级与 $v$ 估算 $K_V$；也可手覆盖 dynamicFactor。' },
    ],
    standards: [
      '**ISO 6336-1～3** — 直/斜齿圆柱齿轮承载能力（接触、弯曲；本工具为简化子集）',
      '**ISO 1328-1** — 齿轮精度等级，用于动载系数链',
      '**AGMA 2101-D04** — 金属圆柱齿轮额定（简化 AGMA 2101 对照）',
      '**GB/T 3480** — 国标齿轮承载能力，与 ISO 6336 同源思路',
    ],
    limitations: [
      '未含胶合、微点蚀、齿面断裂、塑性变形等失效模式。',
      'ISO 6336 系数（$K_{F\\alpha},Y_\\delta$ 等）为常用简化，非标准全文逐条实现。',
      'AGMA 块为 analyzeGearAGMA 简化式，不能替代 AGMA 官方软件或完整计算书。',
      '简化模式 pass 恒 false；分项 ✓ 不代表可签审。',
      '材料库 σHlim/σFlim 为典型值，正式设计须查锻件/试样数据。',
      '未考虑润滑粘度、表面粗糙度对接触疲劳的详细修正。',
      '螺旋角大、人字齿、内齿轮等需专用工具或标准附录。',
    ],
  },
  en: {
    modesSub: 'Simple Lewis / Full ISO 6336 / Pro ISO+AGMA — matches /gear calcMode',
    formulasSub: 'Aligned with gear-calc.js, gear-iso6336.js, gear-agma.js',
    passSub: 'Defaults $S_{H,\\min}=1.0$, $S_{F,\\min}=1.4$; editable in the form',
    guideSub: 'Contact and bending checked separately; Professional requires both standards',
    examplesSub: 'Typical pass paths (illustrative, not unique solutions)',
    faqTitle: 'Gear strength FAQ',
    howToTitle: 'How to pass gear checks',
    limitsTitle: 'Limitations',
    standardsTitle: 'Standards',
    standardsIntro: 'The /gear page is a **simplified** ISO 6336 / AGMA 2101 workflow—not a full standard calculation report.',
    modes: stdCalcModes('en', {
      simpleModel: 'Lewis bending + 118·√(…) contact estimate; single material',
      completeModel: 'ISO 6336 contact/bending; load factors; ISO 1328 → $K_V$',
      proModel: 'Full + **AGMA 2101 simplified** side-by-side; compare.bothPass',
      simplePass: '**pass always false** (estimateOnly); stresses and sub-checks still shown',
      completePass: '**pass = ($S_H\\ge S_{H,\\min}$) ∧ ($S_F\\ge S_{F,\\min}$)**; defaults 1.0 / 1.4',
      proPass: '**pass = compare.bothPass**: ISO **and** AGMA contactPass **and** bendingPass all true',
      simpleCaveat: 'Magnitude only; allowables from limits ÷ SF or manual entry',
      completeCaveat: 'No scuffing, micropitting, or full ISO 6336 scope',
      proCaveat: 'AGMA vs ISO stresses can differ 10–30% for same inputs',
    }),
    formulas: [
      { name: 'Tangential force', latex: 'F_t = \\frac{2000 T}{d_1}', note: '$T$ in N·m, pinion pitch diameter $d_1$ in mm' },
      { name: 'ISO 6336 contact', latex: '\\sigma_H = Z_B Z_H Z_E Z_\\varepsilon Z_\\beta \\sqrt{\\frac{F_t}{b d_1}\\frac{u+1}{u} K_A K_V K_{H\\beta} K_{H\\alpha}}', note: 'Steel-steel $Z_E=189.8$' },
      { name: 'ISO 6336 bending', latex: '\\sigma_F = \\frac{F_t}{b m_n} Y_F Y_S Y_\\beta K_A K_V K_{F\\beta} K_{F\\alpha}', note: '$Y_F$ from tooth count lookup' },
      { name: 'Contact safety', latex: 'S_H = \\frac{\\sigma_{H,\\lim}}{\\sigma_H}', note: 'contactPass ⇔ $S_H\\ge S_{H,\\min}$' },
      { name: 'Bending safety', latex: 'S_F = \\frac{\\sigma_{F,\\lim}}{\\sigma_F}', note: 'bendingPass ⇔ $S_F\\ge S_{F,\\min}$ (default 1.4)' },
      { name: 'Simple Lewis', latex: '\\sigma_F = \\frac{F_t}{b m Y}', note: 'Simple mode; default $Y=2.65$' },
    ],
    passChecks: [
      { check: 'Simplified', rule: '**pass always false** (estimateOnly); sub-checks vs allowables still shown' },
      { check: 'Full · contact', rule: 'contactPass ⇔ $S_H\\ge S_{H,\\min}$ (default 1.0)' },
      { check: 'Full · bending', rule: 'bendingPass ⇔ $S_F\\ge S_{F,\\min}$ (default 1.4)' },
      { check: 'Full · overall', rule: '**pass = bendingPass ∧ contactPass**' },
      { check: 'Professional · dual standard', rule: '**pass = bothPass**: ISO and AGMA contact **and** bending all pass' },
      { check: 'AGMA path', rule: 'Separate $C_p,I,J,K_o,K_v,K_m,K_s$ then same SH/SF limits' },
    ],
    guide: {
      intro: 'The gear page checks **contact fatigue (pitting)** and **root bending (tooth break)**. Full mode uses simplified ISO 6336; Professional adds AGMA—**both must pass**.',
      sections: [
        {
          title: '1. Inputs and load factors',
          bullets: [
            '$T$, $z_1$, $z_2$, $m$, $b$ set tangential force $F_t$',
            '$K_A$ (default 1.25), $K_V$ from ISO 1328 grade and pitch-line speed',
            'Face/transverse factors $K_{H\\beta},K_{H\\alpha},K_{F\\beta},K_{F\\alpha}$',
            'Profile shift $x_1,x_2$ changes $d_1=m(z_1+2x_1)$',
          ],
        },
        {
          title: '2. Materials and limits',
          bullets: [
            'Pinion and gear materials can differ; limits use **min** of both $\\sigma_{H,\\lim},\\sigma_{F,\\lim}$',
            'Simple mode: manual allowables or library ÷ safety factor',
            'Full/Pro: GEAR_MATERIALS σHlim / σFlim',
          ],
        },
        {
          title: '3. Professional ISO vs AGMA',
          bullets: [
            'Compare table shows stresses and SH/SF side by side',
            '**bothPass** = all four sub-checks true (ISO contact/bend + AGMA contact/bend)',
            'One standard pass + one fail → overall **fail** until both agree',
          ],
        },
      ],
    },
    examples: [
      { step: 'Simple', detail: '$m=2,z_1=24,T=50$ N·m → stresses shown, **pass=false**' },
      { step: 'Full pass', detail: '$S_H\\ge1$ and $S_F\\ge1.4$ → **pass ✓**' },
      { step: 'Bending fail', detail: '$S_F=1.2<1.4$ → **pass ✗** even if contact OK' },
      { step: 'Pro AGMA edge', detail: 'ISO ✓ but AGMA $S_F<1.4$ → **bothPass ✗**' },
      { step: 'Speed', detail: 'Higher rpm raises $K_V$ and stresses; tighter accuracy grade lowers $K_V$' },
    ],
    howToPass: [
      {
        goal: 'Pass Full mode',
        steps: [
          'Increase face width $b$ or module $m$',
          'Better material or lower $K_A$/$K_V$',
          'Match $S_{H,\\min}$/$S_{F,\\min}$ to your spec (1.0 / 1.4 default)',
          'Both contactPass and bendingPass required',
        ],
      },
      {
        goal: 'Pass Professional',
        steps: [
          'Make ISO Full pass first, then read AGMA column',
          'AGMA bending often governs for low tooth counts',
          'Overall ✓ only when **bothPass**',
        ],
      },
    ],
    faq: [
      { q: 'Why sub-checks ✓ but pass ✗ in Simple?', a: 'Simple is **estimateOnly**—pass always false.' },
      { q: 'Default SH/SF limits?', a: '$S_{H,\\min}=1.0$, $S_{F,\\min}=1.4$ in code; form fields override.' },
      { q: 'ISO pass, AGMA fail?', a: 'Expected—different formulas. **bothPass** needs both.' },
      { q: 'Profile shift?', a: 'Changes $d_1,d_2$ and forces; large shift needs full ISO review.' },
      { q: 'Helical gears?', a: 'Enter helix β; simplified $Z_\\beta,Y_\\beta$ only.' },
      { q: 'ISO 1328 link?', a: 'Optional chain from accuracy grade + speed to $K_V$.' },
    ],
    standards: [
      '**ISO 6336-1～3** — Cylindrical gear load capacity (simplified subset here)',
      '**ISO 1328-1** — Accuracy grades for dynamic factor',
      '**AGMA 2101-D04** — Metal cylindrical gears (simplified AGMA block)',
      '**GB/T 3480** — Chinese gear capacity standard (ISO-aligned)',
    ],
    limitations: [
      'No scuffing, micropitting, tooth flank fracture, or plasticity models.',
      'ISO factors are common simplifications—not every clause of the standard.',
      'AGMA block is simplified— not a substitute for official AGMA software.',
      'Simple pass always false; sub-check ✓ is not release approval.',
      'Material library limits are typical values—not your heat-treat data.',
      'Lubrication and roughness not fully modeled.',
      'Large helix, herringbone, internal gears need dedicated tools.',
    ],
  },
}

// ─── Thread ─────────────────────────────────────────────────────────────────

const THREAD = {
  zh: {
    modesSub: '简化 / 完整 / 专业 — ISO 898·GB/T 3098 许用应力；完整+ 旋合长度校核；专业 VDI 2230 扭矩',
    formulasSub: '与 thread-calc.js analyzeThreadStrength 一致',
    passSub: '剪切许用 = 0.6×拉应力许用；完整/专业含 engagementPass',
    guideSub: '拉应力、剪切、旋合长度（完整+）与 VDI 扭矩（专业）',
    examplesSub: 'M10·8.8 等典型工况',
    faqTitle: '螺纹强度 FAQ',
    howToTitle: '如何让螺纹判定通过',
    limitsTitle: '适用边界',
    standardsTitle: '相关标准',
    standardsIntro: '性能等级许用应力来自 ISO 898 / GB/T 3098 思路的 **简化折减**，非完整螺栓标准计算书。',
    modes: stdCalcModes('zh', {
      simpleModel: 'σ=F/A_s；简化剪切 τ≈F/(0.5πd_1 L)；扭矩 T=μdF',
      completeModel: '完整 + **内外螺纹剪切面积** 取大值；**m_eff 校核**',
      proModel: '完整 + **VDI 2230 扭矩** $T=F·vdiFactor$；μ_G,μ_K,D_km',
      simplePass: '**pass 恒 false**（estimateOnly）',
      completePass: '**pass = tensilePass ∧ shearPass ∧ engagementPass**',
      proPass: '同完整 + VDI 扭矩链；判定规则与完整相同',
      simpleCaveat: '默认 L=1.5d 未校核最小旋合',
      completeCaveat: 'engagementPass：L ≥ m_eff,min（钢螺母 0.8d，软材料 1.0d）',
      proCaveat: 'VDI 扭矩用于换算；未含 VDI 2230 全套 R0～R13 分步',
    }),
    formulas: [
      { name: '应力截面积', latex: 'A_s = \\frac{\\pi}{4}(d-0.9382P)^2', note: '公称直径 d，螺距 P (mm)' },
      { name: '拉应力', latex: '\\sigma = \\frac{F}{A_s}', note: 'tensilePass ⇔ $\\sigma\\le$ allowStress（等级许用）' },
      { name: '剪切应力（完整）', latex: '\\tau = \\max\\left(\\frac{F}{A_{s,ext}},\\frac{F}{A_{s,int}}\\right)', note: '$A_{s,ext}=0.5\\pi d_1 L_e$；$A_{s,int}=0.5\\pi d_2 L_e$' },
      { name: '剪切许用', latex: '\\tau \\le 0.6 \\cdot \\sigma_{allow}', note: 'shearPass；代码 allowShearStress = 0.6×allowTensile' },
      { name: '最小旋合长度', latex: 'm_{eff,\\min} = k \\cdot d', note: '钢螺母 k=0.8；软材料 k=1.0；engagementPass ⇔ $L_e\\ge m_{eff,\\min}$' },
      { name: 'VDI 2230 扭矩（专业）', latex: 'T = \\frac{F}{1000}\\left(0.16P + 0.58\\mu_G d_2 + 0.5\\mu_K D_{km}\\right)', note: 'F (N)→T (N·m)；默认 μ_G=μ_K=0.12' },
    ],
    passChecks: [
      { check: '简化模式', rule: '**pass 恒 false**（estimateOnly）' },
      { check: '拉伸 tensilePass', rule: '$\\sigma=F/A_s \\le$ 性能等级 allowStress（如 8.8 级 400 MPa）' },
      { check: '剪切 shearPass', rule: '$\\tau\\le 0.6\\times$ allowStress；完整模式取内外螺纹 **较大** τ' },
      { check: '旋合 engagementPass', rule: '**完整/专业**：$L_e\\ge m_{eff,\\min}$；简化 **不参与** pass' },
      { check: '综合 pass', rule: '完整/专业：**pass = 三项全 ✓**；简化恒 ✗' },
      { check: '关键输入门禁', rule: 'enforceCriticalConfirm 时未确认字段 → releaseBlocked（本页默认不阻断）' },
    ],
    guide: {
      intro: '螺纹页校核 **螺杆拉应力** 与 **螺纹牙剪切**；完整/专业还检查 **旋合长度** 是否达到 VDI/DIN 推荐最小值；专业模式用 **VDI 2230** 式换算拧紧扭矩。',
      sections: [
        {
          title: '1. 性能等级与许用应力',
          bullets: [
            'THREAD_GRADES：4.6～12.9 级，allowStress 已含约 1.5～2 安全系数',
            '8.8 级默认 allowStress=400 MPa；10.9 级 560 MPa',
            '对应 ISO 898-1 / GB/T 3098.1 思路，非完整标准条文',
          ],
        },
        {
          title: '2. 旋合长度（完整+）',
          bullets: [
            '默认旋合长度 $L_e=1.5d$ 仅作初值',
            'm_eff,min = 0.8d（钢螺母）或 1.0d（软材料）',
            'engagementPass ✗ 时即使 σ、τ 通过也 **综合未通过**',
            'criticalShearSide 显示内/外螺纹哪侧剪切更大',
          ],
        },
        {
          title: '3. 专业模式 VDI 扭矩',
          bullets: [
            '分项摩擦：螺纹 μ_G、支承面 μ_K、力臂 D_km（默认 1.45d）',
            '给定 F 算 T，或给定 T 反算 σ（vdiFactor 除法）',
            '判定仍看 tensile/shear/engagement，与完整相同',
          ],
        },
      ],
    },
    examples: [
      { step: '简化', detail: 'M10·8.8，F=20 kN → σ≈127 MPa ✓；**pass=false**' },
      { step: '完整·旋合不足', detail: 'L=6 mm < m_eff=8 mm（d=10 钢螺母）→ engagementPass ✗ → **pass ✗**' },
      { step: '完整·全过', detail: 'L≥8 mm，σ/τ 均低于许用 → **pass ✓**' },
      { step: '专业·VDI 扭矩', detail: '同 F=20 kN，μ_G=μ_K=0.12 → T 高于简化 μdF；判定仍看三 pass' },
      { step: '剪切控制', detail: '短旋合 L 小 → τ 先超限；加长螺母或增大 d' },
    ],
    howToPass: [
      {
        goal: '完整/专业综合通过',
        steps: [
          '降轴向力 F 或增大直径/等级',
          '保证 $L_e\\ge m_{eff,\\min}$（钢螺母 ≥0.8d）',
          'τ 超限时优先加长旋合而非仅换高等級',
          '三项 tensilePass、shearPass、engagementPass 全 ✓',
        ],
      },
      {
        goal: '专业扭矩换算',
        steps: [
          '填写 μ_G、μ_K、D_km 与实测一致',
          '扭矩反算 F 后仍须满足 σ、τ、L 校核',
          '详见 /bolt-preload 完整 VDI 连接校核',
        ],
      },
    ],
    faq: [
      { q: '简化模式为何 pass 恒 ✗？', a: 'estimateOnly；未做 m_eff 校核，不能放行。' },
      { q: '剪切为何是 0.6×拉许用？', a: '代码 allowShearStress = 0.6×allowTensile，工程常用简化。' },
      { q: 'L=1.5d 够吗？', a: '常够，但完整模式仍算 m_eff,min；短旋合会 engagementPass ✗。' },
      { q: '专业与完整 pass 区别？', a: '**判定相同**；专业仅扭矩用 VDI 2230 式。' },
      { q: '内螺纹还是外螺纹先剪？', a: '取 τ_ext 与 τ_int **较大值** 与 criticalShearSide。' },
      { q: '和螺栓预紧页关系？', a: '螺纹页校核 **工作载荷**；预紧/分离见 /bolt-preload。' },
    ],
    standards: [
      '**ISO 898-1** — 碳钢及合金钢紧固件机械性能（等级许用来源）',
      '**GB/T 3098.1** — 国标紧固件机械性能，与 ISO 898 对应',
      '**VDI 2230 Blatt 1** — 高承载螺栓连接（最小旋合长度与专业扭矩参考）',
      '**DIN 13** — 公制螺纹基本尺寸（d_2、d_1 公式）',
    ],
    limitations: [
      '未含螺纹疲劳、偏心载荷、弯曲联合受力。',
      '剪切面积为简化环面模型，非 FEA 或 VDI 2230 全文牙面模型。',
      '性能等级 allowStress 为固定表值，未按温度、服役时间折减。',
      '简化模式 pass 恒 false。',
      'VDI 2230 分步向导（R0～R13）在 bolt-preload / vdi 向导，不在本页。',
      '未建模螺母强度等级低于螺栓时的配对规则。',
    ],
  },
  en: {
    modesSub: 'Simple / Full / Professional — ISO 898·GB/T 3098; engagement check Full+; VDI torque in Pro',
    formulasSub: 'Matches thread-calc.js analyzeThreadStrength',
    passSub: 'Shear allowable = 0.6× tensile allowable; engagementPass in Full/Pro',
    guideSub: 'Tension, shear, engagement (Full+), VDI torque (Pro)',
    examplesSub: 'Typical M10 grade 8.8 cases',
    faqTitle: 'Thread strength FAQ',
    howToTitle: 'How to pass thread checks',
    limitsTitle: 'Limitations',
    standardsTitle: 'Standards',
    standardsIntro: 'Grade allowables follow **simplified** ISO 898 / GB/T 3098 reduction—not a full fastener standard report.',
    modes: stdCalcModes('en', {
      simpleModel: 'σ=F/A_s; simplified shear; torque T=μdF',
      completeModel: 'Ext/int thread shear areas; **m_eff check**',
      proModel: 'Full + **VDI 2230 torque**; μ_G, μ_K, D_km',
      simplePass: '**pass always false** (estimateOnly)',
      completePass: '**pass = tensilePass ∧ shearPass ∧ engagementPass**',
      proPass: 'Same as Full + VDI torque chain',
      simpleCaveat: 'Default L=1.5d without min engagement gate',
      completeCaveat: 'engagementPass: L ≥ m_eff,min (0.8d steel nut, 1.0d soft)',
      proCaveat: 'VDI torque only—not full R0–R13 wizard here',
    }),
    formulas: [
      { name: 'Stress area', latex: 'A_s = \\frac{\\pi}{4}(d-0.9382P)^2', note: 'Nominal d, pitch P (mm)' },
      { name: 'Tensile stress', latex: '\\sigma = \\frac{F}{A_s}', note: 'tensilePass ⇔ σ ≤ allowStress' },
      { name: 'Shear (Full)', latex: '\\tau = \\max\\left(\\frac{F}{A_{s,ext}},\\frac{F}{A_{s,int}}\\right)', note: 'External/internal flank shear areas' },
      { name: 'Shear limit', latex: '\\tau \\le 0.6 \\cdot \\sigma_{allow}', note: 'shearPass' },
      { name: 'Min engagement', latex: 'm_{eff,\\min} = k \\cdot d', note: 'Steel nut k=0.8; soft k=1.0' },
      { name: 'VDI torque (Pro)', latex: 'T = \\frac{F}{1000}\\left(0.16P + 0.58\\mu_G d_2 + 0.5\\mu_K D_{km}\\right)', note: 'N → N·m' },
    ],
    passChecks: [
      { check: 'Simplified', rule: '**pass always false** (estimateOnly)' },
      { check: 'tensilePass', rule: 'σ ≤ grade allowStress (e.g. 8.8 → 400 MPa)' },
      { check: 'shearPass', rule: 'τ ≤ 0.6×allowStress; Full uses max(ext,int)' },
      { check: 'engagementPass', rule: 'Full/Pro: $L_e\\ge m_{eff,\\min}$; Simple skipped' },
      { check: 'Overall', rule: 'Full/Pro: all three ✓; Simple always ✗' },
      { check: 'Critical confirm', rule: 'enforceCriticalConfirm → releaseBlocked if fields unconfirmed' },
    ],
    guide: {
      intro: 'Checks **bolt tension** and **thread shear**; Full/Professional add **minimum engagement**; Professional uses **VDI 2230** for tightening torque.',
      sections: [
        {
          title: '1. Property classes',
          bullets: [
            'THREAD_GRADES 4.6–12.9 with built-in allowStress',
            '8.8 default 400 MPa allowable tension',
            'ISO 898-1 / GB/T 3098.1 inspired—not every clause',
          ],
        },
        {
          title: '2. Engagement (Full+)',
          bullets: [
            'Default $L_e=1.5d$ is a starting guess',
            'm_eff,min = 0.8d (steel nut) or 1.0d (soft)',
            'engagementPass ✗ fails overall even if σ, τ OK',
          ],
        },
        {
          title: '3. Professional VDI torque',
          bullets: [
            'Split friction μ_G, μ_K and arm D_km',
            'Force→torque or torque→force via vdiFactor',
            'Pass rules same as Full mode',
          ],
        },
      ],
    },
    examples: [
      { step: 'Simple', detail: 'M10·8.8, F=20 kN → σ OK; **pass=false**' },
      { step: 'Short engagement', detail: 'L=6 mm < 8 mm → engagementPass ✗' },
      { step: 'Full pass', detail: 'L OK, σ and τ OK → **pass ✓**' },
      { step: 'Pro VDI torque', detail: 'Higher T than μdF; pass still from σ/τ/L' },
      { step: 'Shear governs', detail: 'Short L raises τ first—increase engagement' },
    ],
    howToPass: [
      {
        goal: 'Pass Full/Professional',
        steps: [
          'Reduce F or increase diameter/grade',
          'Ensure $L_e\\ge m_{eff,\\min}$',
          'All three: tensile, shear, engagement',
        ],
      },
      {
        goal: 'VDI torque (Pro)',
        steps: [
          'Match μ_G, μ_K, D_km to your joint',
          'Torque-derived F must still pass σ/τ/L',
          'Full joint check → /bolt-preload',
        ],
      },
    ],
    faq: [
      { q: 'Why Simple pass always ✗?', a: 'estimateOnly—no engagement gate.' },
      { q: 'Why 0.6× for shear?', a: 'Code: allowShear = 0.6×allowTensile.' },
      { q: 'Is L=1.5d enough?', a: 'Often yes, but Full still checks m_eff,min.' },
      { q: 'Pro vs Full pass?', a: '**Same rules**; Pro changes torque formula only.' },
      { q: 'Which thread shears?', a: 'Max of external vs internal τ.' },
      { q: 'vs bolt-preload?', a: 'Thread = working load; preload/separation on /bolt-preload.' },
    ],
    standards: [
      '**ISO 898-1** — Mechanical properties of fasteners',
      '**GB/T 3098.1** — Chinese fastener properties (ISO-aligned)',
      '**VDI 2230 Blatt 1** — High-duty bolted joints (engagement & torque)',
      '**DIN 13** — Metric thread dimensions',
    ],
    limitations: [
      'No fatigue, eccentric load, or combined bending.',
      'Simplified shear ring areas—not FEA or full VDI tooth model.',
      'Fixed allowStress table—no temperature derating.',
      'Simple pass always false.',
      'Full VDI R0–R13 wizard on bolt-preload page.',
      'Nut grade mismatch rules not modeled.',
    ],
  },
}

// ─── Bolt preload ───────────────────────────────────────────────────────────

const BOLT_PRELOAD = {
  zh: {
    modesSub: 'UI「完整」对应代码 calcMode=vdi2230；专业含夹紧件刚度与分离校核',
    formulasSub: '与 bolt-preload-calc.js analyzeBoltPreload 一致',
    passSub: '简化 pass 恒 false；专业+外载时须 separationPass',
    guideSub: '预紧力、VDI 扭矩、工作载荷下分离与螺栓应力',
    examplesSub: 'M12·8.8 典型预紧换算',
    faqTitle: '螺栓预紧 FAQ',
    howToTitle: '如何让预紧判定通过',
    limitsTitle: '适用边界',
    standardsTitle: '相关标准',
    standardsIntro: '完整模式启用 **VDI 2230 扭矩分解**；专业模式增加 **残余预紧、载荷系数 Φ、分离校核** 简化链。',
    modes: [
      {
        mode: '简化',
        model: 'T=μdF/1000；无 VDI 分项摩擦',
        passRule: '**pass 恒 false**（estimateOnly）',
        caveat: '仅量级；右侧可对比 VDI 扭矩参考',
      },
      {
        mode: '完整',
        model: 'calcMode=**vdi2230**；VDI 扭矩正/反算；σ=F_M/A_s',
        passRule: '**pass = stressPass**（σ≤许用）；无外载分离链',
        caveat: 'UI 称「完整」；代码无 professional _joint',
      },
      {
        mode: '专业',
        model: 'VDI 扭矩 + **嵌入损失 F_Z**、**热变化 ΔF_VT**、刚度 **Φ**',
        passRule: '有外载 F_A>0：**pass = stressPass ∧ separationPass ∧ stressUnderLoadPass**',
        caveat: '目标预紧为 **残余** F_M；拧紧力 F_V 更高',
      },
    ],
    formulas: [
      { name: '简化扭矩', latex: 'T = \\frac{\\mu \\, d \\, F_M}{1000}', note: 'F_M (N)，d (mm)，T (N·m)' },
      { name: 'VDI 2230 扭矩', latex: 'T = \\frac{F_M}{1000}\\left(0.16P + 0.58\\mu_G d_2 + 0.5\\mu_K D_{km}\\right)', note: '完整/专业；compareTorque 与简化对照' },
      { name: '预紧拉应力', latex: '\\sigma = \\frac{F_M}{A_s}', note: 'stressPass ⇔ σ ≤ 等级 allowStress' },
      { name: '最大螺栓力', latex: 'F_{S,max} = F_M + \\Phi F_A', note: '专业+外载；stressUnderLoadPass 用此力算 σ' },
      { name: '防分离', latex: 'F_{K,rem} = F_M - F_A(1-\\Phi) \\ge 0', note: 'separationPass；夹紧力剩余 ≥0' },
      { name: '残余预紧', latex: 'F_M = F_V - F_Z + \\Delta F_{VT}', note: '专业：由拧紧力 F_V 扣嵌入、加热修正得残余' },
    ],
    passChecks: [
      { check: '简化模式', rule: '**pass 恒 false**（estimateOnly）' },
      { check: '完整 · 应力', rule: 'stressPass：拧紧预紧 σ ≤ allowStress（ISO 898 等级表）' },
      { check: '完整 · 分离', rule: '无 professional joint → **不做** separationPass（F_A 不进入 pass）' },
      { check: '专业 · 无外载', rule: 'F_A=0 时 pass ≈ stressPass（残余预紧应力）' },
      { check: '专业 · 有外载', rule: '**pass = stressPass ∧ separationPass ∧ stressUnderLoadPass**' },
      { check: 'separationPass', rule: 'F_M - F_A(1-Φ) ≥ 0；不足则连接面分离风险' },
      { check: '最大预紧', rule: 'F_M ≤ maxPreload = allowStress×A_s（参考，非 pass 主判据）' },
    ],
    guide: {
      intro: '螺栓预紧页在 **预紧力 F_M** 与 **拧紧扭矩 T** 之间换算，并校核预紧应力；专业模式模拟 **夹紧件刚度** 与工作 **轴向外载 F_A** 下的 **分离** 与 **螺栓最大力**。',
      sections: [
        {
          title: '1. 三种模式对应关系',
          bullets: [
            '简化：μdF 扭矩；**pass 恒 ✗**',
            '完整（vdi2230）：VDI 2230 扭矩式；σ 校核；compare 显示与简化扭矩差',
            '专业：输入目标 **残余预紧**；反算拧紧力；嵌入 F_Z、热 ΔF_VT、载荷系数 Φ',
          ],
        },
        {
          title: '2. VDI 2230 扭矩参数',
          bullets: [
            'μ_G 螺纹摩擦、μ_K 支承摩擦、D_km 摩擦直径（默认 1.45d）',
            'breakdown 显示螺纹/支承扭矩占比',
            'force2torque 与 torque2force 两种模式',
          ],
        },
        {
          title: '3. 分离校核（专业+外载）',
          bullets: [
            'Φ = 螺栓刚度/(螺栓+夹紧件刚度)；外载时螺栓力增 ΦF_A',
            'separationPass：残余夹紧力 F_M - F_A(1-Φ) ≥ 0',
            'stressUnderLoadPass：F_{S,max}=F_M+ΦF_A 对应 σ ≤ 许用',
            '完整模式无 jointLoad → 外载不参与 pass（仅专业）',
          ],
        },
      ],
    },
    examples: [
      { step: '简化', detail: 'F_M=25 kN，M12·μ=0.2 → T≈60 N·m 量级；**pass=false**' },
      { step: '完整·VDI', detail: '同 F_M，μ_G=μ_K=0.12 → T_VDI > T_simple；σ<400 → **pass ✓**' },
      { step: '专业·预紧够', detail: 'F_M=30 kN 残余，F_A=10 kN，Φ=0.2 → F_K,rem>0，F_S,max OK → **pass ✓**' },
      { step: '专业·分离失败', detail: 'F_M 过小或 F_A 过大 → separationPass ✗ → **pass ✗**' },
      { step: '应力超限', detail: 'F_M 过大使 σ>allowStress → stressPass ✗' },
    ],
    howToPass: [
      {
        goal: '完整模式（VDI 扭矩）',
        steps: [
          '使 σ=F_M/A_s ≤ 等级 allowStress',
          '摩擦系数与工艺一致（μ_G, μ_K）',
          '完整模式 **不** 含分离 — 有外载签审请用专业',
        ],
      },
      {
        goal: '专业模式（含外载）',
        steps: [
          '提高目标残余预紧 F_M 或降低 F_A',
          '增大夹紧件刚度（降 Φ）可减螺栓力增量',
          '同时满足 separationPass 与 stressUnderLoadPass',
          '嵌入损失大时需提高 F_V（拧紧力）',
        ],
      },
    ],
    faq: [
      { q: '完整模式为何不做分离？', a: 'jointLoad 仅 professional 构建；vdi2230 只校核 σ。' },
      { q: 'UI 完整 vs 代码 vdi2230？', a: 'CalcModePanel「完整」映射 calcMode=**vdi2230**。' },
      { q: '简化 pass 为何 ✗？', a: 'estimateOnly；与螺纹页相同策略。' },
      { q: 'F_M 与 F_V 区别？', a: '专业：F_V 拧紧力，F_M 残余 = F_V−F_Z+ΔF_VT。' },
      { q: 'VDI 向导在哪？', a: '专业模式页内 runVdi2230Wizard（R0～R13 分步）。' },
      { q: '扭矩分散？', a: '同一 T 下 F_M 可 ±20% 以上；重要连接需扭矩+角度或超声测预紧。' },
    ],
    standards: [
      '**VDI 2230 Blatt 1** — 高承载螺栓连接系统计算（扭矩、预紧、分离）',
      '**ISO 898-1** — 紧固件等级与许用应力',
      '**GB/T 3098.1** — 国标紧固件机械性能',
      '**VDI 2862** — 拧紧过程控制（摩擦分散，参考）',
    ],
    limitations: [
      '专业 joint 为简化刚度模型，非 VDI 2230 全文有限元链。',
      '完整模式不含分离、热、嵌入 — 仅 VDI 扭矩+σ。',
      '简化 pass 恒 false。',
      '未含横向载荷、弯矩、疲劳与松动。',
      '摩擦系数常数 — 表面处理/润滑影响未分项 Monte Carlo。',
      'surface pressure、p_max 等在校验向导 R7，不在 analyzeBoltPreload 主 pass。',
    ],
  },
  en: {
    modesSub: 'UI "Full" = calcMode vdi2230; Professional adds joint stiffness & separation',
    formulasSub: 'Matches bolt-preload-calc.js analyzeBoltPreload',
    passSub: 'Simple pass always false; Professional with F_A needs separationPass',
    guideSub: 'Preload, VDI torque, separation and bolt stress under load',
    examplesSub: 'Typical M12 grade 8.8 preload',
    faqTitle: 'Bolt preload FAQ',
    howToTitle: 'How to pass preload checks',
    limitsTitle: 'Limitations',
    standardsTitle: 'Standards',
    standardsIntro: 'Full mode uses **VDI 2230 torque**; Professional adds **residual preload, Φ, separation** simplified chain.',
    modes: [
      {
        mode: 'Simplified',
        model: 'T=μdF/1000; no VDI friction split',
        passRule: '**pass always false** (estimateOnly)',
        caveat: 'Magnitude only; VDI torque shown for reference',
      },
      {
        mode: 'Full',
        model: 'calcMode=**vdi2230**; VDI torque; σ=F_M/A_s',
        passRule: '**pass = stressPass** (σ ≤ allowable)',
        caveat: 'No professional joint / separation',
      },
      {
        mode: 'Professional',
        model: 'VDI torque + embedment F_Z, thermal ΔF_VT, load factor Φ',
        passRule: 'With F_A>0: **pass = stressPass ∧ separationPass ∧ stressUnderLoadPass**',
        caveat: 'Target is **residual** F_M; tightening F_V is higher',
      },
    ],
    formulas: [
      { name: 'Simple torque', latex: 'T = \\frac{\\mu \\, d \\, F_M}{1000}', note: 'N, mm, N·m' },
      { name: 'VDI torque', latex: 'T = \\frac{F_M}{1000}\\left(0.16P + 0.58\\mu_G d_2 + 0.5\\mu_K D_{km}\\right)', note: 'Full/Pro' },
      { name: 'Preload stress', latex: '\\sigma = \\frac{F_M}{A_s}', note: 'stressPass ⇔ σ ≤ allowStress' },
      { name: 'Max bolt force', latex: 'F_{S,max} = F_M + \\Phi F_A', note: 'Pro + external load' },
      { name: 'Anti-separation', latex: 'F_{K,rem} = F_M - F_A(1-\\Phi) \\ge 0', note: 'separationPass' },
      { name: 'Residual preload', latex: 'F_M = F_V - F_Z + \\Delta F_{VT}', note: 'Professional residual from tightening' },
    ],
    passChecks: [
      { check: 'Simplified', rule: '**pass always false** (estimateOnly)' },
      { check: 'Full · stress', rule: 'stressPass: σ ≤ grade allowStress' },
      { check: 'Full · separation', rule: 'No joint model → separation **not** in pass' },
      { check: 'Pro · no external load', rule: 'F_A=0: pass ≈ stressPass on residual preload' },
      { check: 'Pro · with F_A', rule: '**pass = stress ∧ separation ∧ stressUnderLoad**' },
      { check: 'separationPass', rule: 'F_M - F_A(1-Φ) ≥ 0' },
      { check: 'maxPreload', rule: 'Reference limit allowStress×A_s—not primary pass gate' },
    ],
    guide: {
      intro: 'Converts between **preload F_M** and **tightening torque T**; Professional evaluates **separation** and **peak bolt force** under axial load F_A with load factor Φ.',
      sections: [
        {
          title: '1. Mode mapping',
          bullets: [
            'Simple: μdF; **pass always ✗**',
            'Full (vdi2230): VDI torque + σ check',
            'Professional: target **residual** F_M; embedment; thermal; Φ',
          ],
        },
        {
          title: '2. VDI torque inputs',
          bullets: [
            'μ_G thread, μ_K bearing face, D_km (default 1.45d)',
            'Torque breakdown by thread vs head',
            'force2torque or torque2force modes',
          ],
        },
        {
          title: '3. Separation (Pro + F_A)',
          bullets: [
            'Φ = bolt stiffness / (bolt + clamped parts)',
            'separationPass: clamping remaining ≥ 0',
            'stressUnderLoadPass at F_S,max = F_M + ΦF_A',
            'Full mode: F_A does not enter pass',
          ],
        },
      ],
    },
    examples: [
      { step: 'Simple', detail: 'F_M=25 kN → T≈60 N·m; **pass=false**' },
      { step: 'Full VDI', detail: 'VDI T > simple T; σ OK → **pass ✓**' },
      { step: 'Pro OK', detail: 'F_M=30 kN, F_A=10 kN, Φ=0.2 → separation ✓ → **pass ✓**' },
      { step: 'Separation fail', detail: 'Low F_M or high F_A → separationPass ✗' },
      { step: 'Stress fail', detail: 'σ > allowStress → stressPass ✗' },
    ],
    howToPass: [
      {
        goal: 'Pass Full (VDI)',
        steps: [
          'Keep σ = F_M/A_s ≤ allowStress',
          'Match μ_G, μ_K to process',
          'No separation in Full—use Pro for loaded joints',
        ],
      },
      {
        goal: 'Pass Professional',
        steps: [
          'Raise F_M or lower F_A',
          'Stiffer clamped parts lower Φ',
          'Need separationPass and stressUnderLoadPass',
        ],
      },
    ],
    faq: [
      { q: 'Why no separation in Full?', a: 'jointLoad built only in Professional.' },
      { q: 'UI Full vs code?', a: 'Panel "Full" → calcMode=**vdi2230**.' },
      { q: 'Simple pass ✗?', a: 'estimateOnly by design.' },
      { q: 'F_M vs F_V?', a: 'Pro: F_M residual after embedment/thermal from F_V.' },
      { q: 'VDI wizard?', a: 'runVdi2230Wizard on Professional page (R0–R13).' },
      { q: 'Torque scatter?', a: 'Same T can give ±20%+ F_M—use controlled tightening.' },
    ],
    standards: [
      '**VDI 2230 Blatt 1** — Systematic calculation of high-duty bolted joints',
      '**ISO 898-1** — Fastener property classes',
      '**GB/T 3098.1** — Chinese fastener properties',
      '**VDI 2862** — Tightening process control (reference)',
    ],
    limitations: [
      'Professional joint is simplified—not full VDI FEA chain.',
      'Full mode: VDI torque + σ only—no separation/embedment.',
      'Simple pass always false.',
      'No shear, bending, fatigue, or loosening models.',
      'Constant friction—no scatter analysis in main pass.',
      'Surface pressure checks in VDI wizard R7, not main pass.',
    ],
  },
}

// ─── Bearing ────────────────────────────────────────────────────────────────

const BEARING = {
  zh: {
    modesSub: '简化手填 X/Y / 完整系列查表 / 专业温度 a₂ 与极限转速',
    formulasSub: '与 bearing-calc.js analyzeBearingLife、bearing-xy-tables 一致',
    passSub: '默认 S₀≥1.5、L10h≥目标；专业另需 speedPass',
    guideSub: '当量载荷 P、ISO 281 寿命、静载与转速限制',
    examplesSub: '深沟球轴承典型 Fr/Fa 工况',
    faqTitle: '轴承寿命 FAQ',
    howToTitle: '如何让轴承判定通过',
    limitsTitle: '适用边界',
    standardsTitle: '相关标准',
    standardsIntro: '寿命按 **ISO 281:2007** 基本额定寿命模型；X/Y 来自内置系列表或手填。',
    modes: stdCalcModes('zh', {
      simpleModel: '手填 X/Y 或 simpleEquivalentLoad；有 Fa 无 Y → **errorKey 阻断**',
      completeModel: 'seriesId/型号 **自动查 X/Y**；a1 可靠度、aISO 工况；S₀ 校核',
      proModel: '完整 + **温度 a₂**、**limitingSpeed** → speedPass；径向刚度粗估',
      simplePass: '**pass 恒 false**（estimateOnly）；有 Fa 无 Y 时 errorKey 阻断',
      completePass: '**pass = lifePass ∧ staticPass**（$L_{10h}\\ge$ 目标，$S_0\\ge1.5$）',
      proPass: '**pass = lifePass ∧ staticPass ∧ speedPass**（n ≤ limitingSpeed）',
      simpleCaveat: 'Fa>0 且未给 Y 时不算寿命',
      completeCaveat: 'autoLookup 默认开；可关用手填 X/Y',
      proCaveat: 'limitingSpeed 未填则 speedPass 恒 true',
    }),
    formulas: [
      { name: '当量动载荷', latex: 'P = X F_r + Y F_a\'', note: '$F_a\'=|F_a|+F_0$（含轴向预紧）；DB/DF 时 Y 折减 0.72' },
      { name: '基本额定寿命', latex: 'L_{10} = \\left(\\frac{C}{P}\\right)^\\varepsilon', note: '百万转；球 ε=3，滚子 ε=10/3' },
      { name: '小时寿命', latex: 'L_{10h} = \\frac{10^6}{60n} L_{10}', note: 'lifePass ⇔ $L_{10h}\\ge$ targetHours（默认 10000 h）' },
      { name: '修正寿命', latex: 'L_{nm} = a_1 \\cdot a_{ISO} \\cdot a_2^{\\varepsilon} \\cdot L_{10}', note: '专业模式含 a₂ 温度；完整 a₂=1' },
      { name: '静载安全系数', latex: 'S_0 = \\frac{C_0}{P}', note: 'staticPass ⇔ $S_0\\ge$ minStaticSafety（默认 **1.5**）' },
      { name: '安装修正', latex: 'C\' = f_C \\cdot C,\\quad C_0\' = f_{C0} \\cdot C_0', note: 'DT 串联 f_C=2；预紧增大 Fa′ 进而增大 P' },
    ],
    passChecks: [
      { check: '简化 · Fa 无 Y', rule: 'Fa>0 且未显式 Y → **bearing_simple_xy_required**，pass=false' },
      { check: '简化 · 一般', rule: '**pass 恒 false**（estimateOnly）；lifePass/staticPass 仍可看' },
      { check: 'lifePass', rule: '$L_{10h}\\ge$ targetHours（默认 10000 h）' },
      { check: 'staticPass', rule: '$S_0=C_0/P\\ge$ minStaticSafety（默认 **1.5**）；无 C₀ 时 staticPass=true' },
      { check: '完整综合', rule: '**pass = lifePass ∧ staticPass**' },
      { check: '专业 · 转速', rule: '填 limitingSpeed 时 **speedPass = (n\\le limit)**；否则 speedPass 恒 true' },
      { check: '专业综合', rule: '**pass = lifePass ∧ staticPass ∧ speedPass**' },
    ],
    guide: {
      intro: '轴承页按 ISO 281 用额定动载 **C**、静载 **C₀** 与当量载荷 **P** 算 **L10** 寿命与 **S₀** 静载安全；完整模式从 **bearing-xy-tables** 按 Fr/Fa 查 **X/Y**；专业模式加温度与极限转速。',
      sections: [
        {
          title: '1. X/Y 与当量载荷',
          bullets: [
            'P = X·Fr + Y·Fa′；Fa′ 含轴向预紧 F₀',
            '完整：lookupBearingXY(seriesId, Fr, Fa) 自动查表',
            '简化：Fa>0 必须手填 Y 或直接 simpleEquivalentLoad',
            'DB/DF 配对：Y 乘以 0.72；DT 串联：C 与 C₀ 按 2 套计',
          ],
        },
        {
          title: '2. 寿命修正系数',
          bullets: [
            'a1：可靠度 90%→1.0，99%→0.25 等',
            'aISO：润滑/污染工况（clean 1.5～heavy 0.3）',
            'a2：专业模式工作温度（120°C→1.0，250°C→0.5）',
            'Lnm = a1·aISO·a2^ε·L10 → 换算 L10h',
          ],
        },
        {
          title: '3. 静载与转速',
          bullets: [
            '冲击/低速重载须看 S₀≥1.5（可调 minStaticSafety）',
            '专业 limitingSpeed：n>limit → speedWarningKey，pass ✗',
            '径向刚度 k_r 仅专业显示，不参与 pass',
          ],
        },
      ],
    },
    examples: [
      { step: '简化·纯径向', detail: 'Fa=0，X=1,Y=0 → P=Fr；算 L10h；**pass=false**' },
      { step: '简化·Fa 无 Y', detail: 'Fa>0 未填 Y → errorKey 阻断，无寿命数' },
      { step: '完整·通过', detail: '6205 查表 X/Y，L10h≥10000，S₀≥1.5 → **pass ✓**' },
      { step: '静载不足', detail: '冲击工况 S₀=1.2<1.5 → staticPass ✗ → **pass ✗**' },
      { step: '专业·超速', detail: 'n=8000>limitingSpeed=6000 → speedPass ✗ → **pass ✗**' },
    ],
    howToPass: [
      {
        goal: '完整模式寿命+静载',
        steps: [
          '增大 C 或减小 Fr/Fa/预紧（降 P）',
          '选对 seriesId 使 X/Y 与载荷方向匹配',
          '保证 L10h≥目标且 S₀≥1.5',
          '寿命对 C/P 为 **三次方**（球轴承）— 小幅增 C 效果显著',
        ],
      },
      {
        goal: '专业模式（含转速）',
        steps: [
          '填写样本 limitingSpeed 并保证 n≤limit',
          '高温降低 a₂ — 专业比完整更保守',
          '三者 lifePass、staticPass、speedPass 全 ✓',
        ],
      },
    ],
    faq: [
      { q: '简化 pass 为何 ✗？', a: 'estimateOnly；即使 lifePass ✓ 也不放行。' },
      { q: 'Fa 有值必须填 Y？', a: '简化模式默认 Y=0 会忽略 Fa — 有 Fa 无 Y 则 **阻断** 计算。' },
      { q: 'S₀ 默认 1.5？', a: 'minStaticSafety 默认 1.5；无 C₀ 输入时 staticPass 跳过。' },
      { q: '完整 vs 简化 X/Y？', a: '完整 autoLookup 查 bearing-xy-tables；简化须手填或给 P。' },
      { q: '预紧为何降寿命？', a: 'F₀ 增大 Fa′ → P 增大 → L10 下降；刚度提高。' },
      { q: 'a2 何时≠1？', a: '仅 **professional** calcMode；完整模式 a₂ 恒 1。' },
    ],
    standards: [
      '**ISO 281:2007** — 滚动轴承额定寿命与载荷系数',
      '**ISO 76** — 静载额定 C₀（与 S₀ 校核）',
      '**ISO 16281** — 修正寿命 aISO（工况系数思路）',
      '**GB/T 6391** — 国标滚动轴承额定寿命',
    ],
    limitations: [
      'L10 为 90% 可靠度统计寿命 — 非每台轴承实际寿命。',
      'X/Y 表覆盖常用系列；特殊结构须查厂家样本手填。',
      '未含润滑膜厚度、污染颗粒、安装偏心、保持架强度。',
      '简化 pass 恒 false；errorKey 时无有效寿命输出。',
      'limitingSpeed 未填时专业模式不校转速。',
      'aISO/a2 为简化阶梯表，非 ISO 16281 全文。',
      'DT/DB/DF 修正为工程近似，正式设计查厂家配对规则。',
    ],
  },
  en: {
    modesSub: 'Simple manual X/Y / Full series lookup / Pro temperature a₂ & speed limit',
    formulasSub: 'Matches bearing-calc.js and bearing-xy-tables',
    passSub: 'Default S₀≥1.5, L10h≥target; Professional adds speedPass',
    guideSub: 'Equivalent load P, ISO 281 life, static and speed checks',
    examplesSub: 'Typical deep-groove Fr/Fa cases',
    faqTitle: 'Bearing life FAQ',
    howToTitle: 'How to pass bearing checks',
    limitsTitle: 'Limitations',
    standardsTitle: 'Standards',
    standardsIntro: 'Life per **ISO 281:2007** basic rating; X/Y from built-in series tables or manual entry.',
    modes: stdCalcModes('en', {
      simpleModel: 'Manual X/Y or simpleEquivalentLoad; Fa without Y → **errorKey block**',
      completeModel: '**Auto X/Y** from seriesId/model; a1, aISO; S₀ check',
      proModel: 'Full + **temperature a₂**, **limitingSpeed** → speedPass; stiffness estimate',
      simplePass: '**pass always false** (estimateOnly); Fa without Y blocks calc',
      completePass: '**pass = lifePass ∧ staticPass** ($L_{10h}\\ge$ target, $S_0\\ge1.5$)',
      proPass: '**pass = lifePass ∧ staticPass ∧ speedPass** ($n\\le$ limitingSpeed)',
      simpleCaveat: 'Fa>0 without Y → no life result',
      completeCaveat: 'autoLookup on by default',
      proCaveat: 'Empty limitingSpeed → speedPass always true',
    }),
    formulas: [
      { name: 'Equivalent load', latex: 'P = X F_r + Y F_a\'', note: 'Fa′ includes axial preload F₀; DB/DF Y×0.72' },
      { name: 'Basic rating life', latex: 'L_{10} = \\left(\\frac{C}{P}\\right)^\\varepsilon', note: 'Mrev; ball ε=3, roller 10/3' },
      { name: 'Life hours', latex: 'L_{10h} = \\frac{10^6}{60n} L_{10}', note: 'lifePass ⇔ ≥ targetHours' },
      { name: 'Modified life', latex: 'L_{nm} = a_1 \\cdot a_{ISO} \\cdot a_2^{\\varepsilon} \\cdot L_{10}', note: 'Pro includes a₂ temperature' },
      { name: 'Static safety', latex: 'S_0 = \\frac{C_0}{P}', note: 'staticPass ⇔ ≥ **1.5** default' },
      { name: 'Mounting factors', latex: 'C\' = f_C \\cdot C', note: 'DT tandem f_C=2; preload raises Fa′ and P' },
    ],
    passChecks: [
      { check: 'Simple · Fa no Y', rule: 'Fa>0 without Y → **bearing_simple_xy_required**' },
      { check: 'Simple · general', rule: '**pass always false** (estimateOnly)' },
      { check: 'lifePass', rule: '$L_{10h}\\ge$ targetHours (default 10000 h)' },
      { check: 'staticPass', rule: '$S_0\\ge$ minStaticSafety (**1.5** default); skip if no C₀' },
      { check: 'Full overall', rule: '**pass = lifePass ∧ staticPass**' },
      { check: 'Pro · speed', rule: 'With limitingSpeed: **speedPass = n≤limit**' },
      { check: 'Pro overall', rule: '**pass = life ∧ static ∧ speed**' },
    ],
    guide: {
      intro: 'ISO 281 rating life from **C**, **C₀**, and equivalent load **P**; Full mode looks up **X/Y** from **bearing-xy-tables**; Professional adds temperature and speed limit.',
      sections: [
        {
          title: '1. X/Y and P',
          bullets: [
            'P = X·Fr + Y·Fa′; preload adds to Fa′',
            'Full: lookupBearingXY by series and Fr/Fa',
            'Simple: must enter Y or simpleEquivalentLoad when Fa present',
            'DB/DF: Y×0.72; DT: C and C₀ doubled',
          ],
        },
        {
          title: '2. Life factors',
          bullets: [
            'a1: reliability (90%→1.0, 99%→0.25)',
            'aISO: lubrication/contamination',
            'a2: temperature (Professional only)',
            'Lnm → L10h for pass',
          ],
        },
        {
          title: '3. Static and speed',
          bullets: [
            'Shock/low-speed: need S₀≥1.5',
            'Pro: n>limitingSpeed → speedPass ✗',
            'Radial stiffness k_r display only—not in pass',
          ],
        },
      ],
    },
    examples: [
      { step: 'Simple radial', detail: 'Fa=0 → P=Fr; L10h shown; **pass=false**' },
      { step: 'Simple Fa no Y', detail: 'errorKey block—no life' },
      { step: 'Full pass', detail: 'Series lookup, L10h OK, S₀≥1.5 → **pass ✓**' },
      { step: 'Static fail', detail: 'S₀=1.2<1.5 → **pass ✗**' },
      { step: 'Pro overspeed', detail: 'n>limitingSpeed → **pass ✗**' },
    ],
    howToPass: [
      {
        goal: 'Pass Full (life + static)',
        steps: [
          'Increase C or reduce P (loads, preload)',
          'Correct seriesId for X/Y',
          'L10h≥target and S₀≥1.5',
          'Life scales as (C/P)³ for ball bearings',
        ],
      },
      {
        goal: 'Pass Professional',
        steps: [
          'Enter catalog limitingSpeed; keep n≤limit',
          'High temp lowers a₂ vs Full',
          'All three: life, static, speed',
        ],
      },
    ],
    faq: [
      { q: 'Why Simple pass ✗?', a: 'estimateOnly—even if lifePass ✓.' },
      { q: 'Fa requires Y?', a: 'Simple blocks with errorKey if Fa>0 and Y not set.' },
      { q: 'Default S₀?', a: 'minStaticSafety=1.5; skipped without C₀.' },
      { q: 'Full vs Simple X/Y?', a: 'Full autoLookup; Simple manual or direct P.' },
      { q: 'Preload vs life?', a: 'Preload raises Fa′ → higher P → shorter life.' },
      { q: 'When a₂≠1?', a: '**Professional** mode only.' },
    ],
    standards: [
      '**ISO 281:2007** — Dynamic load rating and life',
      '**ISO 76** — Static load rating C₀',
      '**ISO 16281** — Modified rating life (aISO concept)',
      '**GB/T 6391** — Chinese bearing rating life standard',
    ],
    limitations: [
      'L10 is 90% reliability statistical life.',
      'X/Y tables cover common series—exotics need manual data.',
      'No film thickness, contamination detail, misalignment, cage strength.',
      'Simple pass always false.',
      'Empty limitingSpeed skips speed check in Pro.',
      'aISO/a2 are simplified step tables.',
      'DB/DF/DT rules are approximations—verify with manufacturer.',
    ],
  },
}

// ─── Block assembly ───────────────────────────────────────────────────────────

/** @param {'zh'|'en'} locale @param {typeof GEAR.zh} c */
function assembleCoreBlocks(locale, c) {
  const L = locale === 'en'
  return [
    modesBlock(L ? 'Calculation modes' : '计算模式对照', c.modes, c.modesSub),
    formulasBlock(L ? 'Main formulas' : '主要公式', c.formulas, c.formulasSub),
    passBlock(L ? 'Pass criteria' : '判定依据', c.passChecks, c.passSub),
    guideBlock(L ? 'How to read results' : '结果判读指南', {
      subtitle: c.guideSub,
      intro: c.guide.intro,
      sections: c.guide.sections,
    }),
    examplesBlock(L ? 'Worked examples' : '算例步骤', c.examples, c.examplesSub),
    howToPassBlock(c.howToTitle, c.howToPass),
    faqBlock(c.faqTitle, c.faq),
    standardsBlock(c.standardsTitle, c.standards, c.standardsIntro),
    limitsBlock(c.limitsTitle, c.limitations),
  ]
}

/** @param {'zh'|'en'} locale */
export function getGearHelp(locale = 'zh') {
  return { blocks: assembleCoreBlocks(locale === 'en' ? 'en' : 'zh', pickLocale(locale, GEAR)) }
}

/** @param {'zh'|'en'} locale */
export function getThreadHelp(locale = 'zh') {
  return { blocks: assembleCoreBlocks(locale === 'en' ? 'en' : 'zh', pickLocale(locale, THREAD)) }
}

/** @param {'zh'|'en'} locale */
export function getBoltPreloadHelp(locale = 'zh') {
  const loc = locale === 'en' ? 'en' : 'zh'
  const c = pickLocale(locale, BOLT_PRELOAD)
  const L = loc === 'en'
  return {
    blocks: [
      modesBlock(L ? 'Calculation modes' : '计算模式对照', c.modes, c.modesSub),
      formulasBlock(L ? 'Main formulas' : '主要公式', c.formulas, c.formulasSub),
      passBlock(L ? 'Pass criteria' : '判定依据', c.passChecks, c.passSub),
      guideBlock(L ? 'How to read results' : '结果判读指南', {
        subtitle: c.guideSub,
        intro: c.guide.intro,
        sections: c.guide.sections,
      }),
      examplesBlock(L ? 'Worked examples' : '算例步骤', c.examples, c.examplesSub),
      howToPassBlock(c.howToTitle, c.howToPass),
      faqBlock(c.faqTitle, c.faq),
      standardsBlock(c.standardsTitle, c.standards, c.standardsIntro),
      limitsBlock(c.limitsTitle, c.limitations),
    ],
  }
}

/** @param {'zh'|'en'} locale */
export function getBearingHelp(locale = 'zh') {
  return { blocks: assembleCoreBlocks(locale === 'en' ? 'en' : 'zh', pickLocale(locale, BEARING)) }
}
