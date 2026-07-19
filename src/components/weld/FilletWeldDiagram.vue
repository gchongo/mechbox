<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="weld-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="weld-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="weld-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
        <pattern id="weld-hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#d97706" stroke-width="1.5" opacity="0.55" />
        </pattern>
      </defs>

      <!-- 水平板 -->
      <rect :x="hPlate.x" :y="hPlate.y" :width="hPlate.w" :height="hPlate.h" class="plate" />
      <text :x="hPlate.x + 12" :y="hPlate.y + 18" class="txt-muted" font-size="11">{{ dt('horizPlate') }}</text>

      <!-- 竖板 -->
      <rect :x="vPlate.x" :y="vPlate.y" :width="vPlate.w" :height="vPlate.h" class="plate" />
      <text
        :x="vPlate.x - 10"
        :y="vPlate.y + vPlate.h / 2"
        class="txt-muted"
        font-size="11"
        :transform="`rotate(-90 ${vPlate.x - 10} ${vPlate.y + vPlate.h / 2})`"
      >{{ dt('vertPlate') }}</text>

      <!-- 角焊缝 -->
      <polygon :points="weldPoints" class="weld-fill" />
      <polygon :points="weldPoints" fill="url(#weld-hatch)" />
      <!-- 焊缝自由边（斜边） -->
      <line :x1="corner.x" :y1="corner.y - sPx" :x2="corner.x + sPx" :y2="corner.y" class="weld-face" />

      <!-- 焊脚 h_f：竖向尺寸（左侧） -->
      <line
        :x1="sVert.x"
        :y1="sVert.y1"
        :x2="sVert.x"
        :y2="sVert.y2"
        class="dim"
        marker-start="url(#weld-arrow)"
        marker-end="url(#weld-arrow)"
      />
      <line :x1="sVert.x - 4" :y1="sVert.y1" :x2="sVert.x + 4" :y2="sVert.y1" class="ext-line" />
      <line :x1="sVert.x - 4" :y1="sVert.y2" :x2="sVert.x + 4" :y2="sVert.y2" class="ext-line" />
      <SvgMathText :x="sVert.x - 8" :y="(sVert.y1 + sVert.y2) / 2 + 4" text="h_f" anchor="end" color="#64748b" :width="28" :font-size="12" />

      <!-- 焊脚 h_f：水平尺寸（下方引出） -->
      <line
        :x1="sHoriz.x1"
        :y1="sHoriz.y"
        :x2="sHoriz.x2"
        :y2="sHoriz.y"
        class="dim"
        marker-start="url(#weld-arrow)"
        marker-end="url(#weld-arrow)"
      />
      <SvgMathText :x="(sHoriz.x1 + sHoriz.x2) / 2" :y="sHoriz.y + 16" text="h_f" anchor="middle" color="#64748b" :width="28" :font-size="12" />

      <!-- 喉厚 a：斜边上垂线方向 -->
      <line
        :x1="throat.x1"
        :y1="throat.y1"
        :x2="throat.x2"
        :y2="throat.y2"
        class="dim-primary"
        marker-end="url(#weld-arrow-blue)"
      />
      <SvgMathText :x="throat.lx" :y="throat.ly" text="a" color="#409eff" :width="20" :font-size="12" />

      <!-- 焊缝长度 L -->
      <line
        :x1="lenDim.x1"
        :y1="lenDim.y"
        :x2="lenDim.x2"
        :y2="lenDim.y"
        class="dim-primary"
        marker-start="url(#weld-arrow-blue)"
        marker-end="url(#weld-arrow-blue)"
      />
      <SvgMathText
        :x="(lenDim.x1 + lenDim.x2) / 2"
        :y="lenDim.y + 18"
        text="L"
        anchor="middle"
        color="#409eff"
        :width="24"
        :font-size="12"
      />

      <!-- 载荷 F -->
      <line
        :x1="forceArrow.x"
        :y1="forceArrow.y1"
        :x2="forceArrow.x"
        :y2="forceArrow.y2"
        stroke="#8b5cf6"
        stroke-width="2.2"
        marker-end="url(#weld-arrow-violet)"
      />
      <SvgMathText :x="forceArrow.x + 8" :y="forceArrow.y1 + 16" text="F" color="#8b5cf6" :width="20" :font-size="12" />

      <!-- 偏心 e（专业） -->
      <template v-if="showE">
        <line
          :x1="eDim.x1"
          :y1="eDim.y"
          :x2="eDim.x2"
          :y2="eDim.y"
          stroke="#e6a23c"
          stroke-width="1.4"
          stroke-dasharray="4 3"
          marker-start="url(#weld-arrow)"
          marker-end="url(#weld-arrow)"
        />
        <SvgMathText :x="(eDim.x1 + eDim.x2) / 2" :y="eDim.y - 6" text="e" anchor="middle" color="#e6a23c" :width="20" :font-size="11" />
      </template>

      <!-- 右侧数值面板 -->
      <rect x="340" y="36" width="128" height="showE ? 132 : 108" rx="6" class="value-panel" />
      <SvgMathText :x="350" :y="60" :text="labelHf" color="#64748b" :width="110" :font-size="12" />
      <SvgMathText :x="350" :y="84" :text="labelA" color="#409eff" :width="110" :font-size="12" />
      <SvgMathText :x="350" :y="108" :text="labelL" color="#409eff" :width="110" :font-size="12" />
      <SvgMathText v-if="force > 0" :x="350" :y="132" :text="labelF" color="#8b5cf6" :width="110" :font-size="12" />
      <SvgMathText v-if="showE" :x="350" :y="156" :text="labelE" color="#e6a23c" :width="110" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('weld')

