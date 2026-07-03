<template>
  <div class="rounded-lg border border-gray-200 bg-gray-900 p-4 dark:border-gray-600">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-white">
        <el-icon :size="20"><VideoPlay /></el-icon>
        <span class="text-sm font-medium">{{ ct('tutorial.demoMode') }}</span>
        <span class="text-xs text-gray-400">{{ tutorial.title }} · {{ tutorial.duration }}</span>
      </div>
      <div class="flex gap-2">
        <el-button v-if="!playing" size="small" type="primary" @click="start">
          {{ ct('tutorial.demoPlay') }}
        </el-button>
        <el-button v-else size="small" @click="pause">{{ ct('tutorial.demoPause') }}</el-button>
        <el-button size="small" @click="stop">{{ ct('tutorial.demoReset') }}</el-button>
      </div>
    </div>

    <div class="relative min-h-[160px] rounded-md bg-gray-800 p-5 text-white">
      <transition name="fade" mode="out-in">
        <div :key="currentIndex">
          <p class="mb-1 text-xs uppercase tracking-wide text-primary">
            {{ currentIndex + 1 }} / {{ slides.length }}
          </p>
          <h4 class="mb-2 text-lg font-semibold">{{ slides[currentIndex].heading }}</h4>
          <MathContent :text="slides[currentIndex].body" class="text-sm leading-relaxed text-gray-200" />
        </div>
      </transition>
    </div>

    <el-progress
      class="mt-3"
      :percentage="progress"
      :stroke-width="6"
      :show-text="false"
      color="#3498db"
    />
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { VideoPlay } from '@element-plus/icons-vue'
import { useContentI18n } from '@/composables/useContentI18n'

const props = defineProps({
  tutorial: { type: Object, required: true },
  intervalMs: { type: Number, default: 5000 },
})

const { ct } = useContentI18n()
const playing = ref(false)
const currentIndex = ref(0)
let timer = null

const slides = computed(() => props.tutorial.sections ?? [])

const progress = computed(() =>
  slides.value.length ? ((currentIndex.value + 1) / slides.value.length) * 100 : 0,
)

function tick() {
  if (currentIndex.value >= slides.value.length - 1) {
    pause()
    return
  }
  currentIndex.value += 1
}

function start() {
  if (!slides.value.length) return
  playing.value = true
  clearInterval(timer)
  timer = setInterval(tick, props.intervalMs)
}

function pause() {
  playing.value = false
  clearInterval(timer)
}

function stop() {
  pause()
  currentIndex.value = 0
}

watch(
  () => props.tutorial.id,
  () => stop(),
)

onBeforeUnmount(pause)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
