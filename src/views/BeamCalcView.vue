<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="beam" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="148px">
          <el-form-item v-if="form.calcMode === 'simple'" :label="fc('material')">
            <el-select v-model="form.materialId" class="w-full" filterable>
              <el-option v-for="m in materialOptions" :key="m.id" :label="m.label" :value="m.id" />
            </el-select>
          </el-form-item>
          <CalcFormItem :label="pf('caseId')">
            <el-select v-model="form.caseId" class="w-full">
              <el-option v-for="c in caseOptions" :key="c.id" :label="c.label" :value="c.id" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('sectionType')">
            <el-select v-model="form.sectionType" class="w-full">
              <el-option v-for="(s, k) in sectionTypes" :key="k" :label="s.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <el-form-item v-for="p in sectionParams" :key="p.key" :label="p.label">
            <el-input-number v-model="form[p.key]" :min="p.min ?? 0.1" :precision="2" />
          </el-form-item>
          <CalcFormItem :label="pf('spanLength')">
            <el-input-number v-model="form.spanLength" :min="10" :max="10000" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="loadLabel">
            <el-input-number v-model="form.load" :min="0" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('elasticModulus')">
            <el-input-number v-model="form.elasticModulus" :min="1000" :step="10000" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('allowableStress')">
            <el-input-number v-model="form.allowableStress" :min="1" :disabled="form.calcMode === 'simple'" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('allowableDeflection')">
            <el-input-number v-model="form.allowableDeflection" :min="0.001" :precision="4" :step="0.01" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('dynamicFactor')">
              <el-input-number v-model="form.dynamicFactor" :min="1" :max="3" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('stressConcentration')">
              <el-input-number v-model="form.stressConcentration" :min="1" :max="4" :step="0.1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('loadRange')">
              <el-input-number v-model="form.loadMin" :min="0" class="w-28" />
              <el-input-number v-model="form.loadMax" :min="0" class="ml-2 w-28" />
            </CalcFormItem>
          </template>
        </el-form>

        <BeamDiagram :case-id="form.caseId" :span-length="form.spanLength" />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="result.errorKey" :title="re(result.errorKey)" type="error" show-icon />
        <template v-else>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>{{ pr('moment') }}</dt>
              <dd class="font-mono">{{ result.moment?.toFixed(0) }} N·mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>{{ pr('stress') }}</dt>
              <dd class="font-mono" :class="result.stressPass ? 'text-success' : 'text-error'">
                {{ result.stress?.toFixed(1) }} MPa {{ result.stressPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>{{ pr('deflection') }}</dt>
              <dd class="font-mono" :class="result.deflectionPass ? 'text-success' : 'text-error'">
                {{ result.deflection?.toFixed(4) }} mm {{ result.deflectionPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>{{ pr('inertia') }}</dt>
              <dd class="font-mono">{{ result.inertia?.toExponential(3) }} mm⁴</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>{{ pr('sectionModulus') }}</dt>
              <dd class="font-mono">{{ result.sectionModulus?.toFixed(1) }} mm³</dd>
            </div>
            <template v-if="form.calcMode !== 'simple'">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('utilization') }}</dt>
                <dd class="font-mono">{{ ((result.stressUtilization ?? 0) * 100).toFixed(1) }}% / {{ ((result.deflectionUtilization ?? 0) * 100).toFixed(1) }}%</dd>
              </div>
              <div v-if="result.slendernessWarning" class="text-xs text-amber-600">{{ pr('slendernessWarning') }}</div>
            </template>
            <div v-if="result.stressAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>{{ pr('stressAmplitude') }}</dt>
              <dd class="font-mono">{{ result.stressAmplitude?.toFixed(1) }} MPa</dd>
            </div>
          </dl>
          <el-tag class="mt-4" :type="result.pass ? 'success' : 'danger'">
            {{ result.pass ? pr('passTag') : pr('failTag') }}
          </el-tag>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { analyzeBeam, BEAM_CASES, SECTION_TYPES } from '@/utils/beam-calc'
import { MATERIALS, findMaterial } from '@/constants/materials'
import { materialsEn } from '@/i18n/materials-i18n'
import BeamDiagram from '@/components/beam/BeamDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useLocale } from '@/composables/useLocale'

const { pt, ct, pf, pr, fc } = useCalcPage('beam')
const { locale } = useLocale()
const { optionEntries, optionMap, ol } = useOptionsI18n()
const { re } = useResultI18n()

const form = reactive({
  calcMode: 'simple',
  materialId: 'q235',
  caseId: 'simply_center',
  sectionType: 'solid_round',
  diameter: 30,
  innerDiameter: 20,
  width: 20,
  height: 30,
  spanLength: 500,
  load: 2000,
  elasticModulus: 210000,
  allowableStress: 160,
  allowableDeflection: 0.5,
  dynamicFactor: 1.2,
  stressConcentration: 1.5,
  loadMin: 500,
  loadMax: 2000,
})

const caseOptions = computed(() => optionEntries(BEAM_CASES, 'beamCases'))
const sectionTypes = computed(() => optionMap(SECTION_TYPES, 'sectionTypes'))
const sectionParams = computed(() =>
  (SECTION_TYPES[form.sectionType]?.params ?? []).map((p) => ({
    ...p,
    label: ol('sectionParams', p.key),
  })),
)
const loadLabel = computed(() => ol('beamCases', form.caseId, 'loadLabel') || fc('load'))

const materialOptions = computed(() =>
  MATERIALS.map((m) => ({
    id: m.id,
    label: locale.value === 'en' ? (materialsEn[m.id]?.name ?? m.name) : m.name,
  })),
)

function applyBeamMaterial(id) {
  const mat = findMaterial(id)
  if (!mat) return
  form.elasticModulus = mat.E
  form.allowableStress = mat.sigmaAllow
}

watch(
  () => form.materialId,
  (id) => {
    if (form.calcMode === 'simple') applyBeamMaterial(id)
  },
  { immediate: true },
)

watch(
  () => form.spanLength,
  (L) => {
    if (form.allowableDeflection === 0.5 || form.allowableDeflection === form.spanLength / 1000) {
      form.allowableDeflection = L / 1000
    }
  },
)

const result = computed(() => analyzeBeam(form))
</script>
