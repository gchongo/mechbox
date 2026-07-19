<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="wg-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 蜗杆（水平圆柱侧视） -->
      <rect :x="wormX" :y="cy - wormR" :width="wormLen" :height="wormR * 2" rx="4" class="worm-body" />
      <line
        v-for="i in 4"
        :key="'w' + i"
        :x1="wormX + 10 + i * 14"
        :y1="cy - wormR + 2"
        :x2="wormX + 18 + i * 14"
        :y2="cy + wormR - 2"
        stroke="#409eff"
        stroke-width="1.2"
        opacity="0.55"
      />
      <SvgMathText :x="wormX + wormLen / 2" :y="cy - wormR - 10" :text="labelD1" anchor="middle" color="#409eff" :width="100" :font-size="11" />
      <SvgMathText :x="wormX - 8" :y="cy + 4" text="z₁" color="#94a3b8" :width="28" :font-size="11" />

      <!-- 蜗轮（竖直圆，圆心在蜗杆下方交错） -->
      <circle :cx="wheelCx" :cy="wheelCy" :r="wheelR" class="wheel-circle" />
      <circle :cx="wheelCx" :cy="wheelCy" r="3" fill="#64748b" />
      <SvgMathText :x="wheelCx" :y="wheelCy + wheelR + 16" :text="labelD2" anchor="middle" color="#334155" :width="110" :font-size="11" />
      <SvgMathText :x="wheelCx" :y="wheelCy + 5" :text="labelZ2" anchor="middle" color="#94a3b8" :width="56" :font-size="11" />

      <!-- 中心距 a -->
      <line :x1="wormCx" :y1="cy" :x2="wheelCx" :y2="wheelCy" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3 3" />
      <line
        :x1="wormCx + 18"
        :y1="cy"
        :x2="wormCx + 18"
        :y2="wheelCy"
        class="dim-primary"
        marker-start="url(#wg-arrow)"
        marker-end="url(#wg-arrow)"
      />
      <SvgMathText :x="wormCx + 36" :y="(cy + wheelCy) / 2 + 4" :text="labelA" color="#409eff" :width="90" :font-size="11" />

      <!-- γ / i -->
      <SvgMathText :x="24" :y="240" :text="labelGamma" color="#94a3b8" :width="120" :font-size="11" />
      <SvgMathText :x="160" :y="240" :text="labelI" color="#94a3b8" :width="80" :font-size="11" />
      <SvgMathText :x="280" :y="240" :text="labelEta" color="#94a3b8" :width="100" :font-size="11" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('worm')

const props = defineProps({
  wormDiameter: { type: Number, default: 20 },
  wheelDiameter: { type: Number, default: 80 },
  centerDistance: { type: Number, default: 50 },
  wormStarts: { type: Number, default: 1 },
  wheelTeeth: { type: Number, default: 40 },
  leadAngle: { type: Number, default: 5 },
  efficiency: { type: Number, default: 0.5 },
  ratio: { type: Number, default: 40 },
})

const cy = 88
const wormLen = 100
const wormX = 70
const scale = computed(() => 52 / Math.max(props.wheelDiameter / 2, 1))
const wormR = computed(() => Math.max(8, (props.wormDiameter / 2) * scale.value))
const wheelR = computed(() => Math.max(20, (props.wheelDiameter / 2) * scale.value))
const wormCx = computed(() => wormX + wormLen / 2)
const wheelCx = computed(() => wormCx.value)
const wheelCy = computed(() => cy + Math.max(wormR.value + 4, props.centerDistance * scale.value * 0.85))

const labelD1 = computed(() => `d₁ = ${props.wormDiameter.toFixed(1)} mm`)
const labelD2 = computed(() => `d₂ = ${props.wheelDiameter.toFixed(1)} mm`)
const labelZ2 = computed(() => `z₂=${props.wheelTeeth}`)
const labelA = computed(() => `a = ${props.centerDistance.toFixed(1)} mm`)
const labelGamma = computed(() => `γ ≈ ${props.leadAngle.toFixed(1)}°`)
const labelI = computed(() => `i = ${props.ratio.toFixed(2)}`)
const labelEta = computed(() => `η ≈ ${(props.efficiency * 100).toFixed(0)}%`)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .worm-body { fill: rgba(64,158,255,0.18); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .wheel-circle { fill: rgba(148,163,184,0.15); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
</style>
