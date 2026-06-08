export type LocalClashWarning = string

export type LocalClashApiOk = {
  ok: boolean
  warnings?: LocalClashWarning[]
}

export type LocalClashSessionResponse = {
  authenticated: boolean
  csrf_token?: string
  local_only: boolean
  setup_required: boolean
  setup_url: string
  password_configured: boolean
}

export type LocalClashSetupRequest = {
  token: string
  password: string
}

export type LocalClashLoginRequest = {
  password: string
}

export type LocalClashAuthResponse = LocalClashApiOk & {
  authenticated: boolean
  csrf_token: string
}

export type LocalClashEntryProviderType = 'http' | 'file'

export type LocalClashEntryProviderPayload = {
  name: string
  type: LocalClashEntryProviderType
  url: string
  path?: string
  interval?: number
  include?: string[]
  exclude?: string[]
  user_agent?: string
}

export type LocalClashEntryProviderPreviewRequest = Pick<
  LocalClashEntryProviderPayload,
  'name' | 'url' | 'include' | 'exclude' | 'user_agent'
>

export type LocalClashEntryProviderPreview = {
  node_count: number
  sample_names: string[]
  format: string
  warnings?: LocalClashWarning[]
}

export type LocalClashEntryProviderPreviewResponse = LocalClashApiOk & {
  preview: LocalClashEntryProviderPreview
}

export type LocalClashOwnedExitCandidate = {
  id: string
  name: string
  type: string
  server: string
  port: number
  tls?: boolean
  network?: string
  sni?: string
  has_credential: boolean
}

export type LocalClashOwnedExitImportPreviewRequest = {
  url?: string
  yaml?: string
  user_agent?: string
}

export type LocalClashOwnedExitImportPreviewResponse = LocalClashApiOk & {
  candidates: LocalClashOwnedExitCandidate[]
}

export type LocalClashOwnedExitCredential = {
  kind: 'uuid' | 'password' | 'auth' | 'private_key' | 'private-key'
  ref: string
  value: string
}

export type LocalClashOwnedExit = {
  name?: string
  description?: string
  type: string
  server?: string
  port?: number
  uuid_ref?: string
  password_ref?: string
  auth_ref?: string
  private_key_ref?: string
  tls?: boolean
  network?: string
  sni?: string
  relay?: boolean
  entry_providers?: string[]
  health_url?: string
  exit_ip_url?: string
  expected_exit_ip?: string[]
  extra?: Record<string, string | number | boolean | null | string[] | Record<string, unknown>>
}

export type LocalClashOwnedExitPayload = {
  exit: LocalClashOwnedExit
  credential?: LocalClashOwnedExitCredential
}

export type LocalClashOwnedExitImportCommitRequest = {
  url?: string
  yaml?: string
  user_agent?: string
  candidate_id: string
  credential_ref?: string
  exit: LocalClashOwnedExit
}

export type LocalClashOwnedExitManualPreview = {
  exit: LocalClashExitSummary | null
  warnings: LocalClashWarning[]
}

export type LocalClashOwnedExitManualPreviewResponse = LocalClashApiOk & {
  preview: LocalClashOwnedExitManualPreview
}

export type LocalClashRouteMatch = {
  domain?: string[]
  domain_suffix?: string[]
  domain_regex?: string[]
  ip_cidr?: string[]
  ip_cidr6?: string[]
  geoip?: string[]
  default?: boolean
}

export type LocalClashRoute = {
  name?: string
  match: LocalClashRouteMatch
  exit: string
}

export type LocalClashRoutePayload = {
  route: LocalClashRoute
}

export type LocalClashEntryProviderSummary = {
  name: string
  type: string
  url_ref: string
  has_value: boolean
}

export type LocalClashExitSummary = {
  name: string
  type: string
  server: string
  relay: boolean
  entry_providers?: string[]
  has_credential: boolean
  expected_exit_ip_count?: number
}

export type LocalClashRouteSummary = {
  name: string
  exit: string
}

export type LocalClashChainRuntime = {
  core: string
  profile: string
}

