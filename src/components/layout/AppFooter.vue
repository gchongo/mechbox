<template>
  <footer class="mt-8 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
    <div class="mx-auto max-w-7xl px-4 py-6">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 class="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">机械工具箱</h3>
          <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            尺寸链叠加分析、概率统计与常用机械强度计算，数据保存在本地浏览器。
          </p>
        </div>
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">学习资源</h4>
          <nav class="flex flex-col gap-1.5">
            <router-link
              v-for="link in learnLinks"
              :key="link.path"
              :to="link.path"
              class="text-sm text-gray-600 hover:text-primary dark:text-gray-400"
            >
              {{ link.label }}
            </router-link>
          </nav>
        </div>
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">常用入口</h4>
          <nav class="flex flex-col gap-1.5">
            <router-link to="/editor" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              尺寸链分析
            </router-link>
            <router-link to="/statistics" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              概率统计
            </router-link>
            <router-link to="/cases" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              案例库
            </router-link>
            <router-link to="/history" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              历史记录
            </router-link>
          </nav>
        </div>
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">帮助</h4>
          <nav class="flex flex-col gap-1.5">
            <router-link to="/faq" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              常见问题
            </router-link>
            <router-link to="/glossary" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              术语词典
            </router-link>
            <router-link to="/settings" class="text-sm text-gray-600 hover:text-primary dark:text-gray-400">
              设置
            </router-link>
          </nav>
        </div>
      </div>
      <p class="mt-6 border-t border-gray-100 pt-4 text-center text-xs text-gray-400 dark:border-gray-700">
        © {{ year }} 机械工具箱 · 本地计算，无需登录
      </p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()

const learnLinks = [
  { path: '/tutorial', label: '教程' },
  { path: '/cases', label: '案例库' },
  { path: '/quiz', label: '练习题' },
  { path: '/manual', label: '公式手册' },
  { path: '/glossary', label: '术语词典' },
]
</script>
