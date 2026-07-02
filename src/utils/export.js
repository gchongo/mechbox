import * as XLSX from 'xlsx'

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

export async function exportResultPdf(element, filename, meta = {}) {
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
  pdf.text('MechBox 尺寸链分析报告', 14, 12)
  pdf.setFontSize(8)
  pdf.text(`日期: ${dateStamp()}`, 14, 18)
  if (meta.title) pdf.text(`项目: ${meta.title}`, 14, 23)

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
    pdf.text(`MechBox · ${dateStamp()} · 第 ${i}/${pages} 页`, pageW / 2, pageH - 8, {
      align: 'center',
    })
  }

  pdf.save(filename ?? `尺寸链分析_${dateStamp()}.pdf`)
}

export async function exportResultPng(element, filename, width = 1920, height = 1080) {
  const { default: html2canvas } = await import('html2canvas')
  const src = await html2canvas(element, { scale: 2, useCORS: true })
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = width
  exportCanvas.height = height
  const ctx = exportCanvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  const scale = Math.min(width / src.width, height / src.height)
  const dw = src.width * scale
  const dh = src.height * scale
  ctx.drawImage(src, (width - dw) / 2, (height - dh) / 2, dw, dh)
  const link = document.createElement('a')
  link.download = filename ?? `尺寸链分析_${dateStamp()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

export function exportCanvasPng(canvas, filename, width = 1920, height = 1080) {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = width
  exportCanvas.height = height
  const ctx = exportCanvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  const scale = Math.min(width / canvas.width, height / canvas.height)
  const dw = canvas.width * scale
  const dh = canvas.height * scale
  ctx.drawImage(canvas, (width - dw) / 2, (height - dh) / 2, dw, dh)
  const link = document.createElement('a')
  link.download = filename ?? `尺寸链矢量图_${dateStamp()}.png`
  link.href = exportCanvas.toDataURL('image/png')
  link.click()
}

export function exportExcel(payload, filename) {
  const wb = XLSX.utils.book_new()

  const summary = [
    ['MechBox 尺寸链分析报告'],
    ['日期', dateStamp()],
    ['分析类型', payload.typeName ?? ''],
    ['封闭环', payload.closedRing?.name ?? ''],
    ['目标范围', `${payload.closedRing?.min} ~ ${payload.closedRing?.max} ${payload.unit}`],
    [],
    ['组成环', '尺寸', '公差', '传递系数', '类型'],
    ...payload.componentRings.map((r) => [
      r.name,
      r.size,
      r.tolerance,
      r.factor,
      r.type === 'increasing' ? '增环' : '减环',
    ]),
    [],
    ['方法', '总公差', '上限', '下限', '合格'],
    ...payload.results.map((r) => [r.method, r.tolerance, r.upper, r.lower, r.pass ? '合格' : '不合格']),
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), '分析结果')
  XLSX.writeFile(wb, filename ?? `尺寸链分析_${dateStamp()}.xlsx`)
}

export async function copyResultText(text) {
  await navigator.clipboard.writeText(text)
}

export function buildResultText(payload) {
  const lines = [
    '=== MechBox 尺寸链分析结果 ===',
    `类型: ${payload.typeName ?? '-'}`,
    `封闭环: ${payload.closedRing?.name} (${payload.closedRing?.min} ~ ${payload.closedRing?.max} ${payload.unit})`,
    '',
    '组成环:',
    ...payload.componentRings.map(
      (r, i) =>
        `  ${i + 1}. ${r.name}  ${r.size}±${r.tolerance}  ${r.type === 'increasing' ? '增环' : '减环'}`,
    ),
    '',
    `计算方法: ${payload.methodLabel}`,
    ...payload.formulaLines,
    '',
    '结果对比:',
    ...payload.results.map(
      (r) => `  ${r.method}: T=${r.tolerance}, [${r.lower}, ${r.upper}] ${r.pass ? '✓' : '✗'}`,
    ),
  ]
  return lines.join('\n')
}
