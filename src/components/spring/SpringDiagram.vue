<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(freeLength ? dt('hintWithH0') : dt('hint'))" /></p>
    </header>

    <!--
      固定示意：弹簧中心线 x∈[200,280] 对应 D₂，右端 x=280 贴线圈；
      d 圆截面在右线圈上，H₀ 尺寸线在最右侧 x=350，避免与 d 标注重叠。
    -->
    <svg
      class="mech-diagram__svg"
      viewBox="0 0 480 260"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      :aria-label="dt('aria')"
    >
      <defs>
        <marker id="spr-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="spr-arr-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 端板 -->
      <rect x="90" y="32" width="300" height="8" rx="1" class="end-plate" />
      <rect x="90" y="184" width="300" height="8" rx="1" class="end-plate" />

      <!-- 弹簧中心线（左右交替 200↔280） -->
      <path
        d="M 200 48 Q 280 62 200 76 Q 280 90 200 104 Q 280 118 200 132 Q 280 146 200 160 Q 280 174 200 180"
        fill="none"
        stroke="#409eff"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 载荷 F -->
      <line x1="240" y1="10" x2="240" y2="30" stroke="#8b5cf6" stroke-width="2" marker-end="url(#spr-arr-blue)" />
      <text x="248" y="20" class="lbl-force">F</text>

      <!-- 有效圈数 n（左侧，对应有效段 y=48~180） -->
      <line x1="168" y1="48" x2="168" y2="180" class="dim" marker-start="url(#spr-arr)" marker-end="url(#spr-arr)" />
      <line x1="174" y1="48" x2="162" y2="48" class="ext-line" />
      <line x1="174" y1="180" x2="162" y2="180" class="ext-line" />
      <text x="155" y="118" class="lbl-muted" text-anchor="middle">n</text>

      <!-- 线径 d：圆心在右线圈 (280,118)，竖向尺寸线 -->
      <circle cx="280" cy="118" r="7" class="wire-sample" />
      <line x1="280" y1="108" x2="280" y2="128" class="dim" marker-start="url(#spr-arr)" marker-end="url(#spr-arr)" />
      <line x1="274" y1="108" x2="286" y2="108" class="ext-line" />
      <line x1="274" y1="128" x2="286" y2="128" class="ext-line" />
      <text x="292" y="122" class="lbl-muted">d</text>

      <!-- 中径 D₂：底部水平尺寸，端点对准线圈中心 x=200、280 -->
      <line x1="200" y1="114" x2="200" y2="210" class="ext-line" />
      <line x1="280" y1="114" x2="280" y2="210" class="ext-line" />
      <line x1="200" y1="210" x2="280" y2="210" class="dim-primary" marker-start="url(#spr-arr-blue)" marker-end="url(#spr-arr-blue)" />
      <text x="240" y="228" class="lbl-primary" text-anchor="middle">D2</text>

      <!-- 自由高度 H₀：最右侧独立尺寸线，不与 d 重叠 -->
      <line x1="350" y1="40" x2="350" y2="184" class="dim-primary" marker-start="url(#spr-arr-blue)" marker-end="url(#spr-arr-blue)" />
      <line x1="356" y1="40" x2="344" y2="40" class="ext-line" />
      <line x1="356" y1="184" x2="344" y2="184" class="ext-line" />
      <text x="362" y="118" class="lbl-primary">H0</text>
    </svg>

    <dl class="mech-diagram__params">
      <div class="mech-diagram__param">
        <dt><MathContent text="$d$" /></dt>
        <dd>{{ formatMm(wireDiameter) }}</dd>
      </div>
      <div v-if="outerDiameter" class="mech-diagram__param">
        <dt><MathContent text="$D$" /></dt>
        <dd>{{ formatMm(outerDiameter) }}</dd>
      </div>
      <div class="mech-diagram__param">
        <dt><MathContent text="$D_2$" /></dt>
        <dd>{{ formatMm(meanDiameter) }}</dd>
      </div>
      <div class="mech-diagram__param">
        <dt><MathContent text="$n$" /></dt>
        <dd>{{ formatCoils(activeCoils) }}</dd>
      </div>
      <div v-if="totalCoils" class="mech-diagram__param">
        <dt><MathContent text="$n_t$" /></dt>
        <dd>{{ formatCoils(totalCoils) }}</dd>
      </div>
      <div v-if="freeLength" class="mech-diagram__param">
        <dt><MathContent text="$H_0$" /></dt>
        <dd>{{ formatMm(freeLength) }}</dd>
      </div>
      <div v-if="installHeight" class="mech-diagram__param">
        <dt><MathContent text="$H_1$" /></dt>
        <dd>{{ formatMm(installHeight) }}</dd>
      </div>
      <div v-if="workingHeight" class="mech-diagram__param">
        <dt><MathContent text="$H_2$" /></dt>
        <dd>{{ formatMm(workingHeight) }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
import MathContent from '@/components/common/MathContent.vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('spring')

defineProps({
  wireDiameter: { type: Number, default: 3 },
  meanDiameter: { type: Number, default: 24 },
  outerDiameter: { type: Number, default: 0 },
  activeCoils: { type: Number, default: 8 },
  totalCoils: { type: Number, default: 0 },
  freeLength: { type: Number, default: 0 },
  installHeight: { type: Number, default: 0 },
  workingHeight: { type: Number, default: 0 },
})

function formatMm(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  const decimals = value < 10 ? 2 : 1
  return `${value.toFixed(decimals)} mm`
}

function formatCoils(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}

.mech-diagram__head {
  @apply mb-3;
}

.mech-diagram__title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-100;
}

.mech-diagram__hint {
  @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}

.mech-diagram__svg {
  @apply mx-auto block w-full max-w-lg;
}

.mech-diagram__svg .end-plate {
  fill: #94a3b8;
  fill-opacity: 0.55;
  stroke: #64748b;
}

.mech-diagram__svg .wire-sample {
  fill: rgba(64, 158, 255, 0.25);
  stroke: #409eff;
  stroke-width: 1.5;
}

.mech-diagram__svg .dim {
  stroke: #64748b;
  stroke-width: 1.2;
  fill: none;
}

.mech-diagram__svg .dim-primary {
  stroke: #409eff;
  stroke-width: 1.5;
  fill: none;
}

.mech-diagram__svg .ext-line {
  stroke: #94a3b8;
  stroke-width: 1;
  fill: none;
}

.mech-diagram__svg .lbl-muted {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  fill: #475569;
}

.mech-diagram__svg .lbl-primary {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  fill: #409eff;
}

.mech-diagram__svg .lbl-force {
  font-family: system-ui, sans-serif;
  font-size: 13px;
  fill: #8b5cf6;
}

.dark .mech-diagram__svg .lbl-muted {
  fill: #cbd5e1;
}

.mech-diagram__params {
  @apply mt-4 grid gap-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-700;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.mech-diagram__param {
  @apply flex flex-col gap-0.5 rounded-md bg-white/70 px-3 py-2 dark:bg-gray-800/60;
}

.mech-diagram__param dt {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.mech-diagram__param dd {
  @apply font-mono text-sm font-medium text-gray-800 dark:text-gray-100;
}
</style>
