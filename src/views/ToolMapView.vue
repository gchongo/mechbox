<template>
  <div>
    <h1 class="page-title">工具地图</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      全部 {{ totalCount }} 个计算器与参考入口，支持关键词搜索
    </p>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <el-input
        v-model="query"
        clearable
        placeholder="搜索工具名称、描述或关键词…"
        class="max-w-md"
        prefix-icon="Search"
      />
      <span class="text-sm text-gray-500">
        找到 {{ filteredTools.length }} 项
      </span>
    </div>

    <template v-if="query.trim()">
      <div class="home-grid">
        <component
          :is="toolLinkComponent(t)"
          v-for="t in filteredTools"
          :key="t.route"
          v-bind="toolLinkProps(t)"
          class="home-card"
        >
          <HomeToolCard :tool="t" />
        </component>
      </div>
    </template>

    <template v-else>
      <section v-for="group in TOOL_GROUPS" :key="group.id" class="card-panel mb-4">
        <h2 class="mb-3 text-base font-semibold text-primary">{{ group.label }}</h2>
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
      </section>

      <section class="card-panel">
        <h2 class="mb-3 text-base font-semibold text-primary">统计工具</h2>
        <div class="home-grid">
          <button
            v-for="tool in STAT_TOOLS"
            :key="tool.query || tool.path"
            type="button"
            class="home-card"
            @click="goStatTool(tool)"
          >
            <HomeToolCard :tool="tool" />
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { STAT_TOOLS, TOOL_GROUPS, searchTools, getAllToolsFlat } from '@/constants/tool-catalog'
import HomeToolCard from '@/components/home/HomeToolCard.vue'

const router = useRouter()
const query = ref('')

const totalCount = computed(() => getAllToolsFlat().length)
const filteredTools = computed(() => searchTools(query.value))

function goStatTool(tool) {
  if (tool.path) {
    router.push(tool.path)
  } else {
    router.push({ path: '/statistics', query: { tool: tool.query } })
  }
}

function toolLinkComponent(tool) {
  return tool.path ? 'router-link' : 'button'
}

function toolLinkProps(tool) {
  if (tool.path) return { to: tool.path }
  return { type: 'button', onClick: () => goStatTool(tool) }
}
</script>

<style scoped>
.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr));
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
</style>
