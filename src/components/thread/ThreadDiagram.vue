<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint', { diameter, pitch }))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="th-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="th-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="th-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 螺栓杆 -->
      <rect :x="boltX" :y="cy - boltR" :width="boltLen" :height="boltR * 2" class="shank" />
      <!-- 螺纹区 -->
      <path :d="threadPath" class="thread-zone" />
      <!-- 螺母 -->
      <rect :x="nutX" :y="cy - nutH / 2" :width="nutW" :height="nutH" class="nut" />

      <!-- 螺纹牙型（放大） -->
      <g transform="translate(60, 180)">
        <path :d="toothPath" fill="none" stroke="#409eff" stroke-width="1.5" />
        <text x="0" y="-8" class="txt-muted" font-size="11">{{ dt('threadEnlarge') }}</text>
      </g>

      <!-- d -->
      <line :x1="boltX" :y1="cy + boltR + 18" :x2="boltX + boltLen" :y2="cy + boltR + 18" class="dim-primary" marker-start="url(#th-arrow-blue)" marker-end="url(#th-arrow-blue)" />
      <SvgMathText :x="boltX + boltLen / 2" :y="cy + boltR + 34" :text="labelD" anchor="middle" class-name="txt-primary" color="#409eff" :width="120" :font-size="12" />

      <!-- L -->
      <line :x1="nutX + nutW + 14" :y1="cy - engageH / 2" :x2="nutX + nutW + 14" :y2="cy + engageH / 2" class="dim" marker-start="url(#th-arrow)" marker-end="url(#th-arrow)" />
      <SvgMathText :x="nutX + nutW + 26" :y="cy + 4" text="$L$" class-name="txt" color="#334155" :width="16" :font-size="12" />
      <text :x="nutX + nutW + 26" :y="cy + 18" class="txt-sub" font-size="11">{{ engagedLength }} mm</text>

      <!-- F -->
      <line :x1="boltX + boltLen + 30" :y1="cy" :x2="boltX + boltLen + 65" :y2="cy" stroke="#8b5cf6" stroke-width="2" marker-end="url(#th-arrow-purple)" />
      <SvgMathText :x="boltX + boltLen + 72" :y="cy + 4" text="$F$" color="#8b5cf6" :width="16" :font-size="12" />

      <!-- P -->
      <line x1="72" y1="210" x2="72 + pitchPx" y2="210" class="dim-primary" marker-start="url(#th-arrow-blue)" marker-end="url(#th-arrow-blue)" />
      <SvgMathText :x="72 + pitchPx / 2" :y="226" text="$P$" anchor="middle" class-name="txt-primary" color="#409eff" :width="16" :font-size="11" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('thread')

const props = defineProps({
  diameter: { type: Number, default: 12 },
  pitch: { type: Number, default: 1.75 },
  engagedLength: { type: Number, default: 18 },
})

const cy = 100
const scale = computed(() => Math.min(3.5, 90 / Math.max(props.diameter, 6)))
const boltR = computed(() => (props.diameter / 2) * scale.value * 0.35)
const boltX = 100
const boltLen = 200
const nutW = 28
const nutH = computed(() => props.diameter * scale.value * 0.9)
const nutX = computed(() => boltX + boltLen - 60)
const engageH = computed(() => Math.min(nutH.value, props.engagedLength * scale.value * 0.4))

const pitchPx = computed(() => Math.max(16, props.pitch * 8))

const threadPath = computed(() => {
  const x0 = nutX.value - 40
  const w = 40
  const y0 = cy - boltR.value
  const h = boltR.value * 2
  let d = `M ${x0} ${y0}`
  for (let i = 0; i < 6; i++) {
    const x = x0 + (w / 6) * i
    d += ` L ${x + w / 12} ${y0} L ${x + w / 6} ${y0 + h} L ${x + w / 4} ${y0 + h}`
  }
  d += ` L ${x0 + w} ${y0} L ${x0 + w} ${y0 + h} L ${x0} ${y0 + h} Z`
  return d
})

const toothPath = computed(() => {
  const p = pitchPx.value
  const h = 14
  return `M 0 ${h} L ${p / 2} 0 L ${p} ${h} L ${p * 1.5} 0 L ${p * 2} ${h}`
})

const labelD = computed(() => `$d$ = ${props.diameter} mm`)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .shank { fill: #94a3b8; stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .thread-zone { fill: rgba(64,158,255,0.2); stroke: #409eff; stroke-width: 1; }
.mech-diagram__svg .nut { fill: rgba(148,163,184,0.25); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-sub, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-sub { fill: #64748b; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
