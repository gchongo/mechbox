<template>
  <div>
    <h1 class="page-title">练习题库</h1>
    <p class="mb-6 text-gray-600">尺寸链基础知识练习（占位，V1.0 将完善判题逻辑）</p>
    <div class="space-y-6">
      <div v-for="(q, i) in questions" :key="q.id" class="card-panel">
        <p class="mb-3 font-medium">{{ i + 1 }}. {{ q.question }}</p>
        <el-radio-group v-model="answers[q.id]">
          <el-radio v-for="opt in q.options" :key="opt" :value="opt" class="!block">
            {{ opt }}
          </el-radio>
        </el-radio-group>
        <p v-if="submitted" class="mt-2 text-sm" :class="isCorrect(q) ? 'text-success' : 'text-error'">
          {{ isCorrect(q) ? '✓ 正确' : `✗ 正确答案：${q.answer}` }}
        </p>
      </div>
      <el-button type="primary" @click="submitted = true">提交判题</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const submitted = ref(false)
const answers = reactive({})

const questions = [
  {
    id: 1,
    question: '什么是封闭环？',
    options: ['装配最终形成的尺寸', '任意零件尺寸', '公差最大的环', '第一个输入的尺寸'],
    answer: '装配最终形成的尺寸',
  },
  {
    id: 2,
    question: 'RSS 法的公式是？',
    options: ['T = ΣT', 'T = √(ΣT²)', 'T = T1 × T2', 'T = max(T)'],
    answer: 'T = √(ΣT²)',
  },
  {
    id: 3,
    question: '增环是指？',
    options: ['与封闭环同向的组成环', '与封闭环反向的组成环', '公差最大的环', '第一个环'],
    answer: '与封闭环同向的组成环',
  },
]

function isCorrect(q) {
  return answers[q.id] === q.answer
}
</script>
