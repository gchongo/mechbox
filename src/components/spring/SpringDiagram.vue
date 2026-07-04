<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(freeLength ? dt('hintWithL0') : dt('hint'))" /></p>
    </header>

    <svg
      class="mech-diagram__svg"
      viewBox="0 0 480 220"
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

      <rect x="90" y="168" width="300" height="10" rx="2" class="end-plate" />
      <rect x="90" y="42" width="300" height="10" rx="2" class="end-plate" />

      <path
        d="M 150 52 Q 330 68 150 84 Q 330 100 150 116 Q 330 132 150 148 Q 330 164 150 168"
        fill="none"
        stroke="#409eff"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <line x1="240" y1="18" x2="240" y2="38" stroke="#8b5cf6" stroke-width="2" marker-end="url(#spr-arr-blue)" />
      <text x="248" y="28" class="lbl-force">F</text>

      <text x="358" y="58" class="lbl-muted">n</text>

      <circle cx="358" cy="108" r="7" class="wire-sample" />
      <line x1="372" y1="108" x2="388" y2="108" class="dim" marker-start="url(#spr-arr)" marker-end="url(#spr-arr)" />
      <text x="392" y="112" class="lbl-muted">d</text>

      <line x1="150" y1="192" x2="330" y2="192" class="dim-primary" marker-start="url(#spr-arr-blue)" marker-end="url(#spr-arr-blue)" />
      <text x="228" y="210" class="lbl-primary">D2</text>

      <line x1="408" y1="52" x2="408" y2="168" class="dim-primary" marker-start="url(#spr-arr-blue)" marker-end="url(#spr-arr-blue)" />
      <text x="416" y="114" class="lbl-primary">L0</text>
    </svg>

    <dl class="mech-diagram__params">
      <div class="mech-diagram__param">
        <dt><MathContent text="$d$" /></dt>
        <dd>{{ formatMm(wireDiameter) }}</dd>
      </div>
      <div class="mech-diagram__param">
        <dt><MathContent text="$D_2$" /></dt>
        <dd>{{ formatMm(meanDiameter) }}</dd>
      </div>
      <div class="mech-diagram__param">
        <dt><MathContent text="$n$" /></dt>
        <dd>{{ formatCoils(activeCoils) }}</dd>
      </div>
      <div v-if="freeLength" class="mech-diagram__param">
        <dt><MathContent text="$L_0$" /></dt>
        <dd>{{ formatMm(freeLength) }}</dd>
      </div>
      <div v-if="outerDiameter" class="mech-diagram__param">
        <dt><MathContent text="$D$" /></dt>
        <dd>{{ formatMm(outerDiameter) }}</dd>
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
  freeLength: { type: Number, default: 0 },
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
