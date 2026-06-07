<template>
  <div class="relative size-full overflow-x-hidden">
    <div
      class="flex flex-col gap-3 p-3"
      :style="padding"
    >
      <ChainAuthGate v-if="!ready" />
      <template v-else>
        <ChainStatusHeader />
        <ChainErrorAlert />
        <div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <EntryProvidersPanel />
          <OwnedExitsPanel />
          <RoutesPanel />
          <ChainActionPanel />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChainActionPanel from '@/components/chain/ChainActionPanel.vue'
import ChainAuthGate from '@/components/chain/ChainAuthGate.vue'
import ChainErrorAlert from '@/components/chain/ChainErrorAlert.vue'
import ChainStatusHeader from '@/components/chain/ChainStatusHeader.vue'
import EntryProvidersPanel from '@/components/chain/EntryProvidersPanel.vue'
import OwnedExitsPanel from '@/components/chain/OwnedExitsPanel.vue'
import RoutesPanel from '@/components/chain/RoutesPanel.vue'
import { usePaddingForViews } from '@/composables/paddingViews'
import { refreshChainConfig } from '@/store/chain'
import { authenticated, refresh as refreshSession } from '@/store/localclashSession'
import { computed, onMounted, watch } from 'vue'

const { padding } = usePaddingForViews({
  offsetTop: 12,
  offsetBottom: 8,
})
const ready = computed(() => authenticated.value)

const loadChainWhenReady = async () => {
  if (!authenticated.value) return
  await refreshChainConfig().catch(() => undefined)
}

onMounted(async () => {
  await refreshSession().catch(() => undefined)
})

watch(
  authenticated,
  (ready) => {
    if (ready) loadChainWhenReady()
  },
  { immediate: true },
)
</script>
