<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint">{{ dt('hint') }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="gr-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 大齿轮 -->
      <circle :cx="x2" :cy="cy" :r="r2" class="gear-circle" />
      <circle :cx="x2" :cy="cy" :r="r2 - 8" fill="none" stroke="#409eff" stroke-width="1" stroke-dasharray="3 3" opacity="0.5" />
      <!-- 小齿轮 -->
      <circle :cx="x1" :cy="cy" :r="r1" class="gear-circle gear-circle--pinion" />
      <circle :cx="x1" :cy="cy" :r="r1 - 6" fill="none" stroke="#409eff" stroke-width="1" stroke-dasharray="3 3" opacity="0.5" />

      <!-- 啮合线 -->
      <line :x1="x1 + r1 * 0.7" :y1="cy - r1 * 0.7" :x2="x2 - r2 * 0.7" :y2="cy - r2 * 0.7" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 3" />

      <!-- 齿宽 b（侧视示意） -->
      <rect :x="360" :y="cy - 18" :width="48" :height="36" rx="2" class="face-width" />
      <line x1="360" y1="cy + 28" x2="408" y2="cy + 28" class="dim-primary" marker-start="url(#gr-arrow)" marker-end="url(#gr-arrow)" />
      <text x="384" y="cy + 44" class="txt-primary" font-size="12" text-anchor="middle">b = {{ faceWidth }} mm</text>

      <!-- d1 -->
      <line :x1="x1 - r1" :y1="cy + r1 + 22" :x2="x1 + r1" :y2="cy + r1 + 22" class="dim-primary" marker-start="url(#gr-arrow)" marker-end="url(#gr-arrow)" />
      <text :x="x1" :y="cy + r1 + 38" class="txt-primary" font-size="11" text-anchor="middle">d₁ = {{ d1.toFixed(1) }} mm</text>

      <!-- d2 -->
      <line :x1="x2 - r2" :y1="cy - r2 - 14" :x2="x2 + r2" :y2="cy - r2 - 14" class="dim" stroke="#64748b" stroke-width="1.2" marker-start="url(#gr-arrow)" marker-end="url(#gr-arrow)" />
      <text :x="x2" :y="cy - r2 - 22" class="txt" font-size="11" text-anchor="middle">d₂ = {{ d2.toFixed(1) }} mm</text>

      <!-- m, z -->
      <text :x="x1" :y="cy + 6" class="txt-muted" font-size="11" text-anchor="middle">z₁={{ pinionTeeth }}</text>
      <text :x="x2" :y="cy + 6" class="txt-muted" font-size="11" text-anchor="middle">z₂={{ gearTeeth }}</text>
      <text x="24" y="240" class="txt-muted" font-size="11">m = {{ module }} mm</text>

      <!-- T -->
      <path :d="`M ${x1 - 28} ${cy} A 12 12 0 1 1 ${x1 - 10} ${cy - 16}`" fill="none" stroke="#8b5cf6" stroke-width="1.5" marker-end="url(#gr-arrow)" />
      <text :x="x1 - 38" :y="cy + 4" fill="#8b5cf6" font-size="11">T</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt } = useDiagramI18n('gear')

const props = defineProps({
  module: { type: Number, default: 2 },
  pinionTeeth: { type: Number, default: 20 },
  gearTeeth: { type: Number, default: 60 },
  faceWidth: { type: Number, default: 20 },
})

const d1 = computed(() => props.module * props.pinionTeeth)
const d2 = computed(() => props.module * props.gearTeeth)

const scale = computed(() => 48 / Math.max(d2.value / 2, 1))
const r1 = computed(() => (d1.value / 2) * scale.value)
const r2 = computed(() => (d2.value / 2) * scale.value)

const cxMid = 230
const x1 = computed(() => cxMid - r1.value - 4)
const x2 = computed(() => cxMid + r2.value + 4)
const cy = 130

const labelSmall = computed(() => `z₁=${props.pinionTeeth}`)
const labelLarge = computed(() => `z₂=${props.gearTeeth}`)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .gear-circle { fill: rgba(148,163,184,0.15); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .gear-circle--pinion { fill: rgba(64,158,255,0.12); stroke: #409eff; }
.mech-diagram__svg .face-width { fill: rgba(64,158,255,0.25); stroke: #409eff; stroke-width: 1.5; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
