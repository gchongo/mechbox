<template>
  <div>
    <h1 class="page-title">平键连接计算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">GB/T 1096 平键剪切与挤压强度</p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">扭矩→圆周力，剪/挤双校核。</template>
          <template v-else-if="form.calcMode === 'complete'">标准键尺寸、最小键长反算。</template>
          <template v-else>双键、交变扭矩疲劳与安全系数。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item label="扭矩 T (N·m)"><el-input-number v-model="form.torque" :min="0" /></el-form-item>
          <el-form-item label="轴径 d (mm)"><el-input-number v-model="form.shaftDiameter" :min="10" /></el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" label="标准键 b×h">
            <span class="font-mono text-sm">{{ stdKey.width }} × {{ stdKey.height }} mm</span>
            <el-button class="ml-2" size="small" link @click="applyStdKey">应用</el-button>
          </el-form-item>
          <el-form-item label="键宽 b (mm)"><el-input-number v-model="form.keyWidth" :min="2" /></el-form-item>
          <el-form-item label="键长 L (mm)"><el-input-number v-model="form.keyLength" :min="5" /></el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" label="轮毂工作长">
            <el-input-number v-model="form.hubLength" :min="5" />
          </el-form-item>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item label="键数量">
              <el-input-number v-model="form.keyCount" :min="1" :max="2" />
            </el-form-item>
            <el-form-item label="扭矩幅值 (N·m)">
              <el-input-number v-model="form.torqueAmplitude" :min="0" />
            </el-form-item>
          </template>
        </el-form>
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>圆周力 F</dt><dd class="font-mono">{{ result.tangentialForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>剪切 <MathTex expr="\tau" /></dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(1) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>挤压 <MathTex expr="\sigma_c" /></dt><dd class="font-mono">{{ result.crushStress.toFixed(1) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
          <div v-if="result.recommendedLength" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>推荐最小键长</dt><dd class="font-mono">{{ result.recommendedLength.toFixed(1) }} mm</dd></div>
          <div v-if="result.shearAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>剪应力幅</dt><dd class="font-mono">{{ result.shearAmplitude?.toFixed(1) }} MPa</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeKeyConnection, lookupKeySize } from '@/utils/key-calc'

const form = reactive({
  calcMode: 'simple',
  torque: 200,
  shaftDiameter: 30,
  keyWidth: 8,
  keyLength: 28,
  hubLength: 28,
  keyCount: 1,
  torqueAmplitude: 80,
})

const stdKey = computed(() => lookupKeySize(form.shaftDiameter))
const result = computed(() => analyzeKeyConnection(form))

function applyStdKey() {
  form.keyWidth = stdKey.value.width
  form.keyLength = Math.round(stdKey.value.width * 3.5)
}
</script>
