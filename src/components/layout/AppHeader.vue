<template>
  <header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
      <router-link
        to="/"
        class="flex min-w-0 shrink items-center gap-2 font-bold text-gray-900 dark:text-gray-100"
      >
        <AppLogo :size="26" class="shrink-0 sm:hidden" />
        <AppLogo :size="28" class="hidden shrink-0 sm:block" />
        <span class="truncate whitespace-nowrap text-base sm:text-xl">{{ t('appName', locale) }}</span>
      </router-link>

      <nav class="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <router-link
          to="/editor"
          class="rounded-md px-2 py-1.5 text-sm font-medium transition-colors md:hidden"
          :class="route.path.startsWith('/editor') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'"
        >
          分析
        </router-link>

        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="hidden rounded-md px-3 py-2 text-sm font-medium transition-colors md:inline-block"
          :class="navLinkClass(item.path)"
        >
          {{ item.label }}
        </router-link>

        <el-dropdown trigger="click" @command="goTool">
          <button
            type="button"
            class="rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:py-2"
            :class="toolsActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'"
          >
            {{ t('nav.tools', locale) }}
            <el-icon class="ml-0.5 align-middle"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu class="app-header-menu">
              <el-dropdown-item
                v-for="tool in allTools"
                :key="tool.path"
                :command="tool.path"
                :class="{ 'is-active': route.path === tool.path }"
              >
                {{ tool.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown trigger="click" @command="goTool">
          <button
            type="button"
            class="rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:py-2"
            :class="moreActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'"
          >
            {{ t('nav.more', locale) }}
            <el-icon class="ml-0.5 align-middle"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="item in moreItems" :key="item.path" :command="item.path">
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link
          to="/account"
          class="flex items-center rounded-md p-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 sm:px-2 sm:py-2"
          :title="user ? user.username : '登录'"
        >
          <el-icon :size="18"><User /></el-icon>
          <span v-if="user" class="ml-1 hidden max-w-[80px] truncate lg:inline">{{ user.username }}</span>
        </router-link>
        <router-link
          to="/settings"
          class="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 sm:p-2"
          title="设置"
        >
          <el-icon :size="18"><Setting /></el-icon>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentUser } from '@/utils/auth'
import { getSettings } from '@/utils/settings'
import { t } from '@/i18n'
import AppLogo from '@/components/common/AppLogo.vue'

const route = useRoute()
const router = useRouter()
const user = ref(null)
const locale = ref(getSettings().locale ?? 'zh')

const navItems = computed(() => [
  { path: '/', label: t('nav.home', locale.value) },
  { path: '/editor', label: t('nav.editor', locale.value) },
  { path: '/statistics', label: t('nav.stats', locale.value) },
  { path: '/monte-carlo', label: t('nav.mc', locale.value) },
  { path: '/cases', label: t('nav.cases', locale.value) },
  { path: '/manual', label: t('nav.manual', locale.value) },
])

const toolGroups = computed(() => ({
  chain: [
    { path: '/batch', label: locale.value === 'en' ? 'Batch verify' : '批量验证' },
    { path: '/allocation', label: locale.value === 'en' ? 'Tolerance allocation' : '公差分配' },
    { path: '/gear', label: locale.value === 'en' ? 'Gear ISO 6336' : '齿轮 ISO 6336' },
    { path: '/thread', label: locale.value === 'en' ? 'Thread strength' : '螺纹强度' },
    { path: '/bolt-preload', label: locale.value === 'en' ? 'Bolt preload' : '螺栓预紧力' },
    { path: '/bearing', label: locale.value === 'en' ? 'Bearing life' : '轴承寿命' },
  ],
  drive: [
    { path: '/shaft', label: locale.value === 'en' ? 'Shaft strength' : '轴强度' },
    { path: '/key', label: locale.value === 'en' ? 'Key connection' : '平键连接' },
    { path: '/weld', label: locale.value === 'en' ? 'Weld strength' : '焊缝强度' },
    { path: '/bolt-group', label: locale.value === 'en' ? 'Bolt group' : '螺栓组' },
    { path: '/spring', label: locale.value === 'en' ? 'Spring design' : '弹簧设计' },
    { path: '/clutch', label: locale.value === 'en' ? 'Clutch' : '离合器' },
    { path: '/belt', label: locale.value === 'en' ? 'Belt drive' : '皮带传动' },
    { path: '/chain', label: locale.value === 'en' ? 'Chain drive' : '链传动' },
  ],
  material: [
    { path: '/cylinder', label: locale.value === 'en' ? 'Hydraulic / cylinder' : '液压/气缸' },
    { path: '/materials', label: locale.value === 'en' ? 'Materials' : '材料库' },
  ],
}))

const allTools = computed(() => [
  ...toolGroups.value.chain,
  ...toolGroups.value.drive,
  ...toolGroups.value.material,
])

const moreItems = computed(() => [
  { path: '/tutorial', label: t('nav.tutorial', locale.value) },
  { path: '/glossary', label: t('nav.glossary', locale.value) },
  { path: '/faq', label: t('nav.faq', locale.value) },
  { path: '/quiz', label: t('nav.quiz', locale.value) },
  { path: '/history', label: locale.value === 'en' ? 'History' : '历史记录' },
])

const allToolPaths = computed(() => [
  ...toolGroups.value.chain,
  ...toolGroups.value.drive,
  ...toolGroups.value.material,
].map((item) => item.path))

const morePaths = ['/tutorial', '/glossary', '/faq', '/quiz', '/history']

const toolsActive = computed(() => allToolPaths.value.some((p) => route.path.startsWith(p)))
const moreActive = computed(() => morePaths.some((p) => route.path.startsWith(p)))

function refreshUser() {
  user.value = getCurrentUser()
}

function onSettingsChange(e) {
  locale.value = e.detail?.locale ?? getSettings().locale ?? 'zh'
}

onMounted(() => {
  refreshUser()
  window.addEventListener('mechbox-settings', onSettingsChange)
})

onUnmounted(() => {
  window.removeEventListener('mechbox-settings', onSettingsChange)
})

watch(() => route.path, refreshUser)

function navLinkClass(path) {
  const active = isActive(path)
  return active
    ? 'bg-primary/10 text-primary'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function goTool(path) {
  router.push(path)
}
</script>

<style scoped>
:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.app-header-menu) {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
