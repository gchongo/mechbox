<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">淬透性 / Jominy 示意</h3>
      <p class="mech-diagram__hint">端淬试棒截面，表面→心部硬度梯度</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" aria-label="热处理淬透性示意图">
      <defs>
        <linearGradient id="hrc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#409eff" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.3" />
        </linearGradient>
        <marker id="ht-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- Jominy 棒侧视 -->
      <rect x="60" y="100" width="200" height="36" rx="4" fill="url(#hrc-grad)" stroke="#64748b" stroke-width="2" />
      <text x="160" y="122" class="txt-muted" font-size="11" text-anchor="middle">水冷端 →</text>

      <!-- 截面 -->
      <text x="300" y="48" class="txt-muted" font-size="12">零件截面</text>
      <circle :cx="360" :cy="130" :r="rPart" class="part-ring" />
      <circle :cx="360" :cy="130" :r="rCore" class="core" />

      <!-- HRC 标注 -->
      <text :x="360 + rPart + 12" y="118" class="txt-primary" font-size="11">HRC_surface</text>
      <text :x="360 + rPart + 12" y="132" class="txt-sub" font-size="10">{{ surfaceHrc }}</text>
      <text :x="360" :y="130 + 6" class="txt" font-size="10" text-anchor="middle">{{ coreHrc }}</text>

      <!-- D -->
      <line :x1="360 - rPart" :y1="130 + rPart + 18" :x2="360 + rPart" :y2="130 + rPart + 18" class="dim-primary" marker-start="url(#ht-arrow-blue)" marker-end="url(#ht-arrow-blue)" />
      <text :x="360" :y="130 + rPart + 34" class="txt-primary" font-size="12" text-anchor="middle">D = {{ partDiameter }} mm</text>

      <!-- CE -->
      <text x="60" y="200" class="txt-muted" font-size="12">CE = {{ carbonEquivalent }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  partDiameter: { type: Number, default: 50 },
  carbonEquivalent: { type: Number, default: 0.45 },
  surfaceHrc: { type: Number, default: 55 },
  coreHrc: { type: Number, default: 35 },
})

const scale = computed(() => 55 / Math.max(props.partDiameter / 2, 1))
const rPart = computed(() => (props.partDiameter / 2) * scale.value)
const rCore = computed(() => rPart.value * 0.35)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .part-ring { fill: rgba(64,158,255,0.25); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .core { fill: rgba(148,163,184,0.35); stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-sub, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-sub { fill: #64748b; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
