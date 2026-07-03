<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="shaft" />

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane :label="pf('tabTorsion')" name="torsion" />
      <el-tab-pane :label="pf('tabCombined')" name="combined" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item v-if="form.calcMode === 'simple'" :label="fc('material')">
            <el-select v-model="form.materialId" class="w-full" filterable>
              <el-option v-for="m in materialOptions" :key="m.id" :label="m.label" :value="m.id" />
            </el-select>
          </el-form-item>
          <CalcFormItem :label="pf('diameter')"><el-input-number v-model="form.diameter" :min="1" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('innerDiameter')">
            <el-input-number v-model="form.innerDiameter" :min="0" :max="form.diameter - 1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('innerDiameterHint') }}</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('torque')"><el-input-number v-model="form.torque" :min="0" :precision="2" /></CalcFormItem>
          <CalcFormItem v-if="mode === 'torsion'" :label="pf('shaftLength')"><el-input-number v-model="form.length" :min="10" :step="50" /></CalcFormItem>
          <CalcFormItem v-if="mode === 'combined'" :label="pf('bendingMoment')"><el-input-number v-model="form.bendingMoment" :min="0" :precision="2" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('yieldStrength')">
            <el-input-number v-model="form.yieldStrength" :min="100" :step="50" />
          </CalcFormItem>
          <el-form-item :label="mode === 'combined' ? pf('allowableCombined') : pf('allowableShear')">
            <el-input-number v-model="form.allowable" :min="10" :disabled="form.calcMode === 'simple'" />
          </el-form-item>
          <template v-if="form.calcMode === 'professional' && mode === 'torsion'">
            <CalcFormItem :label="pf('ktTorsion')">
              <el-input-number v-model="form.stressConcentrationTorsion" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('torqueAmplitude')">
              <el-input-number v-model="form.torqueAmplitude" :min="0" :precision="2" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional' && mode === 'combined'">
            <CalcFormItem :label="pf('ktBending')">
              <el-input-number v-model="form.stressConcentrationBending" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('ktTorsion')">
              <el-input-number v-model="form.stressConcentrationTorsion" :min="1" :max="5" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('bendingAmplitude')">
              <el-input-number v-model="form.bendingAmplitude" :min="0" :precision="2" />
            </CalcFormItem>
          </template>
        </el-form>

        <ShaftDiagram
          :diameter="form.diameter"
          :inner-diameter="form.innerDiameter"
          :mode="mode"
          :length="form.length"
        />
      </section>
      <section class="card-panel">
        <el-alert v-if="torsionResult.errorKey && mode === 'torsion'" :title="re(torsionResult.errorKey)" type="warning" show-icon class="mb-3" />
        <el-alert v-if="combinedResult.errorKey && mode === 'combined'" :title="re(combinedResult.errorKey)" type="warning" show-icon class="mb-3" />
        <dl v-if="mode === 'torsion' && !torsionResult.errorKey" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearStress') + ' τ'" /><dd class="font-mono" :class="torsionResult.pass?'text-success':'text-error'">{{ torsionResult.shearStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('twistAngle') + ' θ'" /><dd class="font-mono">{{ torsionResult.twistAngle.toFixed(4) }}°</dd></div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('minDiameter')" /><dd class="font-mono">{{ torsionResult.minDiameter?.toFixed(1) }} mm</dd></div>
          <div v-if="form.calcMode === 'professional' && torsionResult.peakShearStress" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('peakShear')" /><dd class="font-mono">{{ torsionResult.peakShearStress.toFixed(2) }} MPa</dd></div>
          <div v-if="torsionResult.fatigueAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('fatigueAmp')" /><dd class="font-mono">{{ torsionResult.fatigueAmplitude?.toFixed(1) }} / {{ torsionResult.fatigueEndurance?.toFixed(0) }} MPa</dd></div>
        </dl>
        <dl v-else-if="!combinedResult.errorKey" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('bendingStress') + ' σ'" /><dd class="font-mono">{{ combinedResult.bendingStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('torsionStress') + ' τ'" /><dd class="font-mono">{{ combinedResult.torsionStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('equivalentStress') + ' σ_eq'" /><dd class="font-mono" :class="combinedResult.pass?'text-success':'text-error'">{{ combinedResult.equivalentStress.toFixed(2) }} MPa {{ combinedResult.pass?'✓':'✗' }}</dd></div>
          <div v-if="combinedResult.utilization" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('utilization')" /><dd class="font-mono">{{ (combinedResult.utilization * 100).toFixed(1) }}%</dd></div>
        </dl>
        <div class="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex v-if="mode === 'combined'" expr="\sigma_{eq} = \sqrt{\sigma^2 + 3\tau^2}" block />
          <MathTex v-else expr="\tau = \frac{16T}{\pi d^3}" block />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref, watch } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
import { MATERIALS, findMaterial } from '@/constants/materials'
import { materialsEn } from '@/i18n/materials-i18n'
import ShaftDiagram from '@/components/shaft/ShaftDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useLocale } from '@/composables/useLocale'

const { pt, ct, pf, pr, fc } = useCalcPage('shaft')
const { re } = useResultI18n()
const { locale } = useLocale()
const mode = ref('torsion')
const form = reactive({
  calcMode: 'simple',
  materialId: 'q235',
  diameter: 30,
  innerDiameter: 0,
  torque: 200,
  length: 500,
  bendingMoment: 150,
  allowable: 94,
  yieldStrength: 235,
  stressConcentrationBending: 1.5,
  stressConcentrationTorsion: 1.3,
  torqueAmplitude: 80,
  bendingAmplitude: 60,
})

const materialOptions = computed(() =>
  MATERIALS.map((m) => ({
    id: m.id,
    label: locale.value === 'en' ? (materialsEn[m.id]?.name ?? m.name) : m.name,
  })),
)

function applyShaftMaterial(id) {
  const mat = findMaterial(id)
  if (!mat) return
  form.yieldStrength = mat.sigmaS || mat.sigmaAllow * 1.5
  form.allowable = mode.value === 'combined' ? mat.sigmaAllow : mat.tauAllow
}

watch(
  () => [form.materialId, mode.value],
  ([id]) => {
    if (form.calcMode === 'simple') applyShaftMaterial(id)
  },
  { immediate: true },
)

const torsionResult = computed(() =>
  analyzeShaftTorsion({
    ...form,
    allowableShear: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)
const combinedResult = computed(() =>
  analyzeShaftCombined({
    ...form,
    allowableStress: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)
</script>
