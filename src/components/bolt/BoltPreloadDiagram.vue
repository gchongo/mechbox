<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>

    <svg class="mech-diagram__svg" viewBox="0 0 480 280" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="bp-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="bp-arr-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
      </defs>

      <!-- 被夹紧件：加宽加高，占满主区 -->
      <rect :x="px" :y="py1" :width="pw" :height="ph" rx="3" class="plate" />
      <rect :x="px" :y="py2" :width="pw" :height="ph" rx="3" class="plate" />

      <!-- 孔径 -->
      <rect :x="cx - hw / 2" :y="py1" :width="hw" :height="grip" fill="none" class="hole" />

      <!-- 螺栓 -->
      <rect :x="cx - sw / 2" :y="headB" :width="sw" :height="shankH" rx="2" class="shank" />
      <polygon :points="headPts" class="head" />
      <polygon :points="nutPts" class="nut" />
      <ellipse :cx="cx" :cy="headB" :rx="hrx" ry="6" class="friction" />

      <rect
        v-if="showVdi"
        :x="cx - sw / 2 - 2"
        :y="nutT - 28"
        :width="sw + 4"
        :height="26"
        rx="2"
        class="thread-zone"
      />

      <!-- F -->
      <line
        :x1="cx - sw / 2 - 18"
        :y1="fY1"
        :x2="cx - sw / 2 - 18"
        :y2="fY2"
        class="force"
        marker-start="url(#bp-arr-blue)"
        marker-end="url(#bp-arr-blue)"
      />
      <SvgMathText
        :x="cx - sw / 2 - 34"
        :y="(fY1 + fY2) / 2 + 5"
        text="F"
        anchor="end"
        color="#409eff"
        :width="20"
        :font-size="15"
      />

      <!-- T -->
      <template v-if="showTorque">
        <path :d="torqueArc" fill="none" class="torque" marker-end="url(#bp-arr-blue)" />
        <SvgMathText :x="cx + hrx + 12" :y="headB - 12" text="T" color="#409eff" :width="18" :font-size="15" />
      </template>

      <!-- d -->
      <line
        :x1="cx - sw / 2"
        :y1="dY"
        :x2="cx + sw / 2"
        :y2="dY"
        class="dim"
        marker-start="url(#bp-arr)"
        marker-end="url(#bp-arr)"
      />
      <SvgMathText :x="cx" :y="dY - 6" text="d" anchor="middle" color="#64748b" :width="16" :font-size="14" />

      <SvgMathText
        :x="cx + hrx + 10"
        :y="headB + 16"
        :text="calcMode === 'simple' ? 'μ' : 'μ_K'"
        color="#e6a23c"
        :width="32"
        :font-size="13"
      />

      <SvgMathText
        v-if="showVdi"
        :x="cx + sw / 2 + 10"
        :y="nutT - 10"
        text="μ_G"
        color="#409eff"
        :width="32"
        :font-size="12"
      />

      <template v-if="showPro">
        <line
          :x1="px + pw + 20"
          :y1="py1"
          :x2="px + pw + 20"
          :y2="py1 + grip"
          class="dim-pro"
          marker-start="url(#bp-arr)"
          marker-end="url(#bp-arr)"
        />
        <SvgMathText :x="px + pw + 26" :y="py1 + grip / 2 + 5" text="L_K" color="#8b5cf6" :width="32" :font-size="13" />
      </template>

      <!-- 螺纹放大：右上角小块 -->
      <g transform="translate(378, 28)">
        <rect x="0" y="0" width="88" height="52" rx="5" class="inset-box" />
        <text x="44" y="13" class="txt-muted" font-size="9" text-anchor="middle">{{ dt('threadZoom') }}</text>
        <path :d="threadPath" fill="none" class="thread-profile" />
        <SvgMathText :x="44" :y="46" text="P" anchor="middle" color="#64748b" :width="14" :font-size="11" />
      </g>

      <!-- 底栏数值：铺满宽度 -->
      <rect x="12" y="232" width="456" height="38" rx="6" class="value-panel" />
      <SvgMathText
        v-for="(row, i) in barRows"
        :key="row.key"
        :x="22 + i * barStep"
        :y="257"
        :text="row.text"
        :color="row.color"
        :width="barStep - 6"
        :font-size="12"
      />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('boltPreload')

const props = defineProps({
  calcMode: { type: String, default: 'simple' },
  mode: { type: String, default: 'torque2force' },
  diameter: { type: Number, default: 10 },
  pitch: { type: Number, default: 1.5 },
  gripLength: { type: Number, default: 20 },
  holeDiameter: { type: Number, default: 11 },
  headContactDiameter: { type: Number, default: 15 },
  outerDiameter: { type: Number, default: 43 },
  dKm: { type: Number, default: 14.5 },
  deltaT: { type: Number, default: 0 },
  frictionCoeff: { type: Number, default: 0.2 },
  muG: { type: Number, default: 0.12 },
  muK: { type: Number, default: 0.12 },
  torque: { type: Number, default: 0 },
  preload: { type: Number, default: 0 },
})

const showVdi = computed(() => props.calcMode === 'vdi2230' || props.calcMode === 'professional')
const showPro = computed(() => props.calcMode === 'professional')
const showTorque = computed(() => props.mode === 'torque2force')

/** 主装配区放大：板宽约满画布中部 */
const cx = 230
const px = 70
const pw = 320
const ph = 28
const grip = 96
const py1 = 72
const py2 = py1 + ph + 10

