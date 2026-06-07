<template>
  <div
    v-if="chainError || chainWarnings.length"
    class="flex flex-col gap-2"
  >
    <div
      v-if="chainError"
      class="alert alert-error py-2 text-sm"
    >
      {{ chainError }}
    </div>
    <div
      v-if="chainWarnings.length"
      class="alert alert-warning py-2 text-sm"
    >
      <div class="flex flex-col gap-1">
        <div class="font-medium">{{ $t('chainWarnings') }}</div>
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
import { chainWarnings, error as chainError } from '@/store/chain'
</script>
