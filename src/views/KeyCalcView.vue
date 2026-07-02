<template>
  <div>
    <h1 class="page-title">平键连接计算</h1>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="扭矩 T (N·m)"><el-input-number v-model="form.torque" :min="0" /></el-form-item>
          <el-form-item label="轴径 d (mm)"><el-input-number v-model="form.shaftDiameter" :min="10" /></el-form-item>
          <el-form-item label="键宽 b (mm)"><el-input-number v-model="form.keyWidth" :min="2" /></el-form-item>
          <el-form-item label="键长 L (mm)"><el-input-number v-model="form.keyLength" :min="5" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>圆周力 F</dt><dd class="font-mono">{{ result.tangentialForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>剪切 τ</dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(1) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>挤压 σc</dt><dd class="font-mono">{{ result.crushStress.toFixed(1) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeKeyConnection } from '@/utils/key-calc'
const form = reactive({ torque: 200, shaftDiameter: 30, keyWidth: 8, keyLength: 28 })
const result = computed(() => analyzeKeyConnection(form))
</script>
