const SETTINGS_KEY = 'mechbox_settings'

export const DEFAULT_SETTINGS = {
  defaultUnit: 'mm',
  defaultMethod: 'rss',
  theme: 'light',
  locale: 'zh',
  mcIterations: 10000,
  numberPrecision: 2,
  editorAdvancedMode: false,
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(partial) {
  const next = { ...getSettings(), ...partial }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  applyTheme(next.theme)
  applyDocumentLocale(next.locale)
  window.dispatchEvent(new CustomEvent('mechbox-settings', { detail: next }))
  return next
}

export function applyDocumentLocale(locale = 'zh') {
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'
}

export function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function initSettings() {
  const s = getSettings()
  applyTheme(s.theme)
  applyDocumentLocale(s.locale)
}