export type LocalClashChainSummary = {
  entry_providers: LocalClashEntryProviderSummary[]
  exits: LocalClashExitSummary[]
  routes: LocalClashRouteSummary[]
  managed?: {
    sources?: LocalClashManagedSource[]
    rule_profile?: LocalClashRuleProfile
    node_tags?: { node_id: string; tags: LocalClashNodeTag[] }[]
    rule_overrides?: LocalClashRuleOverride[]
    service_chains?: LocalClashServiceChain[]
    fixed_exit_count?: number
    entry_eligible_hint?: number
  }
  mode?: string
  runtime?: LocalClashChainRuntime
  warnings?: LocalClashWarning[]
}

export type LocalClashManagedSourceType =
  | 'subscription_url'
  | 'proxy_uri_text'
  | 'yaml_paste'
  | 'yaml_upload'

export type LocalClashManagedSource = {
  id: string
  name: string
  type: LocalClashManagedSourceType
  url_ref?: string
  has_url?: boolean
  refresh_interval?: number
  last_fetch_status?: string
  last_parse_status?: string
}

export type LocalClashSourcePreviewRequest = {
  id: string
  name: string
  type: LocalClashManagedSourceType
  url?: string
  text?: string
  user_agent?: string
  refresh_interval?: number
}

export type LocalClashSourcePreview = {
  source_id: string
  proxy_count: number
  proxy_group_count: number
  rule_count: number
  rule_provider_count: number
  rule_targets: string[]
  sample_names: string[]
  format: string
}

export type LocalClashSourcePreviewResponse = LocalClashApiOk & {
  preview: LocalClashSourcePreview
}

export type LocalClashNodeTag = 'not_entry' | 'fixed_exit_candidate' | string

export type LocalClashManagedNode = {
  id: string
  source_id: string
  original_name: string
  display_name: string
  protocol?: string
  server?: string
  port?: number
  tags?: LocalClashNodeTag[]
}

export type LocalClashNodesResponse = LocalClashApiOk & {
  nodes: LocalClashManagedNode[]
}

export type LocalClashRuleProfileType = 'imported_source' | 'shadowrocket_default' | 'unmanaged'

export type LocalClashRuleProfile = {
  type: LocalClashRuleProfileType
  source_id?: string
}

export type LocalClashRuleOverride = {
  id: string
  type: 'custom_rule' | 'disable_imported'
  enabled: boolean
  rule?: string
  imported_rule_id?: string
}

export type LocalClashServiceChain = {
  id: string
  name: string
  template?: string
  enabled: boolean
  entry_selector?: string
  fixed_exit_node_id?: string
  match?: {
    domain?: string[]
    domain_suffix?: string[]
    domain_keyword?: string[]
    ip_cidr?: string[]
    geoip?: string[]
    rule_set?: string[]
  }
}

export type LocalClashChainSummaryResponse = LocalClashApiOk & {
  summary: LocalClashChainSummary
}

export type LocalClashChainConfigResponse = {
  ok: boolean
  config: LocalClashChainSummary
  warnings: LocalClashWarning[]
}

export type LocalClashRenderedSummary = {
  status: string
  generated: unknown
}

export type LocalClashRenderedSummaryResponse = LocalClashApiOk & LocalClashRenderedSummary

export type LocalClashMutationResponse = LocalClashApiOk & {
  message?: string
  summary?: LocalClashChainSummary
  preview?:
    | LocalClashEntryProviderPreview
    | LocalClashOwnedExitManualPreview
    | LocalClashSourcePreview
    | Record<string, unknown>
}

export type LocalClashChainAction = 'render' | 'validate' | 'test' | 'apply'

export type LocalClashChainTestRequest = {
  exit?: string
}

export type LocalClashChainActionResponse = LocalClashApiOk & {
  render?: unknown
  validation?: unknown
  test?: unknown
  apply?: unknown
  status?: string
  warnings?: LocalClashWarning[]
}

export type LocalClashChainActionOutput = {
  action: LocalClashChainAction
  response: LocalClashChainActionResponse
}

export type LocalClashApiErrorBody = {
  ok?: boolean
  error?: string
  message?: string
}
