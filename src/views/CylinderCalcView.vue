<template>
  <div>
    <h1 class="page-title">液压 / 气缸计算</h1>
    <p class="mb-6 text-gray-600">缸径、压力、推力/拉力、速度、流量</p>
    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane label="液压缸" name="hydraulic" />
      <el-tab-pane label="气缸" name="pneumatic" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="缸径 D (mm)"><el-input-number v-model="form.boreDiameter" :min="10" /></el-form-item>
          <el-form-item label="活塞杆 d (mm)"><el-input-number v-model="form.rodDiameter" :min="0" /></el-form-item>
          <el-form-item :label="mode === 'hydraulic' ? '压力 p (MPa)' : '气压 p (MPa)'">
            <el-input-number v-model="form.pressure" :min="0.1" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="流量 Q (L/min)"><el-input-number v-model="form.flowRate" :min="0" :precision="1" /></el-form-item>
          <el-form-item v-if="mode === 'pneumatic'" label="效率 η">
            <el-input-number v-model="form.efficiency" :min="0.5" :max="1" :precision="2" :step="0.05" />
          </el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>伸出推力 F⁺</dt><dd class="font-mono text-lg">{{ result.extendForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>缩回拉力 F⁻</dt><dd class="font-mono">{{ result.retractForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>伸出速度 v⁺</dt><dd class="font-mono">{{ result.extendVelocity.toFixed(1) }} mm/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>缩回速度 v⁻</dt><dd class="font-mono">{{ result.retractVelocity.toFixed(1) }} mm/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>伸出流量</dt><dd class="font-mono">{{ result.extendFlow.toFixed(2) }} L/min</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <MathTex expr="F = p \cdot A / 1000" />
          <MathTex expr="v = \frac{Q \times 10^6}{60 A},\quad Q = \frac{A v \times 60}{10^6}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeHydraulicCylinder, analyzePneumaticCylinder } from '@/utils/hydraulic-calc'
const mode = ref('hydraulic')
const form = reactive({ boreDiameter: 50, rodDiameter: 20, pressure: 16, flowRate: 20, efficiency: 0.85 })
const result = computed(() =>
  mode.value === 'pneumatic' ? analyzePneumaticCylinder(form) : analyzeHydraulicCylinder(form),
)
</script>
