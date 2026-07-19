<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ diagramTitle }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="diagramAria">
      <defs>
        <marker id="drv-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="drv-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
        <marker id="drv-arrow-amber" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#e6a23c" />
        </marker>
      </defs>

      <!-- 中心连线 -->
      <line :x1="x1" :y1="cy" :x2="x2" :y2="cy" class="center-line" stroke-dasharray="4 3" />
      <circle :cx="x1" :cy="cy" r="2.5" fill="#64748b" />
      <circle :cx="x2" :cy="cy" r="2.5" fill="#64748b" />

      <!-- 大轮 -->
      <circle :cx="x2" :cy="cy" :r="r2" class="wheel" />
      <circle :cx="x2" :cy="cy" :r="Math.max(r2 - hubInset, 4)" class="wheel-hub" />
      <!-- 小轮（主动） -->
      <circle :cx="x1" :cy="cy" :r="r1" class="wheel wheel--driver" />
      <circle :cx="x1" :cy="cy" :r="Math.max(r1 - hubInset * 0.7, 3)" class="wheel-hub-driver" />

      <!-- 链轮齿尖示意 -->
      <g v-if="isChain" class="teeth" stroke="#64748b" stroke-width="1.2">
        <line
          v-for="(t, i) in toothTicks(x1, cy, r1, Math.min(driverTeeth, 16))"
          :key="'t1-' + i"
          :x1="t.x1"
          :y1="t.y1"
          :x2="t.x2"
          :y2="t.y2"
        />
        <line
          v-for="(t, i) in toothTicks(x2, cy, r2, Math.min(drivenTeeth, 24))"
          :key="'t2-' + i"
          :x1="t.x1"
          :y1="t.y1"
          :x2="t.x2"
          :y2="t.y2"
        />
      </g>

      <!-- 皮带 / 链条外廓 -->
      <path :d="drivePath" fill="none" :stroke="isChain ? '#475569' : '#64748b'" :stroke-width="isChain ? 2.5 : 3" stroke-linecap="round" />
      <!-- 链条第二道线（滚子链厚度感） -->
      <path
        v-if="isChain"
        :d="drivePathInner"
        fill="none"
        stroke="#94a3b8"
        stroke-width="1.25"
        stroke-linecap="round"
        opacity="0.85"
      />

      <!-- 紧边标注（上边） -->
      <SvgMathText
        v-if="isChain"
        :x="(x1 + x2) / 2"
        :y="cy - maxR - 6"
        :text="labelTight"
        anchor="middle"
        color="#64748b"
        :width="80"
        :font-size="11"
      />

      <!-- 包角弧（小轮实际包角） -->
      <path :d="wrapArc" fill="none" stroke="#e6a23c" stroke-width="2" />
      <SvgMathText
        :x="x1 - r1 - 8"
        :y="cy - 4"
        :text="labelTheta"
        anchor="end"
        color="#e6a23c"
        :width="88"
        :font-size="12"
      />

      <!-- 中心距 C -->
      <line
        :x1="x1"
        :y1="dimY"
        :x2="x2"
        :y2="dimY"
        class="dim-primary"
        marker-start="url(#drv-arrow)"
        marker-end="url(#drv-arrow)"
      />
      <SvgMathText
        :x="(x1 + x2) / 2"
        :y="dimY + 18"
        :text="labelC"
        anchor="middle"
        class-name="txt-primary"
        color="#409eff"
        :width="140"
        :font-size="12"
      />

      <!-- z / D 标签 -->
      <SvgMathText
        :x="x1"
        :y="cy + r1 + 16"
        :text="labelSmall"
        anchor="middle"
        class-name="txt"
        color="#334155"
        :width="100"
        :font-size="12"
      />
      <SvgMathText
        :x="x2"
        :y="cy + r2 + 16"
        :text="labelLarge"
        anchor="middle"
        class-name="txt"
        color="#334155"
        :width="100"
        :font-size="12"
      />

      <!-- 转速 n -->
      <template v-if="rpm > 0">
        <path
          :d="rpmArc"
          fill="none"
          stroke="#8b5cf6"
          stroke-width="1.6"
          marker-end="url(#drv-arrow-violet)"
        />
        <SvgMathText :x="x1 + 4" :y="cy - r1 - 18" :text="labelN" color="#8b5cf6" :width="72" :font-size="11" />
      </template>

      <!-- 节距 p（链） -->
      <SvgMathText
        v-if="isChain"
        :x="240"
        :y="268"
        :text="labelPitch"
        anchor="middle"
        color="#94a3b8"
        :width="200"
        :font-size="11"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from '@/components/common/MathContent.vue'
