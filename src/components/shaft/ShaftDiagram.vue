<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ mode === 'combined' ? dt('titleCombined') : dt('titleTorsion') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 300" role="img" :aria-label="dt('aria')">
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
        <marker id="sh-arrow-amber" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
        </marker>
      </defs>

      <!-- 径向截面 -->
      <text x="16" y="22" class="txt-muted" font-size="11">{{ dt('radialSection') }}</text>
      <circle :cx="cxSec" :cy="cySec" :r="rOuter" class="shaft-ring" />
      <circle v-if="rInner > 4" :cx="cxSec" :cy="cySec" :r="rInner" class="shaft-bore" />

      <!-- 截面扭矩弧 -->
      <path :d="secTorqueArc" fill="none" stroke="#8b5cf6" stroke-width="1.6" marker-end="url(#sh-arrow-purple)" />
      <SvgMathText :x="cxSec + rOuter + 6" :y="cySec - rOuter * 0.5" text="T" color="#8b5cf6" :width="18" :font-size="12" />

      <line
        :x1="cxSec - rOuter"
        :y1="cySec + rOuter + 16"
        :x2="cxSec + rOuter"
        :y2="cySec + rOuter + 16"
        class="dim-primary"
        marker-start="url(#sh-arrow-blue)"
        marker-end="url(#sh-arrow-blue)"
      />
      <SvgMathText :x="cxSec" :y="cySec + rOuter + 32" text="d" anchor="middle" color="#409eff" :width="20" :font-size="12" />

      <template v-if="rInner > 4">
        <line
          :x1="cxSec - rInner"
          :y1="cySec - 4"
          :x2="cxSec + rInner"
          :y2="cySec - 4"
          class="dim"
          marker-start="url(#sh-arrow)"
          marker-end="url(#sh-arrow)"
        />
        <SvgMathText :x="cxSec" :y="cySec - 10" text="d_i" anchor="middle" color="#64748b" :width="28" :font-size="11" />
      </template>

      <!-- 侧视：固定槽宽，L 比例缩放 -->
      <text :x="sideLeft" y="22" class="txt-muted" font-size="11">{{ dt('sideView') }}</text>
      <rect :x="shaftX" :y="shaftY" :width="shaftLen" :height="shaftH" rx="3" class="shaft-bar" />

      <!-- 端面中心线 -->
      <line :x1="shaftX" :y1="shaftY - 6" :x2="shaftX" :y2="shaftY + shaftH + 6" class="center-tick" />
      <line
        :x1="shaftX + shaftLen"
        :y1="shaftY - 6"
        :x2="shaftX + shaftLen"
        :y2="shaftY + shaftH + 6"
        class="center-tick"
      />

      <path :d="sideTorqueArc" fill="none" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#sh-arrow-purple)" />
      <SvgMathText :x="shaftX + 4" :y="shaftY - 8" text="T" color="#8b5cf6" :width="18" :font-size="12" />

      <template v-if="mode === 'combined'">
        <!-- 弯矩：竖直向下载荷示意 + M 弧 -->
        <line
          :x1="shaftX + shaftLen * 0.55"
          :y1="shaftY - 36"
          :x2="shaftX + shaftLen * 0.55"
          :y2="shaftY - 6"
          stroke="#e6a23c"
          stroke-width="2"
          marker-end="url(#sh-arrow-amber)"
        />
        <SvgMathText :x="shaftX + shaftLen * 0.55 + 8" :y="shaftY - 24" text="M" color="#e6a23c" :width="20" :font-size="12" />
        <path :d="bendArc" fill="none" stroke="#e6a23c" stroke-width="1.5" marker-end="url(#sh-arrow-amber)" />
      </template>

      <template v-if="mode === 'torsion' && length > 0">
        <line
          :x1="shaftX"
          :y1="shaftY + shaftH + 20"
          :x2="shaftX + shaftLen"
          :y2="shaftY + shaftH + 20"
          class="dim"
          marker-start="url(#sh-arrow)"
          marker-end="url(#sh-arrow)"
        />
        <SvgMathText
          :x="shaftX + shaftLen / 2"
          :y="shaftY + shaftH + 36"
          text="L"
          anchor="middle"
          color="#64748b"
          :width="20"
          :font-size="12"
        />
      </template>

      <!-- 底部数值条 -->
      <rect x="16" y="252" width="448" height="36" rx="6" class="value-panel" />
      <SvgMathText :x="28" :y="276" :text="labelD" color="#409eff" :width="96" :font-size="12" />
      <SvgMathText v-if="innerDiameter > 0" :x="128" :y="276" :text="labelDi" color="#64748b" :width="96" :font-size="12" />
      <SvgMathText :x="innerDiameter > 0 ? 228 : 140" :y="276" :text="labelT" color="#8b5cf6" :width="100" :font-size="12" />
      <SvgMathText
        v-if="mode === 'torsion' && length > 0"
        :x="innerDiameter > 0 ? 332 : 260"
        :y="276"
        :text="labelL"
        color="#64748b"
        :width="100"
        :font-size="12"
      />
      <SvgMathText
        v-if="mode === 'combined' && bendingMoment > 0"
        :x="innerDiameter > 0 ? 332 : 260"
        :y="276"
        :text="labelM"
        color="#e6a23c"
        :width="110"
        :font-size="12"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('shaft')

