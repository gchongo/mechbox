<template>
  <div class="thread-compare-panel">
    <div class="mb-4">
      <span class="mr-2 text-sm">{{ pt('comparePresets') }}</span>
      <el-button
        v-for="preset in presets"
        :key="preset.id"
        size="small"
        @click="applyPreset(preset)"
      >
        {{ presetLabel(preset.id) }}
      </el-button>
    </div>

    <div class="mb-4 flex flex-wrap items-end gap-3">
      <el-select
        v-model="pickId"
        filterable
        clearable
        class="min-w-[200px]"
        :placeholder="pt('comparePickPlaceholder')"
      >
        <el-option-group v-for="grp in optionGroups" :key="grp.label" :label="grp.label">
          <el-option
            v-for="row in grp.rows"
            :key="row.id"
            :label="row.designation"
            :value="row.id"
            :disabled="selectedIds.includes(row.id)"
          />
        </el-option-group>
      </el-select>
      <el-button type="primary" plain :disabled="!pickId" @click="addPick">{{ pt('compareAdd') }}</el-button>
      <el-button v-if="selectedIds.length" @click="clearAll">{{ pt('compareClear') }}</el-button>
    </div>

    <div v-if="selectedRows.length" class="mb-4 flex flex-wrap gap-2">
      <el-tag
        v-for="row in selectedRows"
        :key="row.id"
        closable
        @close="removeRow(row.id)"
      >
        {{ row.designation }}
      </el-tag>
    </div>

    <el-alert
      v-if="selectedRows.length < 2"
      type="info"
      :closable="false"
      show-icon
      :title="pt('compareNeedTwo')"
    />

    <div v-else>
      <div class="compare-table-wrap">
        <table class="compare-table border-collapse text-sm">
          <thead>
            <tr>
              <th class="compare-th compare-th--field">{{ pt('compareField') }}</th>
              <th v-for="row in matrix.rows" :key="row.id" class="compare-th">{{ row.designation }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in matrix.fields" :key="field.key" :class="{ 'compare-diff': field.isDiff }">
              <td class="compare-td compare-label compare-td--field">{{ pt(`cmp_${field.key}`) }}</td>
              <td v-for="(val, i) in field.values" :key="i" class="compare-td">{{ formatCell(field.key, val) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <el-alert
        v-if="hasPipeMix"
        class="mt-4"
        type="warning"
        :closable="false"
        show-icon
        :title="pt('pipeCompatibilityWarn')"
      />
      <el-alert
        v-if="hasNptNptfMix"
        class="mt-4"
        type="warning"
        :closable="false"
        show-icon
        :title="pt('compareWarnNptNptf')"
      />
      <el-alert
        v-if="hasUnifiedPitchMix"
        class="mt-4"
        type="info"
        :closable="false"
        show-icon
        :title="pt('compareWarnUnifiedPitch')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAllThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import { getUnsReferenceRows } from '@/constants/thread-standards/uns-data'
import { getWhitworthReferenceRows } from '@/constants/thread-standards/whitworth-data'
import {
  buildCompareMatrix,
  getComparePresets,
  findRowById,
} from '@/utils/thread-standards'

const props = defineProps({
  pt: { type: Function, required: true },
  modelValue: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const pickId = ref('')
const selectedIds = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const allRows = getAllThreadRows()
const presets = getComparePresets()

const optionGroups = computed(() => {
  const catalog = THREAD_SYSTEMS.map((sys) => ({
    label: props.pt(`system_${sys.id}`) !== `calc.pages.thread-table.system_${sys.id}`
      ? props.pt(`system_${sys.id}`)
      : sys.id,
    rows: sys.subTabs.flatMap((t) => t.rows),
  }))
  return [
    ...catalog,
    {
      label: props.pt('system_uns') !== 'calc.pages.thread-table.system_uns'
        ? props.pt('system_uns')
        : 'UNS',
      rows: getUnsReferenceRows(),
    },
    {
      label: props.pt('whSeriesAll'),
      rows: getWhitworthReferenceRows('all'),
    },
  ]
})

const selectedRows = computed(() =>
  selectedIds.value.map((id) => findRowById(id)).filter(Boolean),
)

const matrix = computed(() => buildCompareMatrix(selectedRows.value))

const hasPipeMix = computed(() => {
  const systems = new Set(selectedRows.value.map((r) => r.system))
  return systems.has('npt') && (systems.has('g') || systems.has('r'))
})

const hasNptNptfMix = computed(() => {
  const systems = new Set(selectedRows.value.map((r) => r.system))
  return systems.has('npt') && systems.has('nptf')
})

const hasUnifiedPitchMix = computed(() => {
  const unified = selectedRows.value.filter((r) => ['unc', 'unf', 'unef'].includes(r.system))
  if (unified.length < 2) return false
  const nominals = new Set(unified.map((r) => r.nominal))
  const series = new Set(unified.map((r) => r.system))
  return nominals.size === 1 && series.size > 1
})

watch(
  () => props.modelValue,
  (ids) => {
    if (ids.length > 3) emit('update:modelValue', ids.slice(0, 3))
  },
)

function addPick() {
  if (!pickId.value || selectedIds.value.includes(pickId.value)) return
  if (selectedIds.value.length >= 3) return
  emit('update:modelValue', [...selectedIds.value, pickId.value])
  pickId.value = ''
}

function removeRow(id) {
  emit(
    'update:modelValue',
    selectedIds.value.filter((x) => x !== id),
  )
}

function clearAll() {
  emit('update:modelValue', [])
}

function applyPreset(preset) {
  emit('update:modelValue', preset.rowIds.slice(0, 3))
}

function presetLabel(id) {
  const map = {
    'pipe-half': 'preset_pipeHalf',
    'metric-m10': 'preset_metricM10',
    'un-quarter': 'preset_unQuarter',
    'un-quarter-series': 'preset_unQuarterSeries',
    'pipe-npt-nptf': 'preset_pipeNptNptf',
    'tr-drive': 'preset_trDrive',
    'power-tr-acme': 'preset_powerTrAcme',
    'whitworth-quarter': 'preset_whitworthQuarter',
  }
  return props.pt(map[id] ?? id)
}

function formatCell(key, val) {
  if (key === 'sealing' && val && val !== '—') {
    const k = props.pt(`sealing_${val}`)
    return k !== `calc.pages.thread-table.sealing_${val}` ? k : val
  }
  if (key === 'interchangeable') {
    return props.pt(`cmpInterchange_${val}`)
  }
  if (key === 'system') {
    const k = props.pt(`system_${val}`)
    return k !== `calc.pages.thread-table.system_${val}` ? k : val
  }
  return val
}
</script>

<style scoped>
.compare-table {
  border: 1px solid var(--el-border-color);
  table-layout: auto;
  width: max-content;
  max-width: 100%;
}
.compare-table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.compare-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}

.compare-th,
.compare-td {
  border: 1px solid var(--el-border-color-lighter);
  padding: 0.5rem 0.75rem;
  text-align: center;
  white-space: nowrap;
}

.compare-th--field,
.compare-td--field {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: left;
  min-width: 7.5rem;
  background: var(--el-bg-color);
  box-shadow: 1px 0 0 var(--el-border-color-lighter);
}

.compare-table thead .compare-th--field {
  z-index: 3;
  background: var(--el-fill-color-light);
}

.compare-th {
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.compare-label {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.compare-diff {
  background: rgb(255 251 230 / 0.5);
}

.compare-diff .compare-td--field {
  background: rgb(255 251 230 / 0.85);
}

:root.dark .compare-diff {
  background: rgb(120 90 0 / 0.15);
}

:root.dark .compare-diff .compare-td--field {
  background: rgb(120 90 0 / 0.22);
}

.compare-td {
  font-variant-numeric: tabular-nums;
  min-width: 5.5rem;
}
</style>