import SvgMathText from '@/components/common/SvgMathText.vue'
import { calcWrapAngle } from '@/utils/belt-calc'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('drive')

const props = defineProps({
  variant: { type: String, default: 'belt' },
  driverDiameter: { type: Number, default: 120 },
  drivenDiameter: { type: Number, default: 300 },
  centerDistance: { type: Number, default: 500 },
  driverTeeth: { type: Number, default: 19 },
  drivenTeeth: { type: Number, default: 57 },
  pitch: { type: Number, default: 15.875 },
  wrapAngle: { type: Number, default: 0 },
  rpm: { type: Number, default: 0 },
})

const isChain = computed(() => props.variant === 'chain')

const d1 = computed(() =>
  isChain.value ? (props.pitch * props.driverTeeth) / Math.PI : props.driverDiameter,
)
const d2 = computed(() =>
  isChain.value ? (props.pitch * props.drivenTeeth) / Math.PI : props.drivenDiameter,
)

const cy = 118
const plotW = 400
const plotH = 150

const scale = computed(() => {
  const C = Math.max(props.centerDistance, 1)
  const Rmax = Math.max(d2.value, d1.value) / 2
  const sx = plotW / C
  const sy = plotH / (2 * Rmax + 8)
  return Math.min(sx, sy, 0.45)
})

const r1 = computed(() => Math.max(12, (d1.value / 2) * scale.value))
const r2 = computed(() => Math.max(16, (d2.value / 2) * scale.value))
const maxR = computed(() => Math.max(r1.value, r2.value))
const cPx = computed(() => Math.max(props.centerDistance * scale.value, r1.value + r2.value + 40))

const x1 = computed(() => 240 - cPx.value / 2)
const x2 = computed(() => 240 + cPx.value / 2)
const hubInset = 8
const dimY = computed(() => cy + maxR.value + 28)

const gamma = computed(() => {
  const C = x2.value - x1.value
  const arg = (r2.value - r1.value) / C
  if (arg <= 0) return 0
  if (arg >= 0.999) return Math.asin(0.999)
  return Math.asin(arg)
})

const tangents = computed(() => {
  const g = gamma.value
  const s = Math.sin(g)
  const c = Math.cos(g)
  return {
    u1: { x: x1.value + r1.value * s, y: cy - r1.value * c },
    u2: { x: x2.value - r2.value * s, y: cy - r2.value * c },
    l1: { x: x1.value + r1.value * s, y: cy + r1.value * c },
    l2: { x: x2.value - r2.value * s, y: cy + r2.value * c },
  }
})

/** 外廓路径：上切线 → 大轮外包弧 → 下切线 → 小轮外包弧 */
const drivePath = computed(() => {
  const { u1, u2, l1, l2 } = tangents.value
  // 大轮：从 u2 顺时针到 l2（右侧外包）
  // 小轮：从 l1 顺时针到 u1（左侧外包）→ SVG A 大弧
  return [
    `M ${u1.x} ${u1.y}`,
    `L ${u2.x} ${u2.y}`,
    `A ${r2.value} ${r2.value} 0 1 1 ${l2.x} ${l2.y}`,
    `L ${l1.x} ${l1.y}`,
    `A ${r1.value} ${r1.value} 0 1 1 ${u1.x} ${u1.y}`,
  ].join(' ')
})

const drivePathInner = computed(() => {
  const shrink = 3
  const rr1 = Math.max(r1.value - shrink, 6)
  const rr2 = Math.max(r2.value - shrink, 8)
  const C = x2.value - x1.value
  const arg = (rr2 - rr1) / C
  const g = arg <= 0 ? 0 : Math.asin(Math.min(0.999, arg))
  const s = Math.sin(g)
  const c = Math.cos(g)
  const u1 = { x: x1.value + rr1 * s, y: cy - rr1 * c }
  const u2 = { x: x2.value - rr2 * s, y: cy - rr2 * c }
  const l1 = { x: x1.value + rr1 * s, y: cy + rr1 * c }
  const l2 = { x: x2.value - rr2 * s, y: cy + rr2 * c }
  return [
    `M ${u1.x} ${u1.y}`,
    `L ${u2.x} ${u2.y}`,
    `A ${rr2} ${rr2} 0 1 1 ${l2.x} ${l2.y}`,
    `L ${l1.x} ${l1.y}`,
    `A ${rr1} ${rr1} 0 1 1 ${u1.x} ${u1.y}`,
  ].join(' ')
})

