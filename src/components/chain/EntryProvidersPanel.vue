<template>
  <div class="base-container flex flex-col gap-3 p-4">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold">{{ $t('chainEntryProviders') }}</h2>
      <span class="badge badge-sm">{{ providers.length }}</span>
    </div>

    <div class="flex flex-col divide-y divide-base-content/5">
      <div
        v-if="!providers.length"
        class="text-base-content/50 py-2 text-sm"
      >
        {{ $t('chainNoEntries') }}
      </div>
      <div
        v-for="provider in providers"
        :key="provider.name"
        class="flex items-center gap-2 py-2 text-sm"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate font-medium">{{ provider.name }}</div>
          <div class="text-base-content/50 flex flex-wrap gap-2 text-xs">
            <span>{{ provider.type }}</span>
            <span>{{ provider.url_ref }}</span>
            <span v-if="provider.has_value">{{ $t('chainSecretSet') }}</span>
          </div>
        </div>
        <button
          class="btn btn-circle btn-ghost btn-xs"
          :disabled="chainLoading"
          @click="editProvider(provider)"
        >
          <PencilIcon class="h-3.5 w-3.5" />
        </button>
        <button
          class="btn btn-circle btn-error btn-outline btn-xs"
          :disabled="chainLoading"
          @click="handleRemove(provider.name)"
        >
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <form
      class="grid grid-cols-1 gap-2 md:grid-cols-2"
      @submit.prevent="handleSave"
    >
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainEntryProviderName') }}</span>
        <input
          v-model="form.name"
          class="input input-sm w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('type') }}</span>
        <select
          v-model="form.type"
          class="select select-sm w-full"
        >
          <option value="http">http</option>
          <option value="file">file</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm md:col-span-2">
        <span>{{ $t('chainUrl') }}</span>
        <input
          v-model="form.url"
          class="input input-sm w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainPath') }}</span>
        <input
          v-model="form.path"
          class="input input-sm w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainInterval') }}</span>
        <input
          v-model.number="form.interval"
          type="number"
          min="0"
          class="input input-sm w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainInclude') }}</span>
        <textarea
          v-model="form.include"
          class="textarea textarea-sm min-h-18 w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainExclude') }}</span>
        <textarea
          v-model="form.exclude"
          class="textarea textarea-sm min-h-18 w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm md:col-span-2">
        <span>{{ $t('chainUserAgent') }}</span>
        <input
          v-model="form.user_agent"
          class="input input-sm w-full"
        />
      </label>

      <div class="flex flex-wrap items-center gap-2 md:col-span-2">
        <button
          type="button"
          class="btn btn-sm"
          :disabled="chainLoading || !form.name || !form.url"
          @click="handlePreview"
        >
          <EyeIcon class="h-4 w-4" />
          {{ $t('chainPreview') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary btn-sm"
          :disabled="chainLoading || !canSave"
        >
          <CheckIcon class="h-4 w-4" />
          {{ $t('chainSave') }}
        </button>
        <span
          v-if="!canSave"
          class="text-base-content/50 text-xs"
        >
          {{ $t('chainPreviewRequired') }}
        </span>
      </div>
    </form>

    <div
      v-if="entryProviderPreview"
      class="bg-base-200/50 rounded-box p-3 text-xs"
    >
      <div class="flex flex-wrap gap-3">
        <span>{{ $t('chainNodeCount') }}: {{ entryProviderPreview.node_count }}</span>
        <span>{{ $t('chainFormat') }}: {{ entryProviderPreview.format }}</span>
      </div>
      <div
        v-if="entryProviderPreview.sample_names.length"
        class="text-base-content/60 mt-1 truncate"
      >
        {{ $t('chainSamples') }}: {{ entryProviderPreview.sample_names.join(', ') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  entryProviderPreview,
  loading as chainLoading,
  previewEntryProvider,
  removeEntryProvider,
  saveEntryProvider,
} from '@/store/chain'
import type {
  LocalClashEntryProviderPayload,
  LocalClashEntryProviderSummary,
} from '@/types/localclash'
import { CheckIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { computed, reactive, ref } from 'vue'

const emptyForm = () => ({
  name: '',
  type: 'http' as LocalClashEntryProviderPayload['type'],
  url: '',
  path: '',
  interval: 0,
  include: '',
  exclude: '',
  user_agent: '',
})

const form = reactive(emptyForm())
const previewSignature = ref('')

const providers = computed(() => chainSummary.value?.entry_providers || [])
const formSignature = computed(() => JSON.stringify(buildPreviewPayload()))
const canSave = computed(() =>
  Boolean(previewSignature.value && previewSignature.value === formSignature.value),
)

const splitList = (value: string) => {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildPreviewPayload = () => {
  const payload = {
    name: form.name.trim(),
    url: form.url.trim(),
    include: splitList(form.include),
    exclude: splitList(form.exclude),
  }
  const userAgent = form.user_agent.trim()

  return userAgent
    ? {
        ...payload,
        user_agent: userAgent,
      }
    : payload
}

const buildPayload = (): LocalClashEntryProviderPayload => {
  const payload: LocalClashEntryProviderPayload = {
    ...buildPreviewPayload(),
    type: form.type,
  }
  const path = form.path.trim()

  if (path) payload.path = path
  if (form.interval) payload.interval = form.interval

  return payload
}

const editProvider = (provider: LocalClashEntryProviderSummary) => {
  form.name = provider.name
  form.type = provider.type === 'file' ? 'file' : 'http'
  form.url = ''
  form.path = ''
  form.interval = 0
  form.include = ''
  form.exclude = ''
  form.user_agent = ''
  previewSignature.value = ''
}

const handlePreview = async () => {
  await previewEntryProvider(buildPreviewPayload()).then(() => {
    previewSignature.value = formSignature.value
  }).catch(() => undefined)
}

const handleSave = async () => {
  if (!canSave.value) return
  await saveEntryProvider(form.name.trim(), buildPayload()).then(() => {
    Object.assign(form, emptyForm())
    previewSignature.value = ''
  }).catch(() => undefined)
}

const handleRemove = async (name: string) => {
  await removeEntryProvider(name).catch(() => undefined)
}
</script>
