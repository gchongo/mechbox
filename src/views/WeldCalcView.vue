<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <ChainSyncBanner
      :session="chainSession"
      :chain-name="chainName"
      :dirty="dirty"
      @sync="syncToChain"
      @back="backToChain"
      @dismiss="dismissSession"
    />

    <el-tabs v-model="tab">
      <el-tab-pane :label="pf('tabFillet')" name="fillet">
        <CalcModePanel v-model="form.calcMode" page-key="weld" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pf('legSize')" unit="mm">
                <el-input-number v-model="form.legSize" :min="3" :step="1" />
              </CalcFormItem>
              <CalcFormItem :label="pf('weldLength')" unit="mm">
                <el-input-number v-model="form.weldLength" :min="10" />
              </CalcFormItem>
              <CalcFormItem :label="pf('force')" unit="N">
                <el-input-number v-model="form.force" :min="0" :step="100" />
              </CalcFormItem>
              <template v-if="form.calcMode === 'professional'">
                <CalcFormItem :label="pf('eccentricity')">
                  <el-input-number v-model="form.eccentricity" :min="0" :precision="1" />
                </CalcFormItem>
                <CalcFormItem :label="pf('heatInput')">
                  <el-input-number v-model="form.heatInput" :min="0.5" :max="5" :precision="2" :step="0.1" />
                </CalcFormItem>
                <CalcFormItem :label="pf('plateThickness')">
                  <el-input-number v-model="form.plateThickness" :min="3" />
                </CalcFormItem>
                <CalcFormItem :label="pf('stressRangeDelta')">
                  <el-input-number v-model="form.stressRange" :min="0" :precision="1" />
                </CalcFormItem>
              </template>
              <CalcFormItem :label="pf('steelGrade')">
                <el-select v-model="form.steelGrade" class="w-full">
                  <el-option v-for="(g, k) in weldSteelGrades" :key="k" :label="g.label" :value="k" />
                </el-select>
              </CalcFormItem>
            </el-form>

            <FilletWeldDiagram
              :leg-size="form.legSize"
              :weld-length="form.weldLength"
              :throat="filletResult.throat ?? form.legSize * 0.7"
              :force="form.force"
              :eccentricity="form.calcMode === 'professional' ? form.eccentricity : 0"
            />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag class="mb-3" :type="filletOverallType">
              {{ pr('overall') }}: {{ filletOverallLabel }}
            </el-tag>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('throat')" />
                <dd class="font-mono">{{ filletResult.throat?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('shearStress')" />
                <dd class="font-mono">{{ filletResult.shearStress?.toFixed(1) }} MPa</dd>
              </div>
              <template v-if="filletResult.combined">
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="pr('bendingStressWeld')" />
                  <dd class="font-mono">{{ filletResult.combined.bendingStress?.toFixed(1) }} MPa</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="pr('combinedStress')" />
                  <dd class="font-mono" :class="reviewAwareCheckClass(filletResult.combinedPass, snapshot)">
                    {{ filletResult.combined.equivalentStress?.toFixed(1) }} MPa
                    {{ reviewAwareCheckMark(filletResult.combinedPass, snapshot, reviewMarkText) }}
                  </dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="pr('combinedAllow')" />
                  <dd class="font-mono text-xs">
                    {{ filletResult.combinedAllow?.toFixed(1) }} MPa
                    <span v-if="filletResult.combinedAllowStandard" class="text-gray-500">
                      （{{ filletResult.combinedAllowStandard }}）
                    </span>
                  </dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="pr('combinedUtilization')" />
                  <dd class="font-mono" :class="reviewAwareCheckClass(filletResult.combinedPass, snapshot)">
                    {{ ((filletResult.combinedUtilization ?? 0) * 100).toFixed(1) }}%
                  </dd>
                </div>
                <p class="text-xs text-gray-500">{{ pr('combinedModelHint') }}</p>
                <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <div class="flex justify-between gap-2">
                    <ResultLabel :text="pr('hazShearScreen')" />
                    <dd
                      class="shrink-0 font-mono"
                      :class="reviewAwareCheckClass(filletResult.haz?.pass, snapshot)"
                    >
                      {{ filletResult.haz?.weldStress?.toFixed?.(1) ?? filletResult.haz?.weldStress }}
                      /
                      {{ filletResult.haz?.hazAllowShear }} MPa
                      {{ reviewAwareCheckMark(!!filletResult.haz?.pass, snapshot, reviewMarkText) }}
                    </dd>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">{{ pr('hazShearScreenHint') }}</p>
                </div>
              </template>
            </dl>
            <el-table v-if="filletResult.standards?.length" :data="filletResult.standards" size="small" border class="mt-4">
              <el-table-column prop="standard" :label="pr('standard')" />
              <el-table-column :label="pr('allowable')">
                <template #default="{ row }">{{ row.allowableShear?.toFixed(1) }}</template>
              </el-table-column>
              <el-table-column :label="pr('utilization')">
                <template #default="{ row }">
                  <span :class="reviewAwareCheckClass(row.pass, snapshot)">
                    {{ (row.utilization * 100).toFixed(1) }}% {{ reviewAwareCheckMark(row.pass, snapshot, reviewMarkText) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
            <p v-if="filletReviewOnly" class="mt-3 text-xs text-warning">{{ pt('hintSimple') }}</p>
            <p v-if="filletResult.strictest" class="mt-2 text-xs text-gray-500">
              {{ pr('strictestStandard') }}: {{ filletResult.strictest?.standard }} ({{ pr('allowable') }} {{ filletResult.strictest?.allowableShear?.toFixed(1) }} MPa)
            </p>
          </section>
        </div>

        <DecisionToolsPanel
          :preset="decisionPreset"
          :snapshot="snapshot"
          :base-inputs="baseInputs"
          @apply="onApplyInverse"
        />
      </el-tab-pane>

      <el-tab-pane :label="pf('tabButt')" name="butt">
        <CalcModePanel v-model="butt.calcMode" page-key="weld" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pf('thickness')" unit="mm">
                <el-input-number v-model="butt.thickness" :min="3" />
              </CalcFormItem>
              <CalcFormItem :label="pf('weldLength')" unit="mm">
                <el-input-number v-model="butt.weldLength" :min="10" />
              </CalcFormItem>
              <CalcFormItem :label="pf('tensionForce')" unit="N">
                <el-input-number v-model="butt.force" :min="0" :step="500" />
              </CalcFormItem>
              <CalcFormItem v-if="butt.calcMode === 'professional'" :label="pf('penetrationEfficiency')">
                <el-input-number v-model="butt.penetrationEfficiency" :min="0.5" :max="1" :step="0.05" :precision="2" />
              </CalcFormItem>
              <CalcFormItem v-if="butt.calcMode === 'professional'" :label="pf('stressConcentrationKf')">
                <el-input-number v-model="butt.stressConcentration" :min="1" :max="3" :step="0.1" :precision="1" />
              </CalcFormItem>
            </el-form>

            <ButtWeldDiagram
              :thickness="butt.thickness"
              :weld-length="butt.weldLength"
              :force="butt.force"
              :penetration-efficiency="butt.penetrationEfficiency"
              :stress-concentration="butt.stressConcentration"
              :show-penetration="butt.calcMode === 'professional'"
            />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag class="mb-3" :type="buttOverallType">
              <MathContent :text="buttOverallLabel" class="inline" />
            </el-tag>
            <p class="mb-2 text-xs text-gray-500">
              <MathContent :text="pr('buttAssumptionHint')" />
            </p>
            <p class="mb-2 text-sm">
              <MathContent :text="buttStressLine" />
            </p>
            <el-table :data="buttRows" size="small" border>
              <el-table-column prop="standard" :label="pr('standard')" />
              <el-table-column prop="allow" :label="pr('allowable')" />
              <el-table-column :label="fc('check')">
                <template #default="{ row }">
                  <el-tag :type="buttRowType(row.pass)" size="small">{{ buttRowLabel(row.pass) }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
            <p v-if="buttReviewOnly" class="mt-3 text-xs text-warning">{{ pt('hintSimple') }}</p>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabFatigue')" name="fatigue">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="130px">
              <CalcFormItem :label="pf('stressRangeDelta')" unit="MPa">
                <el-input-number v-model="fatigue.stressRange" :min="1" :precision="1" />
              </CalcFormItem>
              <p class="mb-3 text-xs leading-relaxed text-gray-500">
                <MathContent :text="pf('stressRangeHint')" />
              </p>
              <CalcFormItem :label="pf('cycles')">
                <el-input-number v-model="fatigue.cycles" :min="1000" :step="10000" />
              </CalcFormItem>
              <CalcFormItem :label="pf('detailCategory')">
                <el-select v-model="fatigue.detailCategory" class="w-full">
                  <el-option v-for="(d, k) in weldDetailCategories" :key="k" :label="d.label" :value="k" />
                </el-select>
              </CalcFormItem>
            </el-form>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-alert v-if="fatigueResult?.errorKey" :title="resultError(fatigueResult)" type="warning" show-icon />
            <template v-else>
              <el-tag class="mb-3" :type="fatigueOverallType">
                {{ fatigueVerdictLabel }}
              </el-tag>
              <div
                class="mb-3 rounded-lg bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400"
              >
                <MathContent :text="pr('fatigueAssumptionHint')" />
              </div>
              <dl class="space-y-2 text-sm">
                <div class="flex justify-between rounded bg-primary/5 p-3">
                  <ResultLabel :text="pr('estimatedLife')" />
                  <dd class="font-mono text-primary">
                    {{ fatigueResult.estimatedLife?.toLocaleString() }} {{ pr('lifeUnit') }}
                  </dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="pr('allowableAtCycles')" />
                  <dd class="font-mono">{{ fatigueResult.allowableAtCycles }} MPa</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="pr('enduranceLimit')" />
                  <dd class="font-mono">{{ fatigueResult.enduranceLimit }} MPa</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>{{ fc('check') }}</dt>
                  <dd :class="fatigueResult.pass ? 'text-success' : 'text-error'">
                    {{ fatigueResult.pass ? fc('pass') : fc('fail') }}
                  </dd>
                </div>
              </dl>
            </template>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabHaz')" name="haz">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pf('heatInputQ')" unit="kJ/mm">
                <el-input-number v-model="haz.heatInput" :min="0.5" :max="5" :step="0.1" :precision="2" />
              </CalcFormItem>
              <CalcFormItem :label="pf('plateThickness')" unit="mm">
                <el-input-number v-model="haz.plateThickness" :min="3" />
              </CalcFormItem>
              <CalcFormItem :label="pf('steelGrade')">
                <el-select v-model="haz.steelGrade" class="w-full">
                  <el-option v-for="(g, k) in weldSteelGrades" :key="k" :label="g.label" :value="k" />
                </el-select>
              </CalcFormItem>
              <CalcFormItem :label="pf('legSize')">
                <el-input-number v-model="haz.legSize" :min="3" />
              </CalcFormItem>
              <CalcFormItem :label="pf('force')">
                <el-input-number v-model="haz.force" :min="0" :step="100" />
              </CalcFormItem>
              <CalcFormItem :label="pf('weldLength')">
                <el-input-number v-model="haz.weldLength" :min="10" />
              </CalcFormItem>
            </el-form>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag class="mb-2" :type="hazOverallType">
              {{ pr('overall') }}: {{ hazOverallLabel }}
            </el-tag>
            <p v-if="hazStatusHint" class="mb-2 text-xs" :class="hazOverallStatus === 'fail' ? 'text-error' : 'text-warning'">
              {{ hazStatusHint }}
            </p>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <ResultLabel :text="pr('hazWidth')" />
                <dd class="font-mono text-primary">{{ hazResult.hazWidthMm }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('hazAllowShear')" />
                <dd class="font-mono">{{ hazResult.hazAllowShear }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('baseAllowShear')" />
                <dd class="font-mono">{{ hazResult.baseAllowShear }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('weldStress')" />
                <dd class="font-mono" :class="hazResult.pass ? 'text-success' : 'text-error'">
                  {{ hazResult.weldStress }} MPa
                </dd>
              </div>
            </dl>
            <p class="mt-3 text-xs text-gray-500">{{ rm('weld', `haz_note_${hazResult.noteKey}`) }}</p>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="weld"
        :title="`${pt('title')} – ${tabLabels[tab]}`"
        :status="saveStatus"
        :summary="historySummary"
        :input="{ tab, form, butt, fatigue, haz }"
        :result="historyResult"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import {
  analyzeFilletWeld,
  analyzeButtWeld,
  analyzeWeldFatigue,
  analyzeHAZ,
  WELD_STEEL_GRADES,
  WELD_DETAIL_CATEGORIES,
} from '@/utils/weld-calc'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import FilletWeldDiagram from '@/components/weld/FilletWeldDiagram.vue'
import ButtWeldDiagram from '@/components/weld/ButtWeldDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import { adaptButtWeld, adaptFilletWeld, adaptWeldFatigue, adaptWeldHaz } from '@/utils/calc-adapters'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { getCalcReviewStatus, isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('weld')
const { optionMap, ol } = useOptionsI18n()
const { rm, resultError } = useResultI18n()

const weldSteelGrades = computed(() => optionMap(WELD_STEEL_GRADES, 'weldSteelGrades'))
const weldDetailCategories = computed(() => optionMap(WELD_DETAIL_CATEGORIES, 'weldDetailCategories'))
const weldStandards = computed(() => ({
  gb: { label: ol('weldStandards', 'gb') },
  en1993: { label: ol('weldStandards', 'en1993') },
  aws: { label: ol('weldStandards', 'aws') },
}))

const tabLabels = computed(() => ({
  fillet: pf('tabFillet'),
  butt: pf('tabButt'),
  fatigue: pf('tabFatigue'),
  haz: pf('tabHaz'),
}))

const tab = ref('fillet')
const form = reactive({
  calcMode: 'complete',
  legSize: 6,
  weldLength: 80,
  force: 12000,
  steelGrade: 'Q235',
  eccentricity: 20,
  heatInput: 1.5,
  plateThickness: 8,
  stressRange: 35,
})
const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('weld', form)
const butt = reactive({
  calcMode: 'complete',
  thickness: 8,
  weldLength: 100,
  force: 50000,
  steelGrade: 'Q235',
  penetrationEfficiency: 1,
  stressConcentration: 1.2,
})
const fatigue = reactive({ stressRange: 40, cycles: 1e6, detailCategory: 'medium' })
const haz = reactive({
  heatInput: 1.5,
  plateThickness: 8,
  steelGrade: 'Q235',
  legSize: 6,
  force: 12000,
  weldLength: 80,
})

const filletResult = computed(() => analyzeFilletWeld(form))

const decisionPreset = DECISION_PRESETS.weld
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptFilletWeld(form))
const filletOverallStatus = computed(() => getCalcReviewStatus(snapshot.value))
const filletOverallType = computed(() => {
  if (filletOverallStatus.value === 'pass') return 'success'
  if (filletOverallStatus.value === 'review') return 'warning'
  return 'danger'
})
const filletOverallLabel = computed(() => {
  if (filletOverallStatus.value === 'pass') return fc('overallPass')
  if (filletOverallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})
const filletReviewOnly = computed(() => isReviewOnlyResult(snapshot.value))
const reviewMarkText = computed(() => (locale.value === 'en' ? '(Review)' : '（待复核）'))

function onApplyInverse({ variable, value }) {
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Number(value.toFixed ? value.toFixed(2) : value)
  }
}
const buttResult = computed(() => analyzeButtWeld(butt))
const buttSnapshot = computed(() => adaptButtWeld(butt))
const buttOverallStatus = computed(() => getCalcReviewStatus(buttSnapshot.value))
const buttOverallType = computed(() => {
  if (buttOverallStatus.value === 'pass') return 'success'
  if (buttOverallStatus.value === 'review') return 'warning'
  // GB 未通过但 EN/AWS 通过：警告而非绝对不合格
  if (buttResult.value?.mixedVerdict) return 'warning'
  return 'danger'
})
const buttOverallLabel = computed(() => {
  const mode = butt.calcMode
  const r = buttResult.value
  const ok = r?.pass
  if (mode === 'simple' || buttOverallStatus.value === 'review') return pr('buttVerdictSimple')
  if (r?.mixedVerdict) {
    const allow = r.controlAllow ?? r.gb?.allow
    if (mode === 'professional') {
      return pr('buttVerdictMixedPro', { kf: butt.stressConcentration ?? 1.2, allow })
    }
    return pr('buttVerdictMixed', { allow })
  }
  if (mode === 'professional') {
    const kf = butt.stressConcentration ?? 1.2
    return ok ? pr('buttVerdictProOk', { kf }) : pr('buttVerdictProFail', { kf })
  }
  return ok ? pr('buttVerdictCompleteOk') : pr('buttVerdictCompleteFail')
})
const buttStressLine = computed(() => {
  const sigma = (buttResult.value?.normalStress ?? 0).toFixed(1)
  if (buttResult.value?.effectiveStress != null) {
    return pr('buttStressLine', {
      sigma,
      kf: butt.stressConcentration ?? 1.2,
      sigmaEff: buttResult.value.effectiveStress.toFixed(1),
    })
  }
  return pr('buttStressLineSimple', { sigma })
})
const buttReviewOnly = computed(() => isReviewOnlyResult(buttSnapshot.value))
const fatigueResult = computed(() => analyzeWeldFatigue(fatigue))
const hazResult = computed(() => analyzeHAZ(haz))
const fatigueSnapshot = computed(() => adaptWeldFatigue(fatigue))
const hazSnapshot = computed(() => adaptWeldHaz(haz))

const buttRows = computed(() => {
  const r = buttResult.value
  const std = weldStandards.value
  if (!r?.gb) return []
  if (butt.calcMode === 'simple') {
    return [{ standard: std.gb.label, allow: r.gb.allow, pass: r.gb.pass }]
  }
  return [
    { standard: std.gb.label, allow: r.gb.allow, pass: r.gb.pass },
    { standard: std.en1993.label, allow: r.eurocode?.allow, pass: r.eurocode?.pass },
    { standard: std.aws.label, allow: r.aws?.allow, pass: r.aws?.pass },
  ]
})

function buttRowType(pass) {
  if (buttReviewOnly.value && pass) return 'warning'
  return pass ? 'success' : 'danger'
}

function buttRowLabel(pass) {
  if (buttReviewOnly.value && pass) return fc('overallWarn')
  return pass ? fc('pass') : fc('fail')
}

function historyStatusFromReviewStatus(status) {
  if (status === 'pass') return 'pass'
  if (status === 'review') return 'review'
  if (status === 'fail') return 'fail'
  return 'draft'
}

function historyCheckLabel(status) {
  if (status === 'pass') return fc('pass')
  if (status === 'fail') return fc('fail')
  return fc('overallWarn')
}

const saveStatus = computed(() => {
  return historyStatusFromReviewStatus(getCalcReviewStatus(currentSnapshot.value))
})

const historyResult = computed(() => {
  return currentSnapshot.value
})

const currentSnapshot = computed(() => {
  if (tab.value === 'fillet') return snapshot.value
  if (tab.value === 'fatigue') return fatigueSnapshot.value
  if (tab.value === 'haz') return hazSnapshot.value
  return buttSnapshot.value
})

const fatigueOverallType = computed(() => {
  if (fatigueResult.value?.errorKey) return 'warning'
  if (fatigueResult.value?.pass) return 'success'
  return 'danger'
})
const fatigueVerdictLabel = computed(() =>
  fatigueResult.value?.pass ? pr('fatigueVerdictOk') : pr('fatigueVerdictFail'),
)

const hazOverallStatus = computed(() => getCalcReviewStatus(hazSnapshot.value))
const hazOverallType = computed(() => {
  if (hazOverallStatus.value === 'pass') return 'success'
  if (hazOverallStatus.value === 'review') return 'warning'
  return 'danger'
})
const hazOverallLabel = computed(() => historyCheckLabel(hazOverallStatus.value))
const hazStatusHint = computed(
  () => hazSnapshot.value?.warnings?.[0]?.message ?? hazSnapshot.value?.assumptions?.[0] ?? '',
)

const historySummary = computed(() => {
  if (tab.value === 'fillet') {
    return [
      { label: `${pr('shearStress')} (MPa)`, value: filletResult.value.shearStress?.toFixed(1) },
      { label: pf('mode'), value: ct(form.calcMode) },
      { label: fc('check'), value: historyCheckLabel(filletOverallStatus.value) },
    ]
  }
  if (tab.value === 'fatigue' && !fatigueResult.value?.errorKey) {
    return [
      { label: pf('stressRangeDelta'), value: `${fatigue.stressRange} MPa` },
      { label: pr('estimatedLife'), value: fatigueResult.value.estimatedLife?.toLocaleString() },
    ]
  }
  if (tab.value === 'haz') {
    return [
      { label: pr('hazWidth'), value: `${hazResult.value.hazWidthMm} mm` },
      { label: pr('hazAllowShear'), value: `${hazResult.value.hazAllowShear} MPa` },
    ]
  }
  return [
    { label: `${pr('normalStress')} (MPa)`, value: `${buttResult.value.normalStress?.toFixed(1)}` },
    { label: fc('check'), value: historyCheckLabel(buttOverallStatus.value) },
  ]
})

function applyReplayInput(input) {
  if (!input || typeof input !== 'object') return
  if (input.tab && tabLabels.value[input.tab]) tab.value = input.tab
  Object.assign(form, input.form ?? {})
  Object.assign(butt, input.butt ?? {})
  Object.assign(fatigue, input.fatigue ?? {})
  Object.assign(haz, input.haz ?? {})
}

useHistoryReplay('weld', null, { applyFn: applyReplayInput })
</script>
