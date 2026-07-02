<template>
  <div>
    <h1 class="page-title">轴承寿命计算</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">滚动轴承额定寿命 L10 估算（ISO 281 简化）</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="140px">
          <el-form-item label="轴承类型">
            <el-select v-model="form.bearingType" class="w-full">
              <el-option label="球轴承 (ε=3)" value="ball" />
              <el-option label="滚子轴承 (ε=10/3)" value="roller" />
            </el-select>
          </el-form-item>
          <el-form-item label="额定动载荷 C (N)">
            <el-input-number v-model="form.dynamicLoad" :min="100" :step="1000" />
          </el-form-item>
          <el-form-item label="径向载荷 Fr (N)">
            <el-input-number v-model="form.radialLoad" :min="0" :step="100" />
          </el-form-item>
          <el-form-item label="轴向载荷 Fa (N)">
            <el-input-number v-model="form.axialLoad" :min="0" :step="50" />
          </el-form-item>
          <el-form-item label="系数 X">
            <el-input-number v-model="form.x" :min="0" :max="2" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="系数 Y">
            <el-input-number v-model="form.y" :min="0" :max="3" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="转速 n (rpm)">
            <el-input-number v-model="form.rpm" :min="1" :step="100" />
          </el-form-item>
          <el-form-item label="目标寿命 (h)">
            <el-input-number v-model="form.targetHours" :min="100" :step="1000" />
          </el-form-item>
        </el-form>
        <p class="text-xs text-gray-500">当量动载荷 P = X·Fr + Y·Fa</p>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">当量动载荷 P</dt>
            <dd class="font-mono">{{ result.equivalentLoad.toFixed(1) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">L10 (百万转)</dt>
            <dd class="font-mono">{{ formatNum(result.l10MillionRev) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">额定寿命</dt>
            <dd class="font-mono text-lg" :class="result.pass ? 'text-success' : 'text-error'">
              {{ formatHours(result.lifeHours) }}
              {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">目标寿命</dt>
            <dd class="font-mono">{{ form.targetHours.toLocaleString() }} h</dd>
          </div>
        </dl>

        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="L_{10} = \left(\frac{C}{P}\right)^{\varepsilon} \quad (\text{百万转})" />
          <MathTex expr="L_h = \frac{L_{10} \times 10^{6}}{60 \cdot n}" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeBearingLife } from '@/utils/bearing-calc'

const form = reactive({
  bearingType: 'ball',
  dynamicLoad: 35000,
  radialLoad: 5000,
  axialLoad: 1000,
  x: 1,
  y: 0,
  rpm: 1500,
  targetHours: 10000,
})

const result = computed(() => analyzeBearingLife(form))

function formatNum(n) {
  if (!Number.isFinite(n)) return '∞'
  return n.toFixed(2)
}

function formatHours(h) {
  if (!Number.isFinite(h)) return '∞ h'
  if (h >= 10000) return `${(h / 1000).toFixed(1)}k h`
  return `${Math.round(h)} h`
}
</script>
