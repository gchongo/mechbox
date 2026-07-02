<template>
  <header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <router-link
        to="/"
        class="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-gray-100"
      >
        <el-icon :size="24" class="text-primary"><Tools /></el-icon>
        <span>MechBox 机械工具箱</span>
      </router-link>

      <nav class="flex items-center gap-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActive(item.path)
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
          "
        >
          {{ item.label }}
        </router-link>
        <router-link
          to="/account"
          class="ml-1 flex items-center gap-1 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          :title="user ? user.username : '登录'"
        >
          <el-icon :size="18"><User /></el-icon>
          <span v-if="user" class="hidden max-w-[80px] truncate sm:inline">{{ user.username }}</span>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCurrentUser } from '@/utils/auth'

const route = useRoute()
const user = ref(null)

const navItems = [
  { path: '/', label: '首页' },
  { path: '/editor', label: '分析' },
  { path: '/statistics', label: '统计' },
  { path: '/monte-carlo', label: '模拟' },
  { path: '/tutorial', label: '教程' },
  { path: '/cases', label: '案例' },
  { path: '/manual', label: '手册' },
  { path: '/glossary', label: '术语' },
]

function refreshUser() {
  user.value = getCurrentUser()
}

onMounted(refreshUser)
watch(() => route.path, refreshUser)

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
