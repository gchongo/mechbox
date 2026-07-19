<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="col-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="col-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="col-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
        <marker id="col-arrow-violet-start" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 顶力 F -->
      <line
        :x1="cx"
        y1="18"
        :x2="cx + eccPx"
        y2="48"
        stroke="#8b5cf6"
        stroke-width="2.2"
        marker-end="url(#col-arrow-violet)"
      />
      <SvgMathText :x="cx + eccPx + 10" :y="36" text="F" color="#8b5cf6" :width="18" :font-size="13" />

      <!-- 偏心 e -->
      <template v-if="eccentricity > 0">
        <line
          :x1="cx"
          y1="42"
          :x2="cx + eccPx"
          y2="42"
          class="dim"
          marker-start="url(#col-arrow)"
          marker-end="url(#col-arrow)"
        />
        <SvgMathText :x="cx + eccPx / 2" :y="36" :text="labelE" anchor="middle" color="#64748b" :width="72" :font-size="11" />
      </template>

      <!-- 柱身（直立） -->
      <rect :x="cx - colW / 2" :y="colTop" :width="colW" :height="colH" rx="2" class="column-body" />
      <!-- 屈曲侧移虚线 -->
      <path :d="bucklePath" fill="none" stroke="#409eff" stroke-width="1.8" stroke-dasharray="5 3" opacity="0.9" />

      <!-- 上端约束 -->
      <g v-if="topKind === 'pinned'">
        <circle :cx="cx" :cy="colTop" r="6" class="pin-joint" />
        <polygon :points="`${cx},${colTop} ${cx - 12},${colTop - 14} ${cx + 12},${colTop - 14}`" class="support" />
      </g>
      <g v-else-if="topKind === 'fixed'">
        <rect :x="cx - 22" :y="colTop - 10" width="44" height="10" class="clamp" />
        <g stroke="#94a3b8" stroke-width="1.4">
          <line v-for="i in 5" :key="'t'+i" :x1="cx - 20 + (i - 1) * 10" :y1="colTop - 10" :x2="cx - 26 + (i - 1) * 10" :y2="colTop - 20" />
        </g>
      </g>
      <!-- free: 无支撑符号 -->

      <!-- 下端约束 -->
      <g v-if="botKind === 'pinned'">
        <circle :cx="cx" :cy="colBot" r="6" class="pin-joint" />
        <polygon :points="`${cx},${colBot} ${cx - 12},${colBot + 14} ${cx + 12},${colBot + 14}`" class="support" />
        <line :x1="cx - 40" :y1="colBot + 14" :x2="cx + 40" :y2="colBot + 14" class="base-line" />
      </g>
      <g v-else-if="botKind === 'fixed'">
        <rect :x="cx - 22" :y="colBot" width="44" height="10" class="clamp" />
        <g stroke="#94a3b8" stroke-width="1.4">
          <line v-for="i in 5" :key="'b'+i" :x1="cx - 20 + (i - 1) * 10" :y1="colBot + 10" :x2="cx - 26 + (i - 1) * 10" :y2="colBot + 20" />
        </g>
        <line :x1="cx - 48" :y1="colBot + 20" :x2="cx + 48" :y2="colBot + 20" class="base-line" />
      </g>
      <g v-else>
        <line :x1="cx - 40" :y1="colBot + 8" :x2="cx + 40" :y2="colBot + 8" class="base-line" />
      </g>

      <!-- L -->
      <line
        :x1="cx + colW / 2 + 18"
        :y1="colTop"
        :x2="cx + colW / 2 + 18"
        :y2="colBot"
        class="dim-primary"
        marker-start="url(#col-arrow-blue)"
        marker-end="url(#col-arrow-blue)"
      />
      <SvgMathText :x="cx + colW / 2 + 28" :y="(colTop + colBot) / 2 + 4" :text="labelL" color="#409eff" :width="100" :font-size="12" />

      <!-- 右侧截面示意 -->
      <text x="320" y="48" class="txt-muted" font-size="11">{{ dt('sectionView') }}</text>
      <template v-if="section === 'rectangular'">
        <rect :x="secCx - secW / 2" :y="secCy - secH / 2" :width="secW" :height="secH" rx="1" class="section-shape" />
        <line
          :x1="secCx - secW / 2"
          :y1="secCy + secH / 2 + 14"
          :x2="secCx + secW / 2"
          :y2="secCy + secH / 2 + 14"
          class="dim-primary"
          marker-start="url(#col-arrow-blue)"
          marker-end="url(#col-arrow-blue)"
        />
        <SvgMathText :x="secCx" :y="secCy + secH / 2 + 30" :text="labelB" anchor="middle" color="#409eff" :width="80" :font-size="11" />
        <line
          :x1="secCx + secW / 2 + 14"
          :y1="secCy - secH / 2"
          :x2="secCx + secW / 2 + 14"
          :y2="secCy + secH / 2"
          class="dim"
          marker-start="url(#col-arrow)"
          marker-end="url(#col-arrow)"
        />
        <SvgMathText :x="secCx + secW / 2 + 22" :y="secCy + 4" :text="labelH" color="#64748b" :width="80" :font-size="11" />
      </template>
      <template v-else-if="section === 'tube'">
        <circle :cx="secCx" :cy="secCy" :r="secR" class="section-shape" />
        <circle :cx="secCx" :cy="secCy" :r="Math.max(4, secR - secT)" class="section-hole" />
        <line
          :x1="secCx - secR"
          :y1="secCy + secR + 16"
          :x2="secCx + secR"
          :y2="secCy + secR + 16"
          class="dim-primary"
          marker-start="url(#col-arrow-blue)"
          marker-end="url(#col-arrow-blue)"
        />
        <SvgMathText :x="secCx" :y="secCy + secR + 32" :text="labelD" anchor="middle" color="#409eff" :width="90" :font-size="11" />
        <line
          :x1="secCx + secR - secT"
          :y1="secCy"
          :x2="secCx + secR"
          :y2="secCy"
          class="dim"
          marker-start="url(#col-arrow)"
          marker-end="url(#col-arrow)"
        />
        <SvgMathText :x="secCx + secR + 8" :y="secCy - 6" :text="labelT" color="#64748b" :width="70" :font-size="11" />
      </template>
      <template v-else>
        <circle :cx="secCx" :cy="secCy" :r="secR" class="section-shape" />
        <line
          :x1="secCx - secR"
          :y1="secCy + secR + 16"
          :x2="secCx + secR"
          :y2="secCy + secR + 16"
          class="dim-primary"
          marker-start="url(#col-arrow-blue)"
          marker-end="url(#col-arrow-blue)"
        />
        <SvgMathText :x="secCx" :y="secCy + secR + 32" :text="labelD" anchor="middle" color="#409eff" :width="90" :font-size="11" />
      </template>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from '@/components/common/MathContent.vue'
