<template>
  <div>
    <h1 class="page-title">公式手册</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      尺寸链、概率统计、齿轮与轴承常用公式，支持搜索与 LaTeX 渲染
    </p>

    <div class="mb-4 flex flex-wrap gap-2">
      <el-button
        v-for="cat in categories"
        :key="cat"
        size="small"
        :type="activeCategory === cat ? 'primary' : 'default'"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </el-button>
    </div>

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
        <div class="mb-1 flex items-center gap-2">
          <h3 class="font-medium text-primary">{{ item.name }}</h3>
          <el-tag v-if="item.category" size="small" effect="plain">{{ item.category }}</el-tag>
        </div>
        <div class="my-3 rounded-lg bg-gray-50 py-3 dark:bg-gray-900">
          <MathTex :expr="item.latex" block />
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.desc }}</p>
        <div class="mt-3 flex flex-wrap gap-1">
          <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
        </div>
        <div v-if="item.category === '齿轮'" class="mt-3">
          <router-link to="/gear" class="text-sm text-primary hover:underline">→ 打开齿轮计算器</router-link>
        </div>
        <div v-if="item.category === '轴承'" class="mt-3">
          <router-link to="/bearing" class="text-sm text-primary hover:underline">→ 打开轴承计算器</router-link>
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
const activeCategory = ref('全部')

const categories = ['全部', '尺寸链', '统计', '齿轮', '轴承', '结构', '传动', '流体']

const filtered = computed(() => {
  let list = FORMULAS
  if (activeCategory.value !== '全部') {
    list = list.filter((f) => f.category === activeCategory.value)
  }
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list
  return list.filter(
    (f) =>
      f.name.toLowerCase().includes(k) ||
      f.formula.toLowerCase().includes(k) ||
      f.latex.toLowerCase().includes(k) ||
      f.desc.toLowerCase().includes(k) ||
      (f.category && f.category.toLowerCase().includes(k)) ||
      f.tags.some((t) => t.toLowerCase().includes(k)),
  )
})
</script>
