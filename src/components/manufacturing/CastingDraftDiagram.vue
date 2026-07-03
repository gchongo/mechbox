<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">拔模斜度示意</h3>
      <p class="mech-diagram__hint">拔模高度 h、推荐拔模角 α</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 240" role="img" aria-label="铸造拔模斜度示意图">
      <defs>
        <marker id="cd-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="cd-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 型腔侧壁（带拔模） -->
      <polygon :points="cavityPoints" class="cavity" />
      <line x1="120" y1="200" x2="360" y2="200" class="parting-line" />
      <text x="365" y="204" class="txt-muted" font-size="11">分型面</text>

      <!-- h -->
      <line x1="95" :y1="topY" x2="95" y2="200" class="dim-primary" marker-start="url(#cd-arrow-blue)" marker-end="url(#cd-arrow-blue)" />
      <text x="78" :y="(topY + 200) / 2 + 4" class="txt-primary" font-size="12" text-anchor="end">h</text>
      <text x="78" :y="(topY + 200) / 2 + 18" class="txt-sub" font-size="11" text-anchor="end">{{ depth }} mm</text>

      <!-- α -->
      <path :d="angleArc" fill="none" stroke="#e6a23c" stroke-width="1.5" />
      <text :x="130" :y="topY + 28" fill="#e6a23c" font-size="13">α = {{ draftAngle.toFixed(2) }}°</text>

      <!-- 增量 -->
      <line :x1="200" y1="200" :x2="200 + draftPx" y2="200" stroke="#409eff" stroke-width="2" marker-end="url(#cd-arrow-blue)" />
      <text :x="200 + draftPx / 2" y="192" class="txt-primary" font-size="11" text-anchor="middle">Δ</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  depth: { type: Number, default: 80 },
  draftAngle: { type: Number, default: 1.5 },
  linearIncrease: { type: Number, default: 1.2 },
})

const hPx = computed(() => Math.min(140, Math.max(60, props.depth * 1.2)))
const topY = computed(() => 200 - hPx.value)
const draftPx = computed(() => Math.max(12, props.linearIncrease * 8))
const tilt = computed(() => Math.tan((props.draftAngle * Math.PI) / 180) * hPx.value)

const cavityPoints = computed(() => {
  const top = topY.value
  const bot = 200
  const left = 120
  const right = 280
  return `${left},${bot} ${left + tilt.value},${top} ${right - tilt.value},${top} ${right},${bot}`
})

const angleArc = computed(() => {
  const x = 120 + tilt.value
  const y = topY.value
  const r = 28
  return `M ${x + r} ${y} A ${r} ${r} 0 0 1 ${x} ${y + r}`
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .cavity { fill: rgba(148,163,184,0.25); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .parting-line { stroke: #ef4444; stroke-width: 1.5; stroke-dasharray: 5 4; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-sub, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-sub { fill: #64748b; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
</style>
