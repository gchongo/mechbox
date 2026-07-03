const STORAGE_KEY = 'mechbox_history'

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAnalysis(record) {
  const history = getHistory()
  const entry = {
    id: record.id ?? crypto.randomUUID(),
    title: record.title ?? '未命名分析',
    date: record.date ?? new Date().toISOString(),
    status: record.status ?? 'draft',
    source: record.source ?? 'editor',
    tool: record.tool ?? null,
    data: record.data ?? {},
  }
  const filtered = history.filter((item) => item.id !== entry.id)
  const updated = [entry, ...filtered].slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return entry
}

export function deleteAnalysis(id) {
  const updated = getHistory().filter((item) => item.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function getAnalysisById(id) {
  return getHistory().find((item) => item.id === id) ?? null
}

export function getRecentHistory(limit = 5) {
  return getHistory().slice(0, limit)
}
