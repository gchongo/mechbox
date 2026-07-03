<template>
  <div>
    <h1 class="page-title">{{ ct('toolMap.title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ ct('toolMap.subtitle', { n: totalCount }) }}
    </p>

    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <el-input
        v-model="query"
        clearable
        :placeholder="ct('toolMap.searchPlaceholder')"
        class="max-w-md"
        prefix-icon="Search"
      />
      <span class="text-sm text-gray-500">
        {{ ct('toolMap.found', { n: filteredTools.length }) }}
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
      <section v-for="group in localizedGroups" :key="group.id" class="card-panel mb-4">
        <h2 class="mb-3 text-base font-semibold text-primary">{{ t(`toolGroups.${group.id}`) }}</h2>
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
        <h2 class="mb-3 text-base font-semibold text-primary">{{ ct('toolMap.statTools') }}</h2>
        <div class="home-grid">
          <button
            v-for="tool in localizedStatTools"
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
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { STAT_TOOLS, TOOL_GROUPS, getAllToolsFlat } from '@/constants/tool-catalog'
import HomeToolCard from '@/components/home/HomeToolCard.vue'
import { useContentI18n } from '@/composables/useContentI18n'
import { useLocale } from '@/composables/useLocale'
import { localizedTool, localizedStatTool } from '@/i18n'

const router = useRouter()
const route = useRoute()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const { ct, locale } = useContentI18n()
const { t } = useLocale()

const localizedGroups = computed(() =>
  TOOL_GROUPS.filter((g) => g.id !== 'reference').map((g) => ({
    ...g,
    tools: g.tools.map((tool) => localizedTool(tool, locale.value)),
  })),
)

const localizedStatTools = computed(() =>
  STAT_TOOLS.map((tool) => localizedStatTool(tool, locale.value)),
)

const localizedFlatTools = computed(() =>
  getAllToolsFlat().map((tool) => {
    const localized = tool.path
      ? localizedTool(tool, locale.value)
      : localizedStatTool(tool, locale.value)
    const category =
      tool.categoryId === 'stat'
        ? ct('toolMap.statCategory')
        : t(`toolGroups.${tool.categoryId}`)
    return { ...localized, category }
  }),
)

const totalCount = computed(() => localizedFlatTools.value.length)

const filteredTools = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return localizedFlatTools.value
  return localizedFlatTools.value.filter((tool) => {
    const hay = [tool.label, tool.desc, tool.category, ...(tool.keywords ?? [])].join(' ').toLowerCase()
    return hay.includes(q)
  })
})

function goStatTool(tool) {
  if (tool.path) {
    router.push(tool.path)
  } else {
    router.push({ path: '/statistics', query: { tool: tool.query } })
  }
}

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === 'string') query.value = q
  },
)

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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 120px), 1fr));
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .home-grid {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr));
  }
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
