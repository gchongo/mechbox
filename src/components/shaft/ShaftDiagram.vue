<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ mode === 'combined' ? '弯扭合成轴示意' : '扭转轴示意' }}</h3>
      <p class="mech-diagram__hint">轴径 d{{ innerDiameter > 0 ? '、内径 dᵢ' : '' }}，{{ mode === 'combined' ? '弯矩 M + 扭矩 T' : '扭矩 T' }}</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" aria-label="轴强度参数示意图">
      <defs>
        <marker id="sh-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="sh-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="sh-arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <text x="24" y="28" class="txt-muted" font-size="13">径向截面</text>

      <!-- 截面 -->
      <circle :cx="cxSec" :cy="cySec" :r="rOuter" class="shaft-ring" />
      <circle v-if="rInner > 4" :cx="cxSec" :cy="cySec" :r="rInner" class="shaft-bore" />

      <!-- d -->
      <line :x1="cxSec - rOuter" :y1="cySec + rOuter + 18" :x2="cxSec + rOuter" :y2="cySec + rOuter + 18" class="dim-primary" marker-start="url(#sh-arrow-blue)" marker-end="url(#sh-arrow-blue)" />
      <text :x="cxSec" :y="cySec + rOuter + 34" class="txt-primary" font-size="13" text-anchor="middle">d = {{ diameter }} mm</text>

      <!-- 侧视轴 -->
      <text x="280" y="28" class="txt-muted" font-size="13">侧视</text>
      <rect :x="shaftX" :y="shaftY" :width="shaftLen" :height="shaftH" rx="3" class="shaft-bar" />

      <!-- T -->
      <path :d="`M ${shaftX - 20} ${shaftY + shaftH / 2} A 14 14 0 1 1 ${shaftX - 4} ${shaftY + shaftH / 2 - 12}`" fill="none" stroke="#8b5cf6" stroke-width="1.5" marker-end="url(#sh-arrow-purple)" />
      <text :x="shaftX - 32" :y="shaftY + shaftH / 2 + 4" fill="#8b5cf6" font-size="12">T</text>

      <!-- M (combined) -->
      <template v-if="mode === 'combined'">
        <path :d="`M ${shaftX + shaftLen + 16} ${shaftY + shaftH / 2} A 16 16 0 1 1 ${shaftX + shaftLen + 12} ${shaftY + shaftH / 2 - 18}`" fill="none" stroke="#e6a23c" stroke-width="1.5" marker-end="url(#sh-arrow)" />
        <text :x="shaftX + shaftLen + 28" :y="shaftY + shaftH / 2 + 4" fill="#e6a23c" font-size="12">M</text>
      </template>

      <!-- L -->
      <line v-if="mode === 'torsion' && length > 0" :x1="shaftX" :y1="shaftY + shaftH + 22" :x2="shaftX + shaftLen" :y2="shaftY + shaftH + 22" class="dim" marker-start="url(#sh-arrow)" marker-end="url(#sh-arrow)" />
      <text v-if="mode === 'torsion' && length > 0" :x="shaftX + shaftLen / 2" :y="shaftY + shaftH + 38" class="txt" font-size="12" text-anchor="middle">L = {{ length }} mm</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  diameter: { type: Number, default: 30 },
  innerDiameter: { type: Number, default: 0 },
  mode: { type: String, default: 'torsion' },
  length: { type: Number, default: 500 },
})

const cxSec = 120
const cySec = 130
const scale = computed(() => 55 / Math.max(props.diameter / 2, 1))
const rOuter = computed(() => (props.diameter / 2) * scale.value)
const rInner = computed(() => (props.innerDiameter / 2) * scale.value)

const shaftX = 280
const shaftY = 110
const shaftLen = 160
const shaftH = computed(() => Math.max(14, props.diameter * 0.5))
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .shaft-ring { fill: rgba(64,158,255,0.25); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .shaft-bore { fill: rgba(148,163,184,0.1); stroke: #94a3b8; stroke-width: 1.5; stroke-dasharray: 4 3; }
.mech-diagram__svg .shaft-bar { fill: rgba(148,163,184,0.3); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
