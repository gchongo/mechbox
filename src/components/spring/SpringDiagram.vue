<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(freeLength ? dt('hintWithL0') : dt('hint'))" /></p>
    </header>

    <img
      class="mech-diagram__img"
      src="/images/diagrams/spring-compression.svg"
      :alt="dt('aria')"
      width="480"
      height="220"
      loading="lazy"
      decoding="async"
    />

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

.mech-diagram__img {
  @apply mx-auto block w-full max-w-lg;
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
