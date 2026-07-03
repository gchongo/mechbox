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
          <CalcFormItem :label="pf('nominalDiameter')">
            <el-input-number v-model="form.diameter" :min="3" :max="48" :step="1" @change="onDiameterChange" />
            <span class="ml-2 text-sm text-gray-500">mm (M{{ form.diameter }})</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('pitch')">
            <el-input-number v-model="form.pitch" :min="0.5" :max="4" :precision="2" :step="0.25" />
            <el-button v-if="suggestedPitch" class="ml-2" size="small" link @click="form.pitch = suggestedPitch">
              {{ fc('standard') }} {{ suggestedPitch }}
            </el-button>
          </CalcFormItem>
          <CalcFormItem :label="pf('grade')">
            <el-select v-model="form.grade" class="w-full">
              <el-option v-for="(g, k) in grades" :key="k" :label="g.label" :value="k" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pf('axialForce')">
            <el-input-number v-model="form.axialForce" :min="0" :step="500" />
          </CalcFormItem>
          <CalcFormItem :label="pf('engagedLength')">
            <el-input-number v-model="form.engagedLength" :min="1" :precision="1" />
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
            <CalcFormItem :label="pf('muG')">
              <el-input-number v-model="form.muG" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </CalcFormItem>
            <CalcFormItem :label="pf('muK')">
              <el-input-number v-model="form.muK" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
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
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('stressArea') + ' A_s'" />
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('pitchMinorDiam')" />
            <dd class="font-mono">
              {{ result.pitchDiameter.toFixed(3) }} / {{ result.minorDiameter?.toFixed(3) }} mm
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('tensileStress') + ' σ'" />
            <dd class="font-mono" :class="result.tensilePass ? 'text-success' : 'text-error'">
              {{ result.tensileStress.toFixed(1) }} MPa {{ result.tensilePass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('shearStress') + ' τ'" />
            <dd class="font-mono" :class="result.shearPass ? 'text-success' : 'text-error'">
              {{ result.shearStress.toFixed(1) }} MPa {{ result.shearPass ? '✓' : '✗' }}
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
              <dd class="font-mono" :class="result.engagementPass ? 'text-success' : 'text-error'">
                {{ result.minEngagementLength?.toFixed(1) }} mm
                {{ result.engagementPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('tighteningTorque') + ' T'" />
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
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('overall')" />
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.pass ? fc('passOk') : fc('passFail') }}
            </dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="A_s = \frac{\pi}{4}(d - 0.9382P)^2" />
          <MathTex v-if="form.calcMode === 'simple'" expr="\sigma = F / A_s,\quad T = \mu d F / 1000" />
          <MathTex v-else-if="form.calcMode === 'professional'" expr="T = F \cdot (0.16P + 0.58 d_2 \mu_G + 0.5 D_{km} \mu_K) / 1000" />
        </div>
        <router-link to="/bolt-preload" class="mt-3 inline-block text-xs text-primary hover:underline">
          {{ pf('linkBoltPreload') }}
        </router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import {
  analyzeThreadStrength,
  THREAD_GRADES,
  suggestPitch,
} from '@/utils/thread-calc'
import ThreadDiagram from '@/components/thread/ThreadDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

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

const suggestedPitch = computed(() => suggestPitch(form.diameter))
const result = computed(() => analyzeThreadStrength(form))

function onDiameterChange() {
  const p = suggestPitch(form.diameter)
  if (p) form.pitch = p
  form.engagedLength = form.diameter * 1.5
  form.dKm = 1.45 * form.diameter
}
</script>
