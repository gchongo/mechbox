<template>
  <div>
    <h1 class="page-title">链传动计算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">滚子链节距、链长、传动比与链张力</p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">链长、链速、张力。</template>
          <template v-else-if="form.calcMode === 'complete'">工况系数、链速/张力许用校核。</template>
          <template v-else>润滑系数、多排链、寿命估算。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="节距 p (mm)"><el-input-number v-model="form.pitch" :min="5" :step="1.27" :precision="2" /></el-form-item>
          <el-form-item label="小链轮齿数 z₁"><el-input-number v-model="form.driverTeeth" :min="11" /></el-form-item>
          <el-form-item label="大链轮齿数 z₂"><el-input-number v-model="form.drivenTeeth" :min="11" /></el-form-item>
          <el-form-item label="中心距 a (mm)"><el-input-number v-model="form.centerDistance" :min="100" :step="50" /></el-form-item>
          <el-form-item label="转速 n (rpm)"><el-input-number v-model="form.rpm" :min="0" /></el-form-item>
          <el-form-item label="传递功率 P (kW)"><el-input-number v-model="form.power" :min="0" :precision="2" /></el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item label="许用张力 (N)"><el-input-number v-model="form.allowTension" :min="1000" :step="1000" /></el-form-item>
            <el-form-item label="最大链速 (m/s)"><el-input-number v-model="form.maxChainSpeed" :min="5" :max="25" /></el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item label="工况系数"><el-input-number v-model="form.serviceFactor" :min="1" :max="2" :step="0.1" :precision="1" /></el-form-item>
            <el-form-item label="排数"><el-input-number v-model="form.strands" :min="1" :max="4" /></el-form-item>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>传动比 i</dt><dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>链长 L</dt><dd class="font-mono">{{ result.chainLength.toFixed(0) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>链节数</dt><dd class="font-mono">{{ result.links }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>链速 v</dt><dd class="font-mono" :class="result.speedPass === false ? 'text-error' : ''">{{ result.chainSpeed.toFixed(2) }} m/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>链张力 F</dt><dd class="font-mono" :class="result.tensionPass === false ? 'text-error' : ''">{{ result.chainTension.toFixed(0) }} N</dd></div>
          <div v-if="result.estimatedLifeHours" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>估算寿命</dt><dd class="font-mono">{{ Math.round(result.estimatedLifeHours).toLocaleString() }} h</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeChainDrive } from '@/utils/chain-calc'
const form = reactive({
  calcMode: 'simple',
  pitch: 15.875,
  driverTeeth: 19,
  drivenTeeth: 57,
  centerDistance: 500,
  rpm: 720,
  power: 7.5,
  allowTension: 20000,
  maxChainSpeed: 15,
  serviceFactor: 1.3,
  strands: 1,
})
const result = computed(() => analyzeChainDrive(form))
</script>
