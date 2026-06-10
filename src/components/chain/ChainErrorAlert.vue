<template>
  <div
    v-if="structuredError || chainError || chainWarnings.length"
    class="flex flex-col gap-2"
  >
    <!-- Structured error from backend (e.g. apply failure) -->
    <div
      v-if="structuredError"
      class="alert alert-error py-2 text-sm"
    >
      <div class="min-w-0 flex-1">
        <div class="font-bold">{{ structuredError.code || t('chainError') }}</div>
        <div v-if="structuredError.message">{{ structuredError.message }}</div>
        <div
          v-if="structuredError.lastGood?.active"
          class="text-base-content/80 mt-1 text-sm"
        >
          {{ t('chainLastGoodStillActive') }}
          <span v-if="structuredError.lastGood.source">
            · {{ structuredError.lastGood.source }}
          </span>
        </div>
        <div
          v-if="structuredError.nextAction"
          class="mt-1 text-sm"
        >
          {{ t('chainSuggested') }}: {{ structuredError.nextAction }}
        </div>
      </div>
      <button
        class="btn btn-sm btn-ghost shrink-0"
        type="button"
        @click="dismissStructuredError"
      >
        {{ t('chainDismiss') }}
      </button>
    </div>

    <!-- Simple error string fallback -->
    <div
      v-if="!structuredError && chainError"
      class="alert alert-error py-2 text-sm"
    >
      {{ chainError }}
    </div>

    <!-- Warnings -->
    <div
      v-if="chainWarnings.length"
      class="alert alert-warning py-2 text-sm"
    >
      <div class="flex flex-col gap-1">
        <div class="font-medium">{{ t('chainWarnings') }}</div>
        <div
          v-for="warning in chainWarnings"
          :key="warning"
        >
          {{ warning }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  chainStructuredError as structuredError,
  chainWarnings,
  dismissStructuredError,
  error as chainError,
} from '@/store/chain'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
