<template>
  <div>
    <h1 class="page-title">离合器扭矩计算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">摩擦离合器传递扭矩与压紧力</p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">T = μFRn。</template>
          <template v-else-if="form.calcMode === 'complete'">内外径有效摩擦半径、接触比压。</template>
          <template v-else>离心减载、热衰减、设计扭矩校核。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item label="摩擦系数 μ"><el-input-number v-model="form.frictionCoeff" :min="0.05" :max="0.6" :precision="2" :step="0.05" /></el-form-item>
          <el-form-item label="压紧力 F (N)"><el-input-number v-model="form.force" :min="0" :step="100" /></el-form-item>
          <el-form-item v-if="form.calcMode === 'simple'" label="摩擦半径 R (mm)"><el-input-number v-model="form.radius" :min="10" /></el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item label="内径 / 外径">
              <el-input-number v-model="form.innerDiameter" :min="20" class="w-28" />
              <el-input-number v-model="form.outerDiameter" :min="30" class="ml-2 w-28" />
            </el-form-item>
          </template>
          <el-form-item label="摩擦面数"><el-input-number v-model="form.surfaces" :min="1" :max="10" /></el-form-item>
          <el-form-item label="转速 n (rpm)"><el-input-number v-model="form.rpm" :min="0" :step="100" /></el-form-item>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item label="需求扭矩 (N·m)"><el-input-number v-model="form.requiredTorque" :min="0" :precision="1" /></el-form-item>
            <el-form-item label="热衰减系数"><el-input-number v-model="form.thermalFade" :min="0.5" :max="1" :step="0.05" :precision="2" /></el-form-item>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>传递扭矩 T</dt><dd class="font-mono text-lg">{{ result.torque.toFixed(2) }} N·m</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>传递功率</dt><dd class="font-mono">{{ result.power.toFixed(2) }} kW</dd></div>
          <div v-if="result.effectiveRadius" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>有效半径</dt><dd class="font-mono">{{ result.effectiveRadius?.toFixed(1) }} mm</dd></div>
          <div v-if="result.contactPressure" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>接触比压</dt><dd class="font-mono">{{ result.contactPressure?.toFixed(3) }} MPa</dd></div>
          <div v-if="result.deratedTorque" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>高速折减扭矩</dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.deratedTorque?.toFixed(2) }} N·m</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="T = \mu F R n / 1000" />
          <MathTex expr="P = \frac{T \cdot 2\pi n}{60000}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeClutch } from '@/utils/clutch-calc'

const form = reactive({
  calcMode: 'simple',
  frictionCoeff: 0.15,
  force: 5000,
  radius: 80,
  innerDiameter: 100,
  outerDiameter: 160,
  surfaces: 2,
  rpm: 1500,
  requiredTorque: 100,
  thermalFade: 0.9,
})

const result = computed(() => analyzeClutch(form))
</script>
