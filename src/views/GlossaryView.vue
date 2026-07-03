<template>
  <div>
    <h1 class="page-title mb-6">{{ ct('glossary.title') }}</h1>
    <div class="card-panel mb-6">
      <el-input
        v-model="query"
        clearable
        :placeholder="ct('glossary.searchPlaceholder')"
        prefix-icon="Search"
        class="max-w-md"
      />
      <p class="mt-2 text-sm text-gray-500">{{ ct('glossary.count', { n: filtered.length }) }}</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="item in filtered"
        :key="item.id ?? item.term"
        class="card-panel"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <span class="text-2xl font-serif text-primary">
            <MathContent :text="enrichedText(item.symbol)" />
          </span>
          <h2 class="text-lg font-semibold">{{ item.term }}</h2>
          <el-tag size="small" type="info">{{ item.category }}</el-tag>
        </div>
        <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <MathContent :text="enrichedText(item.definition)" />
        </p>
        <div class="mt-3 flex flex-wrap gap-1">
          <el-tag v-for="tag in item.tags" :key="tag" size="small" effect="plain">
            {{ tag }}
          </el-tag>
        </div>
      </article>
    </div>

    <el-empty v-if="!filtered.length" :description="ct('glossary.empty')" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useContentI18n } from '@/composables/useContentI18n'
import { enrichMathText } from '@/utils/math-label'

const route = useRoute()
const { ct, glossaryTerms, filterGlossary } = useContentI18n()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === 'string') query.value = q
  },
)

function enrichedText(text) {
  return enrichMathText(text)
}

const filtered = computed(() => filterGlossary(glossaryTerms.value, query.value))
</script>
