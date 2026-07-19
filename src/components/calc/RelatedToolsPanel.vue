<template>
  <div v-if="links.length" class="related-tools card-panel">
    <h3 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{{ title }}</h3>
    <p class="mb-3 text-xs text-gray-500">{{ subtitle }}</p>
    <div class="flex flex-wrap gap-2">
      <router-link
        v-for="item in links"
        :key="item.path"
        :to="item.path"
        class="related-tools__link"
      >
        {{ item.label }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { getRelatedToolLinks } from '@/constants/related-tools'
import { localizedToolLabel } from '@/i18n'

const props = defineProps({
  toolId: { type: String, required: true },
})

const { locale } = useLocale()

const title = computed(() =>
  locale.value === 'en' ? 'Next steps' : '下一步建议',
)
const subtitle = computed(() =>
  locale.value === 'en'
    ? 'Jump to related calculators for the typical design flow.'
    : '按常见设计流程跳转到相关计算器。',
)

const links = computed(() =>
  getRelatedToolLinks(props.toolId, locale.value).map((item) => ({
    ...item,
    label: localizedToolLabel(item.path, locale.value, item.id),
  })),
)
</script>

<style scoped>
.related-tools__link {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: var(--el-color-primary);
  background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  text-decoration: none;
  transition: background 0.15s;
}
.related-tools__link:hover {
  background: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
}
</style>
