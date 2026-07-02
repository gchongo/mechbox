<template>
  <div>
    <h1 class="page-title">螺栓组受力</h1>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="螺栓数量 n"><el-input-number v-model="form.boltCount" :min="2" :max="24" /></el-form-item>
          <el-form-item label="分布圆半径 R"><el-input-number v-model="form.boltCircleRadius" :min="10" /></el-form-item>
          <el-form-item label="剪力 Fx (N)"><el-input-number v-model="form.shearX" :step="100" /></el-form-item>
          <el-form-item label="剪力 Fy (N)"><el-input-number v-model="form.shearY" :step="100" /></el-form-item>
          <el-form-item label="弯矩 M (N·mm)"><el-input-number v-model="form.moment" :step="1000" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>单栓直接剪力</dt><dd class="font-mono">{{ result.directPerBolt.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>单栓扭剪</dt><dd class="font-mono">{{ result.torsionPerBolt.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>最大螺栓力</dt><dd class="font-mono text-lg" :class="result.pass?'text-success':'text-error'">{{ result.maxBoltForce.toFixed(0) }} N {{ result.pass?'✓':'✗' }}</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeBoltGroup } from '@/utils/bolt-group-calc'
const form = reactive({ boltCount: 8, boltCircleRadius: 60, shearX: 5000, shearY: 2000, moment: 120000 })
const result = computed(() => analyzeBoltGroup(form))
</script>
