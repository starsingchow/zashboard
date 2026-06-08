<template>
  <div class="grid gap-3">
    <div
      v-if="!compact"
      class="flex flex-wrap gap-2"
    >
      <button
        v-for="action in actions"
        :key="action"
        class="btn btn-sm"
        type="button"
        :disabled="loading"
        @click="runChainAction(action)"
      >
        {{ actionLabel(action) }}
        <span class="badge badge-xs">{{ chainActionStatuses[action].status }}</span>
      </button>
    </div>
    <pre class="rounded-box bg-base-200 max-h-[32rem] overflow-auto p-3 text-xs">{{ payload }}</pre>
  </div>
</template>

<script setup lang="ts">
import {
  chainActionOutput,
  chainActionStatuses,
  chainSummary,
  loading,
  runChainAction,
} from '@/store/chain'
import type { LocalClashChainAction } from '@/types/localclash'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  compact?: boolean
}>()

const actions: LocalClashChainAction[] = ['render', 'validate', 'test', 'apply']
const { t } = useI18n()

const actionLabel = (action: LocalClashChainAction) => {
  const labels: Record<LocalClashChainAction, string> = {
    render: t('chainRender'),
    validate: t('chainValidate'),
    test: t('chainTest'),
    apply: t('chainApply'),
  }

  return labels[action]
}

const payload = computed(() =>
  JSON.stringify(
    {
      summary: chainSummary.value,
      action: chainActionOutput.value,
      statuses: chainActionStatuses.value,
    },
    null,
    2,
  ),
)
</script>
