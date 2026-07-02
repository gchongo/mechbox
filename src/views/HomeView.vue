<template>
  <div>
    <h1 class="page-title">MechBox 机械工具箱</h1>
    <p class="mb-8 text-gray-600">尺寸链叠加分析 + 概率统计计算</p>

    <!-- 快速开始 -->
    <section class="card-panel mb-8">
      <el-button type="primary" size="large" @click="startNewAnalysis">
        <el-icon class="mr-1"><Promotion /></el-icon>
        新建分析
      </el-button>
    </section>

    <!-- 统计工具快捷入口 -->
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">统计工具（快速入口）</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          v-for="tool in statTools"
          :key="tool.query"
          class="card-panel text-left transition-shadow hover:shadow-md"
          @click="goStatTool(tool.query)"
        >
          <el-icon :size="28" class="mb-2 text-primary"><component :is="tool.icon" /></el-icon>
          <p class="font-medium">{{ tool.label }}</p>
          <p class="text-sm text-gray-500">{{ tool.desc }}</p>
          <el-tag v-if="tool.badge" size="small" type="info" class="mt-2">{{ tool.badge }}</el-tag>
        </button>
      </div>
    </section>

    <!-- 分析类型 -->
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">选择分析类型</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="group in ANALYSIS_GROUPS" :key="group.id" class="card-panel">
          <h3 class="mb-3 flex items-center gap-2 font-medium text-primary">
            <el-icon><component :is="group.icon" /></el-icon>
            {{ group.label }}
          </h3>
          <div class="space-y-2">
            <button
              v-for="type in group.types"
              :key="type.id"
              class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-primary/5"
              @click="startWithType(type.id)"
            >
              <el-icon class="text-primary/70"><component :is="type.icon || 'Document'" /></el-icon>
              <span class="flex-1">{{ type.name }}</span>
              <el-icon class="text-gray-400"><ArrowRight /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 历史记录 -->
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">历史记录（最近 5 条）</h2>
      <div v-if="history.length" class="space-y-3">
        <div
          v-for="item in history"
          :key="item.id"
          class="card-panel flex items-center justify-between"
        >
          <div>
            <p class="font-medium">
              {{ item.title }}
              <span v-if="item.status === 'pass'" class="ml-1 text-sm text-success">✓</span>
              <span v-else-if="item.status === 'fail'" class="ml-1 text-sm text-error">✗</span>
            </p>
            <p class="text-sm text-gray-500">{{ formatDate(item.date) }}</p>
          </div>
          <div class="flex gap-2">
            <el-button size="small" @click="openHistory(item.id)">打开</el-button>
            <el-button size="small" type="danger" plain @click="removeHistory(item.id)">删除</el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无历史记录" />
    </section>

    <!-- 快速入口 -->
    <section>
      <h2 class="mb-4 text-lg font-semibold">学习资源</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="link in quickLinks"
          :key="link.path"
          :to="link.path"
          class="card-panel block transition-shadow hover:shadow-md"
        >
          <el-icon :size="28" class="mb-2 text-primary"><component :is="link.icon" /></el-icon>
          <p class="font-medium">{{ link.label }}</p>
          <p class="text-sm text-gray-500">{{ link.desc }}</p>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ANALYSIS_GROUPS } from '@/constants/analysis-types'
import { getRecentHistory, deleteAnalysis } from '@/utils/storage'

const router = useRouter()
const history = ref([])

const statTools = [
  { query: 'convert', label: '公差转换', desc: 'T ↔ σ', icon: 'Switch' },
  { query: 'rss', label: 'RSS 计算', desc: '基础 + 加权 RSS', icon: 'DataAnalysis' },
  { query: 'sigma', label: '西格玛分析', desc: 'C / Cpk / 合格率', icon: 'TrendCharts' },
  { query: 'chart', label: '分布曲线', desc: 'Plotly PDF 图', icon: 'PieChart' },
]

const quickLinks = [
  { path: '/tutorial', label: '教程', desc: '5 篇图文教程', icon: 'VideoCamera' },
  { path: '/cases', label: '案例', desc: '4 个预设案例', icon: 'Collection' },
  { path: '/quiz', label: '练习', desc: '10 道练习题', icon: 'EditPen' },
  { path: '/manual', label: '公式手册', desc: 'LaTeX 公式', icon: 'Notebook' },
  { path: '/faq', label: 'FAQ', desc: '常见问题', icon: 'QuestionFilled' },
]

onMounted(() => {
  history.value = getRecentHistory(5)
})

function startNewAnalysis() {
  router.push({ name: 'editor' })
}

function startWithType(typeId) {
  router.push({ name: 'editor', query: { type: typeId } })
}

function goStatTool(query) {
  router.push({ path: '/statistics', query: { tool: query } })
}

function openHistory(id) {
  router.push({ name: 'editor-detail', params: { id } })
}

function removeHistory(id) {
  deleteAnalysis(id)
  history.value = getRecentHistory(5)
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('zh-CN')
}
</script>
