<template>
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fitRefD33Title') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fitRefD33Subtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fitRefColHole') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fitRefColShaft') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fitRefColApp') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in applications" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.holeBasis }}</td>
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.shaftBasis }}</td>
            <td class="border border-gray-200 px-2 py-2 leading-relaxed text-gray-700 dark:border-gray-700 dark:text-gray-300">
              {{ row.description }}
              <span v-if="row.footnote" class="mt-1 block text-amber-700 dark:text-amber-400">{{ row.footnote }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ ht('fitRefD33Footnote') }}</p>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fitRefD41Title') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fitRefD41Subtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[720px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 text-left dark:border-gray-700">{{ ht('fitRefColMethod') }}</th>
            <th
              v-for="grade in IT_GRADE_LABELS"
              :key="grade"
              class="border border-gray-200 px-1 py-2 text-center font-mono dark:border-gray-700"
            >
              {{ grade }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in processMethods" :key="i">
            <th class="border border-gray-200 bg-white px-2 py-2 text-left font-normal dark:border-gray-700 dark:bg-gray-900">
              {{ row.method }}
            </th>
            <td
              v-for="grade in IT_GRADE_LABELS"
              :key="`${i}-${grade}`"
              class="border border-gray-200 px-0 py-1 dark:border-gray-700"
            >
              <div
                v-if="grade >= row.itFrom && grade <= row.itTo"
                class="mx-0.5 h-3 rounded-sm bg-primary/70 dark:bg-primary/50"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ ht('fitRefD41Hint') }}</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import {
  IT_GRADE_LABELS,
  IT_PROCESS_METHODS,
  PREFERRED_FIT_APPLICATIONS,
} from '@/constants/fit-help-reference'

const { t } = useLocale()

function ht(key) {
  return t(`content.help.${key}`)
}

const applications = computed(() => PREFERRED_FIT_APPLICATIONS)
const processMethods = computed(() => IT_PROCESS_METHODS)
</script>
