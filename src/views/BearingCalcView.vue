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

    <CalcModePanel v-model="form.calcMode" page-key="bearing" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="150px">
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('xyLookup')">
            <el-switch v-model="form.autoLookup" :active-text="fc('auto')" :inactive-text="fc('manual')" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple' && form.autoLookup" :label="pf('series')">
            <el-select v-model="form.seriesId" class="w-full" filterable @change="markConfirmed('seriesId')">
              <el-option v-for="s in seriesList" :key="s.id" :label="s.label" :value="s.id" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple' && form.autoLookup" :label="pf('model')">
            <el-input v-model="form.bearingModel" :placeholder="pf('modelPlaceholder')" @change="onModelChange" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple' || !form.autoLookup" :label="pf('bearingType')">
            <el-select v-model="form.bearingType" class="w-full" @change="markConfirmed('bearingType')">
              <el-option :label="pf('ballBearing')" value="ball" />
              <el-option :label="pf('rollerBearing')" value="roller" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('dynamicLoad')">
            <el-input-number v-model="form.dynamicLoad" :min="100" :step="1000" @change="markConfirmed('dynamicLoad')" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('staticLoad')">
            <el-input-number v-model="form.staticLoad" :min="0" :step="1000" @change="markConfirmed('staticLoad')" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('lifeCondition')">
            <el-select v-model="form.lifeCondition" class="w-full">
              <el-option v-for="(c, k) in lifeConditions" :key="k" :label="c.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('radialLoad')">
            <el-input-number v-model="form.radialLoad" :min="0" :step="100" @change="markConfirmed('radialLoad')" />
          </CalcFormItem>
          <CalcFormItem :label="pf('axialLoad')">
            <el-input-number v-model="form.axialLoad" :min="0" :step="50" @change="markConfirmed('axialLoad')" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('mountingArrangement')">
              <el-select v-model="form.mountingArrangement" class="w-full">
                <el-option
                  v-for="(m, k) in mountingOptions"
                  :key="k"
                  :label="m.label"
                  :value="k"
                />
              </el-select>
            </CalcFormItem>
            <CalcFormItem :label="pf('axialPreload')">
              <el-input-number v-model="form.axialPreload" :min="0" :step="50" />
            </CalcFormItem>
          </template>
          <CalcFormItem v-if="form.calcMode === 'simple' || !form.autoLookup" :label="pf('factorX')">
            <el-input-number v-model="form.x" :min="0" :max="2" :precision="2" :step="0.1" @change="markConfirmed('x')" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple' || !form.autoLookup" :label="pf('factorY')">
            <el-input-number v-model="form.y" :min="0" :max="4" :precision="2" :step="0.1" @change="markConfirmed('y')" />
          </CalcFormItem>
          <CalcFormItem :label="pf('rpm')">
            <el-input-number v-model="form.rpm" :min="1" :step="100" @change="markConfirmed('rpm')" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('reliability')">
            <el-select v-model="form.reliability" class="w-full">
              <el-option label="90% (L₁₀, a₁=1.0)" :value="90" />
              <el-option label="95% (a₁=0.64)" :value="95" />
              <el-option label="96% (a₁=0.55)" :value="96" />
              <el-option label="97% (a₁=0.47)" :value="97" />
              <el-option label="98% (a₁=0.37)" :value="98" />
              <el-option label="99% (a₁=0.25)" :value="99" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('targetHours')">
            <el-input-number v-model="form.targetHours" :min="100" :step="1000" @change="markConfirmed('targetHours')" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('operatingTemp')">
              <el-input-number v-model="form.operatingTemp" :min="80" :max="300" :step="10" @change="markConfirmed('operatingTemp')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('limitingSpeed')">
              <el-input-number v-model="form.limitingSpeed" :min="0" :step="500" @change="markConfirmed('limitingSpeed')" />
            </CalcFormItem>
          </template>
        </el-form>

        <BearingLoadDiagram
          :radial-load="form.radialLoad"
          :axial-load="form.axialLoad"
          :bearing-type="form.bearingType"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert
          v-if="result.releaseBlocked"
          class="mb-4"
          type="warning"
          :closable="false"
          show-icon
          :title="pf('criticalInputsBlocked', { fields: unconfirmedLabelText })"
        />
        <el-alert
          v-if="result.xyInfo"
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="xySeriesTitle"
          :description="`${result.xyInfo.condition} → X=${result.x}, Y=${result.y}`"
        />
        <el-alert
          v-if="form.calcMode !== 'simple' && result.mountingArrangement !== 'single'"
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="result.mountingLabel"
          :description="result.mountingNote ?? ''"
        />
        <dl class="space-y-3 text-sm">
          <div v-if="form.calcMode !== 'simple' && result.axialPreloadApplied > 0" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('effectiveAxialLoad')" />
            <dd class="font-mono">{{ result.effectiveAxialLoad.toFixed(1) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('equivalentLoad')" />
            <dd class="font-mono">{{ result.equivalentLoad.toFixed(1) }} N</dd>
          </div>
          <div v-if="form.calcMode !== 'simple' && result.effectiveDynamicLoad !== form.dynamicLoad" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('effectiveDynamicLoad')" />
            <dd class="font-mono">{{ result.effectiveDynamicLoad.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('lifeL10')" />
            <dd class="font-mono">{{ formatNum(result.l10MillionRev) }}</dd>
          </div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('modifierProduct')" />
            <dd class="font-mono">
              {{ formatNum(result.modifiedLifeMillionRev) }}
              (a₁×aISO{{ form.calcMode === 'professional' ? '×a₂' : '' }}={{ modifierProduct }})
            </dd>
          </div>
          <div v-if="form.calcMode === 'professional' && result.temperatureFactor < 1" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('tempFactorA2')" />
            <dd class="font-mono">{{ result.temperatureFactor?.toFixed(2) }}</dd>
          </div>
          <div v-if="form.calcMode === 'professional' && result.radialStiffness" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('radialStiffness')" />
            <dd class="font-mono">{{ result.radialStiffness.toFixed(2) }} N/μm</dd>
          </div>
          <el-alert v-if="result.speedWarningKey" type="warning" :title="rm('bearing', result.speedWarningKey, result.speedWarningParams)" show-icon class="mb-2" />
          <div v-if="result.staticSafetyFactor != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('staticSafety')" />
            <dd class="font-mono" :class="reviewAwareCheckClass(result.staticPass, result)">
              {{ result.staticSafetyFactor.toFixed(2) }} {{ reviewAwareCheckMark(result.staticPass, result) }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('lifeHours')" />
            <dd class="font-mono text-lg" :class="reviewOnly ? 'text-warning' : result.pass ? 'text-success' : 'text-error'">
              {{ formatHours(result.lifeHours) }} {{ reviewOnly ? '（待复核）' : result.pass ? '✓' : '✗' }}
              <span v-if="result.estimateOnly" class="text-xs text-amber-600">（估算/未放行）</span>
            </dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="P = X \cdot F_r + Y \cdot F_a" />
          <MathTex :expr="l10Formula" />
          <MathTex expr="L_{nm} = a_1 \cdot L_{10},\quad L_h = \frac{L_{nm} \times 10^6}{60 n}" />
        </div>
      </section>
    </div>

    <DecisionToolsPanel
      :preset="decisionPreset"
      :snapshot="snapshot"
      :base-inputs="baseInputs"
      @apply="onApplyInverse"
    />
  </div>
</template>

<script setup>
import { reactive, computed, toRef } from 'vue'
import { analyzeBearingLife, listBearingSeries, resolveSeriesFromModel } from '@/utils/bearing-calc'
import BearingLoadDiagram from '@/components/bearing/BearingLoadDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import { adaptBearing } from '@/utils/calc-adapters'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { formatUnconfirmedLabels } from '@/utils/critical-input-guard'
import { isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'
import { localizedBearingSeriesLabel } from '@/i18n/bearing-series-i18n'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('bearing')
const { rm } = useResultI18n()
const { optionMap } = useOptionsI18n()

const l10Formula = computed(() =>
  locale.value === 'en'
    ? 'L_{10} = \\left(\\frac{C}{P}\\right)^{\\varepsilon} \\quad (\\text{million rev.})'
    : 'L_{10} = \\left(\\frac{C}{P}\\right)^{\\varepsilon} \\quad (\\text{百万转})',
)

const lifeConditions = computed(() => optionMap({
  clean: { id: 'clean' },
  standard: { id: 'standard' },
  contaminated: { id: 'contaminated' },
  heavy: { id: 'heavy' },
}, 'bearLifeConditions'))

const mountingOptions = computed(() => optionMap({
  single: { id: 'single' },
  'duplex-db': { id: 'duplex-db' },
  'duplex-df': { id: 'duplex-df' },
  'duplex-dt': { id: 'duplex-dt' },
}, 'bearingMountings'))

const seriesList = computed(() =>
  listBearingSeries().map((s) => ({
    ...s,
    label: localizedBearingSeriesLabel(s.id, locale.value, s.label),
  })),
)

const xySeriesTitle = computed(() => {
  const raw = result.value.xyInfo?.series
  if (!raw) return ''
  const match = seriesList.value.find((s) => s.label === raw || s.id === form.seriesId)
  if (match) return match.label
  return localizedBearingSeriesLabel(form.seriesId, locale.value, raw)
})

const form = reactive({
  calcMode: 'complete',
  autoLookup: true,
  seriesId: 'deep-groove-medium',
  bearingModel: '6205',
  bearingType: 'ball',
  dynamicLoad: 35000,
  staticLoad: 18000,
  lifeCondition: 'standard',
  radialLoad: 5000,
  axialLoad: 1000,
  mountingArrangement: 'single',
  axialPreload: 0,
  x: 1,
  y: 0,
  rpm: 1500,
  reliability: 90,
  targetHours: 10000,
  operatingTemp: 120,
  limitingSpeed: 8000,
})
const { markConfirmed, withConfirmed } = useCriticalInputConfirm(toRef(form, 'calcMode'))
const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('bearing', form)

const result = computed(() => analyzeBearingLife(withConfirmed(form)))
const reviewOnly = computed(() => isReviewOnlyResult(result.value))
const unconfirmedLabelText = computed(() =>
  formatUnconfirmedLabels(result.value.unconfirmedCriticalInputs ?? [], locale.value).join(
    locale.value === 'en' ? ', ' : '、',
  ),
)
const modifierProduct = computed(() => {
  const r = result.value
  const p = (r.reliabilityFactor ?? 1) * (r.lifeConditionFactor ?? 1) * (r.temperatureFactor ?? 1)
  return p.toFixed(2)
})

function onModelChange() {
  if (!form.bearingModel) return
  markConfirmed('seriesId')
  form.seriesId = resolveSeriesFromModel(form.bearingModel)
}

function formatNum(n) {
  if (!Number.isFinite(n)) return '∞'
  return n.toFixed(2)
}

function formatHours(h) {
  if (!Number.isFinite(h)) return '∞ h'
  if (h >= 10000) return `${(h / 1000).toFixed(1)}k h`
  return `${Math.round(h)} h`
}

const decisionPreset = DECISION_PRESETS.bearing
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptBearing(withConfirmed(form)))

function onApplyInverse({ variable, value, row, strategy }) {
  if (strategy === 'catalog' && row) {
    form.bearingModel = row.model
    form.dynamicLoad = row.C
    if (row.C0) form.staticLoad = row.C0
    form.autoLookup = true
    if (row.model) form.seriesId = resolveSeriesFromModel(row.model)
    return
  }
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Number(value.toFixed ? value.toFixed(3) : value)
  }
}
</script>
