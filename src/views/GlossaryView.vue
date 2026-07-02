<template>
  <div>
    <h1 class="page-title">GD&T 术语词典</h1>
    <p class="mb-6 text-gray-600">尺寸链与几何公差常用术语，支持搜索</p>

    <div class="card-panel mb-6">
      <el-input
        v-model="query"
        clearable
        placeholder="搜索术语、定义或标签…"
        prefix-icon="Search"
        class="max-w-md"
      />
      <p class="mt-2 text-sm text-gray-500">共 {{ filtered.length }} 条</p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="item in filtered"
        :key="item.id"
        class="card-panel"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <span class="text-2xl font-serif text-primary">{{ item.symbol }}</span>
          <h2 class="text-lg font-semibold">{{ item.term }}</h2>
          <el-tag size="small" type="info">{{ item.category }}</el-tag>
        </div>
        <p class="text-sm leading-relaxed text-gray-700">{{ item.definition }}</p>
        <div class="mt-3 flex flex-wrap gap-1">
          <el-tag v-for="tag in item.tags" :key="tag" size="small" effect="plain">
            {{ tag }}
          </el-tag>
        </div>
      </article>
    </div>

    <el-empty v-if="!filtered.length" description="未找到匹配术语" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { searchGlossary } from '@/constants/glossary'

const query = ref('')
const filtered = computed(() => searchGlossary(query.value))
</script>
