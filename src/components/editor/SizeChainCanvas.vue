<template>
  <div class="chain-canvas">
    <header v-if="rings.length" class="chain-canvas__head">
      <svg class="chain-canvas__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 18h4l2-4 3 6 2-4 3 4h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4 6h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 2" />
      </svg>
      <span class="chain-canvas__title">{{ pt('canvas.title') }}</span>
    </header>

    <div class="chain-canvas__body">
      <canvas ref="canvasRef" :width="width" :height="canvasHeight" class="mx-auto block max-w-full" />
    </div>

    <p v-if="showFormula && rings.length" class="chain-canvas__formula">
      {{ pt('canvas.closedFormula') }}
      <MathTex :expr="formulaExpr" />
      <span class="chain-canvas__sep">|</span>
      {{ pt('canvas.ringCount', { n: rings.length }) }}
      <template v-if="nominalClosed != null">
        <span class="chain-canvas__sep">|</span>
        <MathTex :expr="`${closedLabel} \\approx ${nominalClosed.toFixed(2)}\\,\\mathrm{${unitTex}}`" />
      </template>
    </p>

    <div v-if="showLegend && rings.length && !gdtMode" class="chain-canvas__legend">
      <span class="chain-canvas__legend-item">
        <span class="chain-canvas__swatch chain-canvas__swatch--inc" /> {{ pt('canvas.legendInc') }}
      </span>
      <span class="chain-canvas__legend-item">
        <span class="chain-canvas__swatch chain-canvas__swatch--dec" /> {{ pt('canvas.legendDec') }}
      </span>
      <span class="chain-canvas__legend-item">
        <span class="chain-canvas__swatch chain-canvas__swatch--closed" /> {{ pt('canvas.legendClosed') }} <MathTex expr="A_0" />
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { unitLabel } from '@/utils/unit'
import { getGdtCalcMode } from '@/utils/size-chain'
import { calcNominalClosed } from '@/utils/ring-tolerance'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, locale } = useCalcPage('editor')

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
const unitTex = computed(() => (props.closedRing.unit === 'inch' ? 'in' : 'mm'))
const gdtMode = computed(() => getGdtCalcMode(props.analysisTypeId))
const nominalClosed = computed(() =>
  rings.value.length ? calcNominalClosed(rings.value) : null,
)
const closedLabel = computed(() => {
  const name = props.closedRing.name?.trim()
  if (!name) return 'A_0'
  return name.replace(/₀/g, '_0').replace(/0$/, '_0')
})

const formulaExpr = computed(() => pt('canvas.formulaLatex'))

const canvasHeight = computed(() => {
  const stack = gdtMode.value?.stack
  if (stack === '2d-position') return 300
  if (stack === 'radial') return 280
  if (gdtMode.value) return 260
  const n = rings.value.length
  return Math.min(380, Math.max(260, 220 + n * 8))
})

function drawArrow(ctx, x1, y1, x2, y2, color, lineWidth = 2, dashed = false) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth
  if (dashed) ctx.setLineDash([6, 4])
  else ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.setLineDash([])

  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 8
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - 0.45), y2 - head * Math.sin(angle - 0.45))
  ctx.lineTo(x2 - head * Math.cos(angle + 0.45), y2 - head * Math.sin(angle + 0.45))
  ctx.closePath()
  ctx.fill()
}

function drawConnector(ctx, x1, y, x2) {
  ctx.strokeStyle = '#d5dbe1'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.moveTo(x1, y)
  ctx.lineTo(x2, y)
  ctx.stroke()
  ctx.setLineDash([])
}

