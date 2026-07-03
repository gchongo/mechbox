<template>
  <div class="home-page">
    <section class="home-quick">
      <div class="home-quick__main">
        <p class="home-quick__desc">尺寸链叠加 · 概率统计 · 机械强度计算</p>
      </div>
      <div class="home-quick__actions">
        <el-button type="primary" size="large" class="home-quick__btn" @click="startNewAnalysis">
          <el-icon class="mr-1"><Promotion /></el-icon>
          快速分析
        </el-button>
        <router-link to="/history">
          <el-button size="large" plain class="home-quick__btn">历史记录</el-button>
        </router-link>
        <router-link to="/tools">
          <el-button size="large" plain class="home-quick__btn">工具地图</el-button>
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
import { STAT_TOOLS, TOOL_GROUPS } from '@/constants/tool-catalog'
import HomeToolCard from '@/components/home/HomeToolCard.vue'

const router = useRouter()

const statTools = STAT_TOOLS
const toolGroups = TOOL_GROUPS.filter((g) => g.id !== 'reference')

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
  @apply flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm
    dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-5;
}

.home-quick__desc {
  @apply text-sm font-medium leading-relaxed text-gray-800 dark:text-gray-100 sm:text-base;
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
