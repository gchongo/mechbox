<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="belt" />

    <el-tabs v-model="form.kind" class="mb-4">
      <el-tab-pane :label="pt('tabVBelt')" name="v-belt" />
      <el-tab-pane :label="pt('tabTiming')" name="timing" />
    </el-tabs>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>

        <el-form v-if="form.kind === 'v-belt'" label-width="140px">
          <CalcFormItem :label="pf('driverDiameter')">
            <el-input-number v-model="form.driverDiameter" :min="50" />
          </CalcFormItem>
          <CalcFormItem :label="pf('drivenDiameter')">
            <el-input-number v-model="form.drivenDiameter" :min="50" />
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
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="pf('wrapAngle')">
            <el-input-number v-model="form.wrapAngle" :min="120" :max="180" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('powerPerBelt')">
              <el-input-number v-model="form.powerPerBelt" :min="0.5" :precision="1" :step="0.5" />
            </CalcFormItem>
            <CalcFormItem :label="pf('maxBeltSpeed')">
              <el-input-number v-model="form.maxBeltSpeed" :min="10" :max="40" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('serviceFactor')">
              <el-input-number v-model="form.serviceFactor" :min="1" :max="2" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>

        <el-form v-else label-width="140px">
          <CalcFormItem :label="pf('pitchSeries')">
            <el-select v-model="form.pitchId" class="w-full" clearable :placeholder="pf('pitchAuto')">
              <el-option
                v-for="s in pitchOptions"
                :key="s.id"
                :label="`${s.label} (${s.pitch} mm)`"
                :value="s.id"
              />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('driverTeeth')">
            <el-input-number v-model="form.z1" :min="12" :max="200" />
          </CalcFormItem>
          <CalcFormItem :label="pf('drivenTeeth')">
            <el-input-number v-model="form.z2" :min="12" :max="300" />
          </CalcFormItem>
          <CalcFormItem :label="pf('centerDistance')">
            <el-input-number v-model="form.timingCenter" :min="50" :step="10" />
          </CalcFormItem>
          <CalcFormItem :label="pf('beltWidth')">
            <el-input-number v-model="form.beltWidth" :min="5" :max="200" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpm')">
            <el-input-number v-model="form.timingRpm" :min="0" />
          </CalcFormItem>
          <CalcFormItem :label="pf('power')">
            <el-input-number v-model="form.timingPower" :min="0" :precision="2" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('allowPowerPerMm')">
              <el-input-number v-model="form.allowPowerPerMm" :min="0.05" :max="1" :step="0.05" :precision="2" />
            </CalcFormItem>
            <CalcFormItem :label="pf('maxBeltSpeed')">
              <el-input-number v-model="form.timingMaxSpeed" :min="10" :max="60" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('serviceFactor')">
              <el-input-number v-model="form.timingServiceFactor" :min="1" :max="2.5" :step="0.1" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>

        <DriveLayoutDiagram
          v-if="form.kind === 'v-belt'"
          variant="belt"
          :driver-diameter="form.driverDiameter"
          :driven-diameter="form.drivenDiameter"
          :center-distance="form.centerDistance"
          :wrap-angle="vBeltResult.wrapAngle ?? form.wrapAngle"
          :rpm="form.rpm"
        />
        <DriveLayoutDiagram
          v-else
          variant="timing"
          :driver-teeth="form.z1"
          :driven-teeth="form.z2"
          :pitch="timingResult.pitch"
          :center-distance="form.timingCenter"
          :belt-width="form.beltWidth"
          :rpm="form.timingRpm"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag v-if="hasPassFail" class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>

        <template v-if="form.kind === 'v-belt'">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('ratio')" />
              <dd class="font-mono">{{ vBeltResult.ratio.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('beltLength')" />
              <dd class="font-mono">{{ vBeltResult.beltLength.toFixed(0) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('beltSpeedWrap')" />
              <dd class="font-mono">
                {{ vBeltResult.beltSpeed.toFixed(2) }} m/s · {{ vBeltResult.wrapAngle?.toFixed(1) }}°
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('effectiveForce')" />
              <dd class="font-mono">{{ vBeltResult.effectiveForce?.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('tightSide')" />
              <dd class="font-mono">{{ vBeltResult.F1.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('slackSide')" />
              <dd class="font-mono">{{ vBeltResult.F2.toFixed(0) }} N</dd>
            </div>
            <div v-if="vBeltResult.beltCount" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('beltCount')" />
              <dd class="font-mono">{{ vBeltResult.beltCount }} {{ pr('beltCountUnit') }}</dd>
            </div>
            <div
              v-if="vBeltResult.estimatedLifeHours"
              class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
            >
              <ResultLabel :text="pr('lifeHours')" />
              <dd class="font-mono">{{ Math.round(vBeltResult.estimatedLifeHours).toLocaleString() }} h</dd>
            </div>
          </dl>
          <FormulaPanel :columns="1">
            <MathTex :expr="formulaLength" block />
            <MathTex :expr="formulaTension" block />
            <template #hints>
              <ul>
                <li><MathContent :text="tensionAssumption" /></li>
              </ul>
            </template>
          </FormulaPanel>
        </template>

        <template v-else>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('pitchLabel')" />
              <dd class="font-mono">
                {{ timingResult.pitchLabel }} ({{ timingResult.pitch }} mm)
                <span v-if="!form.pitchId" class="text-xs text-amber-600"> · {{ pr('pitchRecommended') }}</span>
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('ratio')" />
              <dd class="font-mono">{{ timingResult.ratio.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('pitchLength')" />
              <dd class="font-mono">{{ timingResult.pitchLength.toFixed(0) }} mm · z≈{{ timingResult.toothCount }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('beltSpeed')" />
              <dd class="font-mono">{{ timingResult.beltSpeed.toFixed(2) }} m/s</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('effectiveForce')" />
              <dd class="font-mono">{{ timingResult.effectiveForce.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('installTension')" />
              <dd class="font-mono">
                {{ timingResult.installTension.toFixed(0) }} N
                <span class="text-xs text-gray-500">
                  ({{ timingResult.installTensionMin.toFixed(0) }}–{{ timingResult.installTensionMax.toFixed(0) }})
                </span>
              </dd>
            </div>
            <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('capacityKw')" />
              <dd class="font-mono" :class="timingResult.widthPass ? 'text-success' : 'text-error'">
                {{ timingResult.capacityKw.toFixed(2) }} kW {{ timingResult.widthPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div
              v-if="timingResult.estimatedLifeHours"
              class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
            >
              <ResultLabel :text="pr('lifeHours')" />
              <dd class="font-mono">{{ Math.round(timingResult.estimatedLifeHours).toLocaleString() }} h</dd>
            </div>
          </dl>
          <FormulaPanel :columns="1">
            <MathTex :expr="formulaTimingLength" block />
            <MathTex :expr="formulaTimingTension" block />
            <template #hints>
              <ul>
                <li><MathContent :text="pr('timingAssumption')" /></li>
              </ul>
            </template>
          </FormulaPanel>
        </template>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="belt"
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
import { analyzeBeltDrive } from '@/utils/belt-calc'
import { analyzeTimingBeltDrive, TIMING_PITCH_SERIES } from '@/utils/timing-belt-calc'
import DriveLayoutDiagram from '@/components/drive/DriveLayoutDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'

const { pt, ct, pf, pr, fc } = useCalcPage('belt')

const formulaLength = String.raw`L = 2C + \dfrac{\pi(D_1+D_2)}{2} + \dfrac{(D_2-D_1)^2}{4C}`
const formulaTension = String.raw`F_e=\dfrac{1000P}{\eta v},\quad \dfrac{F_1}{F_2}=e^{\mu\theta},\quad F_1-F_2=F_e`
const formulaTimingLength = String.raw`L_p = 2C + \dfrac{\pi(d_1+d_2)}{2} + \dfrac{(d_2-d_1)^2}{4C},\quad d=pz/\pi`
const formulaTimingTension = String.raw`F_e=\dfrac{1000P}{\eta v},\quad F_{\mathrm{inst}}\approx 0.5\,F_e`

const pitchOptions = Object.values(TIMING_PITCH_SERIES)

const form = reactive({
  kind: 'v-belt',
  calcMode: 'simple',
  // V-belt
  driverDiameter: 120,
  drivenDiameter: 300,
  centerDistance: 500,
  rpm: 1450,
  power: 5.5,
  wrapAngle: 180,
  powerPerBelt: 2.5,
  maxBeltSpeed: 30,
  serviceFactor: 1.2,
  // Timing
  pitchId: '',
  z1: 24,
  z2: 48,
  timingCenter: 300,
  beltWidth: 15,
  timingRpm: 1450,
  timingPower: 2,
  allowPowerPerMm: 0.15,
  timingMaxSpeed: 40,
  timingServiceFactor: 1.3,
})

const vBeltResult = computed(() =>
  analyzeBeltDrive({
    calcMode: form.calcMode,
    driverDiameter: form.driverDiameter,
    drivenDiameter: form.drivenDiameter,
    centerDistance: form.centerDistance,
    rpm: form.rpm,
    power: form.power,
    wrapAngle: form.wrapAngle,
    powerPerBelt: form.powerPerBelt,
    maxBeltSpeed: form.maxBeltSpeed,
    serviceFactor: form.serviceFactor,
  }),
)

const timingResult = computed(() =>
  analyzeTimingBeltDrive({
    calcMode: form.calcMode,
    pitchId: form.pitchId || undefined,
    z1: form.z1,
    z2: form.z2,
    centerDistance: form.timingCenter,
    beltWidth: form.beltWidth,
    rpm: form.timingRpm,
    power: form.timingPower,
    allowPowerPerMm: form.allowPowerPerMm,
    maxBeltSpeed: form.timingMaxSpeed,
    serviceFactor: form.timingServiceFactor,
  }),
)

const result = computed(() => (form.kind === 'timing' ? timingResult.value : vBeltResult.value))

const tensionAssumption = computed(() =>
  pr('tensionAssumption', {
    eta: (vBeltResult.value.efficiency ?? 0.95).toFixed(2),
    mu: (vBeltResult.value.friction ?? 0.3).toFixed(2),
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
      { label: pr('ratio'), value: r.ratio?.toFixed(2) ?? '-' },
      { label: fc('check'), value: hasPassFail.value ? overallStatusLabel.value : '—' },
    ]
  },
})
useHistoryReplay('belt', form)
</script>
