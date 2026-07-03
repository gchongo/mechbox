<template>
  <div class="space-y-6">
    <!-- 上排：计算结果 + 设计要求 -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold">{{ pt('dashboard.closedResult') }}</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p class="mb-2 text-xs font-medium text-gray-500">{{ pt('dashboard.worstTitle') }}</p>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">{{ pt('dashboard.nominal') }}</dt>
                <dd class="font-mono">{{ fmt(worst.nominal) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">ES</dt>
                <dd class="font-mono text-success">+{{ fmt(worst.es) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">EI</dt>
                <dd class="font-mono text-error">{{ fmtSigned(worst.ei) }}</dd>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-1.5 dark:border-gray-700">
                <dt class="text-gray-500">{{ pt('dashboard.range') }}</dt>
                <dd class="font-mono text-xs">{{ fmt(worst.lower) }} ~ {{ fmt(worst.upper) }}</dd>
              </div>
            </dl>
            <el-tag
              class="mt-2"
              size="small"
              :type="worst.pass ? 'success' : 'danger'"
            >
              {{ worst.pass ? pt('dashboard.passDesign') : pt('dashboard.failDesign') }}
            </el-tag>
          </div>

          <div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <p class="mb-2 text-xs font-medium text-gray-500">{{ pt('dashboard.rssTitle') }}</p>
            <dl class="space-y-1.5 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">{{ pt('dashboard.meanMu') }}</dt>
                <dd class="font-mono">{{ fmt(rss.nominal) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">{{ pt('dashboard.sigmaLabel') }}</dt>
                <dd class="font-mono">{{ fmt(rss.processSigma) }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">{{ pt('dashboard.tol3sigma') }}</dt>
                <dd class="font-mono">{{ fmt(rss.tolerance) }}</dd>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-1.5 dark:border-gray-700">
                <dt class="text-gray-500">{{ pt('dashboard.range') }}</dt>
                <dd class="font-mono text-xs">{{ fmt(rss.lower) }} ~ {{ fmt(rss.upper) }}</dd>
              </div>
            </dl>
            <el-tag
              class="mt-2"
              size="small"
              :type="rss.pass ? 'success' : 'danger'"
            >
              {{ rss.pass ? pt('dashboard.passDesign') : pt('dashboard.failDesign') }}
            </el-tag>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold">{{ pt('dashboard.designReq') }}</h3>
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">{{ pt('dashboard.targetSize') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ fmt(design.target) }} {{ unit }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">{{ pt('dashboard.totalTolerance') }}</dt>
            <dd class="mt-1 font-mono text-lg">{{ fmt(design.tolerance) }} {{ unit }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">ES</dt>
            <dd class="mt-1 font-mono text-success">+{{ fmt(design.es) }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">EI</dt>
            <dd class="mt-1 font-mono text-error">{{ fmtSigned(design.ei) }}</dd>
          </div>
        </dl>
        <div class="mt-4 rounded-lg bg-primary/5 p-3 text-sm">
          <span class="text-gray-600">{{ pt('dashboard.allowedRange') }}</span>
          <span class="font-mono font-medium">{{ fmt(closedRing.min) }} ~ {{ fmt(closedRing.max) }} {{ unit }}</span>
        </div>
        <p class="mt-3 text-xs text-gray-500">
          {{ pt('dashboard.designHint') }}
        </p>
      </div>
    </div>

    <!-- 下排：CPK 表 + 分布图 -->
    <div class="grid min-w-0 gap-4 lg:grid-cols-2">
      <div class="min-w-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-3 font-semibold">{{ pt('dashboard.cpkTable') }}</h3>
        <el-table :data="cpkTable" size="small" border max-height="280" class="cpk-ref-table">
          <el-table-column prop="cpk" :label="pt('dashboard.cpkCol')" min-width="56" align="center" />
          <el-table-column prop="sigma" :label="pt('dashboard.sigmaLevel')" min-width="64" align="center">
            <template #default="{ row }">{{ row.sigma }}σ</template>
          </el-table-column>
          <el-table-column prop="yield" :label="pt('dashboard.yieldCol')" min-width="88" align="right" />
          <el-table-column prop="ppm" :label="pt('dashboard.ppmCol')" min-width="80" align="right" />
        </el-table>
        <p class="mt-2 text-xs text-gray-500">
          {{ pt('dashboard.cpkCurrent', { cpk: sigmaSummary.cpk, sigma: sigmaSummary.sigmaLevel }) }}
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
import SigmaSummary from '@/components/editor/SigmaSummary.vue'
import ChainDistributionChart from '@/components/editor/ChainDistributionChart.vue'
import { closedRingAsDesign, limitsToDeviations, CPK_REFERENCE } from '@/utils/ring-tolerance'
import { fmtNum } from '@/utils/format'
import { useCalcPage } from '@/composables/useCalcPage'

const props = defineProps({
  closedRing: { type: Object, required: true },
  worstResult: { type: Object, required: true },
  rssResult: { type: Object, required: true },
  sigmaSummary: { type: Object, required: true },
  unit: { type: String, default: 'mm' },
  precision: { type: Number, default: 4 },
})

const { pt } = useCalcPage('editor')

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

<style scoped>
.cpk-ref-table {
  width: 100%;
}

.cpk-ref-table :deep(.el-table__cell) {
  padding: 6px 8px;
}
</style>
