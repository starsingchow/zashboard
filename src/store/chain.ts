import {
  fetchLocalClashChainConfigAPI,
  fetchLocalClashChainSummaryAPI,
  getLocalClashErrorMessage,
  previewLocalClashEntryProviderAPI,
  previewLocalClashOwnedExitImportAPI,
  previewLocalClashOwnedExitManualAPI,
  removeLocalClashEntryProviderAPI,
  removeLocalClashOwnedExitAPI,
  removeLocalClashRouteAPI,
  reorderLocalClashRoutesAPI,
  runLocalClashChainActionAPI,
  saveLocalClashEntryProviderAPI,
  saveLocalClashOwnedExitAPI,
  saveLocalClashRouteAPI,
} from '@/api/localclash'
import type {
  LocalClashChainAction,
  LocalClashChainActionOutput,
  LocalClashChainSummary,
  LocalClashEntryProviderPayload,
  LocalClashEntryProviderPreview,
  LocalClashEntryProviderPreviewRequest,
  LocalClashOwnedExitCandidate,
  LocalClashOwnedExitImportPreviewRequest,
  LocalClashOwnedExitManualPreview,
  LocalClashOwnedExitPayload,
  LocalClashRoutePayload,
  LocalClashWarning,
} from '@/types/localclash'
import { ref } from 'vue'

export const chainSummary = ref<LocalClashChainSummary | null>(null)
export const chainConfig = ref<LocalClashChainSummary | null>(null)
export const chainWarnings = ref<LocalClashWarning[]>([])
export const loading = ref(false)
export const error = ref<string | null>(null)
export const entryProviderPreview = ref<LocalClashEntryProviderPreview | null>(null)
export const ownedExitCandidates = ref<LocalClashOwnedExitCandidate[]>([])
export const ownedExitManualPreview = ref<LocalClashOwnedExitManualPreview | null>(null)
export const chainActionOutput = ref<LocalClashChainActionOutput | null>(null)

const runChainRequest = async <T>(request: () => Promise<T>) => {
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

const loadChainConfig = async () => {
  const [configResponse, summaryResponse] = await Promise.all([
    fetchLocalClashChainConfigAPI(),
    fetchLocalClashChainSummaryAPI(),
  ])

  chainConfig.value = configResponse.data.config
  chainSummary.value = summaryResponse.data.summary
  chainWarnings.value = [
    ...(configResponse.data.warnings || []),
    ...(configResponse.data.config.warnings || []),
    ...(summaryResponse.data.warnings || []),
    ...(summaryResponse.data.summary.warnings || []),
  ]

  return {
    config: chainConfig.value,
    summary: chainSummary.value,
    warnings: chainWarnings.value,
  }
}

export const refreshChainConfig = async () => {
  return runChainRequest(loadChainConfig)
}

export const previewEntryProvider = async (payload: LocalClashEntryProviderPreviewRequest) => {
  return runChainRequest(async () => {
    const { data } = await previewLocalClashEntryProviderAPI(payload)

    entryProviderPreview.value = data.preview
    return data.preview
  })
}

export const saveEntryProvider = async (name: string, payload: LocalClashEntryProviderPayload) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashEntryProviderAPI(name, payload)

    await loadChainConfig()
    return data
  })
}

export const removeEntryProvider = async (name: string) => {
  return runChainRequest(async () => {
    const { data } = await removeLocalClashEntryProviderAPI(name)

    await loadChainConfig()
    return data
  })
}

export const previewOwnedExitImport = async (
  payload: LocalClashOwnedExitImportPreviewRequest,
) => {
  return runChainRequest(async () => {
    const { data } = await previewLocalClashOwnedExitImportAPI(payload)

    ownedExitCandidates.value = data.candidates
    return data.candidates
  })
}

export const previewOwnedExitManual = async (payload: LocalClashOwnedExitPayload) => {
  return runChainRequest(async () => {
    const { data } = await previewLocalClashOwnedExitManualAPI(payload)

    ownedExitManualPreview.value = data.preview
    return data.preview
  })
}

export const saveOwnedExit = async (name: string, payload: LocalClashOwnedExitPayload) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashOwnedExitAPI(name, payload)

    await loadChainConfig()
    return data
  })
}

export const removeOwnedExit = async (name: string) => {
  return runChainRequest(async () => {
    const { data } = await removeLocalClashOwnedExitAPI(name)

    await loadChainConfig()
    return data
  })
}

export const saveRoute = async (name: string, payload: LocalClashRoutePayload) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashRouteAPI(name, payload)

    await loadChainConfig()
    return data
  })
}

export const removeRoute = async (name: string) => {
  return runChainRequest(async () => {
    const { data } = await removeLocalClashRouteAPI(name)

    await loadChainConfig()
    return data
  })
}

export const reorderRoutes = async (names: string[]) => {
  return runChainRequest(async () => {
    const { data } = await reorderLocalClashRoutesAPI(names)

    await loadChainConfig()
    return data
  })
}

export const runChainAction = async (
  action: LocalClashChainAction,
  payload: { exit?: string } = {},
) => {
  return runChainRequest(async () => {
    const { data } = await runLocalClashChainActionAPI(action, payload)

    chainActionOutput.value = {
      action,
      response: data,
    }

    if (action === 'apply' || action === 'render') {
      await loadChainConfig()
    }

    return chainActionOutput.value
  })
}
