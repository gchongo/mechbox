<template>
  <div class="gdt-zone">
    <header class="mb-2 flex items-center justify-between gap-2">
      <h4 class="text-sm font-semibold">{{ title }}</h4>
      <span class="font-mono text-xs text-gray-500">t={{ localTol.toFixed(2) }}</span>
    </header>
    <svg class="gdt-zone__svg" viewBox="0 0 320 200" role="img" :aria-label="aria">
      <!-- 直线度：线要素在两平行线之间 -->
      <g v-if="sid === 'straightness'">
        <line x1="40" y1="70" x2="280" y2="70" class="zone" />
        <line x1="40" y1="130" x2="280" y2="130" class="zone" />
        <path :d="`M45 ${100 - wobble} L100 ${100 + wobble / 2} L180 ${100 - wobble} L275 ${100 + wobble / 3}`" class="actual" fill="none" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.straightness }}</text>
      </g>

      <!-- 平面度：面在两平行平面之间 -->
      <g v-else-if="sid === 'flatness'">
        <rect x="50" y="55" width="220" height="90" fill="none" stroke="#64748b" stroke-dasharray="4 3" />
        <line x1="50" :y1="100 - band" x2="270" :y2="100 - band" class="zone" />
        <line x1="50" :y1="100 + band" x2="270" :y2="100 + band" class="zone" />
        <path :d="`M60 ${100 - wobble} Q120 ${100 + wobble} 200 ${100 - wobble / 2} T260 ${100 + wobble / 3}`" class="actual" fill="none" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.flatness }}</text>
      </g>

      <!-- 圆度：截面两同心圆 -->
      <g v-else-if="sid === 'circularity'">
        <circle cx="160" cy="105" :r="55 + band" class="zone" fill="none" />
        <circle cx="160" cy="105" :r="55 - band" class="zone" fill="none" />
        <ellipse cx="160" cy="105" :rx="55" :ry="55 - wobble" class="actual" fill="none" transform="rotate(-20 160 105)" />
        <line x1="40" y1="105" x2="60" y2="105" stroke="#64748b" />
        <text x="28" y="108" class="lbl-sm">截面</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.circularity }}</text>
      </g>

      <!-- 圆柱度：全长两同轴圆柱（示意） -->
      <g v-else-if="sid === 'cylindricity'">
        <ellipse cx="80" cy="100" :rx="22 + band / 2" ry="42" class="zone" fill="none" />
        <ellipse cx="240" cy="100" :rx="22 + band / 2" ry="42" class="zone" fill="none" />
        <line x1="80" :y1="58 - band / 3" x2="240" :y2="58 - band / 3" class="zone" />
        <line x1="80" :y1="142 + band / 3" x2="240" :y2="142 + band / 3" class="zone" />
        <ellipse cx="80" cy="100" rx="18" ry="36" class="actual" fill="none" />
        <ellipse cx="240" cy="100" rx="20" :ry="36 - wobble / 2" class="actual" fill="none" />
        <line x1="80" y1="64" x2="240" :y2="64 + wobble / 2" class="actual" />
        <line x1="80" y1="136" x2="240" :y2="136 - wobble / 2" class="actual" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.cylindricity }}</text>
      </g>

      <!-- 线轮廓度：沿名义曲线的等距带（2D） -->
      <g v-else-if="sid === 'profile_line'">
        <path d="M40 140 Q100 40 160 100 T280 60" class="nominal" fill="none" />
        <path
          :d="offsetCurve(40, 140, 100, 40, 160, 100, 280, 60, band)"
          class="zone"
          fill="none"
        />
        <path
          :d="offsetCurve(40, 140, 100, 40, 160, 100, 280, 60, -band)"
          class="zone"
          fill="none"
        />
        <path
          :d="`M42 ${140 + wobble / 2} Q102 ${42 + wobble} 162 ${98 - wobble / 2} T278 ${62 + wobble / 3}`"
          class="actual"
          fill="none"
        />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.profile_line }}</text>
      </g>

      <!-- 面轮廓度：名义曲面 + 法向等距壳（示意网格） -->
      <g v-else-if="sid === 'profile_surface'">
        <path d="M50 150 Q100 50 160 90 T270 70 L270 150 Z" fill="rgba(100,116,139,0.15)" stroke="#64748b" />
        <path
          :d="`M50 ${150 - band} Q100 ${50 - band} 160 ${90 - band} T270 ${70 - band}`"
          class="zone"
          fill="none"
        />
        <path
          :d="`M50 ${150 + band} Q100 ${50 + band} 160 ${90 + band} T270 ${70 + band}`"
          class="zone"
          fill="none"
        />
        <path
          :d="`M55 ${148 + wobble / 2} Q105 ${55 - wobble} 165 ${92 + wobble / 3} T265 ${72 - wobble / 2}`"
          class="actual"
          fill="none"
        />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.profile_surface }}</text>
      </g>

      <!-- 平行度：相对基准面的平行带 -->
      <g v-else-if="sid === 'parallelism'">
        <rect x="40" y="155" width="240" height="14" class="datum-fill" />
        <text x="50" y="178" class="lbl-sm">A</text>
        <line x1="50" :y1="70 - band / 2" x2="270" :y2="70 - band / 2" class="zone" />
        <line x1="50" :y1="70 + band / 2" x2="270" :y2="70 + band / 2" class="zone" />
        <line x1="55" :y1="70 - wobble / 2" x2="265" :y2="70 + wobble / 2" class="actual" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.parallelism }}</text>
      </g>

      <!-- 垂直度：相对基准的垂直带 / 圆柱带示意 -->
      <g v-else-if="sid === 'perpendicularity'">
        <rect x="40" y="155" width="240" height="14" class="datum-fill" />
        <text x="50" y="178" class="lbl-sm">A</text>
        <rect :x="150 - band" y="45" :width="band * 2" height="110" fill="rgba(64,158,255,0.12)" stroke="#409eff" />
        <line x1="160" y1="50" x2="160" y2="150" stroke="#64748b" stroke-dasharray="3 2" />
        <line :x1="160 + wobble / 2" y1="52" :x2="160 - wobble / 2" y2="148" class="actual" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.perpendicularity }}</text>
      </g>

      <!-- 倾斜度：相对基准成角度的带 -->
      <g v-else-if="sid === 'angularity'">
        <rect x="40" y="155" width="240" height="14" class="datum-fill" />
        <text x="50" y="178" class="lbl-sm">A</text>
        <line x1="60" y1="150" x2="250" y2="55" stroke="#64748b" stroke-dasharray="4 2" />
        <line
          :x1="60"
          :y1="150 - band"
          :x2="250"
          :y2="55 - band"
          class="zone"
        />
        <line
          :x1="60"
          :y1="150 + band"
          :x2="250"
          :y2="55 + band"
          class="zone"
        />
        <line
          :x1="65"
          :y1="148 - wobble / 2"
          :x2="245"
          :y2="58 + wobble / 2"
          class="actual"
        />
        <text x="200" y="120" class="lbl-sm">∠</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.angularity }}</text>
      </g>

      <!-- 位置度：孔系相对基准的 Ø 圆柱带 -->
      <g v-else-if="sid === 'position'">
        <rect x="45" y="48" width="230" height="125" fill="none" stroke="#64748b" />
        <circle cx="110" cy="95" r="16" fill="none" stroke="#64748b" />
        <circle cx="220" cy="95" r="16" fill="none" stroke="#64748b" />
        <circle cx="110" cy="145" r="16" fill="none" stroke="#64748b" />
        <circle cx="220" cy="145" r="16" fill="none" stroke="#64748b" />
        <circle cx="110" cy="95" :r="8 + band / 2" fill="rgba(64,158,255,0.2)" stroke="#409eff" stroke-dasharray="3 2" />
        <circle :cx="224 + wobble / 3" :cy="95 - wobble / 3" r="3" fill="#f59e0b" />
        <text x="40" y="190" class="lbl-sm">A</text>
        <text x="280" y="190" class="lbl-sm">B</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.position }}</text>
      </g>

      <!-- 同轴度：相对基准轴线的同轴圆柱带 -->
      <g v-else-if="sid === 'concentricity'">
        <line x1="40" y1="100" x2="280" y2="100" stroke="#64748b" stroke-dasharray="4 2" />
        <text x="40" y="92" class="lbl-sm">基准轴 A</text>
        <ellipse cx="160" cy="100" :rx="band + 10" :ry="band + 10" fill="rgba(64,158,255,0.15)" stroke="#409eff" />
        <line
          x1="70"
          :y1="100 - wobble"
          x2="250"
          :y2="100 + wobble"
          class="actual"
          stroke-dasharray="5 3"
        />
        <circle cx="100" cy="100" r="28" fill="none" stroke="#64748b" opacity="0.5" />
        <circle cx="220" cy="100" r="28" fill="none" stroke="#64748b" opacity="0.5" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.concentricity }}</text>
      </g>

      <!-- 对称度：相对中心平面的对称带 -->
      <g v-else-if="sid === 'symmetry'">
        <rect x="70" y="50" width="180" height="110" fill="none" stroke="#64748b" />
        <line x1="160" y1="45" x2="160" y2="170" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="4 2" />
        <text x="168" y="42" class="lbl-sm">中心面</text>
        <rect :x="160 - band" y="70" :width="band * 2" height="70" fill="rgba(64,158,255,0.15)" stroke="#409eff" />
        <rect :x="100 + wobble / 2" y="85" width="40" height="40" fill="none" class="actual" />
        <rect :x="180 - wobble / 2" y="85" width="40" height="40" fill="none" class="actual" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.symmetry }}</text>
      </g>

      <!-- 圆跳动：单截面相对旋转基准 -->
      <g v-else-if="sid === 'circular_runout'">
        <line x1="40" y1="100" x2="280" y2="100" stroke="#64748b" stroke-dasharray="4 2" />
        <text x="40" y="92" class="lbl-sm">A</text>
        <circle cx="160" cy="100" r="48" fill="none" stroke="#64748b" />
        <circle cx="160" cy="100" :r="48 + band" class="zone" fill="none" stroke-dasharray="3 2" />
        <circle cx="160" cy="100" :r="48 - band" class="zone" fill="none" stroke-dasharray="3 2" />
        <circle :cx="160 + wobble / 2" cy="100" r="48" class="actual" fill="none" />
        <path d="M160 52 A48 48 0 0 1 208 100" fill="none" stroke="#f59e0b" stroke-width="3" opacity="0.7" />
        <text x="210" y="70" class="lbl-sm">单截面</text>
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.circular_runout }}</text>
      </g>

      <!-- 全跳动：全长扫掠带 -->
      <g v-else-if="sid === 'total_runout'">
        <line x1="40" y1="100" x2="280" y2="100" stroke="#64748b" stroke-dasharray="4 2" />
        <text x="40" y="92" class="lbl-sm">A</text>
        <ellipse cx="90" cy="100" rx="20" :ry="40 + band / 2" class="zone" fill="none" />
        <ellipse cx="230" cy="100" rx="20" :ry="40 + band / 2" class="zone" fill="none" />
        <line x1="90" :y1="60 - band / 2" x2="230" :y2="60 - band / 2" class="zone" stroke-dasharray="3 2" />
        <line x1="90" :y1="140 + band / 2" x2="230" :y2="140 + band / 2" class="zone" stroke-dasharray="3 2" />
        <ellipse cx="90" cy="100" rx="16" :ry="36 + wobble / 3" class="actual" fill="none" />
        <ellipse cx="230" cy="100" rx="16" :ry="36 - wobble / 3" class="actual" fill="none" />
        <line x1="90" :y1="64 + wobble / 3" x2="230" :y2="64 - wobble / 3" class="actual" />
        <text x="160" y="28" text-anchor="middle" class="lbl">{{ captions.total_runout }}</text>
      </g>

      <g v-else>
        <text x="160" y="100" text-anchor="middle" class="lbl">—</text>
      </g>
    </svg>
    <el-slider v-model="localTol" :min="0.02" :max="0.4" :step="0.01" :show-tooltip="true" />
    <p class="mt-1 text-xs text-gray-500">{{ hint || captions[sid] }}</p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  symbolId: { type: String, default: 'flatness' },
  tolerance: { type: Number, default: 0.1 },
  title: { type: String, default: '' },
  hint: { type: String, default: '' },
  aria: { type: String, default: 'Tolerance zone diagram' },
  /** 可选：覆盖各符号图内标题；缺省用内置中文 */
  captions: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:tolerance'])

