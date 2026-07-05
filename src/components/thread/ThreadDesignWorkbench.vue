<template>
  <section class="thread-workbench card-panel">
    <p class="thread-workbench-intro">{{ pt('designFlowHint') }}</p>

    <nav class="thread-sub-nav" role="tablist" :aria-label="pt('navDesign')">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        role="tab"
        class="thread-sub-nav__item"
        :class="{ 'is-active': modelValue === item.id }"
        :aria-selected="modelValue === item.id"
        @click="$emit('update:modelValue', item.id)"
      >
        <span class="thread-sub-nav__step">{{ item.step }}</span>
        <span class="thread-sub-nav__label">{{ pt(item.labelKey) }}</span>
      </button>
    </nav>

    <div class="thread-workbench-body">
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
    </div>
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

defineEmits(['update:modelValue', 'open-query', 'open-row', 'open-compare'])

const items = [
  { id: 'wizard', step: '1', labelKey: 'designSubWizard' },
  { id: 'tolerance', step: '2', labelKey: 'devTabTolerance' },
  { id: 'engagement', step: '3', labelKey: 'devTabEngagement' },
  { id: 'tapDrill', step: '4', labelKey: 'devTabTapDrill' },
  { id: 'mfg', step: '5', labelKey: 'devTabMfg' },
]
</script>
