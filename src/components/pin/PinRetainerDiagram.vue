<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ title }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hint)" /></p>
    </header>

    <svg v-if="kind === 'pin'" class="mech-diagram__svg" viewBox="0 0 480 250" role="img" :aria-label="dt('ariaPin')">
      <defs>
        <marker id="pin-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="pin-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="pin-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <template v-if="shearPlanes === 2">
        <rect :x="90" :y="cy - plateH / 2" width="70" :height="plateH" rx="2" class="plate" />
        <rect :x="168" :y="cy - plateH * 0.7" width="90" :height="plateH * 1.4" rx="2" class="plate-mid" />
        <rect :x="266" :y="cy - plateH / 2" width="70" :height="plateH" rx="2" class="plate" />
        <text x="98" :y="cy - plateH / 2 + 16" class="txt-muted" font-size="10">{{ dt('plate') }}</text>
        <rect :x="118" :y="cy - pinD / 2" width="190" :height="pinD" rx="3" class="pin-body" />

        <line x1="266" :y1="cy" x2="310" :y2="cy" stroke="#8b5cf6" stroke-width="2" marker-end="url(#pin-arrow-violet)" />
        <SvgMathText :x="318" :y="cy + 4" text="F" color="#8b5cf6" :width="18" :font-size="13" />
        <line x1="82" :y1="cy - 16" x2="44" :y2="cy - 16" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#pin-arrow-violet)" />
        <line x1="344" :y1="cy + 16" x2="382" :y2="cy + 16" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#pin-arrow-violet)" />

        <line
          x1="102"
          :y1="cy - pinD / 2"
          x2="102"
          :y2="cy + pinD / 2"
          class="dim-primary"
          marker-start="url(#pin-arrow-blue)"
          marker-end="url(#pin-arrow-blue)"
        />
        <SvgMathText :x="78" :y="cy + 4" :text="labelD" anchor="end" color="#409eff" :width="70" :font-size="12" />

        <line
          x1="368"
          :y1="cy - plateH / 2"
          x2="368"
          :y2="cy + plateH / 2"
          class="dim"
          marker-start="url(#pin-arrow)"
          marker-end="url(#pin-arrow)"
        />
        <SvgMathText :x="376" :y="cy + 4" :text="labelT" color="#64748b" :width="80" :font-size="12" />
      </template>

      <template v-else>
        <rect :x="100" :y="cy - plateH * 0.9" width="150" :height="plateH * 0.9" rx="2" class="plate" />
        <rect :x="230" :y="cy" width="150" :height="plateH * 0.9" rx="2" class="plate-mid" />
        <text x="108" :y="cy - plateH * 0.9 + 16" class="txt-muted" font-size="10">{{ dt('plate') }}</text>
        <rect
          :x="220"
          :y="cy - pinD / 2 - plateH * 0.25"
          :width="pinD"
          :height="pinD + plateH * 0.55"
          rx="3"
          class="pin-body"
        />

        <line x1="92" :y1="cy - 8" x2="48" :y2="cy - 8" stroke="#8b5cf6" stroke-width="2" marker-end="url(#pin-arrow-violet)" />
        <SvgMathText :x="34" :y="cy - 4" text="F" color="#8b5cf6" :width="16" :font-size="13" />
        <line x1="388" :y1="cy + 20" x2="432" :y2="cy + 20" stroke="#8b5cf6" stroke-width="2" marker-end="url(#pin-arrow-violet)" />
        <SvgMathText :x="438" :y="cy + 24" text="F" color="#8b5cf6" :width="16" :font-size="13" />

        <line
          :x1="220"
          :y1="cy - pinD / 2 - plateH * 0.25 - 14"
          :x2="220 + pinD"
          :y2="cy - pinD / 2 - plateH * 0.25 - 14"
          class="dim-primary"
          marker-start="url(#pin-arrow-blue)"
          marker-end="url(#pin-arrow-blue)"
        />
        <SvgMathText :x="220 + pinD / 2" :y="cy - pinD / 2 - plateH * 0.25 - 20" :text="labelD" anchor="middle" color="#409eff" :width="80" :font-size="12" />

        <line
          x1="398"
          :y1="cy"
          x2="398"
          :y2="cy + plateH * 0.9"
          class="dim"
          marker-start="url(#pin-arrow)"
          marker-end="url(#pin-arrow)"
        />
        <SvgMathText :x="406" :y="cy + plateH * 0.45 + 4" :text="labelT" color="#64748b" :width="80" :font-size="12" />
      </template>

      <text x="24" y="236" class="txt-muted" font-size="11">
        {{ shearPlanes === 2 ? dt('doubleShear') : dt('singleShear') }}
      </text>
    </svg>

    <svg v-else class="mech-diagram__svg" viewBox="0 0 480 250" role="img" :aria-label="dt('ariaRing')">
      <defs>
        <marker id="ring-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="ring-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="ring-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <rect :x="80" :y="cyRing - shaftH / 2" width="280" :height="shaftH" rx="2" class="shaft" />
      <text x="92" :y="cyRing - shaftH / 2 + 18" class="txt-muted" font-size="11">{{ dt('shaft') }}</text>

      <!-- 上下沟槽凹口 -->
      <rect :x="grooveX" :y="cyRing - shaftH / 2" :width="ringW" :height="grooveH" class="groove" />
      <rect :x="grooveX" :y="cyRing + shaftH / 2 - grooveH" :width="ringW" :height="grooveH" class="groove" />

      <rect :x="grooveX - 2" :y="cyRing - shaftH / 2 - ringH + grooveH * 0.4" :width="ringW + 8" :height="ringH" rx="1" class="ring" />
      <rect :x="grooveX - 2" :y="cyRing + shaftH / 2 - grooveH * 0.4" :width="ringW + 8" :height="ringH" rx="1" class="ring" />
      <text :x="grooveX + ringW + 14" :y="cyRing - shaftH / 2 - ringH + grooveH * 0.4 + 12" class="txt-muted" font-size="10">{{ dt('ring') }}</text>

      <line x1="400" :y1="cyRing" x2="448" :y2="cyRing" stroke="#8b5cf6" stroke-width="2.2" marker-end="url(#ring-arrow-violet)" />
      <SvgMathText :x="454" :y="cyRing + 4" text="F" color="#8b5cf6" :width="16" :font-size="13" />

      <line
        x1="120"
        :y1="cyRing - shaftH / 2"
        x2="120"
        :y2="cyRing + shaftH / 2"
        class="dim-primary"
        marker-start="url(#ring-arrow-blue)"
        marker-end="url(#ring-arrow-blue)"
      />
      <SvgMathText :x="128" :y="cyRing + 4" :text="labelD" color="#409eff" :width="90" :font-size="12" />

      <line
        :x1="grooveX - 2"
        :y1="cyRing - shaftH / 2 - ringH + grooveH * 0.4 - 12"
        :x2="grooveX + ringW + 6"
        :y2="cyRing - shaftH / 2 - ringH + grooveH * 0.4 - 12"
        class="dim"
        marker-start="url(#ring-arrow)"
        marker-end="url(#ring-arrow)"
      />
      <SvgMathText
        :x="grooveX + ringW / 2"
        :y="cyRing - shaftH / 2 - ringH + grooveH * 0.4 - 18"
        :text="labelS"
        anchor="middle"
        color="#64748b"
        :width="80"
        :font-size="11"
      />

      <line
        :x1="grooveX + ringW + 18"
        :y1="cyRing - shaftH / 2"
        :x2="grooveX + ringW + 18"
        :y2="cyRing - shaftH / 2 + grooveH"
        class="dim"
        marker-start="url(#ring-arrow)"
        marker-end="url(#ring-arrow)"
      />
      <SvgMathText :x="grooveX + ringW + 26" :y="cyRing - shaftH / 2 + grooveH / 2 + 4" :text="labelH" color="#64748b" :width="80" :font-size="11" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from '@/components/common/MathContent.vue'
