import { API_ENDPOINTS, APP_CONFIG } from '../config/config'
import { isApiSuccess, postJson } from './httpService'
import { saveSession } from './sessionService'

export async function loginUser({ mobileNum, pss }) {
  const { data } = await postJson(API_ENDPOINTS.login, {
    mobileNum: mobileNum.trim(),
    pss,
    dev_id: APP_CONFIG.devId,
    app_id: APP_CONFIG.appId,
  })

  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Login failed.')
  }

  const session = {
    userId: data.user_id,
    name: data.name,
    mobileNum: mobileNum.trim(),
    token: data.login_token,
  }

  saveSession(session)
  return { session, message: data.message || 'Login successful.' }
}

export async function registerStep1({ name, mobileNum, pss }) {
  const { data } = await postJson(API_ENDPOINTS.registerStep1, {
    name: name.trim(),
    pss,
    mobileNum: mobileNum.trim(),
    lat: '0',
    lng: '0',
    dev_id: APP_CONFIG.devId,
    app_id: APP_CONFIG.appId,
  })

  if (!isApiSuccess(data.success)) {
    throw new Error(data.message || 'Could not send OTP.')
  }

  return data.message || 'OTP sent successfully.'
}

export async function registerUser({ name, mobileNum, pss, otp, refercode }) {
  const { ok, data } = await postJson(API_ENDPOINTS.register, {
    name: name.trim(),
    pss,
    mobileNum: mobileNum.trim(),
    otp: otp.trim(),
    refercode: refercode.trim(),
    dev_id: APP_CONFIG.devId,
    app_id: APP_CONFIG.appId,
  })

  if (!ok || !isApiSuccess(data.success)) {
    throw new Error(data.message || 'Registration failed.')
  }

  const session = {
    userId: data.user_id,
    name: name.trim(),
    mobileNum: mobileNum.trim(),
    token: data.auth || '',
  }

  saveSession(session)
  return { session, message: data.message || 'User registered successfully.' }
}
