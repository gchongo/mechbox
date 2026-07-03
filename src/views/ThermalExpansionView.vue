<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="thermal-expansion" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pf('linearExpansion') }}</h2>
        <el-form label-width="148px">
          <CalcFormItem :label="pf('material1')">
            <el-select v-model="mat1" class="w-full" @change="onMat1">
              <el-option v-for="(m, k) in thermalMaterials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('length1')">
            <el-input-number v-model="form.length" :min="1" :max="10000" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('deltaT')">
            <el-input-number v-model="form.deltaT" :min="-300" :max="800" :step="10" />
            <span class="ml-2 text-sm text-gray-500">°C</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('alpha1')">
            <el-input-number v-model="form.alpha" :min="1e-6" :max="30e-6" :precision="2" :step="0.1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('alphaHint') }}</span>
          </CalcFormItem>
        </el-form>

        <ThermalExpansionDiagram
          :length="form.length"
          :delta-t="form.deltaT"
          :alpha="form.alpha"
          :shaft-diameter="form.shaftDiameter"
          :hole-diameter="form.holeDiameter"
          :show-fit="calcMode !== 'simple'"
        />

        <div class="rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
          <ResultLabel label-class="text-gray-500" :text="pf('deltaL1')" />
          <dd class="mt-1 font-mono text-lg">{{ linearResult.linearExpansion?.toFixed(4) }} mm</dd>
        </div>
      </section>

      <section v-if="calcMode !== 'simple'" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pf('fitChange') }}</h2>
        <el-form label-width="148px">
          <CalcFormItem :label="pf('material2')">
            <el-select v-model="mat2" class="w-full" @change="onMat2">
              <el-option v-for="(m, k) in thermalMaterials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('shaftDiameter')">
            <el-input-number v-model="form.shaftDiameter" :min="1" :max="500" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('holeDiameter')">
            <el-input-number v-model="form.holeDiameter" :min="1" :max="500" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('alpha2')">
            <el-input-number v-model="form.alpha2" :min="1e-6" :max="30e-6" :precision="2" :step="0.1" />
            <span class="ml-2 text-xs text-gray-500">×10⁻⁶ /°C</span>
          </CalcFormItem>
          <template v-if="calcMode === 'professional'">
            <CalcFormItem :label="pf('assemblyDeltaT')">
              <el-input-number v-model="form.assemblyDeltaT" :min="-200" :max="400" :step="10" />
              <span class="ml-2 text-xs text-gray-500">°C</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('serviceDeltaT')">
              <el-input-number v-model="form.serviceDeltaT" :min="-200" :max="800" :step="10" />
              <span class="ml-2 text-xs text-gray-500">°C</span>
            </CalcFormItem>
          </template>
        </el-form>
        <template v-if="linearResult.fit">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('initialInterference')" />
              <dd class="font-mono">{{ linearResult.fit.initialInterference?.toFixed(4) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('interferenceChange')" />
              <dd class="font-mono">{{ linearResult.fit.interferenceChange?.toFixed(4) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('finalInterference')" />
              <dd class="font-mono" :class="linearResult.fit.becomesClearance ? 'text-warning' : 'text-success'">
                {{ linearResult.fit.finalInterference?.toFixed(4) }} mm
              </dd>
            </div>
            <div v-if="linearResult.fit.becomesClearance" class="flex justify-between rounded bg-amber-50 p-3 dark:bg-amber-900/20">
              <ResultLabel :text="pr('becomesClearance')" />
              <dd class="font-mono">{{ linearResult.fit.finalClearance?.toFixed(4) }} mm</dd>
            </div>
            <div v-if="linearResult.assemblyFit" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('assemblyInterference')" />
              <dd class="font-mono">{{ linearResult.assemblyFit.finalInterference?.toFixed(4) }} mm</dd>
            </div>
          </dl>
          <router-link to="/interference-fit" class="mt-3 inline-block text-xs text-primary hover:underline">
            {{ pr('linkInterferenceFit') }}
          </router-link>
          <el-tag v-if="calcMode === 'professional'" class="mt-3" :type="linearResult.pass ? 'success' : 'danger'">
            {{ linearResult.pass ? pr('serviceSafe') : pr('mayLoosen') }}
          </el-tag>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeThermalExpansion, THERMAL_MATERIALS } from '@/utils/thermal-expansion-calc'
import ThermalExpansionDiagram from '@/components/thermal/ThermalExpansionDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const { pt, ct, pf, pr } = useCalcPage('thermal-expansion')
const { optionMap } = useOptionsI18n()

const thermalMaterials = computed(() => optionMap(THERMAL_MATERIALS, 'thermalMaterials'))

const calcMode = ref('simple')
const mat1 = ref('steel')
const mat2 = ref('steel')

const form = reactive({
  length: 100,
  deltaT: 100,
  alpha: 11.5,
  alpha2: 11.5,
  shaftDiameter: 50,
  holeDiameter: 49.975,
  assemblyDeltaT: 80,
  serviceDeltaT: 100,
})

function onMat1(k) {
  form.alpha = THERMAL_MATERIALS[k].alpha * 1e6
}
function onMat2(k) {
  form.alpha2 = THERMAL_MATERIALS[k].alpha * 1e6
}

const linearResult = computed(() =>
  analyzeThermalExpansion({
    calcMode: calcMode.value,
    length: form.length,
    deltaT: form.deltaT,
    alpha: form.alpha * 1e-6,
    alpha2: form.alpha2 * 1e-6,
    shaftDiameter: calcMode.value === 'simple' ? undefined : form.shaftDiameter,
    holeDiameter: calcMode.value === 'simple' ? undefined : form.holeDiameter,
    assemblyDeltaT: form.assemblyDeltaT,
    serviceDeltaT: form.serviceDeltaT,
  }),
)
</script>
