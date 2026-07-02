<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
    <canvas ref="canvasRef" :width="width" :height="height" class="mx-auto block" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  closedRing: { type: Object, required: true },
  componentRings: { type: Array, default: () => [] },
})

const canvasRef = ref(null)
const width = 800
const height = 200

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const rings = props.componentRings
  if (!rings.length) {
    ctx.fillStyle = '#999'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('添加组成环后将显示尺寸链示意图', width / 2, height / 2)
    return
  }

  const blockWidth = Math.min(120, (width - 40) / rings.length - 10)
  let x = 20

  rings.forEach((ring) => {
    const color = ring.type === 'increasing' ? '#3498db' : '#2ecc71'
    ctx.fillStyle = color + '20'
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.fillRect(x, 60, blockWidth, 60)
    ctx.strokeRect(x, 60, blockWidth, 60)

    ctx.fillStyle = '#333'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(ring.name, x + blockWidth / 2, 90)
    ctx.fillText(`${ring.size}±${ring.tolerance}`, x + blockWidth / 2, 105)

    ctx.beginPath()
    ctx.moveTo(x + blockWidth / 2, 50)
    ctx.lineTo(x + blockWidth / 2, 40)
    ctx.strokeStyle = color
    ctx.stroke()

    x += blockWidth + 10
  })

  ctx.strokeStyle = '#e74c3c'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(20, 160)
  ctx.lineTo(width - 20, 160)
  ctx.stroke()

  ctx.fillStyle = '#e74c3c'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  const label = props.closedRing.name || '封闭环 L0'
  ctx.fillText(
    `${label} = ${props.closedRing.min ?? '?'} ~ ${props.closedRing.max ?? '?'}`,
    width / 2,
    180,
  )
}

watch(() => [props.closedRing, props.componentRings], draw, { deep: true })
onMounted(draw)
</script>
