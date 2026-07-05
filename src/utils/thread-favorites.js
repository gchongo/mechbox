const STORAGE_KEY = 'mechbox_thread_favorites'
const MAX_ITEMS = 30

/**
 * @returns {string[]}
 */
export function getThreadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list.filter((id) => typeof id === 'string').slice(0, MAX_ITEMS) : []
  } catch {
    return []
  }
}

/** @param {string} rowId */
export function isThreadFavorite(rowId) {
  return getThreadFavorites().includes(rowId)
}

/** @param {string} rowId @returns {boolean} now favorited */
export function toggleThreadFavorite(rowId) {
  const list = getThreadFavorites()
  const idx = list.indexOf(rowId)
  if (idx >= 0) {
    list.splice(idx, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return false
  }
  list.unshift(rowId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ITEMS)))
  return true
}

/** @param {string} rowId */
export function removeThreadFavorite(rowId) {
  const list = getThreadFavorites().filter((id) => id !== rowId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
