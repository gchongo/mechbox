<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint', { limit: enduranceLimit }))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="ft-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>

      <!-- 坐标轴 -->
      <line :x1="X0" :y1="Y1" :x2="X1" :y2="Y1" class="axis" marker-end="url(#ft-arrow)" />
      <line :x1="X0" :y1="Y1" :x2="X0" :y2="Y0" class="axis" marker-end="url(#ft-arrow)" />
      <SvgMathText :x="X1 - 8" :y="Y1 + 16" text="N (log)" class-name="txt-muted" color="#94a3b8" :width="64" :font-size="12" />
      <SvgMathText :x="28" :y="Y0 + 8" text="S" class-name="txt-muted" color="#94a3b8" :width="16" :font-size="12" />

      <!-- S-N 曲线（Basquin + 水平疲劳极限段） -->
      <polyline :points="snPoints" fill="none" stroke="#409eff" stroke-width="2" />

      <!-- 疲劳极限水平线（cycleLimit 以右） -->
      <line
        :x1="kneeX"
        :y1="enduranceY"
        :x2="X1"
        :y2="enduranceY"
        stroke="#e6a23c"
        stroke-width="1.5"
        stroke-dasharray="6 4"
      />
      <SvgMathText :x="X1 + 2" :y="enduranceY + 4" text="σ₋₁" color="#e6a23c" :width="32" />

      <!-- 工作点（应力幅 Sa 与寿命 N 的交点，落在 S-N 曲线上） -->
      <template v-if="showOperatingPoint">
        <circle :cx="opX" :cy="opY" r="6" class="stress-point" />
        <line :x1="X0" :y1="opY" :x2="opX" :y2="opY" class="dim" stroke-dasharray="3 3" />
        <line :x1="opX" :y1="opY" :x2="opX" :y2="Y1" class="dim" stroke-dasharray="3 3" />
        <SvgMathText :x="X0 + 8" :y="opY + 4" text="S_a" color="#409eff" :font-size="12" :width="24" />
        <text :x="X0 + 8" :y="opY + 16" class="txt-sub" font-size="10">{{ stressAmplitude }} MPa</text>
        <SvgMathText :x="opX - 12" :y="Y1 + 14" text="N" anchor="middle" class-name="txt-sub" color="#64748b" :width="16" :font-size="10" />
      </template>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('fatigue')

const X0 = 70
const X1 = 430
const Y0 = 40
const Y1 = 210
const N_MIN = 1e2
const N_MAX = 1e8

const props = defineProps({
  stressAmplitude: { type: Number, default: 300 },
  enduranceLimit: { type: Number, default: 200 },
  life: { type: Number, default: null },
  sf: { type: Number, default: 900 },
  b: { type: Number, default: -0.085 },
  cycleLimit: { type: Number, default: 1e6 },
  /** 材料峰值应力上限，用于固定纵轴刻度 */
  stressMax: { type: Number, default: null },
})

function nToX(N) {
  const lo = Math.log10(N_MIN)
  const hi = Math.log10(N_MAX)
  const logN = Math.log10(Math.min(Math.max(N, N_MIN), N_MAX))
  return X0 + ((logN - lo) / (hi - lo)) * (X1 - X0)
}

function stressAtN(N) {
  if (N >= props.cycleLimit) return props.enduranceLimit
  return Math.max(props.sf * N ** props.b, props.enduranceLimit)
}

const opN = computed(() => {
  if (props.stressAmplitude <= props.enduranceLimit) return props.cycleLimit
  if (props.life != null && props.life !== Infinity && props.life > 0) return props.life
  return null
})

const sMax = computed(() => {
  const peak = props.sf * N_MIN ** props.b
  const cap = props.stressMax ?? peak * 1.15
  const atLife = opN.value != null && props.stressAmplitude > props.enduranceLimit
    ? stressAtN(opN.value)
    : 0
  return Math.max(peak * 1.05, cap, atLife * 1.05, props.stressAmplitude * 1.02, props.enduranceLimit * 1.15, 1)
})

function sToY(S) {
  return Y1 - (Math.min(S, sMax.value) / sMax.value) * (Y1 - Y0)
}

const enduranceY = computed(() => sToY(props.enduranceLimit))
const kneeX = computed(() => nToX(props.cycleLimit))

const snPoints = computed(() => {
  const pts = []
  const steps = 48
  for (let i = 0; i <= steps; i++) {
    const logN = Math.log10(N_MIN) + (i / steps) * (Math.log10(N_MAX) - Math.log10(N_MIN))
    const N = 10 ** logN
    pts.push(`${nToX(N)},${sToY(stressAtN(N))}`)
  }
  return pts.join(' ')
})

const showOperatingPoint = computed(() => props.stressAmplitude > 0)

const opX = computed(() => nToX(opN.value ?? props.cycleLimit))

/** Y 坐标：有限寿命区取曲线上该 N 对应应力，保证红点落在 S-N 线上 */
const opY = computed(() => {
  if (props.stressAmplitude <= props.enduranceLimit) {
    return sToY(props.stressAmplitude)
  }
  if (opN.value != null) return sToY(stressAtN(opN.value))
  return sToY(props.stressAmplitude)
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .axis { stroke: #64748b; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #94a3b8; stroke-width: 1; fill: none; }
.mech-diagram__svg .stress-point { fill: #ef4444; stroke: #b91c1c; stroke-width: 2; }
.mech-diagram__svg .txt-primary { fill: #409eff; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-sub { fill: #64748b; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; font-family: system-ui, sans-serif; }
</style>
