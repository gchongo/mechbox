<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <canvas ref="canvasRef" :width="width" :height="canvasHeight" class="mx-auto block max-w-full" />
    <p v-if="showFormula && rings.length" class="mt-2 truncate text-center text-sm text-gray-600 dark:text-gray-400">
      封闭环 = Σ增环 − Σ减环 · 共 {{ rings.length }} 环
      <span v-if="nominalClosed != null" class="font-mono text-primary"> · A₀≈{{ nominalClosed.toFixed(2) }}{{ unit }}</span>
    </p>
    <div v-if="showLegend && rings.length && !gdtMode" class="mt-2 flex flex-wrap justify-center gap-3 text-sm text-gray-600">
      <span class="flex items-center gap-1">
        <span class="inline-block h-3 w-3 rounded-sm bg-[#27ae60]" /> 增环 (+)
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block h-3 w-3 rounded-sm bg-[#e74c3c]" /> 减环 (−)
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block h-3 w-0.5 border border-dashed border-[#9b59b6] bg-[#9b59b6]" style="height:12px" /> 封闭环 A₀
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { unitLabel } from '@/utils/unit'
import { getGdtCalcMode } from '@/utils/size-chain'
import { calcNominalClosed } from '@/utils/ring-tolerance'

const props = defineProps({
  closedRing: { type: Object, required: true },
  componentRings: { type: Array, default: () => [] },
  rssTolerance: { type: Number, default: 0 },
  analysisTypeId: { type: String, default: '' },
  showLegend: { type: Boolean, default: true },
  showFormula: { type: Boolean, default: true },
})

const canvasRef = ref(null)
const width = 760

const rings = computed(() => props.componentRings)
const unit = computed(() => unitLabel(props.closedRing.unit))
const gdtMode = computed(() => getGdtCalcMode(props.analysisTypeId))
const nominalClosed = computed(() =>
  rings.value.length ? calcNominalClosed(rings.value) : null,
)

const canvasHeight = computed(() => {
  const stack = gdtMode.value?.stack
  if (stack === '2d-position') return 280
  if (stack === 'radial') return 260
  if (gdtMode.value) return 240
  return 280
})

function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth = 2) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 7
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - 0.45), y2 - head * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - head * Math.cos(angle + 0.45), y2 - head * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fill()
}

function drawVectorChain(ctx, height, unitStr) {
  const list = rings.value
  const baselineY = height - 72
  const padX = 48
  const slot = (width - padX * 2) / (list.length + 1)

  ctx.strokeStyle = '#bdc3c7'
  ctx.lineWidth = 2
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(padX - 20, baselineY)
  ctx.lineTo(width - padX + 20, baselineY)
  ctx.stroke()

  list.forEach((ring, i) => {
    const cx = padX + slot * (i + 0.5)
    const isInc = ring.type === 'increasing'
    const color = isInc ? '#27ae60' : '#e74c3c'
    const arrowH = 42 + Math.min((ring.size ?? 0) / 3, 24)

    if (isInc) {
      drawArrow(ctx, cx, baselineY, cx, baselineY - arrowH, color, 2.5)
    } else {
      drawArrow(ctx, cx, baselineY - arrowH, cx, baselineY, color, 2.5)
    }

    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    const label = ring.name?.trim() || `A${i + 1}`
    ctx.fillText(`${label}=${ring.size ?? 0}`, cx, baselineY - arrowH - 10)

    ctx.fillStyle = color
    ctx.font = '12px sans-serif'
    ctx.fillText(isInc ? '增环' : '减环', cx, baselineY + 18)
  })

  const closeX = width - padX + 8
  const closeH = 50
  ctx.strokeStyle = '#9b59b6'
  ctx.setLineDash([5, 4])
  drawArrow(ctx, closeX, baselineY, closeX, baselineY - closeH, '#9b59b6', 2)
  ctx.setLineDash([])

  ctx.fillStyle = '#9b59b6'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  const a0 = nominalClosed.value
  const a0Label = props.closedRing.name?.trim() || 'A₀'
  ctx.fillText(`${a0Label}=${a0 != null ? a0.toFixed(2) : '?'}`, closeX, baselineY - closeH - 10)
  ctx.font = '12px sans-serif'
  ctx.fillText('封闭环', closeX, baselineY + 18)

  ctx.fillStyle = '#555'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(
    `目标 ${props.closedRing.min ?? '?'} ~ ${props.closedRing.max ?? '?'} ${unitStr}`,
    padX - 20,
    24,
  )
}

function draw2dPosition(ctx, height, unitStr) {
  const cx = width / 2
  const cy = height / 2 - 20
  const r = 55

  ctx.strokeStyle = '#bdc3c7'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.strokeRect(cx - 90, cy - 70, 180, 140)
  ctx.setLineDash([])

  ctx.strokeStyle = '#3498db'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#2ecc71'
  ctx.setLineDash([3, 3])
  ctx.beginPath()
  ctx.arc(cx + 12, cy - 8, r * 0.35, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  drawArrow(ctx, cx - 70, cy + 80, cx + 70, cy + 80, '#3498db')
  drawArrow(ctx, cx + 100, cy - 50, cx + 100, cy + 50, '#2ecc71')

  ctx.fillStyle = '#555'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('X 向定位', cx, cy + 96)
  ctx.save()
  ctx.translate(cx + 118, cy)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText('Y 向定位', 0, 0)
  ctx.restore()

  ctx.fillStyle = '#e74c3c'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(`位置度公差带 Ø${props.rssTolerance?.toFixed(3) ?? '?'} ${unitStr}`, cx, cy - r - 12)
}

function drawRadial(ctx, height, unitStr) {
  const cx = width / 2
  const cy = height / 2 - 10

  ctx.strokeStyle = '#bdc3c7'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - 120, cy)
  ctx.lineTo(cx + 120, cy)
  ctx.stroke()

  ctx.strokeStyle = '#3498db'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, 40, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#2ecc71'
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.arc(cx + 6, cy + 4, 40, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  drawArrow(ctx, cx, cy, cx + 40, cy, '#e74c3c')
  ctx.fillStyle = '#e74c3c'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(`径向 ${props.rssTolerance?.toFixed(3) ?? '?'} ${unitStr}`, cx + 48, cy + 4)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const height = canvasHeight.value
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const unitStr = unit.value
  const list = rings.value

  if (!list.length) {
    ctx.fillStyle = '#999'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('添加组成环后，这里会显示尺寸链矢量图', width / 2, height / 2 - 8)
    ctx.font = '12px sans-serif'
    ctx.fillText('绿色向上 = 增环，红色向下 = 减环', width / 2, height / 2 + 16)
    return
  }

  if (gdtMode.value?.stack === '2d-position') {
    draw2dPosition(ctx, height, unitStr)
  } else if (gdtMode.value?.stack === 'radial') {
    drawRadial(ctx, height, unitStr)
  } else if (gdtMode.value) {
    drawVectorChain(ctx, height, unitStr)
    ctx.fillStyle = '#7f8c8d'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`模式：${gdtMode.value.label}`, width - 12, 18)
  } else {
    drawVectorChain(ctx, height, unitStr)
  }
}

watch(
  () => [props.closedRing, props.componentRings, props.rssTolerance, props.analysisTypeId],
  draw,
  { deep: true },
)
onMounted(draw)

function getCanvas() {
  return canvasRef.value
}

defineExpose({ getCanvas })
</script>
