import type {
  LocalClashApiErrorBody,
  LocalClashAuthResponse,
  LocalClashChainAction,
  LocalClashChainActionResponse,
  LocalClashChainConfigResponse,
  LocalClashChainSummaryResponse,
  LocalClashChainTestRequest,
  LocalClashEntryProviderPayload,
  LocalClashEntryProviderPreviewRequest,
  LocalClashEntryProviderPreviewResponse,
  LocalClashManagedNode,
  LocalClashNodeTag,
  LocalClashNodesResponse,
  LocalClashRuleProfile,
  LocalClashRuleOverride,
  LocalClashServiceChain,
  LocalClashSourcePreviewRequest,
  LocalClashSourcePreviewResponse,
  LocalClashLoginRequest,
  LocalClashMutationResponse,
  LocalClashOwnedExitImportPreviewRequest,
  LocalClashOwnedExitImportCommitRequest,
  LocalClashOwnedExitImportPreviewResponse,
  LocalClashOwnedExitManualPreviewResponse,
  LocalClashOwnedExitPayload,
  LocalClashRenderedSummaryResponse,
  LocalClashRoutePayload,
  LocalClashSessionResponse,
  LocalClashSetupRequest,
} from '@/types/localclash'
import axios, { AxiosHeaders } from 'axios'

let localClashCsrfToken = ''

