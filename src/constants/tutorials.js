/** Bilibili 嵌入式播放器 URL */
export function bilibiliPlayerUrl(bvid) {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=0`
}

/** Bilibili 视频页链接 */
export function bilibiliPageUrl(bvid) {
  return `https://www.bilibili.com/video/${bvid}/`
}

export const TUTORIALS = [
  {
    id: 1,
    title: '尺寸链基础',
    duration: '约 15 分钟',
    desc: '封闭环、组成环、增环减环的基本概念',
    videoBvid: 'BV1b5411c7dg',
    videoTitle: '尺寸链计算分析基础（术语规则解释及过程演示）',
    videoEmbed: bilibiliPlayerUrl('BV1b5411c7dg'),
    videoUrl: bilibiliPageUrl('BV1b5411c7dg'),
    sections: [
      {
        heading: '什么是尺寸链',
        body: '尺寸链描述装配中各零件尺寸如何共同决定最终间隙或过盈。封闭环 $L_0$ 是我们要保证的设计要求。',
      },
      {
        heading: '组成环',
        body: '组成环是链中各零件的直接尺寸。每个环有名义值和公差，并分为增环或减环。',
      },
      {
        heading: '快速上手',
        body: '在 MechBox 中：选择类型 → 定义封闭环目标范围 → 添加组成环 → 选方法 → 查看结果。',
      },
    ],
  },
  {
    id: 2,
    title: '齿轮装配案例',
    duration: '约 12 分钟',
    desc: '挡环 + 齿轮 + 轴径的典型间隙分析',
    videoBvid: 'BV1WT41157CL',
    videoTitle: '装配尺寸链计算案例',
    videoEmbed: bilibiliPlayerUrl('BV1WT41157CL'),
    videoUrl: bilibiliPageUrl('BV1WT41157CL'),
    sections: [
      {
        heading: '案例背景',
        body: '齿轮轴向需要保证 $0.10\\sim 0.35\\,\\text{mm}$ 的装配间隙，涉及挡环厚度、齿轮宽度和轴径三个组成环。',
      },
      {
        heading: '操作步骤',
        body: '打开「案例库」→ 点击「齿轮装配间隙」，系统自动加载数据并跳转到结果页。',
      },
      {
        heading: '结果解读',
        body: '对比极值法与 RSS 法的上限/下限，检查是否落在目标范围内。RSS 通常给出更合理的公差估计。',
      },
    ],
    caseId: 'gear-gap',
  },
  {
    id: 3,
    title: 'RSS 法详解',
    duration: '约 18 分钟',
    desc: '概率统计叠加原理与适用场景',
    videoBvid: 'BV11r4y1u7as',
    videoTitle: '尺寸链专栏：尺寸链累加如何计算，尺寸公差有什么缺点？',
    videoEmbed: bilibiliPlayerUrl('BV11r4y1u7as'),
    videoUrl: bilibiliPageUrl('BV11r4y1u7as'),
    sections: [
      {
        heading: '公式',
        body: '$T = \\sqrt{T_1^2 + T_2^2 + T_3^2 + \\cdots}$，假设各环误差独立且随机分布。',
      },
      {
        heading: '与极值法对比',
        body: '极值法 $T=\\sum T_i$ 最保守；RSS 更接近批量生产统计实际，一般对应较高但不保证 100% 的合格率。',
      },
      {
        heading: '在 MechBox 中使用',
        body: '步骤 4 默认选中 RSS 法。结果页同时展示两种方法，便于对比决策。',
      },
    ],
  },
  {
    id: 4,
    title: '极值法 vs RSS',
    duration: '约 20 分钟',
    desc: '两种方法的差异与选用建议',
    videoBvid: 'BV1QR4y1R7Le',
    videoTitle: '装配尺寸链计算（结合公差软件详细操作案例）',
    videoEmbed: bilibiliPlayerUrl('BV1QR4y1R7Le'),
    videoUrl: bilibiliPageUrl('BV1QR4y1R7Le'),
    sections: [
      {
        heading: '极值法',
        body: '所有环公差同向叠加到最坏情况，适合安全关键、法规严格或小批量验证。',
      },
      {
        heading: 'RSS 法',
        body: '适合一般机械设计、批量生产，能在保证合理合格率的同时避免过度保守设计。',
      },
      {
        heading: '决策建议',
        body: '先用 RSS 评估，若不合格或风险不可接受，再切换极值法或收紧关键环公差。',
      },
    ],
  },
  {
    id: 5,
    title: '西格玛水平与 Cpk',
    duration: '约 25 分钟',
    desc: '质量水平评估指标',
    videoBvid: 'BV1fS4y1m7PB',
    videoTitle: '人人会六西格玛23 — 过程能力指数 Cp、Cpk（一）',
    videoEmbed: bilibiliPlayerUrl('BV1fS4y1m7PB'),
    videoUrl: bilibiliPageUrl('BV1fS4y1m7PB'),
    sections: [
      {
        heading: '西格玛水平',
        body: '$\\sigma_{\\text{水平}} = T_{\\text{目标}}/(6\\sigma)$，反映过程变异相对目标公差的宽窄，越大过程越稳定。',
      },
      {
        heading: 'Cpk',
        body: '$C_{pk} > 1.33$ 通常认为过程能力良好。结果页步骤 5 自动计算。',
      },
      {
        heading: '统计工具',
        body: '「统计」页面可独立进行 $T \\leftrightarrow \\sigma$ 转换、RSS 计算和西格玛分析，无需完整尺寸链。',
      },
    ],
  },
]
