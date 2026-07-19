<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ title }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hint)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 260" role="img" :aria-label="title">
      <defs>
        <marker id="st-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="st-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="st-arrow-blue-start" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="#409EFF" />
        </marker>
        <marker id="st-arrow-start" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto">
          <path d="M6,0 L0,3 L6,6 Z" fill="#64748b" />
        </marker>
        <marker id="st-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 管路：分标 D/L，完整+显示局部损失 K -->
      <template v-if="variant === 'pipe'">
        <!-- 进口 -->
        <rect x="48" y="108" width="28" height="44" rx="2" class="pipe-flange" />
        <!-- 直管段 -->
        <rect x="76" y="112" :width="pipeBodyW" height="36" rx="3" class="pipe-wall" />
        <rect x="84" y="120" :width="pipeBodyW - 16" height="20" rx="2" class="pipe-flow" />
        <!-- 流速箭头（管内） -->
        <g stroke="#409eff" stroke-width="1.5" fill="none" opacity="0.85">
          <line
            v-for="(x, i) in pipeFlowArrowXs"
            :key="'fq'+i"
            :x1="x"
            y1="130"
            :x2="x + 22"
            y2="130"
            marker-end="url(#st-arrow-blue)"
          />
        </g>
        <!-- 完整+：弯头 + K -->
        <template v-if="showPipeLocal">
          <path
            d="M 300 112 L 300 88 Q 300 72 316 72 L 348 72"
            fill="none"
            stroke="#64748b"
            stroke-width="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M 300 120 L 300 88 Q 300 80 316 80 L 348 80"
            fill="none"
            stroke="rgba(64,158,255,0.35)"
            stroke-width="4"
            stroke-linecap="round"
          />
          <SvgMathText :x="318" :y="58" :text="labelPipeK" class-name="txt" color="#8b5cf6" :width="72" :font-size="11" />
        </template>
        <!-- 出口流量 Q -->
        <line
          :x1="pipeOutX"
          y1="130"
          :x2="pipeOutX + 36"
          y2="130"
          stroke="#409eff"
          stroke-width="2"
          marker-end="url(#st-arrow-blue)"
        />
        <SvgMathText :x="pipeOutX + 42" :y="134" :text="labelPipeQ" class-name="txt-primary" color="#409eff" :width="80" :font-size="12" />
        <!-- ΔP：进出口 -->
        <SvgMathText :x="52" :y="96" text="$p_1$" class-name="txt-muted" color="#94a3b8" :width="32" :font-size="11" />
        <SvgMathText :x="pipeOutX + 8" :y="158" text="$p_2$" class-name="txt-muted" color="#94a3b8" :width="32" :font-size="11" />
        <SvgMathText :x="200" :y="42" :text="labelPipeDp" anchor="middle" class-name="txt" color="#64748b" :width="140" :font-size="12" />
        <!-- L 管长 -->
        <line
          x1="76"
          y1="188"
          :x2="76 + pipeBodyW"
          y2="188"
          class="dim-primary"
          marker-start="url(#st-arrow-blue-start)"
          marker-end="url(#st-arrow-blue)"
        />
        <SvgMathText :x="76 + pipeBodyW / 2" :y="210" :text="labelPipeL" anchor="middle" class-name="txt-primary" color="#409eff" :width="120" :font-size="12" />
        <!-- D 内径 -->
        <line
          x1="56"
          y1="120"
          x2="56"
          y2="140"
          class="dim"
          marker-start="url(#st-arrow-start)"
          marker-end="url(#st-arrow)"
        />
        <SvgMathText :x="28" :y="134" :text="labelPipeD" anchor="middle" class-name="txt" color="#64748b" :width="48" :font-size="11" />
        <!-- ε 粗糙度 -->
        <SvgMathText :x="160" :y="246" :text="labelPipeEps" anchor="middle" class-name="txt-muted" color="#94a3b8" :width="160" :font-size="11" />
      </template>

      <!-- 薄板屈曲：按边界条件切换边符号与振型 -->
      <template v-else-if="variant === 'plate'">
        <rect x="120" y="72" width="240" height="108" rx="2" class="plate" />

        <!-- 边界：上边 (长边) -->
        <g v-if="plateEdges.top === 'ss'">
          <polygon v-for="(x, i) in platePinXs" :key="'pt'+i" :points="`${x},72 ${x-5},62 ${x+5},62`" class="plate-pin" />
        </g>
        <rect v-else x="118" y="66" width="244" height="7" class="plate-clamp" />

        <!-- 边界：下边 (长边) -->
        <g v-if="plateEdges.bottom === 'ss'">
          <polygon v-for="(x, i) in platePinXs" :key="'pb'+i" :points="`${x},180 ${x-5},190 ${x+5},190`" class="plate-pin" />
        </g>
        <rect v-else x="118" y="179" width="244" height="7" class="plate-clamp" />

        <!-- 边界：左边 (短边，受压) -->
        <g v-if="plateEdges.left === 'ss'">
          <polygon v-for="(y, i) in platePinYs" :key="'pl'+i" :points="`120,${y} 110,${y-5} 110,${y+5}`" class="plate-pin" />
        </g>
        <rect v-else x="113" y="70" width="7" height="112" class="plate-clamp" />

        <!-- 边界：右边 (短边，受压) -->
        <g v-if="plateEdges.right === 'ss'">
          <polygon v-for="(y, i) in platePinYs" :key="'pr'+i" :points="`360,${y} 370,${y-5} 370,${y+5}`" class="plate-pin" />
        </g>
        <rect v-else x="360" y="70" width="7" height="112" class="plate-clamp" />

        <!-- 一阶屈曲半波（固支边附近更“贴边”） -->
        <path
          :d="plateModePath"
          fill="none"
          stroke="#409eff"
          stroke-width="2"
          stroke-dasharray="5 3"
          opacity="0.95"
        />

        <!-- 左压缩 -->
        <g stroke="#8b5cf6" stroke-width="2" fill="none">
          <line x1="62" y1="96" x2="104" y2="96" marker-end="url(#st-arrow-violet)" />
          <line x1="62" y1="126" x2="104" y2="126" marker-end="url(#st-arrow-violet)" />
          <line x1="62" y1="156" x2="104" y2="156" marker-end="url(#st-arrow-violet)" />
        </g>
        <SvgMathText :x="60" :y="78" :text="labelSigma" anchor="middle" class-name="txt" color="#8b5cf6" :width="36" :font-size="12" />
        <!-- 右压缩 -->
        <g stroke="#8b5cf6" stroke-width="2" fill="none">
          <line x1="418" y1="96" x2="376" y2="96" marker-end="url(#st-arrow-violet)" />
          <line x1="418" y1="126" x2="376" y2="126" marker-end="url(#st-arrow-violet)" />
          <line x1="418" y1="156" x2="376" y2="156" marker-end="url(#st-arrow-violet)" />
        </g>
        <SvgMathText :x="420" :y="78" :text="labelSigma" anchor="middle" class-name="txt" color="#8b5cf6" :width="36" :font-size="12" />

        <line
          x1="120"
          y1="206"
          x2="360"
          y2="206"
          class="dim-primary"
          marker-start="url(#st-arrow-blue-start)"
          marker-end="url(#st-arrow-blue)"
        />
        <SvgMathText :x="240" :y="226" :text="labelA" anchor="middle" class-name="txt-primary" color="#409eff" :width="150" :font-size="12" />

        <!-- 图例 -->
        <polygon points="130,248 125,238 135,238" class="plate-pin" />
        <text x="142" y="246" font-size="10" fill="currentColor" opacity="0.7">{{ dt('plateLegendSs') }}</text>
        <rect x="210" y="239" width="16" height="6" class="plate-clamp" />
        <text x="232" y="246" font-size="10" fill="currentColor" opacity="0.7">{{ dt('plateLegendClamped') }}</text>
        <line
          x1="92"
          y1="72"
          x2="92"
          y2="180"
          class="dim"
          marker-start="url(#st-arrow-start)"
          marker-end="url(#st-arrow)"
        />
        <SvgMathText :x="64" :y="130" :text="labelB" anchor="middle" class-name="txt" color="#64748b" :width="48" :font-size="12" />
        <rect x="430" y="96" width="12" height="60" rx="1" class="plate-edge" />
        <line
          x1="458"
          y1="96"
          x2="458"
          y2="156"
          class="dim"
          marker-start="url(#st-arrow-start)"
          marker-end="url(#st-arrow)"
        />
        <SvgMathText :x="430" :y="180" :text="labelT" anchor="middle" class-name="txt" color="#64748b" :width="56" :font-size="11" />
      </template>

      <!-- 模态：SDOF 弹簧–质量 -->
      <template v-else-if="modalCase === 'sdof'">
        <rect x="170" y="210" width="140" height="10" class="base" />
        <!-- 弹簧 zigzag -->
        <path
          d="M 240 210 L 240 198 L 222 186 L 258 174 L 222 162 L 258 150 L 222 138 L 258 126 L 240 114"
          fill="none"
          stroke="#64748b"
          stroke-width="2.5"
          stroke-linejoin="round"
        />
        <SvgMathText :x="268" :y="162" text="k" class-name="txt" color="#64748b" :width="16" :font-size="13" />
        <rect x="208" y="78" width="64" height="36" rx="4" class="mass" />
        <SvgMathText :x="232" :y="100" text="m" class-name="txt-primary" color="#409eff" :width="20" :font-size="14" />
        <!-- 竖向往复箭头 -->
        <line
          x1="300"
          y1="70"
          x2="300"
          y2="130"
          stroke="#409eff"
          stroke-width="1.75"
          marker-start="url(#st-arrow-blue-start)"
          marker-end="url(#st-arrow-blue)"
        />
        <SvgMathText :x="312" :y="96" text="f_n" class-name="txt-primary" color="#409eff" :width="28" :font-size="12" />
        <SvgMathText
          v-if="showExcitation"
          :x="340"
          :y="180"
          :text="labelFexc"
          class-name="txt-muted"
          color="#94a3b8"
          :width="130"
          :font-size="12"
        />
      </template>

      <!-- 模态：简支梁一阶 -->
      <template v-else-if="modalCase === 'beam_ss'">
        <!-- 支座 -->
        <polygon points="90,188 78,210 102,210" fill="#64748b" />
        <circle cx="90" cy="186" r="5" fill="#94a3b8" stroke="#64748b" stroke-width="1.5" />
        <polygon points="390,188 378,210 402,210" fill="#64748b" />
        <circle cx="390" cy="186" r="5" fill="none" stroke="#64748b" stroke-width="1.5" />
        <line x1="70" y1="210" x2="410" y2="210" class="base-line" />
        <!-- 静挠度梁 -->
        <path d="M 90 186 Q 240 186 390 186" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
        <!-- 一阶振型（虚线） -->
        <path
          d="M 90 186 Q 240 118 390 186"
          fill="none"
          stroke="#409eff"
          stroke-width="2"
          stroke-dasharray="5 3"
        />
        <line
          x1="240"
          y1="186"
          x2="240"
          y2="128"
          stroke="#409eff"
          stroke-width="1.5"
          marker-start="url(#st-arrow-blue-start)"
          marker-end="url(#st-arrow-blue)"
        />
        <SvgMathText :x="248" :y="150" text="f_n" class-name="txt-primary" color="#409eff" :width="28" :font-size="12" />
        <line x1="90" y1="228" x2="390" y2="228" class="dim-primary" marker-start="url(#st-arrow-blue)" marker-end="url(#st-arrow-blue)" />
        <SvgMathText :x="240" :y="244" text="L" anchor="middle" class-name="txt-primary" color="#409eff" :width="20" :font-size="12" />
        <SvgMathText
          v-if="showExcitation"
          :x="340"
          :y="100"
          :text="labelFexc"
          class-name="txt-muted"
          color="#94a3b8"
          :width="130"
          :font-size="12"
        />
      </template>

      <!-- 模态：悬臂梁一阶 -->
      <template v-else>
        <!-- 固支墙 -->
        <rect x="70" y="70" width="14" height="140" fill="#64748b" />
        <g stroke="#94a3b8" stroke-width="1.5">
          <line v-for="i in 7" :key="i" :x1="70" :y1="78 + (i - 1) * 18" x2="58" :y2="90 + (i - 1) * 18" />
        </g>
        <!-- 静梁 -->
        <path d="M 84 140 L 380 140" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
        <!-- 一阶横向振型 -->
        <path
          d="M 84 140 Q 220 140 380 78"
          fill="none"
          stroke="#409eff"
          stroke-width="2"
          stroke-dasharray="5 3"
        />
        <line
          x1="380"
          y1="140"
          x2="380"
          y2="88"
          stroke="#409eff"
          stroke-width="1.5"
          marker-start="url(#st-arrow-blue-start)"
          marker-end="url(#st-arrow-blue)"
        />
        <SvgMathText :x="388" :y="112" text="f_n" class-name="txt-primary" color="#409eff" :width="28" :font-size="12" />
        <line x1="84" y1="188" x2="380" y2="188" class="dim-primary" marker-start="url(#st-arrow-blue)" marker-end="url(#st-arrow-blue)" />
        <SvgMathText :x="232" :y="204" text="L" anchor="middle" class-name="txt-primary" color="#409eff" :width="20" :font-size="12" />
        <SvgMathText
          v-if="showExcitation"
          :x="200"
          :y="60"
          :text="labelFexc"
          class-name="txt-muted"
          color="#94a3b8"
          :width="130"
          :font-size="12"
        />
      </template>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from '@/components/common/MathContent.vue'
