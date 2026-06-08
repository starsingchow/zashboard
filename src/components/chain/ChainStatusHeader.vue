<template>
  <div class="base-container flex flex-col gap-3 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="truncate text-lg font-semibold">{{ $t('chainTitle') }}</h1>
        <div class="text-base-content/60 mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <span>{{ $t('chainMode') }}: {{ chainSummary?.mode || '-' }}</span>
          <span>
            {{ $t('chainRuntime') }}:
            {{ chainSummary?.runtime?.core || '-' }}/{{ chainSummary?.runtime?.profile || '-' }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="btn btn-circle btn-ghost btn-sm"
          :disabled="chainLoading"
          @click="refreshChainConfig"
        >
          <ArrowPathIcon
            class="h-4 w-4"
            :class="{ 'animate-spin': chainLoading }"
          />
        </button>
        <button
          v-for="action in actions"
          :key="action.name"
          class="btn btn-sm"
          :class="action.primary ? 'btn-primary' : 'btn-ghost'"
          :disabled="chainLoading"
          @click="handleAction(action.name)"
        >
          <component
            :is="action.icon"
            class="h-4 w-4"
          />
          {{ $t(action.label) }}
        </button>
      </div>
    </div>

    <div class="grid gap-2 text-sm lg:grid-cols-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-base-200/50 rounded-box px-3 py-2"
      >
        <div class="text-base-content/50 text-xs">{{ $t(stat.label) }}</div>
        <div class="font-semibold tabular-nums">{{ stat.value }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  loading as chainLoading,
  managedNodes,
  refreshChainConfig,
  runChainAction,
} from '@/store/chain'
import type { LocalClashChainAction } from '@/types/localclash'
import {
  ArrowPathIcon,
  BeakerIcon,
  CheckBadgeIcon,
  PlayIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'
import type { Component } from 'vue'
import { computed } from 'vue'

const stats = computed(() => [
  {
    label: 'chainEntryProviders',
    value: chainSummary.value?.entry_providers?.length || 0,
  },
  {
    label: 'chainOwnedExits',
    value: chainSummary.value?.exits?.length || 0,
  },
  {
    label: 'chainRoutes',
    value: chainSummary.value?.routes?.length || 0,
  },
  {
    label: 'chainManagedSources',
    value: chainSummary.value?.managed?.sources?.length || 0,
  },
  {
    label: 'chainManagedNodes',
    value: managedNodes.value.length || 0,
  },
  {
    label: 'chainRuleOverrides',
    value: chainSummary.value?.managed?.rule_overrides?.length || 0,
  },
])

const actions: {
  name: LocalClashChainAction
  label: string
  icon: Component
  primary?: boolean
}[] = [
  {
    name: 'render',
    label: 'chainRender',
    icon: PlayIcon,
  },
  {
    name: 'validate',
    label: 'chainValidate',
    icon: CheckBadgeIcon,
  },
  {
    name: 'test',
    label: 'chainTest',
    icon: BeakerIcon,
  },
  {
    name: 'apply',
    label: 'chainApply',
    icon: WrenchScrewdriverIcon,
    primary: true,
  },
]

const handleAction = async (action: LocalClashChainAction) => {
  await runChainAction(action).catch(() => undefined)
}
</script>
