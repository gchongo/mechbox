<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ variant === 'chain' ? '链传动示意' : '皮带传动示意' }}</h3>
      <p class="mech-diagram__hint">{{ labelSmall }} / {{ labelLarge }}，中心距 C，包角 θ</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="variant === 'chain' ? '链传动示意图' : '皮带传动示意图'">
      <defs>
        <marker id="drv-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 中心连线 -->
      <line :x1="x1" :y1="cy" :x2="x2" :y2="cy" class="center-line" stroke-dasharray="4 3" />

      <!-- 大轮 -->
      <circle :cx="x2" :cy="cy" :r="r2" class="wheel" />
      <circle :cx="x2" :cy="cy" :r="r2 - 6" fill="none" stroke="#409eff" stroke-width="1" opacity="0.4" />
      <!-- 小轮 -->
      <circle :cx="x1" :cy="cy" :r="r1" class="wheel wheel--driver" />
      <circle :cx="x1" :cy="cy" :r="r1 - 4" fill="none" stroke="#409eff" stroke-width="1" opacity="0.4" />

      <!-- 皮带/链 -->
      <path :d="beltPath" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" />

      <!-- 包角弧 -->
      <path :d="wrapArc" fill="none" stroke="#e6a23c" stroke-width="1.5" />
      <text :x="x1 + r1 + 18" :y="cy - 8" fill="#e6a23c" font-size="12">θ ≈ {{ wrapAngle.toFixed(0) }}°</text>

      <!-- C -->
      <line :x1="x1" :y1="cy + maxR + 24" :x2="x2" :y2="cy + maxR + 24" class="dim-primary" marker-start="url(#drv-arrow)" marker-end="url(#drv-arrow)" />
      <text :x="(x1 + x2) / 2" :y="cy + maxR + 40" class="txt-primary" font-size="13" text-anchor="middle">C = {{ centerDistance }} mm</text>

      <!-- D1 / z1 -->
      <text :x="x1" :y="cy - r1 - 10" class="txt" font-size="12" text-anchor="middle">{{ labelSmall }}</text>
      <text :x="x2" :y="cy - r2 - 10" class="txt" font-size="12" text-anchor="middle">{{ labelLarge }}</text>

      <!-- 旋转 -->
      <path :d="`M ${x1} ${cy - r1 - 22} A 10 10 0 1 1 ${x1 + 14} ${cy - r1 - 18}`" fill="none" stroke="#8b5cf6" stroke-width="1.5" marker-end="url(#drv-arrow)" />
      <text :x="x1 - 20" :y="cy - r1 - 14" fill="#8b5cf6" font-size="11">n</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { calcWrapAngle } from '@/utils/belt-calc'

const props = defineProps({
  variant: { type: String, default: 'belt' },
  driverDiameter: { type: Number, default: 120 },
  drivenDiameter: { type: Number, default: 300 },
  centerDistance: { type: Number, default: 500 },
  driverTeeth: { type: Number, default: 19 },
  drivenTeeth: { type: Number, default: 57 },
  pitch: { type: Number, default: 15.875 },
  wrapAngle: { type: Number, default: 0 },
})

const d1 = computed(() =>
  props.variant === 'chain'
    ? (props.pitch * props.driverTeeth) / Math.PI
    : props.driverDiameter,
)
const d2 = computed(() =>
  props.variant === 'chain'
    ? (props.pitch * props.drivenTeeth) / Math.PI
    : props.drivenDiameter,
)

const scale = computed(() => 55 / Math.max(d2.value / 2, 1))
const r1 = computed(() => (d1.value / 2) * scale.value)
const r2 = computed(() => (d2.value / 2) * scale.value)
const maxR = computed(() => Math.max(r1.value, r2.value))

const cxMid = 240
const gap = computed(() => r1.value + r2.value + 50)
const x1 = computed(() => cxMid - gap.value / 2)
const x2 = computed(() => cxMid + gap.value / 2)
const cy = 130

const wrapAngle = computed(() => {
  if (props.wrapAngle > 0) return props.wrapAngle
  return calcWrapAngle(d1.value, d2.value, props.centerDistance)
})

const labelSmall = computed(() =>
  props.variant === 'chain'
    ? `z₁ = ${props.driverTeeth}`
    : `D₁ = ${props.driverDiameter} mm`,
)
const labelLarge = computed(() =>
  props.variant === 'chain'
    ? `z₂ = ${props.drivenTeeth}`
    : `D₂ = ${props.drivenDiameter} mm`,
)

const beltPath = computed(() => {
  const tang = Math.acos((r2.value - r1.value) / (x2.value - x1.value))
  const tx1 = x1.value + r1.value * Math.sin(tang)
  const ty1 = cy - r1.value * Math.cos(tang)
  const tx2 = x2.value - r2.value * Math.sin(tang)
  const ty2 = cy - r2.value * Math.cos(tang)
  const bx1 = x1.value + r1.value * Math.sin(tang)
  const by1 = cy + r1.value * Math.cos(tang)
  const bx2 = x2.value - r2.value * Math.sin(tang)
  const by2 = cy + r2.value * Math.cos(tang)
  return `M ${tx1} ${ty1} A ${r1.value} ${r1.value} 0 1 1 ${bx1} ${by1} L ${bx2} ${by2} A ${r2.value} ${r2.value} 0 1 1 ${tx2} ${ty2} Z`
})

const wrapArc = computed(() => {
  const r = r1.value + 14
  return `M ${x1.value + r} ${cy} A ${r} ${r} 0 0 0 ${x1.value} ${cy - r}`
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .wheel { fill: rgba(148,163,184,0.2); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .wheel--driver { fill: rgba(64,158,255,0.15); stroke: #409eff; }
.mech-diagram__svg .center-line { stroke: #94a3b8; stroke-width: 1; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
