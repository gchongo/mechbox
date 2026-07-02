<template>
  <el-config-provider :locale="elementLocale">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <main class="mx-auto max-w-7xl px-4 py-6">
        <router-view />
      </main>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import AppHeader from '@/components/layout/AppHeader.vue'
import { getSettings } from '@/utils/settings'

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