const DEFAULT_CAPTIONS = {
  straightness: '两平行线之间（线要素）',
  flatness: '两平行平面之间（面要素）',
  circularity: '截面两同心圆之间',
  cylindricity: '两同轴圆柱面之间（全长）',
  profile_line: '沿名义曲线的等距带',
  profile_surface: '沿名义曲面的法向等距壳',
  parallelism: '相对基准 A 的平行带',
  perpendicularity: '相对基准 A 的垂直带',
  angularity: '相对基准 A 的倾斜带',
  position: '相对基准的 Ø 位置公差带',
  concentricity: '相对基准轴的同轴圆柱带',
  symmetry: '相对中心平面的对称带',
  circular_runout: '单截面跳动带（旋转）',
  total_runout: '全长扫掠跳动带（旋转）',
}

const captions = computed(() => ({ ...DEFAULT_CAPTIONS, ...props.captions }))
const sid = computed(() => props.symbolId || 'flatness')

const localTol = ref(props.tolerance)
watch(
  () => props.tolerance,
  (v) => {
    if (v !== localTol.value) localTol.value = v
  },
)
watch(localTol, (v) => emit('update:tolerance', v))

const band = computed(() => 6 + localTol.value * 40)
const wobble = computed(() => Math.min(band.value * 0.7, 14))

/** 简易二次曲线等距近似（示意用） */
function offsetCurve(x0, y0, cx, cy, mx, my, x1, y1, off) {
  const n = Math.sign(off) || 1
  const o = Math.abs(off) * n * 0.35
  return `M${x0} ${y0 + o} Q${cx} ${cy + o} ${mx} ${my + o} T${x1} ${y1 + o}`
}
</script>

<style scoped>
.gdt-zone__svg {
  width: 100%;
  max-width: 320px;
  display: block;
  margin: 0 auto;
}
.lbl {
  fill: #64748b;
  font-size: 11px;
}
.lbl-sm {
  fill: #409eff;
  font-size: 11px;
  font-weight: 600;
}
.zone {
  stroke: #409eff;
  stroke-width: 2;
  fill: none;
}
.actual {
  stroke: #f59e0b;
  stroke-width: 2;
  fill: none;
}
.nominal {
  stroke: #94a3b8;
  stroke-width: 1.5;
  stroke-dasharray: 4 3;
}
.datum-fill {
  fill: #0ea5e9;
  opacity: 0.35;
}
</style>
