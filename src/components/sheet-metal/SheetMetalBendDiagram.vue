<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">折弯展开示意</h3>
      <p class="mech-diagram__hint">板厚 T、内半径 R、折弯角 θ，K = {{ kFactor }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" aria-label="钣金折弯参数示意图">
      <defs>
        <marker id="sm-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="sm-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 直段 1 -->
      <rect :x="leg1.x" :y="leg1.y" :width="leg1.w" :height="leg1.h" class="sheet" />
      <!-- 圆弧 -->
      <path :d="arcPath" fill="none" stroke="#409eff" stroke-width="leg1.h" stroke-linecap="butt" />
      <!-- 直段 2 -->
      <rect :x="leg2.x" :y="leg2.y" :width="leg2.w" :height="leg2.h" class="sheet" transform-origin="center" :transform="leg2Transform" />

      <!-- 中性层虚线 -->
      <path :d="neutralPath" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="4 3" />

      <!-- T -->
      <line :x1="tX1" :y1="tY" :x2="tX2" :y2="tY" class="dim-primary" marker-start="url(#sm-arrow-blue)" marker-end="url(#sm-arrow-blue)" />
      <text :x="(tX1 + tX2) / 2" :y="tY - 6" class="txt-primary" font-size="12" text-anchor="middle">T = {{ thickness }} mm</text>

      <!-- R -->
      <line :x1="arcCx - arcR" :y1="arcCy + 20" :x2="arcCx" :y2="arcCy + arcR + 8" class="dim" marker-end="url(#sm-arrow)" />
      <text :x="arcCx - arcR - 4" :y="arcCy + arcR + 4" class="txt" font-size="12" text-anchor="end">R = {{ bendRadius }} mm</text>

      <!-- θ -->
      <path :d="angleArc" fill="none" stroke="#e6a23c" stroke-width="1.5" />
      <text :x="arcCx + arcR + 14" :y="arcCy + 4" fill="#e6a23c" font-size="13">θ = {{ bendAngle }}°</text>

      <!-- BA 标注 -->
      <text x="360" y="220" class="txt-muted" font-size="11">折弯补偿 BA ≈ (π/180)·θ·(R + K·T)</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  thickness: { type: Number, default: 1.5 },
  bendRadius: { type: Number, default: 1.5 },
  kFactor: { type: Number, default: 0.33 },
  bendAngle: { type: Number, default: 90 },
})

const tPx = computed(() => Math.max(8, props.thickness * 4))
const rPx = computed(() => Math.max(16, props.bendRadius * 5))
const legW = 100
const legH = computed(() => tPx.value)

const leg1 = computed(() => ({ x: 80, y: 140 - legH.value / 2, w: legW, h: legH.value }))
const arcCx = computed(() => leg1.value.x + leg1.value.w)
const arcCy = computed(() => leg1.value.y + leg1.value.h / 2)
const arcR = computed(() => rPx.value + legH.value / 2)

const arcPath = computed(() => {
  const cx = arcCx.value
  const cy = arcCy.value
  const r = arcR.value
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
})

const neutralPath = computed(() => {
  const cx = arcCx.value
  const cy = arcCy.value
  const r = arcR.value - legH.value * props.kFactor * 0.5
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
})

const leg2 = computed(() => ({
  x: arcCx.value + arcR.value - legH.value / 2,
  y: arcCy.value,
  w: legH.value,
  h: legW,
}))
const leg2Transform = computed(() => `rotate(-90 ${leg2.value.x + leg2.value.w / 2} ${leg2.value.y})`)

const angleArc = computed(() => {
  const cx = arcCx.value
  const cy = arcCy.value
  const r = 22
  return `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`
})

const tX1 = computed(() => leg1.value.x + 20)
const tX2 = computed(() => tX1.value + 36)
const tY = computed(() => leg1.value.y - 14)
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .sheet { fill: rgba(148,163,184,0.35); stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
