import * as XLSX from 'xlsx'
import { t } from '@/i18n'
import { ensureLoggedIn } from '@/utils/auth-guard'
import {
  formatHistorySource,
  formatHistoryStatus,
  formatHistoryTitle,
  formatHistoryType,
} from '@/utils/calc-history'

const PDF_MARGIN = 14
const PDF_FOOTER_RESERVE = 14
/** ~A4 content width at 96dpi */
const CAPTURE_WIDTH_PX = 794

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function ex(key, locale = 'zh', params) {
  return t(`calc.pages.editor.export.${key}`, locale, params)
}

function ringTypeLabel(type, locale = 'zh') {
  return type === 'increasing' ? ex('ringInc', locale) : ex('ringDec', locale)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function loadPdfLibs() {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  return { html2canvas, jsPDF }
}

function fixExportCloneStyles(root) {
  if (!root) return
  root.style.background = '#ffffff'
  root.querySelectorAll('.design-pass-badge--ok').forEach((el) => {
    el.style.display = 'inline-block'
    el.style.overflow = 'visible'
    el.style.lineHeight = '1.5'
    el.style.padding = '4px 10px'
    el.style.color = '#529b2e'
    el.style.backgroundColor = '#f0f9eb'
    el.style.border = '1px solid #b3e19d'
    el.style.borderRadius = '4px'
  })
  root.querySelectorAll('.design-pass-badge--fail').forEach((el) => {
    el.style.display = 'inline-block'
    el.style.overflow = 'visible'
    el.style.lineHeight = '1.5'
    el.style.padding = '4px 10px'
    el.style.color = '#c45656'
    el.style.backgroundColor = '#fef0f0'
    el.style.border = '1px solid #fab6b6'
    el.style.borderRadius = '4px'
  })
  root.querySelectorAll('.el-tag').forEach((tag) => {
    tag.style.display = 'inline-block'
    tag.style.overflow = 'visible'
    tag.style.lineHeight = '1.5'
    tag.style.padding = '2px 8px'
    tag.style.borderRadius = '4px'
    tag.style.border = '1px solid transparent'
    if (tag.classList.contains('el-tag--success')) {
      tag.style.color = '#529b2e'
      tag.style.backgroundColor = '#f0f9eb'
      tag.style.borderColor = '#b3e19d'
    } else if (tag.classList.contains('el-tag--danger')) {
      tag.style.color = '#c45656'
      tag.style.backgroundColor = '#fef0f0'
      tag.style.borderColor = '#fab6b6'
    }
  })
}

async function captureElement(element, html2canvas) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    height: element.scrollHeight,
    width: element.scrollWidth || element.offsetWidth,
    onclone: (_doc, cloned) => {
      fixExportCloneStyles(cloned)
    },
  })
}

async function renderTextCanvas(html2canvas, lines, options = {}) {
  const {
    widthPx = CAPTURE_WIDTH_PX,
    fontSize = 12,
    boldFirst = false,
    padding = 8,
  } = options
  const div = document.createElement('div')
  div.style.cssText = [
    'position: fixed',
    'left: -9999px',
    'top: 0',
    `width: ${widthPx}px`,
    'box-sizing: border-box',
    'font-family: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    `font-size: ${fontSize}px`,
    'line-height: 1.45',
    'color: #111827',
    'background: #ffffff',
    `padding: ${padding}px`,
  ].join(';')

  div.innerHTML = lines
    .filter((line) => line != null && line !== '')
    .map((line, index) => {
      const style =
        boldFirst && index === 0
          ? `font-weight:600;font-size:${fontSize + 4}px;margin-bottom:4px`
          : 'margin-bottom:2px'
      return `<div style="${style}">${escapeHtml(line)}</div>`
    })
    .join('')

  document.body.appendChild(div)
  try {
    return await html2canvas(div, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: widthPx,
      height: div.scrollHeight,
    })
  } finally {
    document.body.removeChild(div)
  }
}

function stackCanvases(canvases, gapPx = 12) {
  if (!canvases.length) {
    const empty = document.createElement('canvas')
    empty.width = 1
    empty.height = 1
    return empty
  }
  const width = Math.max(...canvases.map((canvas) => canvas.width))
  const height = canvases.reduce(
    (sum, canvas, index) => sum + canvas.height + (index > 0 ? gapPx : 0),
    0,
  )
  const out = document.createElement('canvas')
  out.width = width
  out.height = height
  const ctx = out.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  let y = 0
  for (const canvas of canvases) {
    ctx.drawImage(canvas, 0, y)
    y += canvas.height + gapPx
  }
  return out
}

