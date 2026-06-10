<template>
  <div class="grid gap-4 lg:grid-cols-[22rem_minmax(0,1fr)]">
    <form
      class="rounded-box border-base-300 grid gap-3 border p-3"
      @submit.prevent="save"
    >
      <label class="grid gap-1 text-sm">
        <span>{{ $t('chainTemplate') }}</span>
        <select
          v-model="selectedTemplateId"
          class="select select-sm select-bordered"
          @change="onTemplateChange"
        >
          <option value="">{{ $t('chainCustom') }}</option>
          <option
            v-for="tmpl in serviceTemplates"
            :key="tmpl.id"
            :value="tmpl.id"
          >
            {{ tmpl.name }}
          </option>
        </select>
      </label>

      <label class="grid gap-1 text-sm">
        <span>{{ $t('chainServiceName') }}</span>
        <input
          v-model.trim="draft.name"
          class="input input-sm input-bordered"
          :placeholder="selectedTemplate?.name || $t('chainServiceName')"
          :disabled="Boolean(selectedTemplate)"
        />
      </label>

      <!-- Read-only rule-source summary for template-backed services -->
      <div
        v-if="selectedTemplate"
        class="rounded-box bg-base-200 grid gap-1 p-2 text-xs"
      >
        <div class="flex items-center justify-between">
          <span class="opacity-60">{{ $t('chainRuleSource') }}</span>
          <span>{{ selectedTemplate.rule_source }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="opacity-60">{{ $t('chainPackName') }}</span>
          <span>{{ selectedTemplate.pack_name }}</span>
        </div>
        <div
          v-if="selectedTemplate.behavior"
          class="flex items-center justify-between"
        >
          <span class="opacity-60">{{ $t('chainBehavior') }}</span>
          <span>{{ selectedTemplate.behavior }}</span>
        </div>
        <div
          v-if="selectedTemplate.render_type"
          class="flex items-center justify-between"
        >
          <span class="opacity-60">{{ $t('chainRenderType') }}</span>
          <span>{{ selectedTemplate.render_type }}</span>
        </div>
      </div>

      <!-- Manual match editors for custom services -->
      <fieldset
        v-if="!selectedTemplate"
        class="grid gap-2"
      >
        <legend class="text-xs font-medium opacity-80">
          {{ $t('chainMatchRules') }}
        </legend>
        <label class="grid gap-0.5 text-xs">
          <span>{{ $t('chainDomain') }}</span>
          <textarea
            v-model.trim="matchDraft.domain"
            class="textarea textarea-bordered textarea-xs"
            rows="2"
            placeholder="example.com"
          />
        </label>
        <label class="grid gap-0.5 text-xs">
          <span>{{ $t('chainDomainSuffix') }}</span>
          <textarea
            v-model.trim="matchDraft.domain_suffix"
            class="textarea textarea-bordered textarea-xs"
            rows="2"
            placeholder=".example.com"
          />
        </label>
        <label class="grid gap-0.5 text-xs">
          <span>{{ $t('chainDomainKeyword') }}</span>
          <textarea
            v-model.trim="matchDraft.domain_keyword"
            class="textarea textarea-bordered textarea-xs"
            rows="2"
            placeholder="example"
          />
        </label>
        <label class="grid gap-0.5 text-xs">
          <span>{{ $t('chainIpCidr') }}</span>
          <textarea
            v-model.trim="matchDraft.ip_cidr"
            class="textarea textarea-bordered textarea-xs"
            rows="2"
            placeholder="10.0.0.0/8"
          />
        </label>
        <label class="grid gap-0.5 text-xs">
          <span>{{ $t('chainGeoip') }}</span>
          <input
            v-model.trim="matchDraft.geoip"
            class="input input-xs input-bordered"
            placeholder="cn"
          />
        </label>
        <label class="grid gap-0.5 text-xs">
          <span>{{ $t('chainRuleSet') }}</span>
          <input
            v-model.trim="matchDraft.rule_set"
            class="input input-xs input-bordered"
            placeholder="provider_name"
          />
        </label>
      </fieldset>

      <!-- Template-managed notice -->
      <p
        v-if="selectedTemplate"
        class="text-xs opacity-50"
      >
        {{ $t('chainTemplateRulesManaged') }}
      </p>

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
        :disabled="!canSave"
      >
        {{ $t('chainSaveServiceChain') }}
      </button>
    </form>

    <div class="rounded-box border-base-300 overflow-hidden border">
      <table class="table-sm table">
        <thead>
          <tr>
            <th>{{ $t('chainService') }}</th>
            <th>{{ $t('chainTemplate') }}</th>
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
            <td>{{ templateNameFor(service.template) }}</td>
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
              colspan="6"
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
  serviceTemplates,
  refreshServiceTemplates,
} from '@/store/chain'
import type { LocalClashServiceChain } from '@/types/localclash'
import { computed, onMounted, reactive, ref } from 'vue'

