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
            <el-select v-model="form.material" class="w-full">
              <el-option v-for="(m, k) in materials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </el-form-item>
          <CalcFormItem :label="pf('wireDiameter')"><el-input-number v-model="form.wireDiameter" :min="0.2" :precision="2" :step="0.1" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="pf('meanDiameter')">
            <el-input-number v-model="form.meanDiameter" :min="1" :precision="2" />
          </CalcFormItem>
          <template v-else>
            <CalcFormItem :label="pf('outerDiameter')">
              <el-input-number v-model="form.outerDiameter" :min="1" :precision="2" @change="syncMeanFromOuter" />
            </CalcFormItem>
            <CalcFormItem :label="pf('meanDiameter')">
              <el-input-number v-model="form.meanDiameter" :min="1" :precision="2" disabled />
            </CalcFormItem>
          </template>
          <CalcFormItem :label="pf('activeCoils')"><el-input-number v-model="form.activeCoils" :min="1" :step="0.5" :precision="1" /></CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('totalCoils')">
            <el-input-number v-model="form.totalCoils" :min="form.activeCoils + 1" :step="1" :precision="0" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode === 'simple'" :label="pf('load')">
            <el-input-number v-model="form.load" :min="0" :precision="1" />
          </CalcFormItem>
          <CalcFormItem :label="pf('allowableShear')"><el-input-number v-model="form.allowableShear" :min="100" /></CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('freeLength')">
              <el-input-number v-model="form.freeLength" :min="1" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('installHeight')">
              <el-input-number v-model="form.installHeight" :min="0" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('workingHeight')">
              <el-input-number v-model="form.workingHeight" :min="0" :precision="1" />
            </CalcFormItem>
            <CalcFormItem :label="pf('endType')">
              <el-select v-model="form.endType" class="w-full">
                <el-option :label="pf('endFixed')" value="fixed" />
                <el-option :label="pf('endFree')" value="free" />
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
              <el-input-number v-model="form.targetCycles" :min="1e4" :step="1e5" />
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
          v-if="form.calcMode !== 'simple' && result.geometryPass === false"
          class="mb-4"
          type="error"
          :closable="false"
          show-icon
          :title="pr('geometryBad')"
          :description="pr('geometryBadDesc', { h0: result.freeLength.toFixed(1), ls: result.solidHeight.toFixed(1) })"
        />
        <div class="mb-4 flex items-center gap-2">
          <el-tag :type="result.pass ? 'success' : 'danger'" effect="plain">
            {{ result.pass ? ct('pass') : ct('fail') }}
          </el-tag>
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
              <dd class="font-mono" :class="result.shearPass ? 'text-success' : 'text-error'">
                {{ result.tauWorking?.toFixed(1) }} MPa {{ result.shearPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('deflection')" /><dd class="font-mono">{{ result.deflection.toFixed(2) }} mm</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('shearStress')" />
              <dd class="font-mono" :class="result.shearPass ? 'text-success' : 'text-error'">
                {{ result.shearStress.toFixed(1) }} MPa {{ result.shearPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('springIndex')" />
            <dd class="font-mono" :class="form.calcMode === 'simple' || result.indexPass ? '' : 'text-error'">
              {{ result.springIndex?.toFixed(2) }} / {{ result.wahlFactor.toFixed(3) }}
              <template v-if="form.calcMode !== 'simple'">{{ result.indexPass ? ' ✓' : ' ✗' }}</template>
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
              <dd class="font-mono" :class="result.buckling?.bucklingPass ? '' : 'text-error'">
                {{ result.buckling?.slenderness?.toFixed(2) }} (≤ {{ result.buckling?.criticalSlenderness }})
                {{ result.buckling?.bucklingPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('solidMargin')" />
              <dd class="font-mono" :class="result.solidPass ? 'text-success' : 'text-error'">
                <template v-if="result.geometryPass">
                  {{ result.remainingDeflectionMargin.toFixed(2) }} mm
                </template>
                <template v-else>{{ pr('solidBad') }}</template>
                {{ result.solidPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
          <template v-if="form.calcMode === 'professional' && result.fatigueLife != null">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearAmplitude')" /><dd class="font-mono">{{ result.shearAmplitude?.toFixed(1) }} MPa</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('fatigueSafety')" />
              <dd class="font-mono" :class="result.fatiguePass ? 'text-success' : 'text-error'">
                {{ result.fatigueSafetyFactor?.toFixed(2) }} (≥ {{ result.fatigueMinSafety }})
                {{ result.fatiguePass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('fatigueLife')" />
              <dd class="font-mono" :class="result.fatiguePass ? 'text-success' : 'text-error'">
                {{ formatFatigueLife(result.fatigueLife) }} {{ pr('cyclesUnit') }}
                {{ result.fatiguePass ? '✓' : '✗' }}
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
import { reactive, computed, watch } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeSpring, SPRING_MATERIALS } from '@/utils/spring-calc'
import SpringDiagram from '@/components/spring/SpringDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import { adaptSpring } from '@/utils/calc-adapters'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('spring')
const { optionMap } = useOptionsI18n()

const materials = computed(() => optionMap(SPRING_MATERIALS, 'springMaterials'))
const form = reactive({
  calcMode: 'simple',
  material: '50CrVA',
  wireDiameter: 1.1,
  outerDiameter: 6.5,
  meanDiameter: 5.4,
  activeCoils: 5,
  totalCoils: 7,
  load: 150,
  allowableShear: 529,
  freeLength: 15,
  installHeight: 13,
  workingHeight: 12,
  endType: 'fixed',
  loadMin: 50,
  loadMax: 200,
  targetCycles: 1e6,
})

function syncMeanFromOuter() {
  if (form.wireDiameter != null && form.outerDiameter != null) {
    form.meanDiameter = Number((form.outerDiameter - form.wireDiameter).toFixed(2))
  }
}

watch(
  () => form.wireDiameter,
  () => syncMeanFromOuter(),
)

watch(
  () => form.endType,
  (endType) => {
    if (form.totalCoils == null) return
    const expected = endType === 'free' ? form.activeCoils + 1 : form.activeCoils + 2
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
      form.allowableShear = mat.allowableShear
    }
  },
  { immediate: true },
)

const result = computed(() => analyzeSpring(form))

const decisionPreset = DECISION_PRESETS.spring
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptSpring(form))

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
