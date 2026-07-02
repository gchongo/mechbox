<template>
  <div>
    <h1 class="page-title">螺纹强度计算</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      公制螺纹有效截面积、拉/剪应力与拧紧扭矩（ISO 898 / GB/T 3098 简化）
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
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
          <el-form-item label="摩擦系数 μ">
            <el-input-number v-model="form.frictionCoeff" :min="0.1" :max="0.5" :precision="2" :step="0.05" />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">有效面积 As</dt>
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">中径 d₂</dt>
            <dd class="font-mono">{{ result.pitchDiameter.toFixed(3) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拉应力 σ</dt>
            <dd class="font-mono" :class="result.tensilePass ? 'text-success' : 'text-error'">
              {{ result.tensileStress.toFixed(1) }} MPa {{ result.tensilePass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">剪应力 τ</dt>
            <dd class="font-mono" :class="result.shearPass ? 'text-success' : 'text-error'">
              {{ result.shearStress.toFixed(1) }} MPa {{ result.shearPass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">许用拉应力</dt>
            <dd class="font-mono">{{ result.allowTensileStress }} MPa ({{ result.grade }})</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">最大允许载荷</dt>
            <dd class="font-mono">{{ result.maxAllowableForce.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拧紧扭矩 T</dt>
            <dd class="font-mono">{{ result.tighteningTorque.toFixed(2) }} N·m</dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="A_s = \frac{\pi}{4}(d - 0.9382P)^2" />
          <MathTex expr="\sigma = F / A_s,\quad T = \mu d F / 1000" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import {
  analyzeThreadStrength,
  THREAD_GRADES,
  suggestPitch,
} from '@/utils/thread-calc'

const grades = THREAD_GRADES

const form = reactive({
  diameter: 12,
  pitch: 1.75,
  grade: '8.8',
  axialForce: 25000,
  engagedLength: 18,
  frictionCoeff: 0.2,
})

const suggestedPitch = computed(() => suggestPitch(form.diameter))
const result = computed(() => analyzeThreadStrength(form))

function onDiameterChange() {
  const p = suggestPitch(form.diameter)
  if (p) form.pitch = p
  form.engagedLength = form.diameter * 1.5
}
</script>
