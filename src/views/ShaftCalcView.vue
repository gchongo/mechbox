<template>
  <div>
    <h1 class="page-title">轴强度计算</h1>
    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane label="扭转" name="torsion" />
      <el-tab-pane label="弯扭合成" name="combined" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item label="轴径 d (mm)"><el-input-number v-model="form.diameter" :min="1" /></el-form-item>
          <el-form-item label="扭矩 T (N·m)"><el-input-number v-model="form.torque" :min="0" :precision="2" /></el-form-item>
          <el-form-item v-if="mode === 'torsion'" label="轴长 L (mm)"><el-input-number v-model="form.length" :min="10" :step="50" /></el-form-item>
          <el-form-item v-if="mode === 'combined'" label="弯矩 M (N·m)"><el-input-number v-model="form.bendingMoment" :min="0" :precision="2" /></el-form-item>
          <el-form-item :label="mode === 'combined' ? '许用合成 (MPa)' : '许用切应力 (MPa)'">
            <el-input-number v-model="form.allowable" :min="10" />
          </el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl v-if="mode === 'torsion'" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>切应力 τ</dt><dd class="font-mono" :class="torsionResult.pass?'text-success':'text-error'">{{ torsionResult.shearStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>扭转角 θ</dt><dd class="font-mono">{{ torsionResult.twistAngle.toFixed(4) }}°</dd></div>
        </dl>
        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>弯曲 σ</dt><dd class="font-mono">{{ combinedResult.bendingStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>扭转 τ</dt><dd class="font-mono">{{ combinedResult.torsionStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>合成 σeq</dt><dd class="font-mono" :class="combinedResult.pass?'text-success':'text-error'">{{ combinedResult.equivalentStress.toFixed(2) }} MPa {{ combinedResult.pass?'✓':'✗' }}</dd></div>
        </dl>
        <div class="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex v-if="mode === 'combined'" expr="\sigma_{eq} = \sqrt{\sigma^2 + 3\tau^2}" block />
          <MathTex v-else expr="\tau = \frac{16T}{\pi d^3}" block />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
const mode = ref('torsion')
const form = reactive({ diameter: 30, torque: 200, length: 500, bendingMoment: 150, allowable: 60 })
const torsionResult = computed(() => analyzeShaftTorsion({ ...form, allowableShear: form.allowable }))
const combinedResult = computed(() => analyzeShaftCombined({ ...form, allowableStress: form.allowable }))
</script>