import SvgMathText from '@/components/common/SvgMathText.vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('structural')

const props = defineProps({
  variant: { type: String, default: 'pipe' },
  /** modal 工况：sdof | beam_ss | beam_cant */
  caseId: { type: String, default: 'sdof' },
  /** plate 边界：ssss | cccc | scsc | sscc */
  edgeCondition: { type: String, default: 'ssss' },
  /** pipe：simple | complete | professional */
  calcMode: { type: String, default: 'simple' },
  diameter: { type: Number, default: 25 },
  length: { type: Number, default: 10 },
  roughness: { type: Number, default: 0.045 },
  localLossK: { type: Number, default: 0 },
  flowRate: { type: Number, default: 0 },
  plateLength: { type: Number, default: 400 },
  plateWidth: { type: Number, default: 200 },
  plateThickness: { type: Number, default: 2 },
  excitationFreq: { type: Number, default: 0 },
})

const modalCase = computed(() => props.caseId || 'sdof')
const showExcitation = computed(() => Number(props.excitationFreq) > 0)
const showPipeLocal = computed(() => props.calcMode !== 'simple')
const pipeBodyW = computed(() => (showPipeLocal.value ? 220 : 280))
const pipeOutX = computed(() => (showPipeLocal.value ? 356 : 364))
const pipeFlowArrowXs = computed(() =>
  showPipeLocal.value ? [100, 150, 200, 250] : [110, 170, 230, 290],
)
const plateEdgeKey = computed(() => props.edgeCondition || 'ssss')

