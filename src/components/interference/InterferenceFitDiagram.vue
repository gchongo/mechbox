<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="if-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="if-arr-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="if-arr-amber" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
        </marker>
      </defs>

      <!-- 径向截面：轮毂环 → 轴 → 孔径孔线 → 过盈环 -->
      <text x="16" y="20" class="txt-muted" font-size="11">{{ dt('radialSection') }}</text>
      <circle :cx="cx" :cy="cy" :r="rHub" class="hub-ring" />
      <circle :cx="cx" :cy="cy" :r="rContact" class="hub-bore-fill" />
      <circle :cx="cx" :cy="cy" :r="rShaft" class="shaft-fill" />
      <circle v-if="rBore > 4" :cx="cx" :cy="cy" :r="rBore" class="shaft-bore" />
      <circle :cx="cx" :cy="cy" :r="rHole" class="hole-ring" />
      <circle
        v-if="showInterference"
        :cx="cx"
        :cy="cy"
        :r="(rShaft + rHole) / 2"
        fill="none"
        stroke="#e6a23c"
        stroke-width="2.5"
        opacity="0.9"
      />

      <!-- d（轴径，底部） -->
      <line
        :x1="cx - rShaft"
        :y1="dY"
        :x2="cx + rShaft"
        :y2="dY"
        class="dim-primary"
        marker-start="url(#if-arr-blue)"
        marker-end="url(#if-arr-blue)"
      />
      <SvgMathText :x="cx" :y="dY + 14" text="d" anchor="middle" color="#409eff" :width="18" :font-size="13" />

      <!-- D（孔径，顶部） -->
      <line
        :x1="cx - rHole"
        :y1="DY"
        :x2="cx + rHole"
        :y2="DY"
        class="dim"
        marker-start="url(#if-arr)"
        marker-end="url(#if-arr)"
      />
      <SvgMathText :x="cx" :y="DY - 4" text="D" anchor="middle" color="#64748b" :width="18" :font-size="13" />

      <!-- D_A -->
      <line
        :x1="cx + rHub"
        :y1="cy"
        :x2="cx + rHub + 22"
        :y2="cy"
        class="dim"
        marker-end="url(#if-arr)"
      />
      <SvgMathText :x="cx + rHub + 26" :y="cy + 4" text="D_A" color="#64748b" :width="34" :font-size="12" />

      <!-- i（右侧径向过盈示意） -->
      <template v-if="showInterference">
        <line
          :x1="cx + rHole"
          :y1="cy + 28"
          :x2="cx + rShaft"
          :y2="cy + 28"
          class="dim-amber"
          marker-start="url(#if-arr-amber)"
          marker-end="url(#if-arr-amber)"
        />
        <SvgMathText :x="cx + (rHole + rShaft) / 2" :y="cy + 44" text="i" anchor="middle" color="#e6a23c" :width="16" :font-size="12" />
      </template>

      <!-- 轴向配合段 -->
      <text :x="axLeft" y="22" class="txt-muted" font-size="11">{{ dt('axialFitSection') }}</text>
      <rect :x="ax.hubX" :y="ax.hubY" :width="ax.hubW" :height="ax.hubH" rx="3" class="hub-block" />
      <rect :x="ax.shaftX" :y="ax.shaftY" :width="ax.shaftW" :height="ax.shaftH" rx="2" class="shaft-bar" />
      <text :x="ax.hubX + 6" :y="ax.hubY + 14" class="txt-muted" font-size="10">{{ dt('hub') }}</text>
      <text :x="ax.shaftX + 6" :y="ax.shaftY + ax.shaftH / 2 + 4" class="txt-on-shaft" font-size="10">{{ dt('shaftPart') }}</text>

      <line
        :x1="ax.hubX"
        :y1="ax.lY"
        :x2="ax.hubX + ax.hubW"
        :y2="ax.lY"
        class="dim-primary"
        marker-start="url(#if-arr-blue)"
        marker-end="url(#if-arr-blue)"
      />
      <SvgMathText :x="ax.hubX + ax.hubW / 2" :y="ax.lY + 16" text="L" anchor="middle" color="#409eff" :width="18" :font-size="13" />

      <!-- 底栏 -->
      <rect x="12" y="232" width="456" height="38" rx="6" class="value-panel" />
      <SvgMathText :x="22" :y="257" :text="labelD" color="#409eff" :width="100" :font-size="12" />
      <SvgMathText :x="124" :y="257" :text="labelHole" color="#64748b" :width="100" :font-size="12" />
      <SvgMathText :x="226" :y="257" :text="labelI" color="#e6a23c" :width="88" :font-size="12" />
      <SvgMathText :x="316" :y="257" :text="labelDa" color="#64748b" :width="88" :font-size="12" />
      <SvgMathText :x="406" :y="257" :text="labelL" color="#409eff" :width="60" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('interference')

const props = defineProps({
  shaftDiameter: { type: Number, default: 50 },
  holeDiameter: { type: Number, default: 49.975 },
  hubOuterDiameter: { type: Number, default: 90 },
  fitLength: { type: Number, default: 40 },
  interference: { type: Number, default: 0.025 },
  shaftInnerDiameter: { type: Number, default: 0 },
})

