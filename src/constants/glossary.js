export const GLOSSARY_TERMS = [
  {
    id: 'position',
    term: '位置度 (Position)',
    symbol: '⌖',
    category: 'GD&T',
    definition:
      '位置度用来控制一个孔、轴或特征相对基准的「偏离理想位置」有多大。想象在图纸上标了一个理想圆心，实际加工出来的圆心可以偏一点，位置度公差就是允许偏差的范围（通常是一个直径公差带）。在孔组装配中，每个孔的偏心都会叠加，因此常用尺寸链把各孔偏差与定位尺寸一起算，看最终间隙或位置是否合格。',
    tags: ['GD&T', '基准', '孔组'],
  },
  {
    id: 'parallelism',
    term: '平行度 (Parallelism)',
    symbol: '∥',
    category: 'GD&T',
    definition:
      '平行度表示被测表面与基准面「不够平行」的程度。例如安装面应贴合，若上表面相对下基准面有倾斜或局部凸起，就会反映为平行度误差。在 2D 尺寸链里，可把各相关面的平面度、厚度偏差当作组成环，叠加后得到整体平行度或装配间隙的变化量。',
    tags: ['2D', '平面', '基准面'],
  },
  {
    id: 'perpendicularity',
    term: '垂直度 (Perpendicularity)',
    symbol: '⊥',
    category: 'GD&T',
    definition:
      '垂直度衡量被测要素相对基准是否「足够直、足够正交」。典型场景是轴肩端面对轴线的垂直要求，或两块应成 90° 的安装面。若垂直度超差，零件可能装不进去或产生额外侧向力。尺寸链分析时，可把垂直相关面的偏差和定位尺寸一起叠加评估。',
    tags: ['GD&T', '垂直'],
  },
  {
    id: 'coaxiality',
    term: '同轴度 (Coaxiality)',
    symbol: '◎',
    category: 'GD&T',
    definition:
      '同轴度描述两根轴线（或圆柱特征轴线）是否「在同一条中心线上」。例如轴承位与轴颈虽各自尺寸合格，但轴线错开会导致振动或装配困难。同轴度常与径向跳动、孔轴配合尺寸链相关，可用 RSS 把各段径向偏差合成总同轴误差。',
    tags: ['轴系', 'GD&T'],
  },
  {
    id: 'runout',
    term: '跳动 (Runout)',
    symbol: '↗',
    category: 'GD&T',
    definition:
      '跳动是在零件旋转一圈时测量的「径向或端面起伏」。圆跳动看某一截面的径向变化，全跳动则综合整个表面的偏差。它反映圆度、偏心、轴线倾斜等综合效果。对旋转件（如轴、齿轮）来说，跳动过大会引起噪音、磨损和不平衡，需要在尺寸链中把相关径向环叠加评估。',
    tags: ['旋转件', '检测'],
  },
  {
    id: 'flatness',
    term: '平面度 (Flatness)',
    symbol: '⏥',
    category: '形状公差',
    definition:
      '平面度只约束「一个面本身是否平整」，不需要基准。比如盖板密封面若有局部凹坑或鼓包，即使厚度尺寸合格，密封仍可能泄漏。平面度公差带是两平行平面之间的区域。在平行度、装配间隙链中，平面度常作为组成环参与叠加。',
    tags: ['形状', '表面'],
  },
  {
    id: 'straightness',
    term: '直线度 (Straightness)',
    symbol: '—',
    category: '形状公差',
    definition:
      '直线度表示一条线要素（如导轨棱线、轴素线）偏离理想直线的程度。没有基准要求，只看这条线自身形状。若直线度超差，滑动配合可能卡滞。多段直线要素沿长度方向叠加时，可用尺寸链估算总直线偏差对封闭环的影响。',
    tags: ['形状', '2D'],
  },
  {
    id: 'roundness',
    term: '圆度 (Roundness)',
    symbol: '○',
    category: '形状公差',
    definition:
      '圆度描述一个圆截面「不够圆」的程度，例如出现棱圆、椭圆。它不同于直径尺寸：直径合格但圆度仍可能超差。对轴承配合、密封圈槽等旋转功能面尤其重要。多个截面的圆度偏差可通过径向 RSS 合成，用于评估整体旋转精度。',
    tags: ['形状', 'GD&T', '旋转件'],
  },
  {
    id: 'profile',
    term: '轮廓度 (Profile)',
    symbol: '⌓',
    category: 'GD&T',
    definition:
      '轮廓度控制线或面的实际轮廓相对理论轮廓的偏差，可同时约束形状、位置和方向（若带基准）。例如凸轮曲线、叶片型面既要形状对，又要位置对。比单一直线度/平面度更综合，适合复杂曲线零件的整体公差控制。',
    tags: ['轮廓', '曲线'],
  },
  {
    id: 'datum',
    term: '基准 (Datum)',
    symbol: 'A|B|C',
    category: 'GD&T',
    definition:
      '基准是测量和标注的「起点」，用来建立参考坐标系。比如先以底面 A 找平，再以侧面 B 找正，然后测量其他特征相对该坐标系的偏差。在尺寸链里，封闭环方向通常与某一基准方向一致；增环、减环也是相对这个方向来判断的。',
    tags: ['基准系', '装配'],
  },
  {
    id: 'mmc',
    term: '最大实体 (MMC)',
    symbol: 'Ⓜ',
    category: 'GD&T 修饰',
    definition:
      'MMC 指要素处于「材料最多」的极限尺寸状态：对孔是最小孔径，对轴是最大轴径。当位置度标注 MMC 时，若孔变大或轴变小（偏离 MMC），可以额外获得「奖励公差」，即公差带可扩大。这样在保证最坏情况仍能装配的前提下，给正常尺寸更多制造余量。',
    tags: ['补偿', '孔轴'],
  },
  {
    id: 'lmc',
    term: '最小实体 (LMC)',
    symbol: 'Ⓛ',
    category: 'GD&T 修饰',
    definition:
      'LMC 是材料最少的状态：孔为最大孔径，轴为最小轴径。常用于需要保证最小壁厚、最小强度或最小过盈的场合。与 MMC 类似，某些公差在 LMC 下也可获得补偿，但工程上 MMC 更常见于孔组位置度以放宽制造。',
    tags: ['壁厚', '强度'],
  },
  {
    id: 'closed-loop',
    term: '封闭环',
    symbol: 'L₀',
    category: '尺寸链',
    definition:
      '封闭环是尺寸链最终要求保证的那个尺寸或间隙，一般是装配后才形成的量，例如两零件之间的间隙、台阶高度、总长度等。分析时先明确封闭环的上下限（设计要求），再反推各组成环的公差是否足够。本工具的步骤 2 就是在定义封闭环。',
    tags: ['尺寸链', '目标'],
  },
  {
    id: 'component-ring',
    term: '组成环',
    symbol: 'L₁…Lₙ',
    category: '尺寸链',
    definition:
      '组成环是直接影响封闭环的各个零件尺寸或公差项。增环：尺寸增大则封闭环同向增大；减环：尺寸增大则封闭环反向变化。例如「槽宽 − 零件宽度 = 间隙」中，槽宽可能是增环，零件宽度是减环。每个环都有公称值和公差（ES/EI）。',
    tags: ['增环', '减环'],
  },
  {
    id: 'transfer-factor',
    term: '传递系数',
    symbol: 'f',
    category: '尺寸链',
    definition:
      '传递系数表示某个组成环的偏差对封闭环影响有多大，1 表示完全传递，0.5 表示只传递一半。简单 1D 链通常为 1；在 2D/GD&T 或几何关系复杂时，可用系数近似灵敏度。高级模式下可编辑该系数，用于加权 RSS 或公差分配。',
    tags: ['加权', 'RSS'],
  },
  {
    id: 'worst-case',
    term: '极值法',
    symbol: 'T=ΣTᵢ',
    category: '统计方法',
    definition:
      '极值法假设每个组成环的公差都同时处于最不利方向，然后把公差直接相加。结果最保守，相当于 100% 安全——只要按此设计，任何合法零件组合都不会超差。缺点是往往把公差设计得过紧，加工成本高。适合安全关键、不允许失效的场合。',
    tags: ['极值', '100%'],
  },
  {
    id: 'rss',
    term: 'RSS 法',
    symbol: 'T=√ΣTᵢ²',
    category: '统计方法',
    definition:
      'RSS（Root Sum Square，平方和开方）把各环公差当作独立随机误差，按平方和再开方合成总公差。相比极值法更贴近批量生产的实际情况，通常对应约 95% 的合格率。前提是各环误差相互独立、近似正态。本工具默认推荐 RSS 作为常规机械设计方法。',
    tags: ['概率', '正态'],
  },
  {
    id: 'modified-rss',
    term: '修正 RSS',
    symbol: 'T=k·√ΣTᵢ²',
    category: '统计方法',
    definition:
      '当各环误差不是理想正态（例如均匀分布、三角分布或偏态分布）时，可在 RSS 结果上乘以修正系数 k，得到更合理的总公差。均匀分布的环波动范围固定，比正态更「满」，因此 k 通常大于 1。选择修正 RSS 时可在步骤 4 指定分布类型。',
    tags: ['修正', '均匀分布'],
  },
  {
    id: 'cpk',
    term: 'Cpk',
    symbol: 'Cpk',
    category: '过程能力',
    definition:
      'Cpk 衡量生产过程「能否稳定落在规格范围内」，同时考虑过程中心是否偏移。USL/LSL 是规格上下限，μ 是过程均值，σ 是标准差。Cpk 取「距上规格」和「距下规格」中较小的一侧除以 3σ。Cpk≥1.33 通常认为过程能力良好；小于 1 说明波动太大或中心偏了，不合格风险高。结果页会给出当前 Cpk 与对照表供参考。',
    tags: ['SPC', '质量'],
  },
  {
    id: 'sigma-level',
    term: '西格玛水平',
    symbol: 'σ水平',
    category: '过程能力',
    definition:
      '西格玛水平描述过程变异相对规格带宽的宽窄，数值越大表示过程越稳定、越不容易出不合格品。在正态近似下，3σ 约对应 99.73% 合格率，6σ 则接近零缺陷。工具中用目标公差与 RSS 合成 σ 估算 σ 水平，并进一步换算合格率与 DPPM（百万分之不合格数）。',
    tags: ['6σ', '合格率'],
  },
  {
    id: 'monte-carlo',
    term: 'Monte Carlo 模拟',
    symbol: 'MC',
    category: '统计方法',
    definition:
      'Monte Carlo 通过计算机随机生成大量样本（例如 1 万次），模拟各组成环尺寸在公差带内的随机组合，再统计封闭环落在规格内的比例。它不依赖正态近似，适合复杂分布或想直观看到直方图、合格率时使用。可从编辑器一键跳转并带入当前参数。',
    tags: ['模拟', '随机'],
  },
  {
    id: 'distribution-k',
    term: '分布系数 K',
    symbol: 'K',
    category: '统计方法',
    definition:
      '分布系数 K 用于把公差 T 换算成标准差 σ：σ = T/K。不同分布形状 K 不同——正态常用 K=6（±3σ 覆盖规格），均匀分布 K≈3.46，三角分布 K≈4.24。6σ RSS 法会用各环的 K 把公差还原为 σ 后再做统计叠加，比简单 RSS 更严谨。',
    tags: ['转换', '分布'],
  },
  {
    id: 'agma-geometry-i',
    term: 'AGMA 几何系数 I',
    symbol: 'I',
    category: '齿轮',
    definition:
      'AGMA 2101 中用于接触应力计算的几何系数，反映齿廓曲率与啮合位置对赫兹接触的影响。与 ISO 6336 的 Z 系数体系不同，I 直接出现在分母中。本工具采用基于齿数比的简化估算，完整计算需查 AGMA 图表。',
    tags: ['AGMA', '齿轮', '接触'],
  },
  {
    id: 'iso1328-grade',
    term: 'ISO 1328 精度等级',
    symbol: '—',
    category: '齿轮',
    definition:
      'ISO 1328 规定齿轮轮齿各偏差项目的公差等级（通常 5–12 级，数字越小精度越高）。包括单齿距偏差 f_pt、齿距累积 F_pt、齿形 f_fα、齿向 F_β 等。精度等级直接影响加工难度与 ISO 6336/AGMA 中的动载系数。',
    tags: ['ISO 1328', '齿轮', '精度'],
  },
  {
    id: 'gage-rr',
    term: 'Gage R&R（测量系统重复性与再现性）',
    symbol: 'GRR',
    category: '质量',
    definition:
      'MSA 核心指标，评估测量仪器与操作员引入的变异占总变异的比例。%GRR < 10% 通常认为测量系统可接受。重复性 EV 反映仪器本身波动，再现性 AV 反映不同操作员之间的差异。',
    tags: ['MSA', '质量', '测量'],
  },
  {
    id: 'aql',
    term: 'AQL（可接受质量水平）',
    symbol: 'AQL',
    category: '质量',
    definition:
      '抽样检验中允许批平均不合格率的上限。配合 GB/T 2828.1 等标准，由批量与检验水平确定样本量 n 及接收数 Ac、拒收数 Re。AQL 越小，抽样越严。',
    tags: ['AQL', '抽样', '质量'],
  },
  {
    id: 'k-factor-sheet',
    term: 'K 因子（钣金折弯）',
    symbol: 'K',
    category: '制造',
    definition:
      '折弯展开计算中中性层位置的系数，BA = (π/180)·θ·(R + K·T)。K≈0.33 适用于空气折弯且 R≈T 的常见情况；压印折弯 K 更大。准确 K 值需通过试验或折弯软件标定。',
    tags: ['钣金', '折模', 'K因子'],
  },
  {
    id: 'draft-angle',
    term: '拔模斜度',
    symbol: 'α',
    category: '制造',
    definition:
      '铸造件上为使模型从砂型或模具中顺利脱出而设计的锥度。外表面、内腔、深型芯所需角度不同；深度越大、表面越粗糙，所需拔模角越大。不足会导致拉伤、粘模或顶裂。',
    tags: ['铸造', '拔模', '工艺'],
  },
  {
    term: 'Jominy 端淬试验',
    symbol: '—',
    category: '材料',
    definition:
      '将标准试样一端水淬、沿棒长测量硬度，得到淬透性曲线。距淬火端越远硬度下降越快，表示钢种淬透性越差。常用于对比不同成分与晶粒度的淬硬深度。',
    tags: ['热处理', 'Jominy', '淬透性'],
  },
  {
    term: '碳当量 (CE)',
    symbol: 'CE',
    category: '材料',
    definition:
      '由化学成分换算的综合指标，反映钢的淬硬倾向与焊接裂纹敏感性。CE 越高，越容易在淬火中获得高硬度，但焊接时也更需要预热与控冷。',
    tags: ['碳当量', '焊接', '热处理'],
  },
  {
    term: '响应面法 (RSM)',
    symbol: '—',
    category: '统计',
    definition:
      '通过 DOE 试验拟合响应与因子之间的数学模型（常为二次多项式），并用等高线图寻找最优工艺窗口。中心复合设计 (CCD) 是二因子 RSM 的常用方案。',
    tags: ['RSM', 'DOE', '优化'],
  },
  {
    term: 'ISO 286 配合',
    symbol: '—',
    category: '公差',
    definition:
      '基于孔轴公差带位置关系划分的配合制度。孔代号大写（如 H7）、轴代号小写（如 g6）；H7/g6 为常见精密间隙配合。配合类型由最大/最小间隙判断：全为正间隙、全为负过盈或跨零为过渡。',
    tags: ['ISO286', '公差', '配合'],
  },
  {
    term: 'VDI 2230',
    symbol: '—',
    category: '螺栓',
    definition:
      '德国工程师协会螺栓连接设计规范，分 R0–R13 计算步骤，涵盖拧紧方法、夹紧力需求、嵌入与温差损失、应力与疲劳等。提供工程简化分步向导辅助校核。',
    tags: ['VDI2230', '螺栓', '预紧力'],
  },
  {
    term: '基准参考系 (DRF)',
    symbol: 'A|B|C',
    category: 'GD&T',
    definition:
      '由主、次、第三基准构成的坐标系，用于约束被测要素的测量与公差叠加。基准面自身的 flatness 与 perpendicularity 误差会累积到以该基准为参考的形位公差栈中。',
    tags: ['GD&T', '基准', 'DRF'],
  },
]

export function searchGlossary(query) {
  const q = query.trim().toLowerCase()
  if (!q) return GLOSSARY_TERMS
  return GLOSSARY_TERMS.filter(
    (item) =>
      item.term.toLowerCase().includes(q) ||
      item.definition.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q),
  )
}
