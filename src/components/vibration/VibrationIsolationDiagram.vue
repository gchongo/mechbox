<template>
  <div class="mech-diagram">
    <header class="mech-diagram__head">
      <h3 class="mech-diagram__title">{{ title }}</h3>
      <p class="mech-diagram__hint">{{ hint }}</p>
    </header>

    <svg class="mech-diagram__svg" viewBox="0 0 420 220" role="img" :aria-label="aria">
      <defs>
        <marker id="vib-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
        </marker>
      </defs>

      <!-- machine mass -->
      <rect x="120" y="36" width="180" height="48" rx="4" class="mass" />
      <text x="210" y="66" text-anchor="middle" class="txt" font-size="13">{{ massLabel }}</text>

      <!-- mounts -->
      <g v-if="styleKind === 'pad'">
        <rect x="140" y="108" width="50" height="28" rx="3" class="mount" />
        <rect x="230" y="108" width="50" height="28" rx="3" class="mount" />
      </g>
      <g v-else-if="styleKind === 'conical'">
        <polygon points="155,108 185,108 175,140 165,140" class="mount" />
        <polygon points="235,108 265,108 255,140 245,140" class="mount" />
      </g>
      <g v-else>
        <rect x="150" y="100" width="28" height="40" rx="10" class="mount" />
        <rect x="242" y="100" width="28" height="40" rx="10" class="mount" />
      </g>

      <!-- base -->
      <rect x="80" y="152" width="260" height="18" rx="2" class="base" />
      <text x="210" y="166" text-anchor="middle" class="txt-muted" font-size="11">{{ baseLabel }}</text>

      <!-- deflection dim -->
      <line x1="320" y1="84" x2="320" y2="152" class="dim" marker-start="url(#vib-arrow)" marker-end="url(#vib-arrow)" />
      <text x="330" y="122" class="txt-primary" font-size="11">δ</text>

      <text x="20" y="200" class="txt-muted" font-size="11">{{ kLabel }}</text>
      <text x="20" y="214" class="txt-muted" font-size="11">{{ loadLabel }}</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCalcPage } from '@/composables/useCalcPage'

const props = defineProps({
  mountStyle: { type: String, default: 'cylindrical' },
  stiffness: { type: Number, default: 20000 },
  loadPerMountKg: { type: Number, default: 12.5 },
  staticDeflectionMm: { type: Number, default: 2 },
})

const { pf, pr } = useCalcPage('vibration-isolation')

const styleKind = computed(() => props.mountStyle || 'cylindrical')
const title = computed(() => pf('diagramTitle'))
const hint = computed(() => pf('diagramHint'))
const aria = computed(() => pf('diagramAria'))
const massLabel = computed(() => pr('diagramMass'))
const baseLabel = computed(() => pr('diagramBase'))
const kLabel = computed(() => `k ≈ ${Math.round(props.stiffness)} N/m`)
const loadLabel = computed(
  () =>
    `${pr('loadPerMount')}: ${props.loadPerMountKg.toFixed(1)} kg · δ≈${props.staticDeflectionMm.toFixed(2)} mm`,
)
</script>

<style scoped>
.mech-diagram {
  margin-top: 1rem;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 0.75rem;
}
.mech-diagram__title {
  font-size: 0.875rem;
  font-weight: 600;
}
.mech-diagram__hint {
  margin: 0.25rem 0 0.5rem;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
}
.mech-diagram__svg {
  width: 100%;
  max-width: 420px;
  color: var(--el-text-color-primary);
}
.mass {
  fill: #e0f2fe;
  stroke: #0284c7;
  stroke-width: 1.5;
}
.dark .mass {
  fill: #0c4a6e;
}
.mount {
  fill: #fde68a;
  stroke: #d97706;
  stroke-width: 1.5;
}
.base {
  fill: #e2e8f0;
  stroke: #64748b;
  stroke-width: 1.2;
}
.dark .base {
  fill: #334155;
}
.dim {
  stroke: #409eff;
  stroke-width: 1.4;
}
.txt {
  fill: currentColor;
}
.txt-muted {
  fill: #64748b;
}
.txt-primary {
  fill: #409eff;
}
</style>
