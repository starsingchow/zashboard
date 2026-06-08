<template>
  <ChainAuthGate>
    <div class="flex h-full min-h-0 flex-col gap-4 p-4">
      <ChainStatusHeader />

      <div class="tabs tabs-boxed w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ 'tab-active': activeWorkbenchTab === tab.id }"
          type="button"
          @click="activeWorkbenchTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <section class="min-h-0 flex-1 overflow-auto">
        <SourcesPanel v-if="activeWorkbenchTab === 'sources'" />
        <NodesPanel v-else-if="activeWorkbenchTab === 'nodes'" />
        <RulesPanel v-else-if="activeWorkbenchTab === 'rules'" />
        <ServiceChainsPanel v-else-if="activeWorkbenchTab === 'services'" />
        <PreviewPanel v-else-if="activeWorkbenchTab === 'preview'" />
        <div
          v-else
          class="grid gap-3 md:grid-cols-3"
        >
          <ChainActionPanel class="md:col-span-2" />
          <PreviewPanel compact />
        </div>
      </section>
    </div>
  </ChainAuthGate>
</template>

<script setup lang="ts">
import ChainActionPanel from '@/components/chain/ChainActionPanel.vue'
import ChainAuthGate from '@/components/chain/ChainAuthGate.vue'
import ChainStatusHeader from '@/components/chain/ChainStatusHeader.vue'
import NodesPanel from '@/components/chain/NodesPanel.vue'
import PreviewPanel from '@/components/chain/PreviewPanel.vue'
import RulesPanel from '@/components/chain/RulesPanel.vue'
import ServiceChainsPanel from '@/components/chain/ServiceChainsPanel.vue'
import SourcesPanel from '@/components/chain/SourcesPanel.vue'
import { activeWorkbenchTab, refreshChainConfig, refreshManagedNodes } from '@/store/chain'
import { authenticated, refresh as refreshSession } from '@/store/localclashSession'
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tabs = computed(() => [
  { id: 'overview' as const, label: t('chainOverview') },
  { id: 'sources' as const, label: t('chainSources') },
  { id: 'nodes' as const, label: t('chainManagedNodes') },
  { id: 'rules' as const, label: t('chainRules') },
  { id: 'services' as const, label: t('chainServiceChains') },
  { id: 'preview' as const, label: t('chainPreview') },
])

const load = async () => {
  await refreshSession().catch(() => undefined)
  if (!authenticated.value) return
  await refreshChainConfig().catch(() => undefined)
  await refreshManagedNodes().catch(() => undefined)
}

onMounted(load)
watch(authenticated, (value) => {
  if (value) {
    void load()
  }
})
</script>
