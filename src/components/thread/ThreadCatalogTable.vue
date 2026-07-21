<template>
  <div class="thread-catalog-table">
    <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
      <h3 class="font-semibold">{{ tableTitle }}</h3>
      <div class="flex flex-wrap items-center gap-2">
        <template v-if="isImperialSeries">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('displayUnit') }}</span>
          <el-radio-group v-model="displayUnit" size="small">
            <el-radio-button value="in">{{ pt('displayUnitIn') }}</el-radio-button>
            <el-radio-button value="mm">{{ pt('displayUnitMm') }}</el-radio-button>
          </el-radio-group>
        </template>
        <span v-else class="text-xs text-gray-500 dark:text-gray-400">{{ unitLabel }}</span>
      </div>
    </div>

    <div class="mb-2 flex flex-wrap items-center gap-3">
      <el-input
        v-model="searchQuery"
        clearable
        class="max-w-xs"
        :placeholder="pt('searchPlaceholder')"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <template v-if="isMetricCatalog">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('filterSeries') }}</span>
        <el-select v-model="priorityFilter" class="w-28">
          <el-option :label="pt('priorityAll')" value="all" />
          <el-option label="1" :value="1" />
          <el-option label="2" :value="2" />
          <el-option label="3" :value="3" />
        </el-select>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('filterTooth') }}</span>
        <el-select v-model="seriesFilter" class="w-28">
          <el-option :label="pt('seriesAll')" value="all" />
          <el-option :label="pt('tabCoarse')" value="coarse" />
          <el-option :label="pt('tabFine')" value="fine" />
        </el-select>
      </template>
      <template v-if="showTpiFilter">
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('filterTpi') }}</span>
        <el-input-number v-model="tpiMin" :min="1" :step="1" :precision="0" controls-position="right" class="w-24" />
        <span class="text-gray-400">–</span>
        <el-input-number v-model="tpiMax" :min="1" :step="1" :precision="0" controls-position="right" class="w-24" />
      </template>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ pt('rowCount', { n: filteredRows.length }) }}</span>
    </div>

    <div ref="tableHostRef" class="thread-table-scroll">
      <el-table
        ref="tableRef"
        :data="filteredRows"
        :max-height="tableMaxHeight"
        border
        stripe
        size="small"
        class="thread-data-table cursor-pointer"
        :class="{ 'thread-metric-sheet': isMetricCatalog }"
        :fit="!isMetricCatalog"
        highlight-current-row
        :row-class-name="rowClassName"
        @row-click="(row) => $emit('row-click', row)"
      >
        <!-- 公制：三层表头对齐《公制螺纹2.xlsx》；系列/牙型改上方筛选 -->
        <template v-if="isMetricCatalog">
          <el-table-column
            :width="THREAD_METRIC_COL.spec"
            fixed
            align="left"
            header-align="left"
          >
            <template #header>{{ pt('sheet_spec') }}</template>
            <template #default="{ row }">{{ row.designation }}</template>
          </el-table-column>

          <el-table-column align="center">
            <template #header>{{ pt('xlsx_group_basic') }}</template>
            <el-table-column :width="THREAD_METRIC_COL.nominal" fixed align="center">
              <template #header>{{ pt('xlsx_nominal') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.nominal" fixed align="center">
                <template #header><MathContent :text="SYM.Dd" /></template>
                <template #default="{ row }">{{ formatNominal(row) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column :width="THREAD_METRIC_COL.pitch" fixed align="center">
              <template #header>{{ pt('xlsx_pitch') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.pitch" fixed align="center">
                <template #header><MathContent :text="SYM.P" /></template>
                <template #default="{ row }">{{ formatPitchDisplay(row) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column :width="THREAD_METRIC_COL.rmin" align="center">
              <template #header>{{ pt('xlsx_rmin') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.rmin" align="center">
                <template #header><MathContent :text="SYM.Rmin" /></template>
                <template #default="{ row }">{{ formatUm(row.rMinUm) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column :width="THREAD_METRIC_COL.dim" align="center">
              <template #header>{{ pt('xlsx_pitchDia') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dim" align="center">
                <template #header><MathContent :text="SYM.D2d2" /></template>
                <template #default="{ row }">{{ formatDim(row, row.pitchDiameter, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column :width="THREAD_METRIC_COL.dim" align="center">
              <template #header>{{ pt('xlsx_minor') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dim" align="center">
                <template #header><MathContent :text="SYM.D1d1" /></template>
                <template #default="{ row }">{{ formatDim(row, row.minor, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column :width="THREAD_METRIC_COL.tap" align="center">
              <template #header>{{ pt('xlsx_tapDrill') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.tap" align="center">
                <template #header><MathContent :text="SYM.tapDrill" /></template>
                <template #default="{ row }">{{ formatDim(row, row.tapDrill, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
          </el-table-column>

          <el-table-column align="center">
            <template #header>{{ pt('xlsx_group_limits') }}</template>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_int4H_D2') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D2max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.int4hD2max, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D2min" /></template>
                <template #default="{ row }">{{ formatDim(row, row.int4hD2min, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_int4H_D1') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D1max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.int4hD1max, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D1min" /></template>
                <template #default="{ row }">{{ formatDim(row, row.int4hD1min, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_int6H_D2') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D2max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.intD2max, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D2min" /></template>
                <template #default="{ row }">{{ formatDim(row, row.intD2min, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_int6H_D1') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D1max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.intD1max, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.D1min" /></template>
                <template #default="{ row }">{{ formatDim(row, row.intD1min, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_ext4h_d') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.dmax" /></template>
                <template #default="{ row }">{{ formatDim(row, row.ext4hDmax, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.dmin" /></template>
                <template #default="{ row }">{{ formatDim(row, row.ext4hDmin, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_ext4h_d2') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.d2max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.ext4hD2max, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.d2min" /></template>
                <template #default="{ row }">{{ formatDim(row, row.ext4hD2min, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_ext4h_d3') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeafWide" align="center">
                <template #header><MathContent :text="SYM.d3max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.ext4hD3max, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_ext6g_d') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.dmax" /></template>
                <template #default="{ row }">{{ formatDim(row, row.extDmax, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.dmin" /></template>
                <template #default="{ row }">{{ formatDim(row, row.extDmin, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_ext6g_d2') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.d2max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.extD2max, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.dimLeaf" align="center">
                <template #header><MathContent :text="SYM.d2min" /></template>
                <template #default="{ row }">{{ formatDim(row, row.extD2min, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_ext6g_d3') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.dimLeafWide" align="center">
                <template #header><MathContent :text="SYM.d3max" /></template>
                <template #default="{ row }">{{ formatDim(row, row.extD3max, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
          </el-table-column>

          <el-table-column align="center">
            <template #header>{{ pt('xlsx_group_dev') }}</template>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_devInt') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.um" align="center">
                <template #header><MathContent :text="SYM.eiG" /></template>
                <template #default="{ row }">{{ formatSignedUm(row.eiG) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.um" align="center">
                <template #header><MathContent :text="SYM.eiH" /></template>
                <template #default="{ row }">{{ formatSignedUm(row.eiH) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header>{{ pt('xlsx_devExt') }}</template>
              <el-table-column :width="THREAD_METRIC_COL.um" align="center">
                <template #header><MathContent :text="SYM.esE" /></template>
                <template #default="{ row }">{{ formatSignedUm(row.esE) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.um" align="center">
                <template #header><MathContent :text="SYM.esF" /></template>
                <template #default="{ row }">{{ formatSignedUm(row.esF) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.um" align="center">
                <template #header><MathContent :text="SYM.esG" /></template>
                <template #default="{ row }">{{ formatSignedUm(row.esG) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.um" align="center">
                <template #header><MathContent :text="SYM.esH" /></template>
                <template #default="{ row }">{{ formatSignedUm(row.esH) }}</template>
              </el-table-column>
            </el-table-column>
          </el-table-column>

          <el-table-column align="center">
            <template #header>{{ pt('xlsx_group_tol') }}</template>
            <el-table-column align="center">
              <template #header><MathContent :text="pt('xlsx_td1')" /></template>
              <el-table-column v-for="g in TD1_GRADES" :key="'td1'+g" :width="THREAD_METRIC_COL.um" align="center">
                <template #header>{{ g }}</template>
                <template #default="{ row }">{{ formatUm(row.td1?.['g' + g]) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header><MathContent :text="pt('xlsx_td2')" /></template>
              <el-table-column v-for="g in TD2_GRADES" :key="'td2'+g" :width="THREAD_METRIC_COL.um" align="center">
                <template #header>{{ g }}</template>
                <template #default="{ row }">{{ formatUm(row.td2?.['g' + g]) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header><MathContent :text="pt('xlsx_tdMajor')" /></template>
              <el-table-column v-for="g in TD_MAJOR_GRADES" :key="'tdm'+g" :width="THREAD_METRIC_COL.um" align="center">
                <template #header>{{ g }}</template>
                <template #default="{ row }">{{ formatUm(row.tdMajor?.['g' + g]) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header><MathContent :text="pt('xlsx_td2Ext')" /></template>
              <el-table-column v-for="g in TD2_EXT_GRADES" :key="'td2e'+g" :width="THREAD_METRIC_COL.um" align="center">
                <template #header>{{ g }}</template>
                <template #default="{ row }">{{ formatUm(row.td2Ext?.['g' + g]) }}</template>
              </el-table-column>
            </el-table-column>
          </el-table-column>

          <el-table-column align="center">
            <template #header>{{ pt('xlsx_group_eng') }}</template>
            <el-table-column align="center">
              <template #header><MathContent :text="SYM.S" /></template>
              <el-table-column :width="THREAD_METRIC_COL.eng" align="center">
                <template #header>≤</template>
                <template #default="{ row }">{{ formatDim(row, row.engSN, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header><MathContent :text="SYM.N" /></template>
              <el-table-column :width="THREAD_METRIC_COL.eng" align="center">
                <template #header>＞</template>
                <template #default="{ row }">{{ formatDim(row, row.engSN, displayUnit) }}</template>
              </el-table-column>
              <el-table-column :width="THREAD_METRIC_COL.eng" align="center">
                <template #header>≤</template>
                <template #default="{ row }">{{ formatDim(row, row.engNL, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
            <el-table-column align="center">
              <template #header><MathContent :text="SYM.L" /></template>
              <el-table-column :width="THREAD_METRIC_COL.eng" align="center">
                <template #header>＞</template>
                <template #default="{ row }">{{ formatDim(row, row.engNL, displayUnit) }}</template>
              </el-table-column>
            </el-table-column>
          </el-table-column>
        </template>

        <!-- 非公制：原列布局 -->
        <template v-else>
          <el-table-column prop="designation" :min-width="THREAD_TABLE_COL.designation">
            <template #header>
              <ThreadFieldTip :label="pt('colDesignation')" :tip="pt('term_designation')" />
            </template>
          </el-table-column>
          <template v-if="isImperialSeries">
            <el-table-column :min-width="THREAD_TABLE_COL.tpi">
              <template #header>
                <ThreadFieldTip :label="pt('colTpi')" :tip="pt('term_tpi')" />
              </template>
              <template #default="{ row }">{{ row.tpi != null ? row.tpi : '—' }}</template>
            </el-table-column>
            <el-table-column :min-width="THREAD_TABLE_COL.pitch">
              <template #header>
                <ThreadFieldTip :label="pitchLengthColumnLabel" :tip="pt('term_pitch')" />
              </template>
              <template #default="{ row }">{{ formatPitchLength(row, displayUnit) }}</template>
            </el-table-column>
          </template>
          <el-table-column v-else :min-width="THREAD_TABLE_COL.pitch">
            <template #header>
              <ThreadFieldTip :label="pt('colPitch')" :tip="pt('term_pitch')" />
            </template>
            <template #default="{ row }">{{ formatPitchDisplay(row) }}</template>
          </el-table-column>
          <el-table-column :min-width="THREAD_TABLE_COL.dim">
            <template #header>
              <ThreadFieldTip :label="pt('colMajor')" :tip="pt('term_major')" />
            </template>
            <template #default="{ row }">{{ formatDim(row, row.major, displayUnit) }}</template>
          </el-table-column>
          <el-table-column :min-width="THREAD_TABLE_COL.dim">
            <template #header>
              <ThreadFieldTip :label="pt('colPitchDia')" :tip="pt('term_pitchDia')" />
            </template>
            <template #default="{ row }">{{ formatDim(row, row.pitchDiameter, displayUnit) }}</template>
          </el-table-column>
          <el-table-column :min-width="THREAD_TABLE_COL.dim">
            <template #header>
              <ThreadFieldTip :label="pt('colMinor')" :tip="pt('term_minor')" />
            </template>
            <template #default="{ row }">{{ formatDim(row, row.minor, displayUnit) }}</template>
          </el-table-column>
          <el-table-column v-if="showTapCol" :min-width="THREAD_TABLE_COL.dim">
            <template #header>
              <ThreadFieldTip :label="pt('colTapDrill')" :tip="pt('term_tapDrill')" />
            </template>
            <template #default="{ row }">{{ formatDim(row, row.tapDrill, displayUnit) }}</template>
          </el-table-column>
          <el-table-column v-if="showToleranceCol" :min-width="THREAD_TABLE_COL.tolerancePair">
            <template #header>
              <ThreadFieldTip :label="pt('colTolerancePair')" :tip="pt('term_tolerancePair')" />
            </template>
            <template #default="{ row }">{{ tolerancePair(row) }}</template>
          </el-table-column>
          <el-table-column v-if="showPipeCols" prop="taper" :min-width="THREAD_TABLE_COL.taper">
            <template #header>
              <ThreadFieldTip :label="pt('colTaper')" :tip="pt('term_taper')" />
            </template>
          </el-table-column>
          <el-table-column v-if="showPipeCols" :min-width="THREAD_TABLE_COL.sealing">
            <template #header>
              <ThreadFieldTip :label="pt('colSealing')" :tip="pt('term_sealing')" />
            </template>
            <template #default="{ row }">{{ sealingLabel(row.sealing) }}</template>
          </el-table-column>
        </template>
        <el-table-column
          :min-width="isMetricCatalog ? THREAD_METRIC_COL.action : THREAD_TABLE_COL.actionIcon"
          :width="isMetricCatalog ? THREAD_METRIC_COL.action : THREAD_TABLE_COL.actionIcon"
          align="center"
          fixed="right"
          class-name="thread-col-action"
        >
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
    </div>

    <el-empty v-if="!filteredRows.length" class="mt-2" :description="pt('empty')" />
    <p v-if="tableDisclaimer" class="mt-2 text-[10px] text-gray-400">{{ tableDisclaimer }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { Search, Plus, Check } from '@element-plus/icons-vue'
import { getThreadRows, THREAD_SYSTEMS } from '@/constants/thread-standards'
import {
  filterThreadRows,
  formatPitchDisplay,
  formatPitchLength,
  formatDim,
} from '@/utils/thread-standards'
import { THREAD_TABLE_COL, THREAD_METRIC_COL } from '@/constants/thread-table-columns'
import { useThreadTableMaxHeight } from '@/utils/thread-table-layout'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'
import MathContent from '@/components/common/MathContent.vue'

const TD1_GRADES = [4, 5, 6, 7, 8]
const TD2_GRADES = [4, 5, 6, 7, 8]
const TD_MAJOR_GRADES = [4, 6, 8]
const TD2_EXT_GRADES = [3, 4, 5, 6, 7, 8, 9]

/** 公制表头第三行符号（KaTeX 下标） */
const SYM = {
  Dd: '$D, d$',
  P: '$P$',
  Rmin: '$R_{\\mathrm{min}}$',
  D2d2: '$D_2, d_2$',
  D1d1: '$D_1, d_1$',
  tapDrill: '$d-P$',
  D2max: '$D_{2\\mathrm{max}}$',
  D2min: '$D_{2\\mathrm{min}}$',
  D1max: '$D_{1\\mathrm{max}}$',
  D1min: '$D_{1\\mathrm{min}}$',
  dmax: '$d_{\\mathrm{max}}$',
  dmin: '$d_{\\mathrm{min}}$',
  d2max: '$d_{2\\mathrm{max}}$',
  d2min: '$d_{2\\mathrm{min}}$',
  d3max: '$d_{3\\mathrm{max}}$',
  eiG: '$G[EI]$',
  eiH: '$H[EI]$',
  esE: '$e[es]$',
  esF: '$f[es]$',
  esG: '$g[es]$',
  esH: '$h[es]$',
  S: '$S$',
  N: '$N$',
  L: '$L$',
}

const props = defineProps({
  catalogSystem: { type: String, required: true },
  catalogSubTab: { type: String, required: true },
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
  highlightRowId: { type: String, default: '' },
})

const emit = defineEmits(['row-click', 'toggle-compare', 'display-unit-change'])

const searchQuery = ref('')
const priorityFilter = ref('all')
const seriesFilter = ref('all')
const tpiMin = ref(null)
const tpiMax = ref(null)
const displayUnit = ref('in')
const tableRef = ref(null)
const tableHostRef = ref(null)
const { maxHeight: tableMaxHeight, updateMaxHeight } = useThreadTableMaxHeight(tableHostRef, { min: 480, gap: 8 })

const DISPLAY_UNIT_KEY = 'mechbox-thread-imperial-display-unit'

function loadDisplayUnit() {
  try {
    const saved = localStorage.getItem(DISPLAY_UNIT_KEY)
    if (saved === 'in' || saved === 'mm') displayUnit.value = saved
  } catch {
    /* ignore */
  }
}

loadDisplayUnit()

watch(displayUnit, (u) => {
  try {
    localStorage.setItem(DISPLAY_UNIT_KEY, u)
  } catch {
    /* ignore */
  }
  emit('display-unit-change', u)
})

function layoutTable() {
  nextTick(() => {
    updateMaxHeight()
    tableRef.value?.doLayout?.()
  })
}

const activeMeta = computed(() => THREAD_SYSTEMS.find((s) => s.id === props.catalogSystem))

const isImperialSeries = computed(() => activeMeta.value?.unit === 'in')
const isMetricCatalog = computed(() => props.catalogSystem === 'metric')

const tableTitle = computed(() => {
  const key = `tableTitle_${props.catalogSystem}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : props.pt('tableTitleDefault')
})

const tableDisclaimer = computed(() =>
  isMetricCatalog.value ? props.pt('dataDisclaimer_metric') : props.pt('dataDisclaimer'),
)

const unitLabel = computed(() =>
  activeMeta.value?.unit === 'in' ? props.pt('unitIn') : props.pt('unitMm'),
)

const pitchLengthColumnLabel = computed(() =>
  displayUnit.value === 'mm' ? props.pt('colPitchMm') : props.pt('colPitchIn'),
)

const showTpiFilter = computed(() => ['unc', 'unf', 'unef', 'npt', 'nptf', 'acme'].includes(props.catalogSystem))
const showPipeCols = computed(() => ['npt', 'nptf', 'g', 'r'].includes(props.catalogSystem))
const showTapCol = computed(() => !showPipeCols.value)

const currentRows = computed(() => {
  if (props.catalogSystem === 'metric') return getThreadRows('metric', 'all')
  return getThreadRows(props.catalogSystem, props.catalogSubTab)
})

const filteredRows = computed(() => {
  let rows = filterThreadRows(currentRows.value, {
    query: searchQuery.value,
    priority: priorityFilter.value,
    tpiMin: tpiMin.value,
    tpiMax: tpiMax.value,
  })
  if (isMetricCatalog.value && seriesFilter.value !== 'all') {
    rows = rows.filter((r) => r.subSeries === seriesFilter.value)
  }
  return rows
})

function formatUm(v) {
  if (v == null || Number.isNaN(v)) return '—'
  return String(v)
}

/** Excel 偏差列带符号，如 +26 / -26 */
function formatSignedUm(v) {
  if (v == null || Number.isNaN(v)) return '—'
  const n = Number(v)
  if (n > 0) return `+${n}`
  return String(n)
}

function formatNominal(row) {
  if (row.nominal == null) return '—'
  const n = Number(row.nominal)
  return Number.isInteger(n) ? String(n) : String(n)
}

function rowHasTolerance(row) {
  const ext = row.toleranceExternal
  const int = row.toleranceInternal
  return (ext && ext !== '—') || (int && int !== '—')
}

const showToleranceCol = computed(() => filteredRows.value.some(rowHasTolerance))

watch(filteredRows, layoutTable)
watch(tableMaxHeight, layoutTable)
watch(showToleranceCol, layoutTable)

onMounted(() => {
  layoutTable()
  if (isImperialSeries.value) emit('display-unit-change', displayUnit.value)
})

watch(
  () => [props.catalogSystem, props.catalogSubTab],
  () => {
    searchQuery.value = ''
    priorityFilter.value = 'all'
    seriesFilter.value = 'all'
    tpiMin.value = null
    tpiMax.value = null
    if (isImperialSeries.value) emit('display-unit-change', displayUnit.value)
    layoutTable()
  },
)

function sealingLabel(key) {
  if (!key || key === '—') return '—'
  const v = props.pt(`sealing_${key}`)
  return v !== `calc.pages.thread-table.sealing_${key}` ? v : key
}

function tolerancePair(row) {
  const ext = row.toleranceExternal
  const int = row.toleranceInternal
  if ((!ext || ext === '—') && (!int || int === '—')) return '—'
  if (!ext || ext === '—') return int
  if (!int || int === '—') return ext
  return `${ext}/${int}`
}

function rowClassName({ row }) {
  return row.id === props.highlightRowId ? 'thread-row-highlight' : ''
}
</script>

<style scoped>
.thread-catalog-table {
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}
.thread-table-scroll {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
}
.thread-data-table :deep(.thread-row-highlight) {
  background-color: rgb(64 158 255 / 0.08) !important;
}
.thread-metric-sheet :deep(.el-table__body tr.el-table__row--striped > td.el-table__cell) {
  background-color: #edf3fa;
}
.thread-metric-sheet :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #e1edf9 !important;
}
.dark .thread-metric-sheet :deep(.el-table__body tr.el-table__row--striped > td.el-table__cell) {
  background-color: rgb(51 65 85 / 0.62);
}
.dark .thread-metric-sheet :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: rgb(51 65 85 / 0.9) !important;
}

/* 公制查阅表：紧凑行高/列距 */
.thread-metric-sheet :deep(.el-table__header .cell),
.thread-metric-sheet :deep(.el-table__body .cell) {
  padding-left: 3px;
  padding-right: 3px;
  font-size: 12px;
  line-height: 1.2;
}
.thread-metric-sheet :deep(th.el-table__cell) {
  padding: 2px 0;
}
.thread-metric-sheet :deep(th.el-table__cell .cell) {
  padding-top: 3px;
  padding-bottom: 3px;
  line-height: 1.15;
}
.thread-metric-sheet :deep(td.el-table__cell) {
  padding: 1px 0;
}
.thread-metric-sheet :deep(th .katex) {
  font-size: 0.82em;
}
.thread-metric-sheet :deep(.thread-col-action .el-button) {
  --el-button-size: 22px;
  width: 22px;
  height: 22px;
  padding: 0;
}
.thread-metric-sheet :deep(.thread-col-action .el-icon) {
  font-size: 12px;
}
.thread-metric-sheet :deep(.sheet-sub) {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.75;
  line-height: 1.1;
}
</style>
