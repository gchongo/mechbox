<template>
  <div class="oring-diagram">
    <header class="oring-diagram__head">
      <h3 class="oring-diagram__title">{{ dt('title') }}</h3>
      <p class="oring-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>

    <svg
      class="oring-diagram__svg"
      viewBox="0 0 560 360"
      role="img"
      :aria-label="dt('aria')"
    >
      <defs>
        <marker id="oring-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="oring-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 壳体 -->
      <rect :x="layout.hx" :y="layout.hy" :width="layout.hw" :height="layout.hh" rx="4" class="housing" />
      <text :x="layout.hx + 12" :y="layout.hy + 22" class="txt-muted" font-size="15">{{ dt('housing') }}</text>

      <!-- 沟槽 -->
      <rect
        :x="layout.gl"
        :y="layout.gt"
        :width="layout.gw"
        :height="layout.gh"
        rx="2"
        class="groove-cavity"
      />
      <line
        :x1="layout.gl"
        :y1="layout.gt + layout.gh"
        :x2="layout.gl + layout.gw"
        :y2="layout.gt + layout.gh"
        class="groove-floor"
      />

      <!-- O 型圈 -->
      <ellipse :cx="layout.ocx" :cy="layout.ocy" :rx="layout.orx" :ry="layout.ory" class="oring" />

      <!-- w 沟槽宽 — 顶部独立区域 -->
      <line
        :x1="layout.gl"
        :y1="layout.wLineY"
        :x2="layout.gl + layout.gw"
        :y2="layout.wLineY"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <SvgMathText :x="layout.gl + layout.gw / 2" :y="layout.wTextY" :text="labelW" anchor="middle" :width="120" :font-size="17" />

      <!-- h 沟槽深 — 左侧 -->
      <line
        :x1="layout.hLineX"
        :y1="layout.gt"
        :x2="layout.hLineX"
        :y2="layout.gt + layout.gh"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <SvgMathText :x="layout.hTextX" :y="layout.gt + layout.gh / 2 - 6" text="$h$" anchor="end" :width="20" :font-size="17" />
      <text :x="layout.hTextX" :y="layout.gt + layout.gh / 2 + 14" class="txt-sub" font-size="15" text-anchor="end">
        {{ grooveDepthLabel }} mm
      </text>

      <!-- d_cs — 右侧竖向标注，不与 w 重叠 -->
      <line
        :x1="layout.csLineX"
        :y1="layout.ocy - layout.ory"
        :x2="layout.csLineX"
        :y2="layout.ocy + layout.ory"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <SvgMathText :x="layout.csTextX" :y="layout.ocy - 4" text="$d_{cs}$" :width="40" :font-size="16" />
      <text :x="layout.csTextX" :y="layout.ocy + 14" class="txt-sub" font-size="15">
        {{ crossSection }} mm
      </text>

      <!-- 压缩 — O 型圈正下方，不与 w / d_cs 重叠 -->
      <template v-if="compression > 0">
        <text
          :x="layout.ocx"
          :y="layout.ocy + layout.ory + 20"
          class="txt-primary"
          font-size="15"
          font-weight="600"
          text-anchor="middle"
        >
          {{ dt('compression', { pct: compressionPercent?.toFixed(0) }) }}
        </text>
      </template>

      <!-- d_g — 底部 -->
      <line
        :x1="layout.gl + layout.gw / 2"
        :y1="layout.gt + layout.gh + 12"
        :x2="layout.gl + layout.gw / 2"
        :y2="layout.dgLineEndY"
        class="dim-line dim-line--dg"
      />
      <SvgMathText :x="layout.gl + layout.gw / 2" :y="layout.dgTextY" :text="labelDg" anchor="middle" class-name="txt-primary" color="#409eff" :width="140" :font-size="17" />

      <!-- 挤出间隙 -->
      <template v-if="showExtrusion && layout.gapW > 2">
        <line
          :x1="layout.gl + layout.gw"
          :y1="layout.ocy"
          :x2="layout.gl + layout.gw + layout.gapW"
          :y2="layout.ocy"
          class="gap-line"
        />
        <text
          :x="layout.gl + layout.gw + layout.gapW + 6"
          :y="layout.ocy + 5"
          class="txt-pro"
          font-size="14"
        >
          {{ dt('gap') }}
        </text>
      </template>

      <!-- 压力 -->
      <template v-if="pressure > 0">
        <line :x1="20" :y1="layout.ocy" :x2="42" :y2="layout.ocy" marker-end="url(#oring-arrow-blue)" class="pressure-arrow" />
        <SvgMathText x="10" :y="layout.ocy - 8" text="$P$" class-name="txt-primary" color="#409eff" :width="20" :font-size="18" />
      </template>

      <!-- 孔径 -->
      <template v-if="boreDiameter">
        <line :x1="layout.boreX" :y1="layout.hy" :x2="layout.boreX" :y2="layout.hy + layout.hh" class="bore-line" />
        <text :x="layout.boreX + 8" :y="layout.hy + layout.hh / 2" class="txt-muted" font-size="15">{{ dt('bore', { bore: boreDiameter }) }}</text>
      </template>

      <!-- 自由截面放大（独立区域，右下角） -->
      <g :transform="`translate(${layout.insetX}, ${layout.insetY})`">
        <rect x="0" y="0" :width="layout.insetW" :height="layout.insetH" rx="6" class="inset-box" />
        <text x="10" y="20" class="txt-muted" font-size="14">{{ dt('freeSection') }}</text>
        <circle :cx="layout.insetW / 2" :cy="layout.insetH / 2 + 6" :r="layout.insetR" class="oring-inset" />
        <line
          :x1="layout.insetW / 2 - layout.insetR"
          :y1="layout.insetH - 14"
          :x2="layout.insetW / 2 + layout.insetR"
          :y2="layout.insetH - 14"
          marker-start="url(#oring-arrow)"
          marker-end="url(#oring-arrow)"
          class="dim-line"
        />
        <SvgMathText :x="layout.insetW / 2" :y="layout.insetH - 2" :text="labelCsInset" anchor="middle" :width="100" :font-size="14" />
      </g>

      <template v-if="showPro && stretchPercent > 0">
        <text :x="layout.hx + 8" :y="layout.hy + layout.hh + 18" class="txt-pro" font-size="14">
          {{ dt('installStretch', { pct: stretchPercent?.toFixed(1) }) }}
        </text>
      </template>
    </svg>

    <ul class="oring-diagram__legend">
      <li v-for="item in legendItems" :key="item.key" class="oring-diagram__legend-item">
        <span class="oring-diagram__dot" :class="`oring-diagram__dot--${item.tone}`" />
        <span>
          <strong><MathContent :text="enrichedName(item.name)" /></strong>
          <span class="text-gray-500"> — <MathContent :text="enrichedDesc(item.desc)" /></span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'
