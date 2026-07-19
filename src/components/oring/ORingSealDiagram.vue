<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>

    <svg class="mech-diagram__svg" viewBox="0 0 480 300" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="oring-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="oring-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <linearGradient id="oring-housing-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#dbe4ee" />
          <stop offset="100%" stop-color="#c5d0dc" />
        </linearGradient>
        <linearGradient id="oring-mate-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
      </defs>

      <!-- 壳体（沟槽开口朝下） -->
      <path :d="housingPath" class="housing" />
      <text :x="hx + 14" :y="hy + 20" class="txt-muted" font-size="11">{{ dt('housing') }}</text>

      <!-- 对偶密封面（轴/活塞） -->
      <rect :x="mate.x" :y="mate.y" :width="mate.w" :height="mate.h" rx="2" class="mate-face" />
      <text :x="mate.x + mate.w - 8" :y="mate.y + mate.h - 6" class="txt-on-mate" font-size="10" text-anchor="end">
        {{ dt('matingFace') }}
      </text>

      <!-- 压缩态 O 型圈（落在槽底与密封面之间） -->
      <ellipse :cx="ocx" :cy="ocy" :rx="orx" :ry="ory" class="oring" />

      <!-- w：槽宽 -->
      <line
        :x1="gl"
        :y1="wLineY"
        :x2="gl + gw"
        :y2="wLineY"
        class="dim"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
      />
      <SvgMathText :x="gl + gw / 2" :y="wLineY - 5" text="w" anchor="middle" color="#64748b" :width="22" :font-size="12" />

      <!-- h：槽深 -->
      <line
        :x1="hLineX"
        :y1="gt"
        :x2="hLineX"
        :y2="gt + gh"
        class="dim"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
      />
      <SvgMathText :x="hLineX - 5" :y="gt + gh / 2 + 4" text="h" anchor="end" color="#64748b" :width="18" :font-size="12" />

      <!-- d_cs：压缩高度 -->
      <line
        :x1="csLineX"
        :y1="ocy - ory"
        :x2="csLineX"
        :y2="ocy + ory"
        class="dim-primary"
        marker-start="url(#oring-arrow-blue)"
        marker-end="url(#oring-arrow-blue)"
      />
      <SvgMathText :x="csLineX + 5" :y="ocy + 4" text="d_cs" color="#409eff" :width="34" :font-size="11" />

      <!-- d_g：槽区右侧概念标注（周向底径） -->
      <line
        :x1="gl + gw - 8"
        :y1="mate.y + 4"
        :x2="gl + gw - 8"
        :y2="mate.y + mate.h - 4"
        class="dim-dash"
      />
      <SvgMathText :x="gl + gw + 6" :y="mate.y + mate.h / 2 + 4" text="d_g" color="#409eff" :width="28" :font-size="11" />

      <!-- 挤出间隙 -->
      <template v-if="showExtrusion && gapW > 2">
        <line :x1="gl + gw" :y1="mate.y" :x2="gl + gw + gapW" :y2="mate.y" class="gap-line" />
        <text :x="gl + gw + gapW / 2" :y="mate.y - 6" class="txt-amber" font-size="10" text-anchor="middle">g</text>
      </template>

      <!-- 压力 -->
      <template v-if="pressure > 0">
        <line
          :x1="hx + 16"
          :y1="ocy"
          :x2="hx + 36"
          :y2="ocy"
          stroke="#409EFF"
          stroke-width="2"
          marker-end="url(#oring-arrow-blue)"
        />
        <SvgMathText :x="hx + 10" :y="ocy - 8" text="P" color="#409eff" :width="14" :font-size="12" />
      </template>

      <!-- 孔径（壳体右缘内侧） -->
      <template v-if="boreDiameter > 0">
        <line :x1="hx + hw - 10" :y1="hy + 28" :x2="hx + hw - 10" :y2="hy + hh - 8" class="bore-line" />
        <text :x="hx + hw - 16" :y="hy + hh / 2" class="txt-muted" font-size="10" text-anchor="end">
          {{ dt('bore', { bore: boreDiameter }) }}
        </text>
      </template>

      <!-- 自由截面：嵌在主图右上角 -->
      <g :transform="`translate(${insetX}, ${insetY})`">
        <rect x="0" y="0" :width="insetW" :height="insetH" rx="5" class="inset-box" />
        <text :x="insetW / 2" y="14" class="txt-muted" font-size="10" text-anchor="middle">
          {{ dt('freeSection') }}
        </text>
        <circle :cx="insetW / 2" :cy="insetH / 2 + 2" :r="insetR" class="oring-inset" />
        <SvgMathText :x="insetW / 2" :y="insetH - 6" text="d_cs" anchor="middle" color="#64748b" :width="34" :font-size="10" />
      </g>

      <!-- 底部数值条 -->
      <rect x="16" y="252" width="448" height="36" rx="6" class="value-panel" />
      <SvgMathText :x="28" :y="276" :text="labelCs" color="#409eff" :width="96" :font-size="12" />
      <SvgMathText :x="128" :y="276" :text="labelW" color="#64748b" :width="84" :font-size="12" />
      <SvgMathText :x="216" :y="276" :text="labelH" color="#64748b" :width="84" :font-size="12" />
      <SvgMathText :x="304" :y="276" :text="labelDg" color="#409eff" :width="92" :font-size="12" />
      <SvgMathText :x="400" :y="276" :text="labelComp" color="#409eff" :width="60" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('oRing')

