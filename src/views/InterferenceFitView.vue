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
          <CalcFormItem :label="pf('shaftDiameter')">
            <el-input-number v-model="form.shaftDiameter" :min="5" :max="200" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('holeDiameter')">
            <el-input-number v-model="form.holeDiameter" :min="4" :max="199" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('interference')">
            <span class="font-mono text-primary">{{ interference.toFixed(3) }} mm</span>
            <span class="ml-2 text-xs text-gray-500">{{ pf('interferenceFormula') }}</span>
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('shaftInner')">
            <el-input-number v-model="form.shaftInnerDiameter" :min="0" :max="199" :precision="2" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('shaftInnerHint') }}</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('hubOuter')">
            <el-input-number v-model="form.hubOuterDiameter" :min="10" :max="400" :precision="1" />
            <el-button class="ml-1" size="small" link @click="resetOuter">{{ fc('recommend') }} {{ suggestedOuter }} mm</el-button>
          </CalcFormItem>
          <CalcFormItem :label="pf('fitLength')">
            <el-input-number v-model="form.fitLength" :min="1" :max="300" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('friction')">
            <el-input-number v-model="form.friction" :min="0.05" :max="0.4" :precision="2" :step="0.02" />
          </CalcFormItem>
          <el-divider content-position="left">{{ pf('dividerMaterials') }}</el-divider>
          <CalcFormItem :label="pf('shaftEv')">
            <el-input-number v-model="form.shaftE" :min="50000" :step="10000" class="w-28" />
            <el-input-number v-model="form.shaftNu" :min="0.2" :max="0.4" :precision="2" :step="0.01" class="ml-2 w-24" />
          </CalcFormItem>
          <CalcFormItem :label="pf('hubEv')">
            <el-input-number v-model="form.hubE" :min="50000" :step="10000" class="w-28" />
            <el-input-number v-model="form.hubNu" :min="0.2" :max="0.4" :precision="2" :step="0.01" class="ml-2 w-24" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'complete' || form.calcMode === 'professional'">
            <CalcFormItem :label="pf('allowHoop')">
              <el-input-number v-model="form.shaftAllowHoop" :min="50" :step="50" class="w-28" />
              <span class="ml-1 text-xs text-gray-500">{{ pf('shaftLabel') }}</span>
              <el-input-number v-model="form.hubAllowHoop" :min="50" :step="50" class="ml-2 w-28" />
              <span class="ml-1 text-xs text-gray-500">{{ pf('hubLabel') }}</span>
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">{{ pf('dividerTemp') }}</el-divider>
            <CalcFormItem :label="pf('deltaT')">
              <el-input-number v-model="form.deltaT" :min="-300" :max="500" :step="10" />
            </CalcFormItem>
            <CalcFormItem :label="pf('shaftAlpha')">
              <el-input-number v-model="form.shaftAlpha" :min="1e-6" :max="30e-6" :step="0.5e-6" :precision="7" class="w-32" />
              <el-input-number v-model="form.holeAlpha" :min="1e-6" :max="30e-6" :step="0.5e-6" :precision="7" class="ml-2 w-32" />
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
        <dl v-else class="space-y-3 text-sm">
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
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('torqueCapacity')" />
            <dd class="font-mono">{{ result.torqueCapacityNm?.toFixed(1) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('minWall')" />
            <dd class="font-mono">{{ result.minHubWall?.toFixed(2) }} mm</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-gray-500">
          {{ pf('footnote') }}
        </p>
        <router-link to="/thermal-expansion" class="mt-3 inline-block text-xs text-primary hover:underline">
          {{ pf('linkThermal') }}
        </router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import InterferenceFitDiagram from '@/components/interference/InterferenceFitDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('interference-fit')
const { resultError } = useResultI18n()

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
})

const interference = computed(() => form.shaftDiameter - form.holeDiameter)
const suggestedOuter = computed(() => Math.round(form.shaftDiameter * 1.8))

function resetOuter() {
  form.hubOuterDiameter = suggestedOuter.value
}

const result = computed(() => analyzeInterferenceFit(form))
</script>
