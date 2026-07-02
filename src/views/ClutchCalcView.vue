<template>
  <div>
    <h1 class="page-title">离合器扭矩计算</h1>
    <p class="mb-6 text-gray-600">摩擦离合器传递扭矩与压紧力</p>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item label="摩擦系数 μ"><el-input-number v-model="form.frictionCoeff" :min="0.05" :max="0.6" :precision="2" :step="0.05" /></el-form-item>
          <el-form-item label="压紧力 F (N)"><el-input-number v-model="form.force" :min="0" :step="100" /></el-form-item>
          <el-form-item label="摩擦半径 R (mm)"><el-input-number v-model="form.radius" :min="10" /></el-form-item>
          <el-form-item label="摩擦面数"><el-input-number v-model="form.surfaces" :min="1" :max="10" /></el-form-item>
          <el-form-item label="转速 n (rpm)"><el-input-number v-model="form.rpm" :min="0" :step="100" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>传递扭矩 T</dt><dd class="font-mono text-lg">{{ result.torque.toFixed(2) }} N·m</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>传递功率</dt><dd class="font-mono">{{ result.power.toFixed(2) }} kW</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <MathTex expr="T = \mu F R n / 1000" />
          <MathTex expr="P = \frac{T \cdot 2\pi n}{60000}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeClutch } from '@/utils/clutch-calc'
const form = reactive({ frictionCoeff: 0.15, force: 5000, radius: 80, surfaces: 2, rpm: 1500 })
const result = computed(() => analyzeClutch(form))
</script>
