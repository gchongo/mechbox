<template>
  <div>
    <h1 class="page-title">齿轮强度计算</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">直齿轮简化强度估算（Lewis 弯曲 + 接触应力）</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="130px">
          <el-form-item label="模数 m (mm)">
            <el-input-number v-model="form.module" :min="0.5" :precision="2" :step="0.5" />
          </el-form-item>
          <el-form-item label="齿数 z">
            <el-input-number v-model="form.teeth" :min="12" :step="1" />
          </el-form-item>
          <el-form-item label="齿宽 b (mm)">
            <el-input-number v-model="form.faceWidth" :min="1" :precision="1" />
          </el-form-item>
          <el-form-item label="扭矩 T (N·m)">
            <el-input-number v-model="form.torque" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="转速 n (rpm)">
            <el-input-number v-model="form.rpm" :min="0" :step="100" />
          </el-form-item>
          <el-form-item label="压力角 (°)">
            <el-input-number v-model="form.pressureAngle" :min="14.5" :max="25" :precision="1" />
          </el-form-item>
          <el-form-item label="齿形系数 Y">
            <el-input-number v-model="form.formFactor" :min="1.5" :max="4" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="许用弯曲 (MPa)">
            <el-input-number v-model="form.allowBending" :min="100" :step="10" />
          </el-form-item>
          <el-form-item label="许用接触 (MPa)">
            <el-input-number v-model="form.allowContact" :min="200" :step="50" />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">分度圆直径 d</dt>
            <dd class="font-mono">{{ result.geometry.pitchDiameter.toFixed(2) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">圆周力 Ft</dt>
            <dd class="font-mono">{{ result.tangentialForce.toFixed(1) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">线速度 v</dt>
            <dd class="font-mono">{{ result.pitchLineVelocity.toFixed(2) }} m/s</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">弯曲应力 σF</dt>
            <dd class="font-mono" :class="result.bendingPass ? 'text-success' : 'text-error'">
              {{ result.bendingStress.toFixed(1) }} MPa
              {{ result.bendingPass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">接触应力 σH</dt>
            <dd class="font-mono" :class="result.contactPass ? 'text-success' : 'text-error'">
              {{ result.contactStress.toFixed(1) }} MPa
              {{ result.contactPass ? '✓' : '✗' }}
            </dd>
          </div>
        </dl>

        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="F_t = \frac{2000 T}{d}" />
          <MathTex expr="\sigma_F = \frac{F_t}{b \cdot m \cdot Y}" />
          <MathTex expr="\sigma_H \approx 118\sqrt{\frac{F_t(u+1)}{b \cdot d \cdot u}}" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeGearStrength } from '@/utils/gear-calc'

const form = reactive({
  module: 2,
  teeth: 24,
  faceWidth: 20,
  torque: 50,
  rpm: 1500,
  pressureAngle: 20,
  formFactor: 2.65,
  allowBending: 300,
  allowContact: 900,
  gearRatio: 1,
})

const result = computed(() => analyzeGearStrength(form))
</script>
