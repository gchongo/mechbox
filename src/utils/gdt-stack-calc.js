/**
 * GD&T 形位公差栈分析 — 贡献度、基准累积与增强报告
 */
import {
  calculateChainResult,
  getGdtCalcMode,
  GDT_CALC_MODES,
} from '@/utils/gdt-chain'
import { worstCaseMethod } from '@/utils/size-chain-math'
import { t } from '@/i18n'

export { GDT_CALC_MODES, getGdtCalcMode }

/** 各组成环对封闭环公差的贡献度 (%) */
export function calcGdtContributions(rings, method = 'rss', typeId) {
  if (!rings?.length) return []

  const mode = getGdtCalcMode(typeId)
  const is2d = mode?.stack === '2d-position'

  if (is2d && method !== 'worst') {
    const xRings = rings.filter((r) => ['left', 'right'].includes(r.direction ?? 'right'))
    const yRings = rings.filter((r) => ['up', 'down'].includes(r.direction ?? 'up'))
    const xContrib = calcAxisContributions(xRings, method)
    const yContrib = calcAxisContributions(yRings, method)
    return [...xContrib, ...yContrib].sort((a, b) => b.percent - a.percent)
  }

  const mapped = rings.map((r) => ({
    uid: r.uid ?? r.name,
    name: r.name ?? '环',
    tolerance: (r.tolerance ?? 0) * (r.factor ?? 1),
  }))

  if (method === 'worst') {
    const total = worstCaseMethod(mapped)
    return mapped.map((r) => ({
      name: r.name,
      tolerance: r.tolerance,
      percent: total ? (r.tolerance / total) * 100 : 0,
      sensitivity: r.tolerance,
    }))
  }

  const squares = mapped.map((r) => r.tolerance ** 2)
  const sumSq = squares.reduce((a, b) => a + b, 0)
  const total = Math.sqrt(sumSq)

  return mapped.map((r, i) => ({
    name: r.name,
    tolerance: r.tolerance,
    percent: sumSq ? (squares[i] / sumSq) * 100 : 0,
    sensitivity: total ? r.tolerance / total : 0,
  }))
}

function calcAxisContributions(rings, method) {
  const mapped = rings.map((r) => ({
    name: `${r.name ?? '环'} (${axisLabel(r.direction)})`,
    tolerance: (r.tolerance ?? 0) * (r.factor ?? 1),
  }))
  if (!mapped.length) return []

  if (method === 'worst') {
    const total = worstCaseMethod(mapped)
    return mapped.map((r) => ({
      ...r,
      percent: total ? (r.tolerance / total) * 50 : 0,
    }))
  }

  const squares = mapped.map((r) => r.tolerance ** 2)
  const sumSq = squares.reduce((a, b) => a + b, 0)
  return mapped.map((r, i) => ({
    ...r,
    percent: sumSq ? (squares[i] / sumSq) * 50 : 0,
  }))
}

function axisLabel(dir) {
  return { left: 'X-', right: 'X+', up: 'Y+', down: 'Y-' }[dir] ?? dir
}

/** 基准参考系累积误差（简化：各基准面 flatness/perpendicularity RSS 叠加） */
export function calcDatumAccumulation(datums) {
  if (!datums?.length) return { total: 0, items: [] }

  const items = datums.map((d) => {
    const t = d.tolerance ?? 0
    const weight = d.priority === 'primary' ? 1 : d.priority === 'secondary' ? 0.7 : 0.5
    return {
      label: d.label ?? d.name ?? '基准',
      priority: d.priority ?? 'primary',
      tolerance: t,
      weighted: t * weight,
    }
  })

  const sumSq = items.reduce((s, i) => s + i.weighted ** 2, 0)
  return {
    total: Math.sqrt(sumSq),
    items,
    formula: 'T_{datum} = \\sqrt{\\sum (w_i T_i)^2}',
  }
}

