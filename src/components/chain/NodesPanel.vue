<template>
  <div class="grid gap-3">
    <input
      v-model.trim="query"
      class="input input-sm input-bordered max-w-sm"
      :placeholder="$t('chainSearchNodes')"
    />
    <div class="rounded-box border-base-300 overflow-hidden border">
      <table class="table-sm table">
        <thead>
          <tr>
            <th>{{ $t('chainNode') }}</th>
            <th>{{ $t('chainSource') }}</th>
            <th>{{ $t('chainProtocol') }}</th>
            <th>{{ $t('chainServer') }}</th>
            <th>{{ $t('chainTags') }}</th>
            <th>{{ $t('chainTest') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="node in filteredNodes"
            :key="node.id"
          >
            <td>
              <div class="font-medium">{{ node.display_name }}</div>
              <div class="text-xs opacity-60">{{ node.id }}</div>
            </td>
            <td>{{ node.source_id }}</td>
            <td>{{ node.protocol || '-' }}</td>
            <td>{{ node.server || '-' }}{{ node.port ? `:${node.port}` : '' }}</td>
            <td class="flex flex-wrap gap-2">
              <label class="label cursor-pointer gap-2 p-0 text-xs">
                <input
                  class="checkbox checkbox-xs"
                  type="checkbox"
                  :checked="hasTag(node, 'not_entry')"
                  :disabled="loading"
                  @change="toggleTag(node, 'not_entry')"
                />
                {{ $t('chainNotEntry') }}
              </label>
              <label class="label cursor-pointer gap-2 p-0 text-xs">
                <input
                  class="checkbox checkbox-xs"
                  type="checkbox"
                  :checked="hasTag(node, 'fixed_exit_candidate')"
                  :disabled="loading"
                  @change="toggleTag(node, 'fixed_exit_candidate')"
                />
                {{ $t('chainFixedExitCandidate') }}
              </label>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <button
                  class="btn btn-xs btn-outline"
                  :class="{ 'btn-disabled': nodeTestResults[node.id]?.status === 'running' }"
                  :disabled="nodeTestResults[node.id]?.status === 'running'"
                  @click="testNodeDelay(node.id)"
                >
                  <span
                    v-if="nodeTestResults[node.id]?.status === 'running'"
                    class="loading loading-spinner loading-xs"
                  />
                  {{ nodeTestResults[node.id]?.status === 'running' ? $t('chainTesting') : $t('chainTest') }}
                </button>
                <span
                  v-if="nodeTestResults[node.id]?.status === 'ok'"
                  class="text-xs text-success"
                >
                  {{ nodeTestResults[node.id]?.message || $t('chainTestOk') }}
                </span>
                <span
                  v-if="nodeTestResults[node.id]?.status === 'warn'"
                  class="text-xs text-warning"
                  :title="nodeTestResults[node.id]?.message"
                >
                  {{ nodeTestResults[node.id]?.message || $t('chainTestWarn') }}
                </span>
                <span
                  v-if="nodeTestResults[node.id]?.status === 'error'"
                  class="text-xs text-error"
                  :title="nodeTestResults[node.id]?.message"
                >
                  {{ nodeTestResults[node.id]?.message || $t('chainTestFailed') }}
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="filteredNodes.length === 0">
            <td
              colspan="6"
              class="py-8 text-center opacity-60"
            >
              {{ $t('chainNoNodes') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loading, managedNodes, nodeTestResults, testNodeDelay, updateNodeTags } from '@/store/chain'
import type { LocalClashManagedNode, LocalClashNodeTag } from '@/types/localclash'
import { computed, ref } from 'vue'

const query = ref('')

const filteredNodes = computed(() => {
  const term = query.value.toLowerCase()

  if (!term) {
    return managedNodes.value
  }

  return managedNodes.value.filter((node) =>
    [node.id, node.source_id, node.display_name, node.protocol, node.server]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  )
})

const hasTag = (node: LocalClashManagedNode, tag: LocalClashNodeTag) => {
  return Boolean(node.tags?.includes(tag))
}

const toggleTag = async (node: LocalClashManagedNode, tag: LocalClashNodeTag) => {
  const tags = new Set(node.tags || [])

  if (tags.has(tag)) {
    tags.delete(tag)
  } else {
    tags.add(tag)
  }

  await updateNodeTags(node.id, Array.from(tags))
}
</script>
