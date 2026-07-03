import * as XLSX from 'xlsx'

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

export async function exportToolReportPdf({ title, sections = [], element, filename, meta = {} }) {
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
  pdf.text(title ?? 'MechBox 计算报告', margin, y)
  y += 8
  pdf.setFontSize(8)
  pdf.text(`日期: ${dateStamp()}`, margin, y)
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
    pdf.text(`MechBox · ${dateStamp()} · 第 ${i}/${pages} 页`, pageW / 2, pageH - 8, {
      align: 'center',
    })
  }

  pdf.save(filename ?? `MechBox报告_${dateStamp()}.pdf`)
}

/** 从历史记录合并导出 PDF */
export async function exportMergedHistoryPdf(records, filename) {
  const sections = records.map((r, i) => {
    const data = r.data ?? {}
    const rows = [
      { label: '状态', value: r.status === 'pass' ? '合格' : r.status === 'fail' ? '不合格' : '草稿' },
      { label: '来源', value: r.source === 'tool' ? (r.data?.toolLabel ?? '工具') : '尺寸链' },
      { label: '日期', value: new Date(r.date).toLocaleString('zh-CN') },
      { label: '分析类型', value: data.selectedType?.name ?? data.typeName ?? '-' },
      { label: '计算方法', value: data.method ?? data.methodLabel ?? '-' },
    ]
    if (data.closedRing) {
      rows.push({
        label: '封闭环',
        value: `${data.closedRing.name ?? '-'} [${data.closedRing.min} ~ ${data.closedRing.max}]`,
      })
    }
    if (data.results?.length) {
      const best = data.results.find((x) => x.pass) ?? data.results[0]
      rows.push({
        label: '结果',
        value: `${best.method ?? '-'} T=${best.tolerance ?? '-'} ${best.pass ? '合格' : '不合格'}`,
      })
    }
    if (data.summary?.length) {
      for (const s of data.summary) {
        rows.push({ label: s.label, value: String(s.value ?? '') })
      }
    }
    if (data.componentRings?.length) {
      rows.push({ label: '组成环数', value: String(data.componentRings.length) })
    }
    return {
      heading: `${i + 1}. ${r.title ?? '未命名'}`,
      rows,
    }
  })

  await exportToolReportPdf({
    title: 'MechBox 历史记录合并报告',
    subtitle: `共 ${records.length} 条记录 · ${dateStamp()}`,
    sections,
    filename: filename ?? `MechBox历史合并_${dateStamp()}.pdf`,
  })
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
