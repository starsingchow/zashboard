import {
  commitLocalClashOwnedExitImportAPI,
  fetchLocalClashChainConfigAPI,
  fetchLocalClashChainSummaryAPI,
  fetchLocalClashNodesAPI,
  fetchLocalClashServiceTemplatesAPI,
  getLocalClashErrorMessage,
  previewLocalClashEntryProviderAPI,
  previewLocalClashOwnedExitImportAPI,
  previewLocalClashOwnedExitManualAPI,
  previewLocalClashSourceAPI,
  removeLocalClashEntryProviderAPI,
  removeLocalClashOwnedExitAPI,
  removeLocalClashRouteAPI,
  removeLocalClashRuleOverrideAPI,
  removeLocalClashServiceChainAPI,
  removeLocalClashSourceAPI,
  refreshLocalClashRuleSourcesAPI,
  refreshLocalClashSourceAPI,
  reorderLocalClashRoutesAPI,
  runLocalClashChainActionAPI,
  saveLocalClashEntryProviderAPI,
  saveLocalClashOwnedExitAPI,
  saveLocalClashRouteAPI,
  saveLocalClashRuleOverrideAPI,
  saveLocalClashRuleProfileAPI,
  saveLocalClashServiceChainAPI,
  saveLocalClashSourceAPI,
  updateLocalClashNodeTagsAPI,
} from '@/api/localclash'
import type {
  LocalClashChainAction,
  LocalClashChainActionOutput,
  LocalClashChainActionResponse,
  LocalClashChainSummary,
  LocalClashEntryProviderPayload,
  LocalClashEntryProviderPreview,
  LocalClashEntryProviderPreviewRequest,
  LocalClashManagedNode,
  LocalClashNodeTag,
  LocalClashOwnedExitCandidate,
  LocalClashOwnedExitImportCommitRequest,
  LocalClashOwnedExitImportPreviewRequest,
  LocalClashOwnedExitManualPreview,
  LocalClashOwnedExitPayload,
  LocalClashRoutePayload,
  LocalClashRuleOverride,
  LocalClashRuleProfile,
  LocalClashServiceChain,
  LocalClashRuleSourceRefreshResponse,
  LocalClashServiceTemplate,
  LocalClashSourcePreview,
  LocalClashSourcePreviewRequest,
  LocalClashWarning,
} from '@/types/localclash'
import { ref } from 'vue'

const builtinServiceTemplateFallbacks: LocalClashServiceTemplate[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    rule_source: 'blackmatrix7',
    pack_name: 'openai',
    behavior: 'domain',
    render_type: 'RULE-SET',
    refresh_interval: 86400,
  },
  {
    id: 'claude',
    name: 'Claude',
    rule_source: 'blackmatrix7',
    pack_name: 'claude',
    behavior: 'domain',
    render_type: 'RULE-SET',
    refresh_interval: 86400,
  },
  {
    id: 'google',
    name: 'Google',
    rule_source: 'blackmatrix7',
    pack_name: 'google',
    behavior: 'domain',
    render_type: 'RULE-SET',
    refresh_interval: 86400,
  },
  {
    id: 'apple',
    name: 'Apple',
    rule_source: 'blackmatrix7',
    pack_name: 'apple',
    behavior: 'domain',
    render_type: 'RULE-SET',
    refresh_interval: 86400,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    rule_source: 'blackmatrix7',
    pack_name: 'microsoft',
    behavior: 'domain',
    render_type: 'RULE-SET',
    refresh_interval: 86400,
  },
  {
    id: 'streaming',
    name: 'Streaming',
    rule_source: 'blackmatrix7',
    pack_name: 'streaming',
    behavior: 'domain',
    render_type: 'RULE-SET',
    refresh_interval: 86400,
  },
]

const fallbackServiceTemplates = () => builtinServiceTemplateFallbacks.map((tmpl) => ({ ...tmpl }))

export const chainSummary = ref<LocalClashChainSummary | null>(null)
export const chainConfig = ref<LocalClashChainSummary | null>(null)
export const chainWarnings = ref<LocalClashWarning[]>([])
export const loading = ref(false)
export const error = ref<string | null>(null)
export const sourcePreview = ref<LocalClashSourcePreview | null>(null)
export const managedNodes = ref<LocalClashManagedNode[]>([])
export const serviceTemplates = ref<LocalClashServiceTemplate[]>(fallbackServiceTemplates())
export const sourceRefreshing = ref<Record<string, boolean>>({})
export const ruleSourceRefreshing = ref(false)
export const ruleSourceRefreshResults = ref<LocalClashRuleSourceRefreshResponse['results']>([])
export const activeWorkbenchTab = ref<
  'overview' | 'sources' | 'nodes' | 'rules' | 'services' | 'preview'
>('overview')
export const entryProviderPreview = ref<LocalClashEntryProviderPreview | null>(null)
export const ownedExitCandidates = ref<LocalClashOwnedExitCandidate[]>([])
export const ownedExitManualPreview = ref<LocalClashOwnedExitManualPreview | null>(null)
export const chainActionOutput = ref<LocalClashChainActionOutput | null>(null)
export const chainActionStatuses = ref<
  Record<
    LocalClashChainAction,
    {
      status: 'idle' | 'running' | 'ok' | 'error'
      message?: string
    }
  >