const services = computed(() => chainSummary.value?.managed?.service_chains || [])
const fixedExitNodes = computed(() =>
  managedNodes.value.filter((node) => node.tags?.includes('fixed_exit_candidate')),
)

const selectedTemplateId = ref('')

const selectedTemplate = computed(() =>
  selectedTemplateId.value
    ? serviceTemplates.value.find((t) => t.id === selectedTemplateId.value) ?? null
    : null,
)

const templateNameFor = (id?: string) => {
  if (!id) return '-'
  const tmpl = serviceTemplates.value.find((t) => t.id === id)
  return tmpl?.name ?? id
}

const slugifyServiceID = (value: string) =>
  value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'custom'

const draft = reactive<LocalClashServiceChain>({
  id: '',
  name: '',
  template: '',
  enabled: true,
  entry_selector: 'LC-Default-Entry',
  fixed_exit_node_id: '',
})

const matchDraft = reactive({
  domain: '',
  domain_suffix: '',
  domain_keyword: '',
  ip_cidr: '',
  geoip: '',
  rule_set: '',
})

const parseLines = (text: string): string[] =>
  text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)

const linesFromArray = (arr?: string[]): string => (arr ?? []).join('\n')

const canSave = computed(
  () =>
    Boolean(draft.fixed_exit_node_id) &&
    Boolean(selectedTemplate.value || draft.name.trim()) &&
    !loading.value,
)

const onTemplateChange = () => {
  const tmpl = selectedTemplate.value
  if (tmpl) {
    draft.name = tmpl.name
    draft.template = tmpl.id
  } else {
    if (serviceTemplates.value.some((template) => template.id === draft.id)) {
      draft.id = ''
    }
    draft.template = ''
  }
}

const buildPayload = (): LocalClashServiceChain => {
  const tmpl = selectedTemplate.value
  const id = tmpl ? tmpl.id : draft.id || slugifyServiceID(draft.name)
  const payload: LocalClashServiceChain = {
    id,
    name: tmpl ? tmpl.name : (draft.name || id),
    enabled: draft.enabled,
    entry_selector: draft.entry_selector || undefined,
    fixed_exit_node_id: draft.fixed_exit_node_id || undefined,
    template: tmpl ? tmpl.id : undefined,
  }
  if (!tmpl) {
    const match: NonNullable<LocalClashServiceChain['match']> = {}
    const domain = parseLines(matchDraft.domain)
    const domainSuffix = parseLines(matchDraft.domain_suffix)
    const domainKeyword = parseLines(matchDraft.domain_keyword)
    const ipCidr = parseLines(matchDraft.ip_cidr)
    const geoip = parseLines(matchDraft.geoip)
    const ruleSet = parseLines(matchDraft.rule_set)
    if (domain.length) match.domain = domain
    if (domainSuffix.length) match.domain_suffix = domainSuffix
    if (domainKeyword.length) match.domain_keyword = domainKeyword
    if (ipCidr.length) match.ip_cidr = ipCidr
    if (geoip.length) match.geoip = geoip
    if (ruleSet.length) match.rule_set = ruleSet
    if (Object.keys(match).length) payload.match = match
  }
  return payload
}

const save = async () => {
  if (!draft.fixed_exit_node_id) return
  await saveServiceChain(buildPayload())
}

const edit = (service: LocalClashServiceChain) => {
  const tmplId = service.template || ''
  selectedTemplateId.value = tmplId
  Object.assign(draft, {
    id: service.id,
    name: service.name,
    template: tmplId,
    enabled: service.enabled,
    entry_selector: service.entry_selector || 'LC-Default-Entry',
    fixed_exit_node_id: service.fixed_exit_node_id || '',
  })
  if (!tmplId) {
    Object.assign(matchDraft, {
      domain: linesFromArray(service.match?.domain),
      domain_suffix: linesFromArray(service.match?.domain_suffix),
      domain_keyword: linesFromArray(service.match?.domain_keyword),
      ip_cidr: linesFromArray(service.match?.ip_cidr),
      geoip: linesFromArray(service.match?.geoip),
      rule_set: linesFromArray(service.match?.rule_set),
    })
  } else {
    Object.assign(matchDraft, {
      domain: '',
      domain_suffix: '',
      domain_keyword: '',
      ip_cidr: '',
      geoip: '',
      rule_set: '',
    })
  }
}

onMounted(() => {
  refreshServiceTemplates()
})
</script>
