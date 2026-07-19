<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="pin-retainer" />

    <el-tabs v-model="form.kind" class="mb-4">
      <el-tab-pane :label="pt('tabPin')" name="pin" />
      <el-tab-pane :label="pt('tabRing')" name="ring" />
    </el-tabs>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form v-if="form.kind === 'pin'" label-width="130px">
          <CalcFormItem :label="pf('force')">
            <el-input-number v-model="form.force" :min="0" />
          </CalcFormItem>
          <CalcFormItem :label="pf('pinDiameter')">
            <el-input-number v-model="form.diameter" :min="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('shearPlanes')">
            <el-radio-group v-model="form.shearPlanes">
              <el-radio-button :value="1">{{ pf('singleShear') }}</el-radio-button>
              <el-radio-button :value="2">{{ pf('doubleShear') }}</el-radio-button>
            </el-radio-group>
          </CalcFormItem>
          <CalcFormItem :label="pf('plateThickness')">
            <el-input-number v-model="form.plateThickness" :min="0.5" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('allowShear')">
              <el-input-number v-model="form.allowShear" :min="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowCrush')">
              <el-input-number v-model="form.allowCrush" :min="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('minSafety')">
              <el-input-number v-model="form.minSafety" :min="1" :max="4" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
          <CalcFormItem v-if="form.calcMode === 'professional'" :label="pf('stressConcentration')">
            <el-input-number v-model="form.stressConcentration" :min="1" :max="3" :step="0.1" :precision="1" />
          </CalcFormItem>
        </el-form>

        <el-form v-else label-width="130px">
          <CalcFormItem :label="pf('axialForce')">
            <el-input-number v-model="form.axialForce" :min="0" />
          </CalcFormItem>
          <CalcFormItem :label="pf('shaftDiameter')">
            <el-input-number v-model="form.shaftDiameter" :min="3" />
          </CalcFormItem>
          <CalcFormItem :label="pf('ringThickness')">
            <el-input-number v-model="form.ringThickness" :min="0.3" :step="0.1" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('grooveDepth')">
            <el-input-number v-model="form.grooveDepth" :min="0.2" :step="0.1" :precision="2" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('allowShear')">
              <el-input-number v-model="form.allowShearRing" :min="50" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowCrush')">
              <el-input-number v-model="form.allowCrushRing" :min="50" />
            </CalcFormItem>
            <CalcFormItem :label="pf('minSafety')">
              <el-input-number v-model="form.minSafety" :min="1" :max="4" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
          <CalcFormItem v-if="form.calcMode === 'professional'" :label="pf('rpm')">
            <el-input-number v-model="form.rpm" :min="0" :step="100" />
          </CalcFormItem>
        </el-form>

        <PinRetainerDiagram
          :kind="form.kind"
          :shear-planes="form.shearPlanes"
          :diameter="form.diameter"
          :plate-thickness="form.plateThickness"
          :shaft-diameter="form.shaftDiameter"
          :ring-thickness="form.ringThickness"
          :groove-depth="form.grooveDepth"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>

        <dl v-if="form.kind === 'pin'" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('shearStress')" />
            <dd class="font-mono" :class="pinResult.shearPass ? 'text-success' : 'text-error'">
              {{ pinResult.shearStress?.toFixed(1) }} MPa
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('bearingStress')" />
            <dd class="font-mono" :class="pinResult.crushPass ? 'text-success' : 'text-error'">
              {{ pinResult.bearingStress?.toFixed(1) }} MPa
            </dd>
          </div>
          <div v-if="pinResult.recommendedDiameter" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('recommendedDiameter')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ pinResult.recommendedDiameter?.toFixed(2) }} mm</dd>
          </div>
          <div v-if="pinResult.fatigueShear != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('fatigueShear')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ pinResult.fatigueShear?.toFixed(1) }} MPa</dd>
          </div>
        </dl>

        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('ringShear')" />
            <dd class="font-mono" :class="ringResult.shearPass ? 'text-success' : 'text-error'">
              {{ ringResult.shearStress?.toFixed(1) }} MPa
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('grooveStress')" />
            <dd class="font-mono" :class="ringResult.groovePass ? 'text-success' : 'text-error'">
              {{ ringResult.grooveStress?.toFixed(1) }} MPa
            </dd>
          </div>
          <div v-if="ringResult.allowableAxial != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('allowableAxial')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ ringResult.allowableAxial?.toFixed(0) }} N</dd>
          </div>
          <div v-if="ringResult.allowableAxialSpeed != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900/60">
            <ResultLabel label-class="text-gray-500 dark:text-gray-400" :text="pr('allowableAxialSpeed')" />
            <dd class="font-mono text-gray-900 dark:text-gray-100">{{ ringResult.allowableAxialSpeed?.toFixed(0) }} N</dd>
          </div>
        </dl>

        <p v-if="form.calcMode === 'simple'" class="mt-3 text-xs text-warning"><MathContent :text="pt('hintSimple')" /></p>
        <FormulaPanel :columns="1">
          <template v-if="form.kind === 'pin'">
            <MathTex :expr="formulaPinShear" block />
            <MathTex :expr="formulaPinCrush" block />
          </template>
          <template v-else>
            <MathTex :expr="formulaRingShear" block />
            <MathTex :expr="formulaGroove" block />
          </template>
          <template #hints>
            <ul>
              <li v-if="form.kind === 'pin'"><MathContent :text="pr('pinHint')" /></li>
              <li v-else><MathContent :text="pr('ringHint')" /></li>
              <li><MathContent :text="pr('passHint')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="pin-retainer"
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
import { reactive, computed } from 'vue'
import { analyzePinConnection, analyzeRetainingRing } from '@/utils/pin-retainer-calc'
import PinRetainerDiagram from '@/components/pin/PinRetainerDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import MathContent from '@/components/common/MathContent.vue'
import MathTex from '@/components/common/MathTex.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput } from '@/utils/history-replay'