import SvgMathText from '@/components/common/SvgMathText.vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('pinRetainer')

const props = defineProps({
  kind: { type: String, default: 'pin' },
  shearPlanes: { type: Number, default: 2 },
  diameter: { type: Number, default: 10 },
  plateThickness: { type: Number, default: 8 },
  shaftDiameter: { type: Number, default: 20 },
  ringThickness: { type: Number, default: 1.2 },
  grooveDepth: { type: Number, default: 0.6 },
})

const title = computed(() => (props.kind === 'ring' ? dt('titleRing') : dt('titlePin')))
const hint = computed(() => {
  if (props.kind === 'ring') return dt('hintRing')
  return props.shearPlanes === 2 ? dt('hintPinDouble') : dt('hintPinSingle')
})

const cy = 120
const plateH = computed(() => Math.min(120, Math.max(56, (Number(props.plateThickness) || 8) * 8)))
const pinD = computed(() => Math.min(36, Math.max(14, (Number(props.diameter) || 10) * 2.2)))

const cyRing = 125
const shaftH = computed(() => Math.min(100, Math.max(48, (Number(props.shaftDiameter) || 20) * 2.2)))
const grooveH = computed(() => Math.min(18, Math.max(6, (Number(props.grooveDepth) || 0.6) * 12)))
const ringH = computed(() => Math.min(22, Math.max(8, (Number(props.ringThickness) || 1.2) * 10)))
const ringW = computed(() => ringH.value + 4)
const grooveX = 220

const labelD = computed(() =>
  props.kind === 'ring' ? dl('d', props.shaftDiameter) : dl('d', props.diameter),
)
const labelT = computed(() => dl('t', props.plateThickness))
const labelS = computed(() => dl('s', props.ringThickness))
const labelH = computed(() => dl('h', props.grooveDepth))
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .plate { fill: rgba(148,163,184,0.28); stroke: #64748b; stroke-width: 1.6; }
.mech-diagram__svg .plate-mid { fill: rgba(100,116,139,0.35); stroke: #64748b; stroke-width: 1.6; }
.mech-diagram__svg .pin-body { fill: rgba(64,158,255,0.35); stroke: #409eff; stroke-width: 1.8; }
.mech-diagram__svg .shaft { fill: rgba(148,163,184,0.25); stroke: #64748b; stroke-width: 1.8; }
.mech-diagram__svg .groove { fill: rgba(15,23,42,0.55); }
.dark .mech-diagram__svg .groove { fill: rgba(15,23,42,0.8); }
.mech-diagram__svg .ring { fill: rgba(139,92,246,0.45); stroke: #8b5cf6; stroke-width: 1.4; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; font-family: system-ui, sans-serif; }
</style>
