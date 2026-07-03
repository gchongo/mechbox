<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__brand">
        <div class="mb-1.5 flex items-center gap-2">
          <AppLogo :size="28" />
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">机械工具箱</h3>
        </div>
        <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          尺寸链叠加分析、概率统计与机械强度计算
        </p>
        <a
          href="https://cax.do"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-1.5 inline-block text-xs text-primary hover:underline"
        >
          CAX FORUM →
        </a>
      </div>

      <div class="app-footer__links">
        <div class="app-footer__col">
          <h4 class="app-footer__heading">学习资源</h4>
          <nav class="app-footer__nav">
            <router-link v-for="link in learnLinks" :key="link.path" :to="link.path">
              {{ link.label }}
            </router-link>
          </nav>
        </div>
        <div class="app-footer__col">
          <h4 class="app-footer__heading">常用入口</h4>
          <nav class="app-footer__nav">
            <router-link to="/editor">尺寸链分析</router-link>
            <router-link to="/statistics">概率统计</router-link>
            <router-link to="/cases">案例库</router-link>
            <router-link to="/history">历史记录</router-link>
          </nav>
        </div>
        <div class="app-footer__col">
          <h4 class="app-footer__heading">帮助</h4>
          <nav class="app-footer__nav">
            <router-link to="/faq">常见问题</router-link>
            <router-link to="/glossary">术语词典</router-link>
            <router-link to="/settings">设置</router-link>
          </nav>
        </div>
      </div>

      <p class="app-footer__copy">© {{ year }} 机械工具箱</p>
    </div>
  </footer>
</template>

<script setup>
import AppLogo from '@/components/common/AppLogo.vue'

const year = new Date().getFullYear()

const learnLinks = [
  { path: '/tutorial', label: '教程' },
  { path: '/cases', label: '案例库' },
  { path: '/quiz', label: '练习题' },
  { path: '/manual', label: '公式手册' },
  { path: '/glossary', label: '术语词典' },
]
</script>

<style scoped>
.app-footer {
  @apply mt-6 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sm:mt-8;
}

.app-footer__inner {
  @apply mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6;
}

.app-footer__brand {
  @apply mb-4 sm:mb-0;
}

.app-footer__links {
  @apply grid grid-cols-3 gap-x-3 gap-y-3 sm:gap-6 lg:grid-cols-3;
}

.app-footer__col {
  @apply min-w-0;
}

.app-footer__heading {
  @apply mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:mb-2 sm:text-xs;
}

.app-footer__nav {
  @apply flex flex-col gap-1;
}

.app-footer__nav a {
  @apply text-xs text-gray-600 hover:text-primary dark:text-gray-400 sm:text-sm;
}

.app-footer__copy {
  @apply mt-4 border-t border-gray-100 pt-3 text-center text-[11px] text-gray-400 dark:border-gray-700 sm:mt-6 sm:pt-4 sm:text-xs;
}

@media (min-width: 640px) {
  .app-footer__inner {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem 2rem;
  }

  .app-footer__brand {
    margin-bottom: 0;
  }

  .app-footer__copy {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .app-footer__inner {
    grid-template-columns: 1.2fr 2.8fr;
  }
}
</style>
