<template>
  <div>
    <h1 class="page-title">轴扭转计算</h1>
    <p class="mb-6 text-gray-600">实心圆轴扭转切应力与扭转变形角</p>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item label="轴径 d (mm)"><el-input-number v-model="form.diameter" :min="1" /></el-form-item>
          <el-form-item label="扭矩 T (N·m)"><el-input-number v-model="form.torque" :min="0" :precision="2" /></el-form-item>
          <el-form-item label="轴长 L (mm)"><el-input-number v-model="form.length" :min="10" :step="50" /></el-form-item>
          <el-form-item label="许用切应力 (MPa)"><el-input-number v-model="form.allowableShear" :min="10" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>切应力 τ</dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(2) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>扭转角 θ</dt><dd class="font-mono">{{ result.twistAngle.toFixed(4) }}°</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>最小轴径</dt><dd class="font-mono">{{ result.minDiameter.toFixed(2) }} mm</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <MathTex expr="\tau = \frac{16T}{\pi d^3}" />
          <MathTex expr="\theta = \frac{T L}{G J} \cdot \frac{180}{\pi}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
const form = reactive({ diameter: 30, torque: 200, length: 500, allowableShear: 40 })
const result = computed(() => analyzeShaftTorsion(form))
</script>
