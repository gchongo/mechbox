<template>
  <section class="thread-glossary">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('glossaryIntro') }}</p>

    <el-input
      v-model="query"
      clearable
      class="mb-4 max-w-md"
      :placeholder="pt('glossarySearch')"
    >
      <template #prefix><el-icon><Search /></el-icon></template>
    </el-input>

    <div v-for="group in filteredGroups" :key="group.id" class="glossary-group">
      <h3 class="glossary-group__title">{{ pt(group.titleKey) }}</h3>
      <dl class="glossary-list">
        <div v-for="item in group.items" :key="item.key" class="glossary-item">
          <dt><MathContent :text="item.labelKey ? pt(item.labelKey) : pt(item.key)" /></dt>
          <dd><MathContent :text="pt(item.key)" /></dd>
        </div>
      </dl>
    </div>

    <el-empty v-if="!filteredGroups.length" :description="pt('glossaryEmpty')" />
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import MathContent from '@/components/common/MathContent.vue'
import { THREAD_GLOSSARY_GROUPS } from '@/constants/thread-standards/glossary'

defineProps({
  pt: { type: Function, required: true },
})

const query = ref('')

const filteredGroups = computed(() => {
  const q = query.value.trim().toLowerCase()
  return THREAD_GLOSSARY_GROUPS.map((group) => {
    const items = group.items.filter((item) => {
      if (!q) return true
      const term = item.key
      const label = item.labelKey ?? item.key
      return (
        term.toLowerCase().includes(q)
        || label.toLowerCase().includes(q)
      )
    })
    return items.length ? { ...group, items } : null
  }).filter(Boolean)
})
</script>

<style scoped>
.glossary-group {
  @apply mb-6;
}
.glossary-group__title {
  @apply mb-3 border-b border-gray-100 pb-2 text-sm font-semibold dark:border-gray-700;
}
.glossary-list {
  @apply m-0 grid gap-3 sm:grid-cols-2;
}
.glossary-item {
  @apply rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-gray-700 dark:bg-gray-900/30;
}
.glossary-item dt {
  @apply mb-1 text-sm font-medium text-gray-900 dark:text-gray-100;
}
.glossary-item dt :deep(.katex) {
  font-size: 1em;
}
.glossary-item dd {
  @apply m-0 text-xs leading-relaxed text-gray-600 dark:text-gray-400;
}
.glossary-item dd :deep(.katex) {
  font-size: 1em;
}
</style>
