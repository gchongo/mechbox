<template>
  <div class="oring-diagram">
    <header class="oring-diagram__head">
      <h3 class="oring-diagram__title">沟槽截面示意图</h3>
      <p class="oring-diagram__hint">对照下图理解各输入项在沟槽中的位置与含义</p>
    </header>

    <svg
      class="oring-diagram__svg"
      viewBox="0 0 540 300"
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

      <!-- 壳体 -->
      <rect x="32" y="36" width="340" height="220" rx="4" class="housing" />
      <text x="44" y="58" class="txt-muted" font-size="16">壳体 / 孔壁</text>

      <!-- 沟槽 -->
      <rect
        :x="grooveLeft"
        :y="grooveTop"
        :width="grooveWpx"
        :height="grooveHpx"
        rx="2"
        class="groove-cavity"
      />
      <line
        :x1="grooveLeft"
        :y1="grooveTop + grooveHpx"
        :x2="grooveLeft + grooveWpx"
        :y2="grooveTop + grooveHpx"
        class="groove-floor"
      />

      <!-- O 型圈 -->
      <ellipse :cx="oringCx" :cy="oringCy" :rx="oringRx" :ry="oringRy" class="oring" />

      <!-- 挤出间隙 -->
      <template v-if="showExtrusion && extrusionGapPx > 2">
        <line
          :x1="grooveLeft + grooveWpx"
          :y1="oringCy"
          :x2="grooveLeft + grooveWpx + extrusionGapPx"
          :y2="oringCy"
          class="gap-line"
        />
        <text
          :x="grooveLeft + grooveWpx + extrusionGapPx + 6"
          :y="oringCy + 6"
          class="txt-pro"
          font-size="17"
        >
          挤出间隙
        </text>
      </template>

      <!-- 压力 -->
      <template v-if="pressure > 0">
        <line x1="16" y1="140" x2="36" y2="140" marker-end="url(#oring-arrow-blue)" class="pressure-arrow" />
        <text x="8" y="132" class="txt-primary" font-size="20" font-weight="700">P</text>
      </template>

      <!-- d_cs -->
      <line
        :x1="oringCx - oringRx"
        :y1="oringCy - oringRy - 12"
        :x2="oringCx + oringRx"
        :y2="oringCy - oringRy - 12"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <text :x="oringCx - 42" :y="oringCy - oringRy - 18" class="txt" font-size="19" font-weight="600">
        d_cs = {{ crossSection }} mm
      </text>

      <!-- w 沟槽宽 -->
      <line
        :x1="grooveLeft"
        :y1="grooveTop - 16"
        :x2="grooveLeft + grooveWpx"
        :y2="grooveTop - 16"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <text :x="grooveLeft + grooveWpx / 2 - 48" :y="grooveTop - 22" class="txt" font-size="19" font-weight="600">
        w = {{ grooveWidth }} mm
      </text>

      <!-- h 沟槽深 -->
      <line
        :x1="grooveLeft - 16"
        :y1="grooveTop"
        :x2="grooveLeft - 16"
        :y2="grooveTop + grooveHpx"
        marker-start="url(#oring-arrow)"
        marker-end="url(#oring-arrow)"
        class="dim-line"
      />
      <text :x="grooveLeft - 72" :y="grooveTop + grooveHpx / 2 - 4" class="txt" font-size="19" font-weight="600">h</text>
      <text :x="grooveLeft - 88" :y="grooveTop + grooveHpx / 2 + 16" class="txt-sub" font-size="17">
        {{ grooveDepthLabel }} mm
      </text>

      <!-- 压缩 -->
      <template v-if="compression > 0">
        <line
          :x1="oringCx + oringRx + 10"
          :y1="oringCy - oringRy"
          :x2="oringCx + oringRx + 10"
          :y2="oringCy - oringRy + compressPx"
          class="compress-line"
        />
        <text
          :x="oringCx + oringRx + 14"
          :y="oringCy - oringRy + compressPx / 2 + 6"
          class="txt-primary"
          font-size="18"
          font-weight="600"
        >
          压缩 {{ compressionPercent?.toFixed(0) }}%
        </text>
      </template>

      <!-- d_g -->
      <line
        :x1="grooveLeft + grooveWpx / 2"
        :y1="grooveTop + grooveHpx + 10"
        :x2="grooveLeft + grooveWpx / 2"
        y2="268"
        class="dim-line dim-line--dg"
      />
      <text
        :x="grooveLeft + grooveWpx / 2 - 58"
        y="284"
        class="txt-primary"
        font-size="19"
        font-weight="700"
      >
        d_g = {{ grooveDiameter }} mm
      </text>
      <text :x="grooveLeft + grooveWpx / 2 - 36" y="298" class="txt-sub" font-size="16">沟槽底径</text>

      <!-- 孔径 -->
      <template v-if="boreDiameter">
        <line x1="388" y1="36" x2="388" y2="256" class="bore-line" />
        <text x="396" y="150" class="txt-muted" font-size="17">孔径 Ø{{ boreDiameter }}</text>
      </template>

      <!-- 自由截面放大 -->
      <g transform="translate(388, 168)">
        <rect x="0" y="0" width="132" height="96" rx="6" class="inset-box" />
        <text x="10" y="22" class="txt-muted" font-size="16">自由截面</text>
        <circle cx="48" cy="54" :r="insetR" class="oring-inset" />
        <line
          :x1="48 - insetR"
          y1="76"
          :x2="48 + insetR"
          y2="76"
          marker-start="url(#oring-arrow)"
          marker-end="url(#oring-arrow)"
          class="dim-line"
        />
        <text x="14" y="92" class="txt" font-size="17" font-weight="600">d_cs {{ crossSection }} mm</text>
      </g>

      <template v-if="showPro && stretchPercent > 0">
        <text x="36" y="292" class="txt-pro" font-size="17">安装拉伸 {{ stretchPercent?.toFixed(1) }}%</text>
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

const PX_PER_MM = 8

const grooveWpx = computed(() => Math.min(140, Math.max(48, props.grooveWidth * PX_PER_MM)))
const grooveHpx = computed(() => Math.min(90, Math.max(32, props.grooveDepth * PX_PER_MM)))
const oringRx = computed(() => Math.max(14, (props.crossSection * PX_PER_MM) / 2))
const oringRy = computed(() => {
  const compressRatio = 1 - (props.compressionPercent ?? 20) / 200
  return Math.max(10, oringRx.value * compressRatio)
})
const compressPx = computed(() => oringRx.value - oringRy.value)
const extrusionGapPx = computed(() => (props.extrusionGap ?? 0.15) * PX_PER_MM * 2)

const grooveLeft = computed(() => 168)
const grooveTop = computed(() => 108)
const oringCx = computed(() => grooveLeft.value + grooveWpx.value * 0.42)
const oringCy = computed(() => grooveTop.value + grooveHpx.value - oringRy.value - 2)

const insetR = computed(() => Math.min(22, Math.max(12, props.crossSection * PX_PER_MM * 0.38)))
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
