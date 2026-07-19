<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="sheet-metal" />

    <el-radio-group v-model="workMode" class="mb-4" size="small">
      <el-radio-button value="unfold">{{ pf('workUnfold') }}</el-radio-button>
      <el-radio-button value="punch">{{ pf('workPunch') }}</el-radio-button>
      <el-radio-button value="flange">{{ pf('workFlange') }}</el-radio-button>
    </el-radio-group>

    <div v-if="workMode === 'punch'" class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('thickness')" unit="mm">
            <el-input-number v-model="punchForm.thickness" :min="0.3" :max="20" :precision="2" :step="0.1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('perimeter')" unit="mm">
            <el-input-number v-model="punchForm.perimeter" :min="1" :precision="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('punchMaterial')">
            <el-select v-model="punchMaterial" class="w-44" @change="applyPunchMat">
              <el-option v-for="(p, k) in punchMats" :key="k" :label="p.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('shearMPa')" unit="MPa">
            <el-input-number v-model="punchForm.shearMPa" :min="10" :max="800" />
          </CalcFormItem>
          <CalcFormItem :label="pf('clearancePct')" unit="%">
            <el-input-number v-model="punchForm.clearancePct" :min="5" :max="20" :precision="1" />
          </CalcFormItem>
          <template v-if="calcMode !== 'simple'">
            <CalcFormItem :label="pf('pressCapacity')" unit="kN">
              <el-input-number v-model="punchForm.pressCapacitykN" :min="1" />
            </CalcFormItem>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="punchResult.errorKey" :title="re(punchResult.errorKey)" type="error" show-icon />
        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-primary/5 p-3">
            <ResultLabel :text="pr('punchForce')" />
            <dd class="font-mono text-lg text-primary">{{ punchResult.punchForcekN?.toFixed(2) }} kN</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('sideClearance')" />
            <dd class="font-mono">{{ punchResult.sideClearance?.toFixed(3) }} mm</dd>
          </div>
          <div v-if="punchResult.stripperForcekN != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('stripperForce')" />
            <dd class="font-mono">{{ punchResult.stripperForcekN?.toFixed(2) }} kN</dd>
          </div>
          <el-tag v-if="typeof punchResult.pass === 'boolean'" :type="punchResult.pass ? 'success' : 'danger'">
            {{ punchResult.pass ? pf('processOk') : pf('processAdjust') }}
          </el-tag>
          <p class="text-xs text-gray-500">{{ pr('punchHint') }}</p>
        </dl>
      </section>
    </div>

    <div v-else-if="workMode === 'flange'" class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('thickness')" unit="mm">
            <el-input-number v-model="flangeForm.thickness" :min="0.3" :max="20" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('holeDia')" unit="mm">
            <el-input-number v-model="flangeForm.holeDia" :min="1" :precision="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('flangeHeight')" unit="mm">
            <el-input-number v-model="flangeForm.flangeHeight" :min="0.5" :precision="1" />
          </CalcFormItem>
          <CalcFormItem v-if="calcMode !== 'simple'" :label="pf('dieOpening')">
            <el-input-number v-model="flangeForm.dieOpening" :min="0" :precision="1" />
          </CalcFormItem>
        </el-form>
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="flangeResult.errorKey" :title="re(flangeResult.errorKey)" type="error" show-icon />
        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('preHoleDia')" />
            <dd class="font-mono">
              {{ flangeResult.preHoleDia != null ? flangeResult.preHoleDia.toFixed(2) + ' mm' : '—' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('hdRatio')" />
            <dd class="font-mono" :class="flangeResult.ratioPass ? 'text-success' : 'text-warning'">
              {{ flangeResult.hdRatio?.toFixed(3) }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pf('minFlangeScreen')" />
            <dd class="font-mono">{{ flangeResult.minFlangeRule?.toFixed(1) }} mm</dd>
          </div>
          <el-tag v-if="calcMode !== 'simple'" :type="flangeResult.pass ? 'success' : 'danger'">
            {{ flangeResult.pass ? pf('processOk') : pf('processAdjust') }}
          </el-tag>
          <p class="text-xs text-gray-500">{{ pr('flangeFormHint') }}</p>
        </dl>
      </section>
    </div>

    <div v-show="workMode === 'unfold'" class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('method')">
            <el-radio-group v-model="form.method">
              <el-radio value="k_factor">{{ pf('methodKFactor') }}</el-radio>
              <el-radio value="bend_deduction">{{ pf('methodBendDeduction') }}</el-radio>
            </el-radio-group>
          </CalcFormItem>
          <p class="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {{ form.method === 'k_factor' ? pf('basisTangentHint') : pf('basisOutsideHint') }}
          </p>
          <CalcFormItem :label="pf('thickness')" unit="mm">
            <el-input-number v-model="form.thickness" :min="0.3" :max="20" :precision="2" :step="0.1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('bendRadius')" unit="mm">
            <el-input-number v-model="form.bendRadius" :min="0.1" :max="50" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('kFactor')">
            <el-input-number v-model="form.kFactor" :min="0.2" :max="0.5" :precision="3" :step="0.01" />
            <el-select v-model="kPreset" class="ml-2 w-36" :placeholder="fc('preset')" @change="applyK">
              <el-option v-for="(p, k) in kFactorPresets" :key="k" :label="p.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem v-if="calcMode !== 'simple'" :label="pf('dieOpening')">
            <el-input-number v-model="form.dieOpening" :min="0" :max="100" :precision="1" :step="1" />
            <span class="ml-2 text-xs text-gray-500">{{ pf('dieOpeningHint') }}</span>
          </CalcFormItem>
          <template v-if="calcMode === 'professional'">
            <CalcFormItem :label="pf('springbackFactor')">
              <el-input-number v-model="form.springbackFactor" :min="0" :max="3" :precision="1" :step="0.1" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('springbackHint') }}</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('compensationSource')">
              <el-radio-group v-model="form.compensationSource" size="small">
                <el-radio-button value="empirical">{{ pf('sourceEmpirical') }}</el-radio-button>
                <el-radio-button value="material_table">{{ pf('sourceMaterialTable') }}</el-radio-button>
                <el-radio-button value="tryout">{{ pf('sourceTryout') }}</el-radio-button>
              </el-radio-group>
            </CalcFormItem>
            <CalcFormItem :label="pf('bendProcess')">
              <el-select v-model="form.bendProcess" class="w-48" size="small">
                <el-option
                  v-for="(p, k) in kFactorPresets"
                  :key="k"
                  :label="p.label"
                  :value="k"
                />
              </el-select>
            </CalcFormItem>
          </template>
        </el-form>

        <h3 class="mb-2 text-sm font-medium">{{ pf('segmentList') }}</h3>
        <div class="space-y-2">
          <div
            v-for="(seg, i) in segments"
            :key="i"
            class="flex flex-wrap items-center gap-2 rounded border border-gray-200 p-2 dark:border-gray-700"
          >
            <el-select v-model="seg.type" class="w-24" size="small">
              <el-option value="straight" :label="pf('segStraight')" />
              <el-option value="bend" :label="pf('segBend')" />
            </el-select>
            <template v-if="seg.type === 'straight'">
              <span class="text-xs text-gray-500">{{ straightLengthLabel }}</span>
              <el-input-number v-model="seg.length" :min="0" :precision="1" size="small" />
            </template>
            <template v-else>
              <span class="text-xs text-gray-500">{{ fc('angle') }}°</span>
              <el-input-number v-model="seg.angle" :min="1" :max="179" size="small" />
            </template>
            <el-button v-if="segments.length > 1" type="danger" link size="small" @click="removeSeg(i)">
              {{ fc('delete') }}
            </el-button>
          </div>
        </div>
        <el-button class="mt-2" size="small" @click="addSeg">{{ fc('addSegment') }}</el-button>

        <SheetMetalBendDiagram
          :thickness="form.thickness"
          :bend-radius="form.bendRadius"
          :k-factor="form.kFactor"
          :bend-angle="firstBendAngle"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="result.errorKey" :title="re(result.errorKey)" type="error" show-icon />
        <template v-else>
          <div class="mb-4 rounded-lg bg-primary/5 p-4 text-center">
            <ResultLabel label-class="text-sm text-gray-500" :text="pf('flatLength')" />
            <dd class="font-mono text-3xl text-primary">
              {{ result.flatLength?.toFixed(2) }} mm
            </dd>
            <p class="mt-1 text-xs text-gray-500">
              {{ result.bendCount }} {{ pr('bendCount') }} ·
              {{ form.method === 'k_factor' ? pf('methodKFactor') : pf('methodBendDeduction') }}
            </p>
            <p class="mt-1 text-xs text-gray-400">{{ pf('estimateOnlyHint') }}</p>
          </div>

          <div
            v-if="calcMode === 'professional' && result.compensatedFlatLength != null"
            class="mb-4 space-y-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
          >
            <div class="flex justify-between gap-2">
              <ResultLabel :text="pf('tryoutBlankLength')" />
              <dd class="shrink-0 font-mono">{{ result.compensatedFlatLength.toFixed(2) }} mm</dd>
            </div>
            <div class="flex justify-between gap-2 text-xs text-gray-500">
              <span>{{ pf('springbackPerBend') }}</span>
              <span class="font-mono">{{ result.springbackPerBend?.toFixed(3) }} mm</span>
            </div>
            <div class="flex justify-between gap-2 text-xs text-gray-500">
              <span>{{ pf('springbackSourceLabel') }}</span>
              <span>{{ compensationSourceLabel }}</span>
            </div>
            <div class="flex justify-between gap-2 text-xs text-gray-500">
              <span>{{ pf('springbackProcessLabel') }}</span>
              <span>{{ bendProcessLabel }}</span>
            </div>
          </div>

          <dl v-if="calcMode !== 'simple'" class="mb-4 space-y-2 text-sm">
            <div v-if="result.minFlangeRule != null" class="rounded bg-gray-50 p-2 dark:bg-gray-900">
              <div class="flex justify-between gap-2">
                <ResultLabel :text="minFlangeTitle" />
                <dd class="shrink-0 font-mono">{{ result.minFlangeRule?.toFixed(1) }} mm</dd>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                {{ pf('minFlangeBasisLabel') }}：
                <span class="font-mono">{{ result.minFlangeFormula }}</span>
                = {{ result.minFlangeRule?.toFixed(1) }} mm
              </p>
            </div>
            <div v-if="result.minStraightLength != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <ResultLabel :text="pf('minStraight')" />
              <dd
                class="font-mono"
                :class="result.flangePass ? 'text-success' : 'text-warning'"
              >
                {{ result.minStraightLength?.toFixed(1) }} mm
              </dd>
            </div>
          </dl>
          <el-table :data="result.details" size="small" border>
            <el-table-column label="#" width="50">
              <template #default="{ row }">{{ row.index + 1 }}</template>
            </el-table-column>
            <el-table-column prop="type" :label="fc('type')" width="70">
              <template #default="{ row }">
                {{ row.type === 'straight' ? pf('segStraight') : pf('segBend') }}
              </template>
            </el-table-column>
            <el-table-column :label="`${fc('contribution')} (mm)`">
              <template #default="{ row }">
                <span class="font-mono">{{ row.contribution?.toFixed(3) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-tag
            v-if="calcMode === 'complete' || calcMode === 'professional'"
            class="mt-3"
            :type="result.pass ? 'warning' : 'danger'"
          >
            {{ result.pass ? pf('processOk') : pf('processAdjust') }}
          </el-tag>

          <FormulaPanel>
            <MathTex :expr="formulaBa" block />
            <MathTex v-if="form.method === 'bend_deduction'" :expr="formulaBd" block />
            <MathTex :expr="formulaFlat" block />
            <MathTex v-if="calcMode !== 'simple'" :expr="formulaMinFlange" block />
            <MathTex v-if="calcMode === 'professional'" :expr="formulaSpringback" block />
            <template #hints>
              <ul>
                <li><MathContent :text="pr(form.method === 'k_factor' ? 'sheetHintK' : 'sheetHintBd')" /></li>
                <li v-if="calcMode !== 'simple'"><MathContent :text="pr('sheetHintFlange')" /></li>
                <li v-if="calcMode === 'professional'"><MathContent :text="pr('sheetHintSpring')" /></li>
              </ul>
            </template>
          </FormulaPanel>
        </template>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="sheet-metal"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="activeResult"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import {
  analyzeSheetMetalUnfold,
  analyzePunchBlanking,
  analyzeFlangeForm,
  K_FACTOR_PRESETS,
  PUNCH_MATERIAL_SHEAR,
} from '@/utils/sheet-metal-calc'
import SheetMetalBendDiagram from '@/components/sheet-metal/SheetMetalBendDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput } from '@/utils/history-replay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('sheet-metal')
const { optionMap } = useOptionsI18n()
const { re } = useResultI18n()

const kFactorPresets = computed(() => optionMap(K_FACTOR_PRESETS, 'kFactorPresets'))
const punchMats = computed(() => optionMap(PUNCH_MATERIAL_SHEAR, 'punchMaterials'))

const calcMode = ref('simple')
const workMode = ref('unfold')
const punchMaterial = ref('mild_steel')

const form = reactive({
  method: 'k_factor',
  thickness: 1.5,
  bendRadius: 1.5,
  kFactor: 0.33,
  dieOpening: null,
  springbackFactor: 0.5,
  compensationSource: 'empirical',
  bendProcess: 'air_bend',
})

const punchForm = reactive({
  thickness: 1.5,
  perimeter: 200,
  shearMPa: 320,
  clearancePct: 10,
  pressCapacitykN: 100,
  stripperFactor: 0.08,
})

const flangeForm = reactive({
  thickness: 1.5,
  holeDia: 20,
  flangeHeight: 8,
  dieOpening: null,
  maxHdRatio: 0.6,
})

function applyPunchMat(k) {
  const p = PUNCH_MATERIAL_SHEAR[k]
  if (p) punchForm.shearMPa = p.shearMPa
}

const segments = ref([
  { type: 'straight', length: 50 },
  { type: 'bend', angle: 90 },
  { type: 'straight', length: 80 },
  { type: 'bend', angle: 90 },
  { type: 'straight', length: 50 },
])

const kPreset = ref('')

const straightLengthLabel = computed(() =>
  form.method === 'bend_deduction' ? pf('segLengthOutside') : pf('segLengthTangent'),
)

const minFlangeTitle = computed(() =>
  result.value?.minFlangeBasis === 'die_opening' ? pf('minFlangeByDie') : pf('minFlangeScreen'),
)

const compensationSourceLabel = computed(() => {
  const map = {
    empirical: pf('sourceEmpirical'),
    material_table: pf('sourceMaterialTable'),
    tryout: pf('sourceTryout'),
  }
  return map[result.value?.compensationSource] ?? pf('sourceEmpirical')
})

const bendProcessLabel = computed(() => {
  const key = result.value?.bendProcess ?? form.bendProcess
  return kFactorPresets.value[key]?.label ?? key
})

function applyK(key) {
  if (K_FACTOR_PRESETS[key]) {
    form.kFactor = K_FACTOR_PRESETS[key].k
    form.bendProcess = key
  }
}

function addSeg() {
  segments.value.push({ type: 'straight', length: 30 })
}

function removeSeg(i) {
  segments.value.splice(i, 1)
}

const firstBendAngle = computed(() => {
  const bend = segments.value.find((s) => s.type === 'bend')
  return bend?.angle ?? 90
})

const result = computed(() =>
  analyzeSheetMetalUnfold({
    calcMode: calcMode.value,
    ...form,
    segments: segments.value,
    bendRadius: form.bendRadius || form.thickness,
  }),
)

const punchResult = computed(() =>
  analyzePunchBlanking({
    calcMode: calcMode.value,
    ...punchForm,
    materialId: punchMaterial.value,
  }),
)

const flangeResult = computed(() =>
  analyzeFlangeForm({
    calcMode: calcMode.value,
    ...flangeForm,
  }),
)

const activeResult = computed(() => {
  if (workMode.value === 'punch') return punchResult.value
  if (workMode.value === 'flange') return flangeResult.value
  return result.value
})

const formulaBa = String.raw`BA = \dfrac{\pi}{180}\,\theta\,(R + K\,T)`
const formulaBd = String.raw`BD = 2(R+T)\tan\dfrac{\theta}{2} - BA`
const formulaFlat = computed(() =>
  form.method === 'bend_deduction'
    ? String.raw`L_{\mathrm{flat}} = \sum L_{\mathrm{out}} - \sum BD`
    : String.raw`L_{\mathrm{flat}} = \sum L_{\mathrm{t}} + \sum BA`,
)
const formulaMinFlange = computed(() =>
  form.dieOpening > 0
    ? String.raw`L_{\min} \approx \dfrac{V}{2} + 2 + T`
    : String.raw`L_{\min} \approx 4T`,
)
const formulaSpringback = String.raw`L_{\mathrm{try}} \approx L_{\mathrm{flat}}\left(1+\dfrac{s_b}{90\,n}\right)`

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: activeResult,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = activeResult.value
    if (r?.errorKey) return []
    if (workMode.value === 'punch') {
      return [{ label: pr('punchForce'), value: `${r.punchForcekN?.toFixed(2) ?? '-'} kN` }]
    }
    if (workMode.value === 'flange') {
      return [{ label: pr('preHoleDia'), value: r.preHoleDia != null ? `${r.preHoleDia.toFixed(2)} mm` : '—' }]
    }
    return [
      { label: pf('flatLength'), value: `${r.flatLength?.toFixed(2) ?? '-'} mm` },
      { label: fc('check'), value: r.pass ? pf('processOk') : pf('processAdjust') },
    ]
  },
})
const historyInput = computed(() =>
  snapshotHistoryInput({
    workMode: workMode.value,
    calcMode: calcMode.value,
    ...form,
    segments: segments.value,
    punchForm: { ...punchForm },
    flangeForm: { ...flangeForm },
  }),
)

function applySheetMetalReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.calcMode != null) calcMode.value = input.calcMode
  if (input.workMode != null) workMode.value = input.workMode
  if (Array.isArray(input.segments)) segments.value = structuredClone(input.segments)
  if (input.punchForm) Object.assign(punchForm, input.punchForm)
  if (input.flangeForm) Object.assign(flangeForm, input.flangeForm)
  Object.assign(form, input)
}
useHistoryReplay('sheet-metal', null, { applyFn: applySheetMetalReplay })
</script>
