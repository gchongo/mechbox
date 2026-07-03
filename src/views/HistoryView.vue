<template>
  <div>
    <h1 class="page-title mb-6">历史记录</h1>
    <div class="mb-4 flex flex-wrap items-center gap-2 tool-action-bar">
      <el-button type="primary" :disabled="!selectedIds.length" @click="exportMergedPdf">
        合并导出 PDF ({{ selectedIds.length }})
      </el-button>
      <el-button type="primary" :disabled="!records.length" @click="exportJson">
        导出 JSON
      </el-button>
      <el-button :disabled="!records.length" @click="exportExcel">导出 Excel 汇总</el-button>
      <el-button type="danger" plain :disabled="!records.length" @click="confirmClear">
        清空全部
      </el-button>
      <el-select v-model="sourceFilter" class="w-32" size="small">
        <el-option label="全部来源" value="all" />
        <el-option label="尺寸链" value="editor" />
        <el-option label="工具计算" value="tool" />
      </el-select>
      <el-checkbox v-model="favoritesOnly">仅收藏</el-checkbox>
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
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column label="来源" width="110">
        <template #default="{ row }">
          <el-tag size="small" :type="row.source === 'tool' ? 'warning' : 'primary'">
            {{ formatHistorySource(row) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 'pass' ? 'success' : row.status === 'fail' ? 'danger' : 'info'" size="small">
            {{ row.status === 'pass' ? '合格' : row.status === 'fail' ? '不合格' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日期" width="150" class-name="hidden sm:table-cell">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openRecord(row)">打开</el-button>
          <el-button size="small" type="danger" text @click="removeRecord(row.id)">删</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else :description="favoritesOnly ? '暂无收藏' : '暂无历史记录'" />
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
import { formatHistorySource, getToolRoute } from '@/utils/calc-history'

const router = useRouter()
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
  return new Date(iso).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function openRecord(row) {
  if (row.source === 'tool' && row.tool) {
    const route = getToolRoute(row.tool)
    if (route) {
      router.push(route)
      return
    }
  }
  router.push({ name: 'editor-detail', params: { id: row.id } })
}

function toggleFav(id) {
  const added = toggleFavorite(id)
  ElMessage.success(added ? '已收藏' : '已取消收藏')
}

function removeRecord(id) {
  deleteAnalysis(id)
  removeFavorite(id)
  refresh()
  ElMessage.success('已删除')
}

async function confirmClear() {
  await ElMessageBox.confirm('确定清空全部历史记录？此操作不可恢复。', '确认', {
    type: 'warning',
  })
  for (const item of [...records.value]) {
    deleteAnalysis(item.id)
    removeFavorite(item.id)
  }
  refresh()
  ElMessage.success('已清空')
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
  ElMessage.success('JSON 已下载')
}

function exportExcel() {
  const rows = records.value.map((r) => ({
    标题: r.title,
    来源: formatHistorySource(r),
    状态: r.status === 'pass' ? '合格' : r.status === 'fail' ? '不合格' : '草稿',
    日期: formatDate(r.date),
    类型: r.data?.selectedType?.name ?? r.data?.toolLabel ?? '',
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), '历史记录')
  XLSX.writeFile(wb, `mechbox_history_${new Date().toISOString().slice(0, 10)}.xlsx`)
  ElMessage.success('Excel 已下载')
}

function onSelectionChange(rows) {
  selectedIds.value = rows.map((r) => r.id)
}

async function exportMergedPdf() {
  const picked = records.value.filter((r) => selectedIds.value.includes(r.id))
  if (!picked.length) return
  await exportMergedHistoryPdf(picked)
  ElMessage.success(`已导出 ${picked.length} 条记录`)
}
</script>
