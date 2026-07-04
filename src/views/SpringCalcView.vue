<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="spring" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="130px">
          <el-form-item v-if="form.calcMode !== 'simple'" :label="fc('material')">
            <el-select v-model="form.material" class="w-full" @change="markConfirmed('material')">
              <el-option v-for="(m, k) in materials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </el-form-item>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('springProcess')">
            <el-select v-model="form.springProcess" class="w-full">
              <el-option :label="pf('processCold')" value="cold" />
              <el-option :label="pf('processHot')" value="hot" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple' && form.springProcess === 'hot'" :label="pf('hotCoilHardnessHrc')">
            <el-input-number v-model="form.hotCoilHardnessHrc" :min="42" :max="52" :precision="1" :step="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('wireDiameter')"><el-input-number v-model="form.wireDiameter" :min="0.2" :precision="2" :step="0.1" @change="markConfirmed('wireDiameter')" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="pf('meanDiameter')">
            <el-input-number v-model="form.meanDiameter" :min="1" :precision="2" />
          </CalcFormItem>
          <template v-else>
            <CalcFormItem :label="pf('outerDiameter')">
              <el-input-number v-model="form.outerDiameter" :min="1" :precision="2" @change="onOuterDiameterChange" />
            </CalcFormItem>
            <CalcFormItem :label="pf('meanDiameter')">
              <el-input-number v-model="form.meanDiameter" :min="1" :precision="2" disabled />
            </CalcFormItem>
          </template>
          <CalcFormItem :label="pf('activeCoils')"><el-input-number v-model="form.activeCoils" :min="1" :step="0.5" :precision="1" @change="markConfirmed('activeCoils')" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('totalCoils')">
            <el-input-number v-model="form.totalCoils" :min="form.activeCoils + 1" :step="1" :precision="0" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="pf('load')">
            <el-input-number v-model="form.load" :min="0" :precision="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('allowableShear')">
            <el-input-number v-model="form.allowableShear" :min="100" @change="form.allowableShearManual = true" />
            <p v-if="form.calcMode !== 'simple'" class="mt-1 text-xs text-gray-500">{{ pf('staticShearHint') }}</p>
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('loadCategory')">
            <el-select v-model="form.loadCategory" class="w-full" @change="form.allowableShearManual = false">
              <el-option :label="pf('loadCategoryAuto')" value="auto" />
              <el-option :label="pf('loadCategoryStatic')" value="static" />
              <el-option :label="pf('loadCategoryDynamicLimited')" value="dynamic_limited" />
              <el-option :label="pf('loadCategoryDynamicFigure')" value="dynamic_figure" />
            </el-select>
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('freeLength')">
              <el-input-number v-model="form.freeLength" :min="1" :precision="1" @change="markConfirmed('freeLength')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('installHeight')">
              <el-input-number v-model="form.installHeight" :min="0" :max="form.freeLength" :precision="1" @change="markConfirmed('installHeight')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('workingHeight')">
              <el-input-number v-model="form.workingHeight" :min="0" :max="form.installHeight ?? form.freeLength" :precision="1" @change="markConfirmed('workingHeight')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('endType')">
              <el-select v-model="form.endType" class="w-full" @change="markConfirmed('endType')">
                <el-option :label="pf('endFixed')" value="fixed" />
                <el-option :label="pf('endFree')" value="free" />
                <el-option :label="pf('endRotating')" value="rotating" />
              </el-select>
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">{{ pf('dividerVarLoad') }}</el-divider>
            <p v-if="form.installHeight != null && form.workingHeight != null" class="mb-3 text-xs text-gray-500 dark:text-gray-400">
              {{ pf('fatigueFromHeights') }}
            </p>
            <template v-else>
              <CalcFormItem :label="pf('loadMin')">
                <el-input-number v-model="form.loadMin" :min="0" :precision="1" />
              </CalcFormItem>
              <CalcFormItem :label="pf('loadMax')">
                <el-input-number v-model="form.loadMax" :min="0" :precision="1" />
              </CalcFormItem>
            </template>
            <CalcFormItem :label="pf('targetCycles')">
                <el-input-number v-model="form.targetCycles" :min="1e4" :step="1e5" @change="markConfirmed('targetCycles')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('tensileStrength')">
                <el-input-number v-model="form.tensileStrength" :min="500" :step="10" @change="onTensileStrengthChange" />
              <p class="mt-1 text-xs text-gray-500">{{ pf('tensileStrengthHint') }}</p>
            </CalcFormItem>
            <CalcFormItem :label="pf('excitationFrequency')">
              <el-input-number v-model="form.excitationFrequency" :min="0" :precision="1" />
            </CalcFormItem>
          </template>
        </el-form>

        <SpringDiagram
          :wire-diameter="form.wireDiameter"
          :mean-diameter="result.meanDiameter ?? form.meanDiameter"
          :outer-diameter="form.calcMode !== 'simple' ? form.outerDiameter : 0"
          :active-coils="form.activeCoils"
          :total-coils="form.calcMode !== 'simple' ? form.totalCoils : 0"
          :free-length="form.calcMode !== 'simple' ? form.freeLength : 0"
          :install-height="form.calcMode !== 'simple' ? form.installHeight : 0"
          :working-height="form.calcMode !== 'simple' ? form.workingHeight : 0"
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
          v-if="form.calcMode !== 'simple' && !result.heightsValid && result.heightValidation?.issues?.length"
          class="mb-4"
          type="error"
          :closable="false"
          show-icon
          :title="pr('geometryBad')"
          :description="heightIssueText"
        />
        <el-alert
          v-else-if="form.calcMode !== 'simple' && result.geometryPass === false && result.heightValidation?.issues?.includes('geometry')"
          class="mb-4"
          type="error"
          :closable="false"
          show-icon
          :title="pr('geometryBad')"
          :description="pr('geometryBadDesc', { h0: result.freeLength.toFixed(1), ls: result.solidHeight.toFixed(1) })"
        />
        <el-alert
          v-if="result.heightLoadsFallback"
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="pr('heightLoadsFallback')"
        />
        <el-alert
          v-if="result.heightLoadBlocked"
          class="mb-4"
          type="warning"
          :closable="false"
          show-icon
          :title="pr('heightLoadBlocked')"
        />
        <el-alert
          v-if="form.calcMode === 'professional' && result.fatigueLoadsFallback && !result.fatigueIssue"
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="pr('fatigueLoadsFallback')"
        />
        <el-alert
          v-if="form.calcMode === 'professional' && result.fatigueIssue"
          class="mb-4"
          type="warning"
          :closable="false"
          show-icon
          :title="pr('fatigueBlocked')"
          :description="fatigueIssueText"
        />
        <div class="mb-4 flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <el-tag :type="reviewOnly ? 'warning' : result.pass ? 'success' : 'danger'" effect="plain">
              {{ reviewOnly ? overallReviewText : result.pass ? ct('pass') : ct('fail') }}
            </el-tag>
            <span v-if="result.estimateOnly" class="text-xs text-amber-600">（估算/未放行）</span>
          </div>
          <p v-if="form.calcMode !== 'simple'" class="text-xs text-gray-500 dark:text-gray-400">{{ pf('passDisclaimer') }}</p>
        </div>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('springRate')" /><dd class="font-mono">{{ result.springRate.toFixed(4) }} N/mm</dd></div>
          <template v-if="result.usesHeightLoads">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('installLoad')" /><dd class="font-mono">{{ result.installLoad?.toFixed(2) }} N</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('workingLoad')" /><dd class="font-mono">{{ result.workingLoad?.toFixed(2) }} N</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('solidLoad')" /><dd class="font-mono">{{ result.solidLoad?.toFixed(2) }} N</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('tauInstall')" /><dd class="font-mono">{{ result.tauInstall?.toFixed(1) }} MPa</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('tauWorking')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.shearPass, result)">
                {{ result.tauWorking?.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.shearPass, result) }}
              </dd>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('deflection')" /><dd class="font-mono">{{ result.deflection.toFixed(2) }} mm</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('shearStress')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.shearPass, result)">
                {{ result.shearStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.shearPass, result) }}
              </dd>
            </div>
          </template>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('springIndex')" />
            <dd class="font-mono" :class="form.calcMode === 'simple' ? '' : reviewAwareCheckClass(result.indexPass, result)">
              {{ result.springIndex?.toFixed(2) }} / {{ result.wahlFactor.toFixed(3) }}
              <template v-if="form.calcMode !== 'simple'">
                {{ reviewAwareCheckMark(result.indexPass, result) }}
                <span v-if="result.indexPass && !result.indexRecommend" class="text-warning text-xs">({{ result.indexWarning }})</span>
              </template>
            </dd>
          </div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('solidHeight')" />
              <dd class="font-mono">{{ result.solidHeight.toFixed(2) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('unwindLength')" />
              <dd class="font-mono">{{ result.unwindLength.toFixed(1) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('buckling')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.buckling?.bucklingPass, result)">
                {{ result.buckling?.slenderness?.toFixed(2) }} (≤ {{ result.buckling?.criticalSlenderness }})
                <template v-if="result.buckling?.checkMode === 'critical_load'">
                  · Fc={{ result.buckling.criticalLoad?.toFixed(0) }} N
                </template>
                {{ reviewAwareCheckMark(result.buckling?.bucklingPass, result) }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('testLoad')" />
              <dd class="font-mono">
                {{ result.testLoad?.toFixed(1) }} N · fs={{ result.testDeflection?.toFixed(2) }} mm
                <span v-if="result.testLoadCappedAtSolid" class="text-xs text-warning">（=Fb）</span>
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('characteristic')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.characteristicPass, result)">
                f/fs={{ result.characteristic?.ratio?.toFixed(2) ?? '—' }}
                ({{ result.characteristic?.minRatio }}–{{ result.characteristic?.maxRatio }})
                {{ reviewAwareCheckMark(result.characteristicPass, result) }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('naturalFrequency')" />
              <dd class="font-mono">{{ result.naturalFrequency?.toFixed(1) }} Hz</dd>
            </div>
            <div v-if="result.resonance?.checked" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('resonance')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.resonancePass, result)">
                fe/fr={{ result.resonance?.ratio?.toFixed(2) }} (&gt; {{ result.resonance?.minRatio }})
                {{ reviewAwareCheckMark(result.resonancePass, result) }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('solidMargin')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.solidPass, result)">
                <template v-if="result.geometryPass">
                  {{ result.remainingDeflectionMargin.toFixed(2) }} mm
                </template>
                <template v-else>{{ pr('solidBad') }}</template>
                {{ reviewAwareCheckMark(result.solidPass, result) }}
              </dd>
            </div>
          </template>
          <template v-if="form.calcMode === 'professional' && result.fatigueLife != null">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearAmplitude')" /><dd class="font-mono">{{ result.shearAmplitude?.toFixed(1) }} MPa</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('fatigueSafety')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.fatiguePass, result)">
                {{ result.fatigueSafetyFactor?.toFixed(2) }} (≥ {{ result.fatigueMinSafety }})
                {{ reviewAwareCheckMark(result.fatiguePass, result) }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('fatigueLife')" />
              <dd class="font-mono text-gray-700 dark:text-gray-300">
                {{ formatFatigueLife(result.fatigueLife) }} {{ pr('cyclesUnit') }}
                <span class="text-xs text-gray-500">（表9分档估算；判定见 S）</span>
              </dd>
            </div>
          </template>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="k = \frac{G d^4}{8 D^3 n}" />
          <MathTex expr="\tau = \frac{8 F D}{\pi d^3} K" />
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
import { reactive, computed, watch, toRef } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeSpring, SPRING_MATERIALS, resolveSpringAllowableShear, resolveSpringLoadCategory, resolveSpringStressRatio } from '@/utils/spring-calc'
import { resolveSpringTensileStrength } from '@/utils/spring-rm-lookup'
import SpringDiagram from '@/components/spring/SpringDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import { adaptSpring } from '@/utils/calc-adapters'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { formatUnconfirmedLabels } from '@/utils/critical-input-guard'
import { isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('spring')
const { optionMap } = useOptionsI18n()

const materials = computed(() => optionMap(SPRING_MATERIALS, 'springMaterials'))
const form = reactive({
  calcMode: 'simple',
  material: '50CrVA',
  springProcess: 'cold',
  hotCoilHardnessHrc: 42,
  wireDiameter: 1.1,
  outerDiameter: 6.5,
  meanDiameter: 5.4,
  activeCoils: 5,
  totalCoils: 7,
  load: 150,
  allowableShear: 529,
  allowableShearManual: false,
  loadCategory: 'auto',
  freeLength: 15,
  installHeight: 13,
  workingHeight: 12,
  endType: 'fixed',
  loadMin: 50,
  loadMax: 200,
  targetCycles: 1e6,
  tensileStrength: 1810,
  tensileStrengthManual: false,
  excitationFrequency: 0,
})
const { markConfirmed, withConfirmed } = useCriticalInputConfirm(toRef(form, 'calcMode'))

function syncAllowableShear() {
  if (form.allowableShearManual) return
  const rm = resolveSpringTensileStrength({
    material: form.material,
    wireDiameter: form.wireDiameter,
    tensileStrength: form.tensileStrength,
    tensileStrengthManual: form.tensileStrengthManual,
    materialDefault: SPRING_MATERIALS[form.material]?.tensileStrength,
  }).value
  const springRate =
    form.wireDiameter && form.meanDiameter && form.activeCoils
      ? (80000 * form.wireDiameter ** 4) / (8 * form.meanDiameter ** 3 * form.activeCoils)
      : 0
  const fMin =
    springRate > 0 && form.installHeight != null ? springRate * (form.freeLength - form.installHeight) : null
  const fMax =
    springRate > 0 && form.workingHeight != null ? springRate * (form.freeLength - form.workingHeight) : null
  const gamma = resolveSpringStressRatio({
    loadMin: form.loadMin,
    loadMax: form.loadMax,
    fMin,
    fMax,
    heightsValid: true,
  })
  const loadCategory = resolveSpringLoadCategory({
    loadCategory: form.loadCategory,
    targetCycles: form.targetCycles,
    springProcess: form.springProcess,
    loadVariation: gamma != null && gamma < 1 - 1e-6,
  })
  const allow = resolveSpringAllowableShear({
    material: form.material,
    rm,
    loadCategory,
    targetCycles: form.targetCycles,
    gamma,
  })
  if (allow.value > 0) form.allowableShear = Math.round(allow.value)
}

function syncRmFromWireTable() {
  if (form.tensileStrengthManual) return
  const resolved = resolveSpringTensileStrength({
    material: form.material,
    wireDiameter: form.wireDiameter,
    materialDefault: SPRING_MATERIALS[form.material]?.tensileStrength,
  })
  if (resolved.source === 'appendix_f') {
    form.tensileStrength = resolved.value
  }
}

function syncMeanFromOuter() {
  if (form.wireDiameter != null && form.outerDiameter != null) {
    form.meanDiameter = Number((form.outerDiameter - form.wireDiameter).toFixed(2))
  }
}

function onOuterDiameterChange() {
  markConfirmed('outerDiameter')
  syncMeanFromOuter()
}

function onTensileStrengthChange() {
  form.tensileStrengthManual = true
  markConfirmed('tensileStrength')
}

watch(
  () => form.wireDiameter,
  () => {
    syncMeanFromOuter()
    syncRmFromWireTable()
    syncAllowableShear()
  },
)

watch(
  () => form.endType,
  (endType) => {
    if (form.totalCoils == null) return
    const expected = endType === 'fixed' ? form.activeCoils + 2 : form.activeCoils + 1
    if (Math.abs(form.totalCoils - expected) <= 1) {
      form.totalCoils = expected
    }
  },
)

watch(
  () => form.material,
  (m) => {
    const mat = SPRING_MATERIALS[m]
    if (mat && m !== 'custom') {
      form.allowableShearManual = false
      form.tensileStrengthManual = false
      form.tensileStrength = mat.tensileStrength
      syncRmFromWireTable()
      syncAllowableShear()
    }
  },
  { immediate: true },
)

watch(
  () => [
    form.loadCategory,
    form.targetCycles,
    form.loadMin,
    form.loadMax,
    form.installHeight,
    form.workingHeight,
    form.freeLength,
    form.wireDiameter,
    form.tensileStrength,
  ],
  () => {
    syncAllowableShear()
  },
)

const result = computed(() => analyzeSpring(withConfirmed(form)))
const reviewOnly = computed(() => isReviewOnlyResult(result.value))
const overallReviewText = computed(() => (locale.value === 'en' ? 'Review / Not released' : '需复核 / 未放行'))
const unconfirmedLabelText = computed(() =>
  formatUnconfirmedLabels(result.value.unconfirmedCriticalInputs ?? [], locale.value).join(
    locale.value === 'en' ? ', ' : '、',
  ),
)

const heightIssueText = computed(() => {
  const issues = result.value.heightValidation?.issues ?? []
  return issues.map((key) => pr(`heightIssue_${key}`)).join('；')
})

const fatigueIssueText = computed(() => {
  const key = result.value.fatigueIssue
  return key ? pr(`fatigueIssue_${key}`) : ''
})

const decisionPreset = DECISION_PRESETS.spring
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptSpring(withConfirmed(form)))

function onApplyInverse({ variable, value }) {
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Number(value.toFixed ? value.toFixed(2) : value)
  }
}

function formatFatigueLife(life) {
  if (life === Infinity) return '∞'
  return life?.toLocaleString?.() ?? String(life)
}
</script>
