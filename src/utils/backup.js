import { getHistory } from './storage'
import { getSettings } from './settings'
import { getFavorites } from './favorites'
import { getCurrentUser } from './auth'

export function exportFullBackup() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: getCurrentUser(),
    settings: getSettings(),
    history: getHistory(),
    favorites: getFavorites(),
  }
}

export function downloadBackup() {
  const data = exportFullBackup()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `mechbox_backup_${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function importFullBackup(json, { merge = true } = {}) {
  const data = typeof json === 'string' ? JSON.parse(json) : json
  if (!data || !data.version) throw new Error('无效的备份文件')

  if (data.settings) {
    localStorage.setItem('mechbox_settings', JSON.stringify(data.settings))
  }
  if (data.favorites) {
    localStorage.setItem('mechbox_favorites', JSON.stringify(data.favorites))
  }
  if (data.history) {
    if (merge) {
      const existing = getHistory()
      const map = new Map(existing.map((h) => [h.id, h]))
      for (const item of data.history) {
        map.set(item.id, item)
      }
      const merged = [...map.values()]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50)
      localStorage.setItem('mechbox_history', JSON.stringify(merged))
    } else {
      localStorage.setItem('mechbox_history', JSON.stringify(data.history.slice(0, 50)))
    }
  }
  return {
    historyCount: data.history?.length ?? 0,
    favoritesCount: data.favorites?.length ?? 0,
  }
}
