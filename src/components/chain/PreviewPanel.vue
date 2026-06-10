<template>
  <div class="grid gap-3">
    <!-- Action buttons -->
    <div
      v-if="!compact"
      class="flex flex-wrap items-center gap-2"
    >
      <button
        v-for="action in actions"
        :key="action"
        class="btn btn-sm"
        type="button"
        :disabled="loading || previewLoading"
        @click="runAndRefresh(action)"
      >
        {{ actionLabel(action) }}
        <span class="badge badge-xs">{{ chainActionStatuses[action].status }}</span>
      </button>
      <button
        class="btn btn-sm btn-outline"
        type="button"
        :disabled="previewLoading"
        @click="loadPreview"
      >
        {{ t('chainRefreshPreview') }}
      </button>
    </div>

    <!-- Loading state -->
    <div
      v-if="previewLoading && !preview"
      class="flex justify-center py-6"
    >
      <span class="loading loading-spinner loading-sm" />
    </div>

    <!-- Error state -->
    <div
      v-if="fetchError"
      class="alert alert-error text-sm"
    >
      {{ fetchError }}
    </div>

    <template v-if="preview">
      <!-- Render error -->
      <div
        v-if="preview.render_error"
        class="alert alert-error text-sm"
      >
        <span>{{ preview.render_error }}</span>
        <span
          v-if="preview.render_error_code"
          class="badge badge-sm"
        >{{ preview.render_error_code }}</span>
      </div>

      <!-- Render summary -->
      <div
        v-if="render"
        class="rounded-box bg-base-200 grid gap-1 p-3 text-sm"
      >
        <div class="mb-1 font-medium">{{ t('chainRenderSummary') }}</div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
          <div class="flex justify-between">
            <span class="opacity-60">{{ t('chainProxies') }}</span>
            <span class="font-mono">{{ render.proxy_count }}</span>
          </div>
          <div class="flex justify-between">
            <span class="opacity-60">{{ t('chainRules') }}</span>
            <span class="font-mono">{{ render.rule_count }}</span>
          </div>
          <div class="col-span-2 flex justify-between">
            <span class="opacity-60">{{ t('chainGroups') }}</span>
            <span class="text-right font-mono text-xs">{{ render.groups?.join(', ') || '—' }}</span>
          </div>
          <div class="col-span-2 flex justify-between">
            <span class="opacity-60">{{ t('chainRuleProviders') }}</span>
            <span class="text-right font-mono text-xs">{{ render.rule_providers?.join(', ') || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- Diff against current -->
      <div
        v-if="diff?.has_current"
        class="rounded-box bg-base-200 grid gap-1 p-3 text-sm"
      >
        <div class="mb-1 font-medium">{{ t('chainChanges') }}</div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-1">
          <div class="flex justify-between">
            <span class="opacity-60">{{ t('chainProxyCountDiff') }}</span>
            <span :class="diffClass(diff.proxy_count_diff)">{{ diffLabel(diff.proxy_count_diff) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="opacity-60">{{ t('chainRuleCountDiff') }}</span>
            <span :class="diffClass(diff.rule_count_diff)">{{ diffLabel(diff.rule_count_diff) }}</span>
          </div>
          <div
            v-if="diff.current_hash"
            class="col-span-2 flex justify-between"
          >
            <span class="opacity-60">{{ t('chainConfigHash') }}</span>
            <span class="font-mono text-xs">{{ shortHash(diff.current_hash) }} → {{ shortHash(diff.new_hash) }}</span>
          </div>
        </div>
      </div>

      <!-- Last action output -->
      <div
        v-if="!compact && chainActionOutput"
        class="collapse-arrow collapse bg-base-200"
      >
        <input type="checkbox" />
        <div class="collapse-title text-sm font-medium">
          {{ t('chainLastAction') }}: {{ actionLabel(chainActionOutput.action) }}
        </div>
        <div class="collapse-content">
          <pre class="max-h-64 overflow-auto text-xs">{{ actionOutputJson }}</pre>
        </div>
      </div>

      <!-- Last-good status -->
      <div
        v-if="preview.last_good?.active"
        class="alert alert-info text-sm"
      >
        <span>{{ t('chainLastGoodActive') }}</span>
        <span v-if="preview.last_good.source"> · {{ t('chainSource') }}: {{ preview.last_good.source }}</span>
        <span v-if="preview.last_good.saved_at"> · {{ t('chainSavedAt') }}: {{ preview.last_good.saved_at }}</span>
      </div>

      <!-- Service chain paths -->
      <div
        v-if="enabledServiceChains.length"
        class="rounded-box bg-base-200 grid gap-1 p-3 text-sm"
      >
        <div class="mb-1 font-medium">{{ t('chainServiceChainPaths') }}</div>
        <div
          v-for="svc in enabledServiceChains"
          :key="svc.id"
          class="flex flex-wrap items-baseline gap-1 text-xs"
        >
          <span class="font-medium">{{ svc.name || svc.id }}:</span>
          <span class="opacity-60">{{ t('chainEntrySelector') }}</span>
          <code class="bg-base-300 rounded px-1">{{ svc.entry_selector || '—' }}</code>
          <span class="opacity-60">→ {{ t('chainFixedExit') }}</span>
          <code class="bg-base-300 rounded px-1">{{ svc.fixed_exit_node_id || '—' }}</code>
        </div>
      </div>

      <!-- Redacted YAML -->
      <div
        v-if="!compact && render?.redacted_yaml"
        class="collapse-arrow collapse bg-base-200"
      >
        <input type="checkbox" />
        <div class="collapse-title text-sm font-medium">{{ t('chainRedactedYaml') }}</div>
        <div class="collapse-content">
          <pre class="max-h-80 overflow-auto text-xs">{{ render.redacted_yaml }}</pre>
        </div>
      </div>

      <!-- Warnings -->
      <template v-if="allWarnings.length">
        <div
          v-for="(warning, i) in allWarnings"
          :key="i"
          class="alert alert-warning text-sm"
        >
          {{ warning }}
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { fetchLocalClashEnrichedPreviewAPI, getLocalClashErrorMessage } from '@/api/localclash'
import {
  chainActionOutput,
  chainActionStatuses,
  chainWarnings,
  loading,
  runChainAction,
} from '@/store/chain'
import type { LocalClashChainAction, LocalClashEnrichedPreview } from '@/types/localclash'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  compact?: boolean
}>()

const actions: LocalClashChainAction[] = ['render', 'validate', 'test', 'apply']
const { t } = useI18n()

const preview = ref<LocalClashEnrichedPreview | null>(null)
const previewLoading = ref(false)
const fetchError = ref<string | null>(null)

const render = computed(() => preview.value?.render)
const diff = computed(() => preview.value?.diff)
const enabledServiceChains = computed(() =>
  (preview.value?.service_chains ?? []).filter((s) => s.enabled),
)
const allWarnings = computed(() => {
  const fromPreview = preview.value?.warnings
  if (fromPreview && fromPreview.length > 0) return fromPreview
  return chainWarnings.value ?? []
})

const loadPreview = async () => {
  previewLoading.value = true
  fetchError.value = null
  try {
    const { data } = await fetchLocalClashEnrichedPreviewAPI()
    preview.value = data
  } catch (e) {
    fetchError.value = getLocalClashErrorMessage(e)
  } finally {
    previewLoading.value = false
  }
}

onMounted(loadPreview)

const runAndRefresh = async (action: LocalClashChainAction) => {
  try {
    await runChainAction(action)
  } catch {
    // runChainAction already stores the error status for the UI.
  } finally {
    await loadPreview()
  }
}

const actionLabel = (action: LocalClashChainAction) => {
  const labels: Record<LocalClashChainAction, string> = {
    render: t('chainRender'),
    validate: t('chainValidate'),
    test: t('chainTest'),
    apply: t('chainApply'),
  }
  return labels[action]
}

const diffClass = (value?: number) => {
  if (value == null || value === 0) return 'font-mono'
  return value > 0 ? 'font-mono text-success' : 'font-mono text-error'
}

const diffLabel = (value?: number) => {
  if (value == null) return '—'
  if (value === 0) return '0'
  return value > 0 ? `+${value}` : `${value}`
}

const shortHash = (hash?: string) => {
  if (!hash) return '—'
  return hash.slice(0, 8)
}

const actionOutputJson = computed(() => {
  if (!chainActionOutput.value) return ''
  return JSON.stringify(chainActionOutput.value.response, null, 2)
})
</script>
