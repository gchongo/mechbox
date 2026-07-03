<template>
  <div ref="rootRef" class="home-search">
    <el-input
      v-model="query"
      clearable
      :placeholder="t('home.quickDesc')"
      class="home-search__input"
      @focus="open = true"
      @keydown.enter.prevent="onEnter"
      @keydown.esc="closePanel"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <div v-if="showPanel" class="home-search__panel">
      <template v-if="hasAny">
        <section v-if="results.tools.length" class="home-search__section">
          <h4 class="home-search__section-title">{{ t('home.searchTools') }}</h4>
          <button
            v-for="item in results.tools"
            :key="item.id"
            type="button"
            class="home-search__item"
            @mousedown.prevent="go(item)"
          >
            <span class="home-search__item-label">{{ item.label }}</span>
            <span v-if="item.desc" class="home-search__item-desc">{{ item.desc }}</span>
            <span class="home-search__item-tag">{{ item.category }}</span>
          </button>
        </section>

        <section v-if="results.analysis.length" class="home-search__section">
          <h4 class="home-search__section-title">{{ t('home.searchAnalysis') }}</h4>
          <button
            v-for="item in results.analysis"
            :key="item.id"
            type="button"
            class="home-search__item"
            @mousedown.prevent="go(item)"
          >
            <span class="home-search__item-label">{{ item.label }}</span>
            <span v-if="item.desc" class="home-search__item-desc">{{ item.desc }}</span>
            <span class="home-search__item-tag">{{ item.category }}</span>
          </button>
        </section>

        <section v-if="results.glossary.length" class="home-search__section">
          <h4 class="home-search__section-title">{{ t('home.searchGlossary') }}</h4>
          <button
            v-for="item in results.glossary"
            :key="item.id"
            type="button"
            class="home-search__item"
            @mousedown.prevent="go(item)"
          >
            <span class="home-search__item-label">{{ item.label }}</span>
            <span class="home-search__item-desc line-clamp-1">{{ item.desc }}</span>
          </button>
        </section>

        <section v-if="results.formulas.length" class="home-search__section">
          <h4 class="home-search__section-title">{{ t('home.searchFormulas') }}</h4>
          <button
            v-for="item in results.formulas"
            :key="item.id"
            type="button"
            class="home-search__item"
            @mousedown.prevent="go(item)"
          >
            <span class="home-search__item-label">{{ item.label }}</span>
            <span v-if="item.desc" class="home-search__item-desc line-clamp-1">{{ stripLatex(item.desc) }}</span>
            <span class="home-search__item-tag">{{ item.category }}</span>
          </button>
        </section>

        <button type="button" class="home-search__more" @mousedown.prevent="goToolMap">
          {{ t('home.searchViewAll') }}
        </button>
      </template>

      <p v-else class="home-search__empty">{{ t('home.searchEmpty') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useLocale } from '@/composables/useLocale'
import { useSiteSearch } from '@/composables/useSiteSearch'

const router = useRouter()
const { t } = useLocale()
const { searchSite, hasResults } = useSiteSearch()

const query = ref('')
const open = ref(false)
const rootRef = ref(null)

const results = computed(() => searchSite(query.value))
const hasAny = computed(() => hasResults(results.value))
const showPanel = computed(() => open.value && query.value.trim().length > 0)

function stripLatex(text) {
  return String(text ?? '').replace(/\$[^$]+\$/g, '').trim()
}

function closePanel() {
  open.value = false
}

function onEnter() {
  if (!query.value.trim()) return
  if (hasAny.value) {
    const first = [
      ...results.value.tools,
      ...results.value.analysis,
      ...results.value.glossary,
      ...results.value.formulas,
    ][0]
    if (first) go(first)
    return
  }
  goToolMap()
}

function goToolMap() {
  router.push({ path: '/tools', query: { q: query.value.trim() } })
  closePanel()
}

function goStatTool(path, toolQuery) {
  if (path) {
    router.push(path)
  } else {
    router.push({ path: '/statistics', query: { tool: toolQuery } })
  }
}

function go(item) {
  switch (item.kind) {
    case 'tool':
      goStatTool(item.path, item.query)
      break
    case 'analysis':
      router.push({ name: 'editor', query: { type: item.analysisTypeId } })
      break
    case 'glossary':
      router.push({ path: '/glossary', query: { q: query.value.trim() || item.term } })
      break
    case 'formula':
      router.push({ path: '/manual', query: { q: query.value.trim() || item.label } })
      break
    default:
      break
  }
  query.value = ''
  closePanel()
}

function onDocClick(e) {
  if (!rootRef.value?.contains(e.target)) closePanel()
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDocClick))
</script>

<style scoped>
.home-search {
  @apply relative w-full min-w-0 flex-1;
}

.home-search__input {
  @apply w-full;
}

.home-search__input :deep(.el-input__wrapper) {
  @apply rounded-lg shadow-none;
}

.home-search__panel {
  @apply absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(420px,70vh)] overflow-y-auto
    rounded-lg border border-gray-200 bg-white py-2 shadow-lg
    dark:border-gray-600 dark:bg-gray-800;
}

.home-search__section {
  @apply px-2 pb-1;
}

.home-search__section-title {
  @apply px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500;
}

.home-search__item {
  @apply flex w-full flex-col gap-0.5 rounded-md px-2 py-2 text-left transition-colors
    hover:bg-primary/5 dark:hover:bg-primary/10;
}

.home-search__item-label {
  @apply text-sm font-medium text-gray-900 dark:text-gray-100;
}

.home-search__item-desc {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.home-search__item-tag {
  @apply mt-0.5 self-start rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500
    dark:bg-gray-700 dark:text-gray-400;
}

.home-search__more {
  @apply mx-2 mt-1 w-[calc(100%-1rem)] rounded-md border-t border-gray-100 pt-2 text-center text-xs
    text-primary hover:underline dark:border-gray-700;
}

.home-search__empty {
  @apply px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400;
}
</style>