import { enrichMathText } from '@/utils/math-label'

const { dt, locale, dm } = useDiagramI18n('oRing')

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

const PX = 7

const layout = computed(() => {
  const hx = 36
  const hy = 72
  const hw = 300
  const hh = 210

  const gw = Math.min(120, Math.max(44, props.grooveWidth * PX))
  const gh = Math.min(72, Math.max(28, props.grooveDepth * PX))
  const gl = hx + 72
  const gt = hy + 58

  const orx = Math.max(12, (props.crossSection * PX) / 2)
  const compressRatio = 1 - (props.compressionPercent ?? 20) / 200
  const ory = Math.max(9, orx * compressRatio)
  const ocx = gl + gw * 0.42
  const ocy = gt + gh - ory - 3
  const compressH = orx - ory

  const wLineY = gt - 26
  const wTextY = gt - 32
  const hLineX = gl - 22
  const hTextX = gl - 28

  const csLineX = ocx + orx + 22
  const csTextX = csLineX + 8

  const dgLineEndY = hy + hh - 8
  const dgTextY = dgLineEndY + 18

  const gapW = (props.extrusionGap ?? 0.15) * PX * 2
  const boreX = hx + hw - 4

  const insetW = 118
  const insetH = 88
  const insetX = hx + hw + 24
  const insetY = hy + hh - insetH - 8
  const insetR = Math.min(20, Math.max(11, props.crossSection * PX * 0.36))

  return {
    hx, hy, hw, hh,
    gl, gt, gw, gh,
    ocx, ocy, orx, ory,
    wLineY, wTextY,
    hLineX, hTextX,
    csLineX, csTextX,
    compressH,
    dgLineEndY, dgTextY,
    gapW,
    boreX,
    insetX, insetY, insetW, insetH, insetR,
  }
})

const grooveDepthLabel = computed(() => props.grooveDepth?.toFixed(2) ?? '—')
const labelW = computed(() => `$w$ = ${props.grooveWidth} mm`)
const labelDg = computed(() => `$d_g$ = ${props.grooveDiameter} mm`)
const labelCsInset = computed(() => `$d_{cs}$ ${props.crossSection} mm`)

function enrichedName(name) {
  return enrichMathText(String(name))
}
function enrichedDesc(desc) {
  return enrichMathText(String(desc))
}
const showExtrusion = computed(() => props.calcMode !== 'simple')
const showPro = computed(() => props.calcMode === 'professional')

