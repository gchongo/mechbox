<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint">{{ freeLength ? dt('hintWithL0') : dt('hint') }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="spr-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="spr-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 端座 -->
      <rect x="80" y="200" width="320" height="10" rx="2" class="end-plate" />
      <rect x="80" :y="topY - 6" width="320" height="10" rx="2" class="end-plate" />

      <!-- 簧身 -->
      <path :d="coilPath" fill="none" stroke="#409eff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- D 中径 -->
      <line :x1="centerX - rMean" :y1="midY + 28" :x2="centerX + rMean" :y2="midY + 28" class="dim-primary" marker-start="url(#spr-arrow-blue)" marker-end="url(#spr-arrow-blue)" />
      <text :x="centerX" :y="midY + 44" class="txt-primary" font-size="13" text-anchor="middle">D = {{ meanDiameter }} mm</text>

      <!-- d 线径 -->
      <circle :cx="centerX + rMean - 8" :cy="midY" :r="wireR" class="wire-sample" />
      <line :x1="centerX + rMean + 18" :y1="midY" :x2="centerX + rMean + 18 + wireR * 2" :y2="midY" class="dim" marker-start="url(#spr-arrow)" marker-end="url(#spr-arrow)" />
      <text :x="centerX + rMean + 24 + wireR" :y="midY + 4" class="txt" font-size="12">d = {{ wireDiameter }} mm</text>

      <!-- n 圈数 -->
      <text :x="380" :y="midY" class="txt" font-size="13">n = {{ activeCoils }}</text>

      <!-- L0 -->
      <line v-if="freeLength" x1="420" :y1="topY" x2="420" y2="200" class="dim-primary" marker-start="url(#spr-arrow-blue)" marker-end="url(#spr-arrow-blue)" />
      <text v-if="freeLength" x="432" :y="(topY + 200) / 2 + 4" class="txt-primary" font-size="12">L₀</text>
      <text v-if="freeLength" x="432" :y="(topY + 200) / 2 + 18" class="txt-sub" font-size="11">{{ freeLength }} mm</text>

      <!-- F -->
      <line :x1="centerX" :y1="topY - 24" :x2="centerX" :y2="topY - 4" stroke="#8b5cf6" stroke-width="2" marker-end="url(#spr-arrow-blue)" />
      <text :x="centerX + 8" :y="topY - 14" fill="#8b5cf6" font-size="12">F</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt } = useDiagramI18n('spring')

const props = defineProps({
  wireDiameter: { type: Number, default: 3 },
  meanDiameter: { type: Number, default: 24 },
  activeCoils: { type: Number, default: 8 },
  freeLength: { type: Number, default: 0 },
})

const centerX = 240
const midY = 120
const scale = computed(() => Math.min(3.5, 90 / Math.max(props.meanDiameter, 10)))
const rMean = computed(() => (props.meanDiameter / 2) * scale.value)
const wireR = computed(() => Math.max(3, (props.wireDiameter / 2) * scale.value))
const topY = computed(() => {
  const h = props.freeLength > 0 ? Math.min(150, props.freeLength * 1.1) : 60 + props.activeCoils * 8
  return 200 - h
})

const coilPath = computed(() => {
  const left = centerX - rMean.value
  const right = centerX + rMean.value
  const top = topY.value + 4
  const bottom = 198
  const coils = Math.min(12, Math.max(4, Math.round(props.activeCoils)))
  const pitch = (bottom - top) / coils
  let d = `M ${left} ${top}`
  for (let i = 0; i < coils; i++) {
    const y1 = top + i * pitch
    const y2 = top + (i + 0.5) * pitch
    const y3 = top + (i + 1) * pitch
    d += ` Q ${right} ${y2} ${left} ${y3}`
    if (i < coils - 1) {
      d += ` Q ${left} ${y2 + pitch * 0.25} ${right} ${y3}`
    }
  }
  return d
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

.mech-diagram__svg .end-plate {
  fill: #64748b;
  fill-opacity: 0.5;
  stroke: #475569;
  stroke-width: 1;
}

.mech-diagram__svg .wire-sample {
  fill: rgba(64, 158, 255, 0.3);
  stroke: #409eff;
  stroke-width: 1.5;
}

.mech-diagram__svg .dim {
  stroke: #64748b;
  stroke-width: 1.2;
  fill: none;
}

.mech-diagram__svg .dim-primary {
  stroke: #409eff;
  stroke-width: 1.5;
  fill: none;
}

.mech-diagram__svg .txt,
.mech-diagram__svg .txt-primary,
.mech-diagram__svg .txt-sub {
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt {
  fill: #334155;
}

.mech-diagram__svg .txt-primary {
  fill: #409eff;
}

.mech-diagram__svg .txt-sub {
  fill: #64748b;
}

.dark .mech-diagram__svg .txt {
  fill: #e2e8f0;
}
</style>
