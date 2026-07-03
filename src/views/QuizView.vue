<template>
  <div>
    <h1 class="page-title">{{ ct('quiz.title') }}</h1>
    <p class="mb-6 text-gray-600">{{ ct('quiz.subtitle', { n: questions.length }) }}</p>

    <div v-if="submitted" class="card-panel mb-6">
      <p class="text-lg font-semibold">
        {{ ct('quiz.score') }}
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
        <p class="mb-3 font-medium">{{ i + 1 }}. <MathContent :text="q.question" /></p>
        <el-radio-group v-model="answers[q.id]" :disabled="submitted">
          <el-radio
            v-for="opt in q.options"
            :key="opt.value"
            :value="opt.value"
            class="!mb-2 !flex !whitespace-normal"
          >
            <MathContent :text="opt.label" />
          </el-radio>
        </el-radio-group>
        <div v-if="submitted" class="mt-3 rounded bg-gray-50 p-3 text-sm">
          <p :class="isCorrect(q) ? 'text-success' : 'text-error'">
            {{ isCorrect(q) ? ct('quiz.correct') : ct('quiz.wrongPrefix') }}<MathContent v-if="!isCorrect(q)" :text="q.answerLabel" />
          </p>
          <MathContent :text="q.explain" class="mt-1 text-gray-600" />
        </div>
      </div>
    </div>

    <div class="mt-6 flex gap-3">
      <el-button type="primary" :disabled="submitted" @click="submit">
        {{ submitted ? ct('quiz.submitted') : ct('quiz.submit') }}
      </el-button>
      <el-button v-if="submitted" @click="reset">{{ ct('quiz.reset') }}</el-button>
    </div>
    <p v-if="!submitted && unansweredCount > 0" class="mt-2 text-sm text-warning">
      {{ ct('quiz.unanswered', { n: unansweredCount }) }}
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useContentI18n } from '@/composables/useContentI18n'

const { ct, quizQuestions } = useContentI18n()
const questions = quizQuestions
const submitted = ref(false)
const answers = reactive({})

const unansweredCount = computed(
  () => questions.value.filter((q) => !answers[q.id]).length,
)

const correctCount = computed(
  () => questions.value.filter((q) => answers[q.id] === q.answer).length,
)

const scorePercent = computed(() =>
  Math.round((correctCount.value / questions.value.length) * 100),
)

const scoreMessage = computed(() => {
  const p = scorePercent.value
  if (p === 100) return ct('quiz.scorePerfect')
  if (p >= 80) return ct('quiz.scoreGood')
  if (p >= 60) return ct('quiz.scorePass')
  return ct('quiz.scoreLow')
})

function isCorrect(q) {
  return answers[q.id] === q.answer
}

function submit() {
  if (unansweredCount.value > 0) {
    ElMessage.warning(ct('quiz.unanswered', { n: unansweredCount.value }))
    return
  }
  submitted.value = true
  ElMessage.success(ct('quiz.submitDone', { correct: correctCount.value, total: questions.value.length }))
}

function reset() {
  submitted.value = false
  questions.value.forEach((q) => {
    delete answers[q.id]
  })
}
</script>
