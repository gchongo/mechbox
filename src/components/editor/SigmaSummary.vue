<template>
  <div class="sigma-summary">
    <h3 class="sigma-summary__title">西格玛分析（质量水平）</h3>
    <div class="sigma-table">
      <div class="sigma-table__head">
        <span class="sigma-table__col sigma-table__col--metric">指标</span>
        <span class="sigma-table__col sigma-table__col--value">数值</span>
        <span class="sigma-table__col sigma-table__col--status">评价</span>
      </div>
      <div v-for="(row, i) in rows" :key="i" class="sigma-table__row">
        <span class="sigma-table__col sigma-table__col--metric sigma-table__metric">
          <MathTex v-if="row.latex" :expr="row.latex" />
          <span v-else>{{ row.label }}</span>
        </span>
        <span class="sigma-table__col sigma-table__col--value sigma-table__value">{{ row.value }}</span>
        <span
          class="sigma-table__col sigma-table__col--status sigma-table__status"
          :class="row.ok ? 'text-success' : 'text-warning'"
        >
          {{ row.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'

const props = defineProps({
  summary: { type: Object, required: true },
})

const rows = computed(() => {
  const s = props.summary
  const cpk = parseFloat(s.cpk)
  const sigma = parseFloat(s.sigmaLevel)
  return [
    {
      latex: 'C = \\frac{T}{6\\sigma}',
      value: s.c,
      status: cpk > 1.33 ? '✓ 优秀 (>1.33)' : '一般',
      ok: cpk > 1.33,
    },
    {
      label: 'Cpk 值',
      value: s.cpk,
      status: cpk > 1.33 ? '✓ 优秀 (>1.33)' : '一般',
      ok: cpk > 1.33,
    },
    {
      latex: '\\sigma_{\\text{水平}}',
      value: `${s.sigmaLevel}σ`,
      status: sigma >= 4 ? '✓ 4 西格玛' : '待提升',
      ok: sigma >= 4,
    },
    {
      label: '合格率',
      value: s.passRate,
      status: '—',
      ok: true,
    },
    {
      label: 'DPPM',
      value: s.dppm,
      status: s.dppm < 100 ? '✓ 优秀 (<100)' : '一般',
      ok: s.dppm < 100,
    },
  ]
})
</script>

<style scoped>
.sigma-summary__title {
  @apply mb-3 font-semibold text-gray-900 dark:text-gray-100;
}

.sigma-table {
  @apply overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600;
}

.sigma-table__head,
.sigma-table__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px 112px;
  align-items: center;
  column-gap: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.sigma-table__col--metric {
  @apply text-left;
}

.sigma-table__col--value {
  @apply text-right;
}

.sigma-table__col--status {
  @apply text-right;
}

.sigma-table__head {
  @apply bg-gray-50 text-xs font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400;
}

.sigma-table__row {
  @apply border-t border-gray-100 text-sm dark:border-gray-700;
}

.sigma-table__row:nth-child(even) {
  @apply bg-gray-50/50 dark:bg-gray-800/50;
}

.sigma-table__metric {
  @apply min-w-0 text-gray-800 dark:text-gray-200;
}

.sigma-table__value {
  @apply font-mono text-gray-900 dark:text-gray-100;
}

.sigma-table__status {
  @apply text-xs leading-snug;
}

@media (max-width: 480px) {
  .sigma-table__head,
  .sigma-table__row {
    grid-template-columns: minmax(0, 1fr) 72px 96px;
    column-gap: 0.5rem;
    padding: 0.45rem 0.5rem;
    font-size: 12px;
  }
}
</style>
