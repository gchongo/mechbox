<template>
  <div>
    <h1 class="page-title">皮带传动计算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">开口皮带长度、传动比、张力估算</p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">皮带长度、传动比、Euler 张力。</template>
          <template v-else-if="form.calcMode === 'complete'">几何包角、带速校核、根数估算。</template>
          <template v-else>工况系数、弯曲应力、寿命估算。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="小轮直径 D₁ (mm)"><el-input-number v-model="form.driverDiameter" :min="50" /></el-form-item>
          <el-form-item label="大轮直径 D₂ (mm)"><el-input-number v-model="form.drivenDiameter" :min="50" /></el-form-item>
          <el-form-item label="中心距 C (mm)"><el-input-number v-model="form.centerDistance" :min="100" :step="50" /></el-form-item>
          <el-form-item label="转速 n (rpm)"><el-input-number v-model="form.rpm" :min="0" /></el-form-item>
          <el-form-item label="传递功率 P (kW)"><el-input-number v-model="form.power" :min="0" :precision="2" /></el-form-item>
          <el-form-item v-if="form.calcMode === 'simple'" label="包角 (°)"><el-input-number v-model="form.wrapAngle" :min="120" :max="180" /></el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item label="单根额定 (kW)"><el-input-number v-model="form.powerPerBelt" :min="0.5" :precision="1" :step="0.5" /></el-form-item>
            <el-form-item label="最大带速 (m/s)"><el-input-number v-model="form.maxBeltSpeed" :min="10" :max="40" /></el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item label="工况系数 K_a"><el-input-number v-model="form.serviceFactor" :min="1" :max="2" :step="0.1" :precision="1" /></el-form-item>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>传动比 i</dt><dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>皮带长度 L</dt><dd class="font-mono">{{ result.beltLength.toFixed(0) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>带速 v / 包角</dt><dd class="font-mono">{{ result.beltSpeed.toFixed(2) }} m/s · {{ result.wrapAngle?.toFixed(1) }}°</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>紧边张力 F₁</dt><dd class="font-mono">{{ result.F1.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>松边张力 F₂</dt><dd class="font-mono">{{ result.F2.toFixed(0) }} N</dd></div>
          <div v-if="result.beltCount" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>推荐根数</dt><dd class="font-mono">{{ result.beltCount }} 根</dd></div>
          <div v-if="result.estimatedLifeHours" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>估算寿命</dt><dd class="font-mono">{{ Math.round(result.estimatedLifeHours).toLocaleString() }} h</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="L = 2C + \frac{\pi(D_1+D_2)}{2} + \frac{(D_2-D_1)^2}{4C}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeBeltDrive } from '@/utils/belt-calc'

const form = reactive({
  calcMode: 'simple',
  driverDiameter: 120,
  drivenDiameter: 300,
  centerDistance: 500,
  rpm: 1450,
  power: 5.5,
  wrapAngle: 180,
  powerPerBelt: 2.5,
  maxBeltSpeed: 30,
  serviceFactor: 1.2,
})

const result = computed(() => analyzeBeltDrive(form))
</script>
