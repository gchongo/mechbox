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

    <el-table :data="rows" size="small" border stripe class="mb-3">
      <el-table-column :label="pt('colDesignation')" prop="designation" min-width="120" />
      <el-table-column :label="pt('colTpi')" prop="tpi" width="70" align="center" />
      <el-table-column :label="pt('colMajor')" width="90" align="right">
        <template #default="{ row }">{{ formatDim(row, row.major) }}</template>
      </el-table-column>
      <el-table-column :label="pt('colPitchDiameter')" width="100" align="right">
        <template #default="{ row }">{{ formatDim(row, row.pitchDiameter) }}</template>
      </el-table-column>
      <el-table-column :label="pt('colMinor')" width="90" align="right">
        <template #default="{ row }">{{ formatDim(row, row.minor) }}</template>
      </el-table-column>
      <el-table-column :label="pt('colTapDrill')" width="90" align="right">
        <template #default="{ row }">{{ formatDim(row, row.tapDrill) }}</template>
      </el-table-column>
      <el-table-column :label="pt('colActions')" width="100" align="center">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="$emit('row-click', row)">
            {{ pt('clickRowHint') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex flex-wrap gap-2">
      <el-button size="small" @click="$emit('open-compare', 'whitworth-quarter')">
        {{ pt('whComparePreset') }}
      </el-button>
    </div>
    <p class="mt-2 text-[10px] text-gray-400">{{ pt('whDisclaimer') }}</p>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getWhitworthReferenceRows, getWhitworthRowsForTaxonomy } from '@/constants/thread-standards/whitworth-data'
import { formatDim } from '@/utils/thread-standards'

const props = defineProps({
  taxonomyId: { type: String, default: 'whitworth' },
  pt: { type: Function, required: true },
})

defineEmits(['row-click', 'open-compare'])

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
