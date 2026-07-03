<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">S-N 曲线示意</h3>
      <p class="mech-diagram__hint">应力幅 S<sub>a</sub> 与疲劳极限 σ₋₁ = {{ enduranceLimit }} MPa</p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" aria-label="S-N 疲劳曲线示意图">
      <defs>
        <marker id="ft-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="ft-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 坐标轴 -->
      <line x1="70" y1="210" x2="430" y2="210" class="axis" marker-end="url(#ft-arrow)" />
      <line x1="70" y1="210" x2="70" y2="40" class="axis" marker-end="url(#ft-arrow)" />
      <text x="420" y="228" class="txt-muted" font-size="12">N (log)</text>
      <text x="28" y="48" class="txt-muted" font-size="12">S</text>

      <!-- 疲劳极限 -->
      <line x1="70" :y1="enduranceY" x2="430" :y2="enduranceY" stroke="#e6a23c" stroke-width="1.5" stroke-dasharray="6 4" />
      <text x="432" :y="enduranceY + 4" fill="#e6a23c" font-size="11">σ₋₁</text>

      <!-- S-N 斜线 -->
      <line x1="120" y1="60" x2="380" :y2="enduranceY" stroke="#409eff" stroke-width="2" />

      <!-- 工作点 -->
      <circle :cx="stressX" :cy="stressY" r="6" class="stress-point" />
      <line :x1="70" :y1="stressY" x2="stressX" y2="stressY" class="dim" stroke-dasharray="3 3" />
      <line :x1="stressX" :y1="stressY" x2="stressX" y2="210" class="dim" stroke-dasharray="3 3" />

      <text :x="78" :y="stressY + 4" class="txt-primary" font-size="12">S_a</text>
      <text :x="78" :y="stressY + 16" class="txt-sub" font-size="10">{{ stressAmplitude }} MPa</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stressAmplitude: { type: Number, default: 300 },
  enduranceLimit: { type: Number, default: 200 },
})

const maxS = computed(() => Math.max(props.enduranceLimit * 1.8, props.stressAmplitude * 1.2, 1))
const enduranceY = computed(() => 210 - (props.enduranceLimit / maxS.value) * 150)
const stressY = computed(() => 210 - (Math.min(props.stressAmplitude, maxS.value) / maxS.value) * 150)
const stressX = computed(() => {
  if (props.stressAmplitude <= props.enduranceLimit) return 360
  const ratio = (props.stressAmplitude - props.enduranceLimit) / (maxS.value - props.enduranceLimit)
  return 380 - ratio * 200
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .axis { stroke: #64748b; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #94a3b8; stroke-width: 1; fill: none; }
.mech-diagram__svg .stress-point { fill: #ef4444; stroke: #b91c1c; stroke-width: 2; }
.mech-diagram__svg .txt-primary { fill: #409eff; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-sub { fill: #64748b; font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; font-family: system-ui, sans-serif; }
</style>
