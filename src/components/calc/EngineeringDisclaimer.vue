<template>
  <el-alert
    class="mb-4"
    type="warning"
    :closable="false"
    show-icon
    :title="ct('disclaimerTitle')"
  >
    <p class="text-sm leading-relaxed">{{ ct('disclaimerBody') }}</p>
  </el-alert>
</template>

<script setup>
import { useCalcPage } from '@/composables/useCalcPage'

const { ct } = useCalcPage('beam')
</script>
