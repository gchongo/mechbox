<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 300" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="sm-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="sm-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <linearGradient id="sm-sheet-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d5dde6" />
          <stop offset="100%" stop-color="#9aa8b8" />
        </linearGradient>
      </defs>

      <path :d="sheetPath" class="sheet" />
      <path :d="neutralPath" class="neutral" fill="none" />

      <!-- T -->
      <line
        :x1="tDim.x"
        :y1="tDim.y1"
        :x2="tDim.x"
        :y2="tDim.y2"
        class="dim-primary"
        marker-start="url(#sm-arrow-blue)"
        marker-end="url(#sm-arrow-blue)"
      />
      <SvgMathText :x="tDim.x - 6" :y="(tDim.y1 + tDim.y2) / 2 + 4" text="T" anchor="end" color="#409eff" :width="16" :font-size="12" />

      <!-- R -->
      <line :x1="cx" :y1="cy" :x2="rTip.x" :y2="rTip.y" class="dim" marker-end="url(#sm-arrow)" />
      <circle :cx="cx" :cy="cy" r="2" class="center-dot" />
      <SvgMathText :x="rLabel.x" :y="rLabel.y" text="R" color="#64748b" :width="16" :font-size="12" />

      <!-- θ：折弯角扇区 -->
      <path :d="angleArcPath" class="angle-arc" fill="none" />
      <SvgMathText :x="thetaLabel.x" :y="thetaLabel.y" text="θ" anchor="middle" color="#e6a23c" :width="20" :font-size="13" />

      <!-- K：标在水平段中性层旁，避免与 θ 重叠 -->
      <SvgMathText :x="kLabel.x" :y="kLabel.y" text="K" color="#8b5cf6" :width="18" :font-size="11" />

      <rect x="16" y="252" width="448" height="36" rx="6" class="value-panel" />
      <SvgMathText :x="24" :y="276" :text="labelT" color="#409eff" :width="92" :font-size="12" />
      <SvgMathText :x="118" :y="276" :text="labelR" color="#64748b" :width="92" :font-size="12" />
      <SvgMathText :x="212" :y="276" :text="labelTheta" color="#e6a23c" :width="72" :font-size="12" />
      <SvgMathText :x="288" :y="276" :text="labelK" color="#8b5cf6" :width="72" :font-size="12" />
      <SvgMathText :x="364" :y="276" :text="labelBA" color="#64748b" :width="96" :font-size="11" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('sheetMetal')

const props = defineProps({
  thickness: { type: Number, default: 1.5 },
  bendRadius: { type: Number, default: 1.5 },
  kFactor: { type: Number, default: 0.33 },
  bendAngle: { type: Number, default: 90 },
})

const theta = computed(() => Math.min(Math.max(Number(props.bendAngle) || 90, 35), 145))
const T = computed(() => Math.max(Number(props.thickness) || 0.5, 0.3))
const R = computed(() => Math.max(Number(props.bendRadius) || 0.1, 0.1))
const K = computed(() => Math.min(Math.max(Number(props.kFactor) || 0.33, 0.2), 0.5))

const tPx = computed(() => Math.min(Math.max(T.value * 5.5, 10), 28))
const rPx = computed(() => Math.min(Math.max(R.value * 8, 16), 52))
const legLen = 100

/** 圆心略偏左，给右侧竖边留空 */
const cx = 220
const cy = 168

/** 0°=+x，逆时针，数学 y 向上 → SVG y 向下取负 sin */
function polar(r, deg) {
  const a = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
}

/**
 * 常规折弯侧视 └──：
 * 水平腿切于 270°（下），第二腿切于 270°+θ（90° 时为 0°/右，竖边向上）
 */
const angH = 270
const ang2 = computed(() => angH + theta.value)
const angMid = computed(() => angH + theta.value / 2)

function sampleArc(r, aFrom, aTo, n = 16) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    pts.push(polar(r, aFrom + (aTo - aFrom) * t))
  }
  return pts
}

function poly(cmds) {
  return cmds.join(' ')
}

/** 第二腿沿内侧面离开弯心（270°+θ 处切线朝「张开」方向） */
const leg2Dir = computed(() => {
  const a = ((ang2.value + 90) * Math.PI) / 180
  return { x: Math.cos(a), y: -Math.sin(a) }
})

