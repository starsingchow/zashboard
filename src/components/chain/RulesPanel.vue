<template>
  <div class="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
    <form
      class="rounded-box border-base-300 grid gap-3 border p-3"
      @submit.prevent="saveProfile"
    >
      <label class="grid gap-1 text-sm">
        <span>{{ $t('chainRuleProfile') }}</span>
        <select
          v-model="profile.type"
          class="select select-sm select-bordered"
        >
          <option value="imported_source">{{ $t('chainImportedSourceRules') }}</option>
          <option value="shadowrocket_default">{{ $t('chainShadowrocketDefault') }}</option>
          <option value="unmanaged">{{ $t('chainUnmanagedRules') }}</option>
        </select>
      </label>
      <label
        v-if="profile.type === 'imported_source'"
        class="grid gap-1 text-sm"
      >
        <span>{{ $t('chainImportedSource') }}</span>
        <select
          v-model="profile.source_id"
          class="select select-sm select-bordered"
        >
          <option
            v-for="source in sources"
            :key="source.id"
            :value="source.id"
          >
            {{ source.name }}
          </option>
        </select>
      </label>
      <button
        class="btn btn-primary btn-sm"
        type="submit"
        :disabled="loading"
      >
        {{ $t('chainSaveProfile') }}
      </button>
    </form>

    <div class="grid gap-3">
      <form
        class="join"
        @submit.prevent="saveCustom"
      >
        <input
          v-model.trim="customRule"
          class="input input-sm input-bordered join-item flex-1"
          placeholder="DOMAIN-SUFFIX,dev.example,LC-Default-Entry"
        />
        <button
          class="btn btn-sm join-item"
          type="submit"
          :disabled="!customRule || loading"
        >
          {{ $t('chainAddRule') }}
        </button>
      </form>
      <form
        class="join"
        @submit.prevent="disableImported"
      >
        <input
          v-model.trim="importedRuleId"
          class="input input-sm input-bordered join-item flex-1"
          :placeholder="$t('chainImportedRuleId')"
        />
        <button
          class="btn btn-sm join-item"
          type="submit"
          :disabled="!importedRuleId || loading"
        >
          {{ $t('chainDisableImported') }}
        </button>
      </form>
      <div class="rounded-box border-base-300 overflow-hidden border">
        <table class="table-sm table">
          <thead>
            <tr>
              <th>{{ $t('chainOverride') }}</th>
              <th>{{ $t('chainType') }}</th>
              <th>{{ $t('chainState') }}</th>
              <th class="text-right">{{ $t('chainActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="override in overrides"
              :key="override.id"
            >
              <td>{{ override.id }}</td>
              <td>{{ override.type }}</td>
              <td>{{ override.enabled ? $t('chainEnabled') : $t('chainDisabled') }}</td>
              <td class="text-right">
                <button
                  class="btn btn-ghost btn-xs"
                  type="button"
                  :disabled="loading"
                  @click="removeRuleOverride(override.id)"
                >
                  {{ $t('chainDelete') }}
                </button>
              </td>
            </tr>
            <tr v-if="overrides.length === 0">
              <td
                colspan="4"
                class="py-8 text-center opacity-60"
              >
                {{ $t('chainNoRules') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  loading,
  removeRuleOverride,
  saveRuleOverride,
  saveRuleProfile,
} from '@/store/chain'
import type { LocalClashRuleProfile } from '@/types/localclash'
import { computed, reactive, ref, watchEffect } from 'vue'

const sources = computed(() => chainSummary.value?.managed?.sources || [])
const overrides = computed(() => chainSummary.value?.managed?.rule_overrides || [])
const customRule = ref('')
const importedRuleId = ref('')
const profile = reactive<LocalClashRuleProfile>({ type: 'unmanaged' })

watchEffect(() => {
  const current = chainSummary.value?.managed?.rule_profile

  if (current) {
    profile.type = current.type
    profile.source_id = current.source_id
  }
})

const saveProfile = async () => {
  await saveRuleProfile({ ...profile })
}

const saveCustom = async () => {
  const id = `custom-${Date.now()}`

  await saveRuleOverride({
    id,
    type: 'custom_rule',
    enabled: true,
    rule: customRule.value,
  })
  customRule.value = ''
}

const disableImported = async () => {
  const id = `disable-${importedRuleId.value.replace(/[^a-zA-Z0-9_.-]/g, '-')}`

  await saveRuleOverride({
    id,
    type: 'disable_imported',
    enabled: true,
    imported_rule_id: importedRuleId.value,
  })
  importedRuleId.value = ''
}
</script>
