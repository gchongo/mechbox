<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="cl-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="cl-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="cl-arrow-amber" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
        </marker>
        <marker id="cl-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
        <radialGradient id="cl-friction-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#e6a23c" stop-opacity="0.08" />
          <stop offset="55%" stop-color="#e6a23c" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#e6a23c" stop-opacity="0.18" />
        </radialGradient>
      </defs>

      <!-- 左侧：摩擦片端面 -->
      <text x="16" y="22" class="txt-muted" font-size="11">{{ dt('faceView') }}</text>

      <circle :cx="cx" :cy="cy" :r="rOuter" class="disc-outer" />
      <circle :cx="cx" :cy="cy" :r="rInner" class="disc-inner" />
      <path :d="annulusPath" class="friction-zone" />

      <!-- 等效半径虚线圆 -->
      <circle
        :cx="cx"
        :cy="cy"
        :r="rEff"
        fill="none"
        stroke="#e6a23c"
        stroke-width="1.2"
        stroke-dasharray="4 3"
        opacity="0.85"
      />

      <!-- 摩擦区径向刻线 -->
      <g class="friction-ticks" stroke="#d97706" stroke-width="1" opacity="0.45">
        <line
          v-for="(t, i) in radialTicks"
          :key="'rt-' + i"
          :x1="t.x1"
          :y1="t.y1"
          :x2="t.x2"
          :y2="t.y2"
        />
      </g>

      <!-- 花键毂 -->
      <circle :cx="cx" :cy="cy" :r="hubR" class="hub" />
      <rect :x="cx - 7" :y="cy - hubR - 2" width="14" :height="hubR * 2 + 4" rx="1.5" class="splined-shaft" />

      <!-- D_o -->
      <line
        :x1="cx - rOuter"
        :y1="doY"
        :x2="cx + rOuter"
        :y2="doY"
        class="dim"
        marker-start="url(#cl-arrow)"
        marker-end="url(#cl-arrow)"
      />
      <SvgMathText
        :x="cx"
        :y="doY - 10"
        :text="dl('D_o', outerDiameter)"
        anchor="middle"
        :width="130"
        :font-size="12"
      />

      <!-- D_i -->
      <line
        :x1="cx - rInner"
        :y1="diY"
        :x2="cx + rInner"
        :y2="diY"
        class="dim-primary"
        marker-start="url(#cl-arrow-blue)"
        marker-end="url(#cl-arrow-blue)"
      />
      <SvgMathText
        :x="cx"
        :y="diY + 16"
        :text="dl('D_i', innerDiameter)"
        anchor="middle"
        class-name="txt-primary"
        color="#409eff"
        :width="130"
        :font-size="12"
      />

      <!-- R 等效摩擦半径 -->
      <line
        :x1="cx"
        :y1="cy"
        :x2="cx + rEff"
        :y2="cy"
        stroke="#e6a23c"
        stroke-width="1.8"
        marker-end="url(#cl-arrow-amber)"
      />
      <SvgMathText
        :x="cx + rEff / 2"
        :y="cy - 10"
        :text="labelR"
        anchor="middle"
        color="#e6a23c"
        :width="100"
        :font-size="12"
      />

      <!-- 扭矩 T -->
      <path :d="torqueArc" fill="none" stroke="#409eff" stroke-width="1.8" marker-end="url(#cl-arrow-blue)" />
      <SvgMathText :x="cx + rOuter + 18" :y="cy - rOuter * 0.35" text="T" color="#409eff" :width="24" :font-size="13" />

      <!-- μ -->
      <SvgMathText
        :x="cx + rOuter + 8"
        :y="cy + 8"
        :text="labelMu"
        class-name="txt-muted"
        color="#94a3b8"
        :width="88"
        :font-size="12"
      />

      <!-- 右侧：轴向叠片示意 -->
      <text :x="stackX0" y="22" class="txt-muted" font-size="11">{{ dt('stackView') }}</text>

      <!-- 压盘 / 摩擦片叠层 -->
      <g v-for="(plate, i) in stackPlates" :key="'p-' + i">
        <rect
          :x="stackX0"
          :y="plate.y"
          :width="stackW"
          :height="plate.h"
          :rx="1.5"
          :class="plate.kind === 'friction' ? 'stack-friction' : 'stack-steel'"
        />
      </g>

      <!-- 轴 -->
      <rect :x="stackAxisX" :y="stackTop - 8" :width="10" :height="stackH + 16" rx="2" class="stack-axis" />

      <!-- 压紧力 F（上下对压） -->
      <line
        :x1="stackMidX"
        :y1="stackTop - 28"
        :x2="stackMidX"
        :y2="stackTop - 6"
        stroke="#8b5cf6"
        stroke-width="2"
        marker-end="url(#cl-arrow-purple)"
      />
      <line
        :x1="stackMidX"
        :y1="stackBot + 28"
        :x2="stackMidX"
        :y2="stackBot + 6"
        stroke="#8b5cf6"
        stroke-width="2"
        marker-end="url(#cl-arrow-purple)"
      />
      <SvgMathText :x="stackMidX + 10" :y="stackTop - 18" :text="labelF" color="#8b5cf6" :width="90" :font-size="12" />

      <!-- 摩擦面数标注 -->
      <SvgMathText
        :x="stackMidX"
        :y="stackBot + 48"
        :text="labelSurfaces"
        anchor="middle"
        color="#64748b"
        :width="120"
        :font-size="11"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('clutch')

