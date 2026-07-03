<template>
  <div class="bolt-diagram">
    <header class="bolt-diagram__head">
      <h3 class="bolt-diagram__title">{{ dt('title') }}</h3>
      <p class="bolt-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>

    <svg
      class="bolt-diagram__svg"
      viewBox="0 0 520 300"
      role="img"
      :aria-label="dt('aria')"
    >
      <defs>
        <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
        </marker>
      </defs>

      <!-- 被夹紧件 -->
      <rect x="140" y="118" width="240" height="22" rx="2" class="plate" />
      <rect x="140" y="168" width="240" height="22" rx="2" class="plate" />

      <!-- 摩擦锥 D_A（专业） -->
      <path
        v-if="showPro"
        d="M 152 140 L 118 118 L 118 190 L 152 168 Z"
        class="cone cone--da"
      />
      <path
        v-if="showPro"
        d="M 368 140 L 402 118 L 402 190 L 368 168 Z"
        class="cone cone--da"
      />

      <!-- 螺栓杆 -->
      <rect x="248" y="88" width="24" height="124" rx="1" class="shank" />

      <!-- 螺栓头 -->
      <polygon points="236,88 284,88 276,68 244,68" class="head" />
      <!-- 头部摩擦区 D_km -->
      <ellipse
        v-if="showVdi"
        cx="260"
        cy="88"
        :rx="headRx"
        ry="6"
        class="friction friction--head"
      />

      <!-- 螺母 -->
      <polygon points="242,212 278,212 286,232 234,232" class="nut" />

      <!-- 螺纹段示意 -->
      <g v-if="showVdi" class="thread-zone">
        <line x1="252" y1="175" x2="268" y2="175" class="thread-tick" />
        <line x1="252" y1="183" x2="268" y2="183" class="thread-tick" />
        <line x1="252" y1="191" x2="268" y2="191" class="thread-tick" />
        <rect x="246" y="170" width="28" height="28" rx="2" class="friction friction--thread" />
      </g>

      <!-- 孔径 d_h -->
      <rect x="238" y="118" width="44" height="72" fill="none" class="hole" />

      <!-- 预紧力 F -->
      <line x1="260" y1="42" x2="260" y2="64" marker-end="url(#arrow-blue)" class="dim-force" />
      <SvgMathText :x="268" :y="50" :text="dt('preloadF')" class-name="label--primary" color="#409eff" :width="100" />

      <!-- 扭矩 T -->
      <path
        v-if="showTorque"
        d="M 310 78 A 22 22 0 1 1 308 56"
        fill="none"
        class="torque-arc"
      />
      <SvgMathText :x="318" :y="72" text="$T$" class-name="label--primary" color="#409eff" :width="24" />

      <!-- 公称直径 d -->
      <line x1="248" y1="108" x2="218" y2="108" marker-end="url(#arrow-gray)" />
      <line x1="272" y1="108" x2="302" y2="108" marker-end="url(#arrow-gray)" />
      <SvgMathText :x="188" :y="104" :text="dt('nominalD')" :width="100" />

      <!-- 夹紧长度 L_K -->
      <template v-if="showPro">
        <line x1="292" y1="118" x2="292" y2="190" class="dim-line" />
        <line x1="286" y1="118" x2="298" y2="118" class="dim-tick" />
        <line x1="286" y1="190" x2="298" y2="190" class="dim-tick" />
        <SvgMathText :x="300" :y="158" text="$L_K$" class-name="label--pro" color="#8b5cf6" :width="36" />
        <text x="300" y="172" class="label-sub">{{ gripLength }} mm</text>
      </template>

      <!-- 孔径 d_h -->
      <template v-if="showPro">
        <line x1="238" y1="202" x2="208" y2="202" marker-end="url(#arrow-gray)" />
        <line x1="282" y1="202" x2="312" y2="202" marker-end="url(#arrow-gray)" />
        <SvgMathText :x="168" :y="218" :text="dt('holeD')" class-name="label--pro" color="#8b5cf6" :width="80" />
      </template>

      <!-- d_W 头部支承 -->
      <template v-if="showPro">
        <line x1="236" y1="68" x2="206" y2="68" marker-end="url(#arrow-gray)" />
        <line x1="284" y1="68" x2="314" y2="68" marker-end="url(#arrow-gray)" />
        <SvgMathText :x="318" :y="72" text="$d_W$" class-name="label--pro" color="#8b5cf6" :width="36" />
      </template>

      <!-- D_km -->
      <template v-if="showVdi">
        <SvgMathText :x="318" :y="92" text="D_km · μ_K" class-name="label--vdi" color="#409eff" :width="88" />
      </template>

      <!-- μ_G -->
      <template v-if="showVdi">
        <SvgMathText :x="168" :y="188" :text="dt('threadMu')" class-name="label--vdi" color="#409eff" :width="110" />
      </template>

      <!-- 嵌入 f_Z -->
      <template v-if="showPro">
        <g class="embed">
          <line x1="130" y1="118" x2="130" y2="124" />
          <line x1="126" y1="118" x2="134" y2="118" />
          <line x1="126" y1="124" x2="134" y2="124" />
          <SvgMathText :x="72" :y="124" :text="dt('embedFZ')" class-name="label--embed" color="#8b5cf6" :width="72" />
        </g>
      </template>

      <!-- 螺距 P 放大示意 -->
      <g transform="translate(400, 218)">
        <rect x="0" y="0" width="96" height="56" rx="6" class="inset-box" />
        <SvgMathText :x="8" :y="16" :text="dt('threadZoom')" :width="88" :height="18" />
        <path d="M 12 36 L 28 28 L 44 36 L 60 28 L 76 36" fill="none" class="thread-profile" />
        <line x1="12" y1="44" x2="76" y2="44" class="dim-line" />
        <SvgMathText :x="28" :y="54" :text="dt('pitchP')" :width="56" :height="18" />
      </g>

      <!-- 简化模式 μ -->
      <template v-if="calcMode === 'simple'">
        <SvgMathText :x="318" :y="92" :text="dt('muCombined')" class-name="label--simple" color="#f59e0b" :width="72" />
        <ellipse cx="260" cy="88" rx="28" ry="7" class="friction friction--simple" />
      </template>

      <!-- ΔT 专业 -->
      <template v-if="showPro && deltaT">
        <SvgMathText :x="24" :y="148" :text="dt('deltaT')" class-name="label--pro" color="#8b5cf6" :width="48" />
        <text x="24" y="162" class="label-sub">{{ deltaT > 0 ? '+' : '' }}{{ deltaT }} °C</text>
      </template>
    </svg>

    <ul class="bolt-diagram__legend">
      <li v-for="item in legendItems" :key="item.key" class="bolt-diagram__legend-item">
        <span class="bolt-diagram__dot" :class="`bolt-diagram__dot--${item.tone}`" />
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

