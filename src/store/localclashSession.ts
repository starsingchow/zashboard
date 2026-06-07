import {
  fetchLocalClashSessionAPI,
  getLocalClashErrorMessage,
  loginLocalClashAPI,
  logoutLocalClashAPI,
  setLocalClashCsrfToken,
  setupLocalClashAPI,
} from '@/api/localclash'
import type {
  LocalClashAuthResponse,
  LocalClashLoginRequest,
  LocalClashSessionResponse,
  LocalClashSetupRequest,
} from '@/types/localclash'
import { ref } from 'vue'

export const authenticated = ref(false)
export const setupRequired = ref(false)
export const loading = ref(false)
export const error = ref<string | null>(null)
export const csrf = ref<string | null>(null)

const updateCsrf = (token?: string | null) => {
  csrf.value = token || null
  setLocalClashCsrfToken(csrf.value)
}

const applySession = (data: LocalClashSessionResponse | LocalClashAuthResponse) => {
  authenticated.value = data.authenticated
  setupRequired.value = 'setup_required' in data ? Boolean(data.setup_required) : false

  if ('csrf_token' in data) {
    updateCsrf(data.csrf_token)
  } else if (!data.authenticated) {
    updateCsrf(null)
  }
}

const runSessionRequest = async <T>(request: () => Promise<T>) => {
  loading.value = true
  error.value = null

  try {
    return await request()
  } catch (err) {
    error.value = getLocalClashErrorMessage(err)
    throw err
  } finally {
    loading.value = false
  }
}

export const refresh = async () => {
  return runSessionRequest(async () => {
    const { data } = await fetchLocalClashSessionAPI()

    applySession(data)
    return data
  })
}

export const setup = async (payload: LocalClashSetupRequest | string, password = '') => {
  return runSessionRequest(async () => {
    const request = typeof payload === 'string' ? { token: payload, password } : payload
    const { data } = await setupLocalClashAPI(request)

    applySession(data)
    return data
  })
}

export const login = async (payload: LocalClashLoginRequest | string) => {
  return runSessionRequest(async () => {
    const request = typeof payload === 'string' ? { password: payload } : payload
    const { data } = await loginLocalClashAPI(request)

    applySession(data)
    return data
  })
}

export const logout = async () => {
  return runSessionRequest(async () => {
    const { data } = await logoutLocalClashAPI()

    authenticated.value = false
    setupRequired.value = false
    updateCsrf(null)

    return data
  })
}
