import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'

export async function getPendingBetHistory(userId, tblCode = 'all', page = 1) {
  const { data } = await postJson(API_ENDPOINTS.pendingBetHistory, {
    app_id: APP_CONFIG.appId,
    user_id: String(userId || ''),
    tbl_code: tblCode,
    page,
  })

  const payload = data?.data
  if (!payload || !isApiSuccess(payload.success)) {
    throw new Error(payload?.message || 'Unable to fetch pending bet history.')
  }

  return {
    rows: Array.isArray(payload.data) ? payload.data : [],
    pagination: Number(payload.pagination || 1),
    totalRecords: Number(data?.totalRecords || 0),
  }
}
