<template>
  <el-button plain @click="handleSave">
    {{ t('calc.common.saveToHistory') }}
  </el-button>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { saveToolHistory } from '@/utils/calc-history'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  tool: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'pass' },
  summary: { type: Array, default: () => [] },
  input: { type: Object, default: () => ({}) },
  result: { type: Object, default: () => ({}) },
})

const { t } = useLocale()

function handleSave() {
  saveToolHistory({
    tool: props.tool,
    title: props.title,
    status: props.status,
    summary: props.summary,
    input: props.input,
    result: props.result,
  })
  ElMessage.success(t('calc.common.savedToHistory'))
}
</script>