const wrapAngleDeg = computed(() => {
  if (props.wrapAngle > 0) return props.wrapAngle
  return calcWrapAngle(d1.value, d2.value, props.centerDistance)
})

/** 小轮包角弧：外侧（背向大轮），圆心角 = π − 2γ（与计算结果一致） */
const wrapArc = computed(() => {
  const r = r1.value + 12
  const g = gamma.value
  // 以 π（左侧）为中心：从 π/2+γ 到 3π/2−γ，跨度 π−2γ
  const a0 = Math.PI / 2 + g
  const a1 = (3 * Math.PI) / 2 - g
  const xStart = x1.value + r * Math.cos(a0)
  const yStart = cy + r * Math.sin(a0)
  const xEnd = x1.value + r * Math.cos(a1)
  const yEnd = cy + r * Math.sin(a1)
  return `M ${xStart} ${yStart} A ${r} ${r} 0 0 1 ${xEnd} ${yEnd}`
})

const rpmArc = computed(() => {
  const r = r1.value + 20
  const x0 = x1.value
  const y0 = cy - r
  const x1a = x1.value + r * 0.75
  const y1a = cy - r * 0.65
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1a} ${y1a}`
})

function toothTicks(cx, cy0, r, count) {
  const ticks = []
  const n = Math.max(8, count)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    ticks.push({
      x1: cx + (r - 3) * c,
      y1: cy0 + (r - 3) * s,
      x2: cx + (r + 2.5) * c,
      y2: cy0 + (r + 2.5) * s,
    })
  }
  return ticks
}

const labelSmall = computed(() =>
  isChain.value
    ? `$z_1 = ${props.driverTeeth}$`
    : `$D_1 = ${props.driverDiameter}\\,\\mathrm{mm}$`,
)
const labelLarge = computed(() =>
  isChain.value
    ? `$z_2 = ${props.drivenTeeth}$`
    : `$D_2 = ${props.drivenDiameter}\\,\\mathrm{mm}$`,
)
const labelTheta = computed(() => `$\\theta \\approx ${wrapAngleDeg.value.toFixed(0)}^\\circ$`)
const labelC = computed(() => dl('C', props.centerDistance))
const labelN = computed(() => `$n = ${props.rpm}\\,\\mathrm{rpm}$`)
const labelPitch = computed(() => {
  const i = (props.drivenTeeth / Math.max(props.driverTeeth, 1)).toFixed(2)
  return `$p = ${props.pitch}\\,\\mathrm{mm}\\ ·\\ i = ${i}$`
})
const labelTight = computed(() => (isChain.value ? dt('tightSide') : ''))

const diagramTitle = computed(() => dt(isChain.value ? 'titleChain' : 'titleBelt'))
const diagramAria = computed(() => dt(isChain.value ? 'ariaChain' : 'ariaBelt'))
const hintText = computed(() =>
  dt(isChain.value ? 'hintChain' : 'hintBelt', {
    z1: props.driverTeeth,
    z2: props.drivenTeeth,
    theta: wrapAngleDeg.value.toFixed(0),
  }),
)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .wheel { fill: rgba(148,163,184,0.22); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .wheel--driver { fill: rgba(64,158,255,0.18); stroke: #409eff; }
.mech-diagram__svg .wheel-hub { fill: rgba(148,163,184,0.12); stroke: #94a3b8; stroke-width: 1; }
.mech-diagram__svg .wheel-hub-driver { fill: rgba(64,158,255,0.12); stroke: #409eff; stroke-width: 1; }
.mech-diagram__svg .center-line { stroke: #94a3b8; stroke-width: 1; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .teeth { opacity: 0.55; }
.dark .mech-diagram__svg .wheel { fill: rgba(148,163,184,0.12); }
.dark .mech-diagram__svg .wheel--driver { fill: rgba(64,158,255,0.12); }
</style>
