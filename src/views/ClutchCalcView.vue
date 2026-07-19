<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="clutch" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="130px">
          <CalcFormItem :label="pf('frictionCoeff')">
            <el-input-number v-model="form.frictionCoeff" :min="0.05" :max="0.6" :precision="2" :step="0.05" />
          </CalcFormItem>
          <CalcFormItem :label="pf('force')">
            <el-input-number v-model="form.force" :min="0" :step="100" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="pf('radius')">
            <el-input-number v-model="form.radius" :min="10" :precision="1" />
            <p class="mt-1 text-xs text-gray-500">{{ pf('radiusHint') }}</p>
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('innerOuterDiam')">
              <el-input-number v-model="form.innerDiameter" :min="20" class="w-28" @change="syncRadiusFromDiameters" />
              <el-input-number
                v-model="form.outerDiameter"
                :min="30"
                class="ml-2 w-28"
                @change="syncRadiusFromDiameters"
              />
            </CalcFormItem>
          </template>
          <CalcFormItem :label="pf('surfaces')">
            <el-input-number v-model="form.surfaces" :min="1" :max="10" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpm')">
            <el-input-number v-model="form.rpm" :min="0" :step="100" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('requiredTorque')">
              <el-input-number v-model="form.requiredTorque" :min="0" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('thermalFade')">
              <el-input-number v-model="form.thermalFade" :min="0.5" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('safetyFactor')">
              <el-input-number v-model="form.safetyFactor" :min="1" :max="3" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>

        <ClutchDiagram
          :inner-diameter="form.innerDiameter"
          :outer-diameter="form.outerDiameter"
          :effective-radius="result.effectiveRadius ?? form.radius"
          :friction-coeff="form.frictionCoeff"
          :surfaces="form.surfaces"
          :force="form.force"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <p v-if="form.calcMode === 'simple'" class="mb-3 text-xs text-gray-500">{{ pf('simpleRadiusNote') }}</p>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('torque')" />
            <dd class="font-mono text-lg">{{ result.torque.toFixed(2) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('power')" />
            <dd class="font-mono">{{ result.power.toFixed(2) }} kW</dd>
          </div>
          <div v-if="result.effectiveRadius" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('effectiveRadius')" />
            <dd class="font-mono">{{ result.effectiveRadius?.toFixed(1) }} mm</dd>
          </div>
          <div v-if="result.contactPressure" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('contactPressure')" />
            <dd class="font-mono" :class="result.pressurePass === false ? 'text-error' : ''">
              {{ result.contactPressure?.toFixed(3) }} MPa
            </dd>
          </div>
          <template v-if="result.deratedTorque != null">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('centrifugalForce')" />
              <dd class="font-mono">{{ result.centrifugalForce?.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('torqueAtSpeed')" />
              <dd class="font-mono">{{ result.torqueAtSpeed?.toFixed(2) }} N·m</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('deratedTorque')" />
              <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
                {{ result.deratedTorque?.toFixed(2) }} N·m
                <span v-if="result.designTorqueRequired != null" class="text-xs text-gray-500">
                  / {{ pr('designNeed') }} {{ result.designTorqueRequired.toFixed(1) }}
                </span>
              </dd>
            </div>
          </template>
        </dl>
        <p v-if="reviewOnly" class="mt-3 text-xs text-warning">
          <MathContent :text="pt('hintSimple')" />
        </p>
        <p v-if="designFailHint" class="mt-3 text-xs text-error">{{ designFailHint }}</p>
        <FormulaPanel :columns="1">
          <MathTex :expr="formulaTorque" block />
          <MathTex :expr="formulaRadius" block />
          <MathTex :expr="formulaPower" block />
        </FormulaPanel>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="clutch"
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
import { analyzeClutch, calcMeanFrictionRadius } from '@/utils/clutch-calc'
import ClutchDiagram from '@/components/clutch/ClutchDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { getCalcReviewStatus, isReviewOnlyResult } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'

const { pt, ct, pf, pr, fc } = useCalcPage('clutch')

const formulaTorque = String.raw`T = \dfrac{\mu F R z}{1000}\quad(z:\ \mathrm{friction\ surfaces})`
const formulaRadius = String.raw`R = \dfrac{2}{3}\dfrac{R_o^{3}-R_i^{3}}{R_o^{2}-R_i^{2}}`
const formulaPower = String.raw`P = \dfrac{T \cdot 2\pi n}{60000}\quad(n:\ \mathrm{rpm})`

const defaultInner = 100
const defaultOuter = 160
const defaultRadius = Number(calcMeanFrictionRadius(defaultInner, defaultOuter).toFixed(1))

const form = reactive({
  calcMode: 'simple',
  frictionCoeff: 0.15,
  force: 5000,
  /** 与完整模式 Di/Do 均匀磨损等效半径一致，避免模式切换扭矩跳变 */
  radius: defaultRadius,
  innerDiameter: defaultInner,
  outerDiameter: defaultOuter,
  surfaces: 2,
  rpm: 1500,
  /** 示意可通过：折减后扭矩 ≈72 ≥ 55×1.2 */
  requiredTorque: 55,
  thermalFade: 0.9,
  safetyFactor: 1.2,
})

function syncRadiusFromDiameters() {
  if (form.innerDiameter > 0 && form.outerDiameter > form.innerDiameter) {
    form.radius = Number(calcMeanFrictionRadius(form.innerDiameter, form.outerDiameter).toFixed(1))
  }
}

const result = computed(() => analyzeClutch(form))
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
const reviewOnly = computed(() => isReviewOnlyResult(result.value))
const designFailHint = computed(() => {
  if (form.calcMode !== 'professional' || result.value.designPass !== false) return ''
  return pr('designFailHint', {
    derated: result.value.deratedTorque?.toFixed(1) ?? '—',
    need: result.value.designTorqueRequired?.toFixed(1) ?? '—',
  })
})

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    return [
      { label: pr('torque'), value: `${r.torque?.toFixed(2) ?? '-'} N·m` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
useHistoryReplay('clutch', form)
</script>
