<template>
  <section class="whitworth-ref-table min-w-0">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h4 class="font-semibold">{{ pt('whTableTitle') }}</h4>
      <el-radio-group v-if="showSeriesToggle" v-model="seriesFilter" size="small">
        <el-radio-button value="all">{{ pt('whSeriesAll') }}</el-radio-button>
        <el-radio-button value="bsw">{{ pt('whSeriesBsw') }}</el-radio-button>
        <el-radio-button value="bsf">{{ pt('whSeriesBsf') }}</el-radio-button>
      </el-radio-group>
    </div>

    <p class="mb-3 text-xs text-gray-500">{{ pt('whTableIntro') }}</p>
    <p class="mb-3 font-mono text-xs text-gray-500">{{ pt('formulaWhitworth') }}</p>

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

    <div v-if="showSeriesToggle" class="flex flex-wrap gap-2">
      <el-button size="small" @click="$emit('open-compare', 'whitworth-quarter')">
        {{ pt('whComparePreset') }}
      </el-button>
    </div>
    <p class="mt-2 text-[10px] text-gray-400">{{ pt('whDisclaimer') }}</p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Check } from '@element-plus/icons-vue'
import { THREAD_TABLE_COL, THREAD_TABLE_MAX_HEIGHT } from '@/constants/thread-table-columns'
import { getWhitworthReferenceRows, getWhitworthRowsForTaxonomy } from '@/constants/thread-standards/whitworth-data'
import { formatDim } from '@/utils/thread-standards'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'

const props = defineProps({
  taxonomyId: { type: String, default: 'whitworth' },
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
})

defineEmits(['row-click', 'open-compare', 'toggle-compare'])

const showSeriesToggle = computed(() => props.taxonomyId === 'whitworth')

const seriesFilter = ref(
  props.taxonomyId === 'bsf' ? 'bsf' : props.taxonomyId === 'bsw' ? 'bsw' : 'all',
)

const rows = computed(() => {
  if (!showSeriesToggle.value) {
    return getWhitworthRowsForTaxonomy(props.taxonomyId)
  }
  return getWhitworthReferenceRows(seriesFilter.value)
})
</script>
