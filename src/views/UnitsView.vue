<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pt('tabBatch')" name="batch">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="80px">
              <CalcFormItem :label="pf('category')">
                <el-select v-model="category" class="w-full">
                  <el-option v-for="(c, k) in categoryOptions" :key="k" :label="c.label" :value="k" />
                </el-select>
              </CalcFormItem>
              <CalcFormItem :label="pf('inputValue')">
                <el-input-number v-model="inputValue" :precision="6" class="w-full" />
              </CalcFormItem>
              <CalcFormItem :label="pf('fromUnit')">
                <el-select v-model="fromUnit" class="w-full">
                  <el-option v-for="u in units" :key="u" :label="u" :value="u" />
                </el-select>
              </CalcFormItem>
            </el-form>
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pt('sectionAllUnits') }}</h2>
            <el-alert v-if="batchResult?.errorKey" :title="resultError(batchResult)" type="warning" show-icon />
            <el-table v-else-if="batchResult" :data="batchResult.rows" size="small" border max-height="360">
              <el-table-column prop="unit" :label="pt('table.unit')" width="100" />
              <el-table-column :label="pt('table.value')">
                <template #default="{ row }">
                  <span class="font-mono">{{ formatValue(row.value) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pt('tabQuick')" name="quick">
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
            <CalcFormItem :label="pf('quickInput')">
              <el-input-number v-model="quickValue" :precision="6" />
            </CalcFormItem>
          </el-form>
          <el-alert v-if="quickResult?.errorKey" :title="resultError(quickResult)" type="warning" show-icon />
          <p v-else-if="quickResult" class="text-lg">
            = <span class="font-mono text-primary">{{ formatValue(quickResult.value) }}</span>
            {{ QUICK_PAIRS[quickIndex].to }}
          </p>
        </section>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex gap-2">
      <el-button type="primary" plain @click="exportPdf">{{ fc('exportPdfReport') }}</el-button>
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
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'

const { pt, pf, fc } = useCalcPage('units')
const { resultError } = useResultI18n()
const { optionMap } = useOptionsI18n()

const categoryOptions = computed(() => optionMap(UNIT_CATEGORIES, 'unitCategories'))

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
  if (!r || r.errorKey) return
  await exportToolReportPdf({
    title: pt('pdfTitle'),
    sections: [
      {
        heading: categoryOptions.value[category.value]?.label ?? r.label,
        rows: r.rows.map((row) => ({ label: row.unit, value: formatValue(row.value) })),
      },
    ],
    filename: `units_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>
