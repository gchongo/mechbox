<template>
  <div class="thread-catalog-table">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 class="font-semibold">{{ tableTitle }}</h3>
      <div class="flex flex-wrap items-center gap-2">
        <template v-if="isImperialSeries">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('displayUnit') }}</span>
          <el-radio-group v-model="displayUnit" size="small">
            <el-radio-button value="in">{{ pt('displayUnitIn') }}</el-radio-button>
            <el-radio-button value="mm">{{ pt('displayUnitMm') }}</el-radio-button>
          </el-radio-group>
        </template>
        <span v-else class="text-xs text-gray-500 dark:text-gray-400">{{ unitLabel }}</span>
      </div>
    </div>

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
        v-if="catalogSystem === 'metric'"
        v-model="priorityFilter"
        class="w-32"
      >
        <el-option :label="pt('priorityAll')" value="all" />
        <el-option label="1" :value="1" />
        <el-option label="2" :value="2" />
      </el-select>
      <template v-if="showTpiFilter">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('filterTpi') }}</span>
        <el-input-number v-model="tpiMin" :min="1" :step="1" :precision="0" controls-position="right" class="w-24" />
        <span class="text-gray-400">–</span>
        <el-input-number v-model="tpiMax" :min="1" :step="1" :precision="0" controls-position="right" class="w-24" />
      </template>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('rowCount', { n: filteredRows.length }) }}</span>
    </div>

    <ThreadPitchTool v-if="showPitchTool" :pt="pt" />

    <div ref="tableHostRef" class="thread-table-scroll">
      <el-table
        ref="tableRef"
        :data="filteredRows"
        :max-height="tableMaxHeight"
        border
        stripe
        size="small"
        class="thread-data-table cursor-pointer"
        highlight-current-row
        :row-class-name="rowClassName"
        @row-click="(row) => $emit('row-click', row)"
      >
        <el-table-column prop="designation" :min-width="THREAD_TABLE_COL.designation">
          <template #header>
            <ThreadFieldTip :label="pt('colDesignation')" :tip="pt('term_designation')" />
          </template>
        </el-table-column>
        <el-table-column v-if="catalogSystem === 'metric'" prop="priority" :min-width="THREAD_TABLE_COL.priority">
          <template #header>
            <ThreadFieldTip :label="pt('colPriority')" :tip="pt('term_priority')" />
          </template>
        </el-table-column>
        <!-- Imperial: TPI and pitch as separate columns -->
        <template v-if="isImperialSeries">
          <el-table-column :min-width="THREAD_TABLE_COL.tpi">
            <template #header>
              <ThreadFieldTip :label="pt('colTpi')" :tip="pt('term_tpi')" />
            </template>
            <template #default="{ row }">{{ row.tpi != null ? row.tpi : '—' }}</template>
          </el-table-column>
          <el-table-column :min-width="THREAD_TABLE_COL.pitch">
            <template #header>
              <ThreadFieldTip :label="pitchLengthColumnLabel" :tip="pt('term_pitch')" />
            </template>
            <template #default="{ row }">{{ formatPitchLength(row, displayUnit) }}</template>
          </el-table-column>
        </template>
        <el-table-column v-else :min-width="THREAD_TABLE_COL.pitch">
          <template #header>
            <ThreadFieldTip :label="pt('colPitch')" :tip="pt('term_pitch')" />
          </template>
          <template #default="{ row }">{{ formatPitchDisplay(row) }}</template>
        </el-table-column>
        <el-table-column :min-width="THREAD_TABLE_COL.dim">
          <template #header>
            <ThreadFieldTip :label="pt('colMajor')" :tip="pt('term_major')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.major, displayUnit) }}</template>
        </el-table-column>
        <el-table-column :min-width="THREAD_TABLE_COL.dim">
          <template #header>
            <ThreadFieldTip :label="pt('colPitchDia')" :tip="pt('term_pitchDia')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.pitchDiameter, displayUnit) }}</template>
        </el-table-column>
        <el-table-column :min-width="THREAD_TABLE_COL.dim">
          <template #header>
            <ThreadFieldTip :label="pt('colMinor')" :tip="pt('term_minor')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.minor, displayUnit) }}</template>
        </el-table-column>
        <el-table-column v-if="showTapCol" :min-width="THREAD_TABLE_COL.dim">
          <template #header>
            <ThreadFieldTip :label="pt('colTapDrill')" :tip="pt('term_tapDrill')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.tapDrill, displayUnit) }}</template>
        </el-table-column>
        <el-table-column v-if="showToleranceCol" :min-width="THREAD_TABLE_COL.tolerancePair">
          <template #header>
            <ThreadFieldTip :label="pt('colTolerancePair')" :tip="pt('term_tolerancePair')" />
          </template>
          <template #default="{ row }">{{ tolerancePair(row) }}</template>
        </el-table-column>
        <el-table-column v-if="showPipeCols" prop="taper" :min-width="THREAD_TABLE_COL.taper">
          <template #header>
            <ThreadFieldTip :label="pt('colTaper')" :tip="pt('term_taper')" />
          </template>
        </el-table-column>
        <el-table-column v-if="showPipeCols" :min-width="THREAD_TABLE_COL.sealing">
          <template #header>
            <ThreadFieldTip :label="pt('colSealing')" :tip="pt('term_sealing')" />
          </template>
          <template #default="{ row }">{{ sealingLabel(row.sealing) }}</template>
        </el-table-column>
        <el-table-column
          :min-width="THREAD_TABLE_COL.actionIcon"
          :width="THREAD_TABLE_COL.actionIcon"
          align="center"
          fixed="right"
          class-name="thread-col-action"
        >
          <template #header><span aria-hidden="true">+</span></template>
          <template #default="{ row }">
            <el-button
              size="small"
              circle
              :type="compareIds.includes(row.id) ? 'success' : 'primary'"
              plain
              :aria-label="compareIds.includes(row.id) ? pt('inCompare') : pt('addToCompare')"
              @click.stop="$emit('toggle-compare', row)"
            >
              <el-icon><component :is="compareIds.includes(row.id) ? Check : Plus" /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty v-if="!filteredRows.length" class="mt-4" :description="pt('empty')" />
    <p class="mt-4 text-[10px] text-gray-400">{{ pt('dataDisclaimer') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Search, Plus, Check } from '@element-plus/icons-vue'
import { getThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import { filterThreadRows, formatPitchDisplay, formatPitchLength, formatDim } from '@/utils/thread-standards'
import { THREAD_TABLE_COL } from '@/constants/thread-table-columns'
import { useThreadTableMaxHeight } from '@/utils/thread-table-layout'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'
import ThreadPitchTool from '@/components/thread/ThreadPitchTool.vue'

const props = defineProps({
  catalogSystem: { type: String, required: true },
  catalogSubTab: { type: String, required: true },
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
  highlightRowId: { type: String, default: '' },
})

const emit = defineEmits(['row-click', 'toggle-compare', 'display-unit-change'])

const searchQuery = ref('')
const priorityFilter = ref('all')
const tpiMin = ref(null)
const tpiMax = ref(null)
const displayUnit = ref('in')
const tableRef = ref(null)
const tableHostRef = ref(null)
const { maxHeight: tableMaxHeight, updateMaxHeight } = useThreadTableMaxHeight(tableHostRef, { min: 320, gap: 24 })

const DISPLAY_UNIT_KEY = 'mechbox-thread-imperial-display-unit'

function loadDisplayUnit() {
  try {
    const saved = localStorage.getItem(DISPLAY_UNIT_KEY)
    if (saved === 'in' || saved === 'mm') displayUnit.value = saved
  } catch {
    /* ignore */
  }
}

loadDisplayUnit()

watch(displayUnit, (u) => {
  try {
    localStorage.setItem(DISPLAY_UNIT_KEY, u)
  } catch {
    /* ignore */
  }
  emit('display-unit-change', u)
})

function layoutTable() {
  nextTick(() => {
    updateMaxHeight()
    tableRef.value?.doLayout?.()
  })
}

const activeMeta = computed(() => THREAD_SYSTEMS.find((s) => s.id === props.catalogSystem))

const isImperialSeries = computed(() => activeMeta.value?.unit === 'in')

const tableTitle = computed(() => {
  const key = `tableTitle_${props.catalogSystem}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : props.pt('tableTitleDefault')
})

const unitLabel = computed(() =>
  activeMeta.value?.unit === 'in' ? props.pt('unitIn') : props.pt('unitMm'),
)

const pitchLengthColumnLabel = computed(() =>
  displayUnit.value === 'mm' ? props.pt('colPitchMm') : props.pt('colPitchIn'),
)

const showTpiFilter = computed(() => ['unc', 'unf', 'unef', 'npt', 'nptf', 'acme'].includes(props.catalogSystem))
const showPipeCols = computed(() => ['npt', 'nptf', 'g', 'r'].includes(props.catalogSystem))
const showTapCol = computed(() => !showPipeCols.value)
const showPitchTool = computed(() => ['metric', 'tr', 'unc', 'unf', 'unef', 'acme'].includes(props.catalogSystem))

const currentRows = computed(() =>
  getThreadRows(props.catalogSystem, props.catalogSubTab),
)

const filteredRows = computed(() =>
  filterThreadRows(currentRows.value, {
    query: searchQuery.value,
    priority: priorityFilter.value,
    tpiMin: tpiMin.value,
    tpiMax: tpiMax.value,
  }),
)

function rowHasTolerance(row) {
  const ext = row.toleranceExternal
  const int = row.toleranceInternal
  return (ext && ext !== '—') || (int && int !== '—')
}

/** Hide blank tolerance column (e.g. NPT/G/R pipe series). */
const showToleranceCol = computed(() => filteredRows.value.some(rowHasTolerance))

watch(filteredRows, layoutTable)

watch(tableMaxHeight, layoutTable)

watch(showToleranceCol, layoutTable)

onMounted(() => {
  layoutTable()
  if (isImperialSeries.value) emit('display-unit-change', displayUnit.value)
})

watch(
  () => [props.catalogSystem, props.catalogSubTab],
  () => {
    searchQuery.value = ''
    priorityFilter.value = 'all'
    tpiMin.value = null
    tpiMax.value = null
    if (isImperialSeries.value) emit('display-unit-change', displayUnit.value)
    layoutTable()
  },
)

function sealingLabel(key) {
  if (!key || key === '—') return '—'
  const v = props.pt(`sealing_${key}`)
  return v !== `calc.pages.thread-table.sealing_${key}` ? v : key
}

function tolerancePair(row) {
  const ext = row.toleranceExternal
  const int = row.toleranceInternal
  if ((!ext || ext === '—') && (!int || int === '—')) return '—'
  if (!ext || ext === '—') return int
  if (!int || int === '—') return ext
  return `${ext}/${int}`
}

function rowClassName({ row }) {
  return row.id === props.highlightRowId ? 'thread-row-highlight' : ''
}
</script>

<style scoped>
.thread-data-table :deep(.thread-row-highlight) {
  background-color: rgb(64 158 255 / 0.08) !important;
}
</style>
