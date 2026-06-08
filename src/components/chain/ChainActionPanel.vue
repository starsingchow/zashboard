<template>
  <div class="base-container flex min-h-0 flex-col gap-3 p-4">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold">{{ $t('chainActions') }}</h2>
      <span class="badge badge-sm">{{ chainActionOutput?.action || '-' }}</span>
    </div>

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-1">
      <section class="min-w-0">
        <div class="text-base-content/60 mb-1 text-xs">{{ $t('chainLastAction') }}</div>
        <pre class="bg-base-200/60 max-h-64 overflow-auto rounded-lg p-3 text-xs">{{
          actionJson
        }}</pre>
      </section>

      <section class="min-w-0">
        <div class="text-base-content/60 mb-1 text-xs">{{ $t('chainConfigSummary') }}</div>
        <pre class="bg-base-200/60 max-h-64 overflow-auto rounded-lg p-3 text-xs">{{
          summaryJson
        }}</pre>
      </section>
    </div>

    <div class="text-base-content/60 text-xs">
      {{ chainWarnings.length ? chainWarnings.join('\n') : $t('chainNoWarnings') }}
    </div>
    <div class="grid gap-2 text-xs sm:grid-cols-4">
      <div
        v-for="status in actionStatuses"
        :key="status.action"
        class="border-base-300 rounded border p-2"
      >
        <div class="font-medium">{{ status.label }}</div>
        <div class="text-base-content/70">{{ status.status }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { chainActionOutput, chainActionStatuses, chainSummary, chainWarnings } from '@/store/chain'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const actionJson = computed(() => {
  if (!chainActionOutput.value) return t('chainNoActionOutput')
  return JSON.stringify(chainActionOutput.value.response, null, 2)
})

const summaryJson = computed(() => {
  if (!chainSummary.value) return '{}'
  return JSON.stringify(
    {
      mode: chainSummary.value.mode,
      runtime: chainSummary.value.runtime,
      managed: chainSummary.value.managed,
      entry_providers: chainSummary.value.entry_providers,
      exits: chainSummary.value.exits,
      routes: chainSummary.value.routes,
    },
    null,
    2,
  )
})

const actionStatuses = computed(() => [
  { action: 'render', label: t('chainRender'), status: chainActionStatuses.value.render.status },
  {
    action: 'validate',
    label: t('chainValidate'),
    status: chainActionStatuses.value.validate.status,
  },
  { action: 'test', label: t('chainTest'), status: chainActionStatuses.value.test.status },
  { action: 'apply', label: t('chainApply'), status: chainActionStatuses.value.apply.status },
])
</script>