const needsCsrfToken = (method?: string) => {
  const normalizedMethod = method?.toUpperCase() || 'GET'

  return !['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)
}

export const setLocalClashCsrfToken = (token?: string | null) => {
  localClashCsrfToken = token || ''
}

export const getLocalClashCsrfToken = () => localClashCsrfToken

export const localClashAPI = axios.create({
  baseURL: import.meta.env.VITE_LOCALCLASH_API_BASE || '',
  withCredentials: true,
})

localClashAPI.interceptors.request.use((config) => {
  if (localClashCsrfToken && needsCsrfToken(config.method)) {
    const headers = AxiosHeaders.from(config.headers)

    headers.set('X-CSRF-Token', localClashCsrfToken)
    config.headers = headers
  }

  return config
})

export const getLocalClashErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<LocalClashApiErrorBody>(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

export const fetchLocalClashSessionAPI = () => {
  return localClashAPI.get<LocalClashSessionResponse>('/api/session')
}

export const setupLocalClashAPI = (data: LocalClashSetupRequest) => {
  return localClashAPI.post<LocalClashAuthResponse>('/api/setup', data)
}

export const loginLocalClashAPI = (data: LocalClashLoginRequest) => {
  return localClashAPI.post<LocalClashAuthResponse>('/api/login', data)
}

export const logoutLocalClashAPI = () => {
  return localClashAPI.post<LocalClashMutationResponse>('/api/logout')
}

export const fetchLocalClashChainConfigAPI = () => {
  return localClashAPI.get<LocalClashChainConfigResponse>('/api/chain/config')
}

export const fetchLocalClashChainSummaryAPI = () => {
  return localClashAPI.get<LocalClashChainSummaryResponse>('/api/chain/summary')
}

export const fetchLocalClashRenderedSummaryAPI = () => {
  return localClashAPI.get<LocalClashRenderedSummaryResponse>('/api/chain/rendered-summary')
}

export const previewLocalClashEntryProviderAPI = (
  data: LocalClashEntryProviderPreviewRequest,
) => {
  return localClashAPI.post<LocalClashEntryProviderPreviewResponse>(
    '/api/chain/entry-providers/preview',
    data,
  )
}

export const saveLocalClashEntryProviderAPI = (
  name: string,
  data: LocalClashEntryProviderPayload,
) => {
  return localClashAPI.put<LocalClashMutationResponse>(
    `/api/chain/entry-providers/${encodeURIComponent(name)}`,
    data,
  )
}

export const removeLocalClashEntryProviderAPI = (name: string) => {
  return localClashAPI.delete<LocalClashMutationResponse>(
    `/api/chain/entry-providers/${encodeURIComponent(name)}`,
  )
}

export const previewLocalClashOwnedExitImportAPI = (
  data: LocalClashOwnedExitImportPreviewRequest,
) => {
  return localClashAPI.post<LocalClashOwnedExitImportPreviewResponse>(
    '/api/chain/owned-exits/import-preview',
    data,
  )
}

export const commitLocalClashOwnedExitImportAPI = (
  data: LocalClashOwnedExitImportCommitRequest,
) => {
  return localClashAPI.post<LocalClashMutationResponse>(
    '/api/chain/owned-exits/import-commit',
    data,
  )
}

export const previewLocalClashOwnedExitManualAPI = (data: LocalClashOwnedExitPayload) => {
  return localClashAPI.post<LocalClashOwnedExitManualPreviewResponse>(
    '/api/chain/owned-exits/manual-preview',
    data,
  )
}

export const previewLocalClashSourceAPI = (data: LocalClashSourcePreviewRequest) => {
  return localClashAPI.post<LocalClashSourcePreviewResponse>(
    '/api/chain/sources/preview',
    data,
  )
}

export const saveLocalClashSourceAPI = (id: string, data: LocalClashSourcePreviewRequest) => {
  return localClashAPI.put<LocalClashMutationResponse>(
    `/api/chain/sources/${encodeURIComponent(id)}`,
    data,
  )
}

export const removeLocalClashSourceAPI = (id: string) => {
  return localClashAPI.delete<LocalClashMutationResponse>(
    `/api/chain/sources/${encodeURIComponent(id)}`,
  )
}

export const fetchLocalClashNodesAPI = () => {
  return localClashAPI.get<LocalClashNodesResponse>('/api/chain/nodes')
}

export const updateLocalClashNodeTagsAPI = (id: string, tags: LocalClashNodeTag[]) => {
  return localClashAPI.patch<LocalClashMutationResponse>(
    `/api/chain/nodes/${encodeURIComponent(id)}`,
    { tags },
  )
}

export const saveLocalClashOwnedExitAPI = (name: string, data: LocalClashOwnedExitPayload) => {
  return localClashAPI.put<LocalClashMutationResponse>(
    `/api/chain/owned-exits/${encodeURIComponent(name)}`,
    data,
  )
}

export const removeLocalClashOwnedExitAPI = (name: string) => {
  return localClashAPI.delete<LocalClashMutationResponse>(
    `/api/chain/owned-exits/${encodeURIComponent(name)}`,
  )
}

export const saveLocalClashRouteAPI = (name: string, data: LocalClashRoutePayload) => {
  return localClashAPI.put<LocalClashMutationResponse>(
    `/api/chain/routes/${encodeURIComponent(name)}`,
    data,
  )
}

export const removeLocalClashRouteAPI = (name: string) => {
  return localClashAPI.delete<LocalClashMutationResponse>(
    `/api/chain/routes/${encodeURIComponent(name)}`,
  )
}

export const reorderLocalClashRoutesAPI = (names: string[]) => {
  return localClashAPI.post<LocalClashMutationResponse>('/api/chain/routes/reorder', { names })
}

export const saveLocalClashRuleProfileAPI = (profile: LocalClashRuleProfile) => {
  return localClashAPI.put<LocalClashMutationResponse>('/api/chain/rule-profile', profile)
}

export const saveLocalClashRuleOverrideAPI = (override: LocalClashRuleOverride) => {
  return localClashAPI.put<LocalClashMutationResponse>(
    `/api/chain/rule-overrides/${encodeURIComponent(override.id)}`,
    override,
  )
}

export const removeLocalClashRuleOverrideAPI = (id: string) => {
  return localClashAPI.delete<LocalClashMutationResponse>(
    `/api/chain/rule-overrides/${encodeURIComponent(id)}`,
  )
}

export const saveLocalClashServiceChainAPI = (service: LocalClashServiceChain) => {
  return localClashAPI.put<LocalClashMutationResponse>(
    `/api/chain/service-chains/${encodeURIComponent(service.id)}`,
    service,
  )
}

export const removeLocalClashServiceChainAPI = (id: string) => {
  return localClashAPI.delete<LocalClashMutationResponse>(
    `/api/chain/service-chains/${encodeURIComponent(id)}`,
  )
}

export const runLocalClashChainActionAPI = (
  action: LocalClashChainAction,
  data: LocalClashChainTestRequest = {},
) => {
  if (action === 'test') {
    return localClashAPI.post<LocalClashChainActionResponse>('/api/chain/test', data)
  }

  return localClashAPI.post<LocalClashChainActionResponse>(`/api/chain/${action}`)
}
