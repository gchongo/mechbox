<template>
  <header class="border-b border-gray-200 bg-white shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-gray-900">
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
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          "
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', label: '首页' },
  { path: '/editor', label: '分析' },
  { path: '/statistics', label: '统计' },
  { path: '/tutorial', label: '教程' },
  { path: '/cases', label: '案例' },
  { path: '/manual', label: '手册' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
