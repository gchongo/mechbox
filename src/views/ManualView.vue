<template>
  <div>
    <h1 class="page-title">公式手册</h1>
    <p class="mb-4 text-gray-600">尺寸链与概率统计常用公式，支持搜索与 LaTeX 渲染</p>

    <el-input
      v-model="keyword"
      placeholder="搜索公式名称、标签…"
      clearable
      class="mb-6 max-w-md"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="item in filtered" :key="item.id" class="card-panel">
        <h3 class="font-medium text-primary">{{ item.name }}</h3>
        <div class="my-3 rounded-lg bg-gray-50 py-3">
          <MathTex :expr="item.latex" block />
        </div>
        <p class="text-sm text-gray-600">{{ item.desc }}</p>
        <div class="mt-3 flex flex-wrap gap-1">
          <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
        </div>
      </div>
    </div>
    <el-empty v-if="!filtered.length" description="未找到匹配公式" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { FORMULAS } from '@/constants/formulas'

const keyword = ref('')

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return FORMULAS
  return FORMULAS.filter(
    (f) =>
      f.name.toLowerCase().includes(k) ||
      f.formula.toLowerCase().includes(k) ||
      f.latex.toLowerCase().includes(k) ||
      f.desc.toLowerCase().includes(k) ||
      f.tags.some((t) => t.toLowerCase().includes(k)),
  )
})
</script>
