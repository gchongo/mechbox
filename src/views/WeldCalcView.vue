<template>
  <div>
    <h1 class="page-title">角焊缝强度</h1>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="焊脚 h (mm)"><el-input-number v-model="form.legSize" :min="3" :step="1" /></el-form-item>
          <el-form-item label="焊缝长 L (mm)"><el-input-number v-model="form.weldLength" :min="10" /></el-form-item>
          <el-form-item label="载荷 F (N)"><el-input-number v-model="form.force" :min="0" :step="100" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>有效厚度 a</dt><dd class="font-mono">{{ result.throat.toFixed(2) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>剪应力 τ</dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(1) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
        </dl>
        <MathTex class="mt-4" expr="\tau = \frac{F}{0.7h \cdot L}" block />
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeFilletWeld } from '@/utils/weld-calc'
const form = reactive({ legSize: 6, weldLength: 80, force: 12000 })
const result = computed(() => analyzeFilletWeld(form))
</script>