const props = defineProps({
  legSize: { type: Number, default: 6 },
  weldLength: { type: Number, default: 100 },
  throat: { type: Number, default: 4.2 },
  force: { type: Number, default: 0 },
  eccentricity: { type: Number, default: 0 },
})

const hf = computed(() => Math.max(props.legSize || 1, 1))
const a = computed(() => (props.throat > 0 ? props.throat : hf.value * 0.7))
const L = computed(() => Math.max(props.weldLength || 1, 1))
const showE = computed(() => props.eccentricity > 0)

/** 焊脚像素：随 h_f 变化，限制在可读范围 */
const sPx = computed(() => Math.min(Math.max(hf.value * 4.2, 22), 48))
const lenPx = computed(() => Math.min(Math.max(L.value * 1.1, 70), 180))

const corner = { x: 118, y: 148 }
const plateT = 26

const vPlate = computed(() => ({
  x: corner.x - plateT,
  y: corner.y - 110,
  w: plateT,
  h: 110 + plateT / 2,
}))
const hPlate = computed(() => ({
  x: corner.x - plateT,
  y: corner.y,
  w: 40 + lenPx.value + 40,
  h: plateT,
}))

const weldPoints = computed(() => {
  const s0 = sPx.value
  const { x, y } = corner
  return `${x},${y} ${x},${y - s0} ${x + s0},${y}`
})

/** 竖向焊脚尺寸线 */
const sVert = computed(() => ({
  x: corner.x - plateT - 18,
  y1: corner.y - sPx.value,
  y2: corner.y,
}))

/** 水平焊脚尺寸线（板下方） */
const sHoriz = computed(() => ({
  x1: corner.x,
  x2: corner.x + sPx.value,
  y: corner.y + plateT + 16,
}))

/** 喉厚：从直角顶点指向斜边中点 */
const throat = computed(() => {
  const s0 = sPx.value
  const midX = corner.x + s0 / 2
  const midY = corner.y - s0 / 2
  // 斜边法向（指向焊缝内部）：(-1,-1) 归一化
  const nx = -Math.SQRT1_2
  const ny = -Math.SQRT1_2
  // 喉厚线：从斜边中点向内到约 a/s 比例处
  const t = Math.min(Math.max(a.value / hf.value, 0.35), 0.85)
  const x1 = midX
  const y1 = midY
  const x2 = midX + nx * s0 * t * 0.55
  const y2 = midY + ny * s0 * t * 0.55
  return {
    x1,
    y1,
    x2,
    y2,
    lx: midX + 14,
    ly: midY - 10,
  }
})

const lenDim = computed(() => ({
  x1: corner.x + 8,
  x2: corner.x + 8 + lenPx.value,
  y: corner.y + plateT + 40,
}))

const forceArrow = computed(() => {
  const x = corner.x + Math.min(lenPx.value * 0.55, 90)
  return { x, y1: corner.y - 58, y2: corner.y - 8 }
})

const eDim = computed(() => {
  const xWeld = corner.x + sPx.value * 0.35
  const xF = forceArrow.value.x
  return {
    x1: Math.min(xWeld, xF),
    x2: Math.max(xWeld, xF),
    y: corner.y - 36,
  }
})

const labelHf = computed(() => `$h_f = ${hf.value}\\,\\mathrm{mm}$`)
const labelA = computed(() => `$a = ${a.value.toFixed(2)}\\,\\mathrm{mm}$`)
const labelL = computed(() => `$L = ${L.value}\\,\\mathrm{mm}$`)
const labelF = computed(() => `$F = ${Math.round(props.force)}\\,\\mathrm{N}$`)
const labelE = computed(() => `$e = ${props.eccentricity}\\,\\mathrm{mm}$`)

const hintText = computed(() =>
  dt('hint', {
    hf: hf.value,
    a: a.value.toFixed(2),
    L: L.value,
  }),
)
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .plate {
  fill: rgba(148, 163, 184, 0.28);
  stroke: #64748b;
  stroke-width: 2;
}
.mech-diagram__svg .weld-fill {
  fill: rgba(245, 158, 11, 0.55);
  stroke: #d97706;
  stroke-width: 1.5;
}
.mech-diagram__svg .weld-face {
  stroke: #b45309;
  stroke-width: 1.8;
  fill: none;
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
.mech-diagram__svg .ext-line {
  stroke: #94a3b8;
  stroke-width: 1;
  fill: none;
}
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .value-panel {
  fill: rgba(255, 255, 255, 0.92);
  stroke: #e2e8f0;
  stroke-width: 1;
}
.dark .mech-diagram__svg .value-panel {
  fill: rgba(15, 23, 42, 0.88);
  stroke: #334155;
}
</style>
