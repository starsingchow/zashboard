<template>
  <section v-if="authenticated" class="min-h-0">
    <slot />
  </section>
  <form
    v-else
    class="base-container mx-auto flex w-96 max-w-full flex-col gap-3 p-4"
    @submit.prevent="handleSubmit"
  >
    <div class="flex items-center gap-2">
      <LockClosedIcon class="h-5 w-5 opacity-70" />
      <h1 class="text-lg font-semibold">{{ $t('chainSessionTitle') }}</h1>
    </div>

    <div
      v-if="sessionError"
      class="alert alert-error py-2 text-sm"
    >
      {{ sessionError }}
    </div>

    <label
      v-if="setupRequired"
      class="flex flex-col gap-1 text-sm"
    >
      <span>{{ $t('chainSetupToken') }}</span>
      <input
        v-model="setupToken"
        class="input input-sm w-full"
        autocomplete="one-time-code"
      />
    </label>

    <label class="flex flex-col gap-1 text-sm">
      <span>{{ $t('password') }}</span>
      <input
        v-model="password"
        type="password"
        class="input input-sm w-full"
        autocomplete="current-password"
      />
    </label>

    <button
      class="btn btn-primary btn-sm"
      type="submit"
      :disabled="sessionLoading || !password || (setupRequired && !setupToken)"
    >
      <CheckCircleIcon class="h-4 w-4" />
      {{ setupRequired ? $t('chainSetup') : $t('chainLogin') }}
    </button>
  </form>
</template>

<script setup lang="ts">
import {
  error as sessionError,
  loading as sessionLoading,
  authenticated,
  login,
  setup,
  setupRequired,
} from '@/store/localclashSession'
import { CheckCircleIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const setupToken = ref(new URLSearchParams(location.search).get('setup_token') || '')
const password = ref('')

const handleSubmit = async () => {
  if (setupRequired.value) {
    await setup({
      token: setupToken.value,
      password: password.value,
    }).catch(() => undefined)
    return
  }

  await login({
    password: password.value,
  }).catch(() => undefined)
}
</script>
