<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-2">
      <el-select v-model="selectedId" size="small" class="!w-72">
        <el-option
          v-for="inv in preset.inverse"
          :key="inv.id"
          :label="inverseLabel(preset.toolId, inv.id, inv.label)"
          :value="inv.id"
        />
      </el-select>
      <el-button size="small" type="primary" @click="solve">{{ dt('solve') }}</el-button>
    </div>

    <div v-if="!result" class="rounded bg-gray-50 p-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
      {{ dt('emptyInverse') }}
    </div>

    <div v-else class="space-y-3">
      <el-alert
        v-if="!result.converged"
        type="warning"
        :closable="false"
        show-icon
        :title="dt('noSolutionTitle')"
        :description="dt('noSolutionDesc', { reason: reasonLabel(result.reason) })"
      />

      <div v-else-if="result.strategy === 'catalog'" class="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div class="text-xs uppercase tracking-wide text-primary">{{ dt('recommended') }}</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-primary">{{ result.solution }}</span>
          <span v-if="result.solutionRow?.C" class="text-xs text-gray-500">
            C={{ result.solutionRow.C }} N · C₀={{ result.solutionRow.C0 }} N
          </span>
        </div>
        <div class="mt-3">
          <el-table :data="result.candidates" size="small" border max-height="240">
            <el-table-column prop="model" :label="dt('model')" min-width="80" />
            <el-table-column prop="bore" :label="dt('bore')" width="70">
              <template #default="{ row }">{{ row.bore }} mm</template>
            </el-table-column>
            <el-table-column prop="C" label="C (N)" width="90" />
            <el-table-column prop="C0" label="C₀ (N)" width="90" />
            <el-table-column :label="dt('lifeHoursShort')" min-width="90">
              <template #default="{ row }">
                <span class="font-mono">{{ formatLife(row.lifeHours) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="dt('status')" width="60">
              <template #default="{ row }">
                <el-tag :type="row.pass ? 'success' : 'danger'" size="small" effect="plain">
                  {{ row.pass ? '✓' : '✗' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="applyable" :label="dt('pick')" width="80">
              <template #default="{ row }">
                <el-button
                  size="small"
                  :type="row.model === result.solution ? 'primary' : 'default'"
                  :disabled="!row.pass"
                  @click="applyCatalog(row)"
                >
                  {{ dt('pick') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div v-else class="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div class="text-xs uppercase tracking-wide text-primary">{{ dt('solution') }}</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-primary">
            {{ formatValue(result.solution) }}
          </span>
          <span class="text-sm text-gray-500">← {{ result.variable }}</span>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          {{ dt('iterations') }}: {{ result.iterations }}
        </div>
        <div v-if="result.candidates?.length" class="mt-3">
          <div class="mb-1 text-xs text-gray-500">{{ dt('candidatesTried') }}:</div>
          <div class="flex flex-wrap gap-1">
            <el-tag
              v-for="c in result.candidates"
              :key="c"
              size="small"
              :type="c === result.solution ? 'success' : 'info'"
              effect="plain"
            >
              {{ c }}
            </el-tag>
          </div>
        </div>
        <el-button
          v-if="applyable"
          class="mt-3"
          size="small"
          type="primary"
          plain
          @click="applySolution"
        >
          {{ dt('applyToForm') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { runPresetInverse } from '@/utils/decision-presets'
import { useDecisionI18n } from '@/composables/useDecisionI18n'

const props = defineProps({
  preset: { type: Object, required: true },
  baseInputs: { type: Object, required: true },
  applyable: { type: Boolean, default: true },
})

const emit = defineEmits(['apply'])
const { dt, inverseLabel, reasonLabel } = useDecisionI18n()

const selectedId = ref(props.preset.inverse[0]?.id ?? '')
const result = ref(null)

function solve() {
  const r = runPresetInverse(props.preset, selectedId.value, props.baseInputs)
  result.value = r
  if (!r.converged) {
    ElMessage.warning(dt('noSolutionTitle'))
  }
}

function applySolution() {
  if (!result.value?.converged) return
  emit('apply', { variable: result.value.variable, value: result.value.solution })
  ElMessage.success(dt('applied'))
}

function applyCatalog(row) {
  emit('apply', {
    variable: result.value.variable,
    value: row.model,
    row,
    strategy: 'catalog',
  })
  ElMessage.success(dt('applied'))
}

function formatValue(v) {
  if (v == null) return '-'
  if (typeof v !== 'number') return String(v)
  if (!Number.isFinite(v)) return '-'
  return Math.abs(v) >= 100 ? v.toFixed(1) : v.toFixed(3)
}

function formatLife(h) {
  if (h == null || !Number.isFinite(h)) return '∞'
  if (h >= 100000) return `${(h / 1000).toFixed(0)}k`
  if (h >= 10000) return `${(h / 1000).toFixed(1)}k`
  return h.toFixed(0)
}
</script>
