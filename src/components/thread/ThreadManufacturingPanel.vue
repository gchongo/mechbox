<template>
  <div class="thread-manufacturing-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('mfgIntro') }}</p>

    <el-steps direction="vertical" :active="4" finish-status="success" class="mb-6">
      <el-step v-for="step in workflowSteps" :key="step" :title="pt(`mfgStep_${step}`)" :description="pt(`mfgStep_${step}_desc`)" />
    </el-steps>

    <div class="grid gap-4 lg:grid-cols-2">
      <section class="card-panel">
        <h3 class="mb-3 font-semibold">{{ pt('mfgPipeTorqueTitle') }}</h3>
        <p class="mb-3 text-xs text-gray-500">{{ pt('mfgPipeTorqueNote') }}</p>
        <el-table :data="pipeTorqueRows" :fit="false" size="small" border stripe class="thread-data-table thread-sticky-header-table">
          <el-table-column :label="pt('colDesignation')" prop="size" />
          <el-table-column :label="pt('mfgTorqueRef')" prop="torqueKey">
            <template #default="{ row }">{{ pt(row.torqueKey) }}</template>
          </el-table-column>
          <el-table-column :label="pt('mfgSealant')" prop="sealKey">
            <template #default="{ row }">{{ pt(row.sealKey) }}</template>
          </el-table-column>
        </el-table>
      </section>

      <section class="card-panel">
        <h3 class="mb-3 font-semibold">{{ pt('mfgChecklistTitle') }}</h3>
        <ul class="list-inside list-decimal space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li v-for="key in checklistKeys" :key="key">{{ pt(key) }}</li>
        </ul>
        <el-alert class="mt-4" type="info" :closable="false" show-icon :title="pt('mfgIndependentNote')" />
      </section>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pt: { type: Function, required: true },
})

const workflowSteps = ['select', 'tolerance', 'engagement', 'tap', 'verify']

const pipeTorqueRows = [
  { size: '1/8 NPT', torqueKey: 'mfgTorque_18', sealKey: 'mfgSeal_tape' },
  { size: '1/4 NPT', torqueKey: 'mfgTorque_14', sealKey: 'mfgSeal_tape' },
  { size: '1/2 NPT', torqueKey: 'mfgTorque_12', sealKey: 'mfgSeal_tape' },
  { size: 'G1/2', torqueKey: 'mfgTorque_g', sealKey: 'mfgSeal_gasket' },
  { size: 'R1/2', torqueKey: 'mfgTorque_r', sealKey: 'mfgSeal_tape' },
]

const checklistKeys = [
  'mfgCheck_1',
  'mfgCheck_2',
  'mfgCheck_3',
  'mfgCheck_4',
  'mfgCheck_5',
  'mfgCheck_6',
]
</script>
