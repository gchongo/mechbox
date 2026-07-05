<template>
  <div class="thread-standards-page">
    <header class="thread-page-header">
      <div>
        <h1 class="page-title thread-page-title">{{ pt('title') }}</h1>
        <p class="thread-page-subtitle">{{ pt('subtitle') }}</p>
      </div>
      <div class="thread-page-actions">
        <el-button
          v-if="compareIds.length"
          size="small"
          type="primary"
          plain
          @click="openCompare"
        >
          {{ pt('quickCompare', { n: compareIds.length }) }}
        </el-button>
        <router-link to="/thread">
          <el-button size="small" type="info" plain>{{ pt('hubStrength') }} →</el-button>
        </router-link>
      </div>
    </header>

    <nav class="thread-mode-nav" role="tablist" :aria-label="pt('navMain')">
      <button
        v-for="mode in mainModes"
        :key="mode.id"
        type="button"
        role="tab"
        class="thread-mode-card"
        :class="{ 'is-active': mainMode === mode.id }"
        :aria-selected="mainMode === mode.id"
        @click="setMainMode(mode.id)"
      >
        <span class="thread-mode-card__icon" aria-hidden="true">{{ mode.icon }}</span>
        <span class="thread-mode-card__title">{{ pt(mode.titleKey) }}</span>
        <span class="thread-mode-card__desc">{{ pt(mode.descKey) }}</span>
      </button>
    </nav>

    <section v-if="mainMode === 'catalog'" class="thread-catalog-section card-panel">
      <div class="thread-purpose-bar">
        <span class="thread-purpose-bar__label">{{ pt('catalogPurposeLabel') }}</span>
        <div class="thread-purpose-pills">
          <button
            v-for="p in purposeTabs"
            :key="p"
            type="button"
            class="thread-purpose-pill"
            :class="{ 'is-active': catalogPurpose === p }"
            @click="catalogPurpose = p"
          >
            {{ pt(`cat_${p}`) }}
          </button>
        </div>
      </div>

      <div v-if="activeSystemDef" class="thread-profile-strip">
        <ThreadProfileDiagram
          :angle="diagramAngle"
          :title="diagramTitle"
          :formula="diagramFormula"
          :aria="pt('diagramAria')"
          :labels="{ external: pt('externalThread'), internal: pt('internalThread') }"
        />
        <el-alert
          v-if="catalogPurpose === 'pipe'"
          type="warning"
          :closable="false"
          show-icon
          :title="pt('pipeCompatibilityWarn')"
        />
      </div>

      <ThreadCategoryPanel
        v-model:selected-system-id="selectedSystemByPurpose[catalogPurpose]"
        :purpose-id="catalogPurpose"
        :pt="pt"
        :compare-ids="compareIds"
        :highlight-row-id="highlightRowId"
        @row-click="openDetail"
        @toggle-compare="toggleCompare"
        @open-catalog="onDesignOpenQuery"
        @open-compare="onMisconfigCompare"
      />
    </section>

    <ThreadDesignWorkbench
      v-else-if="mainMode === 'design'"
      v-model="designSubTab"
      :pt="pt"
      @open-query="onDesignOpenQuery"
      @open-row="navigateToCatalogRow"
      @open-compare="onMisconfigCompare"
    />

    <ThreadToolsWorkbench
      v-else-if="mainMode === 'tools'"
      v-model="toolsSubTab"
      :compare-ids="compareIds"
      :compare-count="compareIds.length"
      :pt="pt"
      @update:compare-ids="compareIds = $event"
      @locate="onLocateRow"
      @open-compare="onMisconfigCompare"
    />

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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  THREAD_PURPOSE_ORDER,
  resolveTaxonomyFromCatalog,
  getThreadSystemDef,
} from '@/constants/thread-standards/taxonomy'
import { getComparePresets } from '@/utils/thread-standards'
import ThreadProfileDiagram from '@/components/thread/ThreadProfileDiagram.vue'
import ThreadCategoryPanel from '@/components/thread/ThreadCategoryPanel.vue'
import ThreadDetailDrawer from '@/components/thread/ThreadDetailDrawer.vue'
import ThreadDesignWorkbench from '@/components/thread/ThreadDesignWorkbench.vue'
import ThreadToolsWorkbench from '@/components/thread/ThreadToolsWorkbench.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt } = useCalcPage('thread-table')

