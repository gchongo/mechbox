<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <section class="card-panel mb-6 thread-workflow-hub">
      <h2 class="mb-2 text-sm font-semibold">{{ pt('hubTitle') }}</h2>
      <p class="mb-3 text-xs text-gray-500">{{ pt('hubIntro') }}</p>
      <div class="flex flex-wrap gap-2">
        <el-button
          v-for="step in hubSteps"
          :key="`${step.featureTab}-${step.devTab || ''}`"
          size="small"
          :type="isHubActive(step) ? 'primary' : 'default'"
          @click="goHub(step)"
        >
          {{ pt(step.labelKey) }}
        </el-button>
        <router-link to="/thread">
          <el-button size="small" type="info" plain>{{ pt('hubStrength') }} →</el-button>
        </router-link>
      </div>
    </section>

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
      <el-tabs v-model="featureTab" class="mb-4">
        <el-tab-pane :label="pt('tabQuery')" name="query" />
        <el-tab-pane :label="pt('tabParse')" name="parse" />
        <el-tab-pane :label="pt('tabCompare')" name="compare">
          <template #label>
            <span>{{ pt('tabCompare') }}</span>
            <el-badge v-if="compareIds.length" :value="compareIds.length" class="ml-1" />
          </template>
        </el-tab-pane>
        <el-tab-pane :label="pt('tabDesign')" name="design" />
        <el-tab-pane :label="pt('tabDev')" name="dev" />
      </el-tabs>

      <template v-if="featureTab === 'dev'">
        <el-tabs v-model="devTab" class="mb-4" type="card">
          <el-tab-pane :label="pt('devTabEngagement')" name="engagement" />
          <el-tab-pane :label="pt('devTabTolerance')" name="tolerance" />
          <el-tab-pane :label="pt('devTabTapDrill')" name="tapDrill" />
          <el-tab-pane :label="pt('devTabMisconfig')" name="misconfig" />
          <el-tab-pane :label="pt('devTabMfg')" name="mfg" />
        </el-tabs>
        <ThreadEngagementPanel v-if="devTab === 'engagement'" :pt="pt" />
        <ThreadToleranceGuide v-else-if="devTab === 'tolerance'" :pt="pt" />
        <ThreadTapDrillPanel v-else-if="devTab === 'tapDrill'" :pt="pt" />
        <ThreadMisconfigPanel
          v-else-if="devTab === 'misconfig'"
          :pt="pt"
          @open-compare="onMisconfigCompare"
        />
        <ThreadManufacturingPanel v-else-if="devTab === 'mfg'" :pt="pt" />
      </template>

      <ThreadDesignWizard
        v-else-if="featureTab === 'design'"
        :pt="pt"
        @open-query="onDesignOpenQuery"
        @open-row="openDetailRow"
      />

      <ThreadParsePanel
        v-else-if="featureTab === 'parse'"
        :pt="pt"
        @locate="onLocateRow"
      />

      <ThreadComparePanel
        v-else-if="featureTab === 'compare'"
        v-model="compareIds"
        :pt="pt"
      />

      <template v-else-if="featureTab === 'query'">
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
          <template v-if="showDiameterFilter">
            <span class="text-xs text-gray-500">{{ pt('filterDiameter') }}</span>
            <el-input-number
              v-model="diameterMin"
              :min="0"
              :step="filterStep"
              :precision="filterPrecision"
              controls-position="right"
              class="w-28"
              :placeholder="pt('filterMin')"
            />
            <span class="text-gray-400">–</span>
            <el-input-number
              v-model="diameterMax"
              :min="0"
              :step="filterStep"
              :precision="filterPrecision"
              controls-position="right"
              class="w-28"
              :placeholder="pt('filterMax')"
            />
            <span class="text-xs text-gray-400">{{ filterUnitLabel }}</span>
          </template>
          <template v-if="showTpiFilter">
            <span class="text-xs text-gray-500">{{ pt('filterTpi') }}</span>
            <el-input-number
              v-model="tpiMin"
              :min="1"
              :step="1"
              :precision="0"
              controls-position="right"
              class="w-24"
              :placeholder="pt('filterMin')"
            />
            <span class="text-gray-400">–</span>
            <el-input-number
              v-model="tpiMax"
              :min="1"
              :step="1"
              :precision="0"
              controls-position="right"
              class="w-24"
              :placeholder="pt('filterMax')"
            />
          </template>
          <el-button v-if="hasActiveFilters" size="small" link type="primary" @click="clearFilters">
            {{ pt('filterClear') }}
          </el-button>
          <span class="text-xs text-gray-500">{{ pt('rowCount', { n: filteredRows.length }) }}</span>
          <span class="text-xs text-gray-400">{{ pt('clickRowHint') }}</span>
        </div>

        <ThreadPitchTool :pt="pt" />

        <div class="overflow-x-auto">
          <el-table
            :data="filteredRows"
            border
            stripe
            size="small"
            class="thread-standards-table min-w-[960px] cursor-pointer"
            highlight-current-row
            :row-class-name="rowClassName"
            @row-click="openDetail"
          >
            <el-table-column prop="designation" min-width="120" fixed>
              <template #header>
                <ThreadFieldTip :label="pt('colDesignation')" :tip="pt('term_designation')" />
              </template>
            </el-table-column>
            <el-table-column
              v-if="systemTab === 'metric'"
              prop="priority"
              width="70"
              align="center"
            >
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
            <el-table-column width="100" align="right">
              <template #header>
                <ThreadFieldTip :label="pt('colTapDrill')" :tip="pt('term_tapDrill')" />
              </template>
              <template #default="{ row }">{{ formatDim(row, row.tapDrill) }}</template>
            </el-table-column>
            <el-table-column width="80" align="center">
              <template #header>
                <ThreadFieldTip :label="pt('colToleranceExt')" :tip="pt('term_toleranceExt')" />
              </template>
              <template #default="{ row }">{{ row.toleranceExternal }}</template>
            </el-table-column>
            <el-table-column width="80" align="center">
              <template #header>
                <ThreadFieldTip :label="pt('colToleranceInt')" :tip="pt('term_toleranceInt')" />
              </template>
              <template #default="{ row }">{{ row.toleranceInternal }}</template>
            </el-table-column>
            <el-table-column v-if="showPipeCols" width="80" align="center">
              <template #header>
                <ThreadFieldTip :label="pt('colTaper')" :tip="pt('term_taper')" />
              </template>
              <template #default="{ row }">{{ row.taper }}</template>
            </el-table-column>
            <el-table-column v-if="showPipeCols" min-width="100">
              <template #header>
                <ThreadFieldTip :label="pt('colSealing')" :tip="pt('term_sealing')" />
              </template>
              <template #default="{ row }">{{ sealingLabel(row.sealing) }}</template>
            </el-table-column>
            <el-table-column min-width="110">
              <template #header>
                <ThreadFieldTip :label="pt('colStandard')" :tip="pt('term_standard')" />
              </template>
              <template #default="{ row }">{{ row.standardRef }}</template>
            </el-table-column>
            <el-table-column v-if="showPipeCols" :label="pt('colCompatibility')" min-width="160">
              <template #default="{ row }">
                <span v-if="row.compatibilityKey" class="text-warning text-xs">{{ compatibilityText(row.compatibilityKey) }}</span>
                <span v-else>—</span>
              </template>
            </el-table-column>
            <el-table-column :label="pt('colActions')" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click.stop="toggleCompare(row)">
                  {{ compareIds.includes(row.id) ? pt('inCompare') : pt('addToCompare') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-empty v-if="!filteredRows.length" class="mt-4" :description="pt('empty')" />

        <p class="mt-4 text-[10px] text-gray-400">{{ pt('dataDisclaimer') }}</p>
      </template>
    </section>

    <ThreadDetailDrawer
      :visible="detailVisible"
      :row="detailRow"
      :pt="pt"
      @close="detailVisible = false"
      @select-row="openDetailRow"
      @add-compare="addToCompare"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { THREAD_SYSTEMS, getThreadRows } from '@/constants/thread-standards'
import {
  filterThreadRows,
  formatPitchDisplay,
  formatDim,
  parseThreadMark,
} from '@/utils/thread-standards'
import ThreadProfileDiagram from '@/components/thread/ThreadProfileDiagram.vue'
import ThreadDetailDrawer from '@/components/thread/ThreadDetailDrawer.vue'
import ThreadParsePanel from '@/components/thread/ThreadParsePanel.vue'
import ThreadComparePanel from '@/components/thread/ThreadComparePanel.vue'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'
import ThreadPitchTool from '@/components/thread/ThreadPitchTool.vue'
import ThreadDesignWizard from '@/components/thread/ThreadDesignWizard.vue'
import ThreadEngagementPanel from '@/components/thread/ThreadEngagementPanel.vue'
import ThreadTapDrillPanel from '@/components/thread/ThreadTapDrillPanel.vue'
import ThreadToleranceGuide from '@/components/thread/ThreadToleranceGuide.vue'
import ThreadMisconfigPanel from '@/components/thread/ThreadMisconfigPanel.vue'
import ThreadManufacturingPanel from '@/components/thread/ThreadManufacturingPanel.vue'
import { getComparePresets } from '@/utils/thread-standards'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt } = useCalcPage('thread-table')

const systems = THREAD_SYSTEMS
const featureTab = ref('query')
const devTab = ref('engagement')
const systemTab = ref('metric')
const metricSubTab = ref('coarse')
const searchQuery = ref('')
const priorityFilter = ref('all')
const diameterMin = ref(null)
const diameterMax = ref(null)
const tpiMin = ref(null)
const tpiMax = ref(null)
const detailVisible = ref(false)
const detailRow = ref(null)
const compareIds = ref([])
const highlightRowId = ref(null)

const hubSteps = [
  { labelKey: 'hubStepDesign', featureTab: 'design', devTab: null },
  { labelKey: 'hubStepTolerance', featureTab: 'dev', devTab: 'tolerance' },
  { labelKey: 'hubStepEngagement', featureTab: 'dev', devTab: 'engagement' },
  { labelKey: 'hubStepTap', featureTab: 'dev', devTab: 'tapDrill' },
  { labelKey: 'hubStepQuery', featureTab: 'query', devTab: null },
  { labelKey: 'hubStepMisconfig', featureTab: 'dev', devTab: 'misconfig' },
]

function isHubActive(step) {
  if (step.featureTab !== featureTab.value) return false
  if (step.devTab) return devTab.value === step.devTab
  return true
}

function goHub(step) {
  featureTab.value = step.featureTab
  if (step.devTab) devTab.value = step.devTab
}

function onMisconfigCompare(presetId) {
  const preset = getComparePresets().find((p) => p.id === presetId)
  if (!preset?.rowIds?.length) return
  featureTab.value = 'compare'
  compareIds.value = preset.rowIds.slice(0, 3)
}

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

const pitchTermTip = computed(() =>
  activeSystemMeta.value?.unit === 'in' ? pt('term_tpi') : pt('term_pitch'),
)

const showDiameterFilter = computed(() => true)

const showTpiFilter = computed(() => ['unc', 'unf', 'npt'].includes(systemTab.value))

const filterStep = computed(() => (systemTab.value === 'metric' ? 1 : 0.0625))

const filterPrecision = computed(() => (systemTab.value === 'metric' ? 1 : 3))

const filterUnitLabel = computed(() =>
  systemTab.value === 'metric' ? 'mm' : 'in',
)

const hasActiveFilters = computed(
  () =>
    diameterMin.value != null ||
    diameterMax.value != null ||
    tpiMin.value != null ||
    tpiMax.value != null,
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
    diameterMin: diameterMin.value,
    diameterMax: diameterMax.value,
    tpiMin: tpiMin.value,
    tpiMax: tpiMax.value,
  }),
)

