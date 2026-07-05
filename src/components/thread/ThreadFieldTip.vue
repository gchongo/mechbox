<template>
  <span class="thread-field-tip inline-flex items-center gap-0.5">
    <slot>{{ label }}</slot>
    <el-tooltip v-if="tip" :content="tip" placement="top" :show-after="200">
      <el-icon class="cursor-help text-[14px] text-gray-400 hover:text-primary" :aria-label="tip">
        <QuestionFilled />
      </el-icon>
    </el-tooltip>
  </span>
</template>

<script setup>
import { QuestionFilled } from '@element-plus/icons-vue'

defineProps({
  label: { type: String, default: '' },
  tip: { type: String, default: '' },
})
</script>
