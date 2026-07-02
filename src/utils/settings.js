const SETTINGS_KEY = 'mechbox_settings'

export const DEFAULT_SETTINGS = {
  defaultUnit: 'mm',
  defaultMethod: 'rss',
  theme: 'light',
  mcIterations: 10000,
  numberPrecision: 2,
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
  return next
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
  applyTheme(getSettings().theme)
}
