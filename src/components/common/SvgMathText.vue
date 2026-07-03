<template>
  <foreignObject :x="foX" :y="foY" :width="width" :height="height">
    <div
      xmlns="http://www.w3.org/1999/xhtml"
      class="svg-math-text"
      :class="className"
      :style="textStyle"
    >
      <MathContent :text="enriched" />
    </div>
  </foreignObject>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from './MathContent.vue'
import { enrichMathText } from '@/utils/math-label'

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  text: { type: String, default: '' },
  width: { type: Number, default: 128 },
  height: { type: Number, default: 26 },
  anchor: { type: String, default: 'start' },
  className: { type: String, default: '' },
  color: { type: String, default: '' },
  fontSize: { type: Number, default: 11 },
})

const enriched = computed(() => enrichMathText(props.text))

const foX = computed(() => {
  if (props.anchor === 'middle') return props.x - props.width / 2
  if (props.anchor === 'end') return props.x - props.width
  return props.x
})
const foY = computed(() => props.y - props.height + 6)

const textStyle = computed(() => ({
  color: props.color || undefined,
  fontSize: `${props.fontSize}px`,
  justifyContent:
    props.anchor === 'middle' ? 'center' : props.anchor === 'end' ? 'flex-end' : 'flex-start',
}))
</script>

<style scoped>
.svg-math-text {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 11px;
  line-height: 1.2;
  overflow: visible;
}

.svg-math-text :deep(.katex) {
  font-size: 0.95em;
}
</style>