const props = defineProps({
  calcMode: { type: String, default: 'simple' },
  crossSection: { type: Number, default: 3.53 },
  grooveDiameter: { type: Number, default: 18.5 },
  grooveWidth: { type: Number, default: 4.8 },
  grooveDepth: { type: Number, default: 2.82 },
  compression: { type: Number, default: 0.71 },
  compressionPercent: { type: Number, default: 20 },
  extrusionGap: { type: Number, default: 0.15 },
  stretchPercent: { type: Number, default: 2 },
  pressure: { type: Number, default: 0 },
  boreDiameter: { type: Number, default: 0 },
})

const showExtrusion = computed(() => props.calcMode !== 'simple')

/** 主图区域（底部留给数值条） */
const hx = 36
const hy = 36
const hw = 408
const hh = 168
const floorY = hy + hh

/**
 * 槽宽/槽深相对线径比例缩放，避免 w 很大时 O 圈显得过小。
 * 视觉上保持「略宽于截面」的密封槽观感。
 */
const cs = computed(() => Math.max(props.crossSection || 1, 0.5))
const orx = computed(() => Math.min(Math.max(cs.value * 7.2, 14), 28))
const ory = computed(() => {
  const ratio = 1 - Math.min(Math.max(props.compressionPercent || 0, 0), 40) / 220
  return Math.max(9, orx.value * ratio)
})

const gw = computed(() => {
  const ratio = (props.grooveWidth || 1) / cs.value
  const t = Math.min(Math.max(ratio, 1.05), 2.4)
  return Math.min(Math.max(orx.value * 2 * t * 0.95, 48), 140)
})
const gh = computed(() => {
  const depth = Math.max(props.grooveDepth || cs.value * 0.8, 0.5)
  const t = Math.min(Math.max(depth / cs.value, 0.55), 1.05)
  return Math.min(Math.max(orx.value * 2 * t * 0.92, 32), 72)
})

const gl = computed(() => hx + (hw - gw.value) / 2)
const gt = computed(() => floorY - gh.value)
const ocx = computed(() => gl.value + gw.value / 2)
const ocy = computed(() => gt.value + gh.value - ory.value - 1)

const housingPath = computed(() => {
  const x0 = hx
  const y0 = hy
  const x1 = hx + hw
  const y1 = floorY
  const a = gl.value
  const b = gl.value + gw.value
  // 壳体：外轮廓 + 底部开槽（开口朝下）
  return [
    `M ${x0} ${y0}`,
    `H ${x1}`,
    `V ${y1}`,
    `H ${b}`,
    `V ${gt.value}`,
    `H ${a}`,
    `V ${y1}`,
    `H ${x0}`,
    'Z',
  ].join(' ')
})

const mate = computed(() => ({
  x: hx - 4,
  y: floorY,
  w: hw + 8,
  h: 22,
}))

const wLineY = computed(() => gt.value - 16)
const hLineX = computed(() => gl.value - 16)
const csLineX = computed(() => Math.min(ocx.value + orx.value + 14, gl.value + gw.value + 20))
const gapW = computed(() => Math.min(16, Math.max(4, (props.extrusionGap || 0.15) * 36)))

const insetW = 86
const insetH = 70
const insetX = hx + hw - insetW - 12
const insetY = hy + 12
const insetR = computed(() => Math.min(16, Math.max(11, cs.value * 3.4)))

function fmt(v, digits = 2) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

const labelCs = computed(() => `$d_{cs}=${fmt(props.crossSection)}\\,\\mathrm{mm}$`)
const labelW = computed(() => `$w=${fmt(props.grooveWidth)}\\,\\mathrm{mm}$`)
const labelH = computed(() => `$h=${fmt(props.grooveDepth)}\\,\\mathrm{mm}$`)
const labelDg = computed(() => `$d_g=${fmt(props.grooveDiameter, 1)}\\,\\mathrm{mm}$`)
const labelComp = computed(() => `$\\varepsilon=${fmt(props.compressionPercent, 0)}\\%$`)
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }

.mech-diagram__svg .housing {
  fill: url(#oring-housing-grad);
  stroke: #94a3b8;
  stroke-width: 1.5;
}
.dark .mech-diagram__svg .housing {
  fill: #334155;
  stroke: #64748b;
}
.mech-diagram__svg .mate-face {
  fill: url(#oring-mate-grad);
  stroke: #475569;
  stroke-width: 1.2;
}
.dark .mech-diagram__svg .mate-face {
  fill: #475569;
  stroke: #64748b;
}
.mech-diagram__svg .oring {
  fill: #1e293b;
  stroke: #0f172a;
  stroke-width: 1.6;
}
.dark .mech-diagram__svg .oring {
  fill: #64748b;
  stroke: #94a3b8;
}
.mech-diagram__svg .oring-inset {
  fill: #1e293b;
  stroke: #475569;
  stroke-width: 1.2;
}
.dark .mech-diagram__svg .oring-inset {
  fill: #64748b;
  stroke: #94a3b8;
}
.mech-diagram__svg .gap-line {
  stroke: #e6a23c;
  stroke-width: 2;
  stroke-dasharray: 3 2;
}
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim-dash {
  stroke: #409eff;
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
  fill: none;
}
.mech-diagram__svg .bore-line {
  stroke: #94a3b8;
  stroke-width: 1.2;
  stroke-dasharray: 5 3;
}
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .txt-amber { fill: #e6a23c; }
.mech-diagram__svg .txt-on-mate { fill: #f1f5f9; }
.mech-diagram__svg .inset-box {
  fill: rgba(255, 255, 255, 0.92);
  stroke: #cbd5e1;
  stroke-width: 1;
}
.dark .mech-diagram__svg .inset-box {
  fill: rgba(15, 23, 42, 0.92);
  stroke: #475569;
}
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
