<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="bearing" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="150px">
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('xyLookup')">
            <el-switch v-model="form.autoLookup" :active-text="fc('auto')" :inactive-text="fc('manual')" />
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple' && form.autoLookup" :label="pf('series')">
            <el-select v-model="form.seriesId" class="w-full" filterable>
              <el-option v-for="s in seriesList" :key="s.id" :label="s.label" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple' && form.autoLookup" :label="pf('model')">
            <el-input v-model="form.bearingModel" :placeholder="pf('modelPlaceholder')" @change="onModelChange" />
          </el-form-item>
          <el-form-item v-if="form.calcMode === 'simple' || !form.autoLookup" :label="pf('bearingType')">
            <el-select v-model="form.bearingType" class="w-full">
              <el-option :label="pf('ballBearing')" value="ball" />
              <el-option :label="pf('rollerBearing')" value="roller" />
            </el-select>
          </el-form-item>
          <el-form-item :label="pf('dynamicLoad')">
            <el-input-number v-model="form.dynamicLoad" :min="100" :step="1000" />
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('staticLoad')">
            <el-input-number v-model="form.staticLoad" :min="0" :step="1000" />
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('lifeCondition')">
            <el-select v-model="form.lifeCondition" class="w-full">
              <el-option v-for="(c, k) in lifeConditions" :key="k" :label="c.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item :label="pf('radialLoad')">
            <el-input-number v-model="form.radialLoad" :min="0" :step="100" />
          </el-form-item>
          <el-form-item :label="pf('axialLoad')">
            <el-input-number v-model="form.axialLoad" :min="0" :step="50" />
          </el-form-item>
          <el-form-item v-if="form.calcMode === 'simple' || !form.autoLookup" :label="pf('factorX')">
            <el-input-number v-model="form.x" :min="0" :max="2" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item v-if="form.calcMode === 'simple' || !form.autoLookup" :label="pf('factorY')">
            <el-input-number v-model="form.y" :min="0" :max="4" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item :label="pf('rpm')">
            <el-input-number v-model="form.rpm" :min="1" :step="100" />
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('reliability')">
            <el-select v-model="form.reliability" class="w-full">
              <el-option label="90% (L10, a₁=1.0)" :value="90" />
              <el-option label="95% (a₁=0.64)" :value="95" />
              <el-option label="96% (a₁=0.55)" :value="96" />
              <el-option label="97% (a₁=0.47)" :value="97" />
              <el-option label="98% (a₁=0.37)" :value="98" />
              <el-option label="99% (a₁=0.25)" :value="99" />
            </el-select>
          </el-form-item>
          <el-form-item :label="pf('targetHours')">
            <el-input-number v-model="form.targetHours" :min="100" :step="1000" />
          </el-form-item>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item :label="pf('operatingTemp')">
              <el-input-number v-model="form.operatingTemp" :min="80" :max="300" :step="10" />
            </el-form-item>
            <el-form-item :label="pf('limitingSpeed')">
              <el-input-number v-model="form.limitingSpeed" :min="0" :step="500" />
            </el-form-item>
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
          v-if="result.xyInfo"
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="result.xyInfo.series"
          :description="`${result.xyInfo.condition} → X=${result.x}, Y=${result.y}`"
        />
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('equivalentLoad') }}</dt>
            <dd class="font-mono">{{ result.equivalentLoad.toFixed(1) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('lifeL10') }}</dt>
            <dd class="font-mono">{{ formatNum(result.l10MillionRev) }}</dd>
          </div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('modifierProduct') }}</dt>
            <dd class="font-mono">
              {{ formatNum(result.modifiedLifeMillionRev) }}
              (a₁×aISO{{ form.calcMode === 'professional' ? '×a₂' : '' }}={{ modifierProduct }})
            </dd>
          </div>
          <div v-if="form.calcMode === 'professional' && result.temperatureFactor < 1" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('tempFactorA2') }}</dt>
            <dd class="font-mono">{{ result.temperatureFactor?.toFixed(2) }}</dd>
          </div>
          <el-alert v-if="result.speedWarningKey" type="warning" :title="rm('bearing', result.speedWarningKey, result.speedWarningParams)" show-icon class="mb-2" />
          <div v-if="result.staticSafetyFactor != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('staticSafety') }}</dt>
            <dd class="font-mono" :class="result.staticPass ? 'text-success' : 'text-error'">
              {{ result.staticSafetyFactor.toFixed(2) }} {{ result.staticPass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">{{ pr('lifeHours') }}</dt>
            <dd class="font-mono text-lg" :class="result.pass ? 'text-success' : 'text-error'">
              {{ formatHours(result.lifeHours) }} {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="P = X \cdot F_r + Y \cdot F_a" />
          <MathTex expr="L_{10} = \left(\frac{C}{P}\right)^{\varepsilon} \quad (\text{百万转})" />
          <MathTex expr="L_{nm} = a_1 \cdot L_{10},\quad L_h = \frac{L_{nm} \times 10^6}{60 n}" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeBearingLife, listBearingSeries, resolveSeriesFromModel } from '@/utils/bearing-calc'
import BearingLoadDiagram from '@/components/bearing/BearingLoadDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('bearing')
const { rm } = useResultI18n()
const { optionMap } = useOptionsI18n()

const lifeConditions = computed(() => optionMap({
  clean: { id: 'clean' },
  standard: { id: 'standard' },
  contaminated: { id: 'contaminated' },
  heavy: { id: 'heavy' },
}, 'bearLifeConditions'))

const seriesList = listBearingSeries()

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
  x: 1,
  y: 0,
  rpm: 1500,
  reliability: 90,
  targetHours: 10000,
  operatingTemp: 120,
  limitingSpeed: 8000,
})

const result = computed(() => analyzeBearingLife(form))
const modifierProduct = computed(() => {
  const r = result.value
  const p = (r.reliabilityFactor ?? 1) * (r.lifeConditionFactor ?? 1) * (r.temperatureFactor ?? 1)
  return p.toFixed(2)
})

function onModelChange() {
  if (!form.bearingModel) return
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
</script>
