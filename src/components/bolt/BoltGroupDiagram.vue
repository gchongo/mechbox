<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 300" role="img" :aria-label="dt('aria')">
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
        <marker id="bg-arrow-amber" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
        </marker>
        <marker id="bg-arrow-red" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" />
        </marker>
      </defs>

      <!-- 法兰与分布圆 -->
      <circle :cx="cx" :cy="cy" :r="rFlange" class="flange" />
      <circle :cx="cx" :cy="cy" :r="rInner" class="flange-bore" />
      <circle :cx="cx" :cy="cy" :r="rCircle" fill="none" stroke="#409eff" stroke-width="1.5" stroke-dasharray="5 4" />

      <!-- 形心十字 -->
      <line :x1="cx - 8" :y1="cy" :x2="cx + 8" :y2="cy" class="center-cross" />
      <line :x1="cx" :y1="cy - 8" :x2="cx" :y2="cy + 8" class="center-cross" />

      <!-- 坐标轴示意 -->
      <line :x1="cx" :y1="cy" :x2="cx + axisLen" :y2="cy" class="axis" marker-end="url(#bg-arrow)" />
      <line :x1="cx" :y1="cy" :x2="cx" :y2="cy - axisLen" class="axis" marker-end="url(#bg-arrow)" />
      <text :x="cx + axisLen + 4" :y="cy + 4" class="txt-muted" font-size="10">x</text>
      <text :x="cx + 4" :y="cy - axisLen - 4" class="txt-muted" font-size="10">y</text>

      <!-- 螺栓 -->
      <g v-for="(b, i) in boltPositions" :key="'b-' + i">
        <circle
          :cx="b.sx"
          :cy="b.sy"
          :r="boltR"
          class="bolt"
          :class="{ 'bolt--critical': criticalIndex === i + 1 }"
        />
        <text
          :x="b.sx"
          :y="b.sy + 3.5"
          :font-size="boltFontSize"
          text-anchor="middle"
          fill="#fff"
          font-weight="600"
        >{{ i + 1 }}</text>
      </g>

      <!-- 危险栓剪力矢量（完整/专业有逐栓结果时） -->
      <template v-if="criticalBoltVec">
        <line
          :x1="criticalBoltVec.sx"
          :y1="criticalBoltVec.sy"
          :x2="criticalBoltVec.tx"
          :y2="criticalBoltVec.ty"
          stroke="#ef4444"
          stroke-width="2"
          marker-end="url(#bg-arrow-red)"
        />
        <SvgMathText
          :x="criticalBoltVec.lx"
          :y="criticalBoltVec.ly"
          :text="dt('criticalForce')"
          color="#ef4444"
          :width="72"
          :font-size="11"
        />
      </template>

      <!-- R：沿右下射线，避开坐标轴与载荷箭头 -->
      <line
        :x1="cx"
        :y1="cy"
        :x2="rDim.x2"
        :y2="rDim.y2"
        class="dim-primary"
        marker-end="url(#bg-arrow-blue)"
      />
      <SvgMathText
        :x="rDim.lx"
        :y="rDim.ly"
        text="R"
        anchor="middle"
        class-name="txt-primary"
        color="#409eff"
        :width="24"
        :font-size="12"
      />

      <!-- 形心合力 Fx / Fy（箭头旁仅符号，数值在右侧） -->
      <template v-if="showFx">
        <line
          :x1="fxArrow.x1"
          :y1="fxArrow.y1"
          :x2="fxArrow.x2"
          :y2="fxArrow.y2"
          stroke="#8b5cf6"
          stroke-width="2.2"
          marker-end="url(#bg-arrow-purple)"
        />
        <SvgMathText
          :x="fxArrow.lx"
          :y="fxArrow.ly"
          text="F_x"
          :anchor="fxArrow.anchor"
          color="#8b5cf6"
          :width="28"
          :font-size="11"
        />
      </template>
      <template v-if="showFy">
        <line
          :x1="fyArrow.x1"
          :y1="fyArrow.y1"
          :x2="fyArrow.x2"
          :y2="fyArrow.y2"
          stroke="#8b5cf6"
          stroke-width="2.2"
          marker-end="url(#bg-arrow-purple)"
        />
        <SvgMathText
          :x="fyArrow.lx"
          :y="fyArrow.ly"
          text="F_y"
          anchor="middle"
          color="#8b5cf6"
          :width="28"
          :font-size="11"
        />
      </template>

      <!-- 弯矩 M（右手系，正值逆时针） -->
      <template v-if="showM">
        <path :d="momentArc" fill="none" stroke="#e6a23c" stroke-width="1.8" marker-end="url(#bg-arrow-amber)" />
        <SvgMathText :x="momentLabel.x" :y="momentLabel.y" text="M" color="#e6a23c" :width="24" :font-size="12" />
      </template>

      <!-- 右侧数值面板（避免形心文字堆叠） -->
      <rect x="352" y="48" width="118" height="128" rx="6" class="value-panel" />
      <SvgMathText :x="362" :y="72" :text="labelR" color="#409eff" :width="108" :font-size="12" />
      <SvgMathText v-if="showFx" :x="362" :y="96" :text="labelFx" color="#8b5cf6" :width="108" :font-size="12" />
      <SvgMathText v-if="showFy" :x="362" :y="120" :text="labelFy" color="#8b5cf6" :width="108" :font-size="12" />
      <SvgMathText v-if="showM" :x="362" :y="144" :text="labelM" color="#e6a23c" :width="108" :font-size="12" />
      <text v-if="criticalIndex" x="362" y="168" class="txt-critical" font-size="11">
        {{ dt('criticalShort', { i: criticalIndex }) }}
      </text>

      <!-- 底部说明 -->
      <text x="16" y="288" class="txt-muted" font-size="11">{{ legendText }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'
import { generateCircleBoltPositions } from '@/utils/bolt-group-calc'

const { dt, dm, dl } = useDiagramI18n('boltGroup')

const props = defineProps({
  boltCount: { type: Number, default: 6 },
  boltCircleRadius: { type: Number, default: 50 },
  shearX: { type: Number, default: 0 },
  shearY: { type: Number, default: 5000 },
  moment: { type: Number, default: 0 },
  criticalIndex: { type: Number, default: 0 },
  /** 完整/专业逐栓结果，用于危险栓矢量 */
  bolts: { type: Array, default: () => [] },
})

const cx = 188
const cy = 142
const axisLen = 26

const n = computed(() => Math.min(Math.max(2, Math.round(props.boltCount || 2)), 24))
const scale = computed(() => 70 / Math.max(props.boltCircleRadius, 20))
const rCircle = computed(() => Math.min(props.boltCircleRadius * scale.value, 88))
const rFlange = computed(() => rCircle.value + 24)
const rInner = computed(() => Math.max(rCircle.value * 0.35, 14))
const boltR = computed(() => (n.value > 12 ? 7 : n.value > 8 ? 8 : 9))
const boltFontSize = computed(() => (n.value > 12 ? 8 : 9))

/** 与 analyzeBoltGroup 同一套极坐标（1 号栓在 +x） */
const boltPositions = computed(() => {
  const math = generateCircleBoltPositions(n.value, props.boltCircleRadius)
  return math.map((p) => ({
    x: p.x,
    y: p.y,
    sx: cx + p.x * scale.value,
    sy: cy - p.y * scale.value,
  }))
})

const showFx = computed(() => Math.abs(props.shearX) > 0)
const showFy = computed(() => Math.abs(props.shearY) > 0)
const showM = computed(() => Math.abs(props.moment) > 0)

const fRef = computed(() => Math.max(Math.abs(props.shearX), Math.abs(props.shearY), 1))

function arrowLen(f) {
  const cap = Math.min(rInner.value + 8, 36)
  return 16 + cap * (Math.abs(f) / fRef.value)
}

/** R 标注射线：右下 35°，避开 x 轴上的 Fx */
const rDim = computed(() => {
  const a = (-35 * Math.PI) / 180
  const x2 = cx + rCircle.value * Math.cos(a)
  const y2 = cy - rCircle.value * Math.sin(a)
  return {
    x2,
    y2,
    lx: cx + (rCircle.value * 0.55) * Math.cos(a) + 10,
    ly: cy - (rCircle.value * 0.55) * Math.sin(a) + 14,
  }
})

/** Fx：形心偏下水平，正值向右；符号标在箭头外侧 */
const fxArrow = computed(() => {
  const len = arrowLen(props.shearX)
  const dir = props.shearX >= 0 ? 1 : -1
  const y = cy + 14
  const x1 = cx - dir * 6
  const x2 = cx + dir * len
  return {
    x1,
    y1: y,
    x2,
    y2: y,
    lx: dir > 0 ? x2 + 6 : x2 - 6,
    ly: y + 4,
    anchor: dir > 0 ? 'start' : 'end',
  }
})

/** Fy：形心偏左竖直，正值向上；符号标在箭头顶端外侧 */
const fyArrow = computed(() => {
  const len = arrowLen(props.shearY)
  const dir = props.shearY >= 0 ? 1 : -1
  const x = cx - 14
  const y1 = cy + dir * 6
  const y2 = cy - dir * len
  return {
    x1: x,
    y1,
    x2: x,
    y2,
    lx: x,
    ly: dir > 0 ? y2 - 4 : y2 + 14,
  }
})

const momentArc = computed(() => {
  const r = rFlange.value + 14
  // 放在左上象限，避开右侧数值面板
  const a0 = (100 * Math.PI) / 180
  const a1 = (200 * Math.PI) / 180
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy - r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy - r * Math.sin(a1)
  if (props.moment >= 0) {
    return `M ${x0} ${y0} A ${r} ${r} 0 0 0 ${x1} ${y1}`
  }
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x0} ${y0}`
})

const momentLabel = computed(() => {
  const r = rFlange.value + 14
  const a = (150 * Math.PI) / 180
  return {
    x: cx + (r + 10) * Math.cos(a) - 8,
    y: cy - (r + 10) * Math.sin(a) + 4,
  }
})

const criticalBoltVec = computed(() => {
  if (!props.criticalIndex || !props.bolts?.length) return null
  const b = props.bolts.find((x) => x.index === props.criticalIndex)
  const pos = boltPositions.value[props.criticalIndex - 1]
  if (!b || !pos) return null
  const mag = Math.hypot(b.fx ?? 0, b.fy ?? 0)
  if (!(mag > 0)) return null
  const len = 22
  // 数学坐标 (fx, fy) → 屏幕位移
  const ux = ((b.fx ?? 0) / mag) * len
  const uy = -((b.fy ?? 0) / mag) * len
  return {
    sx: pos.sx,
    sy: pos.sy,
    tx: pos.sx + ux,
    ty: pos.sy + uy,
    lx: pos.sx + ux * 1.4 + (ux >= 0 ? 8 : -40),
    ly: pos.sy + uy * 1.4 + (uy >= 0 ? 14 : -4),
  }
})

const labelR = computed(() => dl('R', props.boltCircleRadius))
const labelFx = computed(() => `$F_x = ${fmtN(props.shearX)}\\,\\mathrm{N}$`)
const labelFy = computed(() => `$F_y = ${fmtN(props.shearY)}\\,\\mathrm{N}$`)
const labelM = computed(() => `$M = ${fmtM(props.moment)}\\,\\mathrm{N\\cdot mm}$`)

const hintText = computed(() =>
  dt('hint', {
    n: n.value,
    R: props.boltCircleRadius,
    critical: props.criticalIndex || '—',
  }),
)

const legendText = computed(() => {
  if (props.criticalIndex) return dt('legendCritical', { i: props.criticalIndex })
  return dt('legendBase')
})

function fmtN(v) {
  const n0 = Number(v) || 0
  return Math.abs(n0) >= 1000 ? n0.toFixed(0) : n0.toFixed(0)
}

function fmtM(v) {
  const n0 = Number(v) || 0
  return String(Math.round(n0))
}
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .flange { fill: rgba(148,163,184,0.14); stroke: #94a3b8; stroke-width: 2; }
.mech-diagram__svg .flange-bore { fill: #f8fafc; stroke: #cbd5e1; stroke-width: 1.2; }
.dark .mech-diagram__svg .flange-bore { fill: #0f172a; }
.mech-diagram__svg .bolt { fill: #64748b; stroke: #475569; stroke-width: 1; }
.mech-diagram__svg .bolt--critical { fill: #ef4444; stroke: #b91c1c; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .center-cross { stroke: #94a3b8; stroke-width: 1.2; }
.mech-diagram__svg .axis { stroke: #94a3b8; stroke-width: 1; fill: none; opacity: 0.7; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-critical { fill: #ef4444; }
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
