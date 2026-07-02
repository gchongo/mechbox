const USER_KEY = 'mechbox_user'
const SESSION_KEY = 'mechbox_session'

async function hashPassword(password) {
  const data = new TextEncoder().encode(password)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getCurrentUser() {
  const session = sessionStorage.getItem(SESSION_KEY)
  if (!session) return null
  const user = readUser()
  if (!user || user.username !== session) return null
  return { username: user.username, createdAt: user.createdAt }
}

export function isLoggedIn() {
  return !!getCurrentUser()
}

export async function register(username, password) {
  const name = username.trim()
  if (!name || name.length < 2) throw new Error('用户名至少 2 个字符')
  if (!password || password.length < 4) throw new Error('密码至少 4 个字符')
  if (readUser()) throw new Error('本设备已注册账号，请先删除后重新注册')

  const user = {
    username: name,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  sessionStorage.setItem(SESSION_KEY, name)
  return { username: name }
}

export async function login(username, password) {
  const user = readUser()
  if (!user) throw new Error('尚未注册，请先注册')
  if (user.username !== username.trim()) throw new Error('用户名不正确')
  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) throw new Error('密码不正确')
  sessionStorage.setItem(SESSION_KEY, user.username)
  return { username: user.username }
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function deleteAccount() {
  logout()
  localStorage.removeItem(USER_KEY)
}
