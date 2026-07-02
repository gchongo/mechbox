<template>
  <div>
    <h1 class="page-title">皮带传动计算</h1>
    <p class="mb-6 text-gray-600">开口皮带长度、传动比、张力估算</p>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="小轮直径 D₁ (mm)"><el-input-number v-model="form.driverDiameter" :min="50" /></el-form-item>
          <el-form-item label="大轮直径 D₂ (mm)"><el-input-number v-model="form.drivenDiameter" :min="50" /></el-form-item>
          <el-form-item label="中心距 C (mm)"><el-input-number v-model="form.centerDistance" :min="100" :step="50" /></el-form-item>
          <el-form-item label="转速 n (rpm)"><el-input-number v-model="form.rpm" :min="0" /></el-form-item>
          <el-form-item label="传递功率 P (kW)"><el-input-number v-model="form.power" :min="0" :precision="2" /></el-form-item>
          <el-form-item label="包角 (°)"><el-input-number v-model="form.wrapAngle" :min="120" :max="180" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>传动比 i</dt><dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>皮带长度 L</dt><dd class="font-mono">{{ result.beltLength.toFixed(0) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>带速 v</dt><dd class="font-mono">{{ result.beltSpeed.toFixed(2) }} m/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>紧边张力 F₁</dt><dd class="font-mono">{{ result.F1.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>松边张力 F₂</dt><dd class="font-mono">{{ result.F2.toFixed(0) }} N</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <MathTex expr="L = 2C + \frac{\pi(D_1+D_2)}{2} + \frac{(D_2-D_1)^2}{4C}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeBeltDrive } from '@/utils/belt-calc'
const form = reactive({ driverDiameter: 120, drivenDiameter: 300, centerDistance: 500, rpm: 1450, power: 5.5, wrapAngle: 180 })
const result = computed(() => analyzeBeltDrive(form))
</script>
