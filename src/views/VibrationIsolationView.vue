<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>
    <CalcModePanel v-model="form.calcMode" page-key="vibration-isolation" />
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('mass')">
            <el-input-number v-model="form.mass" :min="0.1" :step="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('mountPreset')">
            <el-select v-model="form.mountId" clearable class="w-48" @change="onMountChange">
              <el-option :label="pf('mountManual')" value="" />
              <el-option
                v-for="(m, k) in mountOptions"
                :key="k"
                :label="m.label"
                :value="k"
              />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('mountCount')">
            <el-input-number v-model="form.mountCount" :min="1" :max="12" @change="syncMountStiffness" />
          </CalcFormItem>
          <CalcFormItem :label="pf('stiffness')">
            <el-input-number
              v-model="form.stiffness"
              :min="10"
              :step="1000"
              :disabled="!!form.mountId"
            />
            <p v-if="form.mountId" class="mt-1 text-xs text-gray-500">{{ pf('stiffnessFromMountHint') }}</p>
          </CalcFormItem>
          <CalcFormItem :label="pf('dampingRatio')">
            <el-input-number
              v-model="form.dampingRatio"
              :min="0.001"
              :max="0.5"
              :step="0.01"
              :precision="3"
              :disabled="!!form.mountId"
            />
          </CalcFormItem>
          <CalcFormItem :label="pf('excitationFreq')">
            <el-input-number v-model="form.excitationFreq" :min="0.1" :precision="2" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('maxTransmissibility')">
              <el-input-number v-model="form.maxTransmissibility" :min="0.05" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('isolationTargetDb')">
              <el-input-number v-model="form.isolationTargetDb" :min="3" :max="40" :step="1" />
            </CalcFormItem>
          </template>
        </el-form>
        <VibrationIsolationDiagram
          :mount-style="result.mountStyle || 'cylindrical'"
          :stiffness="result.stiffness"
          :load-per-mount-kg="result.loadPerMountKg"
          :static-deflection-mm="result.staticDeflectionMm"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">{{ pr('overall') }}: {{ overallStatusLabel }}</el-tag>
        <p v-if="failReason" class="mb-3 text-xs text-error">{{ failReason }}</p>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('naturalFreq')" />
            <dd class="font-mono">{{ result.naturalFreq.toFixed(2) }} Hz</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('frequencyRatio')" />
            <dd class="font-mono">{{ result.frequencyRatio.toFixed(3) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('transmissibility')" />
            <dd class="font-mono">{{ Number.isFinite(result.transmissibility) ? result.transmissibility.toFixed(3) : '∞' }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('isolationDb')" />
            <dd class="font-mono">{{ result.isolationDb.toFixed(1) }} dB</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('staticDeflection')" />
            <dd class="font-mono">{{ result.staticDeflectionMm.toFixed(2) }} mm</dd>
          </div>
          <div v-if="result.mountLoadPass != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('mountLoad')" />
            <dd :class="result.mountLoadPass ? 'text-success' : 'text-error'">
              {{ result.loadPerMountKg.toFixed(1) }} kg / {{ result.mountLoadPass ? '✓' : '✗' }}
            </dd>
          </div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('isolationRegion')" />
              <dd :class="result.aboveIsolationRegion ? 'text-success' : 'text-error'">
                {{ result.aboveIsolationRegion ? 'r>√2 ✓' : 'r≤√2 ✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('trCheck')" />
              <dd :class="result.trPass ? 'text-success' : 'text-error'">
                TR≤{{ form.maxTransmissibility }} {{ result.trPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('dbCheck')" />
              <dd :class="result.dbPass ? 'text-success' : 'text-error'">
                ≥{{ form.isolationTargetDb }} dB {{ result.dbPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div v-if="result.recommendedStiffness" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('recommendedStiffness')" />
              <dd class="font-mono">{{ result.recommendedStiffness.toFixed(0) }} N/m</dd>
            </div>
            <div v-if="result.suggestedMount" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('suggestedMount')" />
              <dd class="font-mono">{{ result.suggestedMount.label }}</dd>
            </div>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex expr="f_n=\dfrac{1}{2\pi}\sqrt{k/m},\quad r=f/f_n" block />
          <MathTex expr="TR=\dfrac{\sqrt{1+(2\zeta r)^2}}{\sqrt{(1-r^2)^2+(2\zeta r)^2}}" block />
          <MathTex expr="A_{\mathrm{dB}}=-20\log_{10}(TR)" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('vibHintRegion')" /></li>
              <li><MathContent :text="pr('vibHintPass')" /></li>
              <li v-if="form.mountId"><MathContent :text="pr('vibHintMountK')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>
    <div class="mt-4 tool-action-bar">
      <SaveHistoryButton
        tool="vibration-isolation"
        :get-input="() => historyInput"
        :get-result="() => result"
        :title="historyTitle"
        :summary="historySummary"
        :status="saveStatus"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { analyzeVibrationIsolation, RUBBER_MOUNT_CATALOG, getRubberMount } from '@/utils/vibration-isolation-calc'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import MathContent from '@/components/common/MathContent.vue'
import MathTex from '@/components/common/MathTex.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import VibrationIsolationDiagram from '@/components/vibration/VibrationIsolationDiagram.vue'

const { pt, ct, pf, pr, fc } = useCalcPage('vibration-isolation')
const { optionMap } = useOptionsI18n()
const mountOptions = computed(() => optionMap(RUBBER_MOUNT_CATALOG, 'rubberMounts'))

const form = reactive({
  calcMode: 'complete',
  mass: 50,
  stiffness: 20000,
  dampingRatio: 0.05,
  excitationFreq: 25,
  maxTransmissibility: 0.25,
  isolationTargetDb: 10,
  mountId: '',
  mountCount: 4,
})

function syncMountStiffness() {
  const m = getRubberMount(form.mountId)
  if (!m) return
  form.stiffness = m.stiffness * form.mountCount
  form.dampingRatio = m.dampingRatio
}

function onMountChange(id) {
  if (!id) return
  syncMountStiffness()
}

const result = computed(() => analyzeVibrationIsolation(form))
const overallStatus = computed(() => getCalcReviewStatus(result.value))
const overallStatusType = computed(() =>
  overallStatus.value === 'pass' ? 'success' : overallStatus.value === 'review' ? 'warning' : 'danger',
)
const overallStatusLabel = computed(() => {
  if (overallStatus.value === 'pass') return fc('overallPass')
  if (overallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})

const failReason = computed(() => {
  const r = result.value
  if (overallStatus.value !== 'fail') return ''
  const parts = []
  if (r.aboveIsolationRegion === false) parts.push(pr('failRegion'))
  if (r.trPass === false) parts.push(pr('failTr'))
  if (r.dbPass === false) parts.push(pr('failDb'))
  if (r.mountLoadPass === false) parts.push(pr('failMountLoad'))
  return parts.length ? parts.join(' · ') : ''
})

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => [
    { label: pr('transmissibility'), value: result.value.transmissibility.toFixed(3) },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
useHistoryReplay('vibration-isolation', form)
</script>