const cx = 148
const cy = 112

const d = computed(() => Math.max(props.shaftDiameter || 1, 1))
const D = computed(() => Math.max(props.holeDiameter || 1, 0.1))
const DA = computed(() => Math.max(props.hubOuterDiameter || d.value * 1.5, d.value + 1))
const L = computed(() => Math.max(props.fitLength || 1, 1))
const iVal = computed(() => (Number.isFinite(props.interference) ? props.interference : d.value - D.value))

/** 径向比例：D_A → 半径，预留下方尺寸线空间 */
const scale = computed(() => 76 / Math.max(DA.value / 2, 1))

const rHub = computed(() => Math.min((DA.value / 2) * scale.value, 76))
/** 过盈在图上示意放大，否则几乎看不见 */
const rShaft = computed(() => {
  const base = (d.value / 2) * scale.value
  return Math.min(Math.max(base, 26), rHub.value - 12)
})
const rHole = computed(() => {
  const gap = Math.min(Math.max(Math.abs(iVal.value) * scale.value * 50, 3.5), 7)
  if (iVal.value > 0) return Math.max(rShaft.value - gap, 18)
  if (iVal.value < 0) return Math.min(rShaft.value + gap, rHub.value - 8)
  return Math.min(Math.max((D.value / 2) * scale.value, 22), rShaft.value)
})
/** 轮毂内孔填色半径（取接触侧） */
const rContact = computed(() => Math.min(rHole.value, rShaft.value))
const rBore = computed(() => {
  if (!(props.shaftInnerDiameter > 0)) return 0
  return Math.min(Math.max((props.shaftInnerDiameter / 2) * scale.value, 5), rShaft.value - 4)
})

const showInterference = computed(() => Math.abs(iVal.value) > 1e-6)

const dY = computed(() => cy + rHub.value + 14)
const DY = computed(() => cy - rHub.value - 12)

/** 轴向视图：放大占满右侧 */
const axLeft = 300
const axRight = 468
const axAvail = axRight - axLeft

const ax = computed(() => {
  const hubH = 64
  const shaftH = 32
  const hubY = 70
  const t = Math.min(Math.max(L.value / 80, 0.5), 1)
  const hubW = axAvail * (0.62 + 0.38 * t)
  const hubX = axLeft + (axAvail - hubW) / 2
  const shaftY = hubY + (hubH - shaftH) / 2
  return {
    hubX,
    hubY,
    hubW,
    hubH,
    shaftX: hubX,
    shaftY,
    shaftW: hubW,
    shaftH,
    lY: hubY + hubH + 16,
  }
})

function fmt(v, digits = 3) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

const labelD = computed(() => `$d=${fmt(d.value)}\\,\\mathrm{mm}$`)
const labelHole = computed(() => `$D=${fmt(D.value)}\\,\\mathrm{mm}$`)
const labelI = computed(() => `$i=${fmt(iVal.value)}\\,\\mathrm{mm}$`)
const labelDa = computed(() => `$D_A=${fmt(DA.value, 1)}\\,\\mathrm{mm}$`)
const labelL = computed(() => `$L=${fmt(L.value, 1)}\\,\\mathrm{mm}$`)
</script>

<style scoped>
.mech-diagram {
  @apply mt-5 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-2; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-0.5 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; min-height: 200px; }

.mech-diagram__svg .hub-ring {
  fill: rgba(148, 163, 184, 0.35);
  stroke: #94a3b8;
  stroke-width: 2;
}
.mech-diagram__svg .hub-bore-fill {
  fill: #f8fafc;
  stroke: none;
}
.dark .mech-diagram__svg .hub-bore-fill { fill: #0f172a; }
.mech-diagram__svg .hole-ring {
  fill: none;
  stroke: #64748b;
  stroke-width: 1.4;
  stroke-dasharray: 5 3;
}
.mech-diagram__svg .shaft-fill {
  fill: rgba(64, 158, 255, 0.28);
  stroke: #409eff;
  stroke-width: 2;
}
.mech-diagram__svg .shaft-bore {
  fill: #f8fafc;
  stroke: #cbd5e1;
  stroke-width: 1.2;
}
.dark .mech-diagram__svg .shaft-bore { fill: #0f172a; stroke: #475569; }
.mech-diagram__svg .hub-block {
  fill: rgba(148, 163, 184, 0.28);
  stroke: #94a3b8;
  stroke-width: 1.5;
}
.mech-diagram__svg .shaft-bar {
  fill: rgba(64, 158, 255, 0.4);
  stroke: #409eff;
  stroke-width: 1.4;
}
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.3; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim-amber { stroke: #e6a23c; stroke-width: 1.6; fill: none; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .txt-on-shaft { fill: #1e40af; }
.dark .mech-diagram__svg .txt-on-shaft { fill: #93c5fd; }
.mech-diagram__svg .value-panel {
  fill: rgba(255, 255, 255, 0.95);
  stroke: #e2e8f0;
  stroke-width: 1;
}
.dark .mech-diagram__svg .value-panel {
  fill: rgba(15, 23, 42, 0.9);
  stroke: #334155;
}
</style>