/** 完整 GD&T 栈分析 */
export function analyzeGdtStack(input) {
  const calcMode = input.calcMode ?? 'complete'
  const {
    typeId = 'position',
    closedRing = { min: 0, max: 0.1 },
    rings = [],
    method = 'rss',
    toleranceModifier = 'RFS',
    bonusTolerance = 0,
    autoBonus = true,
    datums = [],
  } = input

  const mode = getGdtCalcMode(typeId)
  if (!mode) return { errorKey: 'gdt_unknown_type', errorParams: { typeId } }
  if (!rings.length) return { errorKey: 'gdt_need_ring' }

  const chainResult = calculateChainResult(closedRing, rings, method, {
    typeId,
    toleranceModifier,
    bonusTolerance,
    autoBonus,
    distribution: input.distribution ?? 'normal',
  })

  const result = {
    calcMode,
    typeId,
    mode,
    method,
    closedRing,
    chainResult,
    pass: chainResult.pass,
    modifier: {
      type: toleranceModifier,
      bonus: chainResult.bonusApplied ?? 0,
      bonusInput: bonusTolerance,
      source: chainResult.bonusSource ?? 'none',
      breakdown: chainResult.bonusBreakdown ?? [],
      effective: chainResult.effectiveTolerance ?? chainResult.totalTolerance,
    },
  }

  if (calcMode === 'simple') {
    return result
  }

  const contributions = calcGdtContributions(rings, method, typeId)
  const datumStack = datums.length ? calcDatumAccumulation(datums) : null

  let effectiveWithDatum = chainResult.totalTolerance
  if (datumStack) {
    effectiveWithDatum = Math.sqrt(
      chainResult.totalTolerance ** 2 + datumStack.total ** 2,
    )
  }

  const passWithDatum =
    chainResult.nominal + effectiveWithDatum / 2 <= closedRing.max &&
    chainResult.nominal - effectiveWithDatum / 2 >= closedRing.min

  Object.assign(result, {
    contributions,
    datumStack,
    effectiveWithDatum: round(effectiveWithDatum, 6),
    passWithDatum,
    topContributor: contributions[0]?.name ?? null,
  })

  if (calcMode === 'professional') {
    result.sensitivityRanking = contributions.map((c, i) => ({
      rank: i + 1,
      name: c.name,
      percent: c.percent,
      tightenTo: round(c.tolerance * 0.8, 4),
    }))
    result.worstCase = calculateChainResult(closedRing, rings, 'worst', {
      typeId,
      toleranceModifier,
      bonusTolerance,
      autoBonus,
    })
    const wc = result.worstCase
    result.worstCaseMargin = round(
      Math.min(closedRing.max - wc.upper, wc.lower - closedRing.min),
      4,
    )
    result.pass = result.pass && result.worstCaseMargin >= 0
  }

  return result
}

export const GDT_STACK_PRESETS = {
  position: {
    label: '孔组位置度',
    typeId: 'position',
    closedRing: { min: 0, max: 0.15 },
    rings: [
      { name: 'X 定位', tolerance: 0.05, direction: 'right', factor: 1, type: 'increasing' },
      { name: 'Y 定位', tolerance: 0.04, direction: 'up', factor: 1, type: 'increasing' },
      {
        name: '孔径',
        tolerance: 0.02,
        direction: 'right',
        factor: 0.5,
        type: 'increasing',
        featureKind: 'hole',
        sizeTolerance: 0.03,
      },
    ],
    datums: [
      { label: 'A 底面', priority: 'primary', tolerance: 0.02 },
      { label: 'B 侧面', priority: 'secondary', tolerance: 0.03 },
    ],
  },
  flatness: {
    label: '平面度栈',
    typeId: 'flatness',
    closedRing: { min: 0, max: 0.08 },
    rings: [
      { name: '面1 flatness', tolerance: 0.03, factor: 1, type: 'increasing' },
      { name: '面2 flatness', tolerance: 0.025, factor: 1, type: 'increasing' },
      { name: '面3 flatness', tolerance: 0.02, factor: 1, type: 'increasing' },
    ],
    datums: [],
  },
  coaxiality: {
    label: '同轴度栈',
    typeId: 'coaxiality',
    closedRing: { min: 0, max: 0.05 },
    rings: [
      { name: '外圆 runout', tolerance: 0.02, factor: 1, type: 'increasing' },
      { name: '内孔偏心', tolerance: 0.015, factor: 1, type: 'increasing' },
      { name: '轴承径向游隙', tolerance: 0.008, factor: 0.5, type: 'increasing' },
    ],
    datums: [{ label: 'A 轴心', priority: 'primary', tolerance: 0.01 }],
  },
}

export function buildGdtStackReportText(result, locale = 'zh') {
  const msg = (key, params) => t(`calc.messages.gdtStack.${key}`, locale, params)
  const modeLabel =
    t(`calc.options.gdtCalcModes.${result.typeId ?? result.mode?.id}.label`, locale) ||
    result.mode?.label
  const passLabel = result.pass ? msg('report_pass') : msg('report_fail')
  const lines = [
    msg('report_title'),
    `${msg('report_type')}: ${modeLabel}`,
    `${msg('report_method')}: ${result.method}`,
    `${msg('report_closed')}: ${result.chainResult.totalTolerance?.toFixed(4)} mm`,
    `${passLabel}: ${result.pass ? t('calc.fields.common.yes', locale) : t('calc.fields.common.no', locale)}`,
  ]
  if (result.datumStack) {
    const datumPass = result.passWithDatum ? msg('report_pass') : msg('report_fail')
    lines.push(
      `${msg('report_with_datum')}: ${result.effectiveWithDatum.toFixed(4)} mm (${datumPass})`,
    )
  }
  lines.push('', `${msg('report_contributions')}:`)
  for (const c of result.contributions) {
    lines.push(`  ${c.name}: ${c.percent.toFixed(1)}% (T=${c.tolerance})`)
  }
  return lines.join('\n')
}

function round(v, d) {
  const f = 10 ** d
  return Math.round(v * f) / f
}
