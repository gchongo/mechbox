<template>
  <div class="thread-standards-page">
    <header class="thread-page-header">
      <div>
        <h1 class="page-title thread-page-title">{{ pt('title') }}</h1>
        <p class="thread-page-subtitle">{{ pt('subtitle') }}</p>
      </div>
    </header>

    <div class="thread-shell card-panel">
      <aside class="thread-shell__sidebar">
        <ThreadNavSidebar
          v-model="navKey"
          :compare-count="compareIds.length"
          :pt="pt"
        />
      </aside>

      <main class="thread-shell__main">
        <header class="thread-main-header">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(crumb, i) in breadcrumbs" :key="i">
              {{ crumb }}
            </el-breadcrumb-item>
          </el-breadcrumb>
          <p class="thread-main-header__desc">{{ pageDesc }}</p>
        </header>

        <ThreadCategoryPanel
          v-if="nav.mode === 'catalog'"
          :purpose-id="nav.a"
          :selected-system-id="nav.b"
          :pt="pt"
          :compare-ids="compareIds"
          :highlight-row-id="highlightRowId"
          @row-click="openDetail"
          @toggle-compare="toggleCompare"
          @open-catalog="onDesignOpenQuery"
          @open-compare="onMisconfigCompare"
        />

        <ThreadDesignWorkbench
          v-else-if="nav.mode === 'design'"
          :model-value="nav.a"
          :pt="pt"
          @open-query="onDesignOpenQuery"
          @open-row="navigateToCatalogRow"
          @open-compare="onMisconfigCompare"
        />

        <ThreadToolsWorkbench
          v-else-if="nav.mode === 'tools'"
          :model-value="nav.a"
          :compare-ids="compareIds"
          :pt="pt"
          @update:compare-ids="compareIds = $event"
          @locate="onLocateRow"
          @open-compare="onMisconfigCompare"
        />
      </main>
    </div>

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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  resolveTaxonomyFromCatalog,
  getThreadSystemDef,
} from '@/constants/thread-standards/taxonomy'
import { getComparePresets } from '@/utils/thread-standards'
import ThreadNavSidebar from '@/components/thread/ThreadNavSidebar.vue'
import ThreadCategoryPanel from '@/components/thread/ThreadCategoryPanel.vue'
import ThreadDetailDrawer from '@/components/thread/ThreadDetailDrawer.vue'
import ThreadDesignWorkbench from '@/components/thread/ThreadDesignWorkbench.vue'
import ThreadToolsWorkbench from '@/components/thread/ThreadToolsWorkbench.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt } = useCalcPage('thread-table')

const navKey = ref('catalog|fastener|metric_coarse')

const detailVisible = ref(false)
const detailRow = ref(null)
const compareIds = ref([])
const highlightRowId = ref(null)

const nav = computed(() => {
  const [mode, a, b] = navKey.value.split('|')
  return { mode, a, b }
})

const breadcrumbs = computed(() => {
  const { mode, a, b } = nav.value
  if (mode === 'catalog') {
    const sysName = b ? pt(`ts_${b}_name`) : ''
    return [pt('navCatalog'), pt(`cat_${a}`), sysName].filter(Boolean)
  }
  if (mode === 'design') {
    const labels = {
      wizard: 'designSubWizard',
      tolerance: 'devTabTolerance',
      engagement: 'devTabEngagement',
      tapDrill: 'devTabTapDrill',
      mfg: 'devTabMfg',
    }
    return [pt('navDesign'), pt(labels[a] || 'designSubWizard')]
  }
  if (mode === 'tools') {
    const labels = {
      parse: 'tabParse',
      compare: 'tabCompare',
      misconfig: 'devTabMisconfig',
    }
    return [pt('navTools'), pt(labels[a] || 'tabParse')]
  }
  return [pt('title')]
})

const pageDesc = computed(() => {
  const { mode, a, b } = nav.value
  if (mode === 'catalog') {
    if (b) {
      const use = pt(`ts_${b}_use`)
      if (use !== `calc.pages.thread-table.ts_${b}_use`) return use
    }
    return pt(`cat_${a}_intro`)
  }
  if (mode === 'design') {
    if (a === 'wizard') return pt('designFlowHint')
    const hints = {
      tolerance: 'devTabTolerance',
      engagement: 'engIntro',
      tapDrill: 'tapIntro',
      mfg: 'mfgIntro',
    }
    const key = hints[a]
    if (key) {
      const v = pt(key)
      if (v !== `calc.pages.thread-table.${key}`) return v
    }
    return pt('designFlowHint')
  }
  if (mode === 'tools') {
    if (a === 'parse') return pt('parseIntro')
    if (a === 'compare') return pt('compareIntro')
    return pt('toolsFlowHint')
  }
  return ''
})

function setCatalogNav(purpose, systemId) {
  navKey.value = `catalog|${purpose}|${systemId}`
}

function onMisconfigCompare(presetId) {
  const preset = getComparePresets().find((p) => p.id === presetId)
  if (!preset?.rowIds?.length) return
  navKey.value = 'tools|compare'
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
  if (row.referenceOnly && ['bsw', 'bsf'].includes(row.system)) {
    const sysId = row.system === 'bsf' ? 'bsf' : row.system === 'bsw' ? 'bsw' : 'whitworth'
    setCatalogNav('fastener', sysId)
    highlightRowId.value = row.id
    openDetail(row)
    return
  }
  const taxId = resolveTaxonomyFromCatalog(row.system, row.subSeries)
  if (taxId) {
    const def = getThreadSystemDef(taxId)
    if (def) {
      setCatalogNav(def.purpose, taxId)
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
  setCatalogNav(def.purpose, taxId)
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
  @apply mb-4;
}
</style>
