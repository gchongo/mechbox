<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="br-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="br-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="br-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 轴 -->
      <rect :x="60" :y="cy - 8" :width="360" height="16" rx="2" class="shaft" />

      <!-- 外圈 -->
      <rect :x="cx - rOuter" :y="cy - rOuter" :width="rOuter * 2" :height="rOuter * 2" rx="4" class="outer-ring" />
      <!-- 内圈 -->
      <rect :x="cx - rInner" :y="cy - rInner" :width="rInner * 2" :height="rInner * 2" rx="2" class="inner-ring" />
      <!-- 滚动体 -->
      <circle v-for="(b, i) in balls" :key="i" :cx="b.x" :cy="b.y" :r="ballR" class="ball" />

      <!-- Fr -->
      <line :x1="cx + rOuter + 30" :y1="cy" :x2="cx + rOuter + 70" :y2="cy" stroke="#409eff" stroke-width="2.5" marker-end="url(#br-arrow-blue)" />
      <SvgMathText :x="cx + rOuter + 78" :y="cy + 4" text="F_r" class-name="txt-primary" color="#409eff" :width="24" :font-size="13" />
      <text :x="cx + rOuter + 78" :y="cy + 18" class="txt-sub" font-size="11">{{ radialLoad }} N</text>

      <!-- Fa -->
      <line v-if="axialLoad > 0" :x1="cx" :y1="cy - rOuter - 20" :x2="cx" :y2="cy - rOuter - 55" stroke="#8b5cf6" stroke-width="2.5" marker-end="url(#br-arrow-purple)" />
      <SvgMathText v-if="axialLoad > 0" :x="cx + 8" :y="cy - rOuter - 32" text="F_a" color="#8b5cf6" :width="24" :font-size="13" />
      <text v-if="axialLoad > 0" :x="cx + 8" :y="cy - rOuter - 18" class="txt-sub" font-size="11">{{ axialLoad }} N</text>

      <!-- n -->
      <path :d="`M ${cx - rOuter - 28} ${cy} A 12 12 0 1 1 ${cx - rOuter - 10} ${cy - 16}`" fill="none" stroke="#e6a23c" stroke-width="1.5" marker-end="url(#br-arrow)" />
      <SvgMathText :x="cx - rOuter - 38" :y="cy + 4" text="n" color="#e6a23c" :width="16" :font-size="12" />

      <text x="24" y="240" class="txt-muted" font-size="11">{{ bearingLabel }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('bearing')

const props = defineProps({
  radialLoad: { type: Number, default: 5000 },
  axialLoad: { type: Number, default: 1000 },
  bearingType: { type: String, default: 'ball' },
})

const cx = 220
const cy = 130
const rOuter = 48
const rInner = 28
const ballR = 7
const ballCount = 8

const balls = computed(() => {
  const pts = []
  const r = (rOuter + rInner) / 2 - 2
  for (let i = 0; i < ballCount; i++) {
    const a = (2 * Math.PI * i) / ballCount - Math.PI / 2
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return pts
})

const bearingLabel = computed(() =>
  props.bearingType === 'roller' ? dt('rollerBearing') : dt('ballBearing'),
)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .shaft { fill: #94a3b8; stroke: #64748b; stroke-width: 1; }
.mech-diagram__svg .outer-ring { fill: rgba(148,163,184,0.15); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .inner-ring { fill: rgba(64,158,255,0.2); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .ball { fill: #475569; stroke: #334155; stroke-width: 1; }
.mech-diagram__svg .txt-primary { fill: #409eff; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-sub { fill: #64748b; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; font-family: system-ui, sans-serif; }
</style>
