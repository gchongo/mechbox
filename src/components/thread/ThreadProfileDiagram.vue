<template>
  <div class="thread-profile-diagram">
    <svg viewBox="0 0 420 200" class="w-full max-w-lg" role="img" :aria-label="aria">
      <defs>
        <marker id="thread-dim-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>
      <!-- External thread profile (simplified 60°) -->
      <path
        :d="externalPath"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="text-gray-800 dark:text-gray-200"
      />
      <!-- Internal thread profile -->
      <path
        :d="internalPath"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-dasharray="4 3"
        class="text-gray-500"
      />
      <text x="210" y="24" text-anchor="middle" class="fill-current text-xs font-medium">{{ title }}</text>
      <text x="60" y="188" class="fill-current text-[10px]">{{ labels.external }}</text>
      <text x="280" y="188" class="fill-current text-[10px]">{{ labels.internal }}</text>
      <!-- P dimension -->
      <line x1="120" y1="155" x2="160" y2="155" stroke="currentColor" marker-start="url(#thread-dim-arrow)" marker-end="url(#thread-dim-arrow)" />
      <text x="140" y="148" text-anchor="middle" class="fill-current text-[10px]">P</text>
    </svg>
    <p class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">{{ formula }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  angle: { type: Number, default: 60 },
  title: { type: String, default: '' },
  formula: { type: String, default: 'H = 0.866025 P' },
  aria: { type: String, default: '' },
  labels: {
    type: Object,
    default: () => ({ external: '外螺纹', internal: '内螺纹' }),
  },
})

const externalPath = computed(() => {
  if (props.angle === 55) {
    return 'M 40 140 L 55 100 L 70 140 L 85 100 L 100 140 L 115 100 L 130 140'
  }
  return 'M 40 140 L 60 90 L 80 140 L 100 90 L 120 140 L 140 90 L 160 140'
})

const internalPath = computed(() => {
  if (props.angle === 55) {
    return 'M 200 140 L 215 105 L 230 140 L 245 105 L 260 140 L 275 105 L 290 140'
  }
  return 'M 200 140 L 220 95 L 240 140 L 260 95 L 280 140 L 300 95 L 320 140'
})
</script>

<style scoped>
.thread-profile-diagram svg {
  color: var(--el-text-color-primary);
}
</style>
