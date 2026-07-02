<template>
  <div class="home-card__inner">
    <span class="home-card__icon">
      <el-icon :size="22"><component :is="tool.icon" /></el-icon>
    </span>
    <div class="home-card__body">
      <span class="home-card__label">{{ tool.label }}</span>
      <span class="home-card__desc">{{ tool.desc }}</span>
    </div>
    <el-tag v-if="badge || tool.badge" size="small" :type="badgeType" class="home-card__tag">
      {{ badge || tool.badge }}
    </el-tag>
  </div>
</template>

<script setup>
defineProps({
  tool: { type: Object, required: true },
  badge: { type: String, default: '' },
  badgeType: { type: String, default: 'info' },
})
</script>
