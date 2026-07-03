<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint', { case: caseLabel }))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 220" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="beam-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="beam-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="beam-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 梁 -->
      <line :x1="x1" :y1="beamY" :x2="x2" :y2="beamY" class="beam-line" />

      <!-- 支座 -->
      <template v-if="isSimplySupported">
        <polygon :points="`${x1},${beamY} ${x1 - 10},${beamY + 18} ${x1 + 10},${beamY + 18}`" class="support" />
        <polygon :points="`${x2},${beamY} ${x2 - 10},${beamY + 18} ${x2 + 10},${beamY + 18}`" class="support" />
      </template>
      <template v-else>
        <rect :x="x1 - 8" :y="beamY - 4" width="16" height="28" class="support-fixed" />
      </template>

      <!-- 集中力 -->
      <template v-if="isPointLoad">
        <line :x1="loadX" :y1="loadYTop" :x2="loadX" :y2="beamY - 4" stroke="#8b5cf6" stroke-width="2.5" marker-end="url(#beam-arrow-purple)" />
        <SvgMathText :x="loadX + 10" :y="loadYTop + 20" text="F" color="#8b5cf6" :width="16" :font-size="13" />
      </template>

      <!-- 均布载荷 -->
      <template v-else>
        <line :x1="x1 + 20" :y1="loadYTop" :x2="x2 - 20" :y2="loadYTop" stroke="#8b5cf6" stroke-width="1.5" />
        <line v-for="i in 7" :key="i" :x1="x1 + 20 + ((x2 - x1 - 40) / 6) * (i - 1)" :y1="loadYTop" :x2="x1 + 20 + ((x2 - x1 - 40) / 6) * (i - 1)" :y2="beamY - 4" stroke="#8b5cf6" stroke-width="1.2" marker-end="url(#beam-arrow-purple)" />
        <text :x="(x1 + x2) / 2" :y="loadYTop - 8" fill="#8b5cf6" font-size="12" text-anchor="middle">{{ dt('udl') }}</text>
      </template>

      <!-- L -->
      <line :x1="x1" :y1="beamY + 36" :x2="x2" :y2="beamY + 36" class="dim-primary" marker-start="url(#beam-arrow-blue)" marker-end="url(#beam-arrow-blue)" />
      <SvgMathText :x="(x1 + x2) / 2" :y="beamY + 52" :text="dl('L', spanLength)" anchor="middle" class-name="txt-primary" color="#409eff" :width="120" :font-size="13" />

      <!-- 挠度示意 -->
      <path :d="deflectPath" fill="none" stroke="#409eff" stroke-width="1.5" stroke-dasharray="5 4" opacity="0.7" />
      <text :x="(x1 + x2) / 2" :y="beamY + 72" class="txt-muted" font-size="11" text-anchor="middle">{{ dt('deflection') }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BEAM_CASES } from '@/utils/beam-calc'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('beam')

const props = defineProps({
  caseId: { type: String, default: 'simply_center' },
  spanLength: { type: Number, default: 1000 },
})

const beamCase = computed(() => BEAM_CASES[props.caseId] ?? BEAM_CASES.simply_center)
const caseLabel = computed(() => beamCase.value.label)
const isSimplySupported = computed(() => props.caseId.startsWith('simply'))
const isPointLoad = computed(() => props.caseId.includes('center') || props.caseId.includes('end'))

const x1 = 70
const x2 = 410
const beamY = 120
const loadYTop = 52
const loadX = computed(() => {
  if (props.caseId === 'simply_center') return (x1 + x2) / 2
  if (props.caseId === 'cantilever_end') return x2 - 20
  return (x1 + x2) / 2
})

const deflectPath = computed(() => {
  const mid = (x1 + x2) / 2
  if (props.caseId === 'simply_center') {
    return `M ${x1} ${beamY} Q ${mid} ${beamY + 22} ${x2} ${beamY}`
  }
  if (props.caseId === 'cantilever_end') {
    return `M ${x1} ${beamY} Q ${x1 + (x2 - x1) * 0.55} ${beamY + 28} ${x2} ${beamY + 32}`
  }
  if (props.caseId === 'simply_udl') {
    return `M ${x1} ${beamY} Q ${mid} ${beamY + 18} ${x2} ${beamY}`
  }
  return `M ${x1} ${beamY} Q ${x1 + (x2 - x1) * 0.5} ${beamY + 26} ${x2} ${beamY + 30}`
})
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}

.mech-diagram__head {
  @apply mb-3;
}

.mech-diagram__title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-100;
}

.mech-diagram__hint {
  @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}

.mech-diagram__svg {
  @apply w-full;
}

.mech-diagram__svg .beam-line {
  stroke: #334155;
  stroke-width: 5;
  stroke-linecap: round;
}

.dark .mech-diagram__svg .beam-line {
  stroke: #cbd5e1;
}

.mech-diagram__svg .support {
  fill: #64748b;
}

.mech-diagram__svg .support-fixed {
  fill: #475569;
  stroke: #334155;
  stroke-width: 1;
}

.mech-diagram__svg .dim-primary {
  stroke: #409eff;
  stroke-width: 1.5;
  fill: none;
}

.mech-diagram__svg .txt-primary,
.mech-diagram__svg .txt-muted {
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt-primary {
  fill: #409eff;
}

.mech-diagram__svg .txt-muted {
  fill: #94a3b8;
}
</style>
