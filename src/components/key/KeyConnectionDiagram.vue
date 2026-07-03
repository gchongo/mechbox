<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(dt('hint'))" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 520 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="key-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="key-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 轮毂 -->
      <rect :x="hubX" :y="hubY" :width="hubW" :height="hubH" rx="4" class="hub-block" />
      <text :x="hubX + hubW / 2" :y="hubY - 8" class="txt-muted" font-size="12" text-anchor="middle">{{ dt('hub') }}</text>

      <!-- 轴 -->
      <rect :x="shaftX" :y="shaftY" :width="shaftW" :height="shaftH" rx="2" class="shaft-block" />
      <text :x="shaftX - 8" :y="shaftY + shaftH / 2 + 4" class="txt-muted" font-size="12" text-anchor="end">{{ dt('shaftPart') }}</text>

      <!-- 键槽（轴上） -->
      <rect :x="keyX" :y="keySlotY" :width="keyW" :height="keySlotH" class="key-slot" />

      <!-- 平键 -->
      <rect :x="keyX" :y="keyY" :width="keyW" :height="keyH" rx="1" class="key-block" />
      <text :x="keyX + keyW / 2" :y="keyY + keyH / 2 + 4" class="txt-key" font-size="11" text-anchor="middle">{{ dt('parallelKey') }}</text>

      <!-- d 轴径 -->
      <line
        :x1="shaftX"
        :y1="shaftY + shaftH + 18"
        :x2="shaftX + shaftW"
        :y2="shaftY + shaftH + 18"
        class="dim-primary"
        marker-start="url(#key-arrow-blue)"
        marker-end="url(#key-arrow-blue)"
      />
      <SvgMathText :x="shaftX + shaftW / 2" :y="shaftY + shaftH + 34" :text="dl('d', shaftDiameter)" anchor="middle" class-name="txt-primary" color="#409eff" :width="120" :font-size="13" />

      <!-- b 键宽 -->
      <line
        :x1="keyX"
        :y1="keyY - 10"
        :x2="keyX + keyW"
        :y2="keyY - 10"
        class="dim"
        marker-start="url(#key-arrow)"
        marker-end="url(#key-arrow)"
      />
      <SvgMathText :x="keyX + keyW / 2" :y="keyY - 16" :text="dl('b', keyWidth)" anchor="middle" :width="100" :font-size="12" />

      <!-- h 键高 -->
      <line
        :x1="keyX + keyW + 14"
        :y1="keyY"
        :x2="keyX + keyW + 14"
        :y2="keyY + keyH"
        class="dim"
        marker-start="url(#key-arrow)"
        marker-end="url(#key-arrow)"
      />
      <SvgMathText :x="keyX + keyW + 28" :y="keyY + keyH / 2 + 4" :text="dl('h', keyHeight)" :width="100" :font-size="12" />

      <!-- L 键长 -->
      <line
        :x1="keyX"
        :y1="keyY + keyH + 22"
        :x2="keyX + keyW"
        :y2="keyY + keyH + 22"
        class="dim-primary"
        marker-start="url(#key-arrow-blue)"
        marker-end="url(#key-arrow-blue)"
      />
      <SvgMathText :x="keyX + keyW / 2" :y="keyY + keyH + 38" :text="dl('L', keyLength)" anchor="middle" class-name="txt-primary" color="#409eff" :width="120" :font-size="13" />

      <!-- 扭矩方向 -->
      <path :d="`M ${shaftX - 30} ${shaftY + shaftH / 2} A 22 22 0 1 1 ${shaftX - 8} ${shaftY + shaftH / 2 - 18}`" fill="none" stroke="#8b5cf6" stroke-width="1.5" marker-end="url(#key-arrow-blue)" />
      <SvgMathText :x="shaftX - 42" :y="shaftY + shaftH / 2 + 4" text="$T$" color="#8b5cf6" :width="16" :font-size="11" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('key')

const props = defineProps({
  shaftDiameter: { type: Number, default: 30 },
  keyWidth: { type: Number, default: 8 },
  keyLength: { type: Number, default: 28 },
  keyHeight: { type: Number, default: 7 },
})

const scale = computed(() => Math.min(1.8, 120 / Math.max(props.shaftDiameter, 20)))
const shaftW = computed(() => props.keyLength * scale.value * 0.85)
const shaftH = computed(() => props.shaftDiameter * scale.value * 0.55)
const keyW = computed(() => Math.max(12, props.keyWidth * scale.value * 2.2))
const keyH = computed(() => Math.max(10, props.keyHeight * scale.value * 2))

const hubX = 140
const hubY = 36
const hubW = computed(() => shaftW.value + 48)
const hubH = computed(() => shaftH.value + 36)
const shaftX = computed(() => hubX + (hubW.value - shaftW.value) / 2)
const shaftY = computed(() => hubY + 18)
const keyX = computed(() => shaftX.value + (shaftW.value - keyW.value) / 2)
const keySlotY = computed(() => shaftY.value + shaftH.value - keyH.value * 0.45)
const keySlotH = computed(() => keyH.value * 0.45)
const keyY = computed(() => keySlotY.value - keyH.value * 0.55)
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

.mech-diagram__svg .hub-block {
  fill: rgba(148, 163, 184, 0.15);
  stroke: #94a3b8;
  stroke-width: 2;
}

.mech-diagram__svg .shaft-block {
  fill: rgba(64, 158, 255, 0.2);
  stroke: #409eff;
  stroke-width: 2;
}

.mech-diagram__svg .key-slot {
  fill: #f1f5f9;
  stroke: #cbd5e1;
  stroke-width: 1;
}

.dark .mech-diagram__svg .key-slot {
  fill: #334155;
  stroke: #64748b;
}

.mech-diagram__svg .key-block {
  fill: #f59e0b;
  fill-opacity: 0.85;
  stroke: #d97706;
  stroke-width: 1.5;
}

.mech-diagram__svg .txt-key {
  fill: #78350f;
  font-family: system-ui, sans-serif;
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
.mech-diagram__svg .txt-muted {
  font-family: system-ui, sans-serif;
}

.mech-diagram__svg .txt {
  fill: #334155;
}

.mech-diagram__svg .txt-primary {
  fill: #409eff;
}

.mech-diagram__svg .txt-muted {
  fill: #94a3b8;
}

.dark .mech-diagram__svg .txt {
  fill: #e2e8f0;
}
</style>
