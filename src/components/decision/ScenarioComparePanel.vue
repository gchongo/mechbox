<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <el-input
        v-model="draftName"
        size="small"
        :placeholder="dt('scenarioNamePlaceholder')"
        class="!w-40"
      />
      <el-button size="small" type="primary" :disabled="!snapshot" @click="onSave">
        {{ dt('saveCurrent') }}
      </el-button>
      <el-button size="small" @click="refresh">{{ dt('refresh') }}</el-button>
      <el-popconfirm :title="dt('confirmClear')" @confirm="clearAll">
        <template #reference>
          <el-button size="small" plain type="danger" :disabled="!scenarios.length">
            {{ dt('clearAll') }}
          </el-button>
        </template>
      </el-popconfirm>
    </div>

    <div v-if="!scenarios.length" class="rounded bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
      {{ dt('emptyScenarios') }}
    </div>

    <el-table v-else :data="tableRows" size="small" border stripe>
      <el-table-column prop="label" :label="dt('metric')" min-width="140" fixed />
      <el-table-column
        v-for="s in comparison.scenarios"
        :key="s.id"
        :label="s.name"
        min-width="140"
      >
        <template #header>
          <div class="flex flex-col items-start">
            <div class="flex items-center gap-1">
              <span class="font-semibold">{{ s.name }}</span>
              <el-tag v-if="s.id === comparison.baseId" size="small" type="info">
                {{ dt('base') }}
              </el-tag>
            </div>
            <div class="flex items-center gap-1 text-[10px] text-gray-400">
              <el-tag v-if="s.pass" size="small" type="success" effect="plain">✓</el-tag>
              <el-tag v-else size="small" type="danger" effect="plain">✗</el-tag>
              <el-button link type="danger" size="small" @click="onRemove(s.id)">
                {{ dt('remove') }}
              </el-button>
            </div>
          </div>
        </template>
        <template #default="{ row }">
          <div v-if="row.columns[s.id]" class="flex flex-col text-xs">
            <span class="font-mono text-sm" :class="statusClass(row.columns[s.id])">
              {{ formatValue(row.columns[s.id].value, row.unit) }}
            </span>
            <span
              v-if="row.columns[s.id].diffPercent != null && s.id !== comparison.baseId"
              class="text-[11px]"
              :class="diffClass(row.columns[s.id])"
            >
              Δ {{ formatDiff(row.columns[s.id].diffPercent) }}
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  listScenarios,
  saveScenario,
  removeScenario,
  clearScenarios,
  buildComparison,
} from '@/utils/scenario-compare'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

const props = defineProps({
  toolId: { type: String, required: true },
  snapshot: { type: Object, default: null },
})

const { dt } = useDecisionI18n()
const draftName = ref('')
const scenarios = ref([])

function refresh() {
  scenarios.value = listScenarios(props.toolId)
}

refresh()

watch(() => props.toolId, refresh)

const comparison = computed(() => buildComparison(scenarios.value))
const tableRows = computed(() => comparison.value.metrics)

function onSave() {
  if (!props.snapshot) return
  saveScenario(props.toolId, { name: draftName.value, snapshot: props.snapshot })
  draftName.value = ''
  refresh()
  ElMessage.success(dt('savedTip'))
}

function onRemove(id) {
  removeScenario(props.toolId, id)
  refresh()
}

function clearAll() {
  clearScenarios(props.toolId)
  refresh()
}

function formatValue(v, unit) {
  if (v == null) return '-'
  if (typeof v !== 'number') return `${v}${unit ? ' ' + unit : ''}`
  if (!Number.isFinite(v)) return '∞'
  const abs = Math.abs(v)
  const shown = abs >= 1000 ? v.toFixed(0) : abs >= 10 ? v.toFixed(1) : v.toFixed(3)
  return unit ? `${shown} ${unit}` : shown
}

function formatDiff(p) {
  if (p == null || !Number.isFinite(p)) return ''
  const sign = p > 0 ? '+' : ''
  return `${sign}${p.toFixed(1)}%`
}

function statusClass(col) {
  if (col.status === 'pass') return 'text-success'
  if (col.status === 'fail') return 'text-error'
  return ''
}

function diffClass(col) {
  if (col.improved === true) return 'text-success'
  if (col.improved === false) return 'text-error'
  return 'text-gray-400'
}
</script>
