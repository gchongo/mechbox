/**
 * 链级报告 —— 合并链中所有 CalcResult 为单份 PDF sections
 */

import { CHAIN_TYPES, chainSummary } from '@/utils/design-context'
import { buildEnhancedReport } from '@/utils/enhanced-report'

export function buildChainReport(chain) {
  if (!chain) return { title: '设计链报告', sections: [] }
  const meta = CHAIN_TYPES[chain.type] ?? { label: '设计链' }
  const summary = chainSummary(chain)

  const sections = []

  sections.push({
    heading: '链概览',
    rows: [
      { label: '链名', value: chain.name },
      { label: '类型', value: meta.label },
      { label: '整体判定', value: statusLabel(summary.status) },
      { label: '通过步骤', value: `${summary.passCount}/${summary.total}` },
      { label: '更新时间', value: new Date(chain.updatedAt).toLocaleString('zh-CN') },
    ],
  })

  sections.push({
    heading: '共享输入',
    rows: Object.entries(chain.sharedInputs).map(([k, v]) => {
      const spec = meta.sharedInputSchema?.[k]
      return { label: spec?.label ?? k, value: String(v) }
    }),
  })

  for (const step of chain.steps) {
    const stepMeta = meta.steps.find((s) => s.key === step.key)
    sections.push({
      heading: `— ${stepMeta?.label ?? step.key} —`,
      rows: [{ label: '状态', value: step.snapshot ? (step.snapshot.pass ? '通过 ✓' : '不通过 ✗') : '未评估' }],
    })
    if (!step.snapshot) continue
    const stepReport = buildEnhancedReport({ snapshot: step.snapshot })
    for (const s of stepReport.sections) {
      if (s.heading === '免责声明') continue
      sections.push(s)
    }
    if (step.notes) sections.push({ heading: null, text: `笔记：${step.notes}` })
  }

  sections.push({
    heading: '免责声明',
    text: '本链级报告基于各步简化工程模型联合评估。若涉及安全关键结构，请以完整标准复核并由持证工程师签署。',
  })

  return {
    title: `${meta.label} · ${chain.name}`,
    subtitle: `整体判定：${statusLabel(summary.status)} · 通过 ${summary.passCount}/${summary.total}`,
    sections,
  }
}

function statusLabel(s) {
  if (s === 'pass') return '通过 ✓'
  if (s === 'fail') return '不通过 ✗'
  if (s === 'incomplete') return '未完成'
  return '-'
}
