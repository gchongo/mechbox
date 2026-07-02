<template>
  <div class="home-card__inner">
    <span class="home-card__icon">
      <el-icon :size="22"><component :is="tool.icon" /></el-icon>
    </span>
    <div class="home-card__body">
      <span class="home-card__label">{{ tool.label }}</span>
      <span v-if="tool.latexDesc" class="home-card__latex">
        <MathTex :expr="tool.latexDesc" />
      </span>
      <span v-else-if="tool.desc" class="home-card__desc">{{ tool.desc }}</span>
    </div>
  </div>
</template>

<script setup>
import MathTex from '@/components/common/MathTex.vue'

defineProps({
  tool: { type: Object, required: true },
})
</script>
