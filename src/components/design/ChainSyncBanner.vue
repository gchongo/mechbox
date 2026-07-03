<template>
  <el-alert
    v-if="session"
    class="mb-4"
    type="info"
    :closable="true"
    show-icon
    @close="$emit('dismiss')"
  >
    <template #title>{{ dt('chainSyncTitle') }}</template>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ dt('chainSyncDesc', { name: chainName || '—' }) }}
      <span v-if="dirty" class="ml-1 text-warning">· {{ dt('chainSyncDirty') }}</span>
    </p>
    <div class="mt-2 flex flex-wrap gap-2">
      <el-button size="small" type="primary" :disabled="!dirty" @click="$emit('sync')">
        {{ dt('syncToChain') }}
      </el-button>
      <el-button size="small" plain @click="$emit('back')">{{ dt('backToChain') }}</el-button>
    </div>
  </el-alert>
</template>

<script setup>
import { useDecisionI18n } from '@/composables/useDecisionI18n'

defineProps({
  session: { type: Object, default: null },
  chainName: { type: String, default: '' },
  dirty: { type: Boolean, default: false },
})

defineEmits(['sync', 'back', 'dismiss'])

const { dt } = useDecisionI18n()
</script>
