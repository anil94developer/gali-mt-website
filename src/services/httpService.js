import { APP_CONFIG } from '../config/config'

export async function postJson(endpoint, payload) {
  const response = await fetch(`${APP_CONFIG.baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  return { ok: response.ok, data }
}

export function isApiSuccess(value) {
  return String(value) === '1'
}
