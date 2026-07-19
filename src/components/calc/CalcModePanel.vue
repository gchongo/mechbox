<template>
  <section class="card-panel mb-6">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ ct('model') }}</span>
      <el-radio-group :model-value="modelValue" @change="onModeChange">
        <el-radio-button value="simple">{{ ct('simple') }}</el-radio-button>
        <el-radio-button value="complete">{{ ct('complete') }}</el-radio-button>
        <el-radio-button value="professional">{{ ct('professional') }}</el-radio-button>
      </el-radio-group>
    </div>

    <div
      class="mt-3 rounded-lg bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400"
    >
      <MathContent :text="activeHintRich" />
      <p v-if="modelValue === 'simple'" class="mt-1.5 text-gray-500 dark:text-gray-500">
        <span class="font-medium text-gray-700 dark:text-gray-300">{{ ct('simpleModeWarningTitle') }}</span>
        — <MathContent :text="simpleWarningRich" class="inline" />
      </p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { enrichMathText } from '@/utils/math-label'
import { useCalcPage } from '@/composables/useCalcPage'
import { fetchCurrentUser, startLogin } from '@/utils/auth'
import { t } from '@/i18n'

const props = defineProps({
  modelValue: { type: String, default: 'simple' },
  pageKey: { type: String, required: true },
  hintSimple: { type: String, default: '' },
  hintComplete: { type: String, default: '' },
  hintProfessional: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const { pt, ct, locale } = useCalcPage(props.pageKey)

const hintSimple = computed(() => props.hintSimple || pt('hintSimple'))
const hintComplete = computed(() => props.hintComplete || pt('hintComplete'))
const hintProfessional = computed(() => props.hintProfessional || pt('hintProfessional'))

const activeHintRich = computed(() => {
  const text =
    props.modelValue === 'simple'
      ? hintSimple.value
      : props.modelValue === 'complete'
        ? hintComplete.value
        : hintProfessional.value
  return enrichMathText(text)
})
const simpleWarningRich = computed(() => enrichMathText(ct('simpleModeWarningBody')))

async function onModeChange(next) {
  // Local Vite preview: skip CAX login so professional mode is testable without SSO.
  if (next === 'professional' && !import.meta.env.DEV) {
    const user = await fetchCurrentUser()
    if (!user) {
      try {
        await ElMessageBox.confirm(
          t('content.auth.professionalModeBody', locale.value),
          t('content.auth.professionalModeTitle', locale.value),
          {
            confirmButtonText: t('content.auth.loginWithCax', locale.value),
            cancelButtonText: t('content.auth.cancel', locale.value),
            type: 'info',
          },
        )
        startLogin()
      } catch {
        // keep current mode
      }
      return
    }
  }
  emit('update:modelValue', next)
}
</script>