const purposeTabs = THREAD_PURPOSE_ORDER
const mainMode = ref('catalog')
const catalogPurpose = ref('fastener')
const designSubTab = ref('wizard')
const toolsSubTab = ref('parse')

const selectedSystemByPurpose = reactive({
  fastener: 'metric_coarse',
  pipe: 'npt',
  power: 'tr',
  special: 'rd',
})

const detailVisible = ref(false)
const detailRow = ref(null)
const compareIds = ref([])
const highlightRowId = ref(null)

const mainModes = [
  { id: 'catalog', icon: '📋', titleKey: 'navCatalog', descKey: 'navCatalogDesc' },
  { id: 'design', icon: '🧭', titleKey: 'navDesign', descKey: 'navDesignDesc' },
  { id: 'tools', icon: '🔍', titleKey: 'navTools', descKey: 'navToolsDesc' },
]

const activeTaxonomyId = computed(() => selectedSystemByPurpose[catalogPurpose.value])

const activeSystemDef = computed(() =>
  activeTaxonomyId.value ? getThreadSystemDef(activeTaxonomyId.value) : null,
)

const diagramAngle = computed(() => activeSystemDef.value?.diagramAngle ?? 60)

const diagramTitle = computed(() => {
  if (!activeTaxonomyId.value) return ''
  return pt(`ts_${activeTaxonomyId.value}_name`)
})

const diagramFormula = computed(() => {
  if (activeSystemDef.value?.angle === 55) return pt('formula55')
  if (activeSystemDef.value?.profile === 'trapezoidal') return pt('formulaTrapezoidal')
  return pt('formula60')
})

function setMainMode(mode) {
  mainMode.value = mode
}

function openCompare() {
  mainMode.value = 'tools'
  toolsSubTab.value = 'compare'
}

function onMisconfigCompare(presetId) {
  const preset = getComparePresets().find((p) => p.id === presetId)
  if (!preset?.rowIds?.length) return
  mainMode.value = 'tools'
  toolsSubTab.value = 'compare'
  compareIds.value = preset.rowIds.slice(0, 3)
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

function navigateToCatalogRow(row) {
  mainMode.value = 'catalog'
  if (row.referenceOnly && ['bsw', 'bsf'].includes(row.system)) {
    catalogPurpose.value = 'fastener'
    selectedSystemByPurpose.fastener = row.system === 'bsf' ? 'bsf' : row.system === 'bsw' ? 'bsw' : 'whitworth'
    highlightRowId.value = row.id
    openDetail(row)
    return
  }
  const taxId = resolveTaxonomyFromCatalog(row.system, row.subSeries)
  if (taxId) {
    const def = getThreadSystemDef(taxId)
    if (def) {
      catalogPurpose.value = def.purpose
      selectedSystemByPurpose[def.purpose] = taxId
    }
  }
  highlightRowId.value = row.id
  openDetail(row)
}

function onLocateRow(row) {
  navigateToCatalogRow(row)
}

function onDesignOpenQuery({ system, subSeries }) {
  const taxId = resolveTaxonomyFromCatalog(system, subSeries)
  if (!taxId) return
  const def = getThreadSystemDef(taxId)
  if (!def) return
  mainMode.value = 'catalog'
  catalogPurpose.value = def.purpose
  selectedSystemByPurpose[def.purpose] = taxId
  highlightRowId.value = ''
}
</script>

<style scoped>
.thread-page-title {
  @apply mb-2;
}

.thread-page-subtitle {
  @apply text-sm text-gray-600 dark:text-gray-400;
}

.thread-page-header {
  @apply mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between;
}

.thread-page-actions {
  @apply flex shrink-0 flex-wrap gap-2;
}

.thread-profile-strip {
  @apply mb-6 grid gap-4 lg:grid-cols-2;
}

.thread-purpose-bar {
  @apply mb-6 flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-700 sm:flex-row sm:items-center;
}

.thread-purpose-bar__label {
  @apply shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500;
}
</style>
