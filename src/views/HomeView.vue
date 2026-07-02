<template>
  <div class="home-page">
    <section class="home-quick">
      <div class="home-quick__main">
        <div class="home-quick__features">
          <span v-for="item in highlights" :key="item.label" class="home-quick__tag">
            <el-icon class="home-quick__tag-icon"><component :is="item.icon" /></el-icon>
            {{ item.label }}
          </span>
        </div>
        <p class="home-quick__hint">本地计算 · 无需登录 · 支持 RSS / 极值 / GD&amp;T</p>
      </div>
      <div class="home-quick__actions">
        <el-button type="primary" size="large" class="home-quick__btn" @click="startNewAnalysis">
          <el-icon class="mr-1"><Promotion /></el-icon>
          快速分析
        </el-button>
        <router-link to="/history">
          <el-button size="large" plain class="home-quick__btn">历史记录</el-button>
        </router-link>
      </div>
    </section>

    <section class="home-section">
      <header class="home-section__head">
        <h2 class="home-section__title">分析类型</h2>
        <router-link to="/editor" class="home-section__link">进入编辑器 →</router-link>
      </header>
      <div class="home-analysis-grid">
        <div
          v-for="group in ANALYSIS_GROUPS"
          :key="group.id"
          class="home-analysis-group"
        >
          <h3 class="home-analysis-group__title">
            <el-icon class="text-primary"><component :is="group.icon" /></el-icon>
            {{ group.label }}
          </h3>
          <ul class="home-analysis-list">
            <li v-for="type in group.types" :key="type.id">
              <button type="button" class="home-analysis-item" @click="startWithType(type.id)">
                <el-icon class="shrink-0 text-primary/60"><component :is="type.icon || 'Document'" /></el-icon>
                <span>{{ type.name }}</span>
                <el-icon class="ml-auto shrink-0 text-gray-300"><ArrowRight /></el-icon>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="home-section">
      <header class="home-section__head">
        <h2 class="home-section__title">统计工具</h2>
        <router-link to="/statistics" class="home-section__link">全部统计 →</router-link>
      </header>
      <div class="home-grid">
        <button
          v-for="tool in statTools"
          :key="tool.query || tool.path"
          type="button"
          class="home-card"
          @click="goStatTool(tool)"
        >
          <HomeToolCard :tool="tool" />
        </button>
      </div>
    </section>

    <section class="home-section">
      <header class="home-section__head">
        <h2 class="home-section__title">机械计算工具</h2>
      </header>

      <div v-for="group in toolGroups" :key="group.label" class="home-tool-block">
        <h3 class="home-tool-block__label">{{ group.label }}</h3>
        <div class="home-grid">
          <router-link
            v-for="tool in group.tools"
            :key="tool.path"
            :to="tool.path"
            class="home-card"
          >
            <HomeToolCard :tool="tool" />
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ANALYSIS_GROUPS } from '@/constants/analysis-types'
import HomeToolCard from '@/components/home/HomeToolCard.vue'

const router = useRouter()

const highlights = [
  { label: '尺寸链叠加', icon: 'Connection' },
  { label: '概率统计', icon: 'TrendCharts' },
  { label: '机械强度', icon: 'SetUp' },
]

const statTools = [
  { query: 'convert', label: '公差转换', latexDesc: 'T \\leftrightarrow \\sigma', icon: 'Switch' },
  { query: 'rss', label: 'RSS 计算', desc: '基础 + 加权 + 修正', icon: 'DataAnalysis' },
  { query: 'sigma', label: '西格玛分析', desc: 'C / Cpk / 合格率', icon: 'TrendCharts' },
  { query: 'chart', label: '分布曲线', desc: 'Plotly PDF 图', icon: 'PieChart' },
  { path: '/monte-carlo', label: 'Monte Carlo', desc: '随机模拟', icon: 'Histogram' },
]