const { dt, locale, dm } = useDiagramI18n('boltPreload')

function enrichedName(name) {
  return enrichMathText(name)
}

function enrichedDesc(desc) {
  return enrichMathText(desc)
}

const props = defineProps({
  calcMode: { type: String, default: 'simple' },
  mode: { type: String, default: 'torque2force' },
  diameter: { type: Number, default: 10 },
  pitch: { type: Number, default: 1.5 },
  gripLength: { type: Number, default: 20 },
  holeDiameter: { type: Number, default: 11 },
  headContactDiameter: { type: Number, default: 15 },
  outerDiameter: { type: Number, default: 43 },
  dKm: { type: Number, default: 14.5 },
  deltaT: { type: Number, default: 0 },
})

const showVdi = computed(() => props.calcMode === 'vdi2230' || props.calcMode === 'professional')
const showPro = computed(() => props.calcMode === 'professional')
const showTorque = computed(() => props.mode === 'torque2force')

const headRx = computed(() => Math.min(34, Math.max(18, props.dKm * 1.1)))

const legendItems = computed(() => {
  locale.value
  const base = [
    { key: 'd', name: 'd', desc: dt('legend.d'), tone: 'base' },
    { key: 'P', name: 'P', desc: dt('legend.P'), tone: 'base' },
    { key: 'F', name: 'F', desc: dt('legend.F'), tone: 'base' },
  ]
  if (props.mode === 'torque2force') {
    base.push({ key: 'T', name: 'T', desc: dt('legend.T'), tone: 'base' })
  }
  if (props.calcMode === 'simple') {
    base.push({ key: 'mu', name: 'μ', desc: dt('legend.mu'), tone: 'simple' })
  }
  if (showVdi.value) {
    base.push(
      { key: 'muG', name: 'μ_G', desc: dt('legend.muG'), tone: 'vdi' },
      { key: 'muK', name: 'μ_K', desc: dt('legend.muK'), tone: 'vdi' },
      { key: 'dkm', name: 'D_km', desc: dt('legend.dkm'), tone: 'vdi' },
    )
  }
  if (showPro.value) {
    base.push(
      { key: 'lk', name: 'L_K', desc: dt('legend.lk'), tone: 'pro' },
      { key: 'dh', name: 'd_h', desc: dt('legend.dh'), tone: 'pro' },
      { key: 'dw', name: 'd_W', desc: dt('legend.dw'), tone: 'pro' },
      { key: 'da', name: 'D_A', desc: dt('legend.da'), tone: 'pro' },
      { key: 'fz', name: 'f_Z', desc: dt('legend.fz'), tone: 'pro' },
      { key: 'dt', name: 'ΔT', desc: dt('legend.dt'), tone: 'pro' },
    )
  }
  return base
})
</script>

