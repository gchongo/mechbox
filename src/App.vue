<template>
  <el-config-provider :locale="elementLocale">
    <div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <main class="mx-auto w-full max-w-7xl flex-1 px-3 py-3 sm:px-4 sm:py-4">
        <router-view />
        <EngineeringDisclaimer
          v-if="route.meta?.engineeringCalc"
          class="mt-8"
        />
      </main>
      <AppFooter />
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import EngineeringDisclaimer from '@/components/calc/EngineeringDisclaimer.vue'
import { getSettings } from '@/utils/settings'

const route = useRoute()
const elementLocale = ref(zhCn)

function syncLocale() {
  elementLocale.value = getSettings().locale === 'en' ? en : zhCn
}

onMounted(() => {
  syncLocale()
  window.addEventListener('mechbox-settings', syncLocale)
})

onUnmounted(() => {
  window.removeEventListener('mechbox-settings', syncLocale)
})
</script>
