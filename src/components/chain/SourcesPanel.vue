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
            <td>{{ source.last_parse_status || $t('chainSaved') }}</td>
            <td class="text-right">
              <button
                class="btn btn-ghost btn-xs"
                type="button"
                @click="remove(source.id)"
              >
                {{ $t('chainDelete') }}
              </button>
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
        :placeholder="
          draft.type === 'proxy_uri_text'
            ? $t('chainProxyURITextPlaceholder')
            : $t('chainPasteSourcePlaceholder')
        "
      />
      <div class="flex justify-end gap-2">
        <button
          class="btn btn-sm"
          type="submit"
          :disabled="!canPreview || loading"
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
      <p
        v-if="!canPreview"
        class="text-warning text-xs"
      >
        {{ $t('chainSourceRequiredFields') }}
      </p>
      <p
        v-else-if="sourceSaved"
        class="text-success text-xs"
      >
        {{ $t('chainSourceSaved') }}
      </p>
      <p
        v-else-if="!canSave"
        class="text-warning text-xs"
      >
        {{ $t('chainPreviewRequired') }}
      </p>
      <p
        v-else
        class="text-success text-xs"
      >
        {{ $t('chainSourcePreviewReady') }}
      </p>
      <section
        v-if="sourcePreview && canSave"
        class="bg-base-200 rounded p-3 text-xs"
      >
        <div class="mb-2 flex items-center justify-between gap-2">
          <h3 class="font-semibold">{{ $t('chainPreviewTitle') }}</h3>
          <span class="badge badge-sm">{{ sourcePreview.format }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <div class="opacity-60">{{ $t('chainNodeCount') }}</div>
            <div class="font-medium">{{ sourcePreview.proxy_count }}</div>
          </div>
          <div>
            <div class="opacity-60">{{ $t('chainGroups') }}</div>
            <div class="font-medium">{{ sourcePreview.proxy_group_count }}</div>
          </div>
          <div>
            <div class="opacity-60">{{ $t('chainRules') }}</div>
            <div class="font-medium">{{ sourcePreview.rule_count }}</div>
          </div>
          <div>
            <div class="opacity-60">{{ $t('chainRuleProviders') }}</div>
            <div class="font-medium">{{ sourcePreview.rule_provider_count }}</div>
          </div>
        </div>
        <div
          v-if="sourcePreview.rule_targets.length"
          class="mt-3"
        >
          <div class="mb-1 opacity-60">{{ $t('chainRuleTargets') }}</div>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="target in sourcePreview.rule_targets"
              :key="target"
              class="badge badge-sm"
            >
              {{ target }}
            </span>
          </div>
        </div>
        <div
          v-if="sourcePreview.sample_names.length"
          class="mt-3"
        >
          <div class="mb-1 opacity-60">{{ $t('chainSamples') }}</div>
          <div class="max-h-24 overflow-auto">
            {{ sourcePreview.sample_names.join(', ') }}
          </div>
        </div>
      </section>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  loading as chainLoading,
  previewSource,
  removeSource,
  saveSource,
  sourcePreview,
} from '@/store/chain'
import type { LocalClashSourcePreviewRequest } from '@/types/localclash'
import { computed, reactive, ref, watch } from 'vue'

const sources = computed(() => chainSummary.value?.managed?.sources || [])
const draft = reactive<LocalClashSourcePreviewRequest>({
  id: '',
  name: '',
  type: 'yaml_paste',
  text: '',
})

const loading = chainLoading
const previewKey = ref('')
const sourceSaved = ref(false)
const draftKey = computed(() => JSON.stringify({ ...draft }))
const canSave = computed(() => Boolean(sourcePreview.value) && previewKey.value === draftKey.value)
const hasSourceContent = computed(() =>
  draft.type === 'subscription_url' ? Boolean(draft.url?.trim()) : Boolean(draft.text?.trim()),
)
const canPreview = computed(() =>
  Boolean(draft.id.trim() && draft.name.trim() && draft.type && hasSourceContent.value),
)

watch(draftKey, () => {
  sourceSaved.value = false
})

const preview = async () => {
  if (!canPreview.value) return
  previewKey.value = ''
  sourceSaved.value = false
  await previewSource({ ...draft })
  previewKey.value = draftKey.value
}

const save = async () => {
  sourceSaved.value = false
  if (!draft.id || !draft.name || !draft.type || !canSave.value) return
  await saveSource(draft.id, { ...draft })
  sourceSaved.value = true
}

const remove = async (id: string) => {
  await removeSource(id)
}
</script>
