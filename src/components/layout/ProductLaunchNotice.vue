<template>
  <el-alert
    v-if="visible"
    type="info"
    :title="t('product.l1BannerTitle')"
    :closable="true"
    show-icon
    class="mb-4"
    @close="dismiss"
  >
    <p class="text-sm leading-relaxed">{{ t('product.l1BannerBody') }}</p>
    <el-button class="mt-2" size="small" type="primary" plain @click="dismiss">
      {{ t('product.l1BannerDismiss') }}
    </el-button>
  </el-alert>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'

const STORAGE_KEY = 'mechbox-l1-notice-dismissed'
const { t } = useLocale()
const visible = ref(false)

onMounted(() => {
  try {
    visible.value = localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    visible.value = true
  }
})

function dismiss() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}
</script>
