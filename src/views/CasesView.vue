<template>
  <div>
    <h1 class="page-title">{{ ct('cases.title') }}</h1>
    <p class="mb-6 text-gray-600">{{ ct('cases.subtitle') }}</p>
    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-for="item in casePresets"
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
import { prepareCaseForEditor, CASE_STORAGE_KEY } from '@/constants/cases'
import { useContentI18n } from '@/composables/useContentI18n'

const router = useRouter()
const { ct, casePresets } = useContentI18n()

function loadCase(item) {
  sessionStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(prepareCaseForEditor(item)))
  router.push({ name: 'editor', query: { case: item.id } })
}
</script>
