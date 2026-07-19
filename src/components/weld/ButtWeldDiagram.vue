<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="butt-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="butt-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="butt-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
        <marker id="butt-arrow-violet-start" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="#8b5cf6" />
        </marker>
        <pattern id="butt-hatch" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(40)">
          <line x1="0" y1="0" x2="0" y2="5" stroke="#d97706" stroke-width="1.4" opacity="0.5" />
        </pattern>
      </defs>

      <!-- 左板 -->
      <rect :x="leftPlate.x" :y="plateY" :width="leftPlate.w" :height="tPx" class="plate" />
      <text :x="leftPlate.x + 10" :y="plateY + tPx / 2 + 4" class="txt-muted" font-size="11">{{ dt('leftPlate') }}</text>

      <!-- 右板 -->
      <rect :x="rightPlate.x" :y="plateY" :width="rightPlate.w" :height="tPx" class="plate" />
      <text :x="rightPlate.x + rightPlate.w - 10" :y="plateY + tPx / 2 + 4" class="txt-muted" font-size="11" text-anchor="end">{{ dt('rightPlate') }}</text>

      <!-- 焊缝区（熔透） -->
      <rect :x="weld.x" :y="weld.y" :width="weld.w" :height="weld.h" class="weld-fill" />
      <rect :x="weld.x" :y="weld.y" :width="weld.w" :height="weld.h" fill="url(#butt-hatch)" />
      <!-- 余高示意 -->
      <path :d="capPath" class="weld-cap" />

      <!-- 未熔透阴影（η<1） -->
      <rect
        v-if="showPartial"
        :x="weld.x"
        :y="plateY + tePx"
        :width="weld.w"
        :height="Math.max(tPx - tePx, 0)"
        class="unfused"
      />

      <!-- 板厚 t -->
      <line
        :x1="tDim.x"
        :y1="plateY"
        :x2="tDim.x"
        :y2="plateY + tPx"
        class="dim-primary"
        marker-start="url(#butt-arrow-blue)"
        marker-end="url(#butt-arrow-blue)"
      />
      <SvgMathText :x="tDim.x - 8" :y="plateY + tPx / 2 + 4" text="t" anchor="end" color="#409eff" :width="20" :font-size="12" />

      <!-- 有效厚度 t_e = η t（专业且 η<1） -->
      <template v-if="showPartial">
        <line
          :x1="teDim.x"
          :y1="plateY"
          :x2="teDim.x"
          :y2="plateY + tePx"
          stroke="#e6a23c"
          stroke-width="1.5"
          marker-start="url(#butt-arrow)"
          marker-end="url(#butt-arrow)"
        />
        <SvgMathText :x="teDim.x + 6" :y="plateY + tePx / 2 + 4" text="$t_e$" color="#e6a23c" :width="28" :font-size="11" />
      </template>

      <!-- 焊缝长 L（透视：板厚方向出纸面用底部尺寸表示计算长度） -->
      <line
        :x1="lenDim.x1"
        :y1="lenDim.y"
        :x2="lenDim.x2"
        :y2="lenDim.y"
        class="dim-primary"
        marker-start="url(#butt-arrow-blue)"
        marker-end="url(#butt-arrow-blue)"
      />
      <SvgMathText :x="(lenDim.x1 + lenDim.x2) / 2" :y="lenDim.y + 16" text="L" anchor="middle" color="#409eff" :width="24" :font-size="12" />

      <!-- 轴向拉力 F（左右外拉） -->
      <line
        :x1="fLeft.x1"
        :y1="fLeft.y"
        :x2="fLeft.x2"
        :y2="fLeft.y"
        stroke="#8b5cf6"
        stroke-width="2.2"
        marker-end="url(#butt-arrow-violet-start)"
      />
      <line
        :x1="fRight.x1"
        :y1="fRight.y"
        :x2="fRight.x2"
        :y2="fRight.y"
        stroke="#8b5cf6"
        stroke-width="2.2"
        marker-end="url(#butt-arrow-violet)"
      />
      <SvgMathText :x="fLeft.x2 - 4" :y="fLeft.y - 8" text="F" anchor="end" color="#8b5cf6" :width="20" :font-size="12" />
      <SvgMathText :x="fRight.x2 + 4" :y="fRight.y - 8" text="F" color="#8b5cf6" :width="20" :font-size="12" />

      <!-- 右侧数值面板 -->
      <rect x="348" y="28" :width="120" :height="panelH" rx="6" class="value-panel" />
      <SvgMathText :x="358" :y="52" :text="labelT" color="#409eff" :width="104" :font-size="12" />
      <SvgMathText :x="358" :y="76" :text="labelL" color="#409eff" :width="104" :font-size="12" />
      <SvgMathText v-if="force > 0" :x="358" :y="100" :text="labelF" color="#8b5cf6" :width="104" :font-size="12" />
      <SvgMathText v-if="showEta" :x="358" :y="124" :text="labelEta" color="#e6a23c" :width="104" :font-size="12" />
      <SvgMathText v-if="showEta" :x="358" :y="148" :text="labelTe" color="#e6a23c" :width="104" :font-size="12" />
      <SvgMathText v-if="showKf" :x="358" :y="showEta ? 172 : 124" :text="labelKf" color="#94a3b8" :width="104" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('buttWeld')

