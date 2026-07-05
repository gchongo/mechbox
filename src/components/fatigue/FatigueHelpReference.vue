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

  <!-- 单级判定教材 -->
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefSingleTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefSingleSubtitle') }}</p>
    <p class="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <MathContent :text="ref.singleLevelGuide.intro" />
    </p>
    <div
      v-for="(sec, i) in ref.singleLevelGuide.sections"
      :key="'sl-' + i"
      class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
    >
      <h4 class="mb-2 text-sm font-semibold">{{ sec.title }}</h4>
      <ul class="help-list text-xs">
        <li v-for="(bullet, j) in sec.bullets" :key="j">
          <MathContent :text="bullet" />
        </li>
      </ul>
    </div>
  </section>

  <!-- 综合 vs 单级 -->
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefOverallTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefOverallSubtitle') }}</p>
    <div class="mb-4 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <p v-for="(p, i) in ref.overallVsSingle.paragraphs" :key="'ov-' + i">
        <MathContent :text="p" />
      </p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="(ex, i) in ref.overallVsSingle.examples"
        :key="'ex-' + i"
        class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      >
        <h4 class="mb-1 text-sm font-semibold text-primary">{{ ex.label }}</h4>
        <p class="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
          <MathContent :text="ex.detail" />
        </p>
      </div>
    </div>
  </section>

  <!-- 完整 vs 专业对照 -->
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefModeCompareTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefModeCompareSubtitle') }}</p>
    <p class="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <MathContent :text="ref.modeCompare.intro" />
    </p>
    <div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
      <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
        {{ ht('fatRefSharedInputs') }}
      </h4>
      <ul class="help-list text-xs text-amber-900 dark:text-amber-200">
        <li v-for="(item, i) in ref.modeCompare.sharedInputs" :key="'si-' + i">
          <MathContent :text="item" />
        </li>
      </ul>
    </div>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColScenario') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColComplete') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColProfessional') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.modeCompare.rows" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.scenario }}</td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.complete" />
            </td>
            <td class="border border-gray-200 px-2 py-2 dark:border-gray-700">
              <MathContent :text="row.professional" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <MathContent :text="ref.modeCompare.conclusion" />
    </p>
  </section>

  <!-- Sa 下限 vs Se′ -->
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefSaBoundsTitle') }}</h3>
    <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">{{ ht('fatRefSaBoundsSubtitle') }}</p>
    <p class="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
      <MathContent :text="ref.saBounds.intro" />
    </p>
    <div
      v-for="(sec, i) in ref.saBounds.sections"
      :key="'sb-' + i"
      class="mb-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
    >
      <h4 class="mb-2 text-sm font-semibold">{{ sec.title }}</h4>
      <p v-if="sec.body" class="mb-2 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
        <MathContent :text="sec.body" />
      </p>
      <ul v-if="sec.bullets" class="help-list text-xs">
        <li v-for="(bullet, j) in sec.bullets" :key="j">
          <MathContent :text="bullet" />
        </li>
      </ul>
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

  <!-- 如何让判定通过 -->
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefHowToPassTitle') }}</h3>
    <div class="grid gap-4 lg:grid-cols-3">
      <div
        v-for="(block, i) in ref.howToPass"
        :key="'htp-' + i"
        class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
      >
        <h4 class="mb-2 text-sm font-semibold text-primary">{{ block.goal }}</h4>
        <ol class="help-list list-decimal text-xs">
          <li v-for="(step, j) in block.steps" :key="j" class="mb-1">
            <MathContent :text="step" />
          </li>
        </ol>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefFaqTitle') }}</h3>
    <div class="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
      <table class="w-full min-w-[520px] border-collapse text-xs">
        <thead>
          <tr class="bg-gray-100 text-left text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <th class="w-2/5 border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColQuestion') }}</th>
            <th class="border border-gray-200 px-2 py-2 dark:border-gray-700">{{ ht('fatRefColAnswer') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in ref.faq" :key="i" class="align-top">
            <td class="border border-gray-200 px-2 py-2 font-medium dark:border-gray-700">{{ row.q }}</td>
            <td class="border border-gray-200 px-2 py-2 leading-relaxed dark:border-gray-700">
              <MathContent :text="row.a" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="help-section">
    <h3 class="help-section__title">{{ ht('fatRefPageNoteTitle') }}</h3>
    <ul class="help-list mb-4 text-xs">
      <li v-for="(note, i) in ref.pageNotes" :key="'pn-' + i">
        <MathContent :text="note" />
      </li>
    </ul>
    <p class="mb-2 text-xs text-gray-500">
      <MathContent :text="ref.criticalInputs.confirmNote" />
    </p>
    <p class="mb-3 text-xs text-amber-700 dark:text-amber-400">
      <MathContent :text="ref.criticalInputs.sizeFactorNote" />
    </p>
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
