<template>
  <div>
    <h1 class="page-title mb-6">{{ ct('history.title') }}</h1>
    <div class="mb-4 flex flex-wrap items-center gap-2 tool-action-bar">
      <el-button type="primary" :disabled="!selectedIds.length" @click="exportMergedPdf">
        {{ ct('history.mergePdf', { n: selectedIds.length }) }}
      </el-button>
      <el-button type="primary" :disabled="!records.length" @click="exportJson">
        {{ ct('history.exportJson') }}
      </el-button>
      <el-button :disabled="!records.length" @click="exportExcel">{{ ct('history.exportExcel') }}</el-button>
      <el-button type="danger" plain :disabled="!records.length" @click="confirmClear">
        {{ ct('history.clearAll') }}
      </el-button>
      <el-select v-model="sourceFilter" class="w-32" size="small">
        <el-option :label="ct('history.filterAll')" value="all" />
        <el-option :label="ct('history.filterEditor')" value="editor" />
        <el-option :label="ct('history.filterTool')" value="tool" />
      </el-select>
      <el-checkbox v-model="favoritesOnly">{{ ct('history.favoritesOnly') }}</el-checkbox>
    </div>

    <el-table
      v-if="displayRecords.length"
      :data="displayRecords"
      border
      stripe
      class="history-table"
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column width="50" align="center">
        <template #default="{ row }">
          <button class="text-lg" @click="toggleFav(row.id)">
            {{ isFavorite(row.id) ? '★' : '☆' }}
          </button>
        </template>
      </el-table-column>
      <el-table-column :label="ct('history.colTitle')" min-width="160">
        <template #default="{ row }">{{ formatHistoryTitle(row, locale) }}</template>
      </el-table-column>
      <el-table-column :label="ct('history.colSource')" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="row.source === 'tool' ? 'warning' : 'primary'">
            {{ formatHistorySource(row, locale) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="ct('history.colStatus')" width="80">
        <template #default="{ row }">
          <el-tag :type="historyStatusType(row.status)" size="small">
            {{ formatHistoryStatus(row.status, locale) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="ct('history.colDate')" width="150" class-name="hidden sm:table-cell">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column :label="ct('history.colActions')" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openRecord(row)">{{ ct('history.open') }}</el-button>
          <el-button size="small" type="danger" text @click="removeRecord(row.id)">{{ ct('history.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else :description="favoritesOnly ? ct('history.emptyFavorites') : ct('history.empty')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { getHistory, deleteAnalysis } from '@/utils/storage'
import { isFavorite, toggleFavorite, removeFavorite } from '@/utils/favorites'
import { exportMergedHistoryPdf } from '@/utils/export'
import {
  buildToolReplayRoute,
  formatHistorySource,
  formatHistoryStatus,
  formatHistoryTitle,
  formatHistoryType,
} from '@/utils/calc-history'
import { useContentI18n } from '@/composables/useContentI18n'
import { ensureLoggedIn } from '@/utils/auth-guard'

const router = useRouter()
const { ct, locale } = useContentI18n()
const records = ref([])
const favoritesOnly = ref(false)
const sourceFilter = ref('all')
const selectedIds = ref([])

const displayRecords = computed(() => {
  let list = records.value
  if (favoritesOnly.value) list = list.filter((r) => isFavorite(r.id))
  if (sourceFilter.value === 'editor') list = list.filter((r) => (r.source ?? 'editor') === 'editor')
  if (sourceFilter.value === 'tool') list = list.filter((r) => r.source === 'tool')
  return list
})

onMounted(refresh)

function refresh() {
  records.value = getHistory()
}

function formatDate(iso) {
  const loc = locale.value === 'en' ? 'en-US' : 'zh-CN'
  return new Date(iso).toLocaleString(loc, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function openRecord(row) {
  if (row.source === 'tool' && row.tool) {
    const replayRoute = buildToolReplayRoute(row)
    if (replayRoute) {
      router.push(replayRoute)
      return
    }
  }
  router.push({ name: 'editor-detail', params: { id: row.id } })
}

async function toggleFav(id) {
  if (!(await ensureLoggedIn(locale.value))) return
  const added = toggleFavorite(id)
  ElMessage.success(added ? ct('history.favAdded') : ct('history.favRemoved'))
}

function removeRecord(id) {
  deleteAnalysis(id)
  removeFavorite(id)
  refresh()
  ElMessage.success(ct('history.deleted'))
}

async function confirmClear() {
  await ElMessageBox.confirm(ct('history.clearConfirm'), ct('history.confirmTitle'), {
    type: 'warning',
  })
  for (const item of [...records.value]) {
    deleteAnalysis(item.id)
    removeFavorite(item.id)
  }
  refresh()
  ElMessage.success(ct('history.cleared'))
}

function exportJson() {
  const blob = new Blob([JSON.stringify(records.value, null, 2)], {
    type: 'application/json',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `mechbox_history_${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  ElMessage.success(ct('history.jsonDownloaded'))
}

async function exportExcel() {
  if (!(await ensureLoggedIn(locale.value))) return
  const rows = records.value.map((r) => ({
    [ct('history.excelColTitle')]: formatHistoryTitle(r, locale.value),
    [ct('history.excelColSource')]: formatHistorySource(r, locale.value),
    [ct('history.excelColStatus')]: formatHistoryStatus(r.status, locale.value),
    [ct('history.excelColDate')]: formatDate(r.date),
    [ct('history.excelColType')]: formatHistoryType(r, locale.value),
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), ct('history.excelSheet'))
  XLSX.writeFile(wb, `mechbox_history_${new Date().toISOString().slice(0, 10)}.xlsx`)
  ElMessage.success(ct('history.excelDownloaded'))
}

function onSelectionChange(rows) {
  selectedIds.value = rows.map((r) => r.id)
}

function historyStatusType(status) {
  if (status === 'pass') return 'success'
  if (status === 'review') return 'warning'
  if (status === 'fail') return 'danger'
  return 'info'
}

async function exportMergedPdf() {
  const picked = records.value.filter((r) => selectedIds.value.includes(r.id))
  if (!picked.length) return
  const ok = await exportMergedHistoryPdf(picked, undefined, locale.value)
  if (ok) ElMessage.success(ct('history.pdfExported', { n: picked.length }))
}
</script>
