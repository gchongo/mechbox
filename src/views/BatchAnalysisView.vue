<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionTarget') }}</h2>
        <el-form label-width="120px">
          <CalcFormItem :label="pf('targetMin')">
            <el-input-number v-model="targetMin" :precision="3" :step="0.01" />
          </CalcFormItem>
          <CalcFormItem :label="pf('targetMax')">
            <el-input-number v-model="targetMax" :precision="3" :step="0.01" />
          </CalcFormItem>
        </el-form>

        <h2 class="mb-3 font-semibold">{{ pt('sectionInput') }}</h2>
        <p class="mb-2 text-xs text-gray-500">
          {{ pt('inputHint') }}
        </p>
        <el-input
          v-model="csvInput"
          type="textarea"
          :rows="10"
          :placeholder="csvPlaceholder"
        />
        <div class="mt-3 flex gap-2">
          <el-button type="primary" @click="runBatch">{{ pt('run') }}</el-button>
          <el-button @click="loadSample">{{ pt('loadSample') }}</el-button>
        </div>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pt('sectionSummary') }}</h2>
        <div v-if="summary" class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('total')" />
            <dd class="mt-1 font-mono text-lg">{{ summary.total }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('rssPass')" />
            <dd class="mt-1 font-mono text-lg text-success">{{ summary.rssPass }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('worstPass')" />
            <dd class="mt-1 font-mono text-lg text-success">{{ summary.worstPass }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <ResultLabel label-class="text-gray-500" :text="pr('fail')" />
            <dd class="mt-1 font-mono text-lg text-error">{{ summary.fail }}</dd>
          </div>
          <div v-if="summary.criticalGap" class="rounded bg-red-50 p-3 dark:bg-red-950/30">
            <ResultLabel label-class="text-gray-500" :text="pr('criticalGap')" />
            <dd class="mt-1 font-mono text-lg text-error">{{ summary.criticalGap }}</dd>
          </div>
        </div>
        <el-empty v-else :description="pt('emptyHint')" />

        <div
          class="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-400"
        >
          <p class="mb-2 font-medium text-gray-700 dark:text-gray-300">
            {{ pt('methodology.title') }}
          </p>
          <ul class="list-disc space-y-1.5 pl-4">
            <li v-for="key in methodologyKeys" :key="key">
              <MathContent :text="enrichedMethodology(key)" />
            </li>
          </ul>
        </div>
      </section>
    </div>

    <section v-if="results.length" class="card-panel mt-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold">{{ pt('sectionResults') }}</h2>
        <el-button size="small" @click="exportResults">{{ pt('exportCsv') }}</el-button>
      </div>
      <el-table :data="results" border stripe>
        <el-table-column prop="name" :label="pt('table.scheme')" min-width="120" />
        <el-table-column prop="ringCount" :label="pt('table.ringCount')" width="70" />
        <el-table-column :label="pt('table.rssTol')" width="100">
          <template #default="{ row }">
            {{ row.rssTolerance?.toFixed(4) ?? '—' }}
          </template>
        </el-table-column>
        <el-table-column :label="pt('table.rss')" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.errorKey" type="info" size="small">{{ resultError(row) }}</el-tag>
            <el-tag v-else :type="row.rssPass ? 'success' : 'danger'" size="small">
              {{ row.rssPass ? fc('pass') : fc('fail') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="pt('table.worstTol')" width="100">
          <template #default="{ row }">
            {{ row.worstTolerance?.toFixed(4) ?? '—' }}
          </template>
        </el-table-column>
        <el-table-column :label="pt('table.worst')" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.errorKey" type="info" size="small">{{ resultError(row) }}</el-tag>
            <el-tag v-else :type="row.worstPass ? 'success' : 'danger'" size="small">
              {{ row.worstPass ? fc('pass') : fc('fail') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="pt('table.advice')" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-if="row.adviceKey && !row.errorKey"
              :type="row.adviceLevel === 'critical' ? 'danger' : 'warning'"
              size="small"
            >
              <MathContent :text="enrichedAdvice(row.adviceKey)" />
            </el-tag>
            <span v-else>—</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { parseBatchCsv, batchValidate } from '@/utils/batch-analysis'
import { enrichMathText } from '@/utils/math-label'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useContentI18n } from '@/composables/useContentI18n'
import { useDemoData } from '@/composables/useDemoData'

const { pt, pf, pr, fc, locale } = useCalcPage('batch')
const { resultError } = useResultI18n()
const { exportFilename } = useContentI18n()
const { demo } = useDemoData()

const csvPlaceholder = computed(() => demo.value.batchCsvPlaceholder)

const methodologyKeys = ['model', 'worst', 'rss', 'pass', 'summary', 'risk']

const targetMin = ref(0)
const targetMax = ref(0.25)
const csvInput = ref('')
const results = ref([])

const summary = computed(() => {
  if (!results.value.length) return null
  const valid = results.value.filter((r) => !r.errorKey)
  return {
    total: results.value.length,
    rssPass: valid.filter((r) => r.rssPass).length,
    worstPass: valid.filter((r) => r.worstPass).length,
    fail: valid.filter((r) => !r.rssPass && !r.worstPass).length,
    criticalGap: valid.filter((r) => r.adviceLevel === 'critical').length,
  }
})

function enrichedAdvice(key) {
  return enrichMathText(pt(`advice.${key}`))
}

function enrichedMethodology(key) {
  return enrichMathText(pt(`methodology.${key}`))
}

function runBatch() {
  const rows = parseBatchCsv(csvInput.value)
  if (!rows.length) {
    ElMessage.warning(pt('msgNoRows'))
    return
  }
  if (rows.length > 50) {
    ElMessage.warning(pt('msgMaxRows'))
    return
  }
  if (targetMax.value <= targetMin.value) {
    ElMessage.error(pt('msgBadRange'))
    return
  }
  results.value = batchValidate(rows, targetMin.value, targetMax.value)
  ElMessage.success(pt('msgDone', { n: results.value.length }))
}

function loadSample() {
  const names = demo.value.batchSchemes
  csvInput.value = `${names[0]},0.06,0.05,0.04
${names[1]},0.08,0.06,0.05
${names[2]},0.05,0.04,0.03
${names[3]},0.10,0.08,0.07
${names[4]},0.04,0.03,0.02`
  targetMin.value = 0
  targetMax.value = 0.25
}

function exportResults() {
  const header = `${pt('table.scheme')},${pt('table.ringCount')},${pt('table.rssTol')},${pt('table.rss')},${pt('table.worstTol')},${pt('table.worst')}\n`
  const lines = results.value.map((r) =>
    [
      r.name,
      r.ringCount ?? '',
      r.rssTolerance?.toFixed(4) ?? '',
      r.errorKey ? resultError(r) : (r.rssPass ? fc('pass') : fc('fail')),
      r.worstTolerance?.toFixed(4) ?? '',
      r.errorKey ? resultError(r) : (r.worstPass ? fc('pass') : fc('fail')),
    ].join(','),
  )
  const blob = new Blob(['\ufeff' + header + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = exportFilename('batchCsv', { date: new Date().toISOString().slice(0, 10) })
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>
