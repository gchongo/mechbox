const API_BASE = '/api'

let cachedUser = undefined
let inflight = null

const AUTH_CHANGED = 'mechbox-auth-changed'

export function onAuthChanged(listener) {
  window.addEventListener(AUTH_CHANGED, listener)
  return () => window.removeEventListener(AUTH_CHANGED, listener)
}

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED))
}

function normalizeUser(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    username: raw.username,
    name: raw.name || raw.username,
    email: raw.email || '',
    avatarUrl: raw.avatarUrl || '',
    admin: !!raw.admin,
    moderator: !!raw.moderator,
    groups: raw.groups || [],
    loggedInAt: raw.loggedInAt || null,
    createdAt: raw.loggedInAt || null,
  }
}

export async function fetchCurrentUser({ force = false } = {}) {
  if (!force && cachedUser !== undefined) {
    return cachedUser
  }
  if (!force && inflight) {
    return inflight
  }

  inflight = fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
    .then(async (res) => {
      if (!res.ok) {
        cachedUser = null
        return null
      }
      const data = await res.json()
      cachedUser = normalizeUser(data.user)
      return cachedUser
    })
    .catch(() => {
      cachedUser = null
      return null
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function getCurrentUser() {
  return cachedUser ?? null
}

export function isLoggedIn() {
  return !!cachedUser
}

export function clearAuthCache() {
  cachedUser = undefined
}

export function startLogin(returnPath) {
  const path = returnPath || `${window.location.pathname}${window.location.search}`
  const safe = path.startsWith('/') && !path.startsWith('//') ? path : '/'
  // 经静态网关页跳转，避免旧版 PWA Service Worker 拦截 /api 导致白屏
  window.location.href = `/auth-login.html?return=${encodeURIComponent(safe)}`
}

export function loginGatewayUrl(returnPath = '/account') {
  const safe = returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/account'
  return `/auth-login.html?return=${encodeURIComponent(safe)}`
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } finally {
    cachedUser = null
    notifyAuthChanged()
  }
}

export async function initAuth() {
  const user = await fetchCurrentUser({ force: true })
  notifyAuthChanged()
  return user
}

/** @deprecated 本机账号已移除，请使用 startLogin */
export async function login() {
  startLogin()
  return null
}

/** @deprecated */
export async function register() {
  throw new Error('请使用 CAX 论坛账号登录')
}

/** @deprecated */
export function deleteAccount() {
  logout()
}
