<template>
  <el-collapse class="thread-pitch-tool mb-4">
    <el-collapse-item :title="pt('pitchToolTitle')" name="pitch">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button value="tpi2pitch">{{ pt('pitchToolTpiToPitch') }}</el-radio-button>
          <el-radio-button value="pitch2tpi">{{ pt('pitchToolPitchToTpi') }}</el-radio-button>
        </el-radio-group>

        <span class="text-xs text-gray-600 dark:text-gray-300">
          {{ mode === 'tpi2pitch' ? 'TPI' : 'P (mm)' }}
        </span>
        <el-input-number
          v-model="inputVal"
          :min="0.01"
          :step="mode === 'tpi2pitch' ? 1 : 0.05"
          :precision="mode === 'tpi2pitch' ? 0 : 3"
          controls-position="right"
          size="small"
          class="w-32"
        />

        <div class="rounded bg-gray-100 px-3 py-1.5 text-sm dark:bg-gray-800">
          <span class="text-gray-600 dark:text-gray-400">{{ pt('pitchToolResult') }}：</span>
          <span class="font-mono font-medium text-primary">{{ resultText }}</span>
        </div>

        <span class="text-[10px] text-gray-500 dark:text-gray-400" :title="pt('pitchToolIntro')">
          {{ pt('pitchToolFormula') }}
        </span>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script setup>
import { ref, computed } from 'vue'
import { tpiToPitch, pitchToTpi } from '@/utils/thread-standards'

defineProps({
  pt: { type: Function, required: true },
})

const mode = ref('tpi2pitch')
const inputVal = ref(20)

const resultText = computed(() => {
  const v = inputVal.value
  if (v == null || v <= 0) return '—'
  if (mode.value === 'tpi2pitch') {
    const p = tpiToPitch(v)
    return p != null ? `P = ${p} mm` : '—'
  }
  const t = pitchToTpi(v)
  return t != null ? `TPI = ${t}` : '—'
})
</script>

<style scoped>
.thread-pitch-tool {
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;
  border-color: var(--el-border-color-lighter);
}
.thread-pitch-tool :deep(.el-collapse-item__header) {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.thread-pitch-tool :deep(.el-collapse-item__content) {
  padding-bottom: 12px;
  color: var(--el-text-color-regular);
}
.thread-pitch-tool :deep(.el-collapse-item__wrap) {
  background-color: transparent;
}
</style>
