<template>
  <div class="thread-catalog-table">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 class="font-semibold">{{ tableTitle }}</h3>
      <span class="text-xs text-gray-500">{{ unitLabel }}</span>
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
        <span class="text-xs text-gray-500">{{ pt('filterTpi') }}</span>
        <el-input-number v-model="tpiMin" :min="1" :step="1" :precision="0" controls-position="right" class="w-24" />
        <span class="text-gray-400">–</span>
        <el-input-number v-model="tpiMax" :min="1" :step="1" :precision="0" controls-position="right" class="w-24" />
      </template>
      <span class="text-xs text-gray-500">{{ pt('rowCount', { n: filteredRows.length }) }}</span>
    </div>

    <ThreadPitchTool v-if="showPitchTool" :pt="pt" />

    <div class="thread-table-scroll">
      <el-table
        :data="filteredRows"
        border
        stripe
        size="small"
        class="thread-standards-table thread-sticky-header-table min-w-[960px] cursor-pointer"
        highlight-current-row
        :row-class-name="rowClassName"
        @row-click="(row) => $emit('row-click', row)"
      >
        <el-table-column prop="designation" min-width="120" fixed>
          <template #header>
            <ThreadFieldTip :label="pt('colDesignation')" :tip="pt('term_designation')" />
          </template>
        </el-table-column>
        <el-table-column v-if="catalogSystem === 'metric'" prop="priority" width="70" align="center">
          <template #header>
            <ThreadFieldTip :label="pt('colPriority')" :tip="pt('term_priority')" />
          </template>
        </el-table-column>
        <el-table-column width="90" align="right">
          <template #header>
            <ThreadFieldTip :label="pitchColumnLabel" :tip="pitchTermTip" />
          </template>
          <template #default="{ row }">{{ formatPitchDisplay(row) }}</template>
        </el-table-column>
        <el-table-column width="100" align="right">
          <template #header>
            <ThreadFieldTip :label="pt('colMajor')" :tip="pt('term_major')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.major) }}</template>
        </el-table-column>
        <el-table-column width="100" align="right">
          <template #header>
            <ThreadFieldTip :label="pt('colPitchDia')" :tip="pt('term_pitchDia')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.pitchDiameter) }}</template>
        </el-table-column>
        <el-table-column width="100" align="right">
          <template #header>
            <ThreadFieldTip :label="pt('colMinor')" :tip="pt('term_minor')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.minor) }}</template>
        </el-table-column>
        <el-table-column v-if="showTapCol" width="100" align="right">
          <template #header>
            <ThreadFieldTip :label="pt('colTapDrill')" :tip="pt('term_tapDrill')" />
          </template>
          <template #default="{ row }">{{ formatDim(row, row.tapDrill) }}</template>
        </el-table-column>
        <el-table-column width="80" align="center" prop="toleranceExternal">
          <template #header>
            <ThreadFieldTip :label="pt('colToleranceExt')" :tip="pt('term_toleranceExt')" />
          </template>
        </el-table-column>
        <el-table-column width="80" align="center" prop="toleranceInternal">
          <template #header>
            <ThreadFieldTip :label="pt('colToleranceInt')" :tip="pt('term_toleranceInt')" />
          </template>
        </el-table-column>
        <el-table-column v-if="showPipeCols" width="80" align="center" prop="taper">
          <template #header>
            <ThreadFieldTip :label="pt('colTaper')" :tip="pt('term_taper')" />
          </template>
        </el-table-column>
        <el-table-column v-if="showPipeCols" min-width="100">
          <template #header>
            <ThreadFieldTip :label="pt('colSealing')" :tip="pt('term_sealing')" />
          </template>
          <template #default="{ row }">{{ sealingLabel(row.sealing) }}</template>
        </el-table-column>
        <el-table-column min-width="110" prop="standardRef">
          <template #header>
            <ThreadFieldTip :label="pt('colStandard')" :tip="pt('term_standard')" />
          </template>
        </el-table-column>
        <el-table-column :label="pt('colActions')" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click.stop="$emit('toggle-compare', row)">
              {{ compareIds.includes(row.id) ? pt('inCompare') : pt('addToCompare') }}
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
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import { filterThreadRows, formatPitchDisplay, formatDim } from '@/utils/thread-standards'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'
import ThreadPitchTool from '@/components/thread/ThreadPitchTool.vue'

const props = defineProps({
  catalogSystem: { type: String, required: true },
  catalogSubTab: { type: String, required: true },
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
  highlightRowId: { type: String, default: '' },
})

defineEmits(['row-click', 'toggle-compare'])

const searchQuery = ref('')
const priorityFilter = ref('all')
const tpiMin = ref(null)
const tpiMax = ref(null)

const activeMeta = computed(() => THREAD_SYSTEMS.find((s) => s.id === props.catalogSystem))

const tableTitle = computed(() => {
  const key = `tableTitle_${props.catalogSystem}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : props.pt('tableTitleDefault')
})

const unitLabel = computed(() =>
  activeMeta.value?.unit === 'in' ? props.pt('unitIn') : props.pt('unitMm'),
)

const pitchColumnLabel = computed(() =>
  activeMeta.value?.unit === 'in' ? props.pt('colTpiPitch') : props.pt('colPitch'),
)

const pitchTermTip = computed(() =>
  activeMeta.value?.unit === 'in' ? props.pt('term_tpi') : props.pt('term_pitch'),
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

watch(
  () => [props.catalogSystem, props.catalogSubTab],
  () => {
    searchQuery.value = ''
    priorityFilter.value = 'all'
    tpiMin.value = null
    tpiMax.value = null
  },
)

function sealingLabel(key) {
  if (!key || key === '—') return '—'
  const v = props.pt(`sealing_${key}`)
  return v !== `calc.pages.thread-table.sealing_${key}` ? v : key
}

function rowClassName({ row }) {
  return row.id === props.highlightRowId ? 'thread-row-highlight' : ''
}
</script>

<style scoped>
.thread-standards-table :deep(.el-table__cell) {
  font-variant-numeric: tabular-nums;
}
.thread-standards-table :deep(.thread-row-highlight) {
  background-color: rgb(64 158 255 / 0.08) !important;
}
</style>
