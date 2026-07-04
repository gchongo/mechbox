<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <div class="app-footer__brand">
        <div class="mb-1.5 flex items-center gap-2">
          <AppLogo :size="28" />
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ t('appName') }}</h3>
        </div>
        <p class="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {{ t('footer.tagline') }}
        </p>
        <a
          :href="FORUM_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-1.5 inline-block text-xs text-primary hover:underline"
        >
          {{ t('footer.forum') }} →
        </a>
      </div>

      <div class="app-footer__links">
        <div class="app-footer__col">
          <h4 class="app-footer__heading">{{ t('footer.learn') }}</h4>
          <nav class="app-footer__nav">
            <router-link v-for="link in learnLinks" :key="link.path" :to="link.path">
              {{ link.label }}
            </router-link>
          </nav>
        </div>
        <div class="app-footer__col">
          <h4 class="app-footer__heading">{{ t('footer.shortcuts') }}</h4>
          <nav class="app-footer__nav">
            <router-link to="/editor">{{ t('footer.stackAnalysis') }}</router-link>
            <router-link to="/statistics">{{ t('footer.statistics') }}</router-link>
            <router-link to="/cases">{{ t('footer.cases') }}</router-link>
            <router-link to="/history">{{ t('footer.history') }}</router-link>
          </nav>
        </div>
        <div class="app-footer__col">
          <h4 class="app-footer__heading">{{ t('footer.help') }}</h4>
          <nav class="app-footer__nav">
            <router-link to="/faq">{{ t('footer.faq') }}</router-link>
            <router-link to="/glossary">{{ t('footer.glossary') }}</router-link>
            <router-link to="/settings">{{ t('footer.settings') }}</router-link>
            <a :href="FORUM_URL" target="_blank" rel="noopener noreferrer">{{ t('footer.forum') }}</a>
          </nav>
        </div>
      </div>

      <p class="app-footer__copy">{{ t('footer.copyright', { year }) }}</p>
      <p class="app-footer__disclaimer">{{ t('footer.disclaimer') }}</p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import AppLogo from '@/components/common/AppLogo.vue'
import { FORUM_URL } from '@/constants/external-links'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const year = new Date().getFullYear()

const learnLinks = computed(() => [
  { path: '/tutorial', label: t('nav.tutorial') },
  { path: '/cases', label: t('footer.cases') },
  { path: '/quiz', label: t('footer.quiz') },
  { path: '/manual', label: t('footer.manual') },
  { path: '/glossary', label: t('footer.glossary') },
])
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

.app-footer__disclaimer {
  @apply mt-2 text-center text-[10px] leading-relaxed text-gray-400 dark:text-gray-500 sm:text-[11px];
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

  .app-footer__disclaimer {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .app-footer__inner {
    grid-template-columns: 1.2fr 2.8fr;
  }
}
</style>