/** 首尾相接矢量链：各环依次叠加，封闭环回到基准面 */
function drawVectorChain(ctx, height, unitStr) {
  const list = rings.value
  const n = list.length
  const baselineY = height - 52
  const topPad = 40
  const padX = 36
  const totalSlots = n + 1
  const slotW = (width - padX * 2) / totalSlots

  const cumuls = [0]
  list.forEach((ring) => {
    const sign = ring.type === 'increasing' ? 1 : -1
    cumuls.push(cumuls[cumuls.length - 1] + sign * (Number(ring.size) || 0))
  })
  const finalCumul = cumuls[cumuls.length - 1]
  const a0 = nominalClosed.value ?? finalCumul

  let maxAbs = Math.max(Math.abs(a0), 1)
  cumuls.forEach((c) => {
    maxAbs = Math.max(maxAbs, Math.abs(c))
  })
  const availH = baselineY - topPad
  const scale = (availH * 0.82) / maxAbs

  // 绘图区浅底
  ctx.fillStyle = '#fafbfc'
  ctx.fillRect(padX - 28, topPad - 16, width - padX * 2 + 56, baselineY - topPad + 36)

  // 基准面
  ctx.strokeStyle = '#34495e'
  ctx.lineWidth = 2.5
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(padX - 28, baselineY)
  ctx.lineTo(width - padX + 28, baselineY)
  ctx.stroke()

  ctx.fillStyle = '#7f8c8d'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(pt('canvas.datumPlane'), padX - 26, baselineY + 14)

  list.forEach((ring, i) => {
    const cx = padX + slotW * (i + 0.5)
    const yStart = baselineY - cumuls[i] * scale
    const yEnd = baselineY - cumuls[i + 1] * scale
    const isInc = ring.type === 'increasing'
    const color = isInc ? '#27ae60' : '#e74c3c'

    if (i > 0) {
      const prevCx = padX + slotW * (i - 0.5)
      drawConnector(ctx, prevCx, yStart, cx)
    }

    drawArrow(ctx, cx, yStart, cx, yEnd, color, 2.5)

    const label = ring.name?.trim() || `A${i + 1}`
    const tipY = Math.min(yStart, yEnd)
    ctx.fillStyle = '#2c3e50'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${label} = ${ring.size ?? 0}`, cx, tipY - 10)
  })

  // 封闭环：从链末端回到基准面
  const closeCx = padX + slotW * (n + 0.5)
  const yHead = baselineY - finalCumul * scale

  if (n > 0) {
    const lastCx = padX + slotW * (n - 0.5)
    drawConnector(ctx, lastCx, yHead, closeCx)
  }

  drawArrow(ctx, closeCx, yHead, closeCx, baselineY, '#9b59b6', 2.5, true)

  const a0Label = props.closedRing.name?.trim() || 'A₀'
  ctx.fillStyle = '#9b59b6'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  const a0TipY = Math.min(yHead, baselineY)
  ctx.fillText(`${a0Label} = ${a0 != null ? a0.toFixed(2) : '?'}`, closeCx, a0TipY - 10)

  ctx.fillStyle = '#555'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(
    pt('canvas.target', {
      min: props.closedRing.min ?? '?',
      max: props.closedRing.max ?? '?',
      unit: unitStr,
    }),
    width - padX + 24,
    topPad - 4,
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
  ctx.fillText(pt('canvas.posX'), cx, cy + 96)
  ctx.save()
  ctx.translate(cx + 118, cy)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(pt('canvas.posY'), 0, 0)
  ctx.restore()

  ctx.fillStyle = '#e74c3c'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillText(pt('canvas.posTol', { tol: props.rssTolerance?.toFixed(3) ?? '?', unit: unitStr }), cx, cy - r - 12)
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
  ctx.fillText(pt('canvas.radial', { tol: props.rssTolerance?.toFixed(3) ?? '?', unit: unitStr }), cx + 48, cy + 4)
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
    ctx.fillStyle = '#fafbfc'
    ctx.fillRect(40, 40, width - 80, height - 80)
    ctx.fillStyle = '#999'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(pt('canvas.emptyHint1'), width / 2, height / 2 - 8)
    ctx.font = '12px sans-serif'
    ctx.fillText(pt('canvas.emptyHint2'), width / 2, height / 2 + 16)
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
    ctx.fillText(pt('canvas.modeLabel', { label: gdtMode.value.label }), width - 12, 18)
  } else {
    drawVectorChain(ctx, height, unitStr)
  }
}

watch(
  () => [props.closedRing, props.componentRings, props.rssTolerance, props.analysisTypeId, locale.value],
  draw,
  { deep: true },
)
onMounted(draw)

function getCanvas() {
  return canvasRef.value
}

defineExpose({ getCanvas })
</script>

<style scoped>
.chain-canvas {
  @apply overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800;
}

.chain-canvas__head {
  @apply flex items-center gap-2 border-b border-primary/10 bg-primary/5 px-4 py-2.5;
}

.chain-canvas__icon {
  @apply h-5 w-5 shrink-0 text-primary;
}

.chain-canvas__title {
  @apply text-sm font-semibold text-primary;
}

.chain-canvas__body {
  @apply p-3;
}

.chain-canvas__formula {
  @apply border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-600 dark:border-gray-700 dark:text-gray-400;
}

.chain-canvas__sep {
  @apply mx-1.5 text-gray-300;
}

.chain-canvas__legend {
  @apply flex flex-wrap justify-center gap-4 border-t border-gray-100 px-4 py-2 text-xs text-gray-600
    dark:border-gray-700 dark:text-gray-400;
}

.chain-canvas__legend-item {
  @apply inline-flex items-center gap-1.5;
}

.chain-canvas__swatch {
  @apply inline-block h-3 w-3 rounded-sm;
}

.chain-canvas__swatch--inc {
  @apply bg-[#27ae60];
}

.chain-canvas__swatch--dec {
  @apply bg-[#e74c3c];
}

.chain-canvas__swatch--closed {
  @apply h-3 w-0.5 rounded-none border border-dashed border-[#9b59b6] bg-[#9b59b6];
}
</style>
