<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="chain" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('pitch')">
            <el-input-number v-model="form.pitch" :min="5" :step="1.27" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('driverTeeth')">
            <el-input-number v-model="form.driverTeeth" :min="11" />
          </CalcFormItem>
          <CalcFormItem :label="pf('drivenTeeth')">
            <el-input-number v-model="form.drivenTeeth" :min="11" />
          </CalcFormItem>
          <CalcFormItem :label="pf('centerDistance')">
            <el-input-number v-model="form.centerDistance" :min="100" :step="50" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpm')">
            <el-input-number v-model="form.rpm" :min="0" />
          </CalcFormItem>
          <CalcFormItem :label="pf('power')">
            <el-input-number v-model="form.power" :min="0" :precision="2" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('allowTension')">
              <el-input-number v-model="form.allowTension" :min="1000" :step="1000" />
            </CalcFormItem>
            <CalcFormItem :label="pf('maxChainSpeed')">
              <el-input-number v-model="form.maxChainSpeed" :min="5" :max="25" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('serviceFactor')">
              <el-input-number v-model="form.serviceFactor" :min="1" :max="2" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('strands')">
              <el-input-number v-model="form.strands" :min="1" :max="4" />
            </CalcFormItem>
          </template>
        </el-form>

        <DriveLayoutDiagram
          variant="chain"
          :driver-teeth="form.driverTeeth"
          :driven-teeth="form.drivenTeeth"
          :pitch="form.pitch"
          :center-distance="form.centerDistance"
          :rpm="form.rpm"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag v-if="hasPassFail" class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('ratio')" />
            <dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('chainLength')" />
            <dd class="font-mono">{{ result.chainLength.toFixed(0) }} mm</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <div class="flex justify-between gap-2">
              <ResultLabel :text="pr('links')" />
              <dd class="shrink-0 font-mono">{{ result.links }}</dd>
            </div>
            <p v-if="result.oddRoundedUp" class="mt-1 text-xs text-warning">
              {{ pr('linksEvenHint', { exact: result.linksExact?.toFixed(2) }) }}
            </p>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('chainSpeed')" />
            <dd class="font-mono" :class="result.speedPass === false ? 'text-error' : ''">
              {{ result.chainSpeed.toFixed(2) }} m/s
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('chainTension')" />
            <dd class="font-mono" :class="result.tensionPass === false ? 'text-error' : ''">
              {{ result.chainTension.toFixed(0) }} N
            </dd>
          </div>
          <div
            v-if="result.estimatedLifeHours != null"
            class="rounded bg-gray-50 p-3 dark:bg-gray-900"
          >
            <div class="flex justify-between gap-2">
              <ResultLabel :text="pr('lifeHours')" />
              <dd class="shrink-0 font-mono">
                {{ Math.round(result.estimatedLifeHours).toLocaleString() }} h
                <span v-if="result.lifeCapped" class="text-xs text-gray-500">{{ pr('lifeCappedMark') }}</span>
              </dd>
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ pr('lifeHint') }}</p>
          </div>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaLinks" block />
          <MathTex :expr="formulaTension" block />
          <template #hints>
            <ul>
              <li><MathContent :text="tensionAssumption" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="chain"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="result"
      />
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { analyzeChainDrive } from '@/utils/chain-calc'
import DriveLayoutDiagram from '@/components/drive/DriveLayoutDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'

const { pt, ct, pf, pr, fc } = useCalcPage('chain')

const formulaLinks = String.raw`L_p=\dfrac{2a}{p}+\dfrac{z_1+z_2}{2}+\dfrac{p(z_2-z_1)^2}{4\pi^2 a}`
const formulaTension = String.raw`F=\dfrac{1000\,P\,K_a}{\eta v}`

const form = reactive({
  calcMode: 'simple',
  pitch: 15.875,
  driverTeeth: 19,
  drivenTeeth: 57,
  centerDistance: 500,
  rpm: 720,
  power: 7.5,
  allowTension: 20000,
  maxChainSpeed: 15,
  serviceFactor: 1.3,
  strands: 1,
})
const result = computed(() => analyzeChainDrive(form))
const tensionAssumption = computed(() =>
  pr('tensionAssumption', {
    eta: (result.value.efficiency ?? 0.98).toFixed(2),
    ka: (result.value.serviceFactor ?? 1).toFixed(2),
  }),
)
const hasPassFail = computed(() => typeof result.value.pass === 'boolean')
const overallStatus = computed(() => getCalcReviewStatus(result.value))
const overallStatusType = computed(() => {
  if (overallStatus.value === 'pass') return 'success'
  if (overallStatus.value === 'review') return 'warning'
  return 'danger'
})
const overallStatusLabel = computed(() => {
  if (overallStatus.value === 'pass') return fc('overallPass')
  if (overallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    return [
      { label: pr('chainTension'), value: `${r.chainTension?.toFixed(0) ?? '-'} N` },
      { label: fc('check'), value: hasPassFail.value ? overallStatusLabel.value : '—' },
    ]
  },
})
useHistoryReplay('chain', form)
</script>
