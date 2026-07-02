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
          :key="tool.query || tool.path"
          class="card-panel text-left transition-shadow hover:shadow-md"
          @click="goStatTool(tool)"
        >
          <el-icon :size="28" class="mb-2 text-primary"><component :is="tool.icon" /></el-icon>
          <p class="font-medium">{{ tool.label }}</p>
          <p class="text-sm text-gray-500">{{ tool.desc }}</p>
          <el-tag v-if="tool.badge" size="small" type="info" class="mt-2">{{ tool.badge }}</el-tag>
        </button>
      </div>
    </section>

    <!-- 机械计算工具 V2.0 -->
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">机械计算工具 (V2.0)</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <router-link
          v-for="tool in mechTools"
          :key="tool.path"
          :to="tool.path"
          class="card-panel block transition-shadow hover:shadow-md"
        >
          <el-icon :size="28" class="mb-2 text-primary"><component :is="tool.icon" /></el-icon>
          <p class="font-medium">{{ tool.label }}</p>
          <p class="text-sm text-gray-500">{{ tool.desc }}</p>
          <el-tag size="small" type="success" class="mt-2">{{ tool.badge ?? 'V2.0' }}</el-tag>
        </router-link>
      </div>
    </section>

    <!-- V3 传动工具 -->
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">传动与结构 (V3.0)</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <router-link
          v-for="tool in v3Tools"
          :key="tool.path"
          :to="tool.path"
          class="card-panel block transition-shadow hover:shadow-md"
        >
          <el-icon :size="28" class="mb-2 text-primary"><component :is="tool.icon" /></el-icon>
          <p class="font-medium">{{ tool.label }}</p>
          <p class="text-sm text-gray-500">{{ tool.desc }}</p>
          <el-tag size="small" type="warning" class="mt-2">V3.0</el-tag>
        </router-link>
      </div>
    </section>

    <!-- V4 流体与材料 -->
    <section class="mb-8">
      <h2 class="mb-4 text-lg font-semibold">流体与材料 (V4.0)</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <router-link
          v-for="tool in v4Tools"
          :key="tool.path"
          :to="tool.path"
          class="card-panel block transition-shadow hover:shadow-md"
        >
          <el-icon :size="28" class="mb-2 text-primary"><component :is="tool.icon" /></el-icon>
          <p class="font-medium">{{ tool.label }}</p>
          <p class="text-sm text-gray-500">{{ tool.desc }}</p>
          <el-tag size="small" type="danger" class="mt-2">V4.0</el-tag>
        </router-link>
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
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">历史记录（最近 5 条）</h2>
        <router-link to="/history" class="text-sm text-primary hover:underline">查看全部 →</router-link>
      </div>
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
  { query: 'rss', label: 'RSS 计算', desc: '基础 + 加权 + 修正', icon: 'DataAnalysis' },
  { query: 'sigma', label: '西格玛分析', desc: 'C / Cpk / 合格率', icon: 'TrendCharts' },
  { query: 'chart', label: '分布曲线', desc: 'Plotly PDF 图', icon: 'PieChart' },
  { path: '/monte-carlo', label: 'Monte Carlo', desc: '随机模拟分析', icon: 'Histogram', badge: 'V2.0' },
]

const mechTools = [
  { path: '/batch', label: '批量公差验证', desc: '多方案 RSS/极值批量检验', icon: 'List', badge: 'V2.0' },
  { path: '/allocation', label: '公差分配', desc: 'RSS 等贡献 / 最小成本分配', icon: 'ScaleToOriginal', badge: 'V2.0' },
  { path: '/gear', label: '齿轮强度', desc: 'ISO 6336 完整校核', icon: 'SetUp', badge: 'V2.0' },
  { path: '/thread', label: '螺纹强度', desc: '拉/剪应力 + 拧紧扭矩', icon: 'Link', badge: 'V2.0' },
  { path: '/bearing', label: '轴承寿命', desc: 'X/Y 查表 + ISO 281', icon: 'Help', badge: 'V2.0' },
]

const v3Tools = [
  { path: '/shaft', label: '轴扭转', desc: '切应力 / 扭转角 / 最小轴径', icon: 'Sort' },
  { path: '/spring', label: '弹簧设计', desc: '刚度 / 变形 / 切应力', icon: 'Refresh' },
  { path: '/clutch', label: '离合器', desc: '摩擦扭矩 / 压紧力', icon: 'Connection' },
  { path: '/belt', label: '皮带传动', desc: '链长 / 传动比 / 张力', icon: 'Minus' },
  { path: '/chain', label: '链传动', desc: '节距 / 链长 / 链张力', icon: 'Link' },
]

const v4Tools = [
  { path: '/cylinder', label: '液压/气缸', desc: '推力 / 速度 / 流量', icon: 'Odometer' },
  { path: '/materials', label: '材料库', desc: '12 种常用材料强度查询', icon: 'Reading' },
]

const quickLinks = [
  { path: '/tutorial', label: '教程', desc: '5 篇教程 + Bilibili 视频', icon: 'VideoCamera' },
  { path: '/cases', label: '案例', desc: '12 个预设案例', icon: 'Collection' },
  { path: '/quiz', label: '练习', desc: '10 道练习题', icon: 'EditPen' },
  { path: '/manual', label: '公式手册', desc: 'LaTeX 公式', icon: 'Notebook' },
  { path: '/glossary', label: '术语词典', desc: 'GD&T 术语', icon: 'Reading' },
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

function goStatTool(tool) {
  if (tool.path) {
    router.push(tool.path)
  } else {
    router.push({ path: '/statistics', query: { tool: tool.query } })
  }
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
