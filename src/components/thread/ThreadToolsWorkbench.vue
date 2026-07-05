<template>
  <section class="thread-workbench-body card-panel">
    <ThreadParsePanel
      v-if="modelValue === 'parse'"
      :pt="pt"
      @locate="$emit('locate', $event)"
    />
    <ThreadComparePanel
      v-else-if="modelValue === 'compare'"
      :model-value="compareIds"
      :pt="pt"
      @update:model-value="$emit('update:compareIds', $event)"
    />
    <ThreadMisconfigPanel
      v-else-if="modelValue === 'misconfig'"
      :pt="pt"
      @open-compare="$emit('open-compare', $event)"
    />
  </section>
</template>

<script setup>
import ThreadParsePanel from '@/components/thread/ThreadParsePanel.vue'
import ThreadComparePanel from '@/components/thread/ThreadComparePanel.vue'
import ThreadMisconfigPanel from '@/components/thread/ThreadMisconfigPanel.vue'

defineProps({
  modelValue: { type: String, required: true },
  compareIds: { type: Array, default: () => [] },
  pt: { type: Function, required: true },
})

defineEmits(['update:compareIds', 'locate', 'open-compare'])
</script>
