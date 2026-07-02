<template>
  <div>
    <h1 class="page-title">概率统计工具</h1>
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- 分布类型 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">分布类型</h2>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(dist, key) in DISTRIBUTIONS"
            :key="key"
            class="rounded-lg border-2 p-3 text-left transition-all"
            :class="
              distribution === key
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50'
            "
            @click="distribution = key"
          >
            <p class="font-medium">{{ dist.name }}</p>
            <p class="text-xs text-gray-500">K = {{ dist.k }}</p>
          </button>
        </div>
      </section>

      <!-- 公差转换 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">公差 ↔ 标准差转换</h2>
        <el-radio-group v-model="convertDirection" class="mb-4">
          <el-radio value="t2s">T → σ</el-radio>
          <el-radio value="s2t">σ → T</el-radio>
        </el-radio-group>
        <el-form label-width="100px">
          <el-form-item label="输入值">
            <el-input-number v-model="convertInput" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item label="输出值">
            <span class="font-mono">{{ convertOutput }}</span>
          </el-form-item>
        </el-form>
      </section>

      <!-- 基础统计 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">基础统计</h2>
        <el-input
          v-model="dataInput"
          type="textarea"
          :rows="3"
          placeholder="如：10,12,15,18,20"
        />
        <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><dt class="text-gray-500">均值 (μ)</dt><dd class="font-mono">{{ stats.mean }}</dd></div>
          <div><dt class="text-gray-500">标准差 (σ)</dt><dd class="font-mono">{{ stats.std }}</dd></div>
          <div><dt class="text-gray-500">方差 (σ²)</dt><dd class="font-mono">{{ stats.variance }}</dd></div>
          <div><dt class="text-gray-500">极差 (R)</dt><dd class="font-mono">{{ stats.range }}</dd></div>
        </dl>
      </section>

      <!-- RSS & 西格玛 -->
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">RSS & 西格玛分析</h2>
        <el-form label-width="120px">
          <el-form-item label="公差列表">
            <el-input v-model="toleranceList" placeholder="如：0.06,0.05,0.04" />
          </el-form-item>
          <el-form-item label="RSS 总公差">
            <span class="font-mono">{{ rssTotal }}</span>
          </el-form-item>
          <el-form-item label="目标公差 (mm)">
            <el-input-number v-model="targetTolerance" :precision="3" />
          </el-form-item>
          <el-form-item label="实际标准差">
            <el-input-number v-model="actualSigma" :precision="4" />
          </el-form-item>
          <el-form-item label="西格玛水平">
            <span class="font-mono">{{ sigmaLevel }}σ</span>
          </el-form-item>
          <el-form-item label="合格率">
            <span class="font-mono">{{ passRate }}</span>
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
  if (convertDirection.value === 't2s') {
    const s = toleranceToSigma(val, distribution.value)
    return `σ = ${s.toFixed(4)}`
  }
  const t = sigmaToTolerance(val, distribution.value)
  return `T = ${t.toFixed(4)}`
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
  const range = Math.max(...nums) - Math.min(...nums)
  return {
    mean: mean.toFixed(2),
    std: std.toFixed(3),
    variance: variance.toFixed(3),
    range: range.toFixed(2),
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
