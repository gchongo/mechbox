<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ variant === 'pneumatic' ? '气缸示意' : '液压缸示意' }}</h3>
      <p class="mech-diagram__hint">缸径 D、活塞杆 d、压力 p</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" aria-label="液压气缸参数示意图">
      <defs>
        <marker id="cy-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="cy-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 缸筒 -->
      <rect :x="barrelX" :y="barrelY" :width="barrelW" :height="barrelH" rx="4" class="barrel" />
      <!-- 活塞 -->
      <rect :x="pistonX" :y="barrelY + 8" :width="pistonW" :height="barrelH - 16" rx="2" class="piston" />
      <!-- 活塞杆 -->
      <rect :x="rodX" :y="cy - rodH / 2" :width="rodLen" :height="rodH" rx="2" class="rod" />

      <!-- 压力区 -->
      <rect :x="barrelX + 6" :y="barrelY + 10" :width="pistonX - barrelX - 6" :height="barrelH - 20" rx="2" class="pressure-zone" />
      <text :x="barrelX + (pistonX - barrelX) / 2" :y="cy + 4" class="txt-primary" font-size="13" text-anchor="middle">p</text>

      <!-- D -->
      <line :x1="barrelX" :y1="barrelY + barrelH + 18" :x2="barrelX + barrelW" :y2="barrelY + barrelH + 18" class="dim-primary" marker-start="url(#cy-arrow-blue)" marker-end="url(#cy-arrow-blue)" />
      <text :x="barrelX + barrelW / 2" :y="barrelY + barrelH + 34" class="txt-primary" font-size="12" text-anchor="middle">D = {{ boreDiameter }} mm</text>

      <!-- d -->
      <line :x1="rodX + rodLen" :y1="cy + rodH / 2 + 14" :x2="rodX + rodLen + rodH + 20" :y2="cy + rodH / 2 + 14" class="dim" marker-start="url(#cy-arrow)" marker-end="url(#cy-arrow)" />
      <text :x="rodX + rodLen + rodH / 2 + 10" :y="cy + rodH / 2 + 30" class="txt" font-size="12" text-anchor="middle">d = {{ rodDiameter }} mm</text>

      <!-- F+ -->
      <line :x1="rodX + rodLen + 30" :y1="cy" :x2="rodX + rodLen + 65" :y2="cy" stroke="#8b5cf6" stroke-width="2" marker-end="url(#cy-arrow-blue)" />
      <text :x="rodX + rodLen + 72" :y="cy + 4" fill="#8b5cf6" font-size="12">F⁺</text>

      <!-- stroke -->
      <line v-if="strokeLength > 0" :x1="pistonX + pistonW / 2" :y1="barrelY - 12" :x2="rodX + rodLen + 20" :y2="barrelY - 12" class="dim" stroke-dasharray="4 3" marker-start="url(#cy-arrow)" marker-end="url(#cy-arrow)" />
      <text v-if="strokeLength > 0" :x="(pistonX + rodX + rodLen + 20) / 2" :y="barrelY - 18" class="txt-muted" font-size="11" text-anchor="middle">行程 {{ strokeLength }} mm</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'hydraulic' },
  boreDiameter: { type: Number, default: 50 },
  rodDiameter: { type: Number, default: 20 },
  strokeLength: { type: Number, default: 0 },
})

const scale = computed(() => Math.min(2.2, 100 / Math.max(props.boreDiameter, 20)))
const barrelW = computed(() => props.boreDiameter * scale.value)
const barrelH = computed(() => Math.max(50, barrelW.value * 0.9))
const rodH = computed(() => Math.max(8, props.rodDiameter * scale.value * 0.6))
const rodLen = 70

const barrelX = 80
const barrelY = computed(() => 130 - barrelH.value / 2)
const cy = 130
const pistonW = 12
const pistonX = computed(() => barrelX + barrelW.value * 0.55)
const rodX = computed(() => pistonX.value + pistonW)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .barrel { fill: rgba(148,163,184,0.15); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .piston { fill: rgba(64,158,255,0.35); stroke: #409eff; stroke-width: 1.5; }
.mech-diagram__svg .rod { fill: #94a3b8; stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .pressure-zone { fill: rgba(64,158,255,0.12); stroke: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
</style>
