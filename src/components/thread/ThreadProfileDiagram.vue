<template>
  <div class="thread-profile-diagram">
    <svg :viewBox="scene.viewBox" class="thread-profile-diagram__svg" role="img" :aria-label="aria">
      <defs>
        <marker id="thread-dim-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>

      <!-- 填充区：内/外螺纹 -->
      <path
        v-for="(region, i) in scene.regions"
        :key="`region-${i}`"
        :d="region.d"
        :fill="region.fill"
        :stroke="region.stroke"
        stroke-width="0.75"
        opacity="0.92"
      />

      <!-- 理论牙型（虚线） -->
      <path
        v-for="(ghost, i) in scene.ghosts"
        :key="`ghost-${i}`"
        :d="ghost"
        fill="none"
        stroke="currentColor"
        stroke-width="0.75"
        stroke-dasharray="4 3"
        class="thread-profile-diagram__ghost"
      />

      <!-- 螺距线（点划线） -->
      <line
        v-if="scene.pitchAxis"
        :x1="scene.pitchAxis.x1"
        :y1="scene.pitchAxis.y1"
        :x2="scene.pitchAxis.x2"
        :y2="scene.pitchAxis.y2"
        stroke="currentColor"
        stroke-width="0.85"
        stroke-dasharray="8 3 2 3"
        class="thread-profile-diagram__pitch-axis"
      />

      <!-- 锥度示意 -->
      <template v-if="scene.taper">
        <line
          :x1="scene.taper.x1"
          :y1="scene.taper.y1"
          :x2="scene.taper.x2"
          :y2="scene.taper.y2"
          stroke="currentColor"
          stroke-width="1"
          stroke-dasharray="6 4"
          class="thread-profile-diagram__taper"
        />
        <text
          :x="scene.taper.labelX"
          :y="scene.taper.labelY"
          class="thread-profile-diagram__taper-label"
        >
          {{ scene.taper.label }}
        </text>
      </template>

      <!-- 实际牙型轮廓 -->
      <path
        v-for="(profile, i) in scene.profiles"
        :key="`profile-${i}`"
        :d="profile.d"
        fill="none"
        :stroke="profile.stroke"
        :stroke-width="profile.width"
      />

      <!-- 滚珠 -->
      <circle
        v-for="(ball, i) in scene.circles ?? []"
        :key="`ball-${i}`"
        :cx="ball.cx"
        :cy="ball.cy"
        :r="ball.r"
        fill="var(--el-color-primary)"
        stroke="#374151"
        stroke-width="0.75"
      />

      <!-- 尺寸标注 -->
      <g v-for="(dim, i) in scene.dims" :key="`dim-${i}`" class="thread-profile-diagram__dim">
        <template v-if="dim.type === 'linear'">
          <line
            :x1="dim.x1"
            :y1="dim.y1"
            :x2="dim.x2"
            :y2="dim.y2"
            stroke="currentColor"
            stroke-width="0.85"
            marker-start="url(#thread-dim-arrow)"
            marker-end="url(#thread-dim-arrow)"
          />
          <text
            :x="dim.labelX"
            :y="dim.labelY"
            :text-anchor="dim.anchor ?? 'middle'"
            class="thread-profile-diagram__dim-text"
          >
            {{ dim.label }}
          </text>
        </template>
        <template v-else-if="dim.type === 'diameter'">
          <line :x1="dim.x1" :y1="dim.y" :x2="dim.x2" :y2="dim.y" stroke="currentColor" stroke-width="0.75" />
          <text :x="dim.labelX" :y="dim.labelY" class="thread-profile-diagram__dim-text" text-anchor="start">
            {{ dim.label }}
          </text>
        </template>
      </g>

      <!-- 牙型角 -->
      <g v-if="scene.angleMark" class="thread-profile-diagram__angle">
        <path
          :d="angleArcPath"
          fill="none"
          stroke="currentColor"
          stroke-width="0.85"
        />
        <line
          :x1="scene.angleMark.cx"
          :y1="scene.angleMark.cy"
          :x2="scene.angleMark.x1"
          :y2="scene.angleMark.y1"
          stroke="currentColor"
          stroke-width="0.75"
        />
        <line
          :x1="scene.angleMark.cx"
          :y1="scene.angleMark.cy"
          :x2="scene.angleMark.x2"
          :y2="scene.angleMark.y2"
          stroke="currentColor"
          stroke-width="0.75"
        />
        <text
          :x="scene.angleMark.labelX"
          :y="scene.angleMark.labelY"
          text-anchor="middle"
          class="thread-profile-diagram__dim-text"
        >
          {{ scene.angleMark.label }}
        </text>
      </g>

      <!-- 内/外螺纹区域文字 -->
      <text
        v-for="(lbl, i) in scene.labels"
        :key="`lbl-${i}`"
        :x="lbl.x"
        :y="lbl.y"
        class="thread-profile-diagram__region-label"
      >
        {{ lbl.text === 'internal' ? labels.internal : labels.external }}
      </text>

      <text x="280" y="22" text-anchor="middle" class="thread-profile-diagram__title">{{ title }}</text>
    </svg>

    <p class="thread-profile-diagram__formula">{{ formula }}</p>

    <!-- 选中规格时：表格参数对照 -->
    <dl v-if="scene.sampleParams?.length" class="thread-profile-diagram__sample">
      <div v-for="row in scene.sampleParams" :key="row.key" class="thread-profile-diagram__sample-row">
        <dt>{{ paramLabel(row.key) }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>
    <p v-else-if="paramHint" class="thread-profile-diagram__hint">{{ paramHint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { buildDetailedDiagram } from '@/utils/thread-profile-diagram'

const props = defineProps({
  /** @type {import('@/utils/thread-profile-diagram').ThreadDiagramKind} */
  kind: { type: String, default: 'triangular_60' },
  angle: { type: Number, default: 60 },
  title: { type: String, default: '' },
  formula: { type: String, default: 'H = 0.866025 P' },
  aria: { type: String, default: '' },
  labels: {
    type: Object,
    default: () => ({ external: '外螺纹', internal: '内螺纹' }),
  },
  /** @type {import('@/utils/thread-profile-diagram').DiagramSample|null} */
  sample: { type: Object, default: null },
  pt: { type: Function, default: null },
  paramHint: { type: String, default: '' },
})

const scene = computed(() =>
  buildDetailedDiagram(props.kind, { angle: props.angle, sample: props.sample }),
)

const angleArcPath = computed(() => {
  const m = scene.value.angleMark
  if (!m?.r) return ''
  const start = Math.atan2(m.y1 - m.cy, m.x1 - m.cx)
  const end = Math.atan2(m.y2 - m.cy, m.x2 - m.cx)
  const sx = m.cx + m.r * Math.cos(start)
  const sy = m.cy + m.r * Math.sin(start)
  const ex = m.cx + m.r * Math.cos(end)
  const ey = m.cy + m.r * Math.sin(end)
  return `M ${sx} ${sy} A ${m.r} ${m.r} 0 0 1 ${ex} ${ey}`
})

const PARAM_I18N = {
  designation: 'colDesignation',
  pitch: 'colTpiPitch',
  major: 'colMajor',
  pitchDia: 'colPitchDia',
  minor: 'colMinor',
  tapDrill: 'colTapDrill',
  toleranceExt: 'colToleranceExt',
  toleranceInt: 'colToleranceInt',
  taper: 'colTaper',
  sealing: 'colSealing',
  standard: 'colStandard',
}

function paramLabel(key) {
  const i18nKey = PARAM_I18N[key]
  if (props.pt && i18nKey) {
    const v = props.pt(i18nKey)
    if (v && !v.includes('calc.pages.thread-table')) return v
  }
  return key
}
</script>

<style scoped>
.thread-profile-diagram {
  --thread-diagram-internal: #d8ece8;
  --thread-diagram-external: #e4e8ec;
}

.dark .thread-profile-diagram {
  --thread-diagram-internal: rgb(30 70 64 / 0.45);
  --thread-diagram-external: rgb(55 65 81 / 0.55);
}

.thread-profile-diagram__svg {
  width: 100%;
  max-width: 36rem;
  color: var(--el-text-color-primary);
}

.thread-profile-diagram__ghost {
  color: rgb(156 163 175);
}

.thread-profile-diagram__pitch-axis {
  color: rgb(107 114 128);
}

.thread-profile-diagram__taper {
  color: rgb(217 119 6);
}

.thread-profile-diagram__taper-label {
  fill: currentColor;
  font-size: 10px;
  color: rgb(217 119 6);
}

.thread-profile-diagram__dim-text {
  fill: currentColor;
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.thread-profile-diagram__region-label {
  fill: currentColor;
  font-size: 11px;
  font-weight: 600;
  opacity: 0.75;
}

.thread-profile-diagram__title {
  fill: currentColor;
  font-size: 12px;
  font-weight: 600;
}

.thread-profile-diagram__formula {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
}

.thread-profile-diagram__hint {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 0.6875rem;
  color: var(--el-text-color-placeholder);
}

.thread-profile-diagram__sample {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.35rem 0.75rem;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 0.65rem;
  font-size: 0.6875rem;
}

.thread-profile-diagram__sample-row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.thread-profile-diagram__sample-row dt {
  color: var(--el-text-color-secondary);
}

.thread-profile-diagram__sample-row dd {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 500;
  word-break: break-all;
}
</style>
