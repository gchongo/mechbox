import { ref, onMounted, onUnmounted } from 'vue'
import { getSettings } from '@/utils/settings'
import { t } from '@/i18n'

export function useLocale() {
  const locale = ref(getSettings().locale ?? 'zh')

  function onSettingsChange(e) {
    locale.value = e.detail?.locale ?? getSettings().locale ?? 'zh'
  }

  onMounted(() => {
    window.addEventListener('mechbox-settings', onSettingsChange)
  })

  onUnmounted(() => {
    window.removeEventListener('mechbox-settings', onSettingsChange)
  })

  function tt(key, params) {
    return t(key, locale.value, params)
  }

  return { locale, t: tt }
}