const props = defineProps({
  diameter: { type: Number, default: 30 },
  innerDiameter: { type: Number, default: 0 },
  mode: { type: String, default: 'torsion' },
  length: { type: Number, default: 500 },
  torque: { type: Number, default: 0 },
  bendingMoment: { type: Number, default: 0 },
})

const d = computed(() => Math.max(props.diameter || 1, 1))
const di = computed(() => Math.max(props.innerDiameter || 0, 0))

const cxSec = 110
const cySec = 118
const scale = computed(() => 52 / Math.max(d.value / 2, 1))
const rOuter = computed(() => Math.min(Math.max((d.value / 2) * scale.value, 28), 62))
const rInner = computed(() => {
  if (!(di.value > 0) || di.value >= d.value) return 0
  return Math.max((di.value / 2) * scale.value, 6)
})

const secTorqueArc = computed(() => {
  const r = rOuter.value + 12
  return `M ${cxSec + r * 0.15} ${cySec - r * 0.92} A ${r} ${r} 0 0 1 ${cxSec + r * 0.92} ${cySec - r * 0.2}`
})

/** 侧视固定槽：L 再大也只在槽内缩放 */
const sideLeft = 232
const sideRight = 456
const sideAvail = sideRight - sideLeft

const shaftLen = computed(() => {
  if (props.mode !== 'torsion' || !(props.length > 0)) return Math.min(sideAvail, 160)
  // 相对参考 500 mm，限制在槽宽 55%~100%
  const t = Math.min(Math.max(props.length / 500, 0.45), 1)
  return sideAvail * (0.55 + 0.45 * t)
})
const shaftH = computed(() => Math.min(Math.max(d.value * 0.55, 16), 40))
const shaftX = computed(() => sideLeft + (sideAvail - shaftLen.value) / 2)
const shaftY = computed(() => 100 + (40 - shaftH.value) / 2)

const sideTorqueArc = computed(() => {
  const x = shaftX.value + 8
  const y = shaftY.value + shaftH.value / 2
  return `M ${x} ${y - 18} A 16 16 0 0 1 ${x + 16} ${y + 12}`
})

const bendArc = computed(() => {
  const x = shaftX.value + shaftLen.value - 8
  const y = shaftY.value + shaftH.value / 2
  return `M ${x} ${y + 16} A 14 14 0 0 1 ${x - 12} ${y - 10}`
})

const labelD = computed(() => `$d = ${d.value}\\,\\mathrm{mm}$`)
const labelDi = computed(() => `$d_i = ${di.value}\\,\\mathrm{mm}$`)
const labelT = computed(() =>
  props.torque > 0 ? `$T = ${Number(props.torque).toFixed(props.torque < 10 ? 2 : 0)}\\,\\mathrm{N\\cdot m}$` : '$T$',
)
const labelL = computed(() => `$L = ${props.length}\\,\\mathrm{mm}$`)
const labelM = computed(() =>
  props.bendingMoment > 0
    ? `$M = ${Number(props.bendingMoment).toFixed(props.bendingMoment < 10 ? 2 : 0)}\\,\\mathrm{N\\cdot m}$`
    : '$M$',
)

const hintText = computed(() => {
  const base = {
    d: d.value,
    di: di.value > 0 ? di.value : '',
    T: props.torque > 0 ? Number(props.torque).toFixed(props.torque < 10 ? 2 : 0) : '—',
    L: props.length > 0 ? props.length : '—',
    M: props.bendingMoment > 0 ? Number(props.bendingMoment).toFixed(0) : '—',
  }
  if (props.mode === 'combined') {
    return dt(di.value > 0 ? 'hintCombinedHollow' : 'hintCombined', base)
  }
  return dt(di.value > 0 ? 'hintTorsionHollow' : 'hintTorsion', base)
})
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .shaft-ring { fill: rgba(64,158,255,0.25); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .shaft-bore { fill: #f8fafc; stroke: #94a3b8; stroke-width: 1.5; stroke-dasharray: 4 3; }
.dark .mech-diagram__svg .shaft-bore { fill: #0f172a; }
.mech-diagram__svg .shaft-bar { fill: rgba(148,163,184,0.32); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .center-tick { stroke: #94a3b8; stroke-width: 1; opacity: 0.7; }
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