const sheetPath = computed(() => {
  const ri = rPx.value
  const ro = rPx.value + tPx.value
  const t = tPx.value
  const a0 = ang2.value
  const a1 = angH

  const iH = polar(ri, a1)
  const leftI = { x: iH.x - legLen, y: iH.y }
  const leftO = { x: iH.x - legLen, y: iH.y + t }

  const i2 = polar(ri, a0)
  const o2 = polar(ro, a0)
  const d = leg2Dir.value
  const tipI = { x: i2.x + d.x * legLen, y: i2.y + d.y * legLen }
  const tipO = { x: o2.x + d.x * legLen, y: o2.y + d.y * legLen }

  // 外弧 270→270+θ；内弧反向，保证板厚在弯心外侧
  const outer = sampleArc(ro, a1, a0)
  const inner = sampleArc(ri, a0, a1)

  const parts = [`M ${leftO.x} ${leftO.y}`]
  for (const p of outer) parts.push(`L ${p.x} ${p.y}`)
  parts.push(`L ${tipO.x} ${tipO.y}`, `L ${tipI.x} ${tipI.y}`)
  for (const p of inner) parts.push(`L ${p.x} ${p.y}`)
  parts.push(`L ${leftI.x} ${leftI.y}`, 'Z')
  return poly(parts)
})

const neutralPath = computed(() => {
  // 全程距内表面 K·T，与圆弧段同一 Rn，避免直段画在板厚中线
  const rn = rPx.value + tPx.value * K.value
  const a0 = ang2.value
  const a1 = angH
  const pH = polar(rn, a1)
  const p2 = polar(rn, a0)
  const d = leg2Dir.value
  const left = { x: pH.x - legLen * 0.55, y: pH.y }
  const tip = { x: p2.x + d.x * legLen * 0.55, y: p2.y + d.y * legLen * 0.55 }
  const arc = sampleArc(rn, a1, a0)
  const parts = [`M ${left.x} ${left.y}`, `L ${pH.x} ${pH.y}`]
  for (const p of arc.slice(1)) parts.push(`L ${p.x} ${p.y}`)
  parts.push(`L ${tip.x} ${tip.y}`)
  return poly(parts)
})

const tDim = computed(() => {
  const iH = polar(rPx.value, angH)
  return { x: iH.x - legLen * 0.5, y1: iH.y, y2: iH.y + tPx.value }
})

const rTip = computed(() => polar(rPx.value, angMid.value))
const rLabel = computed(() => {
  const p = polar(rPx.value * 0.4, angMid.value)
  return { x: p.x - 2, y: p.y + 4 }
})

/** θ 标在两直边之间的折弯角扇区（内侧） */
const angleArcPath = computed(() => {
  const r = Math.max(rPx.value * 0.62, 26)
  const pts = sampleArc(r, angH, ang2.value, 12)
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})

const thetaLabel = computed(() => {
  const p = polar(Math.max(rPx.value * 0.62, 26) + 18, angMid.value)
  return { x: p.x, y: p.y + 4 }
})

/** K 放在水平中性层上方，与弯角区分离 */
const kLabel = computed(() => {
  const rn = rPx.value + tPx.value * K.value
  const pH = polar(rn, angH)
  return { x: pH.x - legLen * 0.22, y: pH.y - 10 }
})

function fmt(v, d = 2) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(d)
}

const baValue = computed(() => {
  const rad = (theta.value * Math.PI) / 180
  return rad * (R.value + K.value * T.value)
})

const labelT = computed(() => `$T=${fmt(T.value)}\\,\\mathrm{mm}$`)
const labelR = computed(() => `$R=${fmt(R.value)}\\,\\mathrm{mm}$`)
const labelTheta = computed(() => `$\\theta=${fmt(theta.value, 0)}^\\circ$`)
const labelK = computed(() => `$K=${fmt(K.value, 2)}$`)
const labelBA = computed(() => `$BA\\approx${fmt(baValue.value)}\\,\\mathrm{mm}$`)
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .sheet {
  fill: url(#sm-sheet-grad);
  stroke: #64748b;
  stroke-width: 1.4;
}
.dark .mech-diagram__svg .sheet {
  fill: #475569;
  stroke: #94a3b8;
}
.mech-diagram__svg .neutral {
  stroke: #8b5cf6;
  stroke-width: 1.5;
  stroke-dasharray: 5 3;
}
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .angle-arc { stroke: #e6a23c; stroke-width: 1.6; }
.mech-diagram__svg .center-dot { fill: #64748b; }
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