>({
  render: { status: 'idle' },
  validate: { status: 'idle' },
  test: { status: 'idle' },
  apply: { status: 'idle' },
})

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

  chainConfig.value = configResponse.data.config || null
  chainSummary.value = summaryResponse.data.summary || configResponse.data.config || null
  chainWarnings.value = [
    ...(configResponse.data.warnings || []),
    ...(configResponse.data.config?.warnings || []),
    ...(summaryResponse.data.warnings || []),
    ...(summaryResponse.data.summary?.warnings || []),
  ]

  return {
    config: chainConfig.value,
    summary: chainSummary.value,
    warnings: chainWarnings.value,
  }
}

const loadManagedNodes = async () => {
  const { data } = await fetchLocalClashNodesAPI()

  managedNodes.value = data.nodes
  return data.nodes
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

export const previewOwnedExitImport = async (payload: LocalClashOwnedExitImportPreviewRequest) => {
  return runChainRequest(async () => {
    const { data } = await previewLocalClashOwnedExitImportAPI(payload)

    ownedExitCandidates.value = data.candidates
    return data.candidates
  })
}

export const commitOwnedExitImport = async (payload: LocalClashOwnedExitImportCommitRequest) => {
  return runChainRequest(async () => {
    const { data } = await commitLocalClashOwnedExitImportAPI(payload)

    await loadChainConfig()
    return data
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

export const refreshManagedNodes = async () => {
  return runChainRequest(loadManagedNodes)
}

export const refreshServiceTemplates = async () => {
  try {
    const { data } = await fetchLocalClashServiceTemplatesAPI()
    serviceTemplates.value =
      data.templates && data.templates.length > 0 ? data.templates : fallbackServiceTemplates()
  } catch {
    serviceTemplates.value = fallbackServiceTemplates()
  }
}

export const refreshSource = async (sourceId: string) => {
  sourceRefreshing.value = { ...sourceRefreshing.value, [sourceId]: true }
  try {
    await refreshLocalClashSourceAPI(sourceId)
    await refreshChainConfig()
    await loadManagedNodes()
  } catch (e) {
    error.value = getLocalClashErrorMessage(e)
  } finally {
    sourceRefreshing.value = { ...sourceRefreshing.value, [sourceId]: false }
  }
}

export const refreshRuleSources = async () => {
  ruleSourceRefreshing.value = true
  try {
    const { data } = await refreshLocalClashRuleSourcesAPI()
    ruleSourceRefreshResults.value = data.results || []
  } catch (e) {
    error.value = getLocalClashErrorMessage(e)
  } finally {
    ruleSourceRefreshing.value = false
  }
}

export const previewSource = async (payload: LocalClashSourcePreviewRequest) => {
  return runChainRequest(async () => {
    const { data } = await previewLocalClashSourceAPI(payload)

    sourcePreview.value = data.preview
    return data.preview
  })
}

export const saveSource = async (id: string, payload: LocalClashSourcePreviewRequest) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashSourceAPI(id, payload)

    await loadChainConfig()
    await loadManagedNodes()
    return data
  })
}

export const removeSource = async (id: string) => {
  return runChainRequest(async () => {
    const { data } = await removeLocalClashSourceAPI(id)

    await loadChainConfig()
    await loadManagedNodes()
    return data
  })
}

export const updateNodeTags = async (id: string, tags: LocalClashNodeTag[]) => {
  return runChainRequest(async () => {
    const { data } = await updateLocalClashNodeTagsAPI(id, tags)

    await loadChainConfig()
    await loadManagedNodes()
    return data
  })
}

export const saveRuleProfile = async (profile: LocalClashRuleProfile) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashRuleProfileAPI(profile)

    await loadChainConfig()
    return data
  })
}

export const saveRuleOverride = async (override: LocalClashRuleOverride) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashRuleOverrideAPI(override)

    await loadChainConfig()
    return data
  })
}

export const removeRuleOverride = async (id: string) => {
  return runChainRequest(async () => {
    const { data } = await removeLocalClashRuleOverrideAPI(id)

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

export const saveServiceChain = async (service: LocalClashServiceChain) => {
  return runChainRequest(async () => {
    const { data } = await saveLocalClashServiceChainAPI(service)

    await loadChainConfig()
    return data
  })
}

export const removeServiceChain = async (id: string) => {
  return runChainRequest(async () => {
    const { data } = await removeLocalClashServiceChainAPI(id)

    await loadChainConfig()
    return data
  })
}

export const runChainAction = async (
  action: LocalClashChainAction,
  payload: { exit?: string } = {},
) => {
  chainActionStatuses.value = {
    ...chainActionStatuses.value,
    [action]: { status: 'running' },
  }

  try {
    return await runChainRequest(async () => {
      const { data } = await runLocalClashChainActionAPI(action, payload)

      chainActionOutput.value = {
        action,
        response: data,
      }
      chainActionStatuses.value = {
        ...chainActionStatuses.value,
        [action]: {
          status: data.ok ? 'ok' : 'error',
          message: actionStatusMessage(data),
        },
      }

      if (action === 'apply' || action === 'render') {
        await loadChainConfig()
      }

      return chainActionOutput.value
    })
  } catch (err) {
    chainActionStatuses.value = {
      ...chainActionStatuses.value,
      [action]: {
        status: 'error',
        message: getLocalClashErrorMessage(err),
      },
    }
    throw err
  }
}

const actionStatusMessage = (data: LocalClashChainActionResponse) => {
  if (data.status) return data.status
  if ('message' in data && typeof data.message === 'string') return data.message
  return data.ok ? 'ok' : 'error'
}
