<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint">{{ dt('hint') }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 240" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="ma-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="ma-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <text x="24" y="28" class="txt-muted" font-size="13">{{ dt('radialSection') }}</text>

      <!-- 毛坯 -->
      <circle :cx="cx" :cy="cy" :r="rStock" class="stock-ring" />
      <!-- 余量环 -->
      <circle :cx="cx" :cy="cy" :r="rPart" class="part-fill" />

      <!-- 长度 L -->
      <rect :x="320" y="70" :width="lenW" height="28" rx="2" class="stock-bar" />
      <rect :x="322" y="74" :width="lenW - 4" height="20" rx="1" class="part-bar" />
      <line x1="320" :y1="115" :x2="320 + lenW" y2="115" class="dim-primary" marker-start="url(#ma-arrow-blue)" marker-end="url(#ma-arrow-blue)" />
      <text :x="320 + lenW / 2" y="132" class="txt-primary" font-size="13" text-anchor="middle">L = {{ length }} mm</text>

      <!-- d_part -->
      <line :x1="cx - rPart" :y1="cy + rStock + 20" :x2="cx + rPart" :y2="cy + rStock + 20" class="dim-primary" marker-start="url(#ma-arrow-blue)" marker-end="url(#ma-arrow-blue)" />
      <text :x="cx" :y="cy + rStock + 36" class="txt-primary" font-size="13" text-anchor="middle">d = {{ nominalDiameter }} mm</text>

      <!-- allowance -->
      <line :x1="cx + rPart" :y1="cy" :x2="cx + rStock" :y2="cy" stroke="#e6a23c" stroke-width="2" marker-end="url(#ma-arrow)" />
      <text :x="cx + (rPart + rStock) / 2" :y="cy - 8" fill="#e6a23c" font-size="11" text-anchor="middle">a</text>

      <!-- D_stock -->
      <line :x1="cx - rStock" :y1="cy - rStock - 12" :x2="cx + rStock" :y2="cy - rStock - 12" class="dim" marker-start="url(#ma-arrow)" marker-end="url(#ma-arrow)" />
      <text :x="cx" :y="cy - rStock - 24" class="txt" font-size="12" text-anchor="middle">D_stock = {{ stockDiameter.toFixed(1) }} mm</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt } = useDiagramI18n('machining')

const props = defineProps({
  nominalDiameter: { type: Number, default: 50 },
  length: { type: Number, default: 120 },
  stockDiameter: { type: Number, default: 54 },
  radialAllowance: { type: Number, default: 2 },
})

const cx = 160
const cy = 120
const scale = computed(() => 90 / Math.max(props.stockDiameter / 2, 1))
const rPart = computed(() => (props.nominalDiameter / 2) * scale.value)
const rStock = computed(() => (props.stockDiameter / 2) * scale.value)
const lenW = computed(() => Math.min(140, Math.max(70, props.length * 0.8)))
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .stock-ring { fill: none; stroke: #94a3b8; stroke-width: 2; stroke-dasharray: 6 4; }
.mech-diagram__svg .part-fill { fill: rgba(64,158,255,0.3); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .stock-bar { fill: rgba(148,163,184,0.2); stroke: #94a3b8; stroke-width: 1.5; }
.mech-diagram__svg .part-bar { fill: rgba(64,158,255,0.35); stroke: #409eff; stroke-width: 1; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
