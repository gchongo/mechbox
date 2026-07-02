<template>
  <div>
    <h1 class="page-title">批量公差验证</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      质量工程师批量验证多组零件公差方案（最多 50 组）
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">目标规格</h2>
        <el-form label-width="120px">
          <el-form-item label="封闭环下限">
            <el-input-number v-model="targetMin" :precision="3" :step="0.01" />
          </el-form-item>
          <el-form-item label="封闭环上限">
            <el-input-number v-model="targetMax" :precision="3" :step="0.01" />
          </el-form-item>
        </el-form>

        <h2 class="mb-3 font-semibold">批量输入</h2>
        <p class="mb-2 text-xs text-gray-500">
          每行一组：名称,公差1,公差2,公差3…（逗号分隔）
        </p>
        <el-input
          v-model="csvInput"
          type="textarea"
          :rows="10"
          placeholder="方案A,0.06,0.05,0.04&#10;方案B,0.08,0.06,0.05&#10;方案C,0.05,0.04,0.03"
        />
        <div class="mt-3 flex gap-2">
          <el-button type="primary" @click="runBatch">开始验证</el-button>
          <el-button @click="loadSample">加载示例</el-button>
        </div>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">验证摘要</h2>
        <div v-if="summary" class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">总方案数</dt>
            <dd class="mt-1 font-mono text-lg">{{ summary.total }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">RSS 合格</dt>
            <dd class="mt-1 font-mono text-lg text-success">{{ summary.rssPass }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">极值合格</dt>
            <dd class="mt-1 font-mono text-lg text-success">{{ summary.worstPass }}</dd>
          </div>
          <div class="rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">不合格</dt>
            <dd class="mt-1 font-mono text-lg text-error">{{ summary.fail }}</dd>
          </div>
        </div>
        <el-empty v-else description="输入数据后点击「开始验证」" />
      </section>
    </div>

    <section v-if="results.length" class="card-panel mt-6">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold">验证结果</h2>
        <el-button size="small" @click="exportResults">导出 CSV</el-button>
      </div>
      <el-table :data="results" border stripe>
        <el-table-column prop="name" label="方案" min-width="120" />
        <el-table-column prop="ringCount" label="环数" width="70" />
        <el-table-column label="RSS 公差" width="100">
          <template #default="{ row }">
            {{ row.rssTolerance?.toFixed(4) ?? '—' }}
          </template>
        </el-table-column>
        <el-table-column label="RSS" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.error" type="info" size="small">—</el-tag>
            <el-tag v-else :type="row.rssPass ? 'success' : 'danger'" size="small">
              {{ row.rssPass ? '合格' : '不合格' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="极值公差" width="100">
          <template #default="{ row }">
            {{ row.worstTolerance?.toFixed(4) ?? '—' }}
          </template>
        </el-table-column>
        <el-table-column label="极值" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.error" type="info" size="small">—</el-tag>
            <el-tag v-else :type="row.worstPass ? 'success' : 'danger'" size="small">
              {{ row.worstPass ? '合格' : '不合格' }}
            </el-tag>
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

const targetMin = ref(0)
const targetMax = ref(0.25)
const csvInput = ref('')
const results = ref([])

const summary = computed(() => {
  if (!results.value.length) return null
  const valid = results.value.filter((r) => !r.error)
  return {
    total: results.value.length,
    rssPass: valid.filter((r) => r.rssPass).length,
    worstPass: valid.filter((r) => r.worstPass).length,
    fail: valid.filter((r) => !r.rssPass && !r.worstPass).length,
  }
})

function runBatch() {
  const rows = parseBatchCsv(csvInput.value)
  if (!rows.length) {
    ElMessage.warning('请输入至少一行数据')
    return
  }
  if (rows.length > 50) {
    ElMessage.warning('最多 50 组方案')
    return
  }
  if (targetMax.value <= targetMin.value) {
    ElMessage.error('上限须大于下限')
    return
  }
  results.value = batchValidate(rows, targetMin.value, targetMax.value)
  ElMessage.success(`已验证 ${results.value.length} 组方案`)
}

function loadSample() {
  csvInput.value = `方案A,0.06,0.05,0.04
方案B,0.08,0.06,0.05
方案C,0.05,0.04,0.03
方案D,0.10,0.08,0.07
方案E,0.04,0.03,0.02`
  targetMin.value = 0
  targetMax.value = 0.25
}

function exportResults() {
  const header = '方案,环数,RSS公差,RSS合格,极值公差,极值合格\n'
  const lines = results.value.map((r) =>
    [
      r.name,
      r.ringCount ?? '',
      r.rssTolerance?.toFixed(4) ?? '',
      r.rssPass ? '合格' : '不合格',
      r.worstTolerance?.toFixed(4) ?? '',
      r.worstPass ? '合格' : '不合格',
    ].join(','),
  )
  const blob = new Blob(['\ufeff' + header + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `批量验证_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
</script>
