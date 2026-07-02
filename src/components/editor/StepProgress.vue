<template>
  <div class="mb-6">
    <div class="mb-2 flex items-center justify-between text-sm text-gray-500">
      <span>步骤进度：{{ currentStep }} / {{ totalSteps }}</span>
      <span>{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
    </div>
    <el-progress
      :percentage="Math.round((currentStep / totalSteps) * 100)"
      :stroke-width="8"
      :show-text="false"
      color="#3498db"
    />
  </div>
</template>

<script setup>
defineProps({
  currentStep: { type: Number, required: true },
  totalSteps: { type: Number, default: 5 },
})
</script>
