<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="worm-gear" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="150px">
          <CalcFormItem :label="pf('module')">
            <el-input-number v-model="form.module" :min="0.5" :step="0.5" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('wormStarts')">
            <el-input-number v-model="form.wormStarts" :min="1" :max="6" />
          </CalcFormItem>
          <CalcFormItem :label="pf('wheelTeeth')">
            <el-input-number v-model="form.wheelTeeth" :min="12" />
          </CalcFormItem>
          <CalcFormItem :label="pf('diameterFactor')">
            <el-input-number v-model="form.diameterFactor" :min="6" :max="20" :step="0.5" :precision="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('frictionCoeff')">
            <el-input-number v-model="form.frictionCoeff" :min="0.02" :max="0.2" :step="0.01" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpmWorm')">
            <el-input-number v-model="form.rpmWorm" :min="0" :step="100" />
          </CalcFormItem>
          <CalcFormItem :label="pf('torqueWorm')">
            <el-input-number v-model="form.torqueWorm" :min="0" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('power')">
            <el-input-number v-model="form.power" :min="0" :precision="2" />
            <p class="mt-1 text-xs text-gray-500">{{ pf('powerHint') }}</p>
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('faceWidth')">
              <el-input-number v-model="form.faceWidth" :min="1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowBending')">
              <el-input-number v-model="form.allowBending" :min="10" :step="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('allowContact')">
              <el-input-number v-model="form.allowContact" :min="50" :step="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('pressureAngle')">
              <el-input-number v-model="form.pressureAngle" :min="14.5" :max="25" :step="0.5" :precision="1" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('serviceFactor')">
              <el-input-number v-model="form.serviceFactor" :min="1" :max="2.5" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('maxSlidingSpeed')">
              <el-input-number v-model="form.maxSlidingSpeed" :min="2" :max="20" :step="0.5" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>

        <WormGearDiagram
          :worm-diameter="result.wormDiameter"
          :wheel-diameter="result.wheelDiameter"
          :center-distance="result.centerDistance"
          :worm-starts="result.wormStarts"
          :wheel-teeth="result.wheelTeeth"
          :lead-angle="result.leadAngle"
          :efficiency="result.efficiency"
          :ratio="result.ratio"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <p v-if="form.calcMode === 'simple'" class="mb-3 text-xs text-gray-500">{{ pr('simpleNote') }}</p>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('ratio')" />
            <dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('centerDistance')" />
            <dd class="font-mono">{{ result.centerDistance.toFixed(1) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('leadAngle')" />
            <dd class="font-mono">{{ result.leadAngle.toFixed(2) }}°</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('efficiency')" />
            <dd class="font-mono">{{ (result.efficiency * 100).toFixed(1) }}%</dd>
          </div>
          <div
            v-if="result.selfLocking"
            class="rounded bg-warning/10 p-3 text-xs text-warning"
          >
            <MathContent :text="pr('selfLockHint')" />
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('rpmWheel')" />
            <dd class="font-mono">{{ result.rpmWheel.toFixed(1) }} rpm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('torqueWheel')" />
            <dd class="font-mono">{{ result.torqueWheel.toFixed(2) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('tangentialForceWheel')" />
            <dd class="font-mono">{{ result.tangentialForceWheel.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('axialForceWorm')" />
            <dd class="font-mono">{{ result.axialForceWorm.toFixed(0) }} N</dd>
          </div>

          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('bendingStress')" />
              <dd class="font-mono" :class="result.bendingPass ? 'text-success' : 'text-error'">
                {{ result.bendingStress.toFixed(1) }} / {{ result.allowBending }} MPa
                {{ result.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('contactStress')" />
              <dd class="font-mono" :class="result.contactPass ? 'text-success' : 'text-error'">
                {{ result.contactStress.toFixed(1) }} / {{ result.allowContact }} MPa
                {{ result.contactPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>

          <template v-if="form.calcMode === 'professional'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('torqueWormDesign')" />
              <dd class="font-mono">{{ result.torqueWormDesign.toFixed(2) }} N·m</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('slidingSpeed')" />
              <dd class="font-mono" :class="result.slidingPass ? 'text-success' : 'text-error'">
                {{ result.slidingSpeed.toFixed(2) }} / {{ result.maxSlidingSpeed }} m/s
                {{ result.slidingPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('powerLoss')" />
              <dd class="font-mono" :class="result.thermalPass ? 'text-success' : 'text-error'">
                {{ result.powerLoss.toFixed(3) }} / {{ result.heatCapacity.toFixed(3) }} kW
                {{ result.thermalPass ? '✓' : '✗' }}
              </dd>
            </div>
            <p class="text-xs text-gray-500"><MathContent :text="pr('thermalHint')" /></p>
          </template>
        </dl>
        <FormulaPanel :columns="1">
          <MathTex expr="i = z_2 / z_1" block />
          <MathTex expr="\tan\gamma = z_1 / q,\quad q = d_1 / m" block />
          <MathTex expr="\eta = \dfrac{\tan\gamma}{\tan(\gamma+\rho)},\quad \rho=\arctan\mu" block />
          <MathTex expr="T_2 = T_1\, i\, \eta" block />
          <MathTex v-if="form.calcMode !== 'simple'" expr="\sigma_F = Y_F F_{t2}/(b m),\quad \sigma_H = Z_E\sqrt{F_{t2}/(d_2 b)}" block />
          <MathTex v-if="form.calcMode === 'professional'" expr="v_s=\pi d_1 n_1/(60000\cos\gamma)" block />
          <template #hints>
            <ul>
              <li><MathContent :text="pr('hintGeom')" /></li>
              <li v-if="form.calcMode === 'simple'"><MathContent :text="pr('hintSimple')" /></li>
              <li v-if="form.calcMode !== 'simple'"><MathContent :text="pr('hintStrength')" /></li>
              <li v-if="form.calcMode === 'professional'"><MathContent :text="pr('hintPro')" /></li>
            </ul>
          </template>
        </FormulaPanel>
      </section>
    </div>

    <RelatedToolsPanel tool-id="worm-gear" class="mt-4" />
    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="worm-gear"
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
import { analyzeWormGear } from '@/utils/worm-gear-calc'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import WormGearDiagram from '@/components/worm/WormGearDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'

const { pt, ct, pf, pr, fc } = useCalcPage('worm-gear')

/** 默认：完整/专业均可通过的轻载示例 */
const form = reactive({
  calcMode: 'complete',
  module: 3,
  wormStarts: 2,
  wheelTeeth: 40,
  diameterFactor: 10,
  frictionCoeff: 0.06,
  pressureAngle: 20,
  rpmWorm: 1000,
  torqueWorm: 8,
  power: 0,
  faceWidth: 28,
  allowBending: 120,
  allowContact: 450,
  serviceFactor: 1.25,
  maxSlidingSpeed: 10,
})

const result = computed(() => analyzeWormGear(form))
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
  buildSummary: () => [
    { label: pr('ratio'), value: result.value.ratio.toFixed(2) },
    { label: pr('efficiency'), value: `${(result.value.efficiency * 100).toFixed(1)}%` },
    { label: fc('check'), value: overallStatusLabel.value },
  ],
})
useHistoryReplay('worm-gear', form)
</script>