const props = defineProps({
  innerDiameter: { type: Number, default: 100 },
  outerDiameter: { type: Number, default: 160 },
  effectiveRadius: { type: Number, default: 66.2 },
  frictionCoeff: { type: Number, default: 0.15 },
  surfaces: { type: Number, default: 2 },
  force: { type: Number, default: 0 },
})

const cx = 168
const cy = 138
const scale = computed(() => 78 / Math.max(props.outerDiameter / 2, 1))
const rOuter = computed(() => Math.max((props.outerDiameter / 2) * scale.value, 36))
const rInner = computed(() => {
  const ri = (props.innerDiameter / 2) * scale.value
  return Math.min(Math.max(ri, 14), rOuter.value - 10)
})
const rEff = computed(() => {
  const re = props.effectiveRadius * scale.value
  return Math.min(Math.max(re, rInner.value + 2), rOuter.value - 2)
})
const hubR = computed(() => Math.max(rInner.value * 0.42, 10))
const doY = computed(() => cy - rOuter.value - 16)
const diY = computed(() => cy + rOuter.value + 16)

const annulusPath = computed(() => {
  const ro = rOuter.value - 2
  const ri = rInner.value + 2
  return [
    `M ${cx + ro} ${cy}`,
    `A ${ro} ${ro} 0 1 1 ${cx - ro} ${cy}`,
    `A ${ro} ${ro} 0 1 1 ${cx + ro} ${cy}`,
    `M ${cx + ri} ${cy}`,
    `A ${ri} ${ri} 0 1 0 ${cx - ri} ${cy}`,
    `A ${ri} ${ri} 0 1 0 ${cx + ri} ${cy}`,
    'Z',
  ].join(' ')
})

const radialTicks = computed(() => {
  const ticks = []
  const n = 12
  const ri = rInner.value + 3
  const ro = rOuter.value - 3
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.12
    const c = Math.cos(a)
    const s = Math.sin(a)
    ticks.push({
      x1: cx + ri * c,
      y1: cy + ri * s,
      x2: cx + ro * c,
      y2: cy + ro * s,
    })
  }
  return ticks
})

const torqueArc = computed(() => {
  const r = rOuter.value + 14
  const x0 = cx + r * 0.15
  const y0 = cy - r * 0.95
  const x1 = cx + r * 0.95
  const y1 = cy - r * 0.2
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`
})

/** 右侧叠片：钢片与摩擦片交错，摩擦接触面数 = surfaces */
const stackX0 = 318
const stackW = 120
const stackMidX = stackX0 + stackW / 2
const stackAxisX = stackMidX - 5
const stackTop = 48
const stackBot = 210
const stackH = stackBot - stackTop

const stackPlates = computed(() => {
  const z = Math.max(1, Math.min(props.surfaces, 8))
  // z 个摩擦面 → z+1 层板交替（两端钢压盘，中间摩擦/钢交错）
  const layers = z + 1
  const gap = 3
  const avail = stackH - gap * (layers - 1)
  const h = Math.min(Math.max(avail / layers, 8), 22)
  const total = layers * h + (layers - 1) * gap
  let y = stackTop + (stackH - total) / 2
  const plates = []
  for (let i = 0; i < layers; i++) {
    plates.push({ y, h, kind: i % 2 === 0 ? 'steel' : 'friction' })
    y += h + gap
  }
  return plates
})

const labelR = computed(() => {
  const r = Number(props.effectiveRadius)
  if (!Number.isFinite(r) || r <= 0) return '$R$'
  return dl('R', Number(r.toFixed(1)))
})
const labelMu = computed(() => dl('\\mu', props.frictionCoeff, ''))
const labelF = computed(() => {
  if (props.force > 0) return `$F = ${Math.round(props.force)}\\,\\mathrm{N}$`
  return '$F$'
})
const labelSurfaces = computed(() => dt('frictionSurfaces', { n: props.surfaces }))

const hintText = computed(() =>
  dt('hint', { surfaces: dt('frictionSurfaces', { n: props.surfaces }) }),
)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .disc-outer { fill: rgba(148,163,184,0.12); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .disc-inner { fill: #f8fafc; stroke: #94a3b8; stroke-width: 1.5; }
.dark .mech-diagram__svg .disc-inner { fill: #1e293b; }
.mech-diagram__svg .friction-zone { fill: url(#cl-friction-fill); stroke: #e6a23c; stroke-width: 1.2; }
.mech-diagram__svg .hub { fill: rgba(148,163,184,0.35); stroke: #64748b; stroke-width: 1; }
.mech-diagram__svg .splined-shaft { fill: #94a3b8; stroke: #64748b; stroke-width: 1; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .stack-steel { fill: rgba(148,163,184,0.45); stroke: #64748b; stroke-width: 1; }
.mech-diagram__svg .stack-friction { fill: rgba(230,162,60,0.45); stroke: #d97706; stroke-width: 1; }
.mech-diagram__svg .stack-axis { fill: #94a3b8; stroke: #64748b; stroke-width: 1; }
.dark .mech-diagram__svg .disc-outer { fill: rgba(148,163,184,0.08); }
.dark .mech-diagram__svg .stack-steel { fill: rgba(148,163,184,0.25); }
</style>
