<template>
  <svg viewBox="0 0 400 180" class="w-full max-w-lg" role="img" :aria-label="dt('toleranceBandAria')">
    <!-- 零线（公称尺寸） -->
    <line x1="40" y1="90" x2="380" y2="90" stroke="currentColor" stroke-width="1" opacity="0.3" />
    <text x="20" y="94" font-size="10" fill="currentColor" opacity="0.6">0</text>

    <!-- 孔公差带 -->
    <rect
      :x="holeX"
      :y="holeY"
      :width="holeW"
      :height="holeH"
      fill="#409eff"
      fill-opacity="0.25"
      stroke="#409eff"
      stroke-width="1.5"
      rx="2"
    />
    <text x="40" y="28" font-size="11" fill="#409eff">{{ dt('holeBand', { code: band.hole.code }) }}</text>
    <text x="40" y="42" font-size="9" fill="#409eff" opacity="0.8">
      {{ band.hole.yMin.toFixed(0) }} ~ {{ band.hole.yMax.toFixed(0) }} μm
    </text>

    <!-- 轴公差带 -->
    <rect
      :x="shaftX"
      :y="shaftY"
      :width="shaftW"
      :height="shaftH"
      fill="#e6a23c"
      fill-opacity="0.25"
      stroke="#e6a23c"
      stroke-width="1.5"
      rx="2"
    />
    <text x="40" y="148" font-size="11" fill="#e6a23c">{{ dt('shaftBand', { code: band.shaft.code }) }}</text>
    <text x="40" y="162" font-size="9" fill="#e6a23c" opacity="0.8">
      {{ band.shaft.yMin.toFixed(0) }} ~ {{ band.shaft.yMax.toFixed(0) }} μm
    </text>

    <!-- 刻度 -->
    <text :x="scaleX(-50)" y="86" font-size="8" text-anchor="middle" opacity="0.5">-50</text>
    <text :x="scaleX(50)" y="86" font-size="8" text-anchor="middle" opacity="0.5">+50</text>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt } = useDiagramI18n('fit')

const props = defineProps({
  band: { type: Object, required: true },
})

const plotLeft = 80
const plotWidth = 280
const μmRange = 120

function scaleX(μm) {
  return plotLeft + ((μm + μmRange / 2) / μmRange) * plotWidth
}

function bandRect(yMin, yMax, baseY, height) {
  const x1 = scaleX(yMin)
  const x2 = scaleX(yMax)
  return {
    x: Math.min(x1, x2),
    width: Math.abs(x2 - x1),
    y: baseY,
    height,
  }
}

const holeRect = computed(() => bandRect(props.band.hole.yMin, props.band.hole.yMax, 48, 28))
const shaftRect = computed(() => bandRect(props.band.shaft.yMin, props.band.shaft.yMax, 108, 28))

const holeX = computed(() => holeRect.value.x)
const holeY = computed(() => holeRect.value.y)
const holeW = computed(() => Math.max(holeRect.value.width, 2))
const holeH = computed(() => holeRect.value.height)

const shaftX = computed(() => shaftRect.value.x)
const shaftY = computed(() => shaftRect.value.y)
const shaftW = computed(() => Math.max(shaftRect.value.width, 2))
const shaftH = computed(() => shaftRect.value.height)
</script>
