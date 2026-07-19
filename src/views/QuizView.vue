<template>
  <div>
    <h1 class="page-title">{{ ct('quiz.title') }}</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">{{ ct('quiz.subtitle') }}</p>

    <el-tabs v-model="section">
      <el-tab-pane :label="ct('quiz.tabStack')" name="stack">
        <p class="mb-4 text-sm text-gray-500">{{ ct('quiz.stackHint', { n: questions.length }) }}</p>

        <div v-if="submitted" class="card-panel mb-6">
          <p class="text-lg font-semibold">
            {{ ct('quiz.score') }}
            <span :class="scorePercent >= 80 ? 'text-success' : scorePercent >= 60 ? 'text-warning' : 'text-error'">
              {{ correctCount }} / {{ questions.length }}（{{ scorePercent }}%）
            </span>
          </p>
          <p class="mt-1 text-sm text-gray-500">{{ scoreMessage }}</p>
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
            <div v-if="submitted" class="mt-3 rounded bg-gray-50 p-3 text-sm dark:bg-gray-900">
              <p :class="isCorrect(q) ? 'text-success' : 'text-error'">
                {{ isCorrect(q) ? ct('quiz.correct') : ct('quiz.wrongPrefix') }}
                <MathContent v-if="!isCorrect(q)" :text="q.answerLabel" />
              </p>
              <MathContent :text="q.explain" class="mt-1 text-gray-600 dark:text-gray-400" />
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
      </el-tab-pane>

      <el-tab-pane :label="ct('quiz.tabGdt')" name="gdt">
        <section class="card-panel">
          <div class="mb-4 flex flex-wrap items-center gap-3">
            <el-tag type="info">{{ ct('quiz.gdtScore') }}：{{ gdtScore }} / {{ gdtQuiz.questions.length }}</el-tag>
            <el-button size="small" @click="restartGdt">{{ ct('quiz.gdtRestart') }}</el-button>
            <router-link class="text-sm text-primary" to="/gdt-symbols">{{ ct('quiz.gdtOpenSymbols') }} →</router-link>
          </div>

          <template v-if="gdtCurrent">
            <p class="mb-3 text-sm text-gray-500">
              {{ ct('quiz.gdtProgress') }} {{ gdtIndex + 1 }} / {{ gdtQuiz.questions.length }}
            </p>
            <div class="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <p v-if="gdtCurrent.type === 'glyph_to_name'" class="text-center font-mono text-5xl">
                {{ gdtCurrent.promptGlyph }}
              </p>
              <p class="mt-2 text-center font-medium">{{ gdtCurrent.promptZh }}</p>
            </div>
            <div v-if="gdtCurrent.type === 'true_false'" class="flex justify-center gap-3">
              <el-button :type="gdtAnswer === true ? 'primary' : 'default'" @click="answerGdt(true)">
                {{ ct('quiz.gdtTrue') }}
              </el-button>
              <el-button :type="gdtAnswer === false ? 'primary' : 'default'" @click="answerGdt(false)">
                {{ ct('quiz.gdtFalse') }}
              </el-button>
            </div>
            <div v-else class="grid gap-2 sm:grid-cols-2">
              <el-button
                v-for="opt in gdtCurrent.options"
                :key="opt.id"
                class="!justify-start"
                :type="gdtAnswer === opt.id ? 'primary' : 'default'"
                @click="answerGdt(opt.id)"
              >
                {{ opt.labelZh }}
              </el-button>
            </div>
            <el-alert
              v-if="gdtFeedback"
              class="mt-4"
              :type="gdtFeedback.correct ? 'success' : 'error'"
              show-icon
              :closable="false"
              :title="gdtFeedback.correct ? ct('quiz.gdtCorrect') : ct('quiz.gdtWrong')"
              :description="gdtFeedback.explainZh"
            />
            <el-button v-if="gdtFeedback" class="mt-3" type="primary" @click="nextGdt">
              {{ gdtIndex + 1 >= gdtQuiz.questions.length ? ct('quiz.gdtFinish') : ct('quiz.gdtNext') }}
            </el-button>
          </template>
          <div v-else class="text-center">
            <p class="text-lg font-semibold">
              {{ ct('quiz.gdtDone') }}：{{ gdtScore }} / {{ gdtQuiz.questions.length }}
            </p>
            <el-button class="mt-3" type="primary" @click="restartGdt">{{ ct('quiz.gdtRestart') }}</el-button>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import MathContent from '@/components/common/MathContent.vue'
import { useContentI18n } from '@/composables/useContentI18n'
import { generateGdtQuiz, scoreGdtAnswer } from '@/constants/gdt-symbols'

const route = useRoute()
const { ct, quizQuestions } = useContentI18n()
const questions = quizQuestions
const section = ref('stack')
const submitted = ref(false)
const answers = reactive({})

const gdtQuiz = ref(generateGdtQuiz())
const gdtIndex = ref(0)
const gdtAnswer = ref(null)
const gdtFeedback = ref(null)
const gdtScore = ref(0)
const gdtFinished = ref(false)

const unansweredCount = computed(() => questions.value.filter((q) => !answers[q.id]).length)

const correctCount = computed(() => questions.value.filter((q) => answers[q.id] === q.answer).length)

const scorePercent = computed(() => Math.round((correctCount.value / questions.value.length) * 100))

const scoreMessage = computed(() => {
  const p = scorePercent.value
  if (p === 100) return ct('quiz.scorePerfect')
  if (p >= 80) return ct('quiz.scoreGood')
  if (p >= 60) return ct('quiz.scorePass')
  return ct('quiz.scoreLow')
})

const gdtCurrent = computed(() => {
  if (gdtFinished.value) return null
  return gdtQuiz.value.questions[gdtIndex.value] ?? null
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

function answerGdt(ans) {
  if (gdtFeedback.value) return
  gdtAnswer.value = ans
  const fb = scoreGdtAnswer(gdtCurrent.value, ans)
  gdtFeedback.value = fb
  if (fb.correct) gdtScore.value += 1
}

function nextGdt() {
  gdtFeedback.value = null
  gdtAnswer.value = null
  if (gdtIndex.value + 1 >= gdtQuiz.value.questions.length) {
    gdtFinished.value = true
    return
  }
  gdtIndex.value += 1
}

function restartGdt() {
  gdtQuiz.value = generateGdtQuiz()
  gdtIndex.value = 0
  gdtAnswer.value = null
  gdtFeedback.value = null
  gdtScore.value = 0
  gdtFinished.value = false
}

function syncHash() {
  const hash = String(route.hash || '').replace(/^#/, '')
  if (hash === 'gdt') section.value = 'gdt'
  else if (hash === 'stack') section.value = 'stack'
}

watch(section, (v) => {
  const want = v === 'gdt' ? '#gdt' : '#stack'
  if (route.hash !== want && (route.name === 'quiz' || route.path === '/quiz')) {
    history.replaceState(null, '', `${route.path}${want}`)
  }
})

onMounted(syncHash)
watch(() => route.hash, syncHash)
</script>
