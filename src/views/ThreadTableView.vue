<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <section class="card-panel mb-6">
      <div class="grid gap-6 lg:grid-cols-2">
        <ThreadProfileDiagram
          :angle="activeSystemMeta?.angle ?? 60"
          :title="diagramTitle"
          :formula="diagramFormula"
          :aria="pt('diagramAria')"
          :labels="{ external: pt('externalThread'), internal: pt('internalThread') }"
        />
        <div class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <h2 class="mb-2 font-semibold">{{ pt('notationTitle') }}</h2>
          <p class="mb-2">{{ pt('notationGeneral') }}</p>
          <ul class="list-inside list-disc space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>{{ pt('notationCoarse') }}</li>
            <li>{{ pt('notationFine') }}</li>
            <li>{{ pt('notationUnc') }}</li>
            <li>{{ pt('notationPipe') }}</li>
          </ul>
          <el-alert
            v-if="pipeWarning"
            class="mt-4"
            type="warning"
            :closable="false"
            show-icon
            :title="pipeWarning"
          />
        </div>
      </div>
    </section>

    <section class="card-panel">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-semibold">{{ tableTitle }}</h2>
        <span class="text-xs text-gray-500">{{ unitLabel }}</span>
      </div>

      <el-tabs v-model="systemTab" class="mb-4">
        <el-tab-pane v-for="sys in systems" :key="sys.id" :label="systemLabel(sys.id)" :name="sys.id" />
      </el-tabs>

      <el-tabs v-if="systemTab === 'metric'" v-model="metricSubTab" class="mb-4" type="card">
        <el-tab-pane :label="pt('tabCoarse')" name="coarse" />
        <el-tab-pane :label="pt('tabFine')" name="fine" />
      </el-tabs>

      <div class="mb-4 flex flex-wrap items-center gap-3">
        <el-input
          v-model="searchQuery"
          clearable
          class="max-w-xs"
          :placeholder="pt('searchPlaceholder')"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select
          v-if="systemTab === 'metric'"
          v-model="priorityFilter"
          class="w-32"
          size="default"
        >
          <el-option :label="pt('priorityAll')" value="all" />
          <el-option label="1" :value="1" />
          <el-option label="2" :value="2" />
        </el-select>
        <span class="text-xs text-gray-500">{{ pt('rowCount', { n: filteredRows.length }) }}</span>
      </div>

      <div class="overflow-x-auto">
        <el-table :data="filteredRows" border stripe size="small" class="thread-standards-table min-w-[960px]">
          <el-table-column prop="designation" :label="pt('colDesignation')" min-width="120" fixed />
          <el-table-column
            v-if="systemTab === 'metric'"
            prop="priority"
            :label="pt('colPriority')"
            width="70"
            align="center"
          />
          <el-table-column :label="pitchColumnLabel" width="90" align="right">
            <template #default="{ row }">{{ formatPitchDisplay(row) }}</template>
          </el-table-column>
          <el-table-column :label="pt('colMajor')" width="100" align="right">
            <template #default="{ row }">{{ formatDim(row, row.major) }}</template>
          </el-table-column>
          <el-table-column :label="pt('colPitchDia')" width="100" align="right">
            <template #default="{ row }">{{ formatDim(row, row.pitchDiameter) }}</template>
          </el-table-column>
          <el-table-column :label="pt('colMinor')" width="100" align="right">
            <template #default="{ row }">{{ formatDim(row, row.minor) }}</template>
          </el-table-column>
          <el-table-column :label="pt('colTapDrill')" width="100" align="right">
            <template #default="{ row }">{{ formatDim(row, row.tapDrill) }}</template>
          </el-table-column>
          <el-table-column :label="pt('colToleranceExt')" width="80" align="center">
            <template #default="{ row }">{{ row.toleranceExternal }}</template>
          </el-table-column>
          <el-table-column :label="pt('colToleranceInt')" width="80" align="center">
            <template #default="{ row }">{{ row.toleranceInternal }}</template>
          </el-table-column>
          <el-table-column v-if="showPipeCols" :label="pt('colTaper')" width="80" align="center">
            <template #default="{ row }">{{ row.taper }}</template>
          </el-table-column>
          <el-table-column v-if="showPipeCols" :label="pt('colSealing')" min-width="100">
            <template #default="{ row }">{{ sealingLabel(row.sealing) }}</template>
          </el-table-column>
          <el-table-column :label="pt('colStandard')" min-width="110">
            <template #default="{ row }">{{ row.standardRef }}</template>
          </el-table-column>
          <el-table-column v-if="showPipeCols" :label="pt('colCompatibility')" min-width="160">
            <template #default="{ row }">
              <span v-if="row.compatibilityKey" class="text-warning text-xs">{{ compatibilityText(row.compatibilityKey) }}</span>
              <span v-else>—</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-empty v-if="!filteredRows.length" class="mt-4" :description="pt('empty')" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { THREAD_SYSTEMS, getThreadRows } from '@/constants/thread-standards'
