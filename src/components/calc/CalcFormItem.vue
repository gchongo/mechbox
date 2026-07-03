<template>
  <el-form-item v-bind="$attrs">
    <template v-if="label != null && label !== ''" #label>
      <FormMathLabel :text="label" />
    </template>
    <slot />
  </el-form-item>
</template>

<script setup>
import FormMathLabel from '@/components/common/FormMathLabel.vue'

defineProps({
  label: { type: String, default: '' },
})

defineOptions({ inheritAttrs: false })
</script>
