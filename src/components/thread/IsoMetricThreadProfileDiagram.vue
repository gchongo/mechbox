<template>
  <div class="iso-diagram">
    <header class="iso-diagram__head">
      <h3 class="iso-diagram__title">{{ dt('title') }}</h3>
      <p class="iso-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>

    <div class="iso-diagram__row">
      <div class="iso-diagram__media">
        <img
          class="iso-diagram__img"
          :src="profileImg"
          :alt="dt('aria')"
          draggable="false"
        />
      </div>

      <div class="iso-diagram__side">
        <dl class="iso-diagram__symbols">
          <div v-for="item in symbols" :key="item.sym">
            <dt><MathContent :text="item.sym" /></dt>
            <dd><MathContent :text="dm(item.desc)" /></dd>
          </div>
        </dl>

        <div class="iso-diagram__formulas">
          <p class="iso-diagram__formulas-title">{{ dt('formulasTitle') }}</p>
          <div class="iso-diagram__formula"><MathContent :text="formulaH" /></div>
          <div class="iso-diagram__formula"><MathContent :text="formulaH1" /></div>
          <div class="iso-diagram__formula"><MathContent :text="formulaD2" /></div>
          <div class="iso-diagram__formula"><MathContent :text="formulaD1" /></div>
          <div class="iso-diagram__formula"><MathContent :text="formulaD3" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'
import profileImg from '@/assets/diagrams/iso-metric-thread-profile.png'

const { dt, dm } = useDiagramI18n('isoMetricProfile')

const symbols = computed(() => [
  { sym: '$D, d$', desc: dt('symDd') },
  { sym: '$D_2, d_2$', desc: dt('symD2') },
  { sym: '$D_1$', desc: dt('symD1') },
  { sym: '$d_3$', desc: dt('symD3') },
  { sym: '$P$', desc: dt('symP') },
  { sym: '$H$', desc: dt('symH') },
  { sym: '$H_1$', desc: dt('symH1') },
  { sym: '$h_3$', desc: dt('symH3') },
  { sym: '$R_{\\mathrm{min}}$', desc: dt('symRmin') },
])

const formulaH =
  '$H=\\frac{\\sqrt{3}}{2}\\,P\\approx 0.866025\\,P$'
const formulaH1 =
  '$H_1=\\frac{5}{8}H=\\frac{5\\sqrt{3}}{8}\\,P\\approx 0.541266\\,P$'
const formulaD2 =
  '$D_2=d_2=D-\\frac{3}{4}H=d-\\frac{3\\sqrt{3}}{8}\\,P\\approx D-0.649519\\,P$'
const formulaD1 =
  '$D_1=D-\\frac{5}{4}H=D-\\frac{5\\sqrt{3}}{8}\\,P\\approx D-1.082532\\,P$'
const formulaD3 =
  '$h_3=\\frac{17}{24}H\\approx 0.613435\\,P,\\qquad d_3=d-2h_3=d-\\frac{17}{12}H\\approx d-1.226870\\,P$'
</script>

<style scoped>
.iso-diagram {
  @apply rounded-lg border border-gray-200 bg-white p-2.5 dark:border-gray-700 dark:bg-gray-900/40;
}
.iso-diagram__head { @apply mb-2; }
.iso-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.iso-diagram__hint { @apply mt-0.5 text-xs text-gray-500 dark:text-gray-400; }

.iso-diagram__row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 900px) {
  .iso-diagram__row {
    flex-direction: row;
    align-items: flex-start;
    gap: 0.875rem;
  }
}

.iso-diagram__media {
  flex: 0 0 auto;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

@media (min-width: 900px) {
  .iso-diagram__media {
    width: 48%;
    max-width: 480px;
    margin: 0;
  }
}

.iso-diagram__img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.375rem;
  background: #fff;
  user-select: none;
  border: 1px solid #e5e7eb;
}
.dark .iso-diagram__img {
  border-color: #4b5563;
}

.iso-diagram__side {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.iso-diagram__symbols {
  margin: 0;
  display: grid;
  gap: 0;
  font-size: 0.75rem;
  line-height: 1.35;
}

.iso-diagram__symbols > div {
  display: grid;
  grid-template-columns: 4.25rem 1fr;
  gap: 0.5rem;
  align-items: baseline;
  padding: 0.28rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.iso-diagram__symbols > div:first-child { padding-top: 0; }
.iso-diagram__symbols > div:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.dark .iso-diagram__symbols > div {
  border-bottom-color: #334155;
}

.iso-diagram__symbols dt {
  margin: 0;
  font-weight: 600;
  color: #409eff;
}
.iso-diagram__symbols dd {
  margin: 0;
  color: #4b5563;
}
.dark .iso-diagram__symbols dd { color: #cbd5e1; }

.iso-diagram__formulas {
  @apply rounded-md border border-gray-200 bg-gray-50/80 px-2.5 py-2 dark:border-gray-600 dark:bg-gray-900/60;
}
.iso-diagram__formulas-title {
  @apply mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200;
}
.iso-diagram__formula {
  @apply mb-1 text-[12.5px] leading-snug text-gray-700 dark:text-gray-200;
  overflow-x: auto;
  overflow-y: hidden;
}
.iso-diagram__formula :deep(.katex) {
  font-size: 0.95em;
  line-height: 1.3;
}
.iso-diagram__formula :deep(.katex-display) {
  margin: 0.1em 0;
}
.iso-diagram__formula:last-of-type { @apply mb-0; }
</style>
