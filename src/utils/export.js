import * as XLSX from 'xlsx'

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

export async function exportResultPdf(element, filename) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgH = (canvas.height * pageW) / canvas.width
  let y = 0
  let remaining = imgH

  while (remaining > 0) {
    pdf.addImage(img, 'PNG', 0, y, pageW, imgH)
    remaining -= pageH
    if (remaining > 0) {
      pdf.addPage()
      y -= pageH
    }
  }
  pdf.save(filename ?? `尺寸链分析_${dateStamp()}.pdf`)
}

export async function exportResultPng(element, filename) {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const link = document.createElement('a')
  link.download = filename ?? `尺寸链矢量图_${dateStamp()}.png`
  link.href = canvas.toDataURL('image/png')
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
