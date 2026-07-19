<template>
  <header class="app-header sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
      <router-link
        to="/"
        class="flex min-w-0 items-center gap-2 font-bold text-gray-900 dark:text-gray-100"
      >
        <AppLogo :size="36" class="shrink-0" />
        <span class="truncate text-base sm:text-xl">{{ t('appName', locale) }}</span>
      </router-link>

      <!-- 桌面端导航 -->
      <nav class="hidden items-center gap-0.5 md:flex md:gap-1">
        <template v-for="item in navItems" :key="item.path">
          <a
            v-if="item.external"
            :href="item.path"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            {{ item.label }}
          </a>
          <router-link
            v-else
            :to="item.path"
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="navLinkClass(item.path)"
          >
            {{ item.label }}
          </router-link>
        </template>

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
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
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
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
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

        <LocaleToggle />

        <router-link
          to="/account"
          class="flex items-center rounded-md px-2 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          :title="user ? user.username : t('nav.login', locale)"
        >
          <el-icon :size="18"><User /></el-icon>
          <span v-if="user" class="ml-1 max-w-[80px] truncate lg:inline">{{ user.username }}</span>
        </router-link>
        <router-link
          to="/settings"
          class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          :title="t('nav.settings', locale)"
        >
          <el-icon :size="18"><Setting /></el-icon>
        </router-link>
      </nav>

      <!-- 移动端：仅菜单按钮（勿在 scoped 里写 display，否则会盖掉 md:hidden） -->
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 md:hidden"
        :aria-label="t('nav.menu', locale)"
        :aria-expanded="mobileOpen"
        @click="mobileOpen = true"
      >
        <el-icon :size="22"><Menu /></el-icon>
      </button>
    </div>

    <el-drawer
      v-model="mobileOpen"
      direction="rtl"
      size="min(300px, 88vw)"
      class="app-header-mobile-drawer"
      :title="t('nav.menu', locale)"
      :append-to-body="true"
    >
      <nav class="mobile-nav" :aria-label="t('nav.menu', locale)">
        <section class="mobile-nav__section">
          <ul class="mobile-nav__list">
            <li v-for="item in navItems" :key="item.path">
              <a
                v-if="item.external"
                :href="item.path"
                target="_blank"
                rel="noopener noreferrer"
                class="mobile-nav__link"
                @click="mobileOpen = false"
              >
                {{ item.label }}
              </a>
              <router-link
                v-else
                :to="item.path"
                class="mobile-nav__link"
                :class="{ 'is-active': isActive(item.path) }"
                @click="mobileOpen = false"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </section>

        <section v-for="group in mobileToolGroups" :key="group.id" class="mobile-nav__section">
          <h3 class="mobile-nav__heading">{{ group.label }}</h3>
          <ul class="mobile-nav__list">
            <li v-for="tool in group.tools" :key="tool.path">
              <button
                type="button"
                class="mobile-nav__link mobile-nav__link--btn"
                :class="{ 'is-active': route.path === tool.path }"
                @click="goTool(tool.path)"
              >
                {{ tool.label }}
              </button>
            </li>
          </ul>
        </section>

        <section class="mobile-nav__section">
          <h3 class="mobile-nav__heading">{{ t('nav.more', locale) }}</h3>
          <ul class="mobile-nav__list">
            <li v-for="item in moreItems" :key="item.path">
              <button
                type="button"
                class="mobile-nav__link mobile-nav__link--btn"
                :class="{ 'is-active': route.path.startsWith(item.path) }"
                @click="goTool(item.path)"
              >
                {{ item.label }}
              </button>
            </li>
          </ul>
        </section>

        <section class="mobile-nav__footer">
          <div class="mobile-nav__footer-row">
            <span class="mobile-nav__footer-label">{{ t('nav.language', locale) }}</span>
            <LocaleToggle />
          </div>
          <router-link to="/account" class="mobile-nav__footer-link" @click="mobileOpen = false">
            <el-icon><User /></el-icon>
            <span>{{ user ? user.username : t('nav.login', locale) }}</span>
          </router-link>
          <router-link to="/settings" class="mobile-nav__footer-link" @click="mobileOpen = false">
            <el-icon><Setting /></el-icon>
            <span>{{ t('nav.settings', locale) }}</span>
          </router-link>
        </section>
      </nav>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Menu, User, Setting } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'
