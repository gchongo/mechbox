import * as XLSX from 'xlsx'
import { t } from '@/i18n'
import {
  formatHistorySource,
  formatHistoryStatus,
  formatHistoryTitle,
  formatHistoryType,
} from '@/utils/calc-history'

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function ex(key, locale = 'zh', params) {
  return t(`calc.pages.editor.export.${key}`, locale, params)
}

function ringTypeLabel(type, locale = 'zh') {
  return type === 'increasing' ? ex('ringInc', locale) : ex('ringDec', locale)
}

export async function exportToolReportPdf({ title, sections = [], element, filename, meta = {} }) {
  const locale = meta.locale ?? 'zh'
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 14
  let y = margin

  pdf.setFontSize(14)
  pdf.text(title ?? ex('defaultReport', locale), margin, y)
  y += 8
  pdf.setFontSize(8)
  pdf.text(`${ex('date', locale)}: ${dateStamp()}`, margin, y)
  y += 5
  if (meta.subtitle) {
    pdf.text(meta.subtitle, margin, y)
    y += 5
  }
  y += 4

  pdf.setFontSize(10)
  for (const sec of sections) {
    if (y > pageH - 30) {
      pdf.addPage()
      y = margin
    }
    pdf.setFont(undefined, 'bold')
    pdf.text(sec.heading ?? '', margin, y)
    y += 6
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(9)
    for (const row of sec.rows ?? []) {
      if (y > pageH - 20) {
        pdf.addPage()
        y = margin
      }
      const label = row.label ?? ''
      const value = String(row.value ?? '')
      pdf.text(`${label}: ${value}`, margin + 2, y)
      y += 5
    }
    if (sec.text) {
      const lines = pdf.splitTextToSize(sec.text, pageW - margin * 2)
      for (const line of lines) {
        if (y > pageH - 20) {
          pdf.addPage()
          y = margin
        }
        pdf.text(line, margin + 2, y)
        y += 4.5
      }
    }
    y += 4
    pdf.setFontSize(10)
  }

  if (element) {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const img = canvas.toDataURL('image/png')
    const contentW = pageW - margin * 2
    const imgH = (canvas.height * contentW) / canvas.width
    if (y + imgH > pageH - margin) {
      pdf.addPage()
      y = margin
    }
    pdf.addImage(img, 'PNG', margin, y, contentW, imgH)
  }

  const pages = pdf.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(ex('footer', locale, { date: dateStamp(), page: i, pages }), pageW / 2, pageH - 8, {
      align: 'center',
    })
  }

  pdf.save(filename ?? `MechBox报告_${dateStamp()}.pdf`)
}

/** 从历史记录合并导出 PDF */
export async function exportMergedHistoryPdf(records, filename, locale = 'zh') {
  const dateLoc = locale === 'en' ? 'en-US' : 'zh-CN'
  const sections = records.map((r, i) => {
    const data = r.data ?? {}
    const rows = [
      { label: ex('mergeStatus', locale), value: formatHistoryStatus(r.status, locale) },
      { label: ex('mergeSource', locale), value: formatHistorySource(r, locale) },
      { label: ex('mergeDate', locale), value: new Date(r.date).toLocaleString(dateLoc) },
      { label: ex('mergeAnalysisType', locale), value: formatHistoryType(r, locale) },
      { label: ex('mergeMethod', locale), value: data.method ?? data.methodLabel ?? '-' },
    ]
    if (data.closedRing) {
      rows.push({
        label: ex('closedRing', locale),
        value: `${data.closedRing.name ?? '-'} [${data.closedRing.min} ~ ${data.closedRing.max}]`,
      })
    }
    if (data.results?.length) {
      const best = data.results.find((x) => x.pass) ?? data.results[0]
      rows.push({
        label: ex('mergeResult', locale),
        value: `${best.method ?? '-'} T=${best.tolerance ?? '-'} ${best.pass ? ex('pass', locale) : ex('fail', locale)}`,
      })
    }
    if (data.summary?.length) {
      for (const s of data.summary) {
        rows.push({ label: s.label, value: String(s.value ?? '') })
      }
    }
    if (data.componentRings?.length) {
      rows.push({
        label: ex('mergeRingCount', locale),
        value: String(data.componentRings.length),
      })
    }
    return {
      heading: `${i + 1}. ${formatHistoryTitle(r, locale) || ex('mergeUnnamed', locale)}`,
      rows,
    }
  })

  await exportToolReportPdf({
    title: ex('mergeTitle', locale),
    subtitle: ex('mergeSubtitle', locale, { n: records.length, date: dateStamp() }),
    sections,
    filename,
    meta: { locale },
  })
}

