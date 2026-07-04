<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(freeLength ? dt('hintWithH0') : dt('hint'))" /></p>
    </header>

    <svg
      class="mech-diagram__svg"
      viewBox="0 0 480 240"
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

      <rect x="100" y="34" width="280" height="8" rx="1" class="end-plate" />
      <rect x="100" y="178" width="280" height="8" rx="1" class="end-plate" />

      <path
        d="M 178 48 Q 302 61 178 74 Q 302 87 178 100 Q 302 113 178 126 Q 302 139 178 152 Q 302 165 178 174"
        fill="none"
        stroke="#409eff"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <line x1="240" y1="12" x2="240" y2="32" stroke="#8b5cf6" stroke-width="2" marker-end="url(#spr-arr-blue)" />
      <text x="248" y="22" class="lbl-force">F</text>

      <line x1="162" y1="48" x2="162" y2="174" class="dim" marker-start="url(#spr-arr)" marker-end="url(#spr-arr)" />
      <line x1="168" y1="48" x2="156" y2="48" class="ext-line" />
      <line x1="168" y1="174" x2="156" y2="174" class="ext-line" />
      <text x="148" y="115" class="lbl-muted" text-anchor="middle">n</text>

      <circle cx="302" cy="113" r="5.5" class="wire-sample" />
      <line x1="314" y1="113" x2="326" y2="113" class="dim" marker-start="url(#spr-arr)" marker-end="url(#spr-arr)" />
      <line x1="307" y1="113" x2="314" y2="113" class="ext-line" />
      <text x="332" y="117" class="lbl-muted">d</text>

      <line x1="178" y1="111" x2="178" y2="196" class="ext-line" />
      <line x1="302" y1="111" x2="302" y2="196" class="ext-line" />
      <line x1="178" y1="196" x2="302" y2="196" class="dim-primary" marker-start="url(#spr-arr-blue)" marker-end="url(#spr-arr-blue)" />
      <text x="240" y="212" class="lbl-primary" text-anchor="middle">D2</text>

      <line x1="178" y1="48" x2="328" y2="48" class="ext-line" />
      <line x1="178" y1="174" x2="328" y2="174" class="ext-line" />
      <line x1="328" y1="48" x2="328" y2="174" class="dim-primary" marker-start="url(#spr-arr-blue)" marker-end="url(#spr-arr-blue)" />
      <text x="340" y="115" class="lbl-primary">H0</text>
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