const toolGroups = [
  {
    label: '尺寸链与强度',
    tools: [
      { path: '/batch', label: '批量验证', desc: 'RSS/极值批量检验', icon: 'List' },
      { path: '/allocation', label: '公差分配', desc: '等贡献 / 最小成本', icon: 'ScaleToOriginal' },
      { path: '/gear', label: '齿轮强度', desc: 'ISO 6336 校核', icon: 'SetUp' },
      { path: '/thread', label: '螺纹强度', desc: '拉剪应力 / 扭矩', icon: 'Link' },
      { path: '/bolt-preload', label: '螺栓预紧力', desc: '扭矩 ↔ 预紧力', icon: 'TurnOff' },
      { path: '/bearing', label: '轴承寿命', desc: 'X/Y 查表 ISO 281', icon: 'Help' },
    ],
  },
  {
    label: '传动与结构',
    tools: [
      { path: '/shaft', label: '轴强度', desc: '扭转 / 弯扭合成', icon: 'Sort' },
      { path: '/key', label: '平键连接', desc: '挤压 / 剪切', icon: 'Key' },
      { path: '/weld', label: '焊缝强度', desc: '角焊 / 对接焊', icon: 'Medal' },
      { path: '/bolt-group', label: '螺栓组', desc: '偏心载荷分配', icon: 'Grid' },
      { path: '/spring', label: '弹簧设计', desc: '刚度 / 切应力', icon: 'Refresh' },
      { path: '/clutch', label: '离合器', desc: '摩擦扭矩', icon: 'Connection' },
      { path: '/belt', label: '皮带传动', desc: '链长 / 张力', icon: 'Minus' },
      { path: '/chain', label: '链传动', desc: '节距 / 链张力', icon: 'Link' },
    ],
  },
  {
    label: '流体与材料',
    tools: [
      { path: '/cylinder', label: '液压/气缸', desc: '推力 / 流量', icon: 'Odometer' },
      { path: '/materials', label: '材料库', desc: '常用材料强度', icon: 'Reading' },
    ],
  },
]

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
</script>

<style scoped>
.home-page {
  @apply space-y-3;
}

.home-quick {
  @apply flex flex-col gap-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-primary/5
    px-4 py-4 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-primary/10 sm:flex-row sm:items-center
    sm:justify-between sm:px-5;
}

.home-quick__features {
  @apply flex flex-wrap gap-2;
}

.home-quick__tag {
  @apply inline-flex items-center gap-1 rounded-full border border-primary/15 bg-white/80 px-3 py-1
    text-sm font-medium text-gray-700 dark:border-primary/25 dark:bg-gray-800/80 dark:text-gray-200;
}

.home-quick__tag-icon {
  @apply text-primary;
}

.home-quick__hint {
  @apply mt-2 text-xs text-gray-500 dark:text-gray-400;
}

.home-quick__actions {
  @apply flex w-full flex-col gap-2 sm:w-auto sm:flex-row;
}

.home-quick__btn {
  @apply w-full sm:w-auto;
}

.home-section {
  @apply rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4;
}

.home-section__head {
  @apply mb-2 flex items-center justify-between gap-2;
}

.home-section__title {
  @apply text-base font-semibold text-gray-900 dark:text-gray-100;
}

.home-section__link {
  @apply shrink-0 text-xs text-primary hover:underline;
}

.home-tool-block {
  @apply mb-3 border-b border-gray-100 pb-3 last:mb-0 last:border-0 last:pb-0 dark:border-gray-700/60;
}

.home-tool-block__label {
  @apply mb-2 text-xs font-medium text-gray-500 dark:text-gray-400;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 128px), 1fr));
  gap: 0.5rem;
}

.home-card {
  @apply flex h-full min-h-[84px] rounded-lg border border-gray-100 bg-gray-50/80 p-2.5 text-left
    transition-all hover:border-primary/30 hover:bg-white hover:shadow-sm
    dark:border-gray-700/50 dark:bg-gray-900/40 dark:hover:border-primary/40 dark:hover:bg-gray-800;
}

button.home-card {
  @apply w-full cursor-pointer;
}

a.home-card {
  @apply block no-underline text-inherit;
}

.home-card :deep(.home-card__inner) {
  @apply flex h-full flex-col;
}

.home-card :deep(.home-card__icon) {
  @apply mb-1.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary;
}

.home-card :deep(.home-card__body) {
  @apply flex flex-1 flex-col gap-0.5;
}

.home-card :deep(.home-card__label) {
  @apply line-clamp-1 text-sm font-medium leading-tight text-gray-900 dark:text-gray-100;
}

.home-card :deep(.home-card__desc) {
  @apply line-clamp-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400;
}

.home-card :deep(.home-card__latex) {
  @apply line-clamp-1 text-[11px] leading-snug text-gray-500 dark:text-gray-400;
}

.home-analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
  gap: 0.5rem;
}

.home-analysis-group {
  @apply rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 dark:border-gray-700/50 dark:bg-gray-900/30;
}

.home-analysis-group__title {
  @apply mb-2 flex items-center gap-1.5 border-b border-gray-100 pb-2 text-sm font-semibold
    text-primary dark:border-gray-700;
}

.home-analysis-list {
  @apply m-0 list-none space-y-0.5 p-0;
}

.home-analysis-item {
  @apply flex w-full items-center gap-2 rounded px-1.5 py-1.5 text-left text-sm
    text-gray-700 transition-colors hover:bg-primary/5 dark:text-gray-300;
}
</style>