export async function exportResultPdf(element, filename, meta = {}) {
  const locale = meta.locale ?? 'zh'
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()

  pdf.setFontSize(10)
  pdf.text(ex('reportTitle', locale), 14, 12)
  pdf.setFontSize(8)
  pdf.text(`${ex('date', locale)}: ${dateStamp()}`, 14, 18)
  if (meta.title) pdf.text(`${ex('project', locale)}: ${meta.title}`, 14, 23)

  const topMargin = 28
  const imgH = ((canvas.height * (pageW - 28)) / canvas.width)
  let y = topMargin
  let remaining = imgH
  const contentW = pageW - 28

  while (remaining > 0) {
    pdf.addImage(img, 'PNG', 14, y, contentW, imgH)
    remaining -= pageH - topMargin
    if (remaining > 0) {
      pdf.addPage()
      y = topMargin - (imgH - remaining)
    }
  }

  const pages = pdf.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(ex('footer', locale, { date: dateStamp(), page: i, pages }), pageW / 2, pageH - 8, {
      align: 'center',
    })
  }

  pdf.save(filename ?? `尺寸链分析_${dateStamp()}.pdf`)
}

export async function exportResultPng(element, filename, locale = 'zh') {
  const { default: html2canvas } = await import('html2canvas')
  const src = await html2canvas(element, { scale: 2, useCORS: true })
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = 1920
  exportCanvas.height = 1080
  const ctx = exportCanvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 1920, 1080)
  const scale = Math.min(1920 / src.width, 1080 / src.height)
  const dw = src.width * scale
  const dh = src.height * scale
  ctx.drawImage(src, (1920 - dw) / 2, (1080 - dh) / 2, dw, dh)
  const link = document.createElement('a')
  link.download = filename ?? `尺寸链分析_${dateStamp()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

export function exportCanvasPng(canvas, filename) {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = 1920
  exportCanvas.height = 1080
  const ctx = exportCanvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 1920, 1080)
  const scale = Math.min(1920 / canvas.width, 1080 / canvas.height)
  const dw = canvas.width * scale
  const dh = canvas.height * scale
  ctx.drawImage(canvas, (1920 - dw) / 2, (1080 - dh) / 2, dw, dh)
  const link = document.createElement('a')
  link.download = filename ?? `尺寸链矢量图_${dateStamp()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

export function exportExcel(payload, filename, locale = 'zh') {
  const wb = XLSX.utils.book_new()

  const summary = [
    [ex('excelTitle', locale)],
    [ex('date', locale), dateStamp()],
    [ex('analysisType', locale), payload.typeName ?? ''],
    [ex('closedRing', locale), payload.closedRing?.name ?? ''],
    [
      ex('targetRange', locale),
      `${payload.closedRing?.min} ~ ${payload.closedRing?.max} ${payload.unit}`,
    ],
    [],
    [
      ex('componentRing', locale),
      ex('colSize', locale),
      ex('colTolerance', locale),
      ex('colFactor', locale),
      ex('colType', locale),
    ],
    ...payload.componentRings.map((r) => [
      r.name,
      r.size,
      r.tolerance,
      r.factor,
      ringTypeLabel(r.type, locale),
    ]),
    [],
    [
      ex('colMethod', locale),
      ex('colTotalTol', locale),
      ex('colUpper', locale),
      ex('colLower', locale),
      ex('colPass', locale),
    ],
    ...payload.results.map((r) => [
      r.method,
      r.tolerance,
      r.upper,
      r.lower,
      r.pass ? ex('pass', locale) : ex('fail', locale),
    ]),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), ex('sheetName', locale))
  XLSX.writeFile(wb, filename ?? `尺寸链分析_${dateStamp()}.xlsx`)
}

export async function copyResultText(text) {
  await navigator.clipboard.writeText(text)
}

export function buildResultText(payload, locale = 'zh') {
  const lines = [
    ex('resultHeader', locale),
    `${ex('typeLabel', locale)}: ${payload.typeName ?? '-'}`,
    `${ex('closedRing', locale)}: ${payload.closedRing?.name} (${payload.closedRing?.min} ~ ${payload.closedRing?.max} ${payload.unit})`,
    '',
    `${ex('ringsHeader', locale)}:`,
    ...payload.componentRings.map(
      (r, i) =>
        `  ${i + 1}. ${r.name}  ${r.size}±${r.tolerance}  ${ringTypeLabel(r.type, locale)}`,
    ),
    '',
    `${ex('methodLabel', locale)}: ${payload.methodLabel}`,
    ...payload.formulaLines,
    '',
    `${ex('resultsCompare', locale)}:`,
    ...payload.results.map(
      (r) => `  ${r.method}: T=${r.tolerance}, [${r.lower}, ${r.upper}] ${r.pass ? '✓' : '✗'}`,
    ),
  ]
  return lines.join('\n')
}
