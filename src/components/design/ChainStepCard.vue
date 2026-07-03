<template>
  <section class="card-panel">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <h3 class="font-semibold">{{ meta?.label ?? step.key }}</h3>
        <p class="text-xs text-gray-500">{{ meta?.toolId }}</p>
      </div>
      <el-tag :type="statusType">{{ statusLabel }}</el-tag>
    </div>

    <template v-if="snapshot">
      <dl class="space-y-2 text-sm">
        <div
          v-for="m in topMetrics"
          :key="m.key"
          class="flex items-baseline justify-between gap-2 rounded bg-gray-50 p-2 dark:bg-gray-900"
        >
          <span class="text-xs text-gray-500">{{ m.label }}</span>
          <span
            class="font-mono text-sm"
            :class="m.status === 'pass' ? 'text-success' : m.status === 'fail' ? 'text-error' : ''"
          >
            {{ formatValue(m.value) }}
            <span v-if="m.unit" class="text-xs text-gray-400"> {{ m.unit }}</span>
          </span>
        </div>
      </dl>

      <div v-if="snapshot.suggestions?.length" class="mt-3 rounded bg-warning/10 p-2 text-xs text-warning">
        <div v-for="(s, i) in snapshot.suggestions.slice(0, 2)" :key="i">• {{ s }}</div>
      </div>
    </template>

    <div class="mt-3">
      <el-input
        :model-value="step.notes"
        type="textarea"
        :rows="2"
        size="small"
        :placeholder="'笔记（可选）'"
        @update:model-value="$emit('update-notes', $event)"
      />
    </div>

    <el-button class="mt-3 w-full" size="small" plain @click="$emit('open-tool', meta?.toolId)">
      打开完整工具页 →
    </el-button>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  step: { type: Object, required: true },
  snapshot: { type: Object, default: null },
  meta: { type: Object, default: null },
})

defineEmits(['open-tool', 'update-notes'])

const topMetrics = computed(() => (props.snapshot?.keyMetrics ?? []).slice(0, 4))

const statusLabel = computed(() => {
  if (!props.snapshot) return '未评估'
  return props.snapshot.pass ? '通过 ✓' : '不通过 ✗'
})

const statusType = computed(() => {
  if (!props.snapshot) return 'info'
  return props.snapshot.pass ? 'success' : 'danger'
})

function formatValue(v) {
  if (v == null) return '-'
  if (typeof v !== 'number') return String(v)
  if (!Number.isFinite(v)) return '∞'
  const abs = Math.abs(v)
  return abs >= 1000 ? v.toFixed(0) : abs >= 10 ? v.toFixed(1) : v.toFixed(3)
}
</script>