import { getSettings } from '@/utils/settings'
import { FORUM_URL } from '@/constants/external-links'
import { t, localizedToolLabel } from '@/i18n'
import AppLogo from '@/components/common/AppLogo.vue'
import LocaleToggle from '@/components/layout/LocaleToggle.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const locale = ref(getSettings().locale ?? 'zh')
const mobileOpen = ref(false)

const navItems = computed(() => [
  { path: '/', label: t('nav.home', locale.value) },
  { path: '/editor', label: t('nav.editor', locale.value) },
  { path: '/statistics', label: t('nav.stats', locale.value) },
  { path: '/monte-carlo', label: t('nav.mc', locale.value) },
  { path: '/help', label: t('nav.help', locale.value) },
  { path: FORUM_URL, label: t('nav.forum', locale.value), external: true },
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
    '/pipe-flow', '/plate-buckling', '/modal-freq',
  ],
  material: [
    '/analytics', '/cylinder', '/materials', '/material-selection',
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

const mobileToolGroups = computed(() =>
  (['chain', 'drive', 'material']).map((id) => ({
    id,
    label: t(`toolGroups.${id}`, locale.value),
    tools: toolGroups.value[id],
  })),
)

const moreItems = computed(() => [
  { path: '/tools', label: t('tools.tool-map', locale.value) },
  { path: '/cases', label: t('nav.cases', locale.value) },
  { path: '/manual', label: t('nav.manual', locale.value) },
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

const morePaths = ['/tools', '/cases', '/manual', '/tutorial', '/glossary', '/faq', '/quiz']

function onSettingsChange(e) {
  locale.value = e.detail?.locale ?? getSettings().locale ?? 'zh'
}

onMounted(() => {
  window.addEventListener('mechbox-settings', onSettingsChange)
})

onUnmounted(() => {
  window.removeEventListener('mechbox-settings', onSettingsChange)
})

watch(() => route.path, () => {
  mobileOpen.value = false
})

const toolsActive = computed(() => allToolPaths.value.some((p) => route.path.startsWith(p)))
const moreActive = computed(() => morePaths.some((p) => route.path.startsWith(p)))

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
  mobileOpen.value = false
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
  if (String(path).startsWith('http')) {
    window.open(path, '_blank', 'noopener,noreferrer')
    return
  }
  router.push(path)
}
</script>

<style scoped>
.app-header {
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
}

.dark .app-header {
  background-color: rgba(31, 41, 55, 0.92);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;
}

.mobile-nav__section {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 0.75rem;
}

.mobile-nav__section:last-of-type {
  border-bottom: none;
}

.mobile-nav__heading {
  margin: 0 0 0.35rem;
  padding: 0 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
}

.mobile-nav__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.mobile-nav__link {
  display: block;
  width: 100%;
  border-radius: 0.5rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
  text-decoration: none;
  transition: background-color 0.15s;
}

.mobile-nav__link--btn {
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.mobile-nav__link:hover,
.mobile-nav__link.is-active {
  background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  color: var(--el-color-primary);
}

.mobile-nav__footer {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--el-border-color-lighter);
}

.mobile-nav__footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.35rem 0.25rem 0.5rem;
}

.mobile-nav__footer-label {
  font-size: 0.8125rem;
  color: var(--el-text-color-secondary);
}

.mobile-nav__footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
  padding: 0.55rem 0.65rem;
  font-size: 0.9375rem;
  color: var(--el-text-color-primary);
  text-decoration: none;
}

.mobile-nav__footer-link:hover {
  background: var(--el-fill-color-light);
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>

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

.app-header-mobile-drawer .el-drawer__body {
  padding: 0.75rem 1rem 1.25rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
