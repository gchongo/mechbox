<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="thread" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem
            :label="pf('nominalDiameter')"
            unit=""
            :pending-confirm="isPending('diameter')"
          >
            <el-input-number v-model="form.diameter" :min="3" :max="48" :step="1" @change="onDiameterChange" />
            <span class="ml-2 text-sm text-gray-500">mm (M{{ form.diameter }})</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('pitch')">
            <el-input-number v-model="form.pitch" :min="0.5" :max="4" :precision="2" :step="0.25" />
            <el-button v-if="suggestedPitch" class="ml-2" size="small" link @click="form.pitch = suggestedPitch">
              {{ fc('standard') }} {{ suggestedPitch }}
            </el-button>
          </CalcFormItem>
          <CalcFormItem
            :label="pf('grade')"
            :pending-confirm="isPending('grade')"
          >
            <el-select v-model="form.grade" class="w-full" @change="markConfirmed('grade')">
              <el-option v-for="(g, k) in grades" :key="k" :label="g.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem
            :label="pf('axialForce')"
            :pending-confirm="isPending('axialForce')"
          >
            <el-input-number v-model="form.axialForce" :min="0" :step="500" @change="markConfirmed('axialForce')" />
          </CalcFormItem>
          <CalcFormItem
            :label="pf('engagedLength')"
            :pending-confirm="isPending('engagedLength')"
          >
            <el-input-number v-model="form.engagedLength" :min="1" :precision="1" @change="markConfirmed('engagedLength')" />
          </CalcFormItem>
          <template v-if="form.calcMode === 'simple'">
            <CalcFormItem :label="pf('frictionCoeff')">
              <el-input-number v-model="form.frictionCoeff" :min="0.1" :max="0.5" :precision="2" :step="0.05" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'complete' || form.calcMode === 'professional'">
            <CalcFormItem :label="pf('nutMaterial')">
              <el-select v-model="form.nutMaterial" class="w-full">
                <el-option :label="pf('nutSteel')" value="steel" />
                <el-option :label="pf('nutSoft')" value="soft" />
              </el-select>
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">{{ pf('dividerVdi') }}</el-divider>
            <CalcFormItem
              :label="pf('muG')"
              :pending-confirm="isPending('muG')"
            >
              <el-input-number v-model="form.muG" :min="0.05" :max="0.5" :precision="2" :step="0.02" @change="markConfirmed('muG')" />
            </CalcFormItem>
            <CalcFormItem
              :label="pf('muK')"
              :pending-confirm="isPending('muK')"
            >
              <el-input-number v-model="form.muK" :min="0.05" :max="0.5" :precision="2" :step="0.02" @change="markConfirmed('muK')" />
            </CalcFormItem>
            <CalcFormItem :label="pf('dKm')">
              <el-input-number v-model="form.dKm" :min="5" :max="80" :precision="2" :step="0.5" />
              <el-button class="ml-1" size="small" link @click="form.dKm = 1.45 * form.diameter">
                {{ (1.45 * form.diameter).toFixed(1) }} mm
              </el-button>
            </CalcFormItem>
          </template>
        </el-form>

        <ThreadDiagram
          :diameter="form.diameter"
          :pitch="form.pitch"
          :engaged-length="form.engagedLength"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <div class="mb-3 flex items-center gap-2">
          <el-tag :type="overallStatusType">
            {{ pr('overall') }}: {{ overallStatusLabel }}
          </el-tag>
          <span v-if="result.estimateOnly" class="text-xs text-amber-600">（估算/未放行）</span>
        </div>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('stressArea')" />
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('pitchMinorDiam')" />
            <dd class="font-mono">
              {{ result.pitchDiameter.toFixed(3) }} / {{ result.minorDiameter?.toFixed(3) }} mm
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('tensileStress')" />
            <dd class="font-mono" :class="reviewAwareCheckClass(result.tensilePass, result)">
              {{ result.tensileStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.tensilePass, result) }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('shearStress')" />
            <dd class="font-mono" :class="reviewAwareCheckClass(result.shearPass, result)">
              {{ result.shearStress.toFixed(1) }} MPa {{ reviewAwareCheckMark(result.shearPass, result) }}
            </dd>
          </div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('shearBoth')" />
              <dd class="font-mono">
                {{ result.shearExternal?.toFixed(1) }} / {{ result.shearInternal?.toFixed(1) }} MPa
                ({{ pr('criticalSide') }}: {{ result.criticalShearSide }})
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('minEngagement')" />
              <dd class="font-mono" :class="reviewAwareCheckClass(result.engagementPass, result)">
                {{ result.minEngagementLength?.toFixed(1) }} mm
                {{ reviewAwareCheckMark(result.engagementPass, result) }}
              </dd>
            </div>
          </template>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('tighteningTorque')" />
            <dd class="font-mono">
              {{ result.tighteningTorque.toFixed(2) }} N·m
              <span class="text-xs text-gray-500">（{{ result.torqueMethod }}）</span>
            </dd>
          </div>
          <template v-if="form.calcMode === 'professional'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('maxPreload')" />
              <dd class="font-mono">{{ result.recommendedMaxPreload?.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <ResultLabel label-class="text-gray-500" :text="pr('utilization')" />
              <dd class="font-mono">{{ ((result.utilization ?? 0) * 100).toFixed(1) }} %</dd>
            </div>
          </template>
        </dl>
        <p v-if="reviewOnly" class="mt-3 text-xs text-warning"><MathContent :text="pt('hintSimple')" /></p>
        <FormulaPanel :columns="1">
          <MathTex expr="A_s = \frac{\pi}{4}(d - 0.9382P)^2" block />
          <MathTex v-if="form.calcMode === 'simple'" expr="\sigma = F / A_s,\quad T = \mu d F / 1000" block />
          <MathTex v-else-if="form.calcMode === 'professional'" expr="T = F \cdot (0.16P + 0.58 d_2 \mu_G + 0.5 D_{km} \mu_K) / 1000" block />
        </FormulaPanel>
        <router-link to="/bolt-preload" class="mt-3 inline-block text-xs text-primary hover:underline">
          {{ pf('linkBoltPreload') }}
        </router-link>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="thread"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="result"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, toRef } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import {
  analyzeThreadStrength,
  THREAD_GRADES,
  suggestPitch,
} from '@/utils/thread-calc'
import ThreadDiagram from '@/components/thread/ThreadDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useCriticalInputConfirm } from '@/composables/useCriticalInputConfirm'
import { getCalcReviewStatus, isReviewOnlyResult, reviewAwareCheckClass, reviewAwareCheckMark } from '@/utils/calc-result'

const { pt, ct, pf, pr, fc } = useCalcPage('thread')
const { optionMap } = useOptionsI18n()

const grades = computed(() => optionMap(THREAD_GRADES, 'threadGrades'))

const form = reactive({
  calcMode: 'simple',
  diameter: 12,
  pitch: 1.75,
  grade: '8.8',
  axialForce: 25000,
  engagedLength: 18,
  frictionCoeff: 0.2,
  nutMaterial: 'steel',
  muG: 0.12,
  muK: 0.12,
  dKm: 17.4,
})

const { markConfirmed, withConfirmed, isPending } = useCriticalInputConfirm(toRef(form, 'calcMode'), 'thread')

const suggestedPitch = computed(() => suggestPitch(form.diameter))
const result = computed(() => analyzeThreadStrength(withConfirmed(form)))
const reviewOnly = computed(() => isReviewOnlyResult(result.value))
const overallStatus = computed(() => getCalcReviewStatus(result.value))
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

const { historyInput, saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form,
  result,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    const r = result.value
    if (r?.errorKey) return []
    return [
      { label: pr('tensileStress'), value: `${r.tensileStress?.toFixed(1) ?? '-'} MPa` },
      { label: fc('check'), value: overallStatusLabel.value },
    ]
  },
})
useHistoryReplay('thread', form)

function onDiameterChange() {
  markConfirmed('diameter')
  const p = suggestPitch(form.diameter)
  if (p) form.pitch = p
  form.engagedLength = form.diameter * 1.5
  form.dKm = 1.45 * form.diameter
}
</script>
