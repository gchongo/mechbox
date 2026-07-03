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
          <el-form-item label="公称直径 d">
            <el-input-number v-model="form.diameter" :min="3" :max="48" :step="1" @change="onDiameterChange" />
            <span class="ml-2 text-sm text-gray-500">mm (M{{ form.diameter }})</span>
          </el-form-item>
          <el-form-item label="螺距 P (mm)">
            <el-input-number v-model="form.pitch" :min="0.5" :max="4" :precision="2" :step="0.25" />
            <el-button v-if="suggestedPitch" class="ml-2" size="small" link @click="form.pitch = suggestedPitch">
              标准 {{ suggestedPitch }}
            </el-button>
          </el-form-item>
          <el-form-item label="性能等级">
            <el-select v-model="form.grade" class="w-full">
              <el-option v-for="(g, k) in grades" :key="k" :label="g.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item label="轴向载荷 F (N)">
            <el-input-number v-model="form.axialForce" :min="0" :step="500" />
          </el-form-item>
          <el-form-item label="旋合长度 L (mm)">
            <el-input-number v-model="form.engagedLength" :min="1" :precision="1" />
          </el-form-item>
          <template v-if="form.calcMode === 'simple'">
            <el-form-item label="摩擦系数 μ">
              <el-input-number v-model="form.frictionCoeff" :min="0.1" :max="0.5" :precision="2" :step="0.05" />
            </el-form-item>
          </template>
          <template v-if="form.calcMode === 'complete' || form.calcMode === 'professional'">
            <el-form-item label="螺母材料">
              <el-select v-model="form.nutMaterial" class="w-full">
                <el-option label="钢螺母" value="steel" />
                <el-option label="软材料螺母" value="soft" />
              </el-select>
            </el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">VDI 2230 扭矩</el-divider>
            <el-form-item label="螺纹摩擦 μ_G">
              <el-input-number v-model="form.muG" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </el-form-item>
            <el-form-item label="头部摩擦 μ_K">
              <el-input-number v-model="form.muK" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </el-form-item>
            <el-form-item label="摩擦直径 D_km">
              <el-input-number v-model="form.dKm" :min="5" :max="80" :precision="2" :step="0.5" />
              <el-button class="ml-1" size="small" link @click="form.dKm = 1.45 * form.diameter">
                {{ (1.45 * form.diameter).toFixed(1) }} mm
              </el-button>
            </el-form-item>
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
            <dt class="text-gray-500">有效面积 <MathTex expr="A_s" /></dt>
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">中径 / 小径</dt>
            <dd class="font-mono">
              {{ result.pitchDiameter.toFixed(3) }} / {{ result.minorDiameter?.toFixed(3) }} mm
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拉应力 <MathTex expr="\sigma" /></dt>
            <dd class="font-mono" :class="result.tensilePass ? 'text-success' : 'text-error'">
              {{ result.tensileStress.toFixed(1) }} MPa {{ result.tensilePass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">剪应力 <MathTex expr="\tau" /></dt>
            <dd class="font-mono" :class="result.shearPass ? 'text-success' : 'text-error'">
              {{ result.shearStress.toFixed(1) }} MPa {{ result.shearPass ? '✓' : '✗' }}
            </dd>
          </div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">外螺纹 / 内螺纹 τ</dt>
              <dd class="font-mono">
                {{ result.shearExternal?.toFixed(1) }} / {{ result.shearInternal?.toFixed(1) }} MPa
                （控制：{{ result.criticalShearSide }}）
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">最小旋合 m_eff</dt>
              <dd class="font-mono" :class="result.engagementPass ? 'text-success' : 'text-error'">
                {{ result.minEngagementLength?.toFixed(1) }} mm
                {{ result.engagementPass ? '✓' : '✗' }}
              </dd>
            </div>
          </template>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拧紧扭矩 <MathTex expr="T" /></dt>
            <dd class="font-mono">
              {{ result.tighteningTorque.toFixed(2) }} N·m
              <span class="text-xs text-gray-500">（{{ result.torqueMethod }}）</span>
            </dd>
          </div>
          <template v-if="form.calcMode === 'professional'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">推荐最大预紧力</dt>
              <dd class="font-mono">{{ result.recommendedMaxPreload?.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">应力利用率</dt>
              <dd class="font-mono">{{ ((result.utilization ?? 0) * 100).toFixed(1) }} %</dd>
            </div>
          </template>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">综合判定</dt>
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.pass ? '通过 ✓' : '不通过 ✗' }}
            </dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="A_s = \frac{\pi}{4}(d - 0.9382P)^2" />
          <MathTex v-if="form.calcMode === 'simple'" expr="\sigma = F / A_s,\quad T = \mu d F / 1000" />
          <MathTex v-else-if="form.calcMode === 'professional'" expr="T = F \cdot (0.16P + 0.58 d_2 \mu_G + 0.5 D_{km} \mu_K) / 1000" />
        </div>
        <router-link to="/bolt-preload" class="mt-3 inline-block text-xs text-primary hover:underline">
          → 螺栓预紧力 / VDI 2230 完整校核
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

const { pt, ct } = useCalcPage('thread')

const grades = THREAD_GRADES

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
