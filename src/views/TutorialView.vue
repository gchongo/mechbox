<template>
  <div>
    <h1 class="page-title">教程</h1>
    <p class="mb-6 text-gray-600">5 个尺寸链分析教程，含图文说明与案例跳转</p>

    <div class="space-y-4">
      <div v-for="t in TUTORIALS" :key="t.id" class="card-panel">
        <div
          class="flex cursor-pointer items-start justify-between gap-4"
          @click="toggle(t.id)"
        >
          <div class="flex gap-3">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <el-icon :size="24" class="text-primary"><VideoPlay /></el-icon>
            </div>
            <div>
              <h3 class="font-medium">{{ t.title }}</h3>
              <p class="text-sm text-gray-500">{{ t.duration }} · {{ t.desc }}</p>
            </div>
          </div>
          <el-icon class="mt-1 text-gray-400">
            <component :is="expanded[t.id] ? 'ArrowUp' : 'ArrowDown'" />
          </el-icon>
        </div>

        <div v-show="expanded[t.id]" class="mt-4 border-t border-gray-100 pt-4">
          <div v-for="(sec, i) in t.sections" :key="i" class="mb-4 last:mb-0">
            <h4 class="mb-1 font-medium text-primary">{{ sec.heading }}</h4>
            <p class="text-sm leading-relaxed text-gray-600">{{ sec.body }}</p>
          </div>
          <el-button v-if="t.caseId" type="primary" plain size="small" @click="openCase(t.caseId)">
            打开关联案例 →
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { TUTORIALS } from '@/constants/tutorials'
import { findCasePreset, prepareCaseForEditor, CASE_STORAGE_KEY } from '@/constants/cases'

const router = useRouter()
const expanded = reactive({ 1: true })

function toggle(id) {
  expanded[id] = !expanded[id]
}

function openCase(caseId) {
  const preset = findCasePreset(caseId)
  if (!preset) return
  sessionStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(prepareCaseForEditor(preset)))
  router.push({ name: 'editor', query: { case: caseId } })
}
</script>
