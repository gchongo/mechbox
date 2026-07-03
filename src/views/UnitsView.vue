<template>
  <div>
    <h1 class="page-title">单位换算中心</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      应力、力、扭矩、长度等工程单位批量换算
    </p>

    <el-tabs v-model="tab">
      <el-tab-pane label="批量换算" name="batch">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="80px">
              <el-form-item label="类别">
                <el-select v-model="category" class="w-full">
                  <el-option v-for="(c, k) in UNIT_CATEGORIES" :key="k" :label="c.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="输入值">
                <el-input-number v-model="inputValue" :precision="6" class="w-full" />
              </el-form-item>
              <el-form-item label="从单位">
                <el-select v-model="fromUnit" class="w-full">
                  <el-option v-for="u in units" :key="u" :label="u" :value="u" />
                </el-select>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">全部单位结果</h2>
            <el-table v-if="batchResult" :data="batchResult.rows" size="small" border max-height="360">
              <el-table-column prop="unit" label="单位" width="100" />
              <el-table-column label="数值">
                <template #default="{ row }">
                  <span class="font-mono">{{ formatValue(row.value) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="快捷换算" name="quick">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            v-for="(pair, i) in QUICK_PAIRS"
            :key="i"
            type="button"
            class="rounded-lg border border-gray-200 p-4 text-left transition hover:border-primary/40 dark:border-gray-700"
            @click="quickIndex = i"
          >
            <span class="text-sm font-medium">{{ pair.label }}</span>
          </button>
        </div>
        <section v-if="quickIndex != null" class="card-panel mt-4">
          <el-form inline>
            <el-form-item label="输入">
              <el-input-number v-model="quickValue" :precision="6" />
            </el-form-item>
          </el-form>
          <p v-if="quickResult && !quickResult.error" class="text-lg">
            = <span class="font-mono text-primary">{{ formatValue(quickResult.value) }}</span>
            {{ QUICK_PAIRS[quickIndex].to }}
          </p>
        </section>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex gap-2">
      <el-button type="primary" plain @click="exportPdf">导出 PDF 报告</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  UNIT_CATEGORIES,
  QUICK_PAIRS,
  convertToAll,
  quickConvert,
  getUnitsForCategory,
} from '@/utils/unit-conversion-calc'
import { exportToolReportPdf } from '@/utils/export'

const tab = ref('batch')
const category = ref('stress')
const inputValue = ref(100)
const fromUnit = ref('MPa')
const quickIndex = ref(0)
const quickValue = ref(100)

const units = computed(() => getUnitsForCategory(category.value))

watch(category, (c) => {
  const u = getUnitsForCategory(c)
  fromUnit.value = u[0]
})

const batchResult = computed(() => convertToAll(inputValue.value, fromUnit.value, category.value))

const quickResult = computed(() => {
  if (quickIndex.value == null) return null
  return quickConvert(quickIndex.value, quickValue.value)
})

function formatValue(v) {
  if (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0)) return v.toExponential(4)
  return v.toFixed(6).replace(/\.?0+$/, '')
}

async function exportPdf() {
  const r = batchResult.value
  await exportToolReportPdf({
    title: '单位换算报告',
    sections: [
      {
        heading: r.label,
        rows: r.rows.map((row) => ({ label: row.unit, value: formatValue(row.value) })),
      },
    ],
    filename: `单位换算_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>
