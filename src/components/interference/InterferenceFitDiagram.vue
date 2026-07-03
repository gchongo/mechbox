<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint" v-html="dt('hint')" />
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 520 300" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="if-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="if-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 横截面 -->
      <text x="24" y="28" class="txt-muted" font-size="13">{{ dt('radialSection') }}</text>
      <circle :cx="cx" :cy="cy" :r="rHub" class="hub-ring" />
      <circle :cx="cx" :cy="cy" :r="rHole" class="hole-ring" />
      <circle :cx="cx" :cy="cy" :r="rShaft" class="shaft-fill" />
      <circle v-if="rShaftInner > 4" :cx="cx" :cy="cy" :r="rShaftInner" class="shaft-bore" />

      <!-- d -->
      <line
        :x1="cx - rShaft"
        :y1="cy + rHub + 22"
        :x2="cx + rShaft"
        :y2="cy + rHub + 22"
        class="dim-line-primary"
        marker-start="url(#if-arrow-blue)"
        marker-end="url(#if-arrow-blue)"
      />
      <text :x="cx" :y="cy + rHub + 40" class="txt-primary" font-size="14" text-anchor="middle">d = {{ fmt(shaftDiameter) }} mm</text>

      <!-- D -->
      <line
        :x1="cx - rHole"
        :y1="cy - rHub - 14"
        :x2="cx + rHole"
        :y2="cy - rHub - 14"
        class="dim-line"
        marker-start="url(#if-arrow)"
        marker-end="url(#if-arrow)"
      />
      <text :x="cx" :y="cy - rHub - 28" class="txt" font-size="14" text-anchor="middle">D = {{ fmt(holeDiameter) }} mm</text>

      <!-- D_A -->
      <line
        :x1="cx + rHub + 8"
        :y1="cy"
        :x2="cx + rHub + 48"
        :y2="cy"
        class="dim-line"
        marker-end="url(#if-arrow)"
      />
      <text :x="cx + rHub + 52" :y="cy + 5" class="txt" font-size="13">D<sub>A</sub></text>
      <text :x="cx + rHub + 52" :y="cy + 20" class="txt-sub" font-size="12">{{ fmt(hubOuterDiameter) }} mm</text>

      <!-- i 过盈 -->
      <line :x1="cx + rHole" :y1="cy" :x2="cx + rShaft" :y2="cy" stroke="#e6a23c" stroke-width="2" marker-end="url(#if-arrow)" />
      <text :x="cx + (rHole + rShaft) / 2" :y="cy - 8" fill="#e6a23c" font-size="12" text-anchor="middle">i = {{ fmt(interference) }}</text>

      <!-- 轴向长度 L -->
      <text x="320" y="28" class="txt-muted" font-size="13">轴向配合段</text>
      <rect x="320" y="100" :width="lenW" height="36" rx="3" class="fit-length" />
      <rect x="320" y="108" :width="lenW" height="20" rx="2" class="shaft-bar" />
      <line
        x1="320"
        y1="155"
        :x2="320 + lenW"
        y2="155"
        class="dim-line-primary"
        marker-start="url(#if-arrow-blue)"
        marker-end="url(#if-arrow-blue)"
      />
      <text :x="320 + lenW / 2" y="172" class="txt-primary" font-size="14" text-anchor="middle">L = {{ fmt(fitLength) }} mm</text>
      <text x="320" y="88" class="txt-muted" font-size="11">轮毂</text>
      <text x="320" y="118" class="txt-muted" font-size="11">轴</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt } = useDiagramI18n('interference')

const props = defineProps({
  shaftDiameter: { type: Number, default: 50 },
  holeDiameter: { type: Number, default: 49.975 },
  hubOuterDiameter: { type: Number, default: 90 },
  fitLength: { type: Number, default: 40 },
  interference: { type: Number, default: 0.025 },
  shaftInnerDiameter: { type: Number, default: 0 },
})

const cx = 170
const cy = 150
const scale = computed(() => {
  const maxR = Math.max(props.hubOuterDiameter, props.shaftDiameter) / 2
  return maxR > 0 ? 95 / maxR : 1
})

const rShaft = computed(() => (props.shaftDiameter / 2) * scale.value)
const rHole = computed(() => (props.holeDiameter / 2) * scale.value)
const rHub = computed(() => (props.hubOuterDiameter / 2) * scale.value)
const rShaftInner = computed(() => (props.shaftInnerDiameter / 2) * scale.value)
const lenW = computed(() => Math.min(160, Math.max(60, props.fitLength * 1.2)))

function fmt(v) {
  return Number(v).toFixed(3)
}
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

.mech-diagram__svg .hub-ring {
  fill: none;
  stroke: #94a3b8;
  stroke-width: 2;
}

.mech-diagram__svg .hole-ring {
  fill: none;
  stroke: #409eff;
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}

.mech-diagram__svg .shaft-fill {
  fill: rgba(64, 158, 255, 0.25);
  stroke: #409eff;
  stroke-width: 2;
}

.mech-diagram__svg .shaft-bore {
  fill: #f8fafc;
  stroke: #cbd5e1;
  stroke-width: 1;
}

.dark .mech-diagram__svg .shaft-bore {
  fill: #1e293b;
  stroke: #475569;
}

.mech-diagram__svg .fit-length {
  fill: rgba(148, 163, 184, 0.2);
  stroke: #94a3b8;
  stroke-width: 1.5;
}

.mech-diagram__svg .shaft-bar {
  fill: rgba(64, 158, 255, 0.35);
  stroke: #409eff;
  stroke-width: 1;
}

.mech-diagram__svg .dim-line {
  stroke: #64748b;
  stroke-width: 1.2;
  fill: none;
}

.mech-diagram__svg .dim-line-primary {
  stroke: #409eff;
  stroke-width: 1.5;
  fill: none;
}

.mech-diagram__svg .txt {
  fill: #334155;
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt-primary {
  fill: #409eff;
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt-sub {
  fill: #64748b;
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt-muted {
  fill: #94a3b8;
  font-family: system-ui, sans-serif;
}

.dark .mech-diagram__svg .txt {
  fill: #e2e8f0;
}
</style>
