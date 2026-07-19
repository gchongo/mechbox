<template>
  <div class="thread-standards-page">
    <header class="thread-page-header">
      <div>
        <h1 class="page-title thread-page-title">{{ pt('title') }}</h1>
      </div>
      <div class="thread-page-actions">
        <el-button size="small" plain @click="copyShareLink">
          {{ pt('shareLink') }}
        </el-button>
      </div>
    </header>

    <div class="thread-shell card-panel">
      <aside class="thread-shell__sidebar thread-shell__sidebar--desktop">
        <ThreadNavSidebar
          v-model="navKey"
          :compare-count="compareIds.length"
          :favorite-items="favoriteItems"
          :pt="pt"
          @open-favorite="onOpenFavorite"
        />
      </aside>

      <main class="thread-shell__main">
        <header class="thread-main-header">
          <div class="thread-main-header__top">
            <el-button
              class="thread-mobile-nav-btn lg:hidden"
              size="small"
              type="primary"
              plain
              @click="mobileNavOpen = true"
            >
              {{ pt('mobileNavOpen') }}
            </el-button>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="(crumb, i) in breadcrumbs" :key="i">
                {{ crumb }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
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
          @display-unit-change="imperialDisplayUnit = $event"
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

    <el-drawer
      v-model="mobileNavOpen"
      :title="pt('mobileNavTitle')"
      direction="ltr"
      size="min(300px, 88vw)"
      class="thread-mobile-drawer lg:hidden"
    >
      <ThreadNavSidebar
        v-model="navKey"
        :compare-count="compareIds.length"
        :favorite-items="favoriteItems"
        :pt="pt"
        @open-favorite="onOpenFavorite"
        @nav-selected="mobileNavOpen = false"
      />
    </el-drawer>

    <ThreadDetailDrawer
      :visible="detailVisible"
      :row="detailRow"
      :pt="pt"
      :display-unit="imperialDisplayUnit"
      @close="detailVisible = false"
      @select-row="openDetailRow"
      @add-compare="addToCompare"
      @favorite-changed="refreshFavorites"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  resolveTaxonomyFromCatalog,
  getThreadSystemDef,
} from '@/constants/thread-standards/taxonomy'
import { getAllThreadRows } from '@/constants/thread-standards'
import { getComparePresets } from '@/utils/thread-standards'
import {
  navKeyFromQuery,
  compareIdsFromQuery,
  highlightFromQuery,
  buildThreadTableQuery,
  threadTableQueryEquals,
} from '@/utils/thread-table-route'
import { getThreadFavorites } from '@/utils/thread-favorites'
import ThreadNavSidebar from '@/components/thread/ThreadNavSidebar.vue'
import ThreadCategoryPanel from '@/components/thread/ThreadCategoryPanel.vue'
import ThreadDetailDrawer from '@/components/thread/ThreadDetailDrawer.vue'
import ThreadDesignWorkbench from '@/components/thread/ThreadDesignWorkbench.vue'
import ThreadToolsWorkbench from '@/components/thread/ThreadToolsWorkbench.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt } = useCalcPage('thread-table')
const route = useRoute()
const router = useRouter()

const navKey = ref('catalog|fastener|metric_coarse')
const detailVisible = ref(false)
const detailRow = ref(null)
const compareIds = ref([])
const imperialDisplayUnit = ref('in')
const highlightRowId = ref(null)
const mobileNavOpen = ref(false)
const favoritesVersion = ref(0)
const syncingFromRoute = ref(false)

const nav = computed(() => {
  const [mode, a, b] = navKey.value.split('|')
  return { mode, a, b }
})

const favoriteItems = computed(() => {
  favoritesVersion.value
  const ids = getThreadFavorites()
  const rows = getAllThreadRows()
  return ids
    .map((id) => {
      const row = rows.find((r) => r.id === id)
      return row ? { id: row.id, label: row.designation } : null
    })
    .filter(Boolean)
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
      glossary: 'tabGlossary',
    }
    return [pt('navTools'), pt(labels[a] || 'tabParse')]
  }
  return [pt('title')]
})

function currentRouteQuerySlice() {
  return buildThreadTableQuery({
    navKey: navKeyFromQuery(route.query),
    compareIds: compareIdsFromQuery(route.query),
    highlightRowId: highlightFromQuery(route.query),
  })
}

function applyRouteQuery() {
  syncingFromRoute.value = true
  navKey.value = navKeyFromQuery(route.query)
  compareIds.value = compareIdsFromQuery(route.query)
  highlightRowId.value = highlightFromQuery(route.query)
  syncingFromRoute.value = false
}

function syncStateToRoute() {
  if (syncingFromRoute.value) return
  const next = buildThreadTableQuery({
    navKey: navKey.value,
    compareIds: compareIds.value,
    highlightRowId: highlightRowId.value,
  })
  if (threadTableQueryEquals(next, currentRouteQuerySlice())) return
  const query = { ...route.query, ...next }
  delete query.compare
  delete query.row
  delete query.view
  if (!next.cmp) delete query.cmp
  if (!next.hl) delete query.hl
  router.replace({ query })
}

onMounted(applyRouteQuery)
watch(() => route.query, applyRouteQuery)
watch([navKey, compareIds, highlightRowId], syncStateToRoute, { deep: true })

function refreshFavorites() {
  favoritesVersion.value += 1
}

function setCatalogNav(purpose, systemId) {
  navKey.value = `catalog|${purpose}|${systemId}`
}

async function copyShareLink() {
  try {
    const url = new URL(window.location.href)
    const q = buildThreadTableQuery({
      navKey: navKey.value,
      compareIds: compareIds.value,
      highlightRowId: highlightRowId.value,
    })
    url.search = new URLSearchParams(q).toString()
    await navigator.clipboard.writeText(url.toString())
    ElMessage.success(pt('shareCopied'))
  } catch {
    ElMessage.error(pt('shareFailed'))
  }
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
  if (row.system === 'uns' || (row.referenceOnly && row.system === 'uns')) {
    setCatalogNav('fastener', 'uns')
    highlightRowId.value = row.id
    openDetail(row)
    return
  }
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

function onOpenFavorite(rowId) {
  const row = getAllThreadRows().find((r) => r.id === rowId)
  if (row) {
    navigateToCatalogRow(row)
    mobileNavOpen.value = false
  }
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

.thread-page-header {
  @apply mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between;
}

.thread-page-actions {
  @apply flex shrink-0 flex-wrap gap-2;
}

.thread-main-header__top {
  @apply flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3;
}
</style>
