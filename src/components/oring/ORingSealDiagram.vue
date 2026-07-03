<template>
  <div class="oring-diagram">
    <header class="oring-diagram__head">
      <h3 class="oring-diagram__title">沟槽截面示意图</h3>
      <p class="oring-diagram__hint">径向静密封沟槽 — 对照标注理解各输入尺寸</p>
    </header>

    <svg
      class="oring-diagram__svg"
      viewBox="0 0 720 420"
      role="img"
      aria-label="O 型圈沟槽参数示意图"
    >
      <defs>
        <marker id="oring-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="oring-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 缸孔 / 壳体 -->
      <rect x="56" y="48" width="420" height="280" rx="4" class="housing" />
      <text x="68" y="72" class="label label--muted">壳体 / 孔壁</text>

      <!-- 沟槽腔 -->
      <rect
        :x="grooveLeft"
        :y="grooveTop"
        :width="grooveWpx"
        :height="grooveHpx"
        rx="2"
        class="groove-cavity"
      />

      <!-- 沟槽底面 -->
      <line
        :x1="grooveLeft"
        :y1="grooveTop + grooveHpx"
        :x2="grooveLeft + grooveWpx"
        :y2="grooveTop + grooveHpx"
        class="groove-floor"
      />

      <!-- O 型圈（压缩后略扁） -->
      <ellipse
        :cx="oringCx"
        :cy="oringCy"
        :rx="oringRx"
        :ry="oringRy"
        class="oring"
      />

      <!-- 挤出间隙 -->
      <template v-if="showExtrusion && extrusionGapPx > 2">
        <line
          :x1="grooveLeft + grooveWpx"
          :y1="oringCy"
          :x2="grooveLeft + grooveWpx + extrusionGapPx"
          :y2="oringCy"
          class="gap-line"
        />
        <text :x="grooveLeft + grooveWpx + extrusionGapPx + 4" :y="oringCy + 4" class="label label--pro">
          挤出间隙
        </text>
      </template>

      <!-- 压力方向 -->
      <template v-if="pressure > 0">
        <line x1="24" y1="150" x2="44" y2="150" marker-end="url(#oring-arrow-blue)" class="pressure-arrow" />
        <text x="8" y="142" class="label label--primary">P</text>
      </template>

      <!-- d_cs 截面直径 -->
      <line
        :x1="oringCx - oringRx"
        :y1="oringCy - oringRy - 10"
        :x2="oringCx + oringRx"
        :y2="oringCy - oringRy - 10"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <text :x="oringCx - 28" :y="oringCy - oringRy - 14" class="label">d_cs {{ crossSection }}</text>
      <text :x="oringCx - 18" :y="oringCy - oringRy - 2" class="label-sub">mm</text>

      <!-- 沟槽宽度 w -->
      <line
        :x1="grooveLeft"
        :y1="grooveTop - 14"
        :x2="grooveLeft + grooveWpx"
        :y2="grooveTop - 14"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <text :x="grooveLeft + grooveWpx / 2 - 36" :y="grooveTop - 18" class="label">w 沟槽宽 {{ grooveWidth }}</text>

      <!-- 沟槽深度 h -->
      <line
        :x1="grooveLeft - 14"
        :y1="grooveTop"
        :x2="grooveLeft - 14"
        :y2="grooveTop + grooveHpx"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <text :x="grooveLeft - 52" :y="grooveTop + grooveHpx / 2 + 4" class="label">h</text>
      <text :x="grooveLeft - 58" :y="grooveTop + grooveHpx / 2 + 16" class="label-sub">{{ grooveDepthLabel }} mm</text>

      <!-- 压缩量 -->
      <template v-if="compression > 0">
        <line
          :x1="oringCx + oringRx + 8"
          :y1="oringCy - oringRy"
          :x2="oringCx + oringRx + 8"
          :y2="oringCy - oringRy + compressPx"
          class="compress-line"
        />
        <text :x="oringCx + oringRx + 12" :y="oringCy - oringRy + compressPx / 2 + 4" class="label label--compress">
          压缩 {{ compressionPercent?.toFixed(0) }}%
        </text>
      </template>

      <!-- 沟槽底径 d_g -->
      <line
        :x1="grooveLeft + grooveWpx / 2"
        :y1="grooveTop + grooveHpx + 8"
        :x2="grooveLeft + grooveWpx / 2"
        :y2="360"
        class="dim-line dim-line--dg"
      />
      <text :x="grooveLeft + grooveWpx / 2 - 52" y="382" class="label label--primary">d_g 沟槽底径</text>
      <text :x="grooveLeft + grooveWpx / 2 - 28" y="402" class="label-sub">{{ grooveDiameter }} mm</text>

      <!-- 孔径示意 -->
      <template v-if="boreDiameter">
        <path d="M 520 48 L 520 328" class="bore-line" />
        <text x="528" y="190" class="label label--muted">孔径 Ø{{ boreDiameter }}</text>
      </template>

      <!-- 放大：自由截面 -->
      <g transform="translate(520, 260)">
        <rect x="0" y="0" width="160" height="100" rx="8" class="inset-box" />
        <text x="12" y="22" class="label-inset-title">自由截面</text>
        <circle cx="56" cy="58" :r="insetR" class="oring-inset" />
        <line :x1="56 - insetR" y1="82" :x2="56 + insetR" y2="82" marker-start="url(#oring-arrow)" marker-end="url(#oring-arrow)" class="dim-line" />
        <text x="32" y="96" class="label-inset">d_cs = {{ crossSection }} mm</text>
      </g>

      <!-- 专业：安装拉伸 -->
      <template v-if="showPro && stretchPercent > 0">
        <text x="56" y="408" class="label label--pro">安装拉伸 {{ stretchPercent?.toFixed(1) }}%</text>
      </template>
    </svg>

    <ul class="oring-diagram__legend">
      <li v-for="item in legendItems" :key="item.key" class="oring-diagram__legend-item">
        <span class="oring-diagram__dot" :class="`oring-diagram__dot--${item.tone}`" />
        <span>
          <strong>{{ item.name }}</strong>
          <span class="text-gray-500"> — {{ item.desc }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'

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

const PX_PER_MM = 9

const grooveWpx = computed(() => Math.min(180, Math.max(56, props.grooveWidth * PX_PER_MM)))
const grooveHpx = computed(() => Math.min(120, Math.max(40, props.grooveDepth * PX_PER_MM)))
const oringRx = computed(() => Math.max(16, (props.crossSection * PX_PER_MM) / 2))
const oringRy = computed(() => {
  const compressRatio = 1 - (props.compressionPercent ?? 20) / 200
  return Math.max(12, oringRx.value * compressRatio)
})
const compressPx = computed(() => oringRx.value - oringRy.value)
const extrusionGapPx = computed(() => (props.extrusionGap ?? 0.15) * PX_PER_MM * 2.5)

const grooveLeft = computed(() => 220)
const grooveTop = computed(() => 130)
const oringCx = computed(() => grooveLeft.value + grooveWpx.value * 0.45)
const oringCy = computed(() => grooveTop.value + grooveHpx.value - oringRy.value - 2)

const insetR = computed(() => Math.min(28, Math.max(14, props.crossSection * PX_PER_MM * 0.38)))
const grooveDepthLabel = computed(() => props.grooveDepth?.toFixed(2) ?? '—')

const showExtrusion = computed(() => props.calcMode !== 'simple')
const showPro = computed(() => props.calcMode === 'professional')

const legendItems = computed(() => {
  const base = [
    { key: 'cs', name: 'd_cs', desc: 'O 型圈截面直径（线径）', tone: 'base' },
    { key: 'dg', name: 'd_g', desc: '沟槽底径，密封圈安装后的内径基准', tone: 'base' },
    { key: 'w', name: 'w', desc: '沟槽轴向宽度，影响填充率', tone: 'base' },
    { key: 'h', name: 'h', desc: '沟槽径向深度 ≈ d_cs − 压缩量', tone: 'base' },
  ]
  if (props.calcMode !== 'simple') {
    base.push(
      { key: 'gap', name: '挤出间隙', desc: '动压密封时沟槽与对偶面之间的间隙', tone: 'complete' },
      { key: 'fill', name: '填充率', desc: 'O 型圈截面积占沟槽截面积 65–85%', tone: 'complete' },
    )
  }
  if (showPro.value) {
    base.push(
      { key: 'stretch', name: '安装拉伸', desc: '套装时周向拉伸，一般不超过 5%', tone: 'pro' },
      { key: 'p', name: 'P', desc: '介质压力，影响压缩率与挤出校核', tone: 'pro' },
    )
  }
  return base
})
</script>

<style scoped>
.oring-diagram {
  @apply rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-600 dark:bg-gray-900/40;
}

.oring-diagram__head {
  @apply mb-3;
}

.oring-diagram__title {
  @apply text-base font-semibold text-gray-800 dark:text-gray-100;
}

.oring-diagram__hint {
  @apply mt-1 text-sm text-gray-500 dark:text-gray-400;
}

.oring-diagram__svg {
  @apply mx-auto block w-full;
  min-height: 280px;
  max-height: min(520px, 70vh);
}

.oring-diagram__svg .housing {
  fill: #e2e8f0;
  stroke: #94a3b8;
  stroke-width: 1;
}

.dark .oring-diagram__svg .housing {
  fill: #334155;
  stroke: #64748b;
}

.oring-diagram__svg .groove-cavity {
  fill: #f8fafc;
  stroke: #64748b;
  stroke-width: 1.2;
}

.dark .oring-diagram__svg .groove-cavity {
  fill: #1e293b;
}

.oring-diagram__svg .groove-floor {
  stroke: #475569;
  stroke-width: 2;
}

.oring-diagram__svg .oring {
  fill: #1e293b;
  stroke: #0f172a;
  stroke-width: 1.5;
}

.dark .oring-diagram__svg .oring {
  fill: #475569;
  stroke: #94a3b8;
}

.oring-diagram__svg .oring-inset {
  fill: #334155;
  stroke: #64748b;
  stroke-width: 1;
}

.oring-diagram__svg .gap-line {
  stroke: #f59e0b;
  stroke-width: 2;
  stroke-dasharray: 4 3;
}

.oring-diagram__svg .compress-line {
  stroke: #409eff;
  stroke-width: 1.5;
}

.oring-diagram__svg .pressure-arrow {
  stroke: #409eff;
  stroke-width: 2;
}

.oring-diagram__svg .dim-line {
  stroke: #64748b;
  stroke-width: 1.2;
}

.oring-diagram__svg .dim-line--dg {
  stroke-dasharray: 4 3;
}

.oring-diagram__svg .bore-line {
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
}

.oring-diagram__svg .label {
  font-size: 14px;
  fill: #475569;
  font-family: system-ui, sans-serif;
}

.dark .oring-diagram__svg .label {
  fill: #cbd5e1;
}

.oring-diagram__svg .label--primary {
  fill: #409eff;
  font-weight: 600;
}

.oring-diagram__svg .label--compress {
  fill: #409eff;
  font-size: 13px;
}

.oring-diagram__svg .label--pro {
  fill: #8b5cf6;
  font-size: 13px;
}

.oring-diagram__svg .label--muted {
  fill: #94a3b8;
  font-size: 13px;
}

.oring-diagram__svg .label-sub {
  font-size: 12px;
  fill: #94a3b8;
}

.oring-diagram__svg .inset-box {
  fill: white;
  stroke: #e2e8f0;
}

.dark .oring-diagram__svg .inset-box {
  fill: #1e293b;
  stroke: #475569;
}

.oring-diagram__svg .label-inset-title {
  font-size: 12px;
  fill: #94a3b8;
}

.oring-diagram__svg .label-inset {
  font-size: 13px;
  fill: #64748b;
}

.oring-diagram__legend {
  @apply mt-4 grid gap-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-600 sm:grid-cols-2 lg:grid-cols-3;
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
