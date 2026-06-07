<template>
  <div class="base-container flex flex-col gap-3 p-4">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-base font-semibold">{{ $t('chainRoutes') }}</h2>
      <span class="badge badge-sm">{{ routes.length }}</span>
    </div>

    <div class="flex flex-col divide-y divide-base-content/5">
      <div
        v-if="!routes.length"
        class="text-base-content/50 py-2 text-sm"
      >
        {{ $t('chainNoRoutes') }}
      </div>
      <div
        v-for="(route, index) in routes"
        :key="route.name"
        class="flex items-center gap-2 py-2 text-sm"
      >
        <div class="min-w-0 flex-1">
          <div class="truncate font-medium">{{ route.name }}</div>
          <div class="text-base-content/50 text-xs">{{ $t('chainExit') }}: {{ route.exit }}</div>
        </div>
        <button
          class="btn btn-circle btn-ghost btn-xs"
          :disabled="chainLoading || index === 0"
          @click="moveRoute(index, -1)"
        >
          <ArrowUpIcon class="h-3.5 w-3.5" />
        </button>
        <button
          class="btn btn-circle btn-ghost btn-xs"
          :disabled="chainLoading || index === routes.length - 1"
          @click="moveRoute(index, 1)"
        >
          <ArrowDownIcon class="h-3.5 w-3.5" />
        </button>
        <button
          class="btn btn-circle btn-ghost btn-xs"
          :disabled="chainLoading"
          @click="editRoute(route)"
        >
          <PencilIcon class="h-3.5 w-3.5" />
        </button>
        <button
          class="btn btn-circle btn-error btn-outline btn-xs"
          :disabled="chainLoading"
          @click="handleRemove(route.name)"
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
        <span>{{ $t('chainName') }}</span>
        <input
          v-model="form.name"
          class="input input-sm w-full"
        />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainRouteTarget') }}</span>
        <select
          v-model="form.exit"
          class="select select-sm w-full"
        >
          <option
            v-for="target in targetOptions"
            :key="target"
            :value="target"
          >
            {{ target }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainMatchType') }}</span>
        <select
          v-model="form.matchType"
          class="select select-sm w-full"
        >
          <option value="domain">domain</option>
          <option value="domain_suffix">domain_suffix</option>
          <option value="domain_regex">domain_regex</option>
          <option value="ip_cidr">ip_cidr</option>
          <option value="default">{{ $t('chainDefaultRoute') }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span>{{ $t('chainMatchValues') }}</span>
        <textarea
          v-model="form.values"
          class="textarea textarea-sm min-h-18 w-full"
          :disabled="form.matchType === 'default'"
        />
      </label>
      <div class="flex flex-wrap gap-2 md:col-span-2">
        <button
          class="btn btn-primary btn-sm"
          type="submit"
          :disabled="chainLoading || !form.name || !form.exit || !hasMatch"
        >
          <CheckIcon class="h-4 w-4" />
          {{ $t('chainSave') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import {
  chainSummary,
  loading as chainLoading,
  removeRoute,
  reorderRoutes,
  saveRoute,
} from '@/store/chain'
import type {
  LocalClashRouteMatch,
  LocalClashRoutePayload,
  LocalClashRouteSummary,
} from '@/types/localclash'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { computed, reactive } from 'vue'

type MatchType = 'domain' | 'domain_suffix' | 'domain_regex' | 'ip_cidr' | 'default'

const emptyForm = () => ({
  name: '',
  exit: 'DIRECT',
  matchType: 'domain' as MatchType,
  values: '',
})

const form = reactive(emptyForm())

const routes = computed(() => chainSummary.value?.routes || [])
const targetOptions = computed(() => [
  ...(chainSummary.value?.exits.map((exit) => exit.name) || []),
  'DIRECT',
  'REJECT',
  'A-only',
])
const hasMatch = computed(() => form.matchType === 'default' || splitList(form.values).length > 0)

const splitList = (value: string) => {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

const buildMatch = (): LocalClashRouteMatch => {
  const values = splitList(form.values)

  switch (form.matchType) {
    case 'domain':
      return { domain: values }
    case 'domain_suffix':
      return { domain_suffix: values }
    case 'domain_regex':
      return { domain_regex: values }
    case 'ip_cidr':
      return { ip_cidr: values }
    default:
      return { default: true }
  }
}

const buildPayload = (): LocalClashRoutePayload => ({
  route: {
    name: form.name.trim(),
    exit: form.exit,
    match: buildMatch(),
  },
})

const handleSave = async () => {
  await saveRoute(form.name.trim(), buildPayload()).then(() => {
    Object.assign(form, emptyForm())
  }).catch(() => undefined)
}

const handleRemove = async (name: string) => {
  await removeRoute(name).catch(() => undefined)
}

const editRoute = (route: LocalClashRouteSummary) => {
  form.name = route.name
  form.exit = route.exit
  form.matchType = 'domain'
  form.values = ''
}

const moveRoute = async (index: number, direction: -1 | 1) => {
  const names = routes.value.map((route) => route.name)
  const targetIndex = index + direction
  const [item] = names.splice(index, 1)

  names.splice(targetIndex, 0, item)
  await reorderRoutes(names).catch(() => undefined)
}
</script>
