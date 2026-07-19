<template>
  <span class="thread-field-tip inline-flex items-center gap-0.5">
    <slot>
      <MathContent :text="label" />
    </slot>
    <el-tooltip v-if="tip" placement="top" :show-after="200" :raw-content="false">
      <template #content>
        <div class="thread-field-tip__pop">
          <MathContent :text="tip" />
        </div>
      </template>
      <el-icon
        class="cursor-help text-[14px] text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary"
        :aria-label="tipAria"
      >
        <QuestionFilled />
      </el-icon>
    </el-tooltip>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import MathContent from '@/components/common/MathContent.vue'

const props = defineProps({
  label: { type: String, default: '' },
  tip: { type: String, default: '' },
})

/** 无障碍用纯文本：把常见 LaTeX 收成可读下标 */
const tipAria = computed(() =>
  String(props.tip || '')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\,/g, ' ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/_\{([^}]+)\}/g, '_$1'),
)
</script>

<style scoped>
.thread-field-tip__pop {
  max-width: 280px;
  line-height: 1.45;
  font-size: 12px;
}
.thread-field-tip__pop :deep(.katex) {
  font-size: 1em;
}
</style>
