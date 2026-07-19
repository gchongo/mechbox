<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ dt('title') }}</h3>
      <p class="mech-diagram__hint"><MathContent :text="dm(hintText)" /></p>
    </header>
    <svg class="mech-diagram__svg" viewBox="0 0 480 310" role="img" :aria-label="dt('aria')">
      <defs>
        <marker id="key-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
        <marker id="key-arrow-blue" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#409EFF" />
        </marker>
        <marker id="key-arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6" />
        </marker>
      </defs>

      <!-- 左：径向截面 -->
      <text x="16" y="22" class="txt-muted" font-size="11">{{ dt('sectionView') }}</text>

      <circle :cx="cx" :cy="cy" :r="rHub" class="hub-ring" />
      <circle :cx="cx" :cy="cy" :r="rShaft" class="shaft-disk" />
      <!-- 键（截面矩形，顶部位于轴外缘） -->
      <rect :x="keySec.x" :y="keySec.y" :width="keySec.w" :height="keySec.h" rx="1" class="key-block" />

      <!-- 扭矩 T（截面上） -->
      <path :d="torqueArc" fill="none" stroke="#8b5cf6" stroke-width="1.8" marker-end="url(#key-arrow-violet)" />
      <SvgMathText :x="cx + rHub + 8" :y="cy - rHub * 0.55" text="T" color="#8b5cf6" :width="20" :font-size="12" />

      <!-- d -->
      <line
        :x1="cx - rShaft"
        :y1="cy + rHub + 14"
        :x2="cx + rShaft"
        :y2="cy + rHub + 14"
        class="dim-primary"
        marker-start="url(#key-arrow-blue)"
        marker-end="url(#key-arrow-blue)"
      />
      <SvgMathText :x="cx" :y="cy + rHub + 30" text="d" anchor="middle" color="#409eff" :width="20" :font-size="12" />

      <!-- b -->
      <line
        :x1="keySec.x"
        :y1="keySec.y - 10"
        :x2="keySec.x + keySec.w"
        :y2="keySec.y - 10"
        class="dim"
        marker-start="url(#key-arrow)"
        marker-end="url(#key-arrow)"
      />
      <SvgMathText :x="keySec.x + keySec.w / 2" :y="keySec.y - 14" text="b" anchor="middle" color="#64748b" :width="20" :font-size="12" />

      <!-- h -->
      <line
        :x1="keySec.x + keySec.w + 12"
        :y1="keySec.y"
        :x2="keySec.x + keySec.w + 12"
        :y2="keySec.y + keySec.h"
        class="dim"
        marker-start="url(#key-arrow)"
        marker-end="url(#key-arrow)"
      />
      <SvgMathText :x="keySec.x + keySec.w + 18" :y="keySec.y + keySec.h / 2 + 4" text="h" color="#64748b" :width="20" :font-size="12" />

      <text :x="cx" :y="cy + 4" class="txt-muted" font-size="10" text-anchor="middle">{{ dt('shaftPart') }}</text>
      <text :x="cx + rHub - 18" :y="cy - rHub + 16" class="txt-muted" font-size="10">{{ dt('hub') }}</text>

      <!-- 右：轴向示意（限制在固定槽宽内，L 再大也只缩放，不越界） -->
      <text :x="axLeft" y="22" class="txt-muted" font-size="11">{{ dt('axialView') }}</text>

      <rect :x="ax.hubX" :y="ax.hubY" :width="ax.hubW" :height="ax.hubH" rx="3" class="hub-block" />
      <rect :x="ax.shaftX" :y="ax.shaftY" :width="ax.shaftW" :height="ax.shaftH" rx="2" class="shaft-block" />
      <rect :x="ax.keyX" :y="ax.keyY" :width="ax.keyW" :height="ax.keyH" rx="1" class="key-block" />
      <text :x="ax.keyX + ax.keyW / 2" :y="ax.keyY + ax.keyH / 2 + 4" class="txt-key" font-size="10" text-anchor="middle">{{ dt('parallelKey') }}</text>

      <line
        :x1="ax.keyX"
        :y1="ax.lY"
        :x2="ax.keyX + ax.keyW"
        :y2="ax.lY"
        class="dim-primary"
        marker-start="url(#key-arrow-blue)"
        marker-end="url(#key-arrow-blue)"
      />
      <SvgMathText :x="ax.keyX + ax.keyW / 2" :y="ax.lY + 16" text="L" anchor="middle" color="#409eff" :width="20" :font-size="12" />

      <path :d="axialTorqueArc" fill="none" stroke="#8b5cf6" stroke-width="1.6" marker-end="url(#key-arrow-violet)" />
      <SvgMathText :x="ax.shaftX + 2" :y="ax.shaftY - 6" text="T" color="#8b5cf6" :width="18" :font-size="11" />

      <!-- 底部数值条：不遮挡轴向图 -->
      <rect x="16" y="262" width="448" height="36" rx="6" class="value-panel" />
      <SvgMathText :x="28" :y="286" :text="labelD" color="#409eff" :width="88" :font-size="12" />
      <SvgMathText :x="120" :y="286" :text="labelB" color="#64748b" :width="80" :font-size="12" />
      <SvgMathText :x="204" :y="286" :text="labelH" color="#64748b" :width="80" :font-size="12" />
      <SvgMathText :x="288" :y="286" :text="labelL" color="#409eff" :width="88" :font-size="12" />
      <SvgMathText v-if="torque > 0" :x="380" :y="286" :text="labelT" color="#8b5cf6" :width="80" :font-size="12" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDiagramI18n } from '@/composables/useDiagramI18n'