const { pt, ct, pf, pr, fc } = useCalcPage('pin-retainer')

const formulaPinShear = String.raw`\tau = \frac{4F}{n\pi d^{2}}`
const formulaPinCrush = String.raw`\sigma_b = \frac{F}{d\,t}`
const formulaRingShear = String.raw`\tau \approx \frac{F}{\pi d s}`
const formulaGroove = String.raw`\sigma_g \approx \frac{F}{\pi d h}`

const form = reactive({
  calcMode: 'simple',
  kind: 'pin',
  force: 5000,
  diameter: 10,
  shearPlanes: 2,
  plateThickness: 8,
  allowShear: 80,
  allowCrush: 120,
  minSafety: 1.5,
  stressConcentration: 1.5,
  axialForce: 3000,
  shaftDiameter: 20,
  ringThickness: 1.2,
  grooveDepth: 0.6,
  allowShearRing: 200,
  allowCrushRing: 300,
  rpm: 0,
})

const pinResult = computed(() =>
  analyzePinConnection({
    calcMode: form.calcMode,
    force: form.force,
    diameter: form.diameter,
    shearPlanes: form.shearPlanes,
    plateThickness: form.plateThickness,
    allowShear: form.allowShear,
    allowCrush: form.allowCrush,
    minSafety: form.minSafety,
    stressConcentration: form.stressConcentration,
  }),
)

const ringResult = computed(() =>
  analyzeRetainingRing({
    calcMode: form.calcMode,
    axialForce: form.axialForce,
    shaftDiameter: form.shaftDiameter,
    ringThickness: form.ringThickness,
    grooveDepth: form.grooveDepth,
    allowShear: form.allowShearRing,
    allowCrush: form.allowCrushRing,
    minSafety: form.minSafety,
    rpm: form.rpm,
  }),
)

const activeResult = computed(() => (form.kind === 'pin' ? pinResult.value : ringResult.value))
const overallStatus = computed(() => getCalcReviewStatus(activeResult.value))
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

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: activeResult,
  buildTitle: () => `${pt('title')} · ${form.kind === 'pin' ? pt('tabPin') : pt('tabRing')}`,
  buildSummary: () => [
    {
      label: fc('check'),
      value: overallStatusLabel.value,
    },
  ],
})
const historyInput = computed(() => snapshotHistoryInput({ ...form }))

function applyReplay(input) {
  if (!input || typeof input !== 'object') return
  Object.assign(form, input)
}
useHistoryReplay('pin-retainer', null, { applyFn: applyReplay })
</script>
