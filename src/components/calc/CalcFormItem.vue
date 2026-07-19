<template>
  <el-form-item
    v-bind="$attrs"
    :class="{
      'calc-field--pending-confirm': pendingConfirm,
      'calc-field--has-unit': !!displayUnit,
    }"
  >
    <template v-if="displayLabel != null && displayLabel !== ''" #label>
      <FormMathLabel :text="displayLabel" />
    </template>
    <div class="calc-field__body">
      <slot />
      <span v-if="displayUnit" class="calc-field__unit">{{ displayUnit }}</span>
      <span v-if="pendingConfirm" class="calc-field__pending-mark" :title="pendingTitle">*</span>
    </div>
  </el-form-item>
</template>

<script setup>
import { computed } from 'vue'
import FormMathLabel from '@/components/common/FormMathLabel.vue'
import { splitFormLabelUnit } from '@/utils/form-label-unit'

const props = defineProps({
  label: { type: String, default: '' },
  /**
   * 输入框后单位。
   * - 未传：自动从 label 尾部 `(mm)` 等剥离
   * - 字符串：强制使用该单位（label 尾部单位仍会剥离）
   * - 空字符串：不显示单位（已有自定义后缀时用）
   */
  unit: { type: String, default: undefined },
  /** 关键参数尚未核对：输入控件显示琥珀色边框 */
  pendingConfirm: { type: Boolean, default: false },
  pendingTitle: { type: String, default: '' },
})

defineOptions({ inheritAttrs: false })

const parsed = computed(() => splitFormLabelUnit(props.label))

const displayLabel = computed(() => parsed.value.text || props.label)

const displayUnit = computed(() => {
  if (props.unit === '') return ''
  if (props.unit !== undefined) return props.unit
  return parsed.value.unit
})
</script>

<style scoped>
.calc-field__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  column-gap: 6px;
  row-gap: 4px;
}

/* 有自动单位时：首控件 + 单位同一行，其余后缀整行落下 */
.calc-field--has-unit .calc-field__body {
  display: grid;
  grid-template-columns: minmax(0, max-content) auto minmax(0, 1fr);
  align-items: center;
  column-gap: 6px;
  row-gap: 4px;
}

.calc-field--has-unit .calc-field__body > :first-child {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
}

.calc-field--has-unit .calc-field__unit {
  grid-column: 2;
  grid-row: 1;
}

.calc-field--has-unit .calc-field__pending-mark {
  grid-column: 3;
  grid-row: 1;
  justify-self: start;
}

.calc-field--has-unit .calc-field__body > :not(:first-child):not(.calc-field__unit):not(.calc-field__pending-mark) {
  grid-column: 1 / -1;
}

.calc-field__body > :deep(.el-select),
.calc-field__body > :deep(.w-full) {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
}

.calc-field--has-unit .calc-field__body > :deep(.el-select),
.calc-field--has-unit .calc-field__body > :deep(.w-full) {
  width: auto;
  min-width: 12rem;
}

.calc-field__unit {
  flex: 0 0 auto;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(107 114 128);
  white-space: nowrap;
}

:global(.dark) .calc-field__unit {
  color: rgb(156 163 175);
}

.calc-field--pending-confirm :deep(.el-input__wrapper),
.calc-field--pending-confirm :deep(.el-select__wrapper),
.calc-field--pending-confirm :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px var(--el-color-warning) inset;
  background-color: color-mix(in srgb, var(--el-color-warning) 8%, transparent);
}

.calc-field--pending-confirm :deep(.el-input__wrapper:hover),
.calc-field--pending-confirm :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-warning-light-3) inset;
}

.calc-field--pending-confirm :deep(.el-input__wrapper.is-focus),
.calc-field--pending-confirm :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px var(--el-color-warning) inset;
}

.calc-field__pending-mark {
  flex: 0 0 auto;
  color: var(--el-color-warning);
  font-weight: 600;
  line-height: 1;
}
</style>
