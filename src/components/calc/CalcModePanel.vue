<template>
  <section class="card-panel mb-6">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ ct('model') }}</span>
      <el-radio-group :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
        <el-radio-button value="simple">{{ ct('simple') }}</el-radio-button>
        <el-radio-button value="complete">{{ ct('complete') }}</el-radio-button>
        <el-radio-button value="professional">{{ ct('professional') }}</el-radio-button>
      </el-radio-group>
    </div>

    <div
      v-if="modelValue === 'simple'"
      class="mt-3 rounded-lg bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400"
    >
      <MathContent :text="hintSimpleRich" />
      <div class="mt-2 border-t border-primary/10 pt-2 dark:border-primary/20">
        💡
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ ct('simpleModeWarningTitle') }}</span>
        — <MathContent :text="simpleWarningRich" class="inline" />
      </div>
    </div>
    <div v-else class="mt-3 text-xs text-gray-500 dark:text-gray-400">
      <MathContent :text="modeHintRich" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { enrichMathText } from '@/utils/math-label'
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

const hintSimpleRich = computed(() => enrichMathText(hintSimple.value))
const simpleWarningRich = computed(() => enrichMathText(ct('simpleModeWarningBody')))
const modeHintRich = computed(() =>
  enrichMathText(
    props.modelValue === 'complete' ? hintComplete.value : hintProfessional.value,
  ),
)
</script>
