<template>
  <header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <router-link
        to="/"
        class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100"
      >
        <el-icon :size="24" class="text-primary"><Tools /></el-icon>
        <span class="hidden sm:inline">MechBox 机械工具箱</span>
        <span class="sm:hidden">MechBox</span>
      </router-link>

      <nav class="flex items-center gap-1">
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
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="toolsActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'"
          >
            工具
            <el-icon class="ml-0.5 align-middle"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled class="!text-xs !text-gray-400">V2.0 尺寸链 / 机械</el-dropdown-item>
              <el-dropdown-item
                v-for="t in toolGroups.v2"
                :key="t.path"
                :command="t.path"
                :class="{ 'is-active': route.path === t.path }"
              >
                {{ t.label }}
              </el-dropdown-item>
              <el-dropdown-item divided disabled class="!text-xs !text-gray-400">V3.0 传动结构</el-dropdown-item>
              <el-dropdown-item v-for="t in toolGroups.v3" :key="t.path" :command="t.path">
                {{ t.label }}
              </el-dropdown-item>
              <el-dropdown-item divided disabled class="!text-xs !text-gray-400">V4.0 流体材料</el-dropdown-item>
              <el-dropdown-item v-for="t in toolGroups.v4" :key="t.path" :command="t.path">
                {{ t.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <router-link
          to="/account"
          class="ml-1 flex items-center gap-1 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          :title="user ? user.username : '登录'"
        >
          <el-icon :size="18"><User /></el-icon>
          <span v-if="user" class="hidden max-w-[80px] truncate lg:inline">{{ user.username }}</span>
        </router-link>
        <router-link
          to="/settings"
          class="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          title="设置"
        >
          <el-icon :size="18"><Setting /></el-icon>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentUser } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const user = ref(null)

const navItems = [
  { path: '/', label: '首页' },
  { path: '/editor', label: '分析' },
  { path: '/statistics', label: '统计' },
  { path: '/monte-carlo', label: '模拟' },
  { path: '/cases', label: '案例' },
  { path: '/manual', label: '手册' },
]

const toolGroups = {
  v2: [
    { path: '/batch', label: '批量验证' },
    { path: '/allocation', label: '公差分配' },
    { path: '/gear', label: '齿轮 ISO 6336' },
    { path: '/thread', label: '螺纹强度' },
    { path: '/bearing', label: '轴承寿命' },
  ],
  v3: [
    { path: '/shaft', label: '轴扭转' },
    { path: '/spring', label: '弹簧设计' },
    { path: '/clutch', label: '离合器' },
    { path: '/belt', label: '皮带传动' },
    { path: '/chain', label: '链传动' },
  ],
  v4: [
    { path: '/cylinder', label: '液压/气缸' },
    { path: '/materials', label: '材料库' },
  ],
}

const allToolPaths = [
  ...toolGroups.v2,
  ...toolGroups.v3,
  ...toolGroups.v4,
].map((t) => t.path)

const toolsActive = computed(() => allToolPaths.some((p) => route.path.startsWith(p)))

function refreshUser() {
  user.value = getCurrentUser()
}

onMounted(refreshUser)
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
</style>
