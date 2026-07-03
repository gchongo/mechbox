<template>
  <header class="app-header sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
      <router-link
        to="/"
        class="flex min-w-0 shrink items-center gap-2 font-bold text-gray-900 dark:text-gray-100"
      >
        <AppLogo :size="36" class="shrink-0" />
        <span class="truncate whitespace-nowrap text-base sm:text-xl">{{ t('appName', locale) }}</span>
      </router-link>

      <nav class="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <router-link
          to="/editor"
          class="rounded-md px-2 py-1.5 text-sm font-medium transition-colors md:hidden"
          :class="route.path.startsWith('/editor') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300'"
        >
          {{ t('nav.analysis', locale) }}
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

        <el-dropdown
          trigger="click"
          :hide-on-click="true"
          teleported
          popper-class="app-header-tools-popper"
          :popper-options="toolsPopperOptions"
          @command="goTool"
        >
          <button
            type="button"
            class="rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 sm:py-2"
            :class="toolsActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'"
          >
            {{ t('nav.tools', locale) }}
            <el-icon class="ml-0.5 align-middle"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu class="app-header-tools-menu">
              <el-scrollbar max-height="var(--app-tools-menu-max-h)" wrap-class="app-header-tools-scroll">
                <el-dropdown-item
                  v-for="tool in allTools"
                  :key="tool.path"
                  :command="tool.path"
                  :class="{ 'is-active': route.path === tool.path }"
                >
                  {{ tool.label }}
                </el-dropdown-item>
              </el-scrollbar>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dropdown
          trigger="click"
          teleported
          popper-class="app-header-more-popper"
          :popper-options="toolsPopperOptions"
          @command="goTool"
        >
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
          :title="user ? user.username : t('nav.login', locale)"
        >
          <el-icon :size="18"><User /></el-icon>
          <span v-if="user" class="ml-1 hidden max-w-[80px] truncate lg:inline">{{ user.username }}</span>
        </router-link>
        <router-link
          to="/settings"
          class="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 sm:p-2"
          :title="t('nav.settings', locale)"
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
import { t, localizedToolLabel } from '@/i18n'
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

const toolsPopperOptions = {
  strategy: 'fixed',
  modifiers: [
    { name: 'offset', options: { offset: [0, 6] } },
    { name: 'preventOverflow', options: { padding: 8, altAxis: true } },
    { name: 'flip', options: { fallbackPlacements: ['bottom-end', 'top-end'] } },
  ],
}

const TOOL_PATHS = {
  chain: [
    '/batch', '/allocation', '/fit', '/gdt-stack', '/units', '/fatigue',
    '/interference-fit', '/thermal-expansion', '/gear', '/thread', '/bolt-preload', '/bearing',
  ],
  drive: [
    '/beam', '/sheet-metal', '/o-ring', '/shaft', '/key', '/weld',
    '/bolt-group', '/spring', '/clutch', '/belt', '/chain',
  ],
  material: [
    '/structural', '/analytics', '/cylinder', '/materials', '/material-selection',
    '/heat-treatment', '/manufacturing', '/quality',
  ],
}

function mapToolPaths(paths) {
  return paths.map((path) => ({
    path,
    label: localizedToolLabel(path, locale.value),
  }))
}

const toolGroups = computed(() => ({
  chain: mapToolPaths(TOOL_PATHS.chain),
  drive: mapToolPaths(TOOL_PATHS.drive),
  material: mapToolPaths(TOOL_PATHS.material),
}))

const allTools = computed(() => [
  ...toolGroups.value.chain,
  ...toolGroups.value.drive,
  ...toolGroups.value.material,
])

const moreItems = computed(() => [
  { path: '/tools', label: t('tools.tool-map', locale.value) },
  { path: '/tutorial', label: t('nav.tutorial', locale.value) },
  { path: '/glossary', label: t('nav.glossary', locale.value) },
  { path: '/faq', label: t('nav.faq', locale.value) },
  { path: '/quiz', label: t('nav.quiz', locale.value) },
  { path: '/history', label: t('tools.history', locale.value) },
])

const allToolPaths = computed(() => [
  ...toolGroups.value.chain,
  ...toolGroups.value.drive,
  ...toolGroups.value.material,
].map((item) => item.path))

const morePaths = ['/tools', '/tutorial', '/glossary', '/faq', '/quiz', '/history']

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
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  router.push(path)
}
</script>

<style scoped>
.app-header {
  /* 半透明 + 模糊，滚动时仍可读 */
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
}

.dark .app-header {
  background-color: rgba(31, 41, 55, 0.92);
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>

<!-- popper 挂载到 body，需非 scoped 样式 -->
<style>
:root {
  --app-tools-menu-max-h: min(420px, calc(100dvh - 72px));
}

@media (max-width: 768px) {
  :root {
    --app-tools-menu-max-h: calc(100dvh - 64px);
  }
}

.app-header-tools-popper.el-popper,
.app-header-more-popper.el-popper {
  padding: 0;
}

.app-header-tools-menu {
  padding: 0;
  border: none;
  box-shadow: none;
  background: transparent;
}

.app-header-tools-scroll {
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.app-header-tools-scroll .el-scrollbar__wrap {
  overscroll-behavior: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}

.app-header-tools-scroll .el-scrollbar__view {
  padding: 4px 0;
}

.app-header-tools-popper .el-dropdown-menu__item,
.app-header-more-popper .el-dropdown-menu__item {
  line-height: 1.4;
  padding-top: 8px;
  padding-bottom: 8px;
}
</style>
