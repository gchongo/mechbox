<template>
  <div class="space-y-6">
    <!-- 上排：计算结果 + 设计要求 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold">封闭环计算结果</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p class="mb-2 text-xs font-medium text-gray-500">极值法（100% 互换性）</p>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">公称尺寸</dt>
                <dd class="font-mono">{{ fmt(worst.nominal) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">上偏差 ES</dt>
                <dd class="font-mono text-success">+{{ fmt(worst.es) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">下偏差 EI</dt>
                <dd class="font-mono text-error">{{ fmtSigned(worst.ei) }}</dd>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-1.5 dark:border-gray-700">
                <dt class="text-gray-500">范围</dt>
                <dd class="font-mono text-xs">{{ fmt(worst.lower) }} ~ {{ fmt(worst.upper) }}</dd>
              </div>
            </dl>
            <el-tag
              class="mt-2"
              size="small"
              :type="worst.pass ? 'success' : 'danger'"
            >
              {{ worst.pass ? '✓ 满足设计要求' : '✗ 超出设计要求' }}
            </el-tag>
          </div>

          <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p class="mb-2 text-xs font-medium text-gray-500">概率法（RSS ±<MathTex expr="3\sigma" />，99.73%）</p>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">分布均值 <MathTex expr="\mu" /></dt>
                <dd class="font-mono">{{ fmt(rss.nominal) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">标准差 <MathTex expr="\sigma" /></dt>
                <dd class="font-mono">{{ fmt(rss.processSigma) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">±<MathTex expr="3\sigma" /> 公差</dt>
                <dd class="font-mono">{{ fmt(rss.tolerance) }}</dd>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-1.5 dark:border-gray-700">
                <dt class="text-gray-500">范围</dt>
                <dd class="font-mono text-xs">{{ fmt(rss.lower) }} ~ {{ fmt(rss.upper) }}</dd>
              </div>
            </dl>
            <el-tag
              class="mt-2"
              size="small"
              :type="rss.pass ? 'success' : 'danger'"
            >
              {{ rss.pass ? '✓ 满足设计要求' : '✗ 超出设计要求' }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold">设计要求（装配间隙 / 封闭环）</h3>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">目标尺寸</dt>
            <dd class="mt-1 font-mono text-lg">{{ fmt(design.target) }} {{ unit }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">总公差</dt>
            <dd class="mt-1 font-mono text-lg">{{ fmt(design.tolerance) }} {{ unit }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">上偏差 ES</dt>
            <dd class="mt-1 font-mono text-success">+{{ fmt(design.es) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">下偏差 EI</dt>
            <dd class="mt-1 font-mono text-error">{{ fmtSigned(design.ei) }}</dd>
          </div>
        </dl>
        <div class="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
          <span class="text-gray-600">允许范围：</span>
          <span class="font-mono font-medium">{{ fmt(closedRing.min) }} ~ {{ fmt(closedRing.max) }} {{ unit }}</span>
        </div>
        <p class="mt-3 text-xs text-gray-500">
          💡 若计算范围落在此区间内，说明装配要求可满足
        </p>
      </div>
    </div>

    <!-- 下排：CPK 表 + 分布图 -->
    <div class="grid min-w-0 gap-4 lg:grid-cols-2">
      <div class="min-w-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold">CPK 等级对照表</h3>
        <el-table :data="cpkTable" size="small" border max-height="280">
          <el-table-column prop="cpk" label="CPK" width="64" />
          <el-table-column prop="sigma" label="σ 水平" width="72">
            <template #default="{ row }">{{ row.sigma }}σ</template>
          </el-table-column>
          <el-table-column prop="yield" label="良品率%" width="88" />
          <el-table-column prop="ppm" label="PPM 不良" />
        </el-table>
        <p class="mt-2 text-xs text-gray-500">
          当前 Cpk = <strong>{{ sigmaSummary.cpk }}</strong>，
          σ 水平 = <strong>{{ sigmaSummary.sigmaLevel }}σ</strong>，
          建议生产 Cpk ≥ 1.33
        </p>
      </div>

      <div class="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <ChainDistributionChart
          :mean="rss.nominal"
          :process-sigma="rss.processSigma"
          :spec-min="closedRing.min"
          :spec-max="closedRing.max"
        />
      </div>
    </div>

    <!-- 西格玛摘要 -->
    <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <SigmaSummary :summary="sigmaSummary" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import SigmaSummary from '@/components/editor/SigmaSummary.vue'
import ChainDistributionChart from '@/components/editor/ChainDistributionChart.vue'
import { closedRingAsDesign, limitsToDeviations, CPK_REFERENCE } from '@/utils/ring-tolerance'
import { fmtNum } from '@/utils/format'

const props = defineProps({
  closedRing: { type: Object, required: true },
  worstResult: { type: Object, required: true },
  rssResult: { type: Object, required: true },
  sigmaSummary: { type: Object, required: true },
  unit: { type: String, default: 'mm' },
  precision: { type: Number, default: 4 },
})

const cpkTable = CPK_REFERENCE

const design = computed(() => closedRingAsDesign(props.closedRing))

const worst = computed(() => {
  const r = props.worstResult
  const d = limitsToDeviations(r.nominal ?? (r.upper + r.lower) / 2, r.upper, r.lower)
  return { ...d, pass: r.pass }
})

const rss = computed(() => {
  const r = props.rssResult
  const nominal = r.nominal ?? (r.upper + r.lower) / 2
  const processSigma = (r.totalTolerance ?? 0) / 6
  const d = limitsToDeviations(nominal, r.upper, r.lower)
  return { ...d, processSigma, pass: r.pass }
})

function fmt(v) {
  if (v == null || Number.isNaN(v)) return '—'
  return fmtNum(v, props.precision)
}

function fmtSigned(v) {
  if (v == null || Number.isNaN(v)) return '—'
  const n = Number(v)
  return n >= 0 ? `+${fmt(n)}` : fmt(n)
}
</script>
