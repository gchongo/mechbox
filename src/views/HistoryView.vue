<template>
  <div>
    <h1 class="page-title">历史记录</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      本地保存的分析记录，最多 50 条
    </p>

    <div class="mb-4 flex flex-wrap gap-2">
      <el-button type="primary" :disabled="!records.length" @click="exportJson">
        导出 JSON
      </el-button>
      <el-button :disabled="!records.length" @click="exportExcel">导出 Excel 汇总</el-button>
      <el-button type="danger" plain :disabled="!records.length" @click="confirmClear">
        清空全部
      </el-button>
    </div>

    <el-table v-if="records.length" :data="records" border stripe>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 'pass' ? 'success' : row.status === 'fail' ? 'danger' : 'info'" size="small">
            {{ row.status === 'pass' ? '合格' : row.status === 'fail' ? '不合格' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="日期" width="180">
        <template #default="{ row }">{{ formatDate(row.date) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openRecord(row.id)">打开</el-button>
          <el-button size="small" type="danger" text @click="removeRecord(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-empty v-else description="暂无历史记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { getHistory, deleteAnalysis } from '@/utils/storage'

const router = useRouter()
const records = ref([])

onMounted(refresh)

function refresh() {
  records.value = getHistory()
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('zh-CN')
}

function openRecord(id) {
  router.push({ name: 'editor-detail', params: { id } })
}

function removeRecord(id) {
  deleteAnalysis(id)
  refresh()
  ElMessage.success('已删除')
}

async function confirmClear() {
  await ElMessageBox.confirm('确定清空全部历史记录？此操作不可恢复。', '确认', {
    type: 'warning',
  })
  for (const item of [...records.value]) {
    deleteAnalysis(item.id)
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
    状态: r.status === 'pass' ? '合格' : r.status === 'fail' ? '不合格' : '草稿',
    日期: formatDate(r.date),
    类型: r.data?.selectedType?.name ?? '',
    封闭环: r.data?.closedRing?.name ?? '',
    方法: r.data?.method ?? '',
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), '历史记录')
  XLSX.writeFile(wb, `mechbox_history_${new Date().toISOString().slice(0, 10)}.xlsx`)
  ElMessage.success('Excel 已下载')
}
</script>
