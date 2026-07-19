<template>
  <div class="gdt-fcf" :class="{ 'gdt-fcf--interactive': interactive }">
    <svg
      class="gdt-fcf__svg"
      :viewBox="`0 0 ${totalW} ${H}`"
      :width="totalW"
      :height="H"
      role="img"
      :aria-label="aria"
    >
      <!-- 外框双线（图样习惯） -->
      <rect x="1" y="1" :width="totalW - 2" :height="H - 2" class="gdt-fcf__outer" fill="none" />
      <rect x="3.5" y="3.5" :width="totalW - 7" :height="H - 7" class="gdt-fcf__inner" fill="none" />

      <g v-for="(cell, i) in normalized" :key="`${i}-${cell}`">
        <rect
          v-if="interactive"
          class="gdt-fcf__hit"
          :class="{ 'gdt-fcf__hit--active': activeIndex === i }"
          :x="origins[i]"
          y="3.5"
          :width="widths[i]"
          :height="H - 7"
          @click="onSelect(i)"
        />
        <line
          v-if="i > 0"
          :x1="origins[i]"
          y1="3.5"
          :x2="origins[i]"
          :y2="H - 3.5"
          class="gdt-fcf__divider"
        />
        <text
          :x="origins[i] + widths[i] / 2"
          :y="H / 2 + 0.5"
          text-anchor="middle"
          dominant-baseline="central"
          class="gdt-fcf__text"
          :class="{
            'gdt-fcf__text--glyph': isGlyphCell(cell),
            'gdt-fcf__text--active': activeIndex === i,
          }"
          @click="onSelect(i)"
        >
          {{ cell }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cells: { type: Array, default: () => [] },
  interactive: { type: Boolean, default: false },
  activeIndex: { type: Number, default: -1 },
  aria: { type: String, default: 'Feature control frame' },
})

const emit = defineEmits(['select'])

const H = 56
const EDGE = 3.5

const normalized = computed(() =>
  (props.cells || []).map((c) => String(c ?? '').trim()).filter((c) => c.length > 0),
)

function isGlyphCell(cell) {
  if (!cell) return false
  if (cell.length === 1) return true
  // 材料状态 ⓂⓁⓈ 等
  return /^[ⓂⓁⓈ⌀Ø]$/.test(cell)
}

function measure(cell) {
  if (isGlyphCell(cell) && cell.length === 1 && !/[0-9A-Za-z]/.test(cell)) return 52
  const units = [...cell].length
  return Math.max(44, 18 + units * 12)
}

const widths = computed(() => {
  const list = normalized.value.map(measure)
  return list.length ? list : [52]
})

const origins = computed(() => {
  const xs = []
  let x = EDGE
  for (const w of widths.value) {
    xs.push(x)
    x += w
  }
  return xs
})

const totalW = computed(() => EDGE * 2 + widths.value.reduce((a, b) => a + b, 0))

function onSelect(i) {
  if (!props.interactive) return
  emit('select', i)
}
</script>

<style scoped>
.gdt-fcf {
  display: inline-flex;
  justify-content: center;
  max-width: 100%;
  overflow-x: auto;
  padding: 0.35rem 0;
  color: #111827;
}
.gdt-fcf__svg {
  display: block;
  flex-shrink: 0;
}
.gdt-fcf__outer {
  stroke: currentColor;
  stroke-width: 2;
}
.gdt-fcf__inner {
  stroke: currentColor;
  stroke-width: 1;
}
.gdt-fcf__divider {
  stroke: currentColor;
  stroke-width: 1.25;
}
.gdt-fcf__text {
  fill: currentColor;
  font-family: 'Segoe UI Symbol', 'Segoe UI', 'Noto Sans Symbols 2', 'Apple Symbols', 'DejaVu Sans',
    ui-sans-serif, system-ui, sans-serif;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: default;
  user-select: none;
  pointer-events: none;
}
.gdt-fcf__text--glyph {
  font-size: 22px;
  font-weight: 500;
}
.gdt-fcf--interactive .gdt-fcf__hit {
  cursor: pointer;
}
.gdt-fcf__hit {
  fill: transparent;
}
.gdt-fcf__hit--active {
  fill: rgb(64 158 255 / 0.2);
}
.gdt-fcf__text--active {
  fill: #409eff;
}
:global(.dark) .gdt-fcf {
  color: #e5e7eb;
}
</style>
