<template>
  <svg
    viewBox="0 0 320 200"
    class="w-full max-w-md text-gray-700 dark:text-gray-300"
    role="img"
    aria-label="轴孔配合示意图"
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
    <text :x="160 + (shaftR + holeR) / 2" y="88" text-anchor="middle" font-size="11" fill="#e6a23c">
      {{ gapLabel }}
    </text>

    <!-- 尺寸标注 -->
    <text x="160" y="175" text-anchor="middle" font-size="11">
      孔 {{ holeCode }}: Ø{{ holeMid.toFixed(3) }} (+{{ holeUpper }}/{{ holeLower }})
    </text>
    <text x="160" y="190" text-anchor="middle" font-size="11">
      轴 {{ shaftCode }}: Ø{{ shaftMid.toFixed(3) }} (+{{ shaftUpper }}/{{ shaftLower }})
    </text>

    <defs>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
      </marker>
    </defs>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

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

const gapLabel = computed(() => {
  const c = props.fit.maxClearance
  if (props.fit.fitType === 'interference') return `过盈 ${Math.abs(props.fit.minClearance * 1000).toFixed(0)}~${Math.abs(props.fit.maxClearance * 1000).toFixed(0)} μm`
  if (props.fit.fitType === 'transition') return '过渡'
  return `${(c * 1000).toFixed(0)} μm`
})
</script>
