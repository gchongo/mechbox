<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pt('tabBatch')" name="batch">
        <div class="grid gap-6 xl:grid-cols-5">
          <section class="card-panel xl:col-span-2">
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
                  <el-option v-for="u in units" :key="u" :label="u" :value="u">
                    <MathContent class="inline" :text="u" />
                  </el-option>
                </el-select>
              </CalcFormItem>
            </el-form>
          </section>

          <section class="card-panel xl:col-span-3 xl:sticky xl:top-20 xl:self-start">
            <el-alert v-if="batchResult?.errorKey" :title="resultError(batchResult)" type="warning" show-icon />
            <template v-else-if="batchResult">
              <div class="unit-hero">
                <span class="unit-hero__value">{{ formatValue(inputValue) }}</span>
                <span class="unit-hero__unit"><MathContent class="inline" :text="fromUnit" /></span>
              </div>

              <div v-if="primaryChips.length" class="mb-4 flex flex-wrap gap-2">
                <button
                  v-for="chip in primaryChips"
                  :key="chip.unit"
                  type="button"
                  class="unit-chip"
                  :class="{ 'unit-chip--active': chip.unit === fromUnit }"
                  :title="pt('copyValue')"
                  @click="copyText(`${formatValue(chip.value)} ${chip.unit}`)"
                >
                  <span class="unit-chip__val">{{ formatValue(chip.value) }}</span>
                  <span class="unit-chip__unit"><MathContent class="inline" :text="chip.unit" /></span>
                </button>
              </div>

              <div v-if="scaleRefs.length" class="unit-approx mb-4">
                <h3 class="unit-approx__title">{{ pt('sectionApprox') }}</h3>
                <p class="unit-approx__hint">{{ pt('approxHint') }}</p>
                <ul class="unit-approx__list">
                  <li v-for="ref in scaleRefs" :key="ref.id" class="unit-approx__item">
                    <span class="unit-approx__icon" aria-hidden="true">{{ ref.icon }}</span>
                    <span>{{ formatScaleText(ref) }}</span>
                  </li>
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  class="unit-toggle"
                  @click="showAllUnits = !showAllUnits"
                >
                  {{ showAllUnits ? pt('collapseAllUnits') : pt('expandAllUnits') }}
                  <span class="text-gray-400">({{ batchResult.rows.length }})</span>
                </button>
                <el-table
                  v-show="showAllUnits"
                  class="mt-2"
                  :data="sortedRows"
                  size="small"
                  border
                  max-height="320"
                  :row-class-name="rowClassName"
                >
                  <el-table-column :label="pt('table.unit')" width="120">
                    <template #default="{ row }">
                      <MathContent class="inline" :text="row.unit" />
                    </template>
                  </el-table-column>
                  <el-table-column :label="pt('table.value')">
                    <template #default="{ row }">
                      <span class="font-mono">{{ formatValue(row.value) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
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
            :class="{ 'ring-2 ring-primary/30': quickIndex === i }"
            @click="quickIndex = i"
          >
            <span class="text-sm font-medium">{{ pair.label }}</span>
          </button>
        </div>

        <section v-if="quickIndex != null" class="card-panel mt-4">
          <el-form inline>
            <CalcFormItem :label="pf('quickInput')">
              <el-input-number v-model="quickValue" :precision="6" />
              <span class="ml-2 text-sm text-gray-500">{{ QUICK_PAIRS[quickIndex].from }}</span>
            </CalcFormItem>
          </el-form>

          <el-alert v-if="quickResult?.errorKey" :title="resultError(quickResult)" type="warning" show-icon />
          <template v-else-if="quickResult">
            <div class="unit-hero unit-hero--compact">
              <span class="unit-hero__value">{{ formatValue(quickValue) }}</span>
              <span class="unit-hero__unit">{{ QUICK_PAIRS[quickIndex].from }}</span>
              <span class="unit-hero__eq">=</span>
              <span class="unit-hero__value text-primary">{{ formatValue(quickResult.value) }}</span>
              <span class="unit-hero__unit">{{ QUICK_PAIRS[quickIndex].to }}</span>
            </div>

            <div v-if="quickScaleRefs.length" class="unit-approx mt-4">
              <h3 class="unit-approx__title">{{ pt('sectionApprox') }}</h3>
              <ul class="unit-approx__list">
                <li v-for="ref in quickScaleRefs" :key="ref.id" class="unit-approx__item">
                  <span class="unit-approx__icon" aria-hidden="true">{{ ref.icon }}</span>
                  <span>{{ formatScaleText(ref) }}</span>
                </li>
              </ul>
            </div>
          </template>
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
import { ElMessage } from 'element-plus'
import {
  UNIT_CATEGORIES,
  QUICK_PAIRS,
  convertToAll,
  quickConvert,
  getUnitsForCategory,
} from '@/utils/unit-conversion-calc'
import { formatEngineeringValue, formatScaleRatio } from '@/utils/unit-format'
import { PRIMARY_UNITS, getScaleReferences } from '@/constants/unit-scale-references'
import { exportToolReportPdf } from '@/utils/export'
import { useCalcPage } from '@/composables/useCalcPage'
import { useResultI18n } from '@/composables/useResultI18n'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import MathContent from '@/components/common/MathContent.vue'

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
const showAllUnits = ref(false)

const units = computed(() => getUnitsForCategory(category.value))

watch(category, (c) => {
  const u = getUnitsForCategory(c)
  fromUnit.value = u[0]
})

const batchResult = computed(() => convertToAll(inputValue.value, fromUnit.value, category.value))

const primaryChips = computed(() => {
  const r = batchResult.value
  if (!r?.rows?.length) return []
  const primary = PRIMARY_UNITS[category.value] ?? []
  const rowMap = Object.fromEntries(r.rows.map((row) => [row.unit, row.value]))
  const ordered = primary.filter((u) => rowMap[u] != null).map((u) => ({ unit: u, value: rowMap[u] }))
  if (ordered.length >= 2) return ordered
  return r.rows.slice(0, 4).map((row) => ({ unit: row.unit, value: row.value }))
})

const sortedRows = computed(() => {
  const r = batchResult.value
  if (!r?.rows) return []
  const primary = new Set(PRIMARY_UNITS[category.value] ?? [])
  const pri = []
  const rest = []
  for (const row of r.rows) {
    if (primary.has(row.unit)) pri.push(row)
    else rest.push(row)
  }
  pri.sort((a, b) => (PRIMARY_UNITS[category.value]?.indexOf(a.unit) ?? 0) - (PRIMARY_UNITS[category.value]?.indexOf(b.unit) ?? 0))
  return [...pri, ...rest]
})

function refLabel(key) {
  return pt(`refs.${key}`)
}

const scaleRefs = computed(() => {
  if (batchResult.value?.errorKey) return []
  return getScaleReferences(inputValue.value, fromUnit.value, category.value, refLabel)
})

const quickResult = computed(() => {
  if (quickIndex.value == null) return null
  return quickConvert(quickIndex.value, quickValue.value)
})

const quickScaleRefs = computed(() => {
  if (quickIndex.value == null || quickResult.value?.errorKey) return []
  const pair = QUICK_PAIRS[quickIndex.value]
  return getScaleReferences(quickValue.value, pair.from, pair.category, refLabel)
})

function formatValue(v) {
  return formatEngineeringValue(v)
}

function formatScaleText(ref) {
  const ratio = formatScaleRatio(ref.ratio)
  if (ref.displayMode === 'delta') {
    return pt('scaleDelta', { ratio, label: ref.label })
  }
  return pt('scaleTimes', { ratio, label: ref.label })
}

function rowClassName({ row }) {
  return row.unit === fromUnit.value ? 'unit-row-from' : ''
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(pt('copyValue'))
  } catch {
    ElMessage.warning(text)
  }
}

async function exportPdf() {
  const r = batchResult.value
  if (!r || r.errorKey) return
  const approxRows = scaleRefs.value.map((ref) => ({
    label: formatScaleText(ref),
    value: '',
  }))
  await exportToolReportPdf({
    title: pt('pdfTitle'),
    sections: [
      {
        heading: `${formatValue(inputValue.value)} ${fromUnit.value}`,
        rows: primaryChips.value.map((c) => ({
          label: c.unit,
          value: formatValue(c.value),
        })),
      },
      ...(approxRows.length
        ? [{ heading: pt('sectionApprox'), rows: approxRows }]
        : []),
      {
        heading: pt('sectionAllUnits'),
        rows: r.rows.map((row) => ({ label: row.unit, value: formatValue(row.value) })),
      },
    ],
    filename: `units_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>

<style scoped>
.unit-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.5rem;
  margin-bottom: 1rem;
}

.unit-hero--compact {
  margin-bottom: 0;
}

.unit-hero__value {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.unit-hero--compact .unit-hero__value {
  font-size: 1.5rem;
}

.unit-hero__unit {
  font-size: 1.125rem;
  color: rgb(107 114 128);
}

.dark .unit-hero__unit {
  color: rgb(156 163 175);
}

.unit-hero__eq {
  font-size: 1.25rem;
  color: rgb(156 163 175);
  margin: 0 0.25rem;
}

.unit-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgb(229 231 235);
  background: rgb(249 250 251);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.dark .unit-chip {
  border-color: rgb(55 65 81);
  background: rgb(17 24 39);
}

.unit-chip:hover {
  border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
}

.unit-chip--active {
  border-color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
}

.unit-chip__val {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, monospace;
}

.unit-chip__unit {
  color: rgb(107 114 128);
  font-size: 0.75rem;
}

.unit-approx__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(55 65 81);
  margin-bottom: 0.25rem;
}

.dark .unit-approx__title {
  color: rgb(209 213 219);
}

.unit-approx__hint {
  font-size: 0.7rem;
  color: rgb(156 163 175);
  margin-bottom: 0.5rem;
}

.unit-approx__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.unit-approx__item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.5rem 0.65rem;
  border-radius: 0.5rem;
  background: rgb(249 250 251);
  color: rgb(55 65 81);
}

.dark .unit-approx__item {
  background: rgb(17 24 39);
  color: rgb(209 213 219);
}

.unit-approx__icon {
  flex-shrink: 0;
  font-size: 1.1rem;
  line-height: 1.4;
}

.unit-toggle {
  font-size: 0.8125rem;
  color: var(--el-color-primary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.unit-toggle:hover {
  text-decoration: underline;
}

:deep(.unit-row-from) {
  background: color-mix(in srgb, var(--el-color-primary) 6%, transparent) !important;
}

:deep(.unit-row-from td) {
  font-weight: 600;
}
</style>
