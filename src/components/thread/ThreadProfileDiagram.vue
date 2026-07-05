<template>
  <div class="thread-profile-diagram">
    <svg viewBox="0 0 420 200" class="w-full max-w-lg" role="img" :aria-label="aria">
      <defs>
        <marker id="thread-dim-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>

      <!-- 锥管螺纹：中心锥度示意 -->
      <template v-if="taperOverlay">
        <line
          :x1="taperOverlay.x1"
          :y1="taperOverlay.y1"
          :x2="taperOverlay.x2"
          :y2="taperOverlay.y2"
          stroke="currentColor"
          stroke-width="1"
          stroke-dasharray="6 4"
          class="text-amber-600 dark:text-amber-400"
        />
        <text
          :x="taperOverlay.labelX"
          :y="taperOverlay.labelY"
          class="fill-current text-[10px] text-amber-600 dark:text-amber-400"
        >
          {{ taperOverlay.label }}
        </text>
      </template>

      <!-- 外螺纹 -->
      <path
        :d="externalPath"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="text-gray-800 dark:text-gray-200"
      />
      <!-- 内螺纹 -->
      <path
        :d="internalPath"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-dasharray="4 3"
        class="text-gray-500"
      />
      <!-- 滚珠丝杠滚珠 -->
      <circle
        v-for="(ball, i) in externalExtras"
        :key="`ext-${i}`"
        :cx="ball.cx"
        :cy="ball.cy"
        :r="ball.r"
        fill="currentColor"
        class="text-primary"
        opacity="0.85"
      />
      <circle
        v-for="(ball, i) in internalExtras"
        :key="`int-${i}`"
        :cx="ball.cx"
        :cy="ball.cy"
        :r="ball.r"
        fill="currentColor"
        class="text-primary"
        opacity="0.5"
      />

      <text x="210" y="24" text-anchor="middle" class="fill-current text-xs font-medium">{{ title }}</text>
      <text x="60" y="188" class="fill-current text-[10px]">{{ labels.external }}</text>
      <text x="280" y="188" class="fill-current text-[10px]">{{ labels.internal }}</text>

      <!-- 牙型角标注 -->
      <text v-if="angleLabel" x="210" y="42" text-anchor="middle" class="fill-current text-[10px] text-gray-500">
        {{ angleLabel }}
      </text>

      <!-- 螺距 P -->
      <line
        x1="120"
        y1="155"
        x2="160"
        y2="155"
        stroke="currentColor"
        marker-start="url(#thread-dim-arrow)"
        marker-end="url(#thread-dim-arrow)"
      />
      <text x="140" y="148" text-anchor="middle" class="fill-current text-[10px]">P</text>
    </svg>
    <p class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">{{ formula }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  buildProfilePath,
  buildProfileExtras,
  showTaperOverlay,
  taperOverlayPaths,
} from '@/utils/thread-profile-diagram'

const props = defineProps({
  /** @type {import('@/utils/thread-profile-diagram').ThreadDiagramKind} */
  kind: { type: String, default: 'triangular_60' },
  angle: { type: Number, default: 60 },
  title: { type: String, default: '' },
  formula: { type: String, default: 'H = 0.866025 P' },
  aria: { type: String, default: '' },
  labels: {
    type: Object,
    default: () => ({ external: '外螺纹', internal: '内螺纹' }),
  },
})

const externalPath = computed(() => buildProfilePath(props.kind, 'external'))
const internalPath = computed(() => buildProfilePath(props.kind, 'internal'))
const externalExtras = computed(() => buildProfileExtras(props.kind, 'external'))
const internalExtras = computed(() => buildProfileExtras(props.kind, 'internal'))
const taperOverlay = computed(() =>
  showTaperOverlay(props.kind) ? taperOverlayPaths(props.kind) : null,
)

const angleLabel = computed(() => {
  if (props.kind === 'ball_screw') return ''
  if (props.kind === 'square') return '90°'
  if (props.kind === 'round') return '≈30°'
  if (props.kind.startsWith('trapezoidal')) return `${props.angle}°`
  if (props.kind.startsWith('triangular')) return `${props.angle}°`
  if (props.kind === 'buttress') return '3°/30°'
  return `${props.angle}°`
})
</script>

<style scoped>
.thread-profile-diagram svg {
  color: var(--el-text-color-primary);
}
</style>
