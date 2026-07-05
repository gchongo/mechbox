<template>
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('gdtRefModesTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('gdtRefModesSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColMode') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColOutputs') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColPass') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColCaveat') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.calcModes" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.mode }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.outputs }}</td>
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
    <h3 class="help-section__title">{{ ht('gdtRefStackTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('gdtRefStackSubtitle') }}</p>
    <div class="space-y-3">
      <div
        v-for="(row, i) in ref.stackModels"
        :key="i"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
      >
        <h4 class="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{{ row.type }}</h4>
        <div class="grid gap-2 sm:grid-cols-2">
          <div>
            <span class="text-xs text-gray-500">RSS</span>
            <MathTex :expr="row.formula" block class="mt-1" />
          </div>
          <div>
            <span class="text-xs text-gray-500">{{ ht('gdtRefWorstLabel') }}</span>
            <MathTex :expr="row.worst" block class="mt-1" />
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-600 dark:text-gray-400">{{ row.note }}</p>
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('gdtRefExampleTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('gdtRefExampleSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="w-24 border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColStep') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColDetail') }}</th>
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
    <h3 class="help-section__title">{{ ht('gdtRefDatumTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('gdtRefDatumSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColPriority') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColWeight') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColMeaning') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.datumWeights" :key="i">
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.priority }}</td>
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.weight }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.meaning }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      <MathContent :text="ht('gdtRefDatumFormula')" />
    </p>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('gdtRefMmcTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('gdtRefMmcSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColCondition') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('gdtRefColRule') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.mmcRules" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.item }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.rule" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('gdtRefLimitsTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('gdtRefLimitsSubtitle') }}</p>
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
import { getGdtHelpRef } from '@/constants/gdt-help-reference'

const { t, locale } = useLocale()

function ht(key) {
  return t(`content.help.${key}`)
}

const ref = computed(() => getGdtHelpRef(locale.value))
</script>
