<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint">{{ dt('hint') }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="weld-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="weld-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 水平板 -->
      <rect x="60" y="140" width="360" height="28" class="plate-h" />
      <text x="70" y="158" class="txt-muted" font-size="11">水平板</text>

      <!-- 竖板 -->
      <rect x="60" y="40" width="28" height="128" class="plate-v" />
      <text x="48" y="90" class="txt-muted" font-size="11" transform="rotate(-90 48 90)">竖板</text>

      <!-- 角焊缝三角形 -->
      <polygon :points="weldPoints" class="weld-fill" />

      <!-- 喉厚 a -->
      <line :x1="throatX1" :y1="throatY1" :x2="throatX2" :y2="throatY2" stroke="#409eff" stroke-width="2" marker-end="url(#weld-arrow-blue)" />
      <text :x="throatX2 + 8" :y="throatY2 + 4" class="txt-primary" font-size="13">a = {{ throat.toFixed(2) }} mm</text>

      <!-- 焊脚 s -->
      <line :x1="legX1" :y1="legY1" :x2="legX2" :y2="legY2" class="dim" marker-end="url(#weld-arrow)" />
      <text :x="legX2 + 6" :y="legY2 - 4" class="txt" font-size="12">s = {{ legSize }} mm</text>

      <!-- 焊缝长度 L（透视） -->
      <line x1="120" y1="178" :x2="120 + lenPx" y2="178" class="dim-primary" marker-start="url(#weld-arrow-blue)" marker-end="url(#weld-arrow-blue)" />
      <text :x="120 + lenPx / 2" y="198" class="txt-primary" font-size="13" text-anchor="middle">L = {{ weldLength }} mm</text>

      <!-- 载荷 F -->
      <line x1="200" y1="70" x2="200" y2="110" stroke="#8b5cf6" stroke-width="2" marker-end="url(#weld-arrow-blue)" />
      <text x="210" y="92" fill="#8b5cf6" font-size="12">F</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt } = useDiagramI18n('weld')

const props = defineProps({
  legSize: { type: Number, default: 6 },
  weldLength: { type: Number, default: 100 },
  throat: { type: Number, default: 4.2 },
})

const px = computed(() => Math.min(28, props.legSize * 3.2))
const lenPx = computed(() => Math.min(200, Math.max(80, props.weldLength * 0.9)))

const baseX = 88
const baseY = 140
const weldPoints = computed(() => {
  const s = px.value
  return `${baseX},${baseY} ${baseX},${baseY - s} ${baseX + s},${baseY}`
})

const throatX1 = computed(() => baseX + px.value * 0.35)
const throatY1 = computed(() => baseY - px.value * 0.35)
const throatX2 = computed(() => baseX + px.value * 0.65)
const throatY2 = computed(() => baseY - px.value * 0.65)
const legX1 = baseX
const legY1 = baseY - px.value
const legX2 = baseX
const legY2 = baseY
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

.mech-diagram__svg .plate-h,
.mech-diagram__svg .plate-v {
  fill: rgba(148, 163, 184, 0.25);
  stroke: #64748b;
  stroke-width: 2;
}

.mech-diagram__svg .weld-fill {
  fill: rgba(245, 158, 11, 0.75);
  stroke: #d97706;
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
.mech-diagram__svg .txt-muted {
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt {
  fill: #334155;
}

.mech-diagram__svg .txt-primary {
  fill: #409eff;
}

.mech-diagram__svg .txt-muted {
  fill: #94a3b8;
}

.dark .mech-diagram__svg .txt {
  fill: #e2e8f0;
}
</style>
