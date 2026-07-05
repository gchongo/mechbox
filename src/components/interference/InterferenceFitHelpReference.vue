<template>
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('ifRefModesTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('ifRefModesSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColMode') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColModel') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColPass') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColCaveat') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.calcModes" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.mode }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.model" />
            </td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.passRule" />
            </td>
            <td class="border border-gray-200 px-2 py-2 text-gray-700 dark:border-gray-700 dark:text-gray-300">
              {{ row.caveat }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('ifRefFormulasTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('ifRefFormulasSubtitle') }}</p>
    <div class="space-y-3">
      <div
        v-for="(row, i) in ref.formulas"
        :key="i"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
      >
        <h4 class="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{{ row.name }}</h4>
        <MathTex :expr="row.latex" block />
        <p v-if="row.note" class="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <MathContent :text="row.note" />
        </p>
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('ifRefPassTitle') }}</h3>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColCheck') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColRule') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.passChecks" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.check }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.rule" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('ifRefCriticalTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ref.criticalInputs.confirmNote }}</p>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <h4 class="mb-2 text-sm font-semibold">{{ ht('ifRefCompleteMode') }}</h4>
        <ul class="help-list text-xs">
          <li v-for="(item, i) in ref.criticalInputs.complete" :key="i">{{ item }}</li>
        </ul>
      </div>
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <h4 class="mb-2 text-sm font-semibold">{{ ht('ifRefProMode') }}</h4>
        <ul class="help-list text-xs">
          <li v-for="(item, i) in ref.criticalInputs.professional" :key="i">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('ifRefExampleTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('ifRefExampleSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="w-24 border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColStep') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('ifRefColDetail') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.exampleSteps" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.step }}</td>
            <td class="border border-gray-200 px-2 py-2 leading-relaxed dark:border-gray-700">
              <MathContent :text="row.detail" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('ifRefLimitsTitle') }}</h3>
    <ul class="help-list">
      <li v-for="(item, i) in ref.limitations" :key="i">
        <MathContent :text="item" />
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import { useLocale } from '@/composables/useLocale'
import { getInterferenceHelpRef } from '@/constants/interference-fit-help-reference'

const { t, locale } = useLocale()

function ht(key) {
  return t(`content.help.${key}`)
}

const ref = computed(() => getInterferenceHelpRef(locale.value))
</script>

<style scoped>
.help-list {
  margin: 0;
  padding-left: 1.15rem;
  line-height: 1.7;
}
</style>