/** 上/下=长边(a)，左/右=短边(b，受压边) */
const plateEdges = computed(() => {
  switch (plateEdgeKey.value) {
    case 'cccc':
      return { top: 'clamped', bottom: 'clamped', left: 'clamped', right: 'clamped' }
    case 'scsc':
      // 对边简支 / 对边固支：左右简支、上下固支
      return { top: 'clamped', bottom: 'clamped', left: 'ss', right: 'ss' }
    case 'sscc':
      // 长边简支 / 短边固支
      return { top: 'ss', bottom: 'ss', left: 'clamped', right: 'clamped' }
    case 'ssss':
    default:
      return { top: 'ss', bottom: 'ss', left: 'ss', right: 'ss' }
  }
})

const platePinXs = [150, 200, 240, 280, 330]
const platePinYs = [95, 126, 157]

const plateModePath = computed(() => {
  // 固支边：端部切线更平；简支边：可用 steeper sine 入口
  const L = plateEdges.value.left === 'clamped'
  const R = plateEdges.value.right === 'clamped'
  if (L && R) {
    // 两端固支感：中段鼓起，近端贴边
    return 'M 130 126 C 165 126 195 62 240 58 C 285 62 315 126 350 126'
  }
  if (!L && !R) {
    // 两端简支：经典半波
    return 'M 130 126 Q 240 56 350 126'
  }
  // 一端简支一端固支感（混合）
  if (L && !R) return 'M 130 126 C 170 126 210 60 260 58 Q 320 70 350 126'
  return 'M 130 126 Q 180 70 220 58 C 270 60 315 126 350 126'
})

