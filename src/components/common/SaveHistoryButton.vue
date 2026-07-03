<template>
  <el-button plain @click="handleSave">
    💾 保存到历史
  </el-button>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { saveToolHistory } from '@/utils/calc-history'

const props = defineProps({
  tool: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'pass' },
  summary: { type: Array, default: () => [] },
  input: { type: Object, default: () => ({}) },
  result: { type: Object, default: () => ({}) },
})

function handleSave() {
  saveToolHistory({
    tool: props.tool,
    title: props.title,
    status: props.status,
    summary: props.summary,
    input: props.input,
    result: props.result,
  })
  ElMessage.success('已保存到历史记录')
}
</script>