watch(systemTab, () => {
  diameterMin.value = null
  diameterMax.value = null
  tpiMin.value = null
  tpiMax.value = null
})

function clearFilters() {
  diameterMin.value = null
  diameterMax.value = null
  tpiMin.value = null
  tpiMax.value = null
}

watch(searchQuery, (q) => {
  const parsed = parseThreadMark(q)
  if (!parsed?.system || q.length < 2) return
  if (parsed.system === 'metric') {
    systemTab.value = 'metric'
    metricSubTab.value = parsed.pitch ? 'fine' : 'coarse'
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

function openDetail(row) {
  detailRow.value = row
  detailVisible.value = true
}

function openDetailRow(row) {
  detailRow.value = row
  detailVisible.value = true
}

function addToCompare(row) {
  if (compareIds.value.includes(row.id)) return
  if (compareIds.value.length >= 3) {
    ElMessage.warning(pt('compareMax'))
    return
  }
  compareIds.value = [...compareIds.value, row.id]
  ElMessage.success(pt('compareAdded'))
}

function toggleCompare(row) {
  if (compareIds.value.includes(row.id)) {
    compareIds.value = compareIds.value.filter((id) => id !== row.id)
  } else {
    addToCompare(row)
  }
}

function onLocateRow(row) {
  featureTab.value = 'query'
  systemTab.value = row.system
  if (row.system === 'metric') {
    metricSubTab.value = row.subSeries === 'fine' ? 'fine' : 'coarse'
  }
  searchQuery.value = row.designation
  highlightRowId.value = row.id
  openDetail(row)
}

function onDesignOpenQuery({ system, subSeries }) {
  if (!system) return
  featureTab.value = 'query'
  systemTab.value = system
  if (system === 'metric') {
    metricSubTab.value = subSeries === 'fine' ? 'fine' : 'coarse'
  }
  searchQuery.value = ''
  priorityFilter.value = 1
  clearFilters()
}

function rowClassName({ row }) {
  return row.id === highlightRowId.value ? 'thread-row-highlight' : ''
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
