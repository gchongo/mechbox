import { computed } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { getDemoData } from '@/i18n/demo-data-i18n'

export function useDemoData() {
  const { locale } = useLocale()
  const demo = computed(() => getDemoData(locale.value))
  return { demo, locale }
}
