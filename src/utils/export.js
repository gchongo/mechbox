import * as XLSX from 'xlsx'
import { t } from '@/i18n'
import { ensureLoggedIn } from '@/utils/auth-guard'
import {
  buildSummaryRows,
  formatHistorySource,
  formatHistoryStatus,
  formatHistoryTitle,
  formatHistoryType,
} from '@/utils/calc-history'
import { getCalcReviewStatus } from '@/utils/calc-result'

const PDF_MARGIN = 14
const PDF_FOOTER_RESERVE = 14
const PDF_BLOCK_GAP_MM = 3
/** A4 可排版宽度 (210mm − 2×14mm margin) @ 96dpi */
const PDF_CONTENT_WIDTH_PX = 688
/** @deprecated use PDF_CONTENT_WIDTH_PX */
const CAPTURE_WIDTH_PX = PDF_CONTENT_WIDTH_PX

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function ex(key, locale = 'zh', params) {
  return t(`calc.pages.editor.export.${key}`, locale, params)
}

function productDisclaimerSection(locale = 'zh') {
  return {
    heading: t('calc.common.disclaimerTitle', locale),
    text: t('product.l1DisclaimerPdf', locale),
  }
}

/** Traceability block prepended to engineering PDF exports */
export function buildExportTraceSection(trace = {}, locale = 'zh') {
  const rows = []
  const toolLabel = trace.toolLabel ?? trace.tool
  if (toolLabel) {
    rows.push({ label: t('calc.common.exportTraceTool', locale), value: String(toolLabel) })
  }
  if (trace.calcMode) {
    rows.push({ label: t('calc.common.exportTraceMode', locale), value: String(trace.calcMode) })
  }
  if (trace.status) {
    rows.push({
      label: t('calc.common.exportTraceStatus', locale),
      value: formatHistoryStatus(trace.status, locale),
    })
  }
  rows.push({
    label: t('calc.common.exportTraceDate', locale),
    value: trace.recordDate ?? dateStamp(),
  })
  if (trace.units) {
    rows.push({ label: t('calc.common.exportTraceUnits', locale), value: String(trace.units) })
  }
  if (Array.isArray(trace.assumptions) && trace.assumptions.length) {
    rows.push({
      label: t('calc.common.exportTraceAssumptions', locale),
      value: trace.assumptions.join(locale === 'en' ? '; ' : '；'),
    })
  }
  if (trace.formulaNote) {
    rows.push({ label: t('calc.common.exportTraceFormula', locale), value: String(trace.formulaNote) })
  }
  return { heading: t('calc.common.exportTraceTitle', locale), rows }
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
  root.style.boxShadow = 'none'
  root.style.maxWidth = `${PDF_CONTENT_WIDTH_PX}px`
  root.style.width = `${PDF_CONTENT_WIDTH_PX}px`
  root.style.boxSizing = 'border-box'
  root.style.padding = '12px 14px'
  root.style.border = '1px solid #e5e7eb'
  root.style.borderRadius = '6px'
  root.style.fontSize = '13px'
  root.style.lineHeight = '1.45'
  root.querySelectorAll('.card-panel').forEach((el) => {
    el.style.padding = '12px 14px'
    el.style.boxShadow = 'none'
    el.style.border = '1px solid #e5e7eb'
    el.style.borderRadius = '6px'
  })
  root.querySelectorAll('h2').forEach((el) => {
    el.style.fontSize = '15px'
    el.style.margin = '0 0 10px'
  })
  root.querySelectorAll('dl > div, .space-y-3 > div').forEach((el) => {
    el.style.padding = '8px 10px'
    el.style.marginBottom = '4px'
  })
  root.querySelectorAll('button, .el-button').forEach((el) => {
    el.style.display = 'none'
  })
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
    width: PDF_CONTENT_WIDTH_PX,
    windowWidth: PDF_CONTENT_WIDTH_PX,
    height: element.scrollHeight,
    onclone: (_doc, cloned) => {
      fixExportCloneStyles(cloned)
    },
  })
}

function pdfShellStyle(widthPx = PDF_CONTENT_WIDTH_PX, paddingPx = 0) {
  return [
    'position: fixed',
    'left: -9999px',
    'top: 0',
    `width: ${widthPx}px`,
    'box-sizing: border-box',
    'font-family: system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
    'color: #111827',
    'background: #ffffff',
    paddingPx ? `padding: ${paddingPx}px` : '',
  ]
    .filter(Boolean)
    .join(';')
}

