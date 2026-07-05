<template>
  <el-collapse class="thread-pitch-tool mb-4">
    <el-collapse-item :title="pt('pitchToolTitle')" name="pitch">
      <p class="mb-3 text-xs text-gray-500">{{ pt('pitchToolIntro') }}</p>
      <div class="flex flex-wrap items-end gap-4">
        <el-radio-group v-model="mode" size="small">
          <el-radio-button value="tpi2pitch">{{ pt('pitchToolTpiToPitch') }}</el-radio-button>
          <el-radio-button value="pitch2tpi">{{ pt('pitchToolPitchToTpi') }}</el-radio-button>
        </el-radio-group>
        <div>
          <label class="mb-1 block text-xs text-gray-500">
            {{ mode === 'tpi2pitch' ? 'TPI' : pt('colPitch') + ' (mm)' }}
          </label>
          <el-input-number
            v-model="inputVal"
            :min="0.01"
            :step="mode === 'tpi2pitch' ? 1 : 0.05"
            :precision="mode === 'tpi2pitch' ? 0 : 3"
            controls-position="right"
            class="w-36"
          />
        </div>
        <div class="rounded bg-gray-50 px-4 py-2 text-sm dark:bg-gray-900">
          <span class="text-gray-500">{{ pt('pitchToolResult') }}：</span>
          <span class="font-mono font-medium">{{ resultText }}</span>
        </div>
      </div>
      <p class="mt-2 text-[10px] text-gray-400">{{ pt('pitchToolFormula') }}</p>
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
.thread-pitch-tool :deep(.el-collapse-item__header) {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