import SvgMathText from '@/components/common/SvgMathText.vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('columnBuckling')

const props = defineProps({
  endCondition: { type: String, default: 'pinned_pinned' },
  section: { type: String, default: 'circular' },
  length: { type: Number, default: 800 },
  diameter: { type: Number, default: 20 },
  width: { type: Number, default: 20 },
  height: { type: Number, default: 40 },
  outerDiameter: { type: Number, default: 40 },
  wallThickness: { type: Number, default: 3 },
  eccentricity: { type: Number, default: 0 },
})

const cx = 140
const colTop = 56
const colBot = 230
const colH = colBot - colTop
const colW = 28

const ends = computed(() => {
  switch (props.endCondition) {
    case 'fixed_fixed':
      return { top: 'fixed', bot: 'fixed' }
    case 'fixed_free':
      return { top: 'free', bot: 'fixed' }
    case 'fixed_pinned':
      return { top: 'pinned', bot: 'fixed' }
    case 'pinned_pinned':
    default:
      return { top: 'pinned', bot: 'pinned' }
  }
})
const topKind = computed(() => ends.value.top)
const botKind = computed(() => ends.value.bot)

const eccPx = computed(() => Math.min(28, Math.max(0, Number(props.eccentricity) || 0) * 1.2))

const bucklePath = computed(() => {
  // 侧移半波，固支端更贴边
  const mid = (colTop + colBot) / 2
  if (topKind.value === 'fixed' && botKind.value === 'fixed') {
    return `M ${cx} ${colTop} C ${cx + 6} ${colTop + 30} ${cx + 36} ${mid - 20} ${cx + 36} ${mid} C ${cx + 36} ${mid + 20} ${cx + 6} ${colBot - 30} ${cx} ${colBot}`
  }
  if (topKind.value === 'free') {
    return `M ${cx + 32} ${colTop} Q ${cx + 40} ${mid} ${cx} ${colBot}`
  }
  return `M ${cx} ${colTop} Q ${cx + 40} ${mid} ${cx} ${colBot}`
})

const secCx = 370
const secCy = 130
const secR = computed(() => {
  const d = props.section === 'tube' ? props.outerDiameter : props.diameter
  return Math.min(42, Math.max(16, (Number(d) || 20) * 0.9))
})
const secT = computed(() => Math.min(secR.value * 0.45, Math.max(3, (Number(props.wallThickness) || 3) * 1.5)))
const secW = computed(() => Math.min(56, Math.max(18, (Number(props.width) || 20) * 1.1)))
const secH = computed(() => Math.min(72, Math.max(24, (Number(props.height) || 40) * 1.1)))

const labelL = computed(() => dl('L', props.length))
const labelD = computed(() =>
  props.section === 'tube' ? dl('D', props.outerDiameter) : dl('d', props.diameter),
)
const labelB = computed(() => dl('b', props.width))
const labelH = computed(() => dl('h', props.height))
const labelT = computed(() => dl('t', props.wallThickness))
const labelE = computed(() => dl('e', props.eccentricity))
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .column-body { fill: rgba(148,163,184,0.22); stroke: #64748b; stroke-width: 1.8; }
.mech-diagram__svg .section-shape { fill: rgba(64,158,255,0.18); stroke: #409eff; stroke-width: 1.8; }
.mech-diagram__svg .section-hole { fill: rgba(15,23,42,0.55); stroke: #64748b; stroke-width: 1.2; }
.dark .mech-diagram__svg .section-hole { fill: rgba(15,23,42,0.85); }
.mech-diagram__svg .pin-joint { fill: #94a3b8; stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .support { fill: #64748b; }
.mech-diagram__svg .clamp { fill: #334155; }
.dark .mech-diagram__svg .clamp { fill: #94a3b8; }
.mech-diagram__svg .base-line { stroke: #cbd5e1; stroke-width: 1.2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; font-family: system-ui, sans-serif; }
</style>
