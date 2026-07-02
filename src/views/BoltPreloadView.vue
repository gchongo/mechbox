<template>
  <div>
    <h1 class="page-title">螺栓预紧力计算</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      拧紧扭矩与预紧力换算、拉应力校核（VDI 2230 简化，<MathTex expr="T = \mu d F / 1000" />）
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="140px">
          <el-form-item label="计算模式">
            <el-radio-group v-model="form.mode">
              <el-radio value="torque2force">已知扭矩 → 预紧力</el-radio>
              <el-radio value="force2torque">已知预紧力 → 扭矩</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="公称直径 d">
            <el-input-number v-model="form.diameter" :min="3" :max="48" :step="1" @change="onDiameterChange" />
            <span class="ml-2 text-sm text-gray-500">mm (M{{ form.diameter }})</span>
          </el-form-item>
          <el-form-item label="螺距 P">
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
          <el-form-item label="摩擦系数 μ">
            <el-input-number v-model="form.frictionCoeff" :min="0.1" :max="0.5" :precision="2" :step="0.05" />
          </el-form-item>
          <el-form-item v-if="form.mode === 'torque2force'" label="拧紧扭矩 T">
            <el-input-number v-model="form.torque" :min="0" :precision="2" :step="1" />
            <span class="ml-2 text-sm text-gray-500">N·m</span>
          </el-form-item>
          <el-form-item v-else label="预紧力 F">
            <el-input-number v-model="form.preload" :min="0" :step="500" />
            <span class="ml-2 text-sm text-gray-500">N</span>
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">有效面积 <MathTex expr="A_s" /></dt>
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">预紧力 <MathTex expr="F" /></dt>
            <dd class="font-mono">{{ result.preload.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拧紧扭矩 <MathTex expr="T" /></dt>
            <dd class="font-mono">{{ result.torque.toFixed(2) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拉应力 <MathTex expr="\sigma" /></dt>
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.stress.toFixed(1) }} MPa {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">许用拉应力</dt>
            <dd class="font-mono">{{ result.allowStress }} MPa ({{ result.grade }})</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">最大允许预紧力</dt>
            <dd class="font-mono">{{ result.maxPreload.toFixed(0) }} N</dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="F = \dfrac{T \times 1000}{\mu d}" block />
          <MathTex expr="T = \dfrac{\mu d F}{1000}" block />
          <MathTex expr="\sigma = F / A_s" block />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import {
  THREAD_GRADES,
  METRIC_THREAD_PITCH,
  calcTensileStressArea,
  calcPreloadFromTorque,
  calcTighteningTorque,
  calcThreadTensileStress,
  suggestPitch,
} from '@/utils/thread-calc'

const grades = THREAD_GRADES

const form = reactive({
  mode: 'torque2force',
  diameter: 10,
  pitch: METRIC_THREAD_PITCH[10],
  grade: '8.8',
  frictionCoeff: 0.2,
  torque: 50,
  preload: 25000,
})

const suggestedPitch = computed(() => suggestPitch(form.diameter))

function onDiameterChange() {
  const p = suggestPitch(form.diameter)
  if (p) form.pitch = p
}

const result = computed(() => {
  const grade = THREAD_GRADES[form.grade] ?? THREAD_GRADES['8.8']
  const As = calcTensileStressArea(form.diameter, form.pitch)
  const mu = form.frictionCoeff
  const d = form.diameter

  let preload
  let torque
  if (form.mode === 'torque2force') {
    torque = form.torque ?? 0
    preload = calcPreloadFromTorque(torque, d, mu)
  } else {
    preload = form.preload ?? 0
    torque = calcTighteningTorque(preload, d, mu)
  }

  const stress = calcThreadTensileStress(preload, As)
  const maxPreload = grade.allowStress * As

  return {
    stressArea: As,
    preload,
    torque,
    stress,
    allowStress: grade.allowStress,
    grade: grade.label,
    maxPreload,
    pass: stress <= grade.allowStress,
  }
})
</script>