const { dt, dm } = useDiagramI18n('key')

const props = defineProps({
  shaftDiameter: { type: Number, default: 30 },
  keyWidth: { type: Number, default: 8 },
  keyLength: { type: Number, default: 28 },
  keyHeight: { type: Number, default: 7 },
  torque: { type: Number, default: 0 },
  hubLength: { type: Number, default: 0 },
})

const d = computed(() => Math.max(props.shaftDiameter || 1, 1))
const b = computed(() => Math.max(props.keyWidth || 1, 1))
const h = computed(() => Math.max(props.keyHeight || 1, 1))
const L = computed(() => Math.max(props.keyLength || 1, 1))
const hubL = computed(() => (props.hubLength > 0 ? props.hubLength : L.value))

const cx = 118
const cy = 128
const rShaft = computed(() => Math.min(Math.max(d.value * 1.6, 36), 58))
const rHub = computed(() => rShaft.value + 22)

const keySec = computed(() => {
  const kw = Math.min(Math.max(b.value * 2.4, 14), rShaft.value * 0.55)
  const kh = Math.min(Math.max(h.value * 2.2, 12), 28)
  // 键跨轴—毂分界面：约一半在轴内
  const y = cy - rShaft.value - kh * 0.35
  return {
    x: cx - kw / 2,
    y,
    w: kw,
    h: kh,
  }
})

const torqueArc = computed(() => {
  const r = rHub.value + 10
  const x0 = cx + r * 0.2
  const y0 = cy - r * 0.95
  const x1 = cx + r * 0.95
  const y1 = cy - r * 0.25
  return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`
})

/** 轴向视图固定槽：左边界 → 画布右缘，L/毂长只在槽内比例缩放 */
const axLeft = 248
const axRight = 464
const axAvail = axRight - axLeft

const ax = computed(() => {
  const shaftH = Math.min(Math.max(d.value * 1.1, 28), 44)
  const keyH = Math.min(Math.max(h.value * 1.8, 10), shaftH * 0.45)
  const hubH = shaftH + 28
  const hubY = 70
  // 轴两端各留 14px，轮毂与键按 L、毂长相对比例分配槽宽
  const pad = 14
  const shaftW = axAvail
  const shaftX = axLeft
  const ratio = hubL.value / Math.max(L.value, 1)
  const hubW = Math.min(shaftW - pad * 2, Math.max(52, (shaftW - pad * 2) * Math.min(ratio, 1.15) * 0.92))
  const keyW = Math.min(hubW - 12, Math.max(36, hubW * (L.value / Math.max(hubL.value, L.value))))
  const hubX = shaftX + (shaftW - hubW) / 2
  const shaftY = hubY + (hubH - shaftH) / 2
  const keyX = hubX + (hubW - keyW) / 2
  const keyY = shaftY - keyH * 0.55
  return {
    hubX,
    hubY,
    hubW,
    hubH,
    shaftX,
    shaftY,
    shaftW,
    shaftH,
    keyX,
    keyY,
    keyW,
    keyH,
    lY: shaftY + shaftH + 22,
  }
})

const axialTorqueArc = computed(() => {
  const x = ax.value.shaftX + 12
  const y = ax.value.shaftY + ax.value.shaftH / 2
  return `M ${x} ${y - 16} A 16 16 0 0 1 ${x + 14} ${y + 10}`
})

const labelD = computed(() => `$d = ${d.value}\\,\\mathrm{mm}$`)
const labelB = computed(() => `$b = ${b.value}\\,\\mathrm{mm}$`)
const labelH = computed(() => `$h = ${h.value}\\,\\mathrm{mm}$`)
const labelL = computed(() => `$L = ${L.value}\\,\\mathrm{mm}$`)
const labelT = computed(() => `$T = ${Math.round(props.torque)}\\,\\mathrm{N\\cdot m}$`)

const hintText = computed(() =>
  dt('hint', {
    d: d.value,
    b: b.value,
    h: h.value,
    L: L.value,
  }),
)
</script>

<style scoped>
.mech-diagram {
  @apply mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/50;
}
.mech-diagram__head { @apply mb-3; }
.mech-diagram__title { @apply text-sm font-semibold text-gray-800 dark:text-gray-100; }
.mech-diagram__hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.mech-diagram__svg { @apply w-full; }
.mech-diagram__svg .hub-ring {
  fill: rgba(148, 163, 184, 0.18);
  stroke: #94a3b8;
  stroke-width: 2;
}
.mech-diagram__svg .shaft-disk {
  fill: rgba(64, 158, 255, 0.22);
  stroke: #409eff;
  stroke-width: 2;
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
.mech-diagram__svg .key-block {
  fill: #f59e0b;
  fill-opacity: 0.88;
  stroke: #d97706;
  stroke-width: 1.5;
}
.mech-diagram__svg .txt-key { fill: #78350f; }
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
.mech-diagram__svg .txt-muted { fill: #94a3b8; }
.mech-diagram__svg .value-panel {
  fill: rgba(255, 255, 255, 0.92);
  stroke: #e2e8f0;
  stroke-width: 1;
}
.dark .mech-diagram__svg .value-panel {
  fill: rgba(15, 23, 42, 0.88);
  stroke: #334155;
}
</style>
