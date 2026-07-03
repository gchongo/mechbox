<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ title }}</h3>
      <p class="mech-diagram__hint">{{ hint }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="title">
      <defs>
        <marker id="st-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="st-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 管路 -->
      <template v-if="variant === 'pipe'">
        <rect x="80" y="110" width="280" height="40" rx="4" class="pipe-wall" />
        <rect x="88" y="118" width="264" height="24" rx="2" class="pipe-flow" />
        <path d="M 380 122 L 420 122 L 410 116 M 420 122 L 410 128" fill="none" stroke="#409eff" stroke-width="2" />
        <text x="425" y="126" class="txt-primary" font-size="12">Q</text>
        <line x1="80" y1="170" x2="360" y2="170" class="dim-primary" marker-start="url(#st-arrow-blue)" marker-end="url(#st-arrow-blue)" />
        <text x="220" y="186" class="txt-primary" font-size="12" text-anchor="middle">D = {{ diameter }} mm · L = {{ length }} m</text>
      </template>

      <!-- 薄板屈曲 -->
      <template v-else-if="variant === 'plate'">
        <rect x="100" y="90" width="280" height="plateH" rx="2" class="plate" />
        <path d="M 90 105 L 70 130 L 90 155" fill="none" stroke="#8b5cf6" stroke-width="2" marker-end="url(#st-arrow-blue)" />
        <path d="M 390 105 L 410 130 L 390 155" fill="none" stroke="#8b5cf6" stroke-width="2" marker-end="url(#st-arrow-blue)" />
        <line x1="100" y1="90 + plateH + 20" x2="380" y2="90 + plateH + 20" class="dim-primary" marker-start="url(#st-arrow-blue)" marker-end="url(#st-arrow-blue)" />
        <text x="240" :y="90 + plateH + 36" class="txt-primary" font-size="12" text-anchor="middle">a = {{ plateLength }} mm</text>
        <line x1="420" y1="90" x2="420" :y2="90 + plateH" class="dim" marker-start="url(#st-arrow)" marker-end="url(#st-arrow)" />
        <text x="432" :y="90 + plateH / 2 + 4" class="txt" font-size="12">t</text>
      </template>

      <!-- 模态 -->
      <template v-else>
        <rect x="180" y="180" width="120" height="12" class="base" />
        <line x1="240" y1="180" x2="240" y2="100" stroke="#64748b" stroke-width="3" />
        <rect x="210" y="88" width="60" height="24" rx="4" class="mass" />
        <path d="M 240 88 Q 260 60 240 40 Q 220 60 240 88" fill="none" stroke="#409eff" stroke-width="1.5" stroke-dasharray="4 3" />
        <text x="268" y="102" class="txt-primary" font-size="12">m</text>
        <text x="248" y="56" class="txt-muted" font-size="11">fn</text>
        <text x="320" y="130" class="txt-muted" font-size="12">f_exc = {{ excitationFreq }} Hz</text>
      </template>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'pipe' },
  diameter: { type: Number, default: 25 },
  length: { type: Number, default: 10 },
  plateLength: { type: Number, default: 400 },
  plateThickness: { type: Number, default: 2 },
  excitationFreq: { type: Number, default: 0 },
})

const plateH = computed(() => Math.max(16, props.plateThickness * 8))

const title = computed(() => {
  if (props.variant === 'pipe') return '管路压降示意'
  if (props.variant === 'plate') return '薄板屈曲示意'
  return '单自由度模态示意'
})

const hint = computed(() => {
  if (props.variant === 'pipe') return '内径 D、管长 L、流量 Q'
  if (props.variant === 'plate') return '板厚 t、受压边长 a'
  return '质量 m、刚度 k → 固有频率 fn'
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .pipe-wall { fill: rgba(148,163,184,0.2); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .pipe-flow { fill: rgba(64,158,255,0.25); stroke: #409eff; stroke-width: 1; }
.mech-diagram__svg .plate { fill: rgba(148,163,184,0.25); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .base { fill: #64748b; }
.mech-diagram__svg .mass { fill: rgba(64,158,255,0.35); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
