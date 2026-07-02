<template>
  <div class="mb-6">
    <h3 class="mb-3 font-semibold">西格玛分析（质量水平）</h3>
    <el-table :data="rows" border size="small">
      <el-table-column prop="label" label="指标" />
      <el-table-column prop="value" label="数值" width="120" />
      <el-table-column prop="status" label="评价" width="140">
        <template #default="{ row }">
          <span :class="row.ok ? 'text-success' : 'text-warning'">{{ row.status }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  summary: { type: Object, required: true },
})

const rows = computed(() => {
  const s = props.summary
  const cpk = parseFloat(s.cpk)
  const sigma = parseFloat(s.sigmaLevel)
  return [
    {
      label: 'C 值 (C = T/6σ)',
      value: s.c,
      status: cpk > 1.33 ? '✓ 优秀 (>1.33)' : '一般',
      ok: cpk > 1.33,
    },
    {
      label: 'Cpk 值',
      value: s.cpk,
      status: cpk > 1.33 ? '✓ 优秀 (>1.33)' : '一般',
      ok: cpk > 1.33,
    },
    {
      label: '西格玛水平',
      value: `${s.sigmaLevel}σ`,
      status: sigma >= 4 ? '✓ 4 西格玛' : '待提升',
      ok: sigma >= 4,
    },
    {
      label: '合格率',
      value: s.passRate,
      status: '—',
      ok: true,
    },
    {
      label: 'DPPM',
      value: s.dppm,
      status: s.dppm < 100 ? '✓ 优秀 (<100)' : '一般',
      ok: s.dppm < 100,
    },
  ]
})
</script>