function addCanvasPaginated(pdf, canvas, { margin = PDF_MARGIN, startY = PDF_MARGIN } = {}) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const contentW = pageW - margin * 2
  const imgH = (canvas.height * contentW) / canvas.width
  const img = canvas.toDataURL('image/png')
  const bottomReserve = PDF_FOOTER_RESERVE

  let heightLeft = imgH
  let position = startY

  pdf.addImage(img, 'PNG', margin, position, contentW, imgH)
  heightLeft -= pageH - startY - bottomReserve

  while (heightLeft > 0) {
    position = heightLeft - imgH + margin
    pdf.addPage()
    pdf.addImage(img, 'PNG', margin, position, contentW, imgH)
    heightLeft -= pageH - margin - bottomReserve
  }
}

async function addFootersToPdf(pdf, html2canvas, locale) {
  const pages = pdf.getNumberOfPages()
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = PDF_MARGIN

  for (let page = 1; page <= pages; page += 1) {
    const footerText = ex('footer', locale, { date: dateStamp(), page, pages })
    const footerCanvas = await renderTextCanvas(html2canvas, [footerText], {
      fontSize: 9,
      padding: 2,
    })
    const footerW = pageW - margin * 2
    const footerH = (footerCanvas.height * footerW) / footerCanvas.width
    pdf.setPage(page)
    pdf.addImage(
      footerCanvas.toDataURL('image/png'),
      'PNG',
      margin,
      pageH - margin - footerH,
      footerW,
      footerH,
    )
  }
}

async function renderSectionsCanvas(html2canvas, sections) {
  const blocks = []
  for (const sec of sections) {
    const lines = []
    if (sec.heading) lines.push(sec.heading)
    for (const row of sec.rows ?? []) {
      lines.push(`${row.label ?? ''}: ${row.value ?? ''}`)
    }
    if (sec.text) {
      lines.push(...String(sec.text).split('\n').filter(Boolean))
    }
    if (lines.length) {
      blocks.push(
        await renderTextCanvas(html2canvas, lines, {
          boldFirst: Boolean(sec.heading),
          fontSize: 10,
        }),
      )
    }
  }
  return stackCanvases(blocks)
}

export async function exportToolReportPdf({ title, sections = [], element, filename, meta = {} }) {
  const locale = meta.locale ?? 'zh'
  if (!(await ensureLoggedIn(locale))) return false
  const { html2canvas, jsPDF } = await loadPdfLibs()

  const headerLines = [`${title ?? ex('defaultReport', locale)}`, `${ex('date', locale)}: ${dateStamp()}`]
  if (meta.subtitle) headerLines.push(meta.subtitle)

  const canvases = [await renderTextCanvas(html2canvas, headerLines, { boldFirst: true, fontSize: 11 })]

  if (sections.length) {
    canvases.push(await renderSectionsCanvas(html2canvas, sections))
  }
  if (element) {
    canvases.push(await captureElement(element, html2canvas))
  }

  const pdf = new jsPDF('p', 'mm', 'a4')
  addCanvasPaginated(pdf, stackCanvases(canvases))
  await addFootersToPdf(pdf, html2canvas, locale)
  pdf.save(filename ?? `MechBox报告_${dateStamp()}.pdf`)
  return true
}

/** 从历史记录合并导出 PDF */
export async function exportMergedHistoryPdf(records, filename, locale = 'zh') {
  if (!(await ensureLoggedIn(locale))) return false
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

  return exportToolReportPdf({
    title: ex('mergeTitle', locale),
    subtitle: ex('mergeSubtitle', locale, { n: records.length, date: dateStamp() }),
    sections,
    filename,
    meta: { locale },
  })
}

export async function exportResultPdf(element, filename, meta = {}) {
  const locale = meta.locale ?? 'zh'
  if (!(await ensureLoggedIn(locale))) return false
  const { html2canvas, jsPDF } = await loadPdfLibs()

  const headerLines = [
    ex('reportTitle', locale),
    `${ex('date', locale)}: ${dateStamp()}`,
  ]
  if (meta.title) headerLines.push(`${ex('project', locale)}: ${meta.title}`)

  const headerCanvas = await renderTextCanvas(html2canvas, headerLines, {
    boldFirst: true,
    fontSize: 11,
  })
  const bodyCanvas = await captureElement(element, html2canvas)
  const combined = stackCanvases([headerCanvas, bodyCanvas])

  const pdf = new jsPDF('p', 'mm', 'a4')
  addCanvasPaginated(pdf, combined)
  await addFootersToPdf(pdf, html2canvas, locale)
  pdf.save(filename ?? `尺寸链分析_${dateStamp()}.pdf`)
  return true
}

export async function exportResultPng(element, filename, locale = 'zh') {
  const { default: html2canvas } = await import('html2canvas')
  const src = await captureElement(element, html2canvas)
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

export async function exportExcel(payload, filename, locale = 'zh') {
  if (!(await ensureLoggedIn(locale))) return false
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
  return true
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
