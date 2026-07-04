<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(freeLength ? dt('hintWithL0') : dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="spr-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="spr-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 端座 -->
      <rect x="80" y="bottomPlateY" width="320" height="10" rx="2" class="end-plate" />
      <rect x="80" :y="topPlateY" width="320" height="10" rx="2" class="end-plate" />

      <!-- 簧身 -->
      <path :d="coilPath" fill="none" stroke="#409eff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- D₂ 中径 — 始终画在簧体下方，避免与线圈重叠 -->
      <line
        :x1="centerX - rMean"
        :y1="meanDimY"
        :x2="centerX + rMean"
        :y2="meanDimY"
        class="dim-primary"
        marker-start="url(#spr-arrow-blue)"
        marker-end="url(#spr-arrow-blue)"
      />
      <SvgMathText
        :x="centerX"
        :y="meanLabelY"
        :text="dl('D_2', meanDiameter)"
        anchor="middle"
        class-name="txt-primary"
        color="#409eff"
        :width="132"
        :font-size="13"
      />

      <!-- d 线径 — 簧体侧面外侧，空间不足时改到左侧 -->
      <circle :cx="wireSampleX" :cy="springMidY" :r="wireR" class="wire-sample" />
      <line
        :x1="wireDimX1"
        :y1="springMidY"
        :x2="wireDimX2"
        :y2="springMidY"
        class="dim"
        marker-start="url(#spr-arrow)"
        marker-end="url(#spr-arrow)"
      />
      <SvgMathText
        :x="wireLabelX"
        :y="springMidY + 4"
        :text="dl('d', wireDiameter)"
        :anchor="wireLabelAnchor"
        class-name="txt"
        color="#334155"
        :width="100"
        :font-size="12"
      />

      <!-- n 有效圈数 — 簧体上方外侧 -->
      <SvgMathText
        :x="coilLabelX"
        :y="coilLabelY"
        :text="dl('n', activeCoils, '')"
        :anchor="coilLabelAnchor"
        class-name="txt"
        color="#334155"
        :width="72"
        :font-size="13"
      />

      <!-- L₀ — 右侧独立标注区 -->
      <template v-if="freeLength">
        <line
          :x1="l0DimX"
          :y1="topPlateY + 10"
          :x2="l0DimX"
          :y2="bottomPlateY"
          class="dim-primary"
          marker-start="url(#spr-arrow-blue)"
          marker-end="url(#spr-arrow-blue)"
        />
        <SvgMathText
          :x="l0DimX + 12"
          :y="springMidY + 4"
          text="L_0"
          class-name="txt-primary"
          color="#409eff"
          :width="28"
          :font-size="12"
        />
        <text :x="l0DimX + 12" :y="springMidY + 20" class="txt-sub" font-size="11">{{ freeLength }} mm</text>
      </template>

      <!-- F -->
      <line
        :x1="centerX"
        :y1="forceArrowY1"
        :x2="centerX"
        :y2="forceArrowY2"
        stroke="#8b5cf6"
        stroke-width="2"
        marker-end="url(#spr-arrow-blue)"
      />
      <SvgMathText :x="centerX + 10" :y="forceLabelY" text="F" color="#8b5cf6" :width="16" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('spring')

const props = defineProps({
  wireDiameter: { type: Number, default: 3 },
  meanDiameter: { type: Number, default: 24 },
  activeCoils: { type: Number, default: 8 },
  freeLength: { type: Number, default: 0 },
})

const centerX = 240
const bottomPlateY = 200

const scale = computed(() => Math.min(3.5, 90 / Math.max(props.meanDiameter, 10)))
const rMean = computed(() => (props.meanDiameter / 2) * scale.value)
const wireR = computed(() => Math.max(3, (props.wireDiameter / 2) * scale.value))

const springBodyHeight = computed(() => {
  if (props.freeLength > 0) return Math.min(150, props.freeLength * 1.1)
  return 60 + props.activeCoils * 8
})

const topPlateY = computed(() => bottomPlateY - springBodyHeight.value - 10)
const springTop = computed(() => topPlateY.value + 10)
const springMidY = computed(() => (springTop.value + bottomPlateY) / 2)

/** 中径标注放在端座下方 */
const meanDimY = computed(() => bottomPlateY + 22)
const meanLabelY = computed(() => bottomPlateY + 38)

/** d 标注：优先右侧，超出画布则放左侧 */
const placeWireRight = computed(() => centerX + rMean.value + wireR.value + 110 <= 468)
const wireSampleX = computed(() =>
  placeWireRight.value ? centerX + rMean.value + 8 : centerX - rMean.value - 8,
)
const wireDimX1 = computed(() =>
  placeWireRight.value ? wireSampleX.value + wireR.value + 4 : wireSampleX.value - wireR.value - 4,
)
const wireDimX2 = computed(() =>
  placeWireRight.value ? wireDimX1.value + wireR.value * 2 + 4 : wireDimX1.value - wireR.value * 2 - 4,
)
const wireLabelX = computed(() =>
  placeWireRight.value ? wireDimX2.value + 8 : wireDimX2.value - 8,
)
const wireLabelAnchor = computed(() => (placeWireRight.value ? 'start' : 'end'))

/** n 标注：优先右上，与簧体保持距离 */
const placeCoilRight = computed(() => centerX + rMean.value + 90 <= 420)
const coilLabelX = computed(() =>
  placeCoilRight.value ? centerX + rMean.value + 36 : centerX - rMean.value - 36,
)
const coilLabelY = computed(() => Math.max(28, springTop.value + 18))
const coilLabelAnchor = computed(() => (placeCoilRight.value ? 'start' : 'end'))

/** L₀ 标注：在簧体与右边界之间的独立列 */
const l0DimX = computed(() => {
  const minX = centerX + rMean.value + 48
  return Math.min(Math.max(minX, 400), 452)
})

const forceArrowY1 = computed(() => topPlateY.value - 18)
const forceArrowY2 = computed(() => topPlateY.value + 2)
const forceLabelY = computed(() => topPlateY.value - 8)

const coilPath = computed(() => {
  const left = centerX - rMean.value
  const right = centerX + rMean.value
  const top = springTop.value + 4
  const bottom = bottomPlateY - 2
  const coils = Math.min(12, Math.max(4, Math.round(props.activeCoils)))
  const pitch = (bottom - top) / coils
  let d = `M ${left} ${top}`
  for (let i = 0; i < coils; i++) {
    const y2 = top + (i + 0.5) * pitch
    const y3 = top + (i + 1) * pitch
    d += ` Q ${right} ${y2} ${left} ${y3}`
    if (i < coils - 1) {
      d += ` Q ${left} ${y2 + pitch * 0.25} ${right} ${y3}`
    }
  }
  return d
})
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}

.mech-diagram__head {
  @apply mb-3;
}

.mech-diagram__title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-100;
}

.mech-diagram__hint {
  @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}

.mech-diagram__svg {
  @apply w-full;
}

.mech-diagram__svg .end-plate {
  fill: #64748b;
  fill-opacity: 0.5;
  stroke: #475569;
  stroke-width: 1;
}

.mech-diagram__svg .wire-sample {
  fill: rgba(64, 158, 255, 0.3);
  stroke: #409eff;
  stroke-width: 1.5;
}

.mech-diagram__svg .dim {
  stroke: #64748b;
  stroke-width: 1.2;
  fill: none;
}

.mech-diagram__svg .dim-primary {
  stroke: #409eff;
  stroke-width: 1.5;
  fill: none;
}

.mech-diagram__svg .txt,
.mech-diagram__svg .txt-primary,
.mech-diagram__svg .txt-sub {
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt {
  fill: #334155;
}

.mech-diagram__svg .txt-primary {
  fill: #409eff;
}

.mech-diagram__svg .txt-sub {
  fill: #64748b;
}

.dark .mech-diagram__svg .txt {
  fill: #e2e8f0;
}
</style>
