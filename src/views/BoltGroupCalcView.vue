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

    <CalcModePanel v-model="form.calcMode" page-key="bolt-group" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('boltCount')">
            <el-input-number v-model="form.boltCount" :min="2" :max="24" />
          </CalcFormItem>
          <CalcFormItem :label="pf('boltCircleRadius')">
            <el-input-number v-model="form.boltCircleRadius" :min="10" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('shearX')">
            <el-input-number v-model="form.shearX" :step="100" />
          </CalcFormItem>
          <CalcFormItem :label="pf('shearY')">
            <el-input-number v-model="form.shearY" :step="100" />
          </CalcFormItem>
          <CalcFormItem :label="pf('moment')">
            <el-input-number v-model="form.moment" :step="1000" />
          </CalcFormItem>
          <CalcFormItem v-if="form.calcMode !== 'simple'" :label="pf('allowPerBolt')">
            <el-input-number v-model="form.allowPerBolt" :min="100" :step="500" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('frictionCoeff')">
              <el-input-number v-model="form.frictionCoeff" :min="0" :max="0.6" :precision="2" :step="0.05" />
            </CalcFormItem>
            <CalcFormItem :label="pf('clampForcePerBolt')">
              <el-input-number v-model="form.clampForcePerBolt" :min="0" :step="1000" />
            </CalcFormItem>
            <CalcFormItem :label="pf('axialTension')">
              <el-input-number v-model="form.axialTension" :min="0" :step="500" />
            </CalcFormItem>
            <CalcFormItem :label="pf('pryingArm')">
              <el-input-number v-model="form.pryingArm" :min="0" :step="5" />
              <span class="ml-2 text-xs text-gray-500">mm</span>
            </CalcFormItem>
            <CalcFormItem :label="pf('allowTensionPerBolt')">
              <el-input-number v-model="form.allowTensionPerBolt" :min="100" :step="500" />
            </CalcFormItem>
          </template>
        </el-form>

        <BoltGroupDiagram
          :bolt-count="form.boltCount"
          :bolt-circle-radius="form.boltCircleRadius"
          :shear-x="form.shearX"
          :shear-y="form.shearY"
          :moment="form.moment"
          :critical-index="result.criticalBoltIndex ?? 0"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-tag class="mb-3" :type="overallStatusType">
          {{ pr('overall') }}: {{ overallStatusLabel }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('directPerBolt')" />
            <dd class="font-mono">{{ result.directPerBolt?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('torsionPerBolt')" />
            <dd class="font-mono">{{ result.torsionPerBolt?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('maxBoltForce')" />
            <dd class="font-mono text-lg" :class="reviewAwareCheckClass(result.forcePass ?? result.pass, snapshot)">
              {{ result.maxBoltForce?.toFixed(0) }} N {{ reviewAwareCheckMark(result.forcePass ?? result.pass, snapshot, reviewMarkText) }}
            </dd>
          </div>
          <div v-if="result.criticalBoltIndex" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel :text="pr('criticalBolt')" />
            <dd class="font-mono">#{{ result.criticalBoltIndex }}</dd>
          </div>
          <template v-if="result.friction">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('slipCapacity')" />
              <dd class="font-mono">{{ result.friction.slipCapacity.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('slipPass')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.slipPass, snapshot)">
                {{ reviewAwareCheckMark(result.slipPass, snapshot, reviewMarkText) }}
              </dd>
            </div>
          </template>
          <template v-if="result.prying?.pryingTension > 0">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel :text="pr('pryingTension')" />
              <dd class="font-mono">{{ result.prying.pryingTension.toFixed(0) }} N</dd>
            </div>
          </template>
        </dl>

        <p v-if="reviewOnly" class="mt-3 text-xs text-warning">
          {{ pt('hintSimple') }}
        </p>

        <template v-if="result.bolts?.length">
          <h3 class="mb-2 mt-4 text-sm font-semibold">{{ pr('perBoltLoads') }}</h3>
          <el-table :data="result.bolts" size="small" stripe class="w-full">
            <el-table-column prop="index" label="#" width="48" />
            <el-table-column prop="x" label="x (mm)" />
            <el-table-column prop="y" label="y (mm)" />
            <el-table-column prop="fx" label="Fx (N)" />
            <el-table-column prop="fy" label="Fy (N)" />
            <el-table-column prop="force" label="|F| (N)">
              <template #default="{ row }">
                <span :class="row.pass ? '' : 'text-error font-medium'">{{ row.force }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </section>
    </div>

    <DecisionToolsPanel
      :preset="decisionPreset"
      :snapshot="snapshot"
      :base-inputs="baseInputs"
      @apply="onApplyInverse"
    />

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="bolt-group"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="snapshot"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeBoltGroup } from '@/utils/bolt-group-calc'
import BoltGroupDiagram from '@/components/bolt/BoltGroupDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import ChainSyncBanner from '@/components/design/ChainSyncBanner.vue'
import { useChainHandoff } from '@/composables/useChainHandoff'
import { adaptBoltGroup } from '@/utils/calc-adapters'
import { getCalcReviewStatus, isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('bolt-group')

const form = reactive({
  calcMode: 'simple',
  boltCount: 8,
  boltCircleRadius: 60,
  shearX: 5000,
  shearY: 2000,
  moment: 120000,
  allowPerBolt: 8000,
  frictionCoeff: 0.2,
  clampForcePerBolt: 25000,
  axialTension: 0,
  pryingArm: 40,
  allowTensionPerBolt: 8000,
})
const {
  chainSession,
  chainName,
  dirty,
  syncToChain,
  backToChain,
  dismissSession,
} = useChainHandoff('bolt-group', form)

const result = computed(() => analyzeBoltGroup(form))

const decisionPreset = DECISION_PRESETS['bolt-group']
const baseInputs = computed(() => ({ ...form }))
const snapshot = computed(() => adaptBoltGroup(form))
const overallStatus = computed(() => getCalcReviewStatus(snapshot.value))
const overallStatusType = computed(() => {
  if (overallStatus.value === 'pass') return 'success'
  if (overallStatus.value === 'review') return 'warning'
  return 'danger'
})
const overallStatusLabel = computed(() => {
  if (overallStatus.value === 'pass') return fc('overallPass')
  if (overallStatus.value === 'review') return fc('overallWarn')
  return fc('overallFail')
})
const reviewOnly = computed(() => isReviewOnlyResult(snapshot.value))
const reviewMarkText = computed(() => (locale.value === 'en' ? '(Review)' : '（待复核）'))

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result: snapshot,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    return [
      { label: pr('maxBoltForce'), value: `${r.maxBoltForce?.toFixed(0) ?? '-'} N` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
useHistoryReplay('bolt-group', form)

function onApplyInverse({ variable, value }) {
  if (variable in form && Number.isFinite(value)) {
    form[variable] = Math.round(value)
  }
}
</script>
