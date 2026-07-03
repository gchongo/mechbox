<template>
  <section class="card-panel mb-6">
    <el-alert
      v-if="modelValue === 'simple'"
      class="mb-3"
      type="info"
      :closable="false"
      show-icon
      :title="ct('simpleModeWarningTitle')"
    >
      <p class="text-sm">{{ ct('simpleModeWarningBody') }}</p>
    </el-alert>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ ct('model') }}</span>
      <el-radio-group :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <el-radio-button value="simple">{{ ct('simple') }}</el-radio-button>
        <el-radio-button value="complete">{{ ct('complete') }}</el-radio-button>
        <el-radio-button value="professional">{{ ct('professional') }}</el-radio-button>
      </el-radio-group>
      <p class="w-full text-xs text-gray-500 dark:text-gray-400">
        <template v-if="modelValue === 'simple'">{{ hintSimple }}</template>
        <template v-else-if="modelValue === 'complete'">{{ hintComplete }}</template>
        <template v-else>{{ hintProfessional }}</template>
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useCalcPage } from '@/composables/useCalcPage'

const props = defineProps({
  modelValue: { type: String, default: 'simple' },
  pageKey: { type: String, required: true },
  hintSimple: { type: String, default: '' },
  hintComplete: { type: String, default: '' },
  hintProfessional: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const { pt, ct } = useCalcPage(props.pageKey)

const hintSimple = computed(() => props.hintSimple || pt('hintSimple'))
const hintComplete = computed(() => props.hintComplete || pt('hintComplete'))
const hintProfessional = computed(() => props.hintProfessional || pt('hintProfessional'))
</script>
