const FAVORITES_KEY = 'mechbox_favorites'

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function isFavorite(id) {
  return getFavorites().includes(id)
}

export function toggleFavorite(id) {
  const list = getFavorites()
  const idx = list.indexOf(id)
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    list.unshift(id)
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list.slice(0, 100)))
  return idx < 0
}

export function removeFavorite(id) {
  const list = getFavorites().filter((f) => f !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
}
