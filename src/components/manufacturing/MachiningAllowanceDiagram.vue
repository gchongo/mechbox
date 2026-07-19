<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 300" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="ma-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="ma-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <text x="16" y="22" class="txt-muted" font-size="12">{{ dt('radialSection') }}</text>
      <text x="320" y="22" class="txt-muted" font-size="12">{{ dt('axialSection') }}</text>

      <!-- 毛坯 / 成品 -->
      <circle :cx="cx" :cy="cy" :r="rStock" class="stock-ring" />
      <circle :cx="cx" :cy="cy" :r="rPart" class="part-fill" />

      <!-- D_stock（上方，预留足够边距） -->
      <line
        :x1="cx - rStock"
        :y1="stockDimY"
        :x2="cx + rStock"
        :y2="stockDimY"
        class="dim"
        marker-start="url(#ma-arrow)"
        marker-end="url(#ma-arrow)"
      />
      <SvgMathText
        :x="cx"
        :y="stockLabelY"
        :text="dl('D_stock', stockDiameter.toFixed(1))"
        anchor="middle"
        class-name="txt"
        color="#334155"
        :width="160"
        :height="28"
        :font-size="12"
      />

      <!-- 单面余量 a -->
      <line
        :x1="cx + rPart"
        :y1="cy"
        :x2="cx + rStock"
        :y2="cy"
        stroke="#e6a23c"
        stroke-width="2"
        marker-end="url(#ma-arrow)"
      />
      <SvgMathText
        :x="cx + (rPart + rStock) / 2 + 10"
        :y="cy - 10"
        text="a"
        anchor="middle"
        color="#e6a23c"
        :width="20"
        :height="22"
        :font-size="12"
      />

      <!-- d（下方） -->
      <line
        :x1="cx - rPart"
        :y1="partDimY"
        :x2="cx + rPart"
        :y2="partDimY"
        class="dim-primary"
        marker-start="url(#ma-arrow-blue)"
        marker-end="url(#ma-arrow-blue)"
      />
      <SvgMathText
        :x="cx"
        :y="partLabelY"
        :text="dl('d', nominalDiameter)"
        anchor="middle"
        class-name="txt-primary"
        color="#409eff"
        :width="120"
        :height="26"
        :font-size="13"
      />

      <!-- 轴向截面：长度 L -->
      <rect :x="320" :y="barY" :width="lenW" height="36" rx="2" class="stock-bar" />
      <rect :x="324" :y="barY + 6" :width="lenW - 8" height="24" rx="1" class="part-bar" />
      <line
        x1="320"
        :y1="barDimY"
        :x2="320 + lenW"
        :y2="barDimY"
        class="dim-primary"
        marker-start="url(#ma-arrow-blue)"
        marker-end="url(#ma-arrow-blue)"
      />
      <SvgMathText
        :x="320 + lenW / 2"
        :y="barLabelY"
        :text="dl('L', length)"
        anchor="middle"
        class-name="txt-primary"
        color="#409eff"
        :width="120"
        :height="26"
        :font-size="13"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('machining')

const props = defineProps({
  nominalDiameter: { type: Number, default: 50 },
  length: { type: Number, default: 120 },
  stockDiameter: { type: Number, default: 54 },
  radialAllowance: { type: Number, default: 2 },
})

const cx = 155
const cy = 145
/** 半径上限，保证上下标注不贴边/越界 */
const maxR = 78

const scale = computed(() => maxR / Math.max(props.stockDiameter / 2, 1))
const rPart = computed(() => Math.max(12, (props.nominalDiameter / 2) * scale.value))
const rStock = computed(() => Math.min(maxR, Math.max(rPart.value + 6, (props.stockDiameter / 2) * scale.value)))
const lenW = computed(() => Math.min(140, Math.max(70, props.length * 0.8)))

const stockDimY = computed(() => cy - rStock.value - 16)
const stockLabelY = computed(() => stockDimY.value - 14)
const partDimY = computed(() => cy + rStock.value + 18)
const partLabelY = computed(() => partDimY.value + 20)

const barY = 110
const barDimY = barY + 56
const barLabelY = barDimY + 20
</script>

<style scoped>
.mech-diagram { @apply mt-6 overflow-visible rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full overflow-visible; }
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
