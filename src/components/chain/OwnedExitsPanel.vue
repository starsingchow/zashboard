<template>
  <div class="base-container flex flex-col gap-3 p-4">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold">{{ $t('chainOwnedExits') }}</h2>
      <span class="badge badge-sm">{{ exits.length }}</span>
    </div>

    <div class="flex flex-col divide-y divide-base-content/5">
      <div
        v-if="!exits.length"
        class="text-base-content/50 py-2 text-sm"
      >
        {{ $t('chainNoExits') }}
      </div>
      <div
        v-for="exit in exits"
        :key="exit.name"
        class="flex items-center gap-2 py-2 text-sm"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate font-medium">{{ exit.name }}</div>
          <div class="text-base-content/50 flex flex-wrap gap-2 text-xs">
            <span>{{ exit.type }}</span>
            <span>{{ exit.server }}</span>
            <span v-if="exit.relay">{{ $t('chainRelay') }}</span>
            <span v-if="exit.has_credential">{{ $t('chainSecretSet') }}</span>
          </div>
        </div>
        <button
          class="btn btn-circle btn-ghost btn-xs"
          :disabled="chainLoading"
          @click="editExit(exit)"
        >
          <PencilIcon class="h-3.5 w-3.5" />
        </button>
        <button
          class="btn btn-circle btn-error btn-outline btn-xs"
          :disabled="chainLoading"
          @click="handleRemove(exit.name)"
        >
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <section class="flex flex-col gap-2">
      <div class="text-sm font-medium">{{ $t('chainManualExit') }}</div>
      <form
        class="grid grid-cols-1 gap-2 md:grid-cols-2"
        @submit.prevent="handleManualSave"
      >
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainName') }}</span>
          <input
            v-model="manual.name"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('type') }}</span>
          <input
            v-model="manual.type"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('host') }}</span>
          <input
            v-model="manual.server"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('port') }}</span>
          <input
            v-model.number="manual.port"
            type="number"
            min="0"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainCredentialKind') }}</span>
          <select
            v-model="manual.credentialKind"
            class="select select-sm w-full"
          >
            <option value="uuid">uuid</option>
            <option value="password">password</option>
            <option value="auth">auth</option>
            <option value="private_key">private_key</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainCredentialValue') }}</span>
          <input
            v-model="manual.credentialValue"
            type="password"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="manual.relay"
            type="checkbox"
            class="checkbox checkbox-sm"
          />
          <span>{{ $t('chainRelay') }}</span>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainEntryProvidersField') }}</span>
          <input
            v-model="manual.entryProviders"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainHealthUrl') }}</span>
          <input
            v-model="manual.health_url"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainExitIpUrl') }}</span>
          <input
            v-model="manual.exit_ip_url"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm md:col-span-2">
          <span>{{ $t('chainExpectedExitIp') }}</span>
          <input
            v-model="manual.expected_exit_ip"
            class="input input-sm w-full"
          />
        </label>
        <div class="flex flex-wrap gap-2 md:col-span-2">
          <button
            type="button"
            class="btn btn-sm"
            :disabled="chainLoading || !manual.name || !manual.type"
            @click="handleManualPreview"
          >
            <EyeIcon class="h-4 w-4" />
            {{ $t('chainPreview') }}
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-sm"
            :disabled="chainLoading || !manual.name || !manual.type"
          >
            <CheckIcon class="h-4 w-4" />
            {{ $t('chainSave') }}
          </button>
        </div>
      </form>

      <div
        v-if="ownedExitManualPreview"
        class="bg-base-200/50 rounded-box p-3 text-xs"
      >
        <pre class="max-h-40 overflow-auto">{{ JSON.stringify(ownedExitManualPreview, null, 2) }}</pre>
      </div>
    </section>

    <section class="flex flex-col gap-2">
      <div class="text-sm font-medium">{{ $t('chainOwnedExitImport') }}</div>
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainUrl') }}</span>
          <input
            v-model="importForm.url"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainUserAgent') }}</span>
          <input
            v-model="importForm.user_agent"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm md:col-span-2">
          <span>{{ $t('chainYaml') }}</span>
          <textarea
            v-model="importForm.yaml"
            class="textarea textarea-sm min-h-24 w-full"
          />
        </label>
      </div>
      <button
        class="btn btn-sm w-fit"
        :disabled="chainLoading || (!importForm.url && !importForm.yaml)"
        @click="handleImportPreview"
      >
        <EyeIcon class="h-4 w-4" />
        {{ $t('chainImportPreview') }}
      </button>

      <div
        v-if="ownedExitCandidates.length"
        class="flex flex-col divide-y divide-base-content/5"
      >
        <div class="text-base-content/60 text-xs">{{ $t('chainCandidates') }}</div>
        <div
          v-for="candidate in ownedExitCandidates"
          :key="candidate.id"
          class="flex items-center gap-2 py-2 text-sm"
        >
          <div class="min-w-0 flex-1">
            <div class="truncate font-medium">{{ candidate.name }}</div>
            <div class="text-base-content/50 flex flex-wrap gap-2 text-xs">
              <span>{{ candidate.type }}</span>
              <span>{{ candidate.server }}:{{ candidate.port }}</span>
              <span v-if="candidate.has_credential">{{ $t('chainSecretSet') }}</span>
            </div>
          </div>
          <button
            class="btn btn-xs"
            :disabled="chainLoading"
            @click="selectCandidate(candidate)"
          >
            <CheckIcon class="h-3.5 w-3.5" />
            {{ $t('chainSelectCandidate') }}
          </button>
        </div>
      </div>

      <form
        v-if="selectedCandidate"
        class="bg-base-200/40 rounded-box grid grid-cols-1 gap-2 p-3 md:grid-cols-2"
        @submit.prevent="handleImportCommit"
      >
        <div class="md:col-span-2">
          <div class="text-sm font-medium">{{ selectedCandidate.name }}</div>
          <div class="text-base-content/50 text-xs">
            {{ selectedCandidate.type }} · {{ selectedCandidate.server }}:{{ selectedCandidate.port }}
          </div>
        </div>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainName') }}</span>
          <input
            v-model="commitForm.name"
            class="input input-sm w-full"
          />
        </label>
        <label
          v-if="selectedCandidate.has_credential"
          class="flex flex-col gap-1 text-sm"
        >
          <span>{{ $t('chainCredentialRef') }}</span>
          <input
            v-model="commitForm.credentialRef"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="commitForm.relay"
            type="checkbox"
            class="checkbox checkbox-sm"
          />
          <span>{{ $t('chainRelay') }}</span>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainEntryProvidersField') }}</span>
          <input
            v-model="commitForm.entryProviders"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainHealthUrl') }}</span>
          <input
            v-model="commitForm.health_url"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span>{{ $t('chainExitIpUrl') }}</span>
          <input
            v-model="commitForm.exit_ip_url"
            class="input input-sm w-full"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm md:col-span-2">
          <span>{{ $t('chainExpectedExitIp') }}</span>
          <input
            v-model="commitForm.expected_exit_ip"
            class="input input-sm w-full"
          />
        </label>
        <button
          class="btn btn-primary btn-sm w-fit md:col-span-2"
          type="submit"
          :disabled="chainLoading || !canCommitSelectedCandidate"
        >
          <CheckIcon class="h-4 w-4" />
          {{ $t('chainImportCommit') }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  commitOwnedExitImport,
  loading as chainLoading,
  ownedExitCandidates,
  ownedExitManualPreview,
  previewOwnedExitImport,
  previewOwnedExitManual,
  removeOwnedExit,
  saveOwnedExit,
} from '@/store/chain'
import type {
  LocalClashExitSummary,
  LocalClashOwnedExitCandidate,
  LocalClashOwnedExitCredential,
  LocalClashOwnedExitImportCommitRequest,
  LocalClashOwnedExitPayload,
} from '@/types/localclash'
import { CheckIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { computed, reactive, ref } from 'vue'

const emptyManual = () => ({
  name: '',
  type: 'vless',
  server: '',
  port: 443,
  credentialKind: 'uuid' as LocalClashOwnedExitCredential['kind'],
  credentialValue: '',
  relay: false,
  entryProviders: '',
  health_url: '',
  exit_ip_url: '',
  expected_exit_ip: '',
})

const manual = reactive(emptyManual())
const importForm = reactive({
  url: '',
  yaml: '',
  user_agent: '',
})
const commitForm = reactive({
  name: '',
  credentialRef: '',
  relay: false,
  entryProviders: '',
  health_url: '',
  exit_ip_url: '',
  expected_exit_ip: '',
})
const selectedCandidate = ref<LocalClashOwnedExitCandidate | null>(null)

const exits = computed(() => chainSummary.value?.exits || [])
const canCommitSelectedCandidate = computed(() => {
  if (!selectedCandidate.value || !commitForm.name.trim()) return false
  return !selectedCandidate.value.has_credential || Boolean(commitForm.credentialRef.trim())
})

const splitList = (value: string) => {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildManualPayload = (): LocalClashOwnedExitPayload => {
  const payload: LocalClashOwnedExitPayload = {
    exit: {
      name: manual.name.trim(),
      type: manual.type.trim(),
      relay: manual.relay,
      entry_providers: splitList(manual.entryProviders),
      expected_exit_ip: splitList(manual.expected_exit_ip),
    },
  }
  const server = manual.server.trim()
  const healthUrl = manual.health_url.trim()
  const exitIpUrl = manual.exit_ip_url.trim()

  if (server) payload.exit.server = server
  if (Number(manual.port)) payload.exit.port = Number(manual.port)
  if (healthUrl) payload.exit.health_url = healthUrl
  if (exitIpUrl) payload.exit.exit_ip_url = exitIpUrl

  if (manual.credentialValue) {
    payload.credential = {
      kind: manual.credentialKind,
      ref: `${manual.name.trim()}.${manual.credentialKind}`,
      value: manual.credentialValue,
    }
  }

  return payload
}

const handleManualPreview = async () => {
  await previewOwnedExitManual(buildManualPayload()).catch(() => undefined)
}

const handleManualSave = async () => {
  await saveOwnedExit(manual.name.trim(), buildManualPayload()).then(() => {
    Object.assign(manual, emptyManual())
  }).catch(() => undefined)
}

const handleImportPreview = async () => {
  const payload = {
    ...(importForm.url.trim() ? { url: importForm.url.trim() } : {}),
    ...(importForm.yaml.trim() ? { yaml: importForm.yaml.trim() } : {}),
    ...(importForm.user_agent.trim() ? { user_agent: importForm.user_agent.trim() } : {}),
  }

  await previewOwnedExitImport(payload).then(() => {
    selectedCandidate.value = null
  }).catch(() => undefined)
}

const safeCredentialRef = (name: string) => {
  const ref = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return ref ? `${ref}_credential` : ''
}

const selectCandidate = (candidate: LocalClashOwnedExitCandidate) => {
  selectedCandidate.value = candidate
  commitForm.name = candidate.name
  commitForm.credentialRef = candidate.has_credential ? safeCredentialRef(candidate.name) : ''
  commitForm.relay = false
  commitForm.entryProviders = ''
  commitForm.health_url = ''
  commitForm.exit_ip_url = ''
  commitForm.expected_exit_ip = ''
}

const buildImportCommitPayload = (): LocalClashOwnedExitImportCommitRequest | null => {
  if (!selectedCandidate.value) return null
  const payload: LocalClashOwnedExitImportCommitRequest = {
    ...(importForm.url.trim() ? { url: importForm.url.trim() } : {}),
    ...(importForm.yaml.trim() ? { yaml: importForm.yaml.trim() } : {}),
    ...(importForm.user_agent.trim() ? { user_agent: importForm.user_agent.trim() } : {}),
    candidate_id: selectedCandidate.value.id,
    exit: {
      name: commitForm.name.trim(),
      type: selectedCandidate.value.type,
      relay: commitForm.relay,
      entry_providers: splitList(commitForm.entryProviders),
      expected_exit_ip: splitList(commitForm.expected_exit_ip),
    },
  }
  const credentialRef = commitForm.credentialRef.trim()
  const healthUrl = commitForm.health_url.trim()
  const exitIpUrl = commitForm.exit_ip_url.trim()

  if (credentialRef) payload.credential_ref = credentialRef
  if (healthUrl) payload.exit.health_url = healthUrl
  if (exitIpUrl) payload.exit.exit_ip_url = exitIpUrl

  return payload
}

const handleImportCommit = async () => {
  if (!canCommitSelectedCandidate.value) return
  const payload = buildImportCommitPayload()

  if (!payload) return
  await commitOwnedExitImport(payload).then(() => {
    selectedCandidate.value = null
  }).catch(() => undefined)
}

const handleRemove = async (name: string) => {
  await removeOwnedExit(name).catch(() => undefined)
}

const editExit = (exit: LocalClashExitSummary) => {
  manual.name = exit.name
  manual.type = exit.type
  manual.server = exit.server
  manual.port = 443
  manual.credentialValue = ''
  manual.relay = exit.relay
  manual.entryProviders = (exit.entry_providers || []).join(', ')
  manual.health_url = ''
  manual.exit_ip_url = ''
  manual.expected_exit_ip = ''
}
</script>
