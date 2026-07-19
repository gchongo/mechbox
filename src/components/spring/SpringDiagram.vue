<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>

    <svg
      class="mech-diagram__svg"
      viewBox="0 0 480 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      :aria-label="dt('aria')"
    >
      <defs>
        <marker id="spr-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="spr-arr-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="spr-arr-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 上支承 -->
      <g class="support">
        <template v-if="topFixed">
          <rect :x="plateX" :y="topY - 6" :width="plateW" height="8" rx="1" class="end-plate" />
          <g class="fixed-hatch" stroke="#64748b" stroke-width="1">
            <line
              v-for="(h, i) in topHatches"
              :key="'th-' + i"
              :x1="h.x1"
              :y1="h.y1"
              :x2="h.x2"
              :y2="h.y2"
            />
          </g>
        </template>
        <template v-else>
          <rect :x="cx - seatW / 2" :y="topY - 2" :width="seatW" height="5" rx="1" class="end-plate" />
          <circle :cx="cx" :cy="topY - 8" r="5" class="pivot-pin" />
          <path :d="topPivotSeat" class="pivot-seat" />
        </template>
      </g>

      <!-- 动态弹簧中心线 -->
      <path
        :d="coilPath"
        fill="none"
        stroke="#409eff"
        :stroke-width="strokeW"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- 下支承 -->
      <g class="support">
        <template v-if="botFixed">
          <rect :x="plateX" :y="botY - 2" :width="plateW" height="8" rx="1" class="end-plate" />
          <g class="fixed-hatch" stroke="#64748b" stroke-width="1">
            <line
              v-for="(h, i) in botHatches"
              :key="'bh-' + i"
              :x1="h.x1"
              :y1="h.y1"
              :x2="h.x2"
              :y2="h.y2"
            />
          </g>
        </template>
        <template v-else>
          <rect :x="cx - seatW / 2" :y="botY - 3" :width="seatW" height="5" rx="1" class="end-plate" />
          <circle :cx="cx" :cy="botY + 8" r="5" class="pivot-pin" />
          <path :d="botPivotSeat" class="pivot-seat" />
        </template>
      </g>

      <!-- 载荷 F -->
      <line
        :x1="cx"
        :y1="forceY0"
        :x2="cx"
        :y2="forceY1"
        stroke="#8b5cf6"
        stroke-width="2"
        marker-end="url(#spr-arr-violet)"
      />
      <SvgMathText :x="cx + 8" :y="forceLabelY" :text="labelF" color="#8b5cf6" :width="90" :font-size="12" />

      <!-- 支承说明 -->
      <text :x="16" :y="268" class="txt-muted" font-size="11">{{ endSupportLabel }}</text>

      <!-- 有效圈数 n -->
      <line
        :x1="nLineX"
        :y1="coilTop"
        :x2="nLineX"
        :y2="coilBot"
        class="dim"
        marker-start="url(#spr-arr)"
        marker-end="url(#spr-arr)"
      />
      <line :x1="nLineX - 5" :y1="coilTop" :x2="nLineX + 5" :y2="coilTop" class="ext-line" />
      <line :x1="nLineX - 5" :y1="coilBot" :x2="nLineX + 5" :y2="coilBot" class="ext-line" />
      <SvgMathText :x="nLineX - 8" :y="(coilTop + coilBot) / 2" :text="labelN" anchor="end" color="#64748b" :width="56" :font-size="12" />

      <!-- 线径 d：右线圈截面 -->
      <circle :cx="rightX" :cy="wireSampleY" :r="wireSampleR" class="wire-sample" />
      <line
        :x1="rightX"
        :y1="wireSampleY - wireSampleR"
        :x2="rightX"
        :y2="wireSampleY + wireSampleR"
        class="dim-primary"
        marker-start="url(#spr-arr-blue)"
        marker-end="url(#spr-arr-blue)"
      />
      <SvgMathText :x="rightX + wireSampleR + 6" :y="wireSampleY + 4" :text="labelD" color="#409eff" :width="72" :font-size="12" />

      <!-- 中径 D -->
      <line :x1="leftX" :y1="wireSampleY" :x2="leftX" :y2="dDimY" class="ext-line" />
      <line :x1="rightX" :y1="wireSampleY" :x2="rightX" :y2="dDimY" class="ext-line" />
      <line
        :x1="leftX"
        :y1="dDimY"
        :x2="rightX"
        :y2="dDimY"
        class="dim-primary"
        marker-start="url(#spr-arr-blue)"
        marker-end="url(#spr-arr-blue)"
      />
      <SvgMathText :x="cx" :y="dDimY + 16" :text="labelMeanD" anchor="middle" color="#409eff" :width="100" :font-size="12" />

      <!-- 自由高度 H₀ -->
      <template v-if="H0 != null">
        <line
          :x1="h0LineX"
          :y1="topY"
          :x2="h0LineX"
          :y2="botY"
          class="dim-primary"
          marker-start="url(#spr-arr-blue)"
          marker-end="url(#spr-arr-blue)"
        />
        <line :x1="h0LineX - 5" :y1="topY" :x2="h0LineX + 5" :y2="topY" class="ext-line" />
        <line :x1="h0LineX - 5" :y1="botY" :x2="h0LineX + 5" :y2="botY" class="ext-line" />
        <SvgMathText :x="h0LineX + 8" :y="(topY + botY) / 2" :text="labelH0" color="#409eff" :width="90" :font-size="12" />
      </template>

      <!-- 工作高度 H₂（完整模式）：自底向上按 H₂/H₀ 比例 -->
      <template v-if="showWorkingHeight">
        <line
          :x1="plateX"
          :y1="h2Y"
          :x2="plateX + plateW"
          :y2="h2Y"
          stroke="#e6a23c"
          stroke-width="1.2"
          stroke-dasharray="4 3"
        />
        <SvgMathText :x="plateX + plateW + 4" :y="h2Y + 4" :text="labelH2" color="#e6a23c" :width="80" :font-size="11" />
      </template>
    </svg>

    <dl class="mech-diagram__params">
      <div class="mech-diagram__param">
        <dt><MathContent text="$d$" /></dt>
        <dd>{{ formatMm(wireDiameter) }}</dd>
      </div>
      <div v-if="outerDiameter" class="mech-diagram__param">
        <dt><MathContent text="$D_2$" /></dt>
        <dd>{{ formatMm(outerDiameter) }}</dd>
      </div>
      <div class="mech-diagram__param">
        <dt><MathContent text="$D$" /></dt>
        <dd>{{ formatMm(meanDiameter) }}</dd>
      </div>
      <div class="mech-diagram__param">
        <dt><MathContent text="$n$" /></dt>
        <dd>{{ formatCoils(activeCoils) }}</dd>
      </div>
      <div v-if="totalCoils" class="mech-diagram__param">
        <dt><MathContent text="$n_t$" /></dt>
        <dd>{{ formatCoils(totalCoils) }}</dd>
      </div>
      <div v-if="freeLength" class="mech-diagram__param">
        <dt><MathContent text="$H_0$" /></dt>
        <dd>{{ formatMm(freeLength) }}</dd>
      </div>
      <div v-if="installHeight" class="mech-diagram__param">
        <dt><MathContent text="$H_1$" /></dt>
        <dd>{{ formatMm(installHeight) }}</dd>
      </div>
      <div v-if="workingHeight" class="mech-diagram__param">
        <dt><MathContent text="$H_2$" /></dt>
        <dd>{{ formatMm(workingHeight) }}</dd>
      </div>
      <div v-if="load > 0" class="mech-diagram__param">
        <dt><MathContent text="$F$" /></dt>
        <dd>{{ formatN(load) }}</dd>
      </div>
      <div v-if="showEndType" class="mech-diagram__param">
        <dt>{{ dt('endLabel') }}</dt>
        <dd>{{ endSupportLabel }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MathContent from '@/components/common/MathContent.vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm, dl } = useDiagramI18n('spring')

const props = defineProps({
  wireDiameter: { type: Number, default: 3 },
  meanDiameter: { type: Number, default: 24 },
  outerDiameter: { type: Number, default: 0 },
  activeCoils: { type: Number, default: 8 },
  totalCoils: { type: Number, default: 0 },
  freeLength: { type: Number, default: 0 },
  installHeight: { type: Number, default: 0 },
  workingHeight: { type: Number, default: 0 },
  load: { type: Number, default: 0 },
  /** fixed | free | rotating — 稳定性支承条件 */
  endType: { type: String, default: 'fixed' },
  showEndType: { type: Boolean, default: false },
})

const cx = 210
const plotTop = 48
const plotBot = 198
const maxHalfW = 55
const minHalfW = 22
const seatW = 36

const d = computed(() => Math.max(props.wireDiameter || 1, 0.2))
const D = computed(() => Math.max(props.meanDiameter || 1, d.value * 2))
const n = computed(() => Math.max(props.activeCoils || 1, 1))
const H0 = computed(() => (props.freeLength > 0 ? props.freeLength : null))

/** free = 一端固支一端铰支；rotating = 两端铰支；fixed = 两端固支 */
const supportKind = computed(() => {
  if (props.endType === 'rotating') return 'rotating'
  if (props.endType === 'free' || props.endType === 'guided') return 'free'
  return 'fixed'
})
const topFixed = computed(() => supportKind.value === 'fixed' || supportKind.value === 'free')
const botFixed = computed(() => supportKind.value === 'fixed')
const endSupportLabel = computed(() => {
  if (supportKind.value === 'rotating') return dt('endRotating')
  if (supportKind.value === 'free') return dt('endFree')
  return dt('endFixed')
})

/** 旋绕比影响宽度：C = D/d，常见 4~12 */
const halfW = computed(() => {
  const C = D.value / d.value
  const t = Math.min(Math.max((C - 3) / 10, 0), 1)
  return minHalfW + t * (maxHalfW - minHalfW)
})

/** 高度随 H0 或按圈数估算 */
const springH = computed(() => {
  const avail = plotBot - plotTop
  if (H0.value != null) {
    // 相对参考 45 mm 自由高
    const t = Math.min(Math.max(H0.value / 60, 0.45), 1.15)
    return Math.min(avail, 110 * t)
  }
  const t = Math.min(Math.max(n.value / 12, 0.5), 1.2)
  return Math.min(avail, 100 * t)
})

const topY = computed(() => plotTop + (plotBot - plotTop - springH.value) / 2)
const botY = computed(() => topY.value + springH.value)
const coilTop = computed(() => topY.value + 8)
const coilBot = computed(() => botY.value - 8)

const leftX = computed(() => cx - halfW.value)
const rightX = computed(() => cx + halfW.value)
const plateW = computed(() => halfW.value * 2 + 80)
const plateX = computed(() => cx - plateW.value / 2)

function hatchLines(yPlate, upward) {
  const lines = []
  const y0 = upward ? yPlate - 6 : yPlate + 8
  const y1 = upward ? yPlate : yPlate + 14
  const x0 = plateX.value + 4
  const x1 = plateX.value + plateW.value - 4
  const nH = Math.max(6, Math.round(plateW.value / 12))
  for (let i = 0; i < nH; i++) {
    const t = i / (nH - 1 || 1)
    const x = x0 + t * (x1 - x0)
    lines.push({
      x1: x,
      y1: upward ? y1 : y0,
      x2: x - 5,
      y2: upward ? y0 : y1,
    })
  }
  return lines
}

const topHatches = computed(() => hatchLines(topY.value - 6, true))
const botHatches = computed(() => hatchLines(botY.value - 2, false))

const topPivotSeat = computed(() => {
  const y = topY.value - 14
  return `M ${cx - 12} ${y - 2} L ${cx} ${y + 8} L ${cx + 12} ${y - 2} Z`
})
const botPivotSeat = computed(() => {
  const y = botY.value + 14
  return `M ${cx - 12} ${y + 2} L ${cx} ${y - 8} L ${cx + 12} ${y + 2} Z`
})

const forceY0 = computed(() => (topFixed.value ? topY.value - 30 : topY.value - 38))
const forceY1 = computed(() => (topFixed.value ? topY.value - 8 : topY.value - 16))
const forceLabelY = computed(() => forceY0.value + 8)

const strokeW = computed(() => {
  // 线径相对中径的视觉粗细
  const ratio = d.value / D.value
  return Math.min(Math.max(2 + ratio * 18, 2.2), 7)
})

/** 显示圈数：实际 n 映射到 3.5~10 个可见半周期段 */
const displayCoils = computed(() => Math.min(Math.max(n.value, 3.5), 10))

const coilPath = computed(() => {
  const y0 = coilTop.value
  const y1 = coilBot.value
  const coils = displayCoils.value
  // 每圈两个拐点（左↔右），二次贝塞尔平滑
  const steps = Math.max(Math.round(coils * 2), 4)
  const L = leftX.value
  const R = rightX.value
  let dStr = `M ${L} ${y0}`
  for (let i = 1; i <= steps; i++) {
    const yPrev = y0 + ((i - 1) / steps) * (y1 - y0)
    const y = y0 + (i / steps) * (y1 - y0)
    const x = i % 2 === 0 ? L : R
    const xPrev = (i - 1) % 2 === 0 ? L : R
    const midY = (yPrev + y) / 2
    dStr += ` Q ${xPrev} ${midY} ${x} ${y}`
  }
  return dStr
})

const wireSampleR = computed(() => Math.min(Math.max(strokeW.value * 1.15, 5), 12))
const wireSampleY = computed(() => (coilTop.value + coilBot.value) / 2)
const nLineX = computed(() => leftX.value - 28)
const h0LineX = computed(() => rightX.value + 48)
const dDimY = computed(() => botY.value + 22)

const showWorkingHeight = computed(
  () => props.freeLength > 0 && props.workingHeight > 0 && props.workingHeight < props.freeLength,
)
/** 工作高度线：自底板上沿向上按 H₂/H₀ 比例 */
const h2Y = computed(() => {
  if (!showWorkingHeight.value) return botY.value
  return botY.value - (props.workingHeight / props.freeLength) * (botY.value - topY.value)
})

const labelF = computed(() => (props.load > 0 ? `$F = ${Number(props.load).toFixed(0)}\\,\\mathrm{N}$` : '$F$'))
const labelN = computed(() => `$n = ${formatCoils(n.value)}$`)
const labelD = computed(() => dl('d', Number(d.value.toFixed(d.value < 10 ? 2 : 1))))
const labelMeanD = computed(() => dl('D', Number(D.value.toFixed(D.value < 10 ? 2 : 1))))
const labelH0 = computed(() =>
  H0.value != null ? dl('H_0', Number(H0.value.toFixed(1))) : '$H_0$',
)
const labelH2 = computed(() => dl('H_2', Number(props.workingHeight.toFixed(1))))

const hintText = computed(() => {
  const base = {
    d: d.value.toFixed(d.value < 10 ? 2 : 1),
    D: D.value.toFixed(D.value < 10 ? 2 : 1),
    n: formatCoils(n.value),
    end: endSupportLabel.value,
  }
  if (H0.value != null) {
    return dt('hintWithH0', { ...base, H0: H0.value.toFixed(1) })
  }
  return dt('hint', base)
})

function formatMm(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  const decimals = value < 10 ? 2 : 1
  return `${value.toFixed(decimals)} mm`
}

function formatCoils(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatN(value) {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(value < 10 ? 1 : 0)} N`
}
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
  @apply mx-auto block w-full max-w-lg;
}

.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .end-plate {
  fill: #94a3b8;
  fill-opacity: 0.55;
  stroke: #64748b;
}
.mech-diagram__svg .pivot-pin {
  fill: #f8fafc;
  stroke: #64748b;
  stroke-width: 1.5;
}
.dark .mech-diagram__svg .pivot-pin { fill: #1e293b; }
.mech-diagram__svg .pivot-seat {
  fill: rgba(148, 163, 184, 0.45);
  stroke: #64748b;
  stroke-width: 1.2;
}

.mech-diagram__svg .wire-sample {
  fill: rgba(64, 158, 255, 0.25);
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

.mech-diagram__svg .ext-line {
  stroke: #94a3b8;
  stroke-width: 1;
  fill: none;
}

.mech-diagram__params {
  @apply mt-4 grid gap-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-700;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.mech-diagram__param {
  @apply flex flex-col gap-0.5 rounded-md bg-white/70 px-3 py-2 dark:bg-gray-800/60;
}

.mech-diagram__param dt {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.mech-diagram__param dd {
  @apply font-mono text-sm font-medium text-gray-800 dark:text-gray-100;
}
</style>
