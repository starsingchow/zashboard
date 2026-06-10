<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <div class="rounded-box border-base-300 overflow-hidden border">
      <table class="table-sm table">
        <thead>
          <tr>
            <th>{{ $t('chainSource') }}</th>
            <th>{{ $t('chainType') }}</th>
            <th>{{ $t('chainStatus') }}</th>
            <th class="text-right">{{ $t('chainActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="source in sources"
            :key="source.id"
          >
            <td>
              <div class="font-medium">{{ source.name }}</div>
              <div class="text-xs opacity-60">{{ source.id }}</div>
            </td>
            <td>{{ source.type }}</td>
            <td>
              <div class="flex items-center gap-1">
                <span
                  v-if="source.last_parse_status"
                  class="badge badge-xs"
                  :class="source.last_parse_status === 'ok' ? 'badge-success' : 'badge-warning'"
                >
                  {{ source.last_parse_status }}
                </span>
                <span
                  v-else-if="source.last_fetch_status"
                  class="badge badge-xs"
                  :class="source.last_fetch_status === 'ok' ? 'badge-success' : 'badge-warning'"
                >
                  {{ source.last_fetch_status }}
                </span>
                <span v-else class="text-xs opacity-60">{{ $t('chainSaved') }}</span>
              </div>
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  class="btn btn-xs btn-outline"
                  type="button"
                  :class="{ loading: sourceRefreshing[source.id] }"
                  :disabled="sourceRefreshing[source.id]"
                  @click="refreshSource(source.id)"
                >
                  {{ $t('chainRefresh') }}
                </button>
                <button
                  class="btn btn-ghost btn-xs"
                  type="button"
                  @click="remove(source.id)"
                >
                  {{ $t('chainDelete') }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="sources.length === 0">
            <td
              colspan="4"
              class="py-8 text-center opacity-60"
            >
              {{ $t('chainNoSources') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <form
      class="rounded-box border-base-300 grid gap-3 border p-3"
      @submit.prevent="preview"
    >
      <input
        v-model.trim="draft.id"
        class="input input-sm input-bordered"
        placeholder="source-a"
      />
      <input
        v-model.trim="draft.name"
        class="input input-sm input-bordered"
        placeholder="Airport A"
      />
      <select
        v-model="draft.type"
        class="select select-sm select-bordered"
      >
        <option value="subscription_url">{{ $t('chainSubscriptionURL') }}</option>
        <option value="proxy_uri_text">{{ $t('chainProxyURIText') }}</option>
        <option value="yaml_paste">{{ $t('chainYamlPaste') }}</option>
        <option value="yaml_upload">{{ $t('chainYamlUploadText') }}</option>
      </select>
      <input
        v-if="draft.type === 'subscription_url'"
        v-model.trim="draft.url"
        class="input input-sm input-bordered"
        placeholder="https://example.com/sub"
      />
      <textarea
        v-else
        v-model="draft.text"
        class="textarea textarea-bordered min-h-36"
        :placeholder="$t('chainPasteSourcePlaceholder')"
      />
      <div class="flex justify-end gap-2">
        <button
          class="btn btn-sm"
          type="submit"
          :disabled="loading"
        >
          {{ $t('chainPreview') }}
        </button>
        <button
          class="btn btn-primary btn-sm"
          type="button"
          :disabled="!canSave || loading"
          @click="save"
        >
          {{ $t('chainSave') }}
        </button>
      </div>
      <pre
        v-if="sourcePreview"
        class="bg-base-200 max-h-48 overflow-auto rounded p-2 text-xs"
      >
        {{ JSON.stringify(sourcePreview, null, 2) }}
      </pre>
    </form>

    <div class="rounded-box border-base-300 grid gap-3 border p-3 lg:col-span-2">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-sm">{{ $t('chainRuleSources') }}</h3>
        <button
          class="btn btn-xs btn-outline"
          type="button"
          :class="{ loading: ruleSourceRefreshing }"
          :disabled="ruleSourceRefreshing"
          @click="refreshRuleSources()"
        >
          {{ $t('chainRefresh') }}
        </button>
      </div>
      <div v-if="ruleSourceRefreshResults.length" class="space-y-1">
        <div
          v-for="result in ruleSourceRefreshResults"
          :key="result.template"
          class="flex items-center gap-2 text-sm"
        >
          <span class="font-medium">{{ result.template }}</span>
          <span
            class="badge badge-xs"
            :class="result.status === 'ok' ? 'badge-success' : 'badge-warning'"
          >
            {{ result.status }}
          </span>
          <span v-if="result.error" class="text-error text-xs">{{ result.error }}</span>
        </div>
      </div>
      <p v-else class="text-xs opacity-60">{{ $t('chainNoRuleSourceResults') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  loading as chainLoading,
  previewSource,
  refreshRuleSources,
  refreshSource,
  removeSource,
  ruleSourceRefreshing,
  ruleSourceRefreshResults,
  saveSource,
  sourcePreview,
  sourceRefreshing,
} from '@/store/chain'
import type { LocalClashSourcePreviewRequest } from '@/types/localclash'
import { computed, reactive, ref } from 'vue'

const sources = computed(() => chainSummary.value?.managed?.sources || [])
const draft = reactive<LocalClashSourcePreviewRequest>({
  id: '',
  name: '',
  type: 'yaml_paste',
  text: '',
})

const loading = chainLoading
const previewKey = ref('')
const draftKey = computed(() => JSON.stringify({ ...draft }))
const canSave = computed(() => Boolean(sourcePreview.value) && previewKey.value === draftKey.value)

const preview = async () => {
  await previewSource({ ...draft })
  previewKey.value = draftKey.value
}

const save = async () => {
  if (!draft.id || !draft.name || !draft.type || !canSave.value) return
  await saveSource(draft.id, { ...draft })
}

const remove = async (id: string) => {
  await removeSource(id)
}
</script>
