<template>
  <section class="uns-ref-table min-w-0">
    <h4 class="mb-2 font-semibold">{{ pt('unsTableTitle') }}</h4>
    <p class="mb-3 text-xs text-gray-500">{{ pt('unsTableIntro') }}</p>
    <p class="mb-3 font-mono text-xs text-gray-500">{{ pt('formula60') }}</p>

    <el-table
      :data="rows"
      :max-height="THREAD_TABLE_MAX_HEIGHT"
      size="small"
      border
      stripe
      highlight-current-row
      class="thread-data-table mb-3 cursor-pointer"
      @row-click="(row) => $emit('row-click', row)"
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
      <el-table-column :min-width="THREAD_TABLE_COL.actionIcon" align="center" class-name="thread-col-action">
        <template #header><span aria-hidden="true">+</span></template>
        <template #default="{ row }">
          <el-button
            size="small"
            circle
            :type="compareIds.includes(row.id) ? 'success' : 'primary'"
            plain
            :aria-label="compareIds.includes(row.id) ? pt('inCompare') : pt('addToCompare')"
            @click.stop="$emit('toggle-compare', row)"
          >
            <el-icon><component :is="compareIds.includes(row.id) ? Check : Plus" /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <p class="text-[10px] text-gray-400">{{ pt('unsDisclaimer') }}</p>
  </section>
</template>

<script setup>
import { Plus, Check } from '@element-plus/icons-vue'
import { THREAD_TABLE_COL, THREAD_TABLE_MAX_HEIGHT } from '@/constants/thread-table-columns'
import { getUnsReferenceRows } from '@/constants/thread-standards/uns-data'
import { formatDim } from '@/utils/thread-standards'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'

defineProps({
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
})

defineEmits(['row-click', 'toggle-compare'])

const rows = getUnsReferenceRows()
</script>