async function renderHtmlCanvas(html2canvas, html, { widthPx = PDF_CONTENT_WIDTH_PX, paddingPx = 0 } = {}) {
  const div = document.createElement('div')
  div.style.cssText = pdfShellStyle(widthPx, paddingPx)
  div.innerHTML = html
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

async function renderReportHeaderCanvas(html2canvas, { title, subtitle, dateLine, locale = 'zh' }) {
  const html = `
    <div style="border-bottom:3px solid #2563eb;padding-bottom:12px;margin-bottom:4px">
      <div style="font-size:11px;color:#6b7280;letter-spacing:0.04em;margin-bottom:6px">MechBox</div>
      <div style="font-size:20px;font-weight:700;color:#111827;line-height:1.3">${escapeHtml(title)}</div>
      ${subtitle ? `<div style="font-size:12px;color:#4b5563;margin-top:6px">${escapeHtml(subtitle)}</div>` : ''}
      ${dateLine ? `<div style="font-size:11px;color:#9ca3af;margin-top:8px">${escapeHtml(dateLine)}</div>` : ''}
    </div>`
  return renderHtmlCanvas(html2canvas, html, { paddingPx: 4 })
}

async function renderStyledSectionCanvas(html2canvas, section) {
  if (!section) return null
  const parts = []
  if (section.heading) {
    parts.push(
      `<div style="font-size:13px;font-weight:600;color:#1e40af;border-bottom:2px solid #dbeafe;padding-bottom:6px;margin:0 0 10px">${escapeHtml(section.heading)}</div>`,
    )
  }
  if (section.rows?.length) {
    const rows = section.rows
      .map(
        (row) => `<tr>
          <td style="padding:7px 10px;background:#f9fafb;border:1px solid #e5e7eb;width:34%;color:#374151;font-weight:500;vertical-align:top;font-size:10px">${escapeHtml(row.label ?? '')}</td>
          <td style="padding:7px 10px;border:1px solid #e5e7eb;color:#111827;vertical-align:top;font-size:10px;line-height:1.45">${escapeHtml(row.value ?? '')}</td>
        </tr>`,
      )
      .join('')
    parts.push(
      `<table style="width:100%;border-collapse:collapse;margin:0 0 8px;table-layout:fixed">${rows}</table>`,
    )
  }
  if (section.text) {
    parts.push(
      `<div style="font-size:10px;line-height:1.6;color:#374151;white-space:pre-wrap;background:#fafafa;border:1px solid #e5e7eb;border-radius:4px;padding:10px 12px">${escapeHtml(section.text)}</div>`,
    )
  }
  if (!parts.length) return null
  return renderHtmlCanvas(html2canvas, parts.join(''), { paddingPx: 2 })
}

async function renderCaptureHeadingCanvas(html2canvas, heading, locale = 'zh') {
  const label = heading ?? (locale === 'en' ? 'Detailed results' : '计算结果明细')
  return renderStyledSectionCanvas(html2canvas, {
    heading: label,
    text: locale === 'en' ? 'Values below match the on-screen result panel.' : '以下数值与页面结果区一致，便于存档对照。',
  })
}

async function renderTextCanvas(html2canvas, lines, options = {}) {
  const {
    widthPx = PDF_CONTENT_WIDTH_PX,
    fontSize = 12,
    boldFirst = false,
    padding = 8,
  } = options
  const body = lines
    .filter((line) => line != null && line !== '')
    .map((line, index) => {
      const style =
        boldFirst && index === 0
          ? `font-weight:600;font-size:${fontSize + 4}px;margin-bottom:4px`
          : 'margin-bottom:2px'
      return `<div style="${style};font-size:${fontSize}px;line-height:1.45">${escapeHtml(line)}</div>`
    })
    .join('')
  return renderHtmlCanvas(html2canvas, body, { widthPx, paddingPx: padding })
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

/** 按区块排版：每段独立 canvas，避免整页长图在段落中间被截断 */
function addBlocksToPdf(pdf, blocks, { margin = PDF_MARGIN } = {}) {
  const pageH = pdf.internal.pageSize.getHeight()
  const pageW = pdf.internal.pageSize.getWidth()
  const contentW = pageW - margin * 2
  const topY = margin
  const bottomY = pageH - margin - PDF_FOOTER_RESERVE
  const maxBlockH = bottomY - topY
  let cursorY = topY

  for (let i = 0; i < blocks.length; i += 1) {
    const canvas = blocks[i]
    if (!canvas?.width || !canvas?.height) continue
    const imgH = (canvas.height * contentW) / canvas.width
    const img = canvas.toDataURL('image/png')

    if (imgH <= maxBlockH) {
      if (cursorY + imgH > bottomY) {
        pdf.addPage()
        cursorY = topY
      }
      pdf.addImage(img, 'PNG', margin, cursorY, contentW, imgH)
      cursorY += imgH + PDF_BLOCK_GAP_MM
      continue
    }

    if (cursorY > topY + 2) {
      pdf.addPage()
      cursorY = topY
    }
    addCanvasPaginated(pdf, canvas, { margin, startY: cursorY })
    if (i < blocks.length - 1) {
      pdf.addPage()
      cursorY = topY
    }
  }
}

async function buildReportBlockCanvases(html2canvas, {
  title,
  subtitle,
  dateLine,
  sections = [],
  element = null,
  locale = 'zh',
  captureHeading,
} = {}) {
  const blocks = []
  blocks.push(
    await renderReportHeaderCanvas(html2canvas, {
      title,
      subtitle,
      dateLine,
      locale,
    }),
  )
  for (const section of sections) {
    const canvas = await renderStyledSectionCanvas(html2canvas, section)
    if (canvas) blocks.push(canvas)
  }
  if (element) {
    if (captureHeading !== false) {
      blocks.push(await renderCaptureHeadingCanvas(html2canvas, captureHeading, locale))
    }
    blocks.push(await captureElement(element, html2canvas))
  }
  return blocks.filter(Boolean)
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
    const canvas = await renderStyledSectionCanvas(html2canvas, sec)
    if (canvas) blocks.push(canvas)
  }
  return stackCanvases(blocks)
}

export async function exportToolReportPdf({ title, sections = [], element, filename, meta = {} }) {
  const locale = meta.locale ?? 'zh'
  if (!(await ensureLoggedIn(locale))) return false
  const { html2canvas, jsPDF } = await loadPdfLibs()

  const traceSection = meta.trace ? buildExportTraceSection(meta.trace, locale) : null
  const sectionsWithDisclaimer = [
    ...(traceSection ? [traceSection] : []),
    ...sections,
    productDisclaimerSection(locale),
  ]

  const blocks = await buildReportBlockCanvases(html2canvas, {
    title: title ?? ex('defaultReport', locale),
    subtitle: meta.subtitle,
    dateLine: `${ex('date', locale)}: ${dateStamp()}`,
    sections: sectionsWithDisclaimer,
    element,
    locale,
    captureHeading: meta.captureHeading,
  })

  const pdf = new jsPDF('p', 'mm', 'a4')
  addBlocksToPdf(pdf, blocks)
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
    const snapshotStatus = getCalcReviewStatus(data.snapshot ?? data.result)
    const preferred = pickMergedMethodResult(data, snapshotStatus)
    if (preferred) {
      rows.push({
        label: ex('mergeResult', locale),
        value: `${preferred.method ?? '-'} T=${preferred.tolerance ?? '-'} ${formatHistoryStatus(snapshotStatus, locale)}`,
      })
    }
    const summaryRows = buildSummaryRows(r, locale)
    if (summaryRows.length) {
      for (const s of summaryRows) {
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

export function pickMergedMethodResult(data, snapshotStatus = 'draft') {
  const methodResults = Array.isArray(data?.methodResults)
    ? data.methodResults
    : Array.isArray(data?.results)
      ? data.results
      : data?.results && typeof data.results === 'object'
        ? [
            data.results.worst ? { method: 'worst', ...data.results.worst } : null,
            data.results.rss ? { method: 'rss', ...data.results.rss } : null,
            data.results.modifiedRss ? { method: 'modified-rss', ...data.results.modifiedRss } : null,
            data.results.sigma6Rss ? { method: 'sigma6-rss', ...data.results.sigma6Rss } : null,
          ].filter(Boolean)
        : []
  if (!methodResults.length) return null
  const worst = methodResults.find((x) => x.method === 'worst') ?? methodResults[0]
  const methodKey =
    data?.method === 'modifiedRss'
      ? 'modified-rss'
      : data?.method === 'sigma6Rss'
        ? 'sigma6-rss'
        : data?.method
  return methodResults.find((x) => x.method === methodKey) ?? methodResults.find((x) => x.pass) ?? worst
}

export async function exportResultPdf(element, filename, meta = {}) {
  const locale = meta.locale ?? 'zh'
  if (!(await ensureLoggedIn(locale))) return false
  const { html2canvas, jsPDF } = await loadPdfLibs()

  const blocks = await buildReportBlockCanvases(html2canvas, {
    title: ex('reportTitle', locale),
    subtitle: meta.title ? `${ex('project', locale)}: ${meta.title}` : undefined,
    dateLine: `${ex('date', locale)}: ${dateStamp()}`,
    sections: [productDisclaimerSection(locale)],
    element,
    locale,
  })

  const pdf = new jsPDF('p', 'mm', 'a4')
  addBlocksToPdf(pdf, blocks)
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
