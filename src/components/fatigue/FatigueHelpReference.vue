<template>
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefModesTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefModesSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColMode') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColFeatures') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColPass') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColCaveat') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.calcModes" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.mode }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.features" />
            </td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.passRule" />
            </td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.caveat }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefMaterialsTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefMaterialsSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[560px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColMaterial') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">$S_f'$</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">$b$</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColEndurance') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">$N_{ref}$</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.materials" :key="i">
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.label }}</td>
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.sf }}</td>
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.b }}</td>
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.endurance }} MPa</td>
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.nref }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefFormulasTitle') }}</h3>
    <div class="space-y-3">
      <div
        v-for="(row, i) in ref.formulas"
        :key="i"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
      >
        <h4 class="mb-1 text-sm font-semibold">{{ row.name }}</h4>
        <MathTex :expr="row.latex" block />
        <p v-if="row.note" class="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <MathContent :text="row.note" />
        </p>
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefPassTitle') }}</h3>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColCheck') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColRule') }}</th>
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
    <h3 class="help-section__title">{{ ht('fatRefMinerTitle') }}</h3>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[400px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColStatus') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColRule') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.minerStatus" :key="i">
            <td class="border border-gray-200 px-2 py-2 font-mono dark:border-gray-700">{{ row.status }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.rule" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-2 text-xs text-gray-500">{{ ht('fatRefMinerFormat') }}</p>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefCriticalTitle') }}</h3>
    <p class="mb-2 text-xs text-gray-500">{{ ref.criticalInputs.confirmNote }}</p>
    <p class="mb-3 text-xs text-amber-700 dark:text-amber-400">{{ ref.criticalInputs.sizeFactorNote }}</p>
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <h4 class="mb-2 text-sm font-semibold">{{ ht('fatRefCompleteMode') }}</h4>
        <ul class="help-list text-xs">
          <li v-for="(item, i) in ref.criticalInputs.complete" :key="i">{{ item }}</li>
        </ul>
      </div>
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
        <h4 class="mb-2 text-sm font-semibold">{{ ht('fatRefProMode') }}</h4>
        <ul class="help-list text-xs">
          <li v-for="(item, i) in ref.criticalInputs.professional" :key="i">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefAssessTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefAssessSubtitle') }}</p>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColItem') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColThisPage') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColOther') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.assessVsPage" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.item }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.page }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ row.other }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefExampleTitle') }}</h3>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="w-28 border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColStep') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColDetail') }}</th>
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
    <h3 class="help-section__title">{{ ht('fatRefLimitsTitle') }}</h3>
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
import { getFatigueHelpRef } from '@/constants/fatigue-help-reference'

const { t, locale } = useLocale()

function ht(key) {
  return t(`content.help.${key}`)
}

const ref = computed(() => getFatigueHelpRef(locale.value))
</script>

<style scoped>
.help-list {
  margin: 0;
  padding-left: 1.15rem;
  line-height: 1.7;
}
</style>
