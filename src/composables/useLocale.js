import { ref, onMounted, onUnmounted } from 'vue'
import { getSettings, setLocale, toggleLocale as toggleLocaleSetting } from '@/utils/settings'
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

  function switchLocale(next) {
    setLocale(next)
  }

  function toggleLocale() {
    toggleLocaleSetting()
  }

  return { locale, t: tt, switchLocale, toggleLocale }
}
