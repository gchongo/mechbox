<template>
  <div>
    <h1 class="page-title">教程</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      5 个尺寸链教程，支持演示模式自动播放与图文详解
    </p>

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
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t.duration }} · {{ t.desc }}</p>
            </div>
          </div>
          <el-icon class="mt-1 text-gray-400">
            <component :is="expanded[t.id] ? 'ArrowUp' : 'ArrowDown'" />
          </el-icon>
        </div>

        <div v-show="expanded[t.id]" class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
          <TutorialDemo :tutorial="t" class="mb-4" />

          <div v-if="t.videoEmbed" class="mb-4 aspect-video overflow-hidden rounded-lg">
            <iframe
              :src="t.videoEmbed"
              class="h-full w-full border-0"
              allowfullscreen
              title="教程视频"
            />
          </div>

          <div v-for="(sec, i) in t.sections" :key="i" class="mb-4 last:mb-0">
            <h4 class="mb-1 font-medium text-primary">{{ sec.heading }}</h4>
            <MathContent :text="sec.body" class="text-sm leading-relaxed text-gray-600 dark:text-gray-300" />
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
import TutorialDemo from '@/components/tutorial/TutorialDemo.vue'
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
