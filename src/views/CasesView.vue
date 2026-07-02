<template>
  <div>
    <h1 class="page-title">案例库</h1>
    <p class="mb-6 text-gray-600">6 个预设案例（含 2D/GD&T），点击加载完整数据到编辑器</p>
    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-for="item in CASE_PRESETS"
        :key="item.id"
        class="card-panel cursor-pointer transition-shadow hover:shadow-md"
        @click="loadCase(item)"
      >
        <h3 class="font-medium">{{ item.title }}</h3>
        <p class="mt-2 text-sm text-gray-600">{{ item.desc }}</p>
        <el-tag size="small" class="mt-3">{{ item.type }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { CASE_PRESETS, prepareCaseForEditor, CASE_STORAGE_KEY } from '@/constants/cases'

const router = useRouter()

function loadCase(item) {
  sessionStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(prepareCaseForEditor(item)))
  router.push({ name: 'editor', query: { case: item.id } })
}
</script>
