<template>
  <div>
    <h1 class="page-title">练习题库</h1>
    <p class="mb-6 text-gray-600">共 {{ questions.length }} 道尺寸链基础题，提交后自动判题</p>

    <div v-if="submitted" class="card-panel mb-6">
      <p class="text-lg font-semibold">
        得分：
        <span :class="scorePercent >= 80 ? 'text-success' : scorePercent >= 60 ? 'text-warning' : 'text-error'">
          {{ correctCount }} / {{ questions.length }}（{{ scorePercent }}%）
        </span>
      </p>
      <p class="mt-1 text-sm text-gray-500">
        {{ scoreMessage }}
      </p>
    </div>

    <div class="space-y-6">
      <div v-for="(q, i) in questions" :key="q.id" class="card-panel">
        <p class="mb-3 font-medium">{{ i + 1 }}. {{ q.question }}</p>
        <el-radio-group v-model="answers[q.id]" :disabled="submitted">
          <el-radio
            v-for="opt in q.options"
            :key="opt"
            :value="opt"
            class="!mb-2 !flex !whitespace-normal"
          >
            {{ opt }}
          </el-radio>
        </el-radio-group>
        <div v-if="submitted" class="mt-3 rounded bg-gray-50 p-3 text-sm">
          <p :class="isCorrect(q) ? 'text-success' : 'text-error'">
            {{ isCorrect(q) ? '✓ 正确' : `✗ 正确答案：${q.answer}` }}
          </p>
          <p class="mt-1 text-gray-600">{{ q.explain }}</p>
        </div>
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <el-button type="primary" :disabled="submitted" @click="submit">
        {{ submitted ? '已提交' : '提交判题' }}
      </el-button>
      <el-button v-if="submitted" @click="reset">重新练习</el-button>
    </div>
    <p v-if="!submitted && unansweredCount > 0" class="mt-2 text-sm text-warning">
      还有 {{ unansweredCount }} 题未作答
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { QUIZ_QUESTIONS } from '@/constants/quiz'

const questions = QUIZ_QUESTIONS
const submitted = ref(false)
const answers = reactive({})

const unansweredCount = computed(
  () => questions.filter((q) => !answers[q.id]).length,
)

const correctCount = computed(
  () => questions.filter((q) => answers[q.id] === q.answer).length,
)

const scorePercent = computed(() =>
  Math.round((correctCount.value / questions.length) * 100),
)

const scoreMessage = computed(() => {
  const p = scorePercent.value
  if (p === 100) return '满分！尺寸链基础掌握扎实。'
  if (p >= 80) return '良好，建议复习错题解析。'
  if (p >= 60) return '及格，建议结合教程和案例再练习。'
  return '需加强学习，请查看教程和公式手册。'
})

function isCorrect(q) {
  return answers[q.id] === q.answer
}

function submit() {
  if (unansweredCount.value > 0) {
    ElMessage.warning(`还有 ${unansweredCount.value} 题未作答`)
    return
  }
  submitted.value = true
  ElMessage.success(`判题完成：${correctCount.value}/${questions.length}`)
}

function reset() {
  submitted.value = false
  questions.forEach((q) => {
    delete answers[q.id]
  })
}
</script>