<style scoped>
.bolt-diagram {
  @apply mt-5 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-600 dark:bg-gray-900/40;
}

.bolt-diagram__head {
  @apply mb-2;
}

.bolt-diagram__title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-100;
}

.bolt-diagram__hint {
  @apply mt-0.5 text-xs text-gray-500 dark:text-gray-400;
}

.bolt-diagram__svg {
  @apply mx-auto block w-full max-w-lg;
}

.bolt-diagram__svg .plate {
  fill: #cbd5e1;
}

.dark .bolt-diagram__svg .plate {
  fill: #475569;
}

.bolt-diagram__svg .shank {
  fill: #64748b;
}

.dark .bolt-diagram__svg .shank {
  fill: #94a3b8;
}

.bolt-diagram__svg .head,
.bolt-diagram__svg .nut {
  fill: #475569;
}

.dark .bolt-diagram__svg .head,
.dark .bolt-diagram__svg .nut {
  fill: #64748b;
}

.bolt-diagram__svg .hole {
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}

.bolt-diagram__svg .cone {
  fill: none;
  stroke-width: 1;
  stroke-dasharray: 5 4;
}

.bolt-diagram__svg .cone--da {
  stroke: #8b5cf6;
  opacity: 0.55;
}

.bolt-diagram__svg .friction {
  fill: none;
  stroke-width: 2;
}

.bolt-diagram__svg .friction--head,
.bolt-diagram__svg .friction--simple {
  stroke: #f59e0b;
}

.bolt-diagram__svg .friction--thread {
  stroke: #409eff;
  fill: rgba(64, 158, 255, 0.08);
}

.bolt-diagram__svg .thread-tick {
  stroke: #409eff;
  stroke-width: 1;
  opacity: 0.6;
}

.bolt-diagram__svg .dim-line,
.bolt-diagram__svg .dim-tick {
  stroke: #64748b;
  stroke-width: 1.2;
}

.bolt-diagram__svg .dim-force {
  stroke: #409eff;
  stroke-width: 2;
}

.bolt-diagram__svg .torque-arc {
  stroke: #409eff;
  stroke-width: 2;
  marker-end: url(#arrow-blue);
}

.bolt-diagram__svg .label {
  font-size: 11px;
  fill: #475569;
  font-family: system-ui, sans-serif;
}

.dark .bolt-diagram__svg .label {
  fill: #cbd5e1;
}

.bolt-diagram__svg .label--primary {
  fill: #409eff;
  font-weight: 600;
}

.bolt-diagram__svg .label--vdi {
  fill: #409eff;
}

.bolt-diagram__svg .label--pro {
  fill: #8b5cf6;
}

.bolt-diagram__svg .label--embed {
  fill: #8b5cf6;
  font-size: 10px;
}

.bolt-diagram__svg .label--simple {
  fill: #f59e0b;
}

.bolt-diagram__svg .label-sub {
  font-size: 9px;
  fill: #94a3b8;
}

.bolt-diagram__svg .inset-box {
  fill: white;
  stroke: #e2e8f0;
}

.dark .bolt-diagram__svg .inset-box {
  fill: #1e293b;
  stroke: #475569;
}

.bolt-diagram__svg .label-inset-title {
  font-size: 9px;
  fill: #94a3b8;
}

.bolt-diagram__svg .label-inset {
  font-size: 10px;
  fill: #64748b;
}

.bolt-diagram__svg .thread-profile {
  stroke: #64748b;
  stroke-width: 1.5;
}

.bolt-diagram__svg .embed line {
  stroke: #8b5cf6;
  stroke-width: 1.2;
}

.bolt-diagram__legend {
  @apply mt-3 grid gap-1.5 border-t border-gray-200 pt-3 text-xs dark:border-gray-600 sm:grid-cols-2;
}

.bolt-diagram__legend-item {
  @apply flex items-start gap-2 text-gray-700 dark:text-gray-300;
}

.bolt-diagram__dot {
  @apply mt-1 h-2 w-2 shrink-0 rounded-full;
}

.bolt-diagram__dot--base {
  @apply bg-gray-400;
}

.bolt-diagram__dot--simple {
  @apply bg-amber-500;
}

.bolt-diagram__dot--vdi {
  @apply bg-primary;
}

.bolt-diagram__dot--pro {
  @apply bg-violet-500;
}
</style>
