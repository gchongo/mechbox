<template>
  <div>
    <h1 class="page-title">弹簧设计计算</h1>
    <p class="mb-6 text-gray-600">圆柱螺旋压缩弹簧刚度、变形与切应力</p>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item label="线径 d (mm)"><el-input-number v-model="form.wireDiameter" :min="0.5" :precision="2" :step="0.1" /></el-form-item>
          <el-form-item label="中径 D (mm)"><el-input-number v-model="form.meanDiameter" :min="2" :precision="1" /></el-form-item>
          <el-form-item label="有效圈数 n"><el-input-number v-model="form.activeCoils" :min="1" :step="0.5" :precision="1" /></el-form-item>
          <el-form-item label="工作载荷 F (N)"><el-input-number v-model="form.load" :min="0" :precision="1" /></el-form-item>
          <el-form-item label="许用切应力 (MPa)"><el-input-number v-model="form.allowableShear" :min="100" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>刚度 k</dt><dd class="font-mono">{{ result.springRate.toFixed(2) }} N/mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>变形量 δ</dt><dd class="font-mono">{{ result.deflection.toFixed(2) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>切应力 <MathTex expr="\tau" /></dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(1) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>Wahl 系数 K</dt><dd class="font-mono">{{ result.wahlFactor.toFixed(3) }}</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <MathTex expr="k = \frac{G d^4}{8 D^3 n}" />
          <MathTex expr="\tau = \frac{8 F D}{\pi d^3} K" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeSpring } from '@/utils/spring-calc'
const form = reactive({ wireDiameter: 2, meanDiameter: 16, activeCoils: 8, load: 150, allowableShear: 600 })
const result = computed(() => analyzeSpring(form))
</script>
