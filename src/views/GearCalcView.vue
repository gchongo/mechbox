<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <ChainSyncBanner
      :session="chainSession"
      :chain-name="chainName"
      :dirty="dirty"
      @sync="syncToChain"
      @back="backToChain"
      @dismiss="dismissSession"
    />

    <CalcModePanel v-model="calcMode" page-key="gear" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('module')">
            <el-input-number v-model="form.module" :min="0.5" :precision="2" :step="0.5" />
          </CalcFormItem>
          <CalcFormItem :label="pf('pinionTeeth')">
            <el-input-number v-model="form.pinionTeeth" :min="17" :step="1" />
          </CalcFormItem>
          <CalcFormItem v-if="calcMode !== 'simple'" :label="pf('gearTeeth')">
            <el-input-number v-model="form.gearTeeth" :min="17" :step="1" />
          </CalcFormItem>
          <CalcFormItem v-else :label="pf('teeth')">
            <el-input-number v-model="form.pinionTeeth" :min="12" :step="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('faceWidth')">
            <el-input-number v-model="form.faceWidth" :min="1" :precision="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('torque')">
            <el-input-number v-model="form.torque" :min="0" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpm')">
            <el-input-number v-model="form.rpm" :min="0" :step="100" />
          </CalcFormItem>
          <CalcFormItem :label="pf('pressureAngle')">
            <el-input-number v-model="form.pressureAngle" :min="14.5" :max="25" :precision="1" />
          </CalcFormItem>
          <template v-if="calcMode !== 'simple'">
            <CalcFormItem :label="pf('helixAngle')">
              <el-input-number v-model="form.helixAngle" :min="0" :max="30" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('profileShiftPinion')">
              <el-input-number v-model="form.profileShiftPinion" :min="-1" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('profileShiftGear')">
              <el-input-number v-model="form.profileShiftGear" :min="-1" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('pinionMaterial')">
              <el-select v-model="form.pinionMaterial" class="w-full">
                <el-option v-for="m in materials" :key="m.id" :label="m.label" :value="m.id" />
              </el-select>
            </CalcFormItem>
            <CalcFormItem :label="pf('gearMaterial')">
              <el-select v-model="form.gearMaterial" class="w-full">
                <el-option v-for="m in materials" :key="m.id" :label="m.label" :value="m.id" />
              </el-select>
            </CalcFormItem>
            <CalcFormItem :label="pf('applicationFactor')">
              <el-input-number v-model="form.applicationFactor" :min="1" :max="2" :precision="2" :step="0.05" />
            </CalcFormItem>
            <CalcFormItem :label="pf('iso1328Grade')">
              <el-select v-model="form.iso1328Grade" class="w-full">
                <el-option v-for="g in iso1328Grades" :key="g" :label="gradeLabel('iso1328Grades', g)" :value="g" />
              </el-select>
            </CalcFormItem>
            <CalcFormItem :label="pf('accuracyGrade')">
              <el-input-number v-model="form.accuracyGrade" :min="5" :max="12" :step="1" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('accuracyGradeHint') }}</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('minSH')">
              <el-input-number v-model="form.minSafetyContact" :min="0.8" :max="2" :precision="1" :step="0.1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('minSF')">
              <el-input-number v-model="form.minSafetyBending" :min="1" :max="2.5" :precision="1" :step="0.1" />
            </CalcFormItem>
          </template>
          <template v-else>
            <CalcFormItem :label="pf('formFactor')">
              <el-input-number v-model="form.formFactor" :min="1.5" :max="4" :precision="2" :step="0.1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowBending')">
              <el-input-number v-model="form.allowBending" :min="100" :step="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowContact')">
              <el-input-number v-model="form.allowContact" :min="200" :step="50" />
            </CalcFormItem>
          </template>
        </el-form>

        <GearPairDiagram
          :module="form.module"
          :pinion-teeth="form.pinionTeeth"
          :gear-teeth="form.gearTeeth"
          :face-width="form.faceWidth"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag v-if="calcMode === 'simple'" class="mb-3" :type="simpleOverallType">
          {{ pr('overall') }}: {{ simpleOverallLabel }}
        </el-tag>
        <el-tag v-else-if="calcMode === 'complete'" class="mb-3" :type="completeOverallType">
          {{ pr('overall') }}: {{ completeOverallLabel }}
        </el-tag>
        <template v-if="calcMode === 'professional'">
          <el-tag class="mb-3" :type="compareResult.bothPass ? 'success' : 'warning'">
            {{ compareResult.bothPass ? pr('compareBothPass') : pr('comparePartialFail') }}
          </el-tag>
          <el-table :data="compareRows" border size="small" class="text-sm">
            <el-table-column prop="item" :label="pr('compareItem')" />
            <el-table-column label="ISO 6336">
              <template #default="{ row }"><span class="font-mono">{{ row.iso }}</span></template>
            </el-table-column>
            <el-table-column label="AGMA 2101">
              <template #default="{ row }"><span class="font-mono">{{ row.agma }}</span></template>
            </el-table-column>
            <el-table-column :label="pr('compareDiff')">
              <template #default="{ row }">{{ row.diff }}</template>
            </el-table-column>
          </el-table>
          <el-collapse class="mt-4">
            <el-collapse-item :title="pr('iso6336FactorsTitle')" name="iso-f">
              <el-table :data="isoFactorRows" border size="small" class="w-full text-sm">
                <el-table-column :label="pr('factorNameCol')" min-width="180">
                  <template #default="{ row }">
                    <ResultLabel label-class="text-gray-600" :text="row.label" />
                  </template>
                </el-table-column>
                <el-table-column :label="pr('factorValue')" width="110" align="right">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
            <el-collapse-item :title="pr('agmaFactorsTitle')" name="agma-f">
              <el-table :data="agmaFactorRows" border size="small" class="w-full text-sm">
                <el-table-column :label="pr('factorNameCol')" min-width="180">
                  <template #default="{ row }">
                    <ResultLabel label-class="text-gray-600" :text="row.label" />
                  </template>
                </el-table-column>
                <el-table-column :label="pr('factorValue')" width="110" align="right">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </template>
        <template v-else-if="calcMode === 'complete'">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('gearRatio')" />
              <dd class="font-mono">{{ isoResult.geometry.gearRatio.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('contactRatio')" />
              <dd class="font-mono">{{ isoResult.geometry.contactRatio.toFixed(3) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('contactStress')" />
              <dd class="font-mono">{{ isoResult.contactStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('bendingStress')" />
              <dd class="font-mono">{{ isoResult.bendingStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('safetyContact')" />
              <dd class="font-mono text-lg" :class="isoResult.contactPass ? 'text-success' : 'text-error'">
                {{ isoResult.safetyContact.toFixed(2) }} {{ isoResult.contactPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('safetyBending')" />
              <dd class="font-mono text-lg" :class="isoResult.bendingPass ? 'text-success' : 'text-error'">
                {{ isoResult.safetyBending.toFixed(2) }} {{ isoResult.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
          </dl>
          <el-collapse class="mt-4">
            <el-collapse-item v-if="isoResult.iso1328" :title="pr('iso1328Title')" name="iso1328">
              <el-table :data="iso1328ToleranceRows" border size="small" class="w-full text-sm">
                <el-table-column :label="pr('factorNameCol')" min-width="180">
                  <template #default="{ row }">
                    <ResultLabel label-class="text-gray-600" :text="row.label" />
                  </template>
                </el-table-column>
                <el-table-column :label="pr('factorValue')" width="110" align="right">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <ul class="mt-2 list-inside list-disc text-xs text-gray-500">
                <li v-for="(n, i) in iso1328Notes" :key="i">
                  <MathContent class="inline" :text="n" />
                </li>
              </ul>
            </el-collapse-item>
            <el-collapse-item :title="pr('iso6336FactorsTitle')" name="factors">
              <el-table :data="isoFactorRows" border size="small" class="w-full text-sm">
                <el-table-column :label="pr('factorNameCol')" min-width="180">
                  <template #default="{ row }">
                    <ResultLabel label-class="text-gray-600" :text="row.label" />
                  </template>
                </el-table-column>
                <el-table-column :label="pr('factorValue')" width="110" align="right">
                  <template #default="{ row }">
                    <span class="font-mono">{{ row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
          <FormulaPanel :columns="1">
            <div class="gear-formula-block">
              <ResultLabel label-class="text-gray-500 text-xs" :text="pr('contactStress')" />
              <MathTex
                expr="\sigma_H = Z_B Z_H Z_E Z_\varepsilon \sqrt{\dfrac{F_t}{b d_1}\dfrac{u+1}{u} K_A K_V K_{H\beta} K_{H\alpha}}"
                block
              />
            </div>
            <div class="gear-formula-block">
              <ResultLabel label-class="text-gray-500 text-xs" :text="pr('bendingStress')" />
              <MathTex
                expr="\sigma_F = \dfrac{F_t}{b m_n} Y_F Y_S Y_\beta K_A K_V K_{F\beta} K_{F\alpha}"
                block
              />
            </div>
            <div class="gear-formula-block">
              <ResultLabel label-class="text-gray-500 text-xs" :text="pr('safetyContact')" />
              <MathTex expr="S_H = \sigma_{H\lim} / \sigma_H" block />
            </div>
            <div class="gear-formula-block">
              <ResultLabel label-class="text-gray-500 text-xs" :text="pr('safetyBending')" />
              <MathTex expr="S_F = \sigma_{F\lim} / \sigma_F" block />
            </div>
            <template #hints>
              <ul>
                <li><MathContent :text="pr('gearHintStress')" /></li>
                <li><MathContent :text="pr('gearHintSafety')" /></li>
              </ul>
            </template>
          </FormulaPanel>
        </template>
        <template v-else>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('pitchDiameter')" />
              <dd class="font-mono">{{ simpleResult.geometry.pitchDiameter.toFixed(2) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('bendingStress')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(simpleResult.bendingPass, simpleResult)">
                {{ simpleResult.bendingStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(simpleResult.bendingPass, simpleResult, reviewMarkText) }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('contactStress')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(simpleResult.contactPass, simpleResult)">
                {{ simpleResult.contactStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(simpleResult.contactPass, simpleResult, reviewMarkText) }}
              </dd>
            </div>
          </dl>
          <p v-if="simpleReviewOnly" class="mt-4 text-xs text-warning"><MathContent :text="pt('hintSimple')" /></p>
          <FormulaPanel :columns="1">
            <div class="gear-formula-block">
              <ResultLabel label-class="text-gray-500 text-xs" :text="pr('bendingStress')" />
              <MathTex expr="\sigma_b = \dfrac{F_t}{b\,m\,Y}" block />
            </div>
            <div class="gear-formula-block">
              <ResultLabel label-class="text-gray-500 text-xs" :text="pr('contactStress')" />
              <MathTex expr="\sigma_H \approx C_p\sqrt{\dfrac{F_t}{b d}\dfrac{u+1}{u}}" block />
            </div>
            <template #hints>
              <ul>
                <li><MathContent :text="pr('gearHintLewis')" /></li>
              </ul>
            </template>
          </FormulaPanel>
        </template>
      </section>
    </div>

    <RelatedToolsPanel tool-id="gear" class="mt-4" />
    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="gear"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="activeResult"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { analyzeGearStrength } from '@/utils/gear-calc'
import { analyzeGearISO6336, GEAR_MATERIALS } from '@/utils/gear-iso6336'
import { analyzeGearAGMA, compareGearStandards } from '@/utils/gear-agma'
import { ISO1328_GRADES } from '@/utils/iso-1328'
import GearPairDiagram from '@/components/gear/GearPairDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { snapshotHistoryInput } from '@/utils/history-replay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { getCalcReviewStatus, isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('gear')
const { optionEntries, gradeLabel } = useOptionsI18n()
const { rm } = useResultI18n()

/** 系数 key → 符号片段（接在名称后，经 ResultLabel/enrichMathText） */
const FACTOR_SYMBOLS = {
  YF: 'YF',
  YS: 'YS',
  profileShiftPinion: 'x₁',
  profileShiftGear: 'x₂',
  ZH: 'ZH',
  ZE: 'ZE',
  Zepsilon: 'Zepsilon',
  Zbeta: 'Zbeta',
  ZB: 'ZB',
  KA: 'KA',
  KV: 'KV',
  KHbeta: 'KHbeta',
  KHalpha: 'KHalpha',
  KFbeta: 'KFbeta',
  KFalpha: 'KFalpha',
  Cp: 'Cp',
  Ko: 'K_o',
  Kv: 'K_v',
  Km: 'K_m',
  Ks: 'K_s',
  I: 'I',
  J: 'J',
  f_pt: 'f_pt',
  F_pt: 'F_pt',
  f_falpha: 'f_fα',
  F_beta: 'F_β',
}

function factorSymbol(key) {
  return FACTOR_SYMBOLS[key] ?? String(key)
}

function factorLabelText(key) {
  const nameKey = `factor_${key}`
  const name = pr(nameKey)
  const symbol = factorSymbol(key)
  if (!name || name === nameKey || name.endsWith(`.${nameKey}`)) return symbol
  return `${name} ${symbol}`
}

function factorsToRows(factors, digits = 3) {
  if (!factors || typeof factors !== 'object') return []
  return Object.entries(factors).map(([key, val]) => ({
    key,
    label: factorLabelText(key),
    value: typeof val === 'number' ? val.toFixed(digits) : String(val ?? '—'),
  }))
}

/** 简化=Lewis · 完整=ISO 6336 · 专业=ISO/AGMA 对照 */
const calcMode = ref('complete')
const materials = computed(() => optionEntries(GEAR_MATERIALS, 'gearMaterials'))
const iso1328Grades = ISO1328_GRADES
const iso1328Notes = computed(() => {
  locale.value
  const notes = isoResult.value.iso1328?.notes ?? []
  return notes.map((n) => rm('iso1328', n.key, n.params))
})

const form = reactive({
  module: 2,
  pinionTeeth: 24,
  gearTeeth: 72,
  faceWidth: 20,
  torque: 50,
  rpm: 1500,
  pressureAngle: 20,
  helixAngle: 0,
  profileShiftPinion: 0,
  profileShiftGear: 0,
  pinionMaterial: 'st-soft',
  gearMaterial: 'st-soft',
  applicationFactor: 1.25,
  accuracyGrade: 6,
  iso1328Grade: 6,
  minSafetyContact: 1.0,
  minSafetyBending: 1.4,
  formFactor: 2.65,
  allowBending: 300,
  allowContact: 900,
  gearRatio: 3,
})

const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('gear', form, {
  afterApply: (handoff) => {
    if (handoff?.inputs?.calcMode) calcMode.value = handoff.inputs.calcMode
  },
})

const isoResult = computed(() =>
  analyzeGearISO6336({ ...form, accuracyGrade: form.iso1328Grade }),
)
const agmaResult = computed(() =>
  analyzeGearAGMA({ ...form, qualityGrade: form.iso1328Grade }),
)
const compareResult = computed(() => compareGearStandards(isoResult.value, agmaResult.value))
const compareRows = computed(() => {
  locale.value
  const c = compareResult.value
  return [
    { item: pr('compareContactStress'), iso: c.contactStress.iso.toFixed(1), agma: c.contactStress.agma.toFixed(1), diff: `${c.contactStress.diffPct.toFixed(1)}%` },
    { item: pr('compareBendingStress'), iso: c.bendingStress.iso.toFixed(1), agma: c.bendingStress.agma.toFixed(1), diff: `${c.bendingStress.diffPct.toFixed(1)}%` },
    { item: 'SH', iso: c.safetyContact.iso.toFixed(2), agma: c.safetyContact.agma.toFixed(2), diff: '—' },
    { item: 'SF', iso: c.safetyBending.iso.toFixed(2), agma: c.safetyBending.agma.toFixed(2), diff: '—' },
  ]
})
const isoFactorRows = computed(() => {
  locale.value
  return factorsToRows(isoResult.value.factors)
})
const agmaFactorRows = computed(() => {
  locale.value
  return factorsToRows(agmaResult.value.factors)
})
const ISO1328_DISPLAY_KEYS = ['f_pt', 'F_pt', 'f_falpha', 'F_beta']

const iso1328ToleranceRows = computed(() => {
  locale.value
  const t = isoResult.value.iso1328?.tolerances
  if (!t) return []
  return ISO1328_DISPLAY_KEYS.filter((key) => t[key] != null).map((key) => ({
    key,
    label: factorLabelText(key),
    value: typeof t[key] === 'number' ? `${t[key].toFixed(1)} μm` : String(t[key] ?? '—'),
  }))
})

const simpleResult = computed(() =>
  analyzeGearStrength({
    ...form,
    teeth: form.pinionTeeth,
    gearRatio: form.gearTeeth / form.pinionTeeth,
  }),
)
const simpleOverallStatus = computed(() => getCalcReviewStatus(simpleResult.value))
const simpleOverallType = computed(() => {
  if (simpleOverallStatus.value === 'pass') return 'success'
  if (simpleOverallStatus.value === 'review') return 'warning'
  return 'danger'
})
const simpleOverallLabel = computed(() => {
  if (simpleOverallStatus.value === 'pass') return fc('overallPass')
  if (simpleOverallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})
const completeOverallStatus = computed(() => getCalcReviewStatus(isoResult.value))
const completeOverallType = computed(() => {
  if (completeOverallStatus.value === 'pass') return 'success'
  if (completeOverallStatus.value === 'review') return 'warning'
  return 'danger'
})
const completeOverallLabel = computed(() => {
  if (completeOverallStatus.value === 'pass') return fc('overallPass')
  if (completeOverallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})
const simpleReviewOnly = computed(() => isReviewOnlyResult(simpleResult.value))
const reviewMarkText = computed(() => (locale.value === 'en' ? '(Review)' : '（待复核）'))

const activeResult = computed(() => {
  if (calcMode.value === 'simple') return simpleResult.value
  if (calcMode.value === 'professional') return compareResult.value
  return isoResult.value
})

const activeOverallLabel = computed(() => {
  const status = getCalcReviewStatus(activeResult.value)
  if (status === 'pass') return fc('overallPass')
  if (status === 'review') return fc('overallWarn')
  return fc('overallFail')
})

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: activeResult,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = activeResult.value
    if (r?.errorKey) return []
    if (calcMode.value === 'simple') {
      return [
        { label: pr('contactStress'), value: `${r.contactStress?.toFixed(1) ?? '-'} MPa` },
        { label: fc('check'), value: activeOverallLabel.value },
      ]
    }
    if (calcMode.value === 'professional') return [{ label: fc('check'), value: activeOverallLabel.value }]
    return [
      { label: 'SH', value: r.safetyContact?.toFixed(2) ?? '-' },
      { label: fc('check'), value: activeOverallLabel.value },
    ]
  },
})
const historyInput = computed(() => snapshotHistoryInput({ calcMode: calcMode.value, ...form }))

function applyGearReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.calcMode != null) {
    calcMode.value = input.calcMode
  } else if (input.mode === 'simple') {
    calcMode.value = 'simple'
  } else if (input.mode === 'compare') {
    calcMode.value = 'professional'
  } else if (input.mode) {
    calcMode.value = 'complete'
  }
  Object.assign(form, input)
}
useHistoryReplay('gear', null, { applyFn: applyGearReplay })
</script>

<style scoped>
.gear-formula-block {
  @apply mb-3 last:mb-0;
}

.gear-formula-block :deep(.result-label) {
  @apply mb-0.5 block;
}
</style>