import { filterThreadRows, formatPitchDisplay, formatDim, parseThreadDesignation } from '@/utils/thread-standards'
import ThreadProfileDiagram from '@/components/thread/ThreadProfileDiagram.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, locale } = useCalcPage('thread-table')

const systems = THREAD_SYSTEMS
const systemTab = ref('metric')
const metricSubTab = ref('coarse')
const searchQuery = ref('')
const priorityFilter = ref('all')

const activeSystemMeta = computed(() => systems.find((s) => s.id === systemTab.value))

const tableTitle = computed(() => {
  const key = `tableTitle_${systemTab.value}`
  const v = pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : pt('tableTitleDefault')
})

const unitLabel = computed(() =>
  activeSystemMeta.value?.unit === 'in' ? pt('unitIn') : pt('unitMm'),
)

const pitchColumnLabel = computed(() =>
  activeSystemMeta.value?.unit === 'in' ? pt('colTpiPitch') : pt('colPitch'),
)

const showPipeCols = computed(() => ['npt', 'g', 'r'].includes(systemTab.value))

const pipeWarning = computed(() => {
  if (!showPipeCols.value) return ''
  return pt('pipeCompatibilityWarn')
})

const diagramTitle = computed(() => {
  const id = systemTab.value
  if (id === 'metric') return pt('diagramMetric')
  if (id === 'unc' || id === 'unf') return pt('diagramUnified')
  if (id === 'npt') return pt('diagramNpt')
  if (id === 'g') return pt('diagramG')
  if (id === 'r') return pt('diagramR')
  return ''
})

const diagramFormula = computed(() => {
  if (activeSystemMeta.value?.angle === 55) return pt('formula55')
  return pt('formula60')
})

const currentRows = computed(() => {
  if (systemTab.value === 'metric') {
    return getThreadRows('metric', metricSubTab.value)
  }
  return getThreadRows(systemTab.value, systemTab.value)
})

const filteredRows = computed(() =>
  filterThreadRows(currentRows.value, {
    query: searchQuery.value,
    priority: priorityFilter.value,
  }),
)

watch(searchQuery, (q) => {
  const parsed = parseThreadDesignation(q)
  if (!parsed?.system || q.length < 3) return
  if (parsed.system === 'metric') {
    systemTab.value = 'metric'
    if (parsed.pitch) metricSubTab.value = 'fine'
  } else if (['unc', 'unf', 'npt', 'g', 'r'].includes(parsed.system)) {
    systemTab.value = parsed.system
  }
})

function systemLabel(id) {
  const key = `system_${id}`
  const v = pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : id.toUpperCase()
}

function sealingLabel(key) {
  if (!key || key === '—') return '—'
  const v = pt(`sealing_${key}`)
  return v !== `calc.pages.thread-table.sealing_${key}` ? v : key
}

function compatibilityText(key) {
  const v = pt(`compat_${key}`)
  return v !== `calc.pages.thread-table.compat_${key}` ? v : key
}
</script>

<style scoped>
.thread-standards-table :deep(.el-table__cell) {
  font-variant-numeric: tabular-nums;
}
</style>