const props = defineProps({
  thickness: { type: Number, default: 8 },
  weldLength: { type: Number, default: 100 },
  force: { type: Number, default: 0 },
  penetrationEfficiency: { type: Number, default: 1 },
  stressConcentration: { type: Number, default: 0 },
  showPenetration: { type: Boolean, default: false },
})

const t = computed(() => Math.max(props.thickness || 1, 1))
const L = computed(() => Math.max(props.weldLength || 1, 1))
const eta = computed(() => {
  const e = props.penetrationEfficiency
  if (!(e > 0)) return 1
  return Math.min(Math.max(e, 0.5), 1)
})
const showEta = computed(() => props.showPenetration)
const showPartial = computed(() => showEta.value && eta.value < 0.999)
const showKf = computed(() => props.showPenetration && props.stressConcentration > 1)
const te = computed(() => t.value * eta.value)

const tPx = computed(() => Math.min(Math.max(t.value * 3.2, 22), 52))
const tePx = computed(() => tPx.value * (te.value / t.value))
const lenPx = computed(() => Math.min(Math.max(L.value * 0.85, 60), 140))

const plateY = computed(() => 88 + (52 - tPx.value) / 2)
const weldW = 36
const midX = 168

const leftPlate = computed(() => ({
  x: midX - weldW / 2 - 110,
  w: 110,
}))
const rightPlate = computed(() => ({
  x: midX + weldW / 2,
  w: 110,
}))
const weld = computed(() => ({
  x: midX - weldW / 2,
  y: plateY.value,
  w: weldW,
  h: tPx.value,
}))

const capPath = computed(() => {
  const x0 = weld.value.x
  const x1 = weld.value.x + weld.value.w
  const y = plateY.value
  const mid = (x0 + x1) / 2
  return `M ${x0} ${y} Q ${mid} ${y - 7} ${x1} ${y}`
})

const tDim = computed(() => ({ x: leftPlate.value.x - 16 }))
const teDim = computed(() => ({ x: midX + weldW / 2 + 14 }))
const lenDim = computed(() => ({
  x1: midX - lenPx.value / 2,
  x2: midX + lenPx.value / 2,
  y: plateY.value + tPx.value + 36,
}))

const fLeft = computed(() => ({
  x1: leftPlate.value.x + 8,
  x2: leftPlate.value.x - 28,
  y: plateY.value + tPx.value / 2,
}))
const fRight = computed(() => ({
  x1: rightPlate.value.x + rightPlate.value.w - 8,
  x2: rightPlate.value.x + rightPlate.value.w + 28,
  y: plateY.value + tPx.value / 2,
}))

const panelH = computed(() => {
  let h = 88
  if (props.force > 0) h += 24
  if (showEta.value) h += 48
  if (showKf.value) h += 24
  return h
})

const labelT = computed(() => `$t = ${t.value}\\,\\mathrm{mm}$`)
const labelL = computed(() => `$L = ${L.value}\\,\\mathrm{mm}$`)
const labelF = computed(() => `$F = ${Math.round(props.force)}\\,\\mathrm{N}$`)
const labelEta = computed(() => `$\\eta = ${eta.value.toFixed(2)}$`)
const labelTe = computed(() => `$t_e = \\eta t = ${te.value.toFixed(1)}\\,\\mathrm{mm}$`)
const labelKf = computed(() => `$K_f = ${Number(props.stressConcentration).toFixed(1)}$`)

const hintText = computed(() => {
  if (showPartial.value) {
    return dt('hintPartial', {
      t: t.value,
      L: L.value,
      eta: eta.value.toFixed(2),
      te: te.value.toFixed(1),
    })
  }
  return dt('hint', { t: t.value, L: L.value })
})
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
  fill: rgba(245, 158, 11, 0.45);
  stroke: #d97706;
  stroke-width: 1.5;
}
.mech-diagram__svg .weld-cap {
  fill: none;
  stroke: #d97706;
  stroke-width: 1.6;
}
.mech-diagram__svg .unfused {
  fill: rgba(148, 163, 184, 0.55);
  stroke: none;
}
.mech-diagram__svg .dim-primary {
  stroke: #409eff;
  stroke-width: 1.5;
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
