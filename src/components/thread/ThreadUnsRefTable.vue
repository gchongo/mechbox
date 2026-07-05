<template>
  <section class="uns-ref-table min-w-0">
    <h4 class="mb-2 font-semibold">{{ pt('unsTableTitle') }}</h4>
    <p class="mb-3 text-xs text-gray-500">{{ pt('unsTableIntro') }}</p>
    <p class="mb-3 font-mono text-xs text-gray-500">{{ pt('formula60') }}</p>

    <el-table
      :data="rows"
      :fit="false"
      size="small"
      border
      stripe
      class="thread-data-table thread-sticky-header-table mb-3"
    >
      <el-table-column prop="designation" :min-width="THREAD_TABLE_COL.designation">
        <template #header>
          <ThreadFieldTip :label="pt('colDesignation')" :tip="pt('term_designation')" />
        </template>
      </el-table-column>
      <el-table-column prop="tpi" :min-width="THREAD_TABLE_COL.tpi">
        <template #header>
          <ThreadFieldTip :label="pt('colTpi')" :tip="pt('term_tpi')" />
        </template>
      </el-table-column>
      <el-table-column :min-width="THREAD_TABLE_COL.dim">
        <template #header>
          <ThreadFieldTip :label="pt('colMajor')" :tip="pt('term_major')" />
        </template>
        <template #default="{ row }">{{ formatDim(row, row.major) }}</template>
      </el-table-column>
      <el-table-column :min-width="THREAD_TABLE_COL.dim">
        <template #header>
          <ThreadFieldTip :label="pt('colPitchDia')" :tip="pt('term_pitchDia')" />
        </template>
        <template #default="{ row }">{{ formatDim(row, row.pitchDiameter) }}</template>
      </el-table-column>
      <el-table-column :min-width="THREAD_TABLE_COL.dim">
        <template #header>
          <ThreadFieldTip :label="pt('colMinor')" :tip="pt('term_minor')" />
        </template>
        <template #default="{ row }">{{ formatDim(row, row.minor) }}</template>
      </el-table-column>
      <el-table-column :min-width="THREAD_TABLE_COL.dim">
        <template #header>
          <ThreadFieldTip :label="pt('colTapDrill')" :tip="pt('term_tapDrill')" />
        </template>
        <template #default="{ row }">{{ formatDim(row, row.tapDrill) }}</template>
      </el-table-column>
      <el-table-column :label="pt('colActions')" :min-width="THREAD_TABLE_COL.actionView">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="$emit('row-click', row)">
            {{ pt('clickRowHint') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <p class="text-[10px] text-gray-400">{{ pt('unsDisclaimer') }}</p>
  </section>
</template>

<script setup>
import { THREAD_TABLE_COL } from '@/constants/thread-table-columns'
import { getUnsReferenceRows } from '@/constants/thread-standards/uns-data'
import { formatDim } from '@/utils/thread-standards'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'

defineProps({
  pt: { type: Function, required: true },
})

defineEmits(['row-click'])

const rows = getUnsReferenceRows()
</script>
