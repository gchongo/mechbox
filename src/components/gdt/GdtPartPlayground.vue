<template>
  <div class="gdt-part">
    <p class="mb-2 text-sm text-gray-500">{{ hint }}</p>
    <svg class="gdt-part__svg" viewBox="0 0 400 240" role="img" :aria-label="aria">
      <rect x="70" y="55" width="260" height="130" rx="4" class="body" />
      <rect x="70" y="185" width="260" height="14" class="datum" />
      <circle cx="210" cy="118" r="28" class="hole" />
      <circle cx="210" cy="118" r="18" class="hole-inner" />

      <g v-for="f in features" :key="f.id" class="cursor-pointer" @click="emit('update:modelValue', f.id)">
        <circle :cx="f.x" :cy="f.y" r="16" class="hotspot" :class="{ active: modelValue === f.id }" />
        <text :x="f.x" :y="f.y + 4" text-anchor="middle" class="hot-lbl">
          {{ locale === 'en' ? f.labelEn.slice(0, 1) : f.labelZh.slice(0, 1) }}
        </text>
      </g>

      <text x="200" y="28" text-anchor="middle" class="title">{{ title }}</text>
      <text x="200" y="222" text-anchor="middle" class="datum-lbl">A</text>
    </svg>

    <div v-if="active" class="mt-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <p class="font-medium">{{ locale === 'en' ? active.labelEn : active.labelZh }}</p>
      <p class="mt-1 text-sm text-gray-500">{{ active.hintZh }}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <el-button
          v-for="s in suggested"
          :key="s.id"
          size="small"
          @click="emit('pick-symbol', s.id)"
        >
          {{ s.glyph }} {{ locale === 'en' ? s.nameEn : s.nameZh }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { GDT_PART_FEATURES, findGdtSymbol } from '@/constants/gdt-symbols'

const props = defineProps({
  modelValue: { type: String, default: '' },
  locale: { type: String, default: 'zh' },
  title: { type: String, default: '' },
  hint: { type: String, default: '' },
  aria: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'pick-symbol'])

const features = GDT_PART_FEATURES

const active = computed(() => GDT_PART_FEATURES.find((f) => f.id === props.modelValue) ?? null)

const suggested = computed(() =>
  (active.value?.suggestIds ?? []).map((id) => findGdtSymbol(id)).filter(Boolean),
)
</script>

<style scoped>
.gdt-part__svg {
  width: 100%;
  max-width: 420px;
  display: block;
  margin: 0 auto;
}
.body {
  fill: #1e293b;
  stroke: #94a3b8;
  stroke-width: 1.5;
}
.datum {
  fill: #0ea5e9;
  opacity: 0.35;
}
.hole {
  fill: #0f172a;
  stroke: #94a3b8;
}
.hole-inner {
  fill: #020617;
  stroke: none;
}
.hotspot {
  fill: rgba(64, 158, 255, 0.25);
  stroke: #409eff;
  stroke-width: 2;
  transition: fill 0.15s;
}
.hotspot.active {
  fill: rgba(64, 158, 255, 0.55);
}
.hot-lbl {
  fill: #e2e8f0;
  font-size: 11px;
  font-weight: 600;
  pointer-events: none;
}
.title,
.datum-lbl {
  fill: #94a3b8;
  font-size: 12px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