const legendItems = computed(() => {
  locale.value
  const base = [
    { key: 'cs', name: 'd_cs', desc: dt('legend.cs'), tone: 'base' },
    { key: 'dg', name: 'd_g', desc: dt('legend.dg'), tone: 'base' },
    { key: 'w', name: 'w', desc: dt('legend.w'), tone: 'base' },
    { key: 'h', name: 'h', desc: dt('legend.h'), tone: 'base' },
  ]
  if (props.calcMode !== 'simple') {
    base.push({ key: 'gap', name: dt('legendName.gap'), desc: dt('legend.gap'), tone: 'complete' })
  }
  if (showPro.value) {
    base.push(
      { key: 'stretch', name: dt('legendName.stretch'), desc: dt('legend.stretch'), tone: 'pro' },
      { key: 'p', name: 'P', desc: dt('legend.p'), tone: 'pro' },
    )
  }
  return base
})
</script>

<style scoped>
.oring-diagram {
  @apply mt-5 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-600 dark:bg-gray-900/40;
}

.oring-diagram__head {
  @apply mb-2;
}

.oring-diagram__title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-100;
}

.oring-diagram__hint {
  @apply mt-0.5 text-xs text-gray-500 dark:text-gray-400;
}

.oring-diagram__svg {
  @apply mx-auto block w-full max-w-lg;
}

.oring-diagram__svg .housing {
  fill: #e2e8f0;
  stroke: #94a3b8;
  stroke-width: 1.5;
}

.dark .oring-diagram__svg .housing {
  fill: #334155;
  stroke: #64748b;
}

.oring-diagram__svg .groove-cavity {
  fill: #f8fafc;
  stroke: #64748b;
  stroke-width: 1.5;
}

.dark .oring-diagram__svg .groove-cavity {
  fill: #1e293b;
}

.oring-diagram__svg .groove-floor {
  stroke: #475569;
  stroke-width: 2.5;
}

.oring-diagram__svg .oring {
  fill: #1e293b;
  stroke: #0f172a;
  stroke-width: 2;
}

.dark .oring-diagram__svg .oring {
  fill: #475569;
  stroke: #94a3b8;
}

.oring-diagram__svg .oring-inset {
  fill: #334155;
  stroke: #64748b;
  stroke-width: 1.5;
}

.oring-diagram__svg .gap-line {
  stroke: #f59e0b;
  stroke-width: 2.5;
  stroke-dasharray: 4 3;
}

.oring-diagram__svg .compress-line {
  stroke: #409eff;
  stroke-width: 2;
}

.oring-diagram__svg .pressure-arrow {
  stroke: #409eff;
  stroke-width: 2.5;
}

.oring-diagram__svg .dim-line {
  stroke: #64748b;
  stroke-width: 2;
}

.oring-diagram__svg .dim-line--dg {
  stroke-dasharray: 5 4;
}

.oring-diagram__svg .bore-line {
  stroke: #94a3b8;
  stroke-width: 2;
  stroke-dasharray: 6 4;
}

.oring-diagram__svg .txt {
  fill: #334155;
  font-family: system-ui, -apple-system, sans-serif;
}

.dark .oring-diagram__svg .txt {
  fill: #e2e8f0;
}

.oring-diagram__svg .txt-primary {
  fill: #409eff;
  font-family: system-ui, -apple-system, sans-serif;
}

.oring-diagram__svg .txt-sub {
  fill: #64748b;
  font-family: system-ui, -apple-system, sans-serif;
}

.oring-diagram__svg .txt-muted {
  fill: #94a3b8;
  font-family: system-ui, -apple-system, sans-serif;
}

.oring-diagram__svg .txt-pro {
  fill: #8b5cf6;
  font-family: system-ui, -apple-system, sans-serif;
}

.oring-diagram__svg .inset-box {
  fill: white;
  stroke: #cbd5e1;
  stroke-width: 1.5;
}

.dark .oring-diagram__svg .inset-box {
  fill: #1e293b;
  stroke: #475569;
}

.oring-diagram__legend {
  @apply mt-3 grid gap-1.5 border-t border-gray-200 pt-3 text-xs dark:border-gray-600 sm:grid-cols-2;
}

.oring-diagram__legend-item {
  @apply flex items-start gap-2 text-gray-700 dark:text-gray-300;
}

.oring-diagram__dot {
  @apply mt-1 h-2 w-2 shrink-0 rounded-full;
}

.oring-diagram__dot--base {
  @apply bg-gray-400;
}

.oring-diagram__dot--complete {
  @apply bg-primary;
}

.oring-diagram__dot--pro {
  @apply bg-violet-500;
}
</style>
