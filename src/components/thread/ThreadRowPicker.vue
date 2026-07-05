<template>
  <div class="thread-row-picker">
    <el-select
      :model-value="modelValue"
      filterable
      clearable
      class="w-full"
      :placeholder="placeholder || pt('rowPickPlaceholder')"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <el-option-group v-for="group in groups" :key="group.id" :label="group.label">
        <el-option
          v-for="row in group.rows"
          :key="row.id"
          :label="row.designation"
          :value="row.id"
        />
      </el-option-group>
    </el-select>
    <p v-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getAllThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'

const props = defineProps({
  modelValue: { type: String, default: '' },
  pt: { type: Function, required: true },
  systems: { type: Array, default: () => ['metric', 'unc', 'unf', 'unef'] },
  fastenerOnly: { type: Boolean, default: true },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const groups = computed(() => {
  const all = getAllThreadRows()
  return THREAD_SYSTEMS.filter((s) => props.systems.includes(s.id)).map((sys) => {
    let rows = sys.subTabs.flatMap((t) => t.rows)
    if (props.fastenerOnly) {
      rows = rows.filter((r) => ['metric', 'unc', 'unf', 'unef', 'tr', 'acme'].includes(r.system))
    }
    if (sys.id === 'metric') {
      rows = rows.filter((r) => r.priority === 1 || r.priority === 2).slice(0, 80)
    }
    return {
      id: sys.id,
      label: systemLabel(sys.id),
      rows,
    }
  }).filter((g) => g.rows.length)
})

function systemLabel(id) {
  const key = `system_${id}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : id.toUpperCase()
}
</script>