const sw = computed(() => Math.min(Math.max(props.diameter * 1.8, 22), 36))
const hw = computed(() => Math.min(Math.max(sw.value + 14, 36), 52))
const hrx = computed(() => Math.min(Math.max(sw.value * 1.6, 30), 44))

const headB = py1
const headT = py1 - 30
const nutT = py1 + grip
const shankH = computed(() => nutT + 22 - headB)

const headPts = computed(() => {
  const r = hrx.value
  return `${cx - r},${headB} ${cx + r},${headB} ${cx + r - 7},${headT} ${cx - r + 7},${headT}`
})
const nutPts = computed(() => {
  const r = sw.value * 1.15
  const b = nutT + 22
  return `${cx - r},${nutT} ${cx + r},${nutT} ${cx + r + 6},${b} ${cx - r - 6},${b}`
})

const fY1 = headB + 26
const fY2 = nutT - 14
const dY = headB + 16

const torqueArc = computed(() => {
  const r = hrx.value + 10
  return `M ${cx + r * 0.2} ${headB - 8} A ${r} ${r} 0 0 1 ${cx + r * 0.92} ${headB + 10}`
})

const pitchPx = computed(() => Math.min(Math.max(props.pitch * 6, 10), 18))
const threadPath = computed(() => {
  const p = pitchPx.value
  const y = 30
  let d = `M 10 ${y}`
  for (let i = 0; i < 3; i++) {
    const x = 10 + i * p
    d += ` L ${x + p * 0.35} ${y - 7} L ${x + p} ${y}`
  }
  return d
})

function fmt(v, digits = 1) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toFixed(digits)
}

const barRows = computed(() => {
  const rows = [
    { key: 'd', text: `$d=${fmt(props.diameter, 0)}\\,\\mathrm{mm}$`, color: '#64748b' },
    { key: 'P', text: `$P=${fmt(props.pitch)}\\,\\mathrm{mm}$`, color: '#64748b' },
  ]
  if (showTorque.value) {
    rows.push({
      key: 'T',
      text: props.torque > 0 ? `$T=${fmt(props.torque, 0)}\\,\\mathrm{N\\cdot m}$` : '$T$',
      color: '#409eff',
    })
  } else {
    rows.push({
      key: 'F',
      text: props.preload > 0 ? `$F=${fmt(props.preload / 1000, 1)}\\,\\mathrm{kN}$` : '$F$',
      color: '#409eff',
    })
  }
  if (props.calcMode === 'simple') {
    rows.push({ key: 'mu', text: `$\\mu=${fmt(props.frictionCoeff, 2)}$`, color: '#e6a23c' })
  } else {
    rows.push({ key: 'muG', text: `$\\mu_G=${fmt(props.muG, 2)}$`, color: '#409eff' })
    rows.push({ key: 'muK', text: `$\\mu_K=${fmt(props.muK, 2)}$`, color: '#e6a23c' })
  }
  if (showPro.value) {
    rows.push({ key: 'lk', text: `$L_K=${fmt(props.gripLength, 0)}\\,\\mathrm{mm}$`, color: '#8b5cf6' })
  }
  return rows.slice(0, 6)
})

const barStep = computed(() => Math.floor(440 / Math.max(barRows.value.length, 1)))

const hintText = computed(() => {
  if (props.calcMode === 'simple') return dt('hintSimple')
  if (showPro.value) return dt('hintPro')
  return dt('hintVdi')
})
</script>

<style scoped>
.mech-diagram {
  @apply mt-5 rounded-lg border border-gray-200 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-2; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-0.5 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg {
  @apply w-full;
  min-height: 220px;
}

.mech-diagram__svg .plate { fill: #dbe4ee; stroke: #94a3b8; stroke-width: 1.2; }
.dark .mech-diagram__svg .plate { fill: #334155; stroke: #64748b; }
.mech-diagram__svg .shank { fill: #6b7c8f; }
.dark .mech-diagram__svg .shank { fill: #94a3b8; }
.mech-diagram__svg .head,
.mech-diagram__svg .nut { fill: #3f4f63; }
.dark .mech-diagram__svg .head,
.dark .mech-diagram__svg .nut { fill: #64748b; }
.mech-diagram__svg .hole {
  stroke: #94a3b8;
  stroke-width: 1.6;
  stroke-dasharray: 5 3;
}
.mech-diagram__svg .friction {
  fill: none;
  stroke: #e6a23c;
  stroke-width: 2.4;
}
.mech-diagram__svg .thread-zone {
  fill: rgba(64, 158, 255, 0.14);
  stroke: #409eff;
  stroke-width: 1.4;
}
.mech-diagram__svg .force { stroke: #409eff; stroke-width: 2.4; fill: none; }
.mech-diagram__svg .torque { stroke: #409eff; stroke-width: 2; }
.mech-diagram__svg .dim { stroke: #64748b; stroke-width: 1.4; fill: none; }
.mech-diagram__svg .dim-pro { stroke: #8b5cf6; stroke-width: 1.4; fill: none; }
.mech-diagram__svg .value-panel,
.mech-diagram__svg .inset-box {
  fill: rgba(255, 255, 255, 0.95);
  stroke: #e2e8f0;
  stroke-width: 1;
}
.dark .mech-diagram__svg .value-panel,
.dark .mech-diagram__svg .inset-box {
  fill: rgba(15, 23, 42, 0.92);
  stroke: #334155;
}
.mech-diagram__svg .thread-profile { stroke: #64748b; stroke-width: 1.6; }
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
</style>
