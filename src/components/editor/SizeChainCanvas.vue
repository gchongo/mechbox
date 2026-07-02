<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
    <canvas ref="canvasRef" :width="width" :height="canvasHeight" class="mx-auto block" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { unitLabel } from '@/utils/unit'
import { getGdtCalcMode } from '@/utils/size-chain'

const props = defineProps({
  closedRing: { type: Object, required: true },
  componentRings: { type: Array, default: () => [] },
  rssTolerance: { type: Number, default: 0 },
  analysisTypeId: { type: String, default: '' },
})

const canvasRef = ref(null)
const width = 800

const gdtMode = computed(() => getGdtCalcMode(props.analysisTypeId))

const canvasHeight = computed(() => {
  const stack = gdtMode.value?.stack
  if (stack === '2d-position') return 280
  if (stack === 'radial') return 260
  if (gdtMode.value) return 240
  return 220
})

function drawArrow(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 8
  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4))
  ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4))
  ctx.closePath()
  ctx.fill()
}

function drawClosedRingBar(ctx, height, unit) {
  const y = height - 28
  ctx.setLineDash([])
  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 3
  drawArrow(ctx, 30, y, width - 30, y, '#e74c3c')

  ctx.fillStyle = '#e74c3c'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  const label = props.closedRing.name || '封闭环 L0'
  const tol = props.rssTolerance ? ` ± ${props.rssTolerance.toFixed(3)}` : ''
  ctx.fillText(
    `${label}  目标 ${props.closedRing.min ?? '?'} ~ ${props.closedRing.max ?? '?'} ${unit}${tol}`,
    width / 2,
    y + 22,
  )

  ctx.strokeStyle = '#e74c3c44'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(30, y)
  ctx.lineTo(width - 30, y)
  ctx.stroke()
}

function draw2dPosition(ctx, height, unit) {
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
  ctx.fillText(`位置度公差带 Ø${props.rssTolerance?.toFixed(3) ?? '?'} ${unit}`, cx, cy - r - 12)
}

function drawRadial(ctx, height, unit) {
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
  ctx.fillText(`径向 ${props.rssTolerance?.toFixed(3) ?? '?'} ${unit}`, cx + 48, cy + 4)
}

function drawLinearBlocks(ctx, height, unit) {
  const rings = props.componentRings
  const blockWidth = Math.min(130, (width - 60) / rings.length - 12)
  let x = 30

  rings.forEach((ring) => {
    const color = ring.type === 'increasing' ? '#3498db' : '#2ecc71'
    const isInc = ring.type === 'increasing'

    ctx.fillStyle = color + '18'
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.fillRect(x, 70, blockWidth, 56)
    ctx.strokeRect(x, 70, blockWidth, 56)

    ctx.fillStyle = '#333'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(ring.name, x + blockWidth / 2, 92)
    ctx.fillText(`${ring.size}±${ring.tolerance} ${unit}`, x + blockWidth / 2, 108)
    ctx.fillStyle = color
    ctx.font = '11px sans-serif'
    ctx.fillText(isInc ? '增环' : '减环', x + blockWidth / 2, 120)
    if (ring.factor != null && ring.factor !== 1) {
      ctx.fillText(`k=${ring.factor}`, x + blockWidth / 2, 132)
    }

    const ax = x + blockWidth / 2
    if (isInc) {
      drawArrow(ctx, ax - 30, 55, ax + 30, 55, color)
    } else {
      drawArrow(ctx, ax + 30, 55, ax - 30, 55, color)
    }

    x += blockWidth + 12
  })
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const height = canvasHeight.value
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const rings = props.componentRings
  const unit = unitLabel(props.closedRing.unit)

  if (!rings.length) {
    ctx.fillStyle = '#999'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('添加组成环后将显示尺寸链示意图', width / 2, height / 2)
    return
  }

  if (gdtMode.value?.stack === '2d-position') {
    draw2dPosition(ctx, height, unit)
  } else if (gdtMode.value?.stack === 'radial') {
    drawRadial(ctx, height, unit)
  } else {
    drawLinearBlocks(ctx, height, unit)
  }

  if (gdtMode.value) {
    ctx.fillStyle = '#7f8c8d'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`模式：${gdtMode.value.label}`, 12, 18)
  }

  drawClosedRingBar(ctx, height, unit)
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
