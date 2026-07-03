<template>
  <div class="help-page">
    <header class="mb-4">
      <h1 class="page-title">{{ ct('help.title') }}</h1>
      <p class="mb-3 text-gray-600 dark:text-gray-400">{{ ct('help.subtitle') }}</p>
      <el-input
        v-model="keyword"
        :placeholder="ct('help.searchPlaceholder')"
        clearable
        class="max-w-md"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </header>

    <div class="help-layout">
      <aside class="help-nav card-panel">
        <div v-for="group in groupedArticles" :key="group.id" class="mb-4 last:mb-0">
          <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {{ groupLabel(group.id) }}
          </h3>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="help-nav__item"
            :class="{ 'help-nav__item--active': item.id === activeId }"
            @click="selectArticle(item.id)"
          >
            <span class="truncate">{{ item.title }}</span>
            <el-tag size="small" effect="plain" class="shrink-0">{{ levelLabel(item.level) }}</el-tag>
          </button>
        </div>
        <el-empty v-if="!groupedArticles.length" :description="ct('help.empty')" :image-size="64" />
      </aside>

      <article v-if="article" class="help-article card-panel">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <h2 class="text-xl font-semibold">{{ article.title }}</h2>
              <el-tag size="small" :type="levelTagType(article.level)">{{ levelLabel(article.level) }}</el-tag>
            </div>
            <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{{ article.summary }}</p>
          </div>
          <el-button
            v-if="article.path && article.path !== '/help'"
            type="primary"
            @click="openTool(article.path)"
          >
            {{ ct('help.openTool') }}
          </el-button>
        </div>

        <section class="help-section">
          <h3 class="help-section__title">{{ ct('help.steps') }}</h3>
          <ol class="help-list help-list--ordered">
            <li v-for="(step, i) in article.steps" :key="i">
              <MathContent :text="step" />
            </li>
          </ol>
        </section>

        <section class="help-section">
          <h3 class="help-section__title">{{ ct('help.principle') }}</h3>
          <MathContent
            :text="article.principle"
            class="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
          />
        </section>

        <section v-if="article.formulas?.length" class="help-section">
          <h3 class="help-section__title">{{ ct('help.formulas') }}</h3>
          <div class="space-y-3">
            <div
              v-for="(f, i) in article.formulas"
              :key="i"
              class="rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
            >
              <MathTex :expr="f.latex" block />
              <p v-if="f.note" class="mt-2 text-xs text-gray-500">
                <MathContent :text="f.note" />
              </p>
            </div>
          </div>
        </section>

        <section class="help-section">
          <h3 class="help-section__title">{{ ct('help.notes') }}</h3>
          <ul class="help-list">
            <li v-for="(note, i) in article.notes" :key="i">
              <MathContent :text="note" />
            </li>
          </ul>
        </section>

        <section v-if="article.standards?.length" class="help-section">
          <h3 class="help-section__title">{{ ct('help.standards') }}</h3>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="s in article.standards" :key="s" type="info" effect="plain">{{ s }}</el-tag>
          </div>
        </section>

        <section v-if="article.example" class="help-section">
          <h3 class="help-section__title">{{ ct('help.example') }}</h3>
          <p class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm leading-relaxed">
            <MathContent :text="article.example" />
          </p>
        </section>

        <section v-if="relatedArticles.length" class="help-section">
          <h3 class="help-section__title">{{ ct('help.related') }}</h3>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="r in relatedArticles"
              :key="r.id"
              size="small"
              plain
              @click="selectArticle(r.id)"
            >
              {{ r.title }}
            </el-button>
          </div>
        </section>
      </article>

      <el-empty v-else class="card-panel" :description="ct('help.empty')" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import MathTex from '@/components/common/MathTex.vue'
import MathContent from '@/components/common/MathContent.vue'
import {
  HELP_GROUP_ORDER,
  HELP_LEVELS,
  getHelpArticle,
  searchHelpArticles,
} from '@/constants/tool-help'
import { useContentI18n } from '@/composables/useContentI18n'
import { useLocale } from '@/composables/useLocale'

const route = useRoute()
const router = useRouter()
const { ct } = useContentI18n()
const { locale } = useLocale()

const keyword = ref('')
const activeId = ref('getting-started')

function syncFromRoute() {
  const id = typeof route.params.id === 'string' ? route.params.id : ''
  if (id && getHelpArticle(id)) {
    activeId.value = id
    return
  }
  if (typeof route.query.tool === 'string' && getHelpArticle(route.query.tool)) {
    activeId.value = route.query.tool
    return
  }
  activeId.value = 'getting-started'
}

syncFromRoute()
watch(() => [route.params.id, route.query.tool], syncFromRoute)

const filtered = computed(() => searchHelpArticles(keyword.value))

const groupedArticles = computed(() => {
  const map = new Map()
  for (const a of filtered.value) {
    if (!map.has(a.groupId)) map.set(a.groupId, [])
    map.get(a.groupId).push(a)
  }
  return HELP_GROUP_ORDER.filter((id) => map.has(id)).map((id) => ({
    id,
    items: map.get(id),
  }))
})

const article = computed(() => getHelpArticle(activeId.value) ?? filtered.value[0] ?? null)

const relatedArticles = computed(() => {
  const ids = article.value?.related ?? []
  return ids.map((id) => getHelpArticle(id)).filter(Boolean)
})

function groupLabel(id) {
  return ct(`help.groups.${id}`)
}

function levelLabel(level) {
  const node = HELP_LEVELS[level]
  if (!node) return level
  return locale.value === 'en' ? node.en : node.zh
}

function levelTagType(level) {
  if (level === 'beginner') return 'success'
  if (level === 'advanced') return 'warning'
  return 'info'
}

function selectArticle(id) {
  activeId.value = id
  keyword.value = ''
  if (id === 'getting-started') {
    router.replace({ name: 'help' })
  } else {
    router.replace({ name: 'help-tool', params: { id } })
  }
}

function openTool(path) {
  router.push(path)
}

watch(filtered, (list) => {
  if (!list.find((a) => a.id === activeId.value) && list[0]) {
    activeId.value = list[0].id
  }
})
</script>

<style scoped>
.help-layout {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}

@media (min-width: 960px) {
  .help-layout {
    grid-template-columns: 280px minmax(0, 1fr);
    align-items: start;
  }

  .help-nav {
    position: sticky;
    top: 4.5rem;
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
  }
}

.help-nav__item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  padding: 0.45rem 0.6rem;
  text-align: left;
  font-size: 0.875rem;
  color: inherit;
  cursor: pointer;
}

.help-nav__item:hover {
  background: rgb(249 250 251);
}

.dark .help-nav__item:hover {
  background: rgb(31 41 55);
}

.help-nav__item--active {
  border-color: color-mix(in srgb, var(--el-color-primary) 35%, transparent);
  background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  color: var(--el-color-primary);
  font-weight: 600;
}

.help-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgb(229 231 235);
}

.dark .help-section {
  border-top-color: rgb(55 65 81);
}

.help-section__title {
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--el-color-primary);
}

.help-list {
  margin: 0;
  padding-left: 1.15rem;
  font-size: 0.875rem;
  line-height: 1.7;
  color: rgb(55 65 81);
}

.dark .help-list {
  color: rgb(209 213 219);
}

.help-list li + li {
  margin-top: 0.35rem;
}

.help-list--ordered {
  list-style: decimal;
}

.help-list:not(.help-list--ordered) {
  list-style: disc;
}
</style>
