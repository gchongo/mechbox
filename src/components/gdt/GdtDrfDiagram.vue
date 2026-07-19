<template>
  <div class="gdt-drf">
    <svg class="gdt-drf__svg" viewBox="0 0 360 220" role="img" :aria-label="aria">
      <!-- part block -->
      <rect x="110" y="60" width="140" height="100" rx="3" class="body" />
      <!-- primary plane A (bottom) -->
      <rect
        x="100"
        y="160"
        width="160"
        height="12"
        class="dat"
        :class="{ on: !!primary }"
      />
      <text x="180" y="190" text-anchor="middle" class="lbl">A · {{ typeLabel(primary) }}</text>
      <!-- secondary B (back) -->
      <rect
        x="100"
        y="50"
        width="160"
        height="10"
        class="dat"
        :class="{ on: !!secondary }"
      />
      <text x="280" y="58" class="lbl">B</text>
      <!-- tertiary C (side) -->
      <rect
        x="250"
        y="60"
        width="10"
        height="100"
        class="dat"
        :class="{ on: !!tertiary }"
      />
      <text x="270" y="120" class="lbl">C</text>

      <!-- DOF chips -->
      <g v-for="(d, i) in dofChips" :key="d.id">
        <rect
          :x="16"
          :y="24 + i * 28"
          width="72"
          height="22"
          rx="4"
          :class="d.locked ? 'chip-on' : 'chip-off'"
        />
        <text :x="52" :y="39 + i * 28" text-anchor="middle" class="chip-t">{{ d.id }}</text>
      </g>

      <text x="180" y="24" text-anchor="middle" class="title">{{ title }}</text>
    </svg>
    <p class="mt-2 text-sm" :class="complete ? 'text-success' : 'text-warning'">{{ statusText }}</p>
    <p class="text-xs text-gray-500">{{ tip }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  primary: { type: String, default: 'plane' },
  secondary: { type: String, default: 'plane' },
  tertiary: { type: String, default: 'plane' },
  locked: { type: Number, default: 6 },
  remaining: { type: Number, default: 0 },
  complete: { type: Boolean, default: true },
  tip: { type: String, default: '' },
  title: { type: String, default: 'Datum reference frame' },
  aria: { type: String, default: '' },
  statusText: { type: String, default: '' },
  labels: {
    type: Object,
    default: () => ({ plane: '平面', axis: '轴线', point: '点', none: '无' }),
  },
})

function typeLabel(t) {
  if (!t) return props.labels.none
  return props.labels[t] || t
}

const dofChips = computed(() => {
  // Teaching order: lock first N of 6
  const names = ['Tx', 'Ty', 'Tz', 'Rx', 'Ry', 'Rz']
  return names.map((id, i) => ({ id, locked: i < props.locked }))
})
</script>

<style scoped>
.gdt-drf__svg {
  width: 100%;
  max-width: 360px;
  display: block;
  margin: 0 auto;
}
.body {
  fill: #1e293b;
  stroke: #94a3b8;
}
.dat {
  fill: #334155;
  stroke: #64748b;
  opacity: 0.45;
}
.dat.on {
  fill: #0ea5e9;
  opacity: 0.7;
  stroke: #38bdf8;
}
.lbl,
.title {
  fill: #94a3b8;
  font-size: 11px;
}
.chip-on {
  fill: #22c55e;
  opacity: 0.85;
}
.chip-off {
  fill: #475569;
  opacity: 0.7;
}
.chip-t {
  fill: #f8fafc;
  font-size: 11px;
  font-weight: 600;
}
</style>
