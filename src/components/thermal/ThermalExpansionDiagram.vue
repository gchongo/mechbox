<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ showFit ? '热膨胀配合示意' : '线膨胀示意' }}</h3>
      <p class="mech-diagram__hint">ΔL = α·L·ΔT，温差 ΔT = {{ deltaT }} °C</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" aria-label="热膨胀参数示意图">
      <defs>
        <marker id="te-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="te-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 杆件 -->
      <rect :x="barX" :y="barY" :width="barW" :height="barH" rx="2" class="bar" />
      <rect :x="barX + barW" :y="barY" :width="expandW" :height="barH" rx="2" class="bar-expand" />

      <!-- L -->
      <line :x1="barX" :y1="barY + barH + 20" :x2="barX + barW" :y2="barY + barH + 20" class="dim-primary" marker-start="url(#te-arrow-blue)" marker-end="url(#te-arrow-blue)" />
      <text :x="barX + barW / 2" :y="barY + barH + 36" class="txt-primary" font-size="12" text-anchor="middle">L = {{ length }} mm</text>

      <!-- ΔL -->
      <line :x1="barX + barW" :y1="barY - 14" :x2="barX + barW + expandW" :y2="barY - 14" stroke="#e6a23c" stroke-width="1.5" marker-start="url(#te-arrow)" marker-end="url(#te-arrow)" />
      <text :x="barX + barW + expandW / 2" :y="barY - 20" fill="#e6a23c" font-size="12" text-anchor="middle">ΔL</text>

      <!-- 配合截面 -->
      <template v-if="showFit">
        <text x="300" y="48" class="txt-muted" font-size="12">径向截面</text>
        <circle :cx="360" :cy="130" :r="rHole" class="hole" />
        <circle :cx="360" :cy="130" :r="rShaft" class="shaft" />
        <line :x1="360 - rShaft" :y1="130 + rHole + 16" :x2="360 + rShaft" :y2="130 + rHole + 16" class="dim-primary" marker-start="url(#te-arrow-blue)" marker-end="url(#te-arrow-blue)" />
        <text x="360" :y="130 + rHole + 32" class="txt-primary" font-size="11" text-anchor="middle">d / D</text>
      </template>

      <text x="24" y="240" class="txt-muted" font-size="11">α = {{ alpha }} ×10⁻⁶ /°C</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  length: { type: Number, default: 100 },
  deltaT: { type: Number, default: 50 },
  alpha: { type: Number, default: 12 },
  shaftDiameter: { type: Number, default: 30 },
  holeDiameter: { type: Number, default: 29.98 },
  showFit: { type: Boolean, default: false },
})

const barX = 60
const barY = 100
const barW = 180
const barH = 24
const expandW = computed(() => Math.max(8, Math.abs(props.deltaT) * 0.15))

const scale = computed(() => 40 / Math.max(props.holeDiameter / 2, 1))
const rHole = computed(() => (props.holeDiameter / 2) * scale.value)
const rShaft = computed(() => (props.shaftDiameter / 2) * scale.value)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .bar { fill: rgba(64,158,255,0.3); stroke: #409eff; stroke-width: 1.5; }
.mech-diagram__svg .bar-expand { fill: rgba(230,162,60,0.35); stroke: #e6a23c; stroke-width: 1.5; }
.mech-diagram__svg .hole { fill: none; stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .shaft { fill: rgba(64,158,255,0.35); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt-primary { fill: #409eff; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; font-family: system-ui, sans-serif; }
</style>
