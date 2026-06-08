<template>
  <div class="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
    <form
      class="rounded-box border-base-300 grid gap-3 border p-3"
      @submit.prevent="save"
    >
      <label class="grid gap-1 text-sm">
        <span>{{ $t('chainService') }}</span>
        <select
          v-model="draft.id"
          class="select select-sm select-bordered"
        >
          <option value="openai">OpenAI</option>
          <option value="claude">Claude</option>
          <option value="google">Google</option>
          <option value="apple">Apple</option>
          <option value="microsoft">Microsoft</option>
          <option value="streaming">Streaming</option>
        </select>
      </label>
      <label class="grid gap-1 text-sm">
        <span>{{ $t('chainFixedExit') }}</span>
        <select
          v-model="draft.fixed_exit_node_id"
          class="select select-sm select-bordered"
        >
          <option value="">{{ $t('chainSelectFixedExit') }}</option>
          <option
            v-for="node in fixedExitNodes"
            :key="node.id"
            :value="node.id"
          >
            {{ node.display_name }}
          </option>
        </select>
      </label>
      <label class="grid gap-1 text-sm">
        <span>{{ $t('chainEntrySelector') }}</span>
        <input
          v-model.trim="draft.entry_selector"
          class="input input-sm input-bordered"
        />
      </label>
      <label class="label cursor-pointer gap-2 py-0">
        <input
          v-model="draft.enabled"
          type="checkbox"
          class="checkbox checkbox-sm"
        />
        <span class="label-text">{{ $t('chainEnabled') }}</span>
      </label>
      <button
        class="btn btn-primary btn-sm"
        type="submit"
        :disabled="!draft.fixed_exit_node_id || loading"
      >
        {{ $t('chainSaveServiceChain') }}
      </button>
    </form>

    <div class="rounded-box border-base-300 overflow-hidden border">
      <table class="table-sm table">
        <thead>
          <tr>
            <th>{{ $t('chainService') }}</th>
            <th>{{ $t('chainEntrySelector') }}</th>
            <th>{{ $t('chainFixedExit') }}</th>
            <th>{{ $t('chainState') }}</th>
            <th class="text-right">{{ $t('chainActions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="service in services"
            :key="service.id"
          >
            <td>{{ service.name }}</td>
            <td>{{ service.entry_selector || '-' }}</td>
            <td>{{ service.fixed_exit_node_id || '-' }}</td>
            <td>{{ service.enabled ? $t('chainEnabled') : $t('chainDisabled') }}</td>
            <td class="text-right">
              <button
                class="btn btn-ghost btn-xs"
                type="button"
                :disabled="loading"
                @click="edit(service)"
              >
                {{ $t('chainEdit') }}
              </button>
              <button
                class="btn btn-ghost btn-xs text-error"
                type="button"
                :disabled="loading"
                @click="removeServiceChain(service.id)"
              >
                {{ $t('chainDelete') }}
              </button>
            </td>
          </tr>
          <tr v-if="services.length === 0">
            <td
              colspan="5"
              class="py-8 text-center opacity-60"
            >
              {{ $t('chainNoServiceChains') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  loading,
  managedNodes,
  removeServiceChain,
  saveServiceChain,
} from '@/store/chain'
import type { LocalClashServiceChain } from '@/types/localclash'
import { computed, reactive } from 'vue'

const services = computed(() => chainSummary.value?.managed?.service_chains || [])
const fixedExitNodes = computed(() =>
  managedNodes.value.filter((node) => node.tags?.includes('fixed_exit_candidate')),
)

const draft = reactive<LocalClashServiceChain>({
  id: 'openai',
  name: 'OpenAI',
  template: 'openai',
  enabled: true,
  entry_selector: 'LC-Default-Entry',
  fixed_exit_node_id: '',
})

const save = async () => {
  if (!draft.fixed_exit_node_id) return

  await saveServiceChain({
    ...draft,
    name: draft.id ? draft.id.charAt(0).toUpperCase() + draft.id.slice(1) : 'Service',
    template: draft.id,
  })
}

const edit = (service: LocalClashServiceChain) => {
  Object.assign(draft, {
    ...service,
    template: service.template || service.id,
    entry_selector: service.entry_selector || 'LC-Default-Entry',
    fixed_exit_node_id: service.fixed_exit_node_id || '',
  })
}
</script>
