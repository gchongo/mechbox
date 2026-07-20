<template>
  <section class="thread-overview">
    <header class="mb-4">
      <h2 class="text-lg font-semibold">{{ pt('overviewTitle') }}</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ pt('overviewHint') }}</p>
    </header>

    <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
      <el-input
        v-model="query"
        clearable
        class="max-w-md flex-1"
        :placeholder="pt('overviewSearch')"
        prefix-icon="Search"
      />
      <el-select v-model="purposeFilter" class="w-40">
        <el-option :label="pt('overviewFilterAll')" value="all" />
        <el-option
          v-for="p in purposeOrder"
          :key="p"
          :label="pt(`cat_${p}`)"
          :value="p"
        />
      </el-select>
      <span class="text-sm text-gray-500">{{ pt('overviewRowCount', { n: filtered.length, total: rows.length }) }}</span>
    </div>

    <div class="thread-overview__table-wrap">
      <el-table
        :data="filtered"
        stripe
        border
        size="small"
        class="thread-overview__table"
        :empty-text="pt('overviewEmpty')"
        @row-click="onRowClick"
      >
        <el-table-column :label="pt('overviewColCategory')" prop="purposeLabel" min-width="96" fixed />
        <el-table-column :label="pt('overviewColFamily')" prop="familyLabel" min-width="120" />
        <el-table-column :label="pt('overviewColName')" prop="name" min-width="150" fixed />
        <el-table-column :label="pt('overviewColGb')" prop="gb" min-width="130" />
        <el-table-column :label="pt('overviewColIntl')" prop="intl" min-width="160" show-overflow-tooltip />
        <el-table-column :label="pt('overviewColAngle')" prop="angle" width="100" />
        <el-table-column :label="pt('overviewColUnit')" prop="unit" width="72" />
        <el-table-column :label="pt('overviewColUse')" prop="use" min-width="140" show-overflow-tooltip />
        <el-table-column :label="pt('overviewColMarking')" prop="marking" min-width="120" />
      </el-table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  THREAD_PURPOSE_ORDER,
  listThreadSystemOverviewRows,
} from '@/constants/thread-standards/taxonomy'

const props = defineProps({
  pt: { type: Function, required: true },
})

const emit = defineEmits(['navigate'])

const query = ref('')
const purposeFilter = ref('all')
const purposeOrder = THREAD_PURPOSE_ORDER

function tsName(systemId) {
  const key = `ts_${systemId}_name`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : systemId
}

function tsUse(systemId) {
  const key = `ts_${systemId}_use`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : '—'
}

function formatGb(s) {
  return s.gbStandard || props.pt('metaGb_none')
}

function formatIntl(s) {
  if (!s.standards?.length) return props.pt('metaStandards_none')
  return s.standards.join(', ')
}

function formatAngle(s) {
  if (s.angleLabel) return s.angleLabel
  if (s.angle != null) return `${s.angle}°`
  return props.pt('metaStandards_none')
}

function formatUnit(s) {
  if (s.unit === 'mm') return props.pt('enum_unit_mm')
  if (s.unit === 'in') return props.pt('enum_unit_in')
  if (s.unit === 'mm_in') return props.pt('enum_unit_mm_in')
  return props.pt('enum_unit_none')
}

function formatMarking(s) {
  return s.markingExample || props.pt('metaMarking_none')
}

function familyLabel(familyId) {
  if (!familyId) return '—'
  const key = `family_${familyId}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : familyId
}

const rows = computed(() =>
  listThreadSystemOverviewRows().map((s) => ({
    id: s.id,
    purpose: s.purpose,
    purposeLabel: props.pt(`cat_${s.purpose}`),
    familyLabel: familyLabel(s.family),
    name: tsName(s.id),
    gb: formatGb(s),
    intl: formatIntl(s),
    angle: formatAngle(s),
    unit: formatUnit(s),
    use: tsUse(s.id),
    marking: formatMarking(s),
    searchBlob: [
      tsName(s.id),
      formatGb(s),
      formatIntl(s),
      tsUse(s.id),
      formatMarking(s),
      props.pt(`cat_${s.purpose}`),
      familyLabel(s.family),
    ]
      .join(' ')
      .toLowerCase(),
  })),
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (purposeFilter.value !== 'all' && row.purpose !== purposeFilter.value) return false
    if (!q) return true
    return row.searchBlob.includes(q)
  })
})

function onRowClick(row) {
  emit('navigate', { purpose: row.purpose, systemId: row.id })
}
</script>

<style scoped>
.thread-overview__table-wrap {
  overflow-x: auto;
}

.thread-overview__table :deep(.el-table__row) {
  cursor: pointer;
}

.thread-overview__table :deep(.el-table__row:hover) {
  background-color: rgb(64 158 255 / 0.06);
}
</style>
