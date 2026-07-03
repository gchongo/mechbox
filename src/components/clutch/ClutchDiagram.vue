<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint', { surfaces: dt('frictionSurfaces', { n: surfaces }) }))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="cl-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="cl-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="cl-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 摩擦片（环形） -->
      <circle :cx="cx" :cy="cy" :r="rOuter" class="disc-outer" />
      <circle :cx="cx" :cy="cy" :r="rInner" class="disc-inner" />
      <!-- 有效摩擦区 -->
      <path :d="annulusPath" class="friction-zone" />

      <!-- 花键轴 -->
      <rect :x="cx - 12" :y="cy - 60" width="24" height="120" rx="2" class="splined-shaft" />

      <!-- D_o -->
      <line :x1="cx - rOuter" :y1="cy - rOuter - 14" :x2="cx + rOuter" :y2="cy - rOuter - 14" class="dim" marker-start="url(#cl-arrow)" marker-end="url(#cl-arrow)" />
      <SvgMathText :x="cx" :y="cy - rOuter - 22" :text="labelDo" anchor="middle" :width="130" :font-size="12" />

      <!-- D_i -->
      <line :x1="cx - rInner" :y1="cy + rOuter + 18" :x2="cx + rInner" :y2="cy + rOuter + 18" class="dim-primary" marker-start="url(#cl-arrow-blue)" marker-end="url(#cl-arrow-blue)" />
      <SvgMathText :x="cx" :y="cy + rOuter + 34" :text="labelDi" anchor="middle" class-name="txt-primary" color="#409eff" :width="130" :font-size="12" />

      <!-- R -->
      <line :x1="cx" :y1="cy" :x2="cx + rEff" :y2="cy" stroke="#e6a23c" stroke-width="1.5" marker-end="url(#cl-arrow)" />
      <SvgMathText :x="cx + rEff / 2" :y="cy - 8" text="$R$" anchor="middle" color="#e6a23c" :width="20" :font-size="12" />

      <!-- F -->
      <line :x1="cx" :y1="cy - rOuter - 40" :x2="cx" :y2="cy - rOuter - 58" stroke="#8b5cf6" stroke-width="2" marker-end="url(#cl-arrow-purple)" />
      <SvgMathText :x="cx + 8" :y="cy - rOuter - 44" text="$F$" color="#8b5cf6" :width="16" :font-size="12" />

      <!-- μ -->
      <SvgMathText :x="380" :y="140" :text="labelMu" class-name="txt-muted" color="#94a3b8" :width="80" :font-size="13" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('clutch')

const props = defineProps({
  innerDiameter: { type: Number, default: 100 },
  outerDiameter: { type: Number, default: 160 },
  effectiveRadius: { type: Number, default: 80 },
  frictionCoeff: { type: Number, default: 0.15 },
  surfaces: { type: Number, default: 2 },
})

const cx = 220
const cy = 140
const scale = computed(() => 72 / Math.max(props.outerDiameter / 2, 1))
const rOuter = computed(() => (props.outerDiameter / 2) * scale.value)
const rInner = computed(() => (props.innerDiameter / 2) * scale.value)
const rEff = computed(() => props.effectiveRadius * scale.value)

const labelDo = computed(() => `D_o = ${props.outerDiameter} mm`)
const labelDi = computed(() => `D_i = ${props.innerDiameter} mm`)
const labelMu = computed(() => `$\\mu$ = ${props.frictionCoeff}`)

const annulusPath = computed(() => {
  const ro = rOuter.value - 4
  const ri = rInner.value + 4
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
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .disc-outer { fill: none; stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .disc-inner { fill: #f8fafc; stroke: #94a3b8; stroke-width: 2; }
.dark .mech-diagram__svg .disc-inner { fill: #1e293b; }
.mech-diagram__svg .friction-zone { fill: rgba(230,162,60,0.25); stroke: #e6a23c; stroke-width: 1; }
.mech-diagram__svg .splined-shaft { fill: #94a3b8; stroke: #64748b; stroke-width: 1; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
