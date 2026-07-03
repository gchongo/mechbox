<template>
  <el-dropdown trigger="click" teleported @command="onCommand">
    <button
      type="button"
      class="locale-toggle rounded-md p-1.5 text-sm font-semibold transition-colors sm:px-2 sm:py-2"
      :class="activeClass"
      :title="t('nav.language')"
      :aria-label="t('nav.language')"
    >
      <span class="locale-toggle__label">{{ currentLabel }}</span>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh" :class="{ 'is-active': locale === 'zh' }">
          {{ t('settings.langZh') }}
        </el-dropdown-item>
        <el-dropdown-item command="en" :class="{ 'is-active': locale === 'en' }">
          {{ t('settings.langEn') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'

const { locale, t, switchLocale } = useLocale()

const currentLabel = computed(() => (locale.value === 'en' ? 'EN' : '中'))

const activeClass = computed(() =>
  locale.value === 'en'
    ? 'bg-primary/10 text-primary hover:bg-primary/15'
    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
)

function onCommand(cmd) {
  if (cmd === locale.value) return
  switchLocale(cmd)
}
</script>

<style scoped>
.locale-toggle__label {
  display: inline-block;
  min-width: 1.5rem;
  text-align: center;
  letter-spacing: 0.02em;
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>
