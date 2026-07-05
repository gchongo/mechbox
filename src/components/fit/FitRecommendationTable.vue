<template>
  <section class="fit-rec-table">
    <div class="mb-3">
      <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h3>
      <p v-if="subtitle" class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
    </div>

    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="sticky left-0 z-10 border border-gray-200 bg-gray-100 px-2 py-2 text-left font-medium dark:border-gray-700 dark:bg-gray-800">
              {{ referenceLabel }}
            </th>
            <th
              v-for="cat in FIT_CATEGORY_ORDER"
              :key="cat"
              class="border border-gray-200 px-2 py-2 text-center font-medium dark:border-gray-700"
            >
              {{ categoryLabel(cat) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.reference" class="align-top">
            <th
              class="sticky left-0 z-10 whitespace-nowrap border border-gray-200 bg-white px-2 py-2 text-left font-mono font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              {{ row.reference }}
            </th>
            <td
              v-for="cat in FIT_CATEGORY_ORDER"
              :key="`${row.reference}-${cat}`"
              class="border border-gray-200 px-1 py-1 dark:border-gray-700"
              :class="categoryCellClass(cat)"
            >
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="fit in fitsForCategory(row, cat)"
                  :key="fitPairKey(fit.hole, fit.shaft)"
                  type="button"
                  class="fit-rec-cell relative min-w-[3.25rem] rounded border px-1.5 py-1 font-mono text-[11px] leading-tight transition-colors"
                  :class="cellClass(fit)"
                  :title="cellTitle(fit)"
                  @click="emit('select', { hole: fit.hole, shaft: fit.shaft, fit })"
                >
                  <span
                    v-if="fit.preferred"
                    class="pointer-events-none absolute left-0 top-0 h-0 w-0 border-l-[6px] border-t-[6px] border-l-primary border-t-primary"
                    aria-hidden="true"
                  />
                  {{ fit.hole }}/{{ fit.shaft }}
                  <span
                    v-if="sizeNoteActive(fit)"
                    class="ml-0.5 text-[9px] text-amber-700 dark:text-amber-400"
                  >≤{{ fit.sizeNoteMax }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
      {{ legend }}
    </p>
  </section>
</template>

<script setup>
import {
  FIT_CATEGORY_ORDER,
  effectiveFitCategory,
  fitPairKey,
  fitsForCategory,
} from '@/constants/fit-recommendations'
import { calcToleranceLimits } from '@/utils/iso-286-calc'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  referenceLabel: { type: String, required: true },
  legend: { type: String, default: '' },
  rows: { type: Array, required: true },
  selectedHole: { type: String, default: '' },
  selectedShaft: { type: String, default: '' },
  nominal: { type: Number, default: 25 },
  categoryLabels: { type: Object, required: true },
})

const emit = defineEmits(['select'])

function categoryLabel(cat) {
  return props.categoryLabels[cat] ?? cat
}

function isSelected(fit) {
  return (
    fit.hole.toUpperCase() === props.selectedHole.toUpperCase() &&
    fit.shaft.toLowerCase() === props.selectedShaft.toLowerCase()
  )
}

function isSupported(fit) {
  const hole = calcToleranceLimits(props.nominal, fit.hole, 'hole')
  const shaft = calcToleranceLimits(props.nominal, fit.shaft, 'shaft')
  return !hole.errorKey && !shaft.errorKey
}

function sizeNoteActive(fit) {
  return fit.sizeNoteMax != null && props.nominal <= fit.sizeNoteMax
}

function cellClass(fit) {
  const selected = isSelected(fit)
  const supported = isSupported(fit)
  return [
    selected
      ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/40'
      : supported
        ? 'border-gray-300 bg-white text-gray-800 hover:border-primary/60 hover:bg-primary/5 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100'
        : 'border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-500',
  ]
}

function categoryCellClass(cat) {
  if (cat === 'clearance') return 'bg-emerald-50/40 dark:bg-emerald-950/20'
  if (cat === 'transition') return 'bg-amber-50/40 dark:bg-amber-950/20'
  return 'bg-rose-50/30 dark:bg-rose-950/20'
}

function cellTitle(fit) {
  const cat = effectiveFitCategory(fit, props.nominal)
  const parts = [props.categoryLabels[cat] ?? cat]
  if (fit.preferred) parts.push(props.categoryLabels.preferred ?? 'Preferred')
  if (!isSupported(fit)) parts.push(props.categoryLabels.unsupported ?? 'Unsupported code')
  if (sizeNoteActive(fit)) parts.push(`≤${fit.sizeNoteMax} mm → transition`)
  return parts.join(' · ')
}
</script>
