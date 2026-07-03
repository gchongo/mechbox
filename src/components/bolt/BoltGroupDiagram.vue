<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint', { n: boltCount }))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="bg-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="bg-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="bg-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 法兰轮廓 -->
      <circle :cx="cx" :cy="cy" :r="rFlange" class="flange" />
      <circle :cx="cx" :cy="cy" :r="rCircle" fill="none" stroke="#409eff" stroke-width="1.5" stroke-dasharray="5 4" />

      <!-- 螺栓 -->
      <circle
        v-for="(b, i) in boltPositions"
        :key="i"
        :cx="b.x"
        :cy="b.y"
        :r="boltR"
        class="bolt"
        :class="{ 'bolt--critical': criticalIndex === i + 1 }"
      />
      <text
        v-for="(b, i) in boltPositions"
        :key="'l' + i"
        :x="b.x"
        :y="b.y + 4"
        font-size="9"
        text-anchor="middle"
        fill="#fff"
        font-weight="600"
      >{{ i + 1 }}</text>

      <!-- R -->
      <line :x1="cx" :y1="cy" :x2="cx + rCircle" :y2="cy" class="dim-primary" marker-end="url(#bg-arrow-blue)" />
      <SvgMathText :x="cx + rCircle / 2" :y="cy - 8" :text="dl('R', boltCircleRadius)" anchor="middle" class-name="txt-primary" color="#409eff" :width="120" :font-size="12" />

      <!-- Fx -->
      <line v-if="Math.abs(shearX) > 0" :x1="cx - 70" :y1="cy" :x2="cx - 20" :y2="cy" stroke="#8b5cf6" stroke-width="2" marker-end="url(#bg-arrow-purple)" />
      <SvgMathText v-if="Math.abs(shearX) > 0" :x="cx - 78" :y="cy + 4" text="F_x" anchor="end" color="#8b5cf6" :width="28" :font-size="11" />

      <!-- Fy -->
      <line v-if="Math.abs(shearY) > 0" :x1="cx" :y1="cy + 50" :x2="cx" :y2="cy + 90" stroke="#8b5cf6" stroke-width="2" marker-end="url(#bg-arrow-purple)" />
      <SvgMathText v-if="Math.abs(shearY) > 0" :x="cx + 8" :y="cy + 72" text="F_y" color="#8b5cf6" :width="28" :font-size="11" />

      <!-- M -->
      <path :d="`M ${cx + rFlange + 12} ${cy} A 18 18 0 1 1 ${cx + rFlange + 8} ${cy - 20}`" fill="none" stroke="#e6a23c" stroke-width="1.5" marker-end="url(#bg-arrow)" />
      <SvgMathText :x="cx + rFlange + 28" :y="cy + 4" text="M" color="#e6a23c" :width="20" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('boltGroup')

const props = defineProps({
  boltCount: { type: Number, default: 6 },
  boltCircleRadius: { type: Number, default: 50 },
  shearX: { type: Number, default: 0 },
  shearY: { type: Number, default: 5000 },
  moment: { type: Number, default: 0 },
  criticalIndex: { type: Number, default: 0 },
})

const cx = 220
const cy = 140
const scale = computed(() => 72 / Math.max(props.boltCircleRadius, 20))
const rCircle = computed(() => props.boltCircleRadius * scale.value)
const rFlange = computed(() => rCircle.value + 28)
const boltR = 9

const boltPositions = computed(() => {
  const n = Math.max(2, props.boltCount)
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n - Math.PI / 2
    pts.push({
      x: cx + rCircle.value * Math.cos(a),
      y: cy + rCircle.value * Math.sin(a),
    })
  }
  return pts
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .flange { fill: rgba(148,163,184,0.12); stroke: #94a3b8; stroke-width: 2; }
.mech-diagram__svg .bolt { fill: #64748b; stroke: #475569; stroke-width: 1; }
.mech-diagram__svg .bolt--critical { fill: #ef4444; stroke: #b91c1c; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt-primary { fill: #409eff; font-family: system-ui, sans-serif; }
</style>
