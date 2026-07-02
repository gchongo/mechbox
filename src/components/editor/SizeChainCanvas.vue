<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
    <canvas ref="canvasRef" :width="width" :height="height" class="mx-auto block" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { unitLabel } from '@/utils/unit'

const props = defineProps({
  closedRing: { type: Object, required: true },
  componentRings: { type: Array, default: () => [] },
  rssTolerance: { type: Number, default: 0 },
})

const canvasRef = ref(null)
const width = 800
const height = 220

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

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
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

    const ax = x + blockWidth / 2
    if (isInc) {
      drawArrow(ctx, ax - 30, 55, ax + 30, 55, color)
    } else {
      drawArrow(ctx, ax + 30, 55, ax - 30, 55, color)
    }

    x += blockWidth + 12
  })

  drawArrow(ctx, 30, 175, width - 30, 175, '#e74c3c')

  ctx.fillStyle = '#e74c3c'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  const label = props.closedRing.name || '封闭环 L0'
  const tol = props.rssTolerance ? ` ± ${props.rssTolerance.toFixed(3)}` : ''
  ctx.fillText(
    `${label}  目标 ${props.closedRing.min ?? '?'} ~ ${props.closedRing.max ?? '?'} ${unit}${tol}`,
    width / 2,
    200,
  )
}

watch(
  () => [props.closedRing, props.componentRings, props.rssTolerance],
  draw,
  { deep: true },
)
onMounted(draw)

function getCanvas() {
  return canvasRef.value
}

defineExpose({ getCanvas })
</script>
