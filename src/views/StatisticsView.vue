<template>
  <div>
    <h1 class="page-title">概率统计工具</h1>

    <!-- 分布类型卡片 -->
    <section class="card-panel mb-6">
      <h2 class="mb-4 font-semibold">分布类型</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="(dist, key) in DISTRIBUTIONS"
          :key="key"
          class="rounded-lg border-2 p-4 text-left transition-all"
          :class="
            distribution === key
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary/50'
          "
          @click="distribution = key"
        >
          <div class="mb-2 flex items-center gap-2">
            <el-icon :size="20" class="text-primary"><TrendCharts /></el-icon>
            <span class="font-medium">{{ dist.name }}</span>
          </div>
          <dl class="space-y-1 text-xs text-gray-600">
            <div class="flex justify-between"><dt>K 值</dt><dd class="font-mono">{{ dist.k }}</dd></div>
            <div class="flex justify-between"><dt>cv</dt><dd class="font-mono">{{ dist.cv }}</dd></div>
            <div class="flex justify-between"><dt>覆盖率</dt><dd class="font-mono">{{ (dist.coverage * 100).toFixed(2) }}%</dd></div>
          </dl>
        </button>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 公差转换 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">公差 ↔ 标准差转换</h2>
        <el-form label-width="100px">
          <el-form-item label="转换方向">
            <el-radio-group v-model="convertDirection">
              <el-radio value="t2s">T → σ</el-radio>
              <el-radio value="s2t">σ → T</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="分布类型">
            <el-select v-model="distribution" class="w-full">
              <el-option
                v-for="(dist, key) in DISTRIBUTIONS"
                :key="key"
                :label="dist.name"
                :value="key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="输入值">
            <el-input-number v-model="convertInput" :precision="4" :step="0.01" class="w-full" />
          </el-form-item>
          <el-form-item label="输出值">
            <span class="font-mono text-primary">{{ convertOutput }}</span>
          </el-form-item>
        </el-form>
      </section>

      <!-- 基础统计 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">基础统计</h2>
        <el-form-item label="输入数据" label-width="80px">
          <el-input
            v-model="dataInput"
            type="textarea"
            :rows="3"
            placeholder="如：10,12,15,18,20（逗号分隔）"
          />
        </el-form-item>
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">均值 (μ)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.mean }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">标准差 (σ)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.std }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">方差 (σ²)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.variance }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3">
            <dt class="text-gray-500">极差 (R)</dt>
            <dd class="mt-1 font-mono text-lg">{{ stats.range }}</dd>
          </div>
        </dl>
      </section>

      <!-- RSS -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">基础 RSS 计算</h2>
        <el-form label-width="120px">
          <el-form-item label="公差列表">
            <el-input v-model="toleranceList" placeholder="如：0.06,0.05,0.04" />
          </el-form-item>
          <el-form-item label="RSS 总公差">
            <span class="font-mono text-lg text-primary">{{ rssTotal }} mm</span>
          </el-form-item>
        </el-form>
      </section>

      <!-- 西格玛 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">西格玛分析</h2>
        <el-form label-width="120px">
          <el-form-item label="目标公差 (mm)">
            <el-input-number v-model="targetTolerance" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item label="实际标准差">
            <el-input-number v-model="actualSigma" :precision="4" :step="0.001" />
          </el-form-item>
          <el-form-item label="西格玛水平">
            <span class="font-mono text-lg">{{ sigmaLevel }}σ</span>
          </el-form-item>
          <el-form-item label="合格率">
            <span class="font-mono text-lg text-success">{{ passRate }}</span>
          </el-form-item>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  DISTRIBUTIONS,
  toleranceToSigma,
  sigmaToTolerance,
  rssMethod,
  calculateSigmaLevel,
  calculatePassRate,
} from '@/utils/size-chain'

const distribution = ref('normal')
const convertDirection = ref('t2s')
const convertInput = ref(0.25)
const dataInput = ref('10,12,15,18,20')
const toleranceList = ref('0.06,0.05,0.04')
const targetTolerance = ref(0.25)
const actualSigma = ref(0.042)

const convertOutput = computed(() => {
  const val = convertInput.value ?? 0
  const distName = DISTRIBUTIONS[distribution.value].name
  if (convertDirection.value === 't2s') {
    const s = toleranceToSigma(val, distribution.value)
    return `σ = ${s.toFixed(4)}（${distName}）`
  }
  const t = sigmaToTolerance(val, distribution.value)
  return `T = ${t.toFixed(4)}（${distName}）`
})

const stats = computed(() => {
  const nums = dataInput.value
    .split(/[,，\s]+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
  if (!nums.length) return { mean: '-', std: '-', variance: '-', range: '-' }
  const mean = nums.reduce((a, b) => a + b, 0) / nums.length
  const variance = nums.reduce((s, x) => s + (x - mean) ** 2, 0) / nums.length
  const std = Math.sqrt(variance)
  return {
    mean: mean.toFixed(2),
    std: std.toFixed(3),
    variance: variance.toFixed(3),
    range: (Math.max(...nums) - Math.min(...nums)).toFixed(2),
  }
})

const rssTotal = computed(() => {
  const tolerances = toleranceList.value
    .split(/[,，\s]+/)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .map((t) => ({ tolerance: t }))
  if (!tolerances.length) return '-'
  return rssMethod(tolerances).toFixed(4)
})

const sigmaLevel = computed(() => {
  if (!actualSigma.value) return '-'
  return calculateSigmaLevel(targetTolerance.value, actualSigma.value).toFixed(2)
})

const passRate = computed(() => {
  if (!actualSigma.value) return '-'
  const level = calculateSigmaLevel(targetTolerance.value, actualSigma.value)
  return `${(calculatePassRate(level) * 100).toFixed(2)}%`
})
</script>
