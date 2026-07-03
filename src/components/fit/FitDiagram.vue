<template>
  <svg
    viewBox="0 0 320 200"
    class="w-full max-w-md text-gray-700 dark:text-gray-300"
    role="img"
    :aria-label="dt('fitAria')"
  >
    <rect x="0" y="0" width="320" height="200" fill="transparent" />

    <!-- 孔 -->
    <circle
      cx="160"
      cy="100"
      :r="holeR"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="text-primary"
    />
    <circle
      cx="160"
      cy="100"
      :r="holeR - 4"
      fill="none"
      stroke="currentColor"
      stroke-width="1"
      stroke-dasharray="4 3"
      opacity="0.5"
    />

    <!-- 轴 -->
    <circle cx="160" cy="100" :r="shaftR" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2" />

    <!-- 间隙标注 -->
    <line
      :x1="160 + shaftR"
      :y1="100"
      :x2="160 + holeR"
      :y2="100"
      stroke="#e6a23c"
      stroke-width="2"
      marker-end="url(#arrow)"
    />
    <SvgMathText :x="160 + (shaftR + holeR) / 2" :y="88" :text="enrichedGapLabel" anchor="middle" color="#e6a23c" :width="100" :font-size="11" />

    <!-- 尺寸标注 -->
    <SvgMathText :x="160" :y="175" :text="enrichedHoleDim" anchor="middle" :width="300" :font-size="11" />
    <SvgMathText :x="160" :y="190" :text="enrichedShaftDim" anchor="middle" :width="300" :font-size="11" />

    <defs>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
      </marker>
    </defs>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'
import { enrichMathText } from '@/utils/math-label'

const { dt, locale } = useDiagramI18n('fit')

const props = defineProps({
  fit: { type: Object, required: true },
})

const scale = 80

const holeMid = computed(() => (props.fit.hole.minSize + props.fit.hole.maxSize) / 2)
const shaftMid = computed(() => (props.fit.shaft.minSize + props.fit.shaft.maxSize) / 2)
const holeR = computed(() => (holeMid.value / props.fit.nominal) * scale * 0.5)
const shaftR = computed(() => (shaftMid.value / props.fit.nominal) * scale * 0.5)

const holeCode = computed(() => props.fit.hole.designation)
const shaftCode = computed(() => props.fit.shaft.designation)
const holeUpper = computed(() => (props.fit.hole.upperDeviation * 1000).toFixed(0))
const holeLower = computed(() => (props.fit.hole.lowerDeviation * 1000).toFixed(0))
const shaftUpper = computed(() => (props.fit.shaft.upperDeviation * 1000).toFixed(0))
const shaftLower = computed(() => (props.fit.shaft.lowerDeviation * 1000).toFixed(0))

const holeDimText = computed(() => {
  locale.value
  return dt('holeDim', {
    code: holeCode.value,
    mid: holeMid.value.toFixed(3),
    upper: holeUpper.value,
    lower: holeLower.value,
  })
})

const shaftDimText = computed(() => {
  locale.value
  return dt('shaftDim', {
    code: shaftCode.value,
    mid: shaftMid.value.toFixed(3),
    upper: shaftUpper.value,
    lower: shaftLower.value,
  })
})

const gapLabel = computed(() => {
  locale.value
  const c = props.fit.maxClearance
  if (props.fit.fitType === 'interference') {
    return dt('fitInterference', {
      min: Math.abs(props.fit.minClearance * 1000).toFixed(0),
      max: Math.abs(c * 1000).toFixed(0),
    })
  }
  if (props.fit.fitType === 'transition') return dt('fitTransition')
  return `${(c * 1000).toFixed(0)} μm`
})

const enrichedGapLabel = computed(() => enrichMathText(gapLabel.value))
const enrichedHoleDim = computed(() => enrichMathText(holeDimText.value))
const enrichedShaftDim = computed(() => enrichMathText(shaftDimText.value))
</script>
