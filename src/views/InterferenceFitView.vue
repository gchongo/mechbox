<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="interference-fit" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="148px">
          <CalcFormItem
            :label="pf('shaftDiameter')"
            unit="mm"
            :pending-confirm="isPending('shaftDiameter')"
          >
            <el-input-number v-model="form.shaftDiameter" :min="5" :max="200" :precision="2" @change="markConfirmed('shaftDiameter')" />
          </CalcFormItem>
          <CalcFormItem
            :label="pf('holeDiameter')"
            unit="mm"
            :pending-confirm="isPending('holeDiameter')"
          >
            <el-input-number v-model="form.holeDiameter" :min="4" :max="199" :precision="2" @change="markConfirmed('holeDiameter')" />
          </CalcFormItem>
          <CalcFormItem :label="pf('interference')">
            <span class="font-mono text-primary">{{ interference.toFixed(3) }} mm</span>
            <span class="ml-2 text-xs text-gray-500">{{ pf('interferenceFormula') }}</span>
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('shaftInner')">
            <el-input-number v-model="form.shaftInnerDiameter" :min="0" :max="199" :precision="2" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('shaftInnerHint') }}</span>
          </CalcFormItem>
          <CalcFormItem
            :label="pf('hubOuter')"
            :pending-confirm="isPending('hubOuterDiameter')"
          >
            <el-input-number v-model="form.hubOuterDiameter" :min="10" :max="400" :precision="1" @change="markConfirmed('hubOuterDiameter')" />
            <el-button class="ml-1" size="small" link @click="resetOuter">{{ fc('recommend') }} {{ suggestedOuter }} mm</el-button>
          </CalcFormItem>
          <CalcFormItem
            :label="pf('fitLength')"
            unit="mm"
            :pending-confirm="isPending('fitLength')"
          >
            <el-input-number v-model="form.fitLength" :min="1" :max="300" :precision="1" @change="markConfirmed('fitLength')" />
          </CalcFormItem>
          <CalcFormItem :label="pf('friction')">
            <el-input-number v-model="form.friction" :min="0.05" :max="0.4" :precision="2" :step="0.02" />
          </CalcFormItem>
          <el-divider content-position="left">{{ pf('dividerMaterials') }}</el-divider>
          <CalcFormItem :label="pf('shaftEv')">
            <el-input-number v-model="form.shaftE" :min="50000" :step="10000" class="numeric-wide" />
            <el-input-number v-model="form.shaftNu" :min="0.2" :max="0.4" :precision="2" :step="0.01" class="ml-2 numeric-narrow" />
          </CalcFormItem>
          <CalcFormItem :label="pf('hubEv')">
            <el-input-number v-model="form.hubE" :min="50000" :step="10000" class="numeric-wide" />
            <el-input-number v-model="form.hubNu" :min="0.2" :max="0.4" :precision="2" :step="0.01" class="ml-2 numeric-narrow" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'complete' || form.calcMode === 'professional'">
            <CalcFormItem
              :label="`${pf('allowHoop')} · ${pf('shaftLabel')}`"
              :pending-confirm="isPending('shaftAllowHoop')"
            >
              <el-input-number v-model="form.shaftAllowHoop" :min="50" :step="50" class="w-28" @change="markConfirmed('shaftAllowHoop')" />
            </CalcFormItem>
            <CalcFormItem
              :label="`${pf('allowHoop')} · ${pf('hubLabel')}`"
              :pending-confirm="isPending('hubAllowHoop')"
            >
              <el-input-number v-model="form.hubAllowHoop" :min="50" :step="50" class="w-28" @change="markConfirmed('hubAllowHoop')" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">{{ pf('dividerTemp') }}</el-divider>
            <CalcFormItem
              :label="pf('deltaT')"
              :pending-confirm="isPending('deltaT')"
            >
              <el-input-number v-model="form.deltaT" :min="-300" :max="500" :step="10" @change="markConfirmed('deltaT')" />
            </CalcFormItem>
            <CalcFormItem
              :label="pf('shaftAlpha')"
              :pending-confirm="isPending('shaftAlpha') || isPending('holeAlpha')"
            >
              <el-input-number v-model="form.shaftAlpha" :min="1e-6" :max="30e-6" :step="0.5e-6" :precision="7" class="w-32" @change="markConfirmed('shaftAlpha')" />
              <el-input-number v-model="form.holeAlpha" :min="1e-6" :max="30e-6" :step="0.5e-6" :precision="7" class="ml-2 w-32" @change="markConfirmed('holeAlpha')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('assemblyClearance')">
              <el-input-number v-model="form.assemblyClearance" :min="0" :max="1" :step="0.01" :precision="3" />
            </CalcFormItem>
            <CalcFormItem :label="pf('frictionExtract')">
              <el-input-number v-model="form.frictionExtract" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </CalcFormItem>
          </template>
          <template v-else-if="form.calcMode === 'complete'">
            <el-divider content-position="left">{{ pf('dividerAssembly') }}</el-divider>
            <CalcFormItem :label="pf('assemblyClearance')">
              <el-input-number v-model="form.assemblyClearance" :min="0" :max="1" :step="0.01" :precision="3" />
            </CalcFormItem>
            <CalcFormItem :label="pf('frictionExtract')">
              <el-input-number v-model="form.frictionExtract" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </CalcFormItem>
          </template>
        </el-form>
        <el-alert v-if="result.thinWallWarning" type="warning" show-icon :closable="false" class="mt-2"
          :title="pf('thinWallWarning')" />

        <InterferenceFitDiagram
          :shaft-diameter="form.shaftDiameter"
          :hole-diameter="form.holeDiameter"
          :hub-outer-diameter="form.hubOuterDiameter"
          :fit-length="form.fitLength"
          :interference="interference"
          :shaft-inner-diameter="form.shaftInnerDiameter"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="result.errorKey" :title="resultError(result)" type="error" show-icon />
        <template v-else>
          <el-tag
            v-if="result.hoopPass != null || result.pass != null"
            class="mb-3"
            :type="overallStatusType"
          >
            {{ pr('overall') }}: {{ overallStatusLabel }}
          </el-tag>
          <dl class="space-y-3 text-sm">
          <div v-if="result.thermal" class="flex justify-between rounded bg-amber-50 p-3 dark:bg-amber-950">
            <ResultLabel :text="pr('thermalInterference')" />
            <dd class="font-mono">{{ result.interference?.toFixed(4) }} mm (Δi {{ result.thermal.interferenceChange?.toFixed(4) }})</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('contactPressure')" />
            <dd class="font-mono">{{ result.pressure?.toFixed(1) }} MPa</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('hoopStress')" />
            <dd class="font-mono" :class="result.hoopPass === false ? 'text-error' : ''">
              {{ result.hoopHub?.toFixed(1) }} / {{ result.hoopShaft?.toFixed(1) }} MPa
              <span v-if="form.calcMode !== 'simple'">{{ result.hoopPass ? ' ✓' : ' ✗' }}</span>
            </dd>
          </div>
          <div v-if="result.hollowShaft" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('hollowShaft')" />
            <dd class="font-mono">{{ fc('yes') }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('pressForce')" />
            <dd class="font-mono">{{ result.pressForce?.toFixed(0) }} N</dd>
          </div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('extractionForce')" />
            <dd class="font-mono">{{ result.extractionForce?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('torqueCapacity')" />
            <dd class="font-mono">{{ result.torqueCapacityNm?.toFixed(1) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('minWall')" />
            <dd class="font-mono">{{ result.minHubWall?.toFixed(2) }} mm</dd>
          </div>
          <template v-if="form.calcMode !== 'simple' && result.assembly">
            <el-divider content-position="left">{{ pr('assemblyDivider') }}</el-divider>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('deltaTHubHeat')" />
              <dd class="font-mono">{{ result.assembly.deltaTHubHeat?.toFixed(1) }} K</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('deltaTShaftCool')" />
              <dd class="font-mono">{{ result.assembly.deltaTShaftCool?.toFixed(1) }} K</dd>
            </div>
            <div v-if="result.pressForceCurve?.length" class="rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="mb-2 block text-gray-500" :text="pr('pressCurve')" />
              <div ref="pressCurveChartRef" class="min-h-[240px] w-full" />
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <MathContent
                  :text="
                    pr('pressCurveHint', {
                      z: (result.fitLength ?? 0).toFixed(1),
                      f: (result.pressForce ?? 0).toFixed(0),
                    })
                  "
                />
              </p>
            </div>
          </template>
          </dl>
        </template>
        <p class="mt-4 text-xs text-gray-500">
          {{ pf('footnote') }}
        </p>
        <router-link to="/thermal-expansion" class="mt-3 inline-block text-xs text-primary hover:underline">
          {{ pf('linkThermal') }}
        </router-link>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="interference-fit"
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
import { reactive, computed, toRef, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import InterferenceFitDiagram from '@/components/interference/InterferenceFitDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import MathContent from '@/components/common/MathContent.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useResultI18n } from '@/composables/useResultI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { useDarkMode, applyPlotlyTheme } from '@/composables/useDarkMode'
import { getCalcReviewStatus } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc } = useCalcPage('interference-fit')
const { resultError } = useResultI18n()
const { isDark } = useDarkMode()
const pressCurveChartRef = ref(null)
let plotly = null

const form = reactive({
  calcMode: 'simple',
  shaftDiameter: 50,
  holeDiameter: 49.975,
  shaftInnerDiameter: 0,
  hubOuterDiameter: 90,
  fitLength: 40,
  friction: 0.12,
  shaftE: 210000,
  hubE: 210000,
  shaftNu: 0.3,
  hubNu: 0.3,
  shaftAllowHoop: 350,
  hubAllowHoop: 350,
  deltaT: 0,
  shaftAlpha: 11.5e-6,
  holeAlpha: 11.5e-6,
  assemblyClearance: 0.02,
  frictionExtract: 0.15,
})
const { markConfirmed, withConfirmed, isPending } = useCriticalInputConfirm(
  toRef(form, 'calcMode'),
  'interference-fit',
)

const interference = computed(() => form.shaftDiameter - form.holeDiameter)
const suggestedOuter = computed(() => Math.round(form.shaftDiameter * 1.8))

function resetOuter() {
  form.hubOuterDiameter = suggestedOuter.value
  markConfirmed('hubOuterDiameter')
}

const result = computed(() => analyzeInterferenceFit(withConfirmed(form)))
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
      { label: pr('contactPressure'), value: `${r.pressure?.toFixed(1) ?? '-'} MPa` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
useHistoryReplay('interference-fit', form)

async function renderPressCurveChart() {
  const curve = result.value?.pressForceCurve
  if (!pressCurveChartRef.value || !curve?.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  await plotly.react(
    pressCurveChartRef.value,
    [
      {
        x: curve.map((p) => p.z),
        y: curve.map((p) => p.force),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'F(z)',
        line: { color: '#409EFF', width: 2.5 },
        marker: { size: 6, color: '#409EFF' },
        hovertemplate: 'z = %{x:.1f} mm<br>F = %{y:.0f} N<extra></extra>',
      },
    ],
    applyPlotlyTheme(
      {
        margin: { t: 16, l: 56, r: 16, b: 44 },
        height: 240,
        showlegend: false,
        xaxis: {
          title: pr('pressCurveX'),
          zeroline: true,
          rangemode: 'tozero',
        },
        yaxis: {
          title: pr('pressCurveY'),
          zeroline: true,
          rangemode: 'tozero',
        },
      },
      isDark.value,
    ),
    { responsive: true, displayModeBar: false },
  )
}

watch(
  [() => result.value?.pressForceCurve, () => form.calcMode, isDark],
  async () => {
    await nextTick()
    if (form.calcMode !== 'simple' && result.value?.pressForceCurve?.length) {
      await renderPressCurveChart()
    }
  },
  { deep: true },
)

onMounted(async () => {
  await nextTick()
  if (form.calcMode !== 'simple') await renderPressCurveChart()
})

onBeforeUnmount(() => {
  if (pressCurveChartRef.value && plotly) plotly.purge(pressCurveChartRef.value)
})
</script>
