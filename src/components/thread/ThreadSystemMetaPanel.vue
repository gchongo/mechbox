<template>
  <section v-if="system" class="thread-system-meta">
    <h3 class="thread-system-meta__title">{{ ts('name') }}</h3>

    <template v-if="useMetaCollapse">
      <IsoMetricThreadProfileDiagram />

      <el-collapse class="thread-meta-collapse mt-4">
        <el-collapse-item :title="pt('metaOpenDrawer')" name="meta">
          <dl class="meta-dl">
            <div v-for="row in metaRows" :key="row.key">
              <dt>
                <ThreadFieldTip v-if="row.tip" :label="row.label" :tip="row.tip" />
                <template v-else>{{ row.label }}</template>
              </dt>
              <dd :class="{ 'text-warning': row.warn }">{{ row.value }}</dd>
            </div>
          </dl>
        </el-collapse-item>
      </el-collapse>
    </template>

    <dl v-else class="meta-dl">
      <div v-for="row in metaRows" :key="row.key">
        <dt>
          <ThreadFieldTip v-if="row.tip" :label="row.label" :tip="row.tip" />
          <template v-else>{{ row.label }}</template>
        </dt>
        <dd :class="{ 'text-warning': row.warn }">{{ row.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getThreadSystemDef } from '@/constants/thread-standards/taxonomy'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'
import IsoMetricThreadProfileDiagram from '@/components/thread/IsoMetricThreadProfileDiagram.vue'

const props = defineProps({
  systemId: { type: String, required: true },
  pt: { type: Function, required: true },
})

const system = computed(() => getThreadSystemDef(props.systemId))

const useMetaCollapse = computed(() =>
  props.systemId === 'metric_coarse' || props.systemId === 'metric_fine',
)

function ts(field) {
  const key = `ts_${props.systemId}_${field}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : '—'
}

function formatGb(s) {
  return s.gbStandard || props.pt('metaGb_none')
}

function formatIntlStandards(s) {
  if (!s.standards?.length) return props.pt('metaStandards_none')
  return s.standards.join(' · ')
}

function formatAngle(s) {
  if (s.angleLabel) return s.angleLabel
  if (s.angle != null) return `${s.angle}°`
  return props.pt('metaStandards_none')
}

function formatTaperRatio(s) {
  if (s.taperRatio) return s.taperRatio
  return props.pt('enum_taperRatio_none')
}

function formatUnit(s) {
  if (s.unit === 'mm') return props.pt('enum_unit_mm')
  if (s.unit === 'in') return props.pt('enum_unit_in')
  if (s.unit === 'mm_in') return props.pt('enum_unit_mm_in')
  return props.pt('enum_unit_none')
}

function formatPitchNotation(s) {
  if (!s.pitchNotation) return props.pt('metaStandards_none')
  return props.pt(`enum_pitch_${s.pitchNotation}`)
}

function formatMarkingExample(s) {
  return s.markingExample || props.pt('metaMarking_none')
}

const metaRows = computed(() => {
  const s = system.value
  if (!s) return []
  const rows = [
    {
      key: 'purpose',
      label: props.pt('metaField_purpose'),
      tip: props.pt('term_purpose'),
      value: props.pt(`enum_purpose_${s.purpose}`),
    },
    {
      key: 'family',
      label: props.pt('metaField_family'),
      value: (() => {
        const key = `family_${s.family}`
        const v = props.pt(key)
        return v !== `calc.pages.thread-table.${key}` ? v : s.family || '—'
      })(),
    },
    { key: 'gb', label: props.pt('metaField_gb'), value: formatGb(s) },
    {
      key: 'standards',
      label: props.pt('metaField_intlStandards'),
      tip: props.pt('term_standard'),
      value: formatIntlStandards(s),
    },
    {
      key: 'angle',
      label: props.pt('metaField_angle'),
      tip: props.pt('term_threadAngle'),
      value: formatAngle(s),
    },
    { key: 'taperRatio', label: props.pt('metaField_taperRatio'), value: formatTaperRatio(s) },
    { key: 'unit', label: props.pt('metaField_unit'), value: formatUnit(s) },
    { key: 'pitchNotation', label: props.pt('metaField_pitchNotation'), value: formatPitchNotation(s) },
    { key: 'use', label: props.pt('metaField_use'), value: ts('use') },
    { key: 'markingExample', label: props.pt('metaField_markingExample'), value: formatMarkingExample(s) },
    { key: 'marking', label: props.pt('metaField_marking'), value: ts('marking') },
    {
      key: 'profile',
      label: props.pt('metaField_profile'),
      tip: props.pt('term_profile'),
      value: props.pt(`enum_profile_${s.profile}`),
    },
    {
      key: 'parentShape',
      label: props.pt('metaField_parentShape'),
      tip: props.pt('term_parentShape'),
      value: props.pt(`enum_shape_${s.parentShape}`),
    },
    {
      key: 'taper',
      label: props.pt('metaField_taper'),
      tip: props.pt('term_taper'),
      value: props.pt(`enum_taper_${s.taper}`),
    },
    {
      key: 'sealing',
      label: props.pt('metaField_sealing'),
      tip: props.pt('term_sealing'),
      value: props.pt(`enum_seal_${s.sealing}`),
    },
    {
      key: 'hand',
      label: props.pt('metaField_hand'),
      tip: props.pt('term_hand'),
      value: s.hand.map((h) => props.pt(`enum_hand_${h}`)).join(' · '),
    },
    {
      key: 'starts',
      label: props.pt('metaField_starts'),
      tip: props.pt('term_starts'),
      value: s.starts.map((st) => props.pt(`enum_starts_${st}`)).join(' · '),
    },
    { key: 'nominal', label: props.pt('metaField_nominal'), value: ts('nominal') },
    { key: 'pitch', label: props.pt('metaField_pitch'), value: ts('pitch') },
    { key: 'tolerance', label: props.pt('metaField_tolerance'), value: ts('tolerance') },
    { key: 'interchange', label: props.pt('metaField_interchange'), value: ts('interchange') },
    {
      key: 'misconfig',
      label: props.pt('metaField_misconfig'),
      value: ts('misconfig'),
      warn: true,
    },
  ]
  return rows
})
</script>

<style scoped>
.thread-system-meta__title {
  @apply mb-3 text-base font-semibold text-gray-900 dark:text-gray-100;
}

.thread-meta-collapse {
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;
  border-color: var(--el-border-color-lighter);
}
.thread-meta-collapse :deep(.el-collapse-item__header) {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.thread-meta-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 12px;
  color: var(--el-text-color-regular);
}
.thread-meta-collapse :deep(.el-collapse-item__wrap) {
  background-color: transparent;
}

.meta-dl {
  display: grid;
  gap: 0.45rem;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .meta-dl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 2rem;
    row-gap: 0.45rem;
  }
}

.meta-dl > div {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 0.75rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 0.35rem;
}
.meta-dl dt {
  color: var(--el-text-color-secondary);
}
.meta-dl dd {
  color: var(--el-text-color-primary);
}
.meta-dl dd.text-warning {
  color: #f39c12;
}
</style>
