const USER_KEY = 'pod_user'
const TOKEN_KEY = 'pod_auth_token'

export function saveSession(session) {
  if (!session) return
  localStorage.setItem(USER_KEY, JSON.stringify(session))
  localStorage.setItem(TOKEN_KEY, session.token || '')
}

export function getSession() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
