<template>
  <section class="thread-workbench-body card-panel">
    <ThreadDesignWizard
      v-if="modelValue === 'wizard'"
      :pt="pt"
      @open-query="$emit('open-query', $event)"
      @open-row="$emit('open-row', $event)"
      @open-compare="$emit('open-compare', $event)"
    />
    <ThreadToleranceGuide v-else-if="modelValue === 'tolerance'" :pt="pt" />
    <ThreadEngagementPanel v-else-if="modelValue === 'engagement'" :pt="pt" />
    <ThreadTapDrillPanel v-else-if="modelValue === 'tapDrill'" :pt="pt" />
    <ThreadManufacturingPanel v-else-if="modelValue === 'mfg'" :pt="pt" />
  </section>
</template>

<script setup>
import ThreadDesignWizard from '@/components/thread/ThreadDesignWizard.vue'
import ThreadToleranceGuide from '@/components/thread/ThreadToleranceGuide.vue'
import ThreadEngagementPanel from '@/components/thread/ThreadEngagementPanel.vue'
import ThreadTapDrillPanel from '@/components/thread/ThreadTapDrillPanel.vue'
import ThreadManufacturingPanel from '@/components/thread/ThreadManufacturingPanel.vue'

defineProps({
  modelValue: { type: String, required: true },
  pt: { type: Function, required: true },
})

defineEmits(['open-query', 'open-row', 'open-compare'])
</script>