const title = computed(() => {
  if (props.variant === 'pipe') return dt('pipeTitle')
  if (props.variant === 'plate') return dt('plateTitle')
  if (modalCase.value === 'beam_ss') return dt('modalTitleBeamSs')
  if (modalCase.value === 'beam_cant') return dt('modalTitleBeamCant')
  return dt('modalTitleSdof')
})

const hint = computed(() => {
  if (props.variant === 'pipe') {
    return showPipeLocal.value ? dt('pipeHintLocal') : dt('pipeHint')
  }
  if (props.variant === 'plate') {
    const key = {
      ssss: 'plateHintSsss',
      cccc: 'plateHintCccc',
      scsc: 'plateHintScsc',
      sscc: 'plateHintSscc',
    }[plateEdgeKey.value]
    return dt(key || 'plateHint')
  }
  if (modalCase.value === 'beam_ss') return dt('modalHintBeamSs')
  if (modalCase.value === 'beam_cant') return dt('modalHintBeamCant')
  return dt('modalHintSdof')
})

const labelPipeD = computed(() => dl('D', props.diameter))
const labelPipeL = computed(() => dl('L', props.length, 'm'))
const labelPipeQ = computed(() => {
  if (props.flowRate > 0) return `$Q = ${props.flowRate}\\,\\mathrm{L/min}$`
  return '$Q$'
})
const labelPipeK = computed(() => `$K = ${Number(props.localLossK ?? 0).toFixed(1)}$`)
const labelPipeEps = computed(
  () => `$\\varepsilon = ${Number(props.roughness ?? 0).toFixed(3)}\\,\\mathrm{mm}$`,
)
const labelPipeDp = computed(() => '$\\Delta P = p_1 - p_2$')
const labelA = computed(() => dl('a', props.plateLength))
const labelB = computed(() => dl('b', props.plateWidth))
const labelT = computed(() => dl('t', props.plateThickness))
const labelSigma = computed(() => '$\\sigma$')
const labelFexc = computed(
  () => `$f_{\\mathrm{exc}} = ${props.excitationFreq}\\,\\mathrm{Hz}$`,
)
</script>

