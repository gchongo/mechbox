/**
 * 增强报告构建 —— 将 CalcResult + 敏感度分析组装成 PDF sections
 *
 * 与现有 export.js 的 exportToolReportPdf 兼容：产出 sections 数组。
 */

import { topSensitivities } from '@/utils/sensitivity-analysis'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { formatUnconfirmedLabels } from '@/utils/critical-input-guard'

/**
 * @param {Object} config
 * @param {import('./calc-result').CalcResult} config.snapshot
 * @param {Object} [config.sensitivity]  runSensitivityAnalysis 结果
 * @param {string} [config.primaryMetric]  报告首要指标 key（用于敏感度排序）
 * @returns {{title:string, subtitle:string, sections:Array}}
 */
export function buildEnhancedReport({ snapshot, sensitivity, primaryMetric }) {
  if (!snapshot) return { title: '计算报告', subtitle: '', sections: [] }

  const sections = []
  const reviewStatus = getCalcReviewStatus(snapshot)

  sections.push({
    heading: '关键结果',
    rows: snapshot.keyMetrics.map((m) => ({
      label: m.label,
      value: formatMetric(m),
    })),
  })

  const passRow = [
    {
      label: '整体判定',
      value:
        reviewStatus === 'pass'
          ? '满足当前校核条件（非正式放行，仍需工程复核）'
          : reviewStatus === 'review'
            ? snapshot.releaseBlocked
              ? '未放行（关键输入待确认）'
              : '数值结果可参考（估算/待复核）'
            : '未满足校核条件 ✗',
    },
    { label: '计算模式', value: snapshot.calcMode ?? '-' },
  ]
  sections.push({ heading: '判定汇总', rows: passRow })

  if (snapshot.unconfirmedCriticalInputs?.length) {
    sections.push({
      heading: '未确认关键输入',
      text: formatUnconfirmedLabels(snapshot.unconfirmedCriticalInputs, 'zh').join('、'),
    })
  }

  if (snapshot.standards?.length) {
    sections.push({
      heading: '引用标准 / 方法',
      rows: snapshot.standards.map((s) => ({ label: '标准', value: s })),
    })
  }

  if (snapshot.assumptions?.length) {
    sections.push({
      heading: '假设与简化',
      text: snapshot.assumptions.map((a, i) => `${i + 1}. ${a}`).join('\n'),
    })
  }

  if (snapshot.warnings?.length) {
    sections.push({
      heading: '警告',
      text: snapshot.warnings
        .map((w) => `[${(w.level ?? 'info').toUpperCase()}] ${w.message ?? w.key}`)
        .join('\n'),
    })
  }

  if (sensitivity && primaryMetric) {
    const top = topSensitivities(sensitivity, primaryMetric, 3)
    if (top.length) {
      sections.push({
        heading: `敏感度 Top ${top.length}（对 ${primaryMetric} 影响）`,
        rows: top.map((t) => ({
          label: t.label,
          value: `±${Math.abs(t.swingPercent).toFixed(1)}%`,
        })),
      })
    }
  }

  if (snapshot.suggestions?.length) {
    sections.push({
      heading: '建议',
      text: snapshot.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    })
  } else if (reviewStatus === 'pass') {
    sections.push({
      heading: '建议',
      text:
        '当前输入在当前计算模型下满足校核条件。结果仅供工程辅助判断，须结合完整标准、制造条件与持证工程师复核后方可用于生产放行。',
    })
  } else if (reviewStatus === 'review') {
    sections.push({
      heading: '建议',
      text:
        snapshot.releaseBlocked
          ? '当前结果处于未放行状态。请先确认关键输入，再复核结论是否满足工程要求。'
          : '当前结果仅供估算或工程预判使用。正式设计决策前请补充完整输入并按标准复核。',
    })
  }

  sections.push({
    heading: '免责声明',
    text: '本报告基于工程简化模型，若涉及安全关键结构，请以完整标准复核并由持证工程师签署。',
  })

  return {
    title: `${snapshot.toolLabel} 工程报告`,
    subtitle: `模式：${snapshot.calcMode ?? '-'} · 生成时间：${new Date(snapshot.timestamp).toLocaleString('zh-CN')}`,
    sections,
  }
}

function formatMetric(m) {
  const v = m.value
  const formatted = typeof v === 'number' && Number.isFinite(v)
    ? formatNumber(v)
    : String(v ?? '-')
  const unit = m.unit ? ` ${m.unit}` : ''
  const status = m.status === 'pass' ? ' ✓' : m.status === 'fail' ? ' ✗' : ''
  return `${formatted}${unit}${status}`
}

function formatNumber(v) {
  if (v === Infinity) return '∞'
  if (Math.abs(v) >= 1000) return v.toFixed(0)
  if (Math.abs(v) >= 10) return v.toFixed(1)
  if (Math.abs(v) >= 1) return v.toFixed(2)
  return v.toFixed(3)
}
