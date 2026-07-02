<template>
  <div>
    <h1 class="page-title">链传动计算</h1>
    <p class="mb-6 text-gray-600">滚子链节距、链长、传动比与链张力</p>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="节距 p (mm)"><el-input-number v-model="form.pitch" :min="5" :step="1.27" :precision="2" /></el-form-item>
          <el-form-item label="小链轮齿数 z₁"><el-input-number v-model="form.driverTeeth" :min="11" /></el-form-item>
          <el-form-item label="大链轮齿数 z₂"><el-input-number v-model="form.drivenTeeth" :min="11" /></el-form-item>
          <el-form-item label="中心距 a (mm)"><el-input-number v-model="form.centerDistance" :min="100" :step="50" /></el-form-item>
          <el-form-item label="转速 n (rpm)"><el-input-number v-model="form.rpm" :min="0" /></el-form-item>
          <el-form-item label="传递功率 P (kW)"><el-input-number v-model="form.power" :min="0" :precision="2" /></el-form-item>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>传动比 i</dt><dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>链长 L</dt><dd class="font-mono">{{ result.chainLength.toFixed(0) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>链节数</dt><dd class="font-mono">{{ result.links }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>链速 v</dt><dd class="font-mono">{{ result.chainSpeed.toFixed(2) }} m/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3"><dt>链张力 F</dt><dd class="font-mono">{{ result.chainTension.toFixed(0) }} N</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeChainDrive } from '@/utils/chain-calc'
const form = reactive({ pitch: 15.875, driverTeeth: 19, drivenTeeth: 57, centerDistance: 500, rpm: 720, power: 7.5 })
const result = computed(() => analyzeChainDrive(form))
</script>
