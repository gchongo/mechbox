<template>
  <section v-if="system" class="thread-system-meta">
    <h3 class="mb-3 text-base font-semibold">{{ ts('name') }}</h3>

    <dl class="meta-dl">
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_purpose')" :tip="pt('term_purpose')" /></dt>
        <dd>{{ pt(`enum_purpose_${system.purpose}`) }}</dd>
      </div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_profile')" :tip="pt('term_profile')" /></dt>
        <dd>{{ pt(`enum_profile_${system.profile}`) }}</dd>
      </div>
      <div v-if="system.angle != null">
        <dt><ThreadFieldTip :label="pt('metaField_angle')" :tip="pt('term_threadAngle')" /></dt>
        <dd>{{ system.angle }}°</dd>
      </div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_parentShape')" :tip="pt('term_parentShape')" /></dt>
        <dd>{{ pt(`enum_shape_${system.parentShape}`) }}</dd>
      </div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_taper')" :tip="pt('term_taper')" /></dt>
        <dd>{{ pt(`enum_taper_${system.taper}`) }}</dd>
      </div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_sealing')" :tip="pt('term_sealing')" /></dt>
        <dd>{{ pt(`enum_seal_${system.sealing}`) }}</dd>
      </div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_hand')" :tip="pt('term_hand')" /></dt>
        <dd>{{ system.hand.map((h) => pt(`enum_hand_${h}`)).join(' · ') }}</dd>
      </div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_starts')" :tip="pt('term_starts')" /></dt>
        <dd>{{ system.starts.map((s) => pt(`enum_starts_${s}`)).join(' · ') }}</dd>
      </div>
      <div><dt>{{ pt('metaField_marking') }}</dt><dd>{{ ts('marking') }}</dd></div>
      <div><dt>{{ pt('metaField_nominal') }}</dt><dd>{{ ts('nominal') }}</dd></div>
      <div><dt>{{ pt('metaField_pitch') }}</dt><dd>{{ ts('pitch') }}</dd></div>
      <div><dt>{{ pt('metaField_tolerance') }}</dt><dd>{{ ts('tolerance') }}</dd></div>
      <div><dt>{{ pt('metaField_use') }}</dt><dd>{{ ts('use') }}</dd></div>
      <div><dt>{{ pt('metaField_interchange') }}</dt><dd>{{ ts('interchange') }}</dd></div>
      <div><dt>{{ pt('metaField_misconfig') }}</dt><dd class="text-warning">{{ ts('misconfig') }}</dd></div>
      <div>
        <dt><ThreadFieldTip :label="pt('metaField_standards')" :tip="pt('term_standard')" /></dt>
        <dd>{{ system.standards.join(' · ') }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { getThreadSystemDef } from '@/constants/thread-standards/taxonomy'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'

const props = defineProps({
  systemId: { type: String, required: true },
  pt: { type: Function, required: true },
})

const system = computed(() => getThreadSystemDef(props.systemId))

function ts(field) {
  const key = `ts_${props.systemId}_${field}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : '—'
}
</script>

<style scoped>
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
</style>