<style scoped>
.mech-diagram { @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50; }
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .pipe-wall { fill: rgba(148,163,184,0.2); stroke: #64748b; stroke-width: 2; }
.mech-diagram__svg .pipe-flow { fill: rgba(64,158,255,0.25); stroke: #409eff; stroke-width: 1; }
.mech-diagram__svg .pipe-flange { fill: rgba(100,116,139,0.35); stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .plate { fill: rgba(148,163,184,0.18); stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .plate-edge { fill: rgba(100,116,139,0.45); stroke: #64748b; stroke-width: 1.5; }
.mech-diagram__svg .plate-pin { fill: #64748b; }
.mech-diagram__svg .plate-clamp { fill: #334155; }
.dark .mech-diagram__svg .plate-clamp { fill: #94a3b8; }
.dark .mech-diagram__svg .plate-pin { fill: #cbd5e1; }
.mech-diagram__svg .base { fill: #64748b; }
.mech-diagram__svg .base-line { stroke: #cbd5e1; stroke-width: 1; }
.mech-diagram__svg .mass { fill: rgba(64,158,255,0.35); stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .dim-primary { stroke: #409eff; stroke-width: 1.5; fill: none; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.2; fill: none; }
.mech-diagram__svg .txt, .mech-diagram__svg .txt-primary, .mech-diagram__svg .txt-muted { font-family: system-ui, sans-serif; }
.mech-diagram__svg .txt { fill: #334155; }
.mech-diagram__svg .txt-primary { fill: #409eff; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.dark .mech-diagram__svg .txt { fill: #e2e8f0; }
.dark .mech-diagram__svg .base-line { stroke: #475569; }
</style>
