<template>
  <section class="thread-workbench card-panel">
    <p class="thread-workbench-intro">{{ pt('toolsFlowHint') }}</p>

    <nav class="thread-sub-nav thread-sub-nav--tools" role="tablist" :aria-label="pt('navTools')">
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
        <span class="thread-sub-nav__label">{{ pt(item.labelKey) }}</span>
        <el-badge
          v-if="item.id === 'compare' && compareCount"
          :value="compareCount"
          class="thread-sub-nav__badge"
        />
      </button>
    </nav>

    <div class="thread-workbench-body">
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
    </div>
  </section>
</template>

<script setup>
import ThreadParsePanel from '@/components/thread/ThreadParsePanel.vue'
import ThreadComparePanel from '@/components/thread/ThreadComparePanel.vue'
import ThreadMisconfigPanel from '@/components/thread/ThreadMisconfigPanel.vue'

defineProps({
  modelValue: { type: String, required: true },
  compareIds: { type: Array, default: () => [] },
  compareCount: { type: Number, default: 0 },
  pt: { type: Function, required: true },
})

defineEmits(['update:modelValue', 'update:compareIds', 'locate', 'open-compare'])

const items = [
  { id: 'parse', labelKey: 'tabParse' },
  { id: 'compare', labelKey: 'tabCompare' },
  { id: 'misconfig', labelKey: 'devTabMisconfig' },
]
</script>
