<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="gf-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 法兰外圆 -->
      <circle :cx="cx" :cy="cy" :r="rFlange" class="flange" />
      <!-- 垫片环带 -->
      <circle :cx="cx" :cy="cy" :r="rOut" class="gasket-outer" />
      <circle :cx="cx" :cy="cy" :r="rIn" class="gasket-inner" />
      <!-- 内孔 -->
      <circle :cx="cx" :cy="cy" :r="Math.max(rIn - 4, 8)" class="bore" />

      <!-- 螺栓 -->
      <g v-for="(b, i) in bolts" :key="'b' + i">
        <circle :cx="b.x" :cy="b.y" r="5" class="bolt" />
        <circle :cx="b.x" :cy="b.y" r="2.5" class="bolt-core" />
      </g>

      <!-- Di / Do 标注 -->
      <line :x1="cx - rIn" :y1="cy" :x2="cx + rIn" :y2="cy" class="dim-line" marker-start="url(#gf-arrow)" marker-end="url(#gf-arrow)" />
      <SvgMathText :x="cx" :y="cy - 10" :text="labelDi" anchor="middle" color="#64748b" :width="100" :font-size="11" />
      <line :x1="cx - rOut" :y1="cy + 28" :x2="cx + rOut" :y2="cy + 28" class="dim-primary" marker-start="url(#gf-arrow)" marker-end="url(#gf-arrow)" />
      <SvgMathText :x="cx" :y="cy + 46" :text="labelDo" anchor="middle" color="#409eff" :width="100" :font-size="11" />

      <!-- 压力 p -->
      <SvgMathText :x="cx" :y="cy + 8" :text="labelP" anchor="middle" color="#e6a23c" :width="90" :font-size="11" />

      <!-- 预紧示意 -->
      <SvgMathText :x="40" :y="40" :text="labelN" color="#8b5cf6" :width="120" :font-size="11" />
      <SvgMathText :x="40" :y="58" :text="labelF" color="#8b5cf6" :width="140" :font-size="11" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from '@/components/common/MathContent.vue'
import SvgMathText from '@/components/common/SvgMathText.vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('gasketFlange')

const props = defineProps({
  gasketInner: { type: Number, default: 80 },
  gasketOuter: { type: Number, default: 110 },
  boltCount: { type: Number, default: 8 },
  preloadPerBolt: { type: Number, default: 25000 },
  pressure: { type: Number, default: 1.6 },
})

const cx = 260
const cy = 130

const scale = computed(() => {
  const R = Math.max(props.gasketOuter / 2, 20)
  return Math.min(95 / R, 1.2)
})
const rIn = computed(() => Math.max(18, (props.gasketInner / 2) * scale.value))
const rOut = computed(() => Math.max(rIn.value + 12, (props.gasketOuter / 2) * scale.value))
const rFlange = computed(() => rOut.value + 22)
const boltR = computed(() => (rIn.value + rOut.value) / 2)

const bolts = computed(() => {
  const n = Math.min(Math.max(props.boltCount, 2), 24)
  const out = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2
    out.push({
      x: cx + boltR.value * Math.cos(a),
      y: cy + boltR.value * Math.sin(a),
    })
  }
  return out
})

const labelDi = computed(() => `$D_i=${props.gasketInner}\\,\\mathrm{mm}$`)
const labelDo = computed(() => `$D_o=${props.gasketOuter}\\,\\mathrm{mm}$`)
const labelP = computed(() => `$p=${props.pressure}\\,\\mathrm{MPa}$`)
const labelN = computed(() => `$n=${props.boltCount}$`)
const labelF = computed(() => `$F_0=${Math.round(props.preloadPerBolt)}\\,\\mathrm{N}$`)

const hintText = computed(() =>
  dt('hint', {
    n: props.boltCount,
    di: props.gasketInner,
    do: props.gasketOuter,
  }),
)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.flange { fill: rgba(148,163,184,0.15); stroke: #94a3b8; stroke-width: 1.5; }
.gasket-outer { fill: rgba(64,158,255,0.22); stroke: #409eff; stroke-width: 1.5; }
.gasket-inner { fill: rgba(15,23,42,0.04); stroke: #64748b; stroke-width: 1; }
.dark .gasket-inner { fill: rgba(15,23,42,0.35); }
.bore { fill: rgba(15,23,42,0.06); stroke: #475569; stroke-width: 1; stroke-dasharray: 3 2; }
.bolt { fill: rgba(139,92,246,0.25); stroke: #8b5cf6; stroke-width: 1.2; }
.bolt-core { fill: #8b5cf6; }
.dim-line { stroke: #94a3b8; stroke-width: 1.2; fill: none; }
.dim-primary { stroke: #409eff; stroke-width: 1.4; fill: none; }
</style>
