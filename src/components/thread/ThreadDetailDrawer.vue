<template>
  <el-drawer
    :key="row?.id"
    :model-value="visible"
    :title="row?.designation ?? pt('detailTitle')"
    direction="rtl"
    size="min(480px, 100vw)"
    destroy-on-close
    @update:model-value="(v) => !v && $emit('close')"
  >
    <template v-if="row">
      <!-- 1. 基本信息 -->
      <section class="detail-section">
        <h3 class="detail-heading">{{ pt('detailBasic') }}</h3>
        <dl class="detail-dl">
          <div><dt>{{ pt('detailSystem') }}</dt><dd>{{ systemLabel(row.system) }}</dd></div>
          <div><dt>{{ pt('detailSubSeries') }}</dt><dd>{{ subSeriesLabel(row) }}</dd></div>
          <div><dt>{{ pt('colDesignation') }}</dt><dd class="font-medium">{{ row.designation }}</dd></div>
          <div><dt>{{ pt('detailUsage') }}</dt><dd>{{ pt(getUsageNoteKey(row)) }}</dd></div>
          <div><dt>{{ pt('colStandard') }}</dt><dd>{{ row.standardRef }}</dd></div>
        </dl>
      </section>

      <!-- 2. 标记解释 -->
      <section v-if="parseResult?.segments?.length" class="detail-section">
        <h3 class="detail-heading">{{ pt('detailMarkExplain') }}</h3>
        <div class="flex flex-wrap gap-2">
          <el-tag
            v-for="(seg, i) in parseResult.segments"
            :key="i"
            type="info"
            effect="plain"
            class="max-w-full whitespace-normal"
          >
            <span class="font-mono">{{ seg.text }}</span>
            <span class="ml-1 text-xs opacity-75">— {{ pt(`parseRole_${seg.role}`) }}</span>
          </el-tag>
        </div>
        <p v-if="parseResult.hand === 'LH'" class="mt-2 text-xs text-warning">{{ pt('parseLeftHand') }}</p>
      </section>

      <!-- 3. 尺寸参数 -->
      <section class="detail-section">
        <h3 class="detail-heading">{{ pt('detailDimensions') }}</h3>
        <dl class="detail-dl">
          <div v-if="row.nominal != null">
            <dt>{{ pt('detailNominal') }}</dt>
            <dd>{{ formatDim(row, row.nominal, displayUnit) }} {{ dimUnit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="dimensionLabel('major')" :tip="dimensionTip('major')" /></dt>
            <dd>{{ formatDim(row, row.major, displayUnit) }} {{ dimUnit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="dimensionLabel('pitchDiameter')" :tip="dimensionTip('pitchDiameter')" /></dt>
            <dd>{{ formatDim(row, row.pitchDiameter, displayUnit) }} {{ dimUnit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="dimensionLabel('minor')" :tip="dimensionTip('minor')" /></dt>
            <dd>{{ formatDim(row, row.minor, displayUnit) }} {{ dimUnit }}</dd>
          </div>
          <div v-if="row.rootDiameter != null">
            <dt><ThreadFieldTip :label="pt('colRoot_d3')" :tip="pt('term_root_metric')" /></dt>
            <dd>{{ formatDim(row, row.rootDiameter, displayUnit) }} {{ dimUnit }}</dd>
          </div>
          <div v-if="row.rMinUm != null">
            <dt><MathContent :text="pt('colRmin')" /></dt>
            <dd>{{ row.rMinUm }} μm</dd>
          </div>
          <div v-if="row.tpi">
            <dt><ThreadFieldTip :label="pt('colTpi')" :tip="pt('term_tpi')" /></dt>
            <dd>{{ row.tpi }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="pitchLabel" :tip="pt('term_pitch')" /></dt>
            <dd>{{ row.tpi ? `${formatPitchLength(row, displayUnit)} ${dimUnit}` : formatPitchDisplay(row) }}</dd>
          </div>
          <div>
            <dt>{{ pt('detailThreadAngle') }}</dt>
            <dd>{{ row.threadAngle }}°</dd>
          </div>
          <div v-if="row.taper && row.taper !== '—'">
            <dt>{{ pt('colTaper') }}</dt>
            <dd>{{ row.taper }}</dd>
          </div>
        </dl>
      </section>

      <!-- 4. 公差与配合 -->
      <section class="detail-section">
        <h3 class="detail-heading">{{ pt('detailTolerance') }}</h3>
        <dl class="detail-dl">
          <div>
            <dt>{{ pt('colToleranceExt') }}</dt>
            <dd>{{ row.toleranceExternal }}</dd>
          </div>
          <div>
            <dt>{{ pt('colToleranceInt') }}</dt>
            <dd>{{ row.toleranceInternal }}</dd>
          </div>
        </dl>
        <p class="mt-2 text-xs text-gray-500">{{ pt(getToleranceNoteKey(row)) }}</p>

        <template v-if="row.hasMetricCatalog">
          <h4 class="detail-subheading">{{ pt('detailLimits6') }}</h4>
          <dl class="detail-dl">
            <div>
              <dt><MathContent :text="pt('col6g_d')" /></dt>
              <dd>{{ formatDimRange(row, row.extDmax, row.extDmin, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col6g_d2')" /></dt>
              <dd>{{ formatDimRange(row, row.extD2max, row.extD2min, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col6g_d3max')" /></dt>
              <dd>{{ formatDim(row, row.extD3max, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col6h_D2')" /></dt>
              <dd>{{ formatDimRange(row, row.intD2max, row.intD2min, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col6h_D1')" /></dt>
              <dd>{{ formatDimRange(row, row.intD1max, row.intD1min, displayUnit) }} {{ dimUnit }}</dd>
            </div>
          </dl>

          <h4 class="detail-subheading">{{ pt('detailLimits4') }}</h4>
          <dl class="detail-dl">
            <div>
              <dt><MathContent :text="pt('col4h_d')" /></dt>
              <dd>{{ formatDimRange(row, row.ext4hDmax, row.ext4hDmin, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col4h_d2')" /></dt>
              <dd>{{ formatDimRange(row, row.ext4hD2max, row.ext4hD2min, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col4h_d3max')" /></dt>
              <dd>{{ formatDim(row, row.ext4hD3max, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col4H_D2')" /></dt>
              <dd>{{ formatDimRange(row, row.int4hD2max, row.int4hD2min, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('col4H_D1')" /></dt>
              <dd>{{ formatDimRange(row, row.int4hD1max, row.int4hD1min, displayUnit) }} {{ dimUnit }}</dd>
            </div>
          </dl>

          <h4 class="detail-subheading">{{ pt('detailDeviations') }}</h4>
          <dl class="detail-dl">
            <div><dt><MathContent :text="pt('colEsG')" /></dt><dd>{{ formatUm(row.esG) }}</dd></div>
            <div><dt><MathContent :text="pt('colEsH')" /></dt><dd>{{ formatUm(row.esH) }}</dd></div>
            <div><dt><MathContent :text="pt('colEiG')" /></dt><dd>{{ formatUm(row.eiG) }}</dd></div>
            <div><dt><MathContent :text="pt('colEiH')" /></dt><dd>{{ formatUm(row.eiH) }}</dd></div>
            <div><dt><MathContent :text="pt('colTd2_6')" /></dt><dd>{{ formatUm(row.td2?.g6) }}</dd></div>
            <div><dt><MathContent :text="pt('colTd2Ext_6')" /></dt><dd>{{ formatUm(row.td2Ext?.g6) }}</dd></div>
          </dl>

          <h4 class="detail-subheading">{{ pt('detailEngagement') }}</h4>
          <dl class="detail-dl">
            <div>
              <dt><MathContent :text="pt('colEngSN')" /></dt>
              <dd>{{ formatDim(row, row.engSN, displayUnit) }} {{ dimUnit }}</dd>
            </div>
            <div>
              <dt><MathContent :text="pt('colEngNL')" /></dt>
              <dd>{{ formatDim(row, row.engNL, displayUnit) }} {{ dimUnit }}</dd>
            </div>
          </dl>
        </template>
      </section>

      <!-- 5. 工艺参考 -->
      <section class="detail-section">
        <h3 class="detail-heading">{{ pt('detailProcess') }}</h3>
        <dl class="detail-dl">
          <div>
            <dt><MathContent :text="pt('colTapDrill')" /></dt>
            <dd>{{ formatDim(row, row.tapDrill, displayUnit) }} {{ dimUnit }}</dd>
          </div>
        </dl>
        <ul class="mt-2 list-inside list-disc text-xs text-gray-600 dark:text-gray-400">
          <li v-for="key in processKeys" :key="key">{{ pt(key) }}</li>
        </ul>
      </section>

      <!-- 6. 兼容性 -->
      <section v-if="row.compatibilityKey || row.sealing !== '—'" class="detail-section">
        <h3 class="detail-heading">{{ pt('detailCompat') }}</h3>
        <el-alert
          v-if="row.compatibilityKey"
          type="warning"
          :closable="false"
          show-icon
          :title="compatText(row.compatibilityKey)"
        />
        <p v-else-if="row.sealing === 'parallel_seal'" class="text-xs text-gray-600">{{ pt('sealing_parallel_seal') }}</p>
        <p v-else-if="row.sealing === 'taper_seal'" class="text-xs text-gray-600">{{ pt('sealing_taper_seal') }}</p>
      </section>

      <!-- 7. 相邻规格 -->
      <section v-if="hasNeighbors" class="detail-section">
        <h3 class="detail-heading">{{ pt('detailNeighbors') }}</h3>
        <div class="flex flex-wrap gap-2">
          <el-button v-if="neighbors.prev" size="small" @click="$emit('select-row', neighbors.prev)">
            ← {{ neighbors.prev.designation }}
          </el-button>
          <el-button v-if="neighbors.next" size="small" @click="$emit('select-row', neighbors.next)">
            {{ neighbors.next.designation }} →
          </el-button>
        </div>
        <div v-if="neighbors.siblings.length" class="mt-3">
          <p class="mb-1 text-xs text-gray-500">{{ pt('detailSiblings') }}</p>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="s in neighbors.siblings"
              :key="s.id"
              size="small"
              plain
              type="primary"
              @click="$emit('select-row', s)"
            >
              {{ s.designation }}
            </el-button>
          </div>
        </div>
      </section>

      <div class="mt-4 flex flex-wrap gap-2">
        <el-button type="primary" plain @click="$emit('add-compare', row)">{{ pt('addToCompare') }}</el-button>
        <el-button :type="favorited ? 'warning' : 'default'" plain @click="toggleFavorite">
          {{ favorited ? pt('favRemove') : pt('favToggle') }}
        </el-button>
      </div>

      <p class="mt-6 text-[10px] text-gray-400">{{ detailDisclaimer }}</p>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  formatDim,
  formatDimRange,
  formatPitchDisplay,
  formatPitchLength,
  formatDimUnitSuffix,
  parseThreadMark,
  getThreadNeighbors,
} from '@/utils/thread-standards'
import { getUsageNoteKey, getProcessNoteKeys, getToleranceNoteKey } from '@/constants/thread-standards/notes'
import { isThreadFavorite, toggleThreadFavorite } from '@/utils/thread-favorites'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'
import MathContent from '@/components/common/MathContent.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  row: { type: Object, default: null },
  pt: { type: Function, required: true },
  /** When set, override display for imperial rows (in → mm). */
  displayUnit: { type: String, default: '' },
})

const emit = defineEmits(['close', 'select-row', 'add-compare', 'favorite-changed'])

const displayUnit = computed(() =>
  props.row?.unit === 'in' && (props.displayUnit === 'in' || props.displayUnit === 'mm')
    ? props.displayUnit
    : undefined,
)

const dimUnit = computed(() =>
  props.row ? formatDimUnitSuffix(props.row, displayUnit.value) : '',
)

const favorited = ref(false)

watch(
  () => props.row?.id,
  (id) => {
    favorited.value = id ? isThreadFavorite(id) : false
  },
  { immediate: true },
)

function toggleFavorite() {
  if (!props.row?.id) return
  const now = toggleThreadFavorite(props.row.id)
  favorited.value = now
  emit('favorite-changed')
  ElMessage.success(props.pt(now ? 'favAdded' : 'favRemoved'))
}

const parseResult = computed(() =>
  props.row ? parseThreadMark(props.row.designation) : null,
)

const neighbors = computed(() =>
  props.row ? getThreadNeighbors(props.row) : { prev: null, next: null, siblings: [] },
)

const hasNeighbors = computed(
  () => neighbors.value.prev || neighbors.value.next || neighbors.value.siblings.length,
)

const processKeys = computed(() => (props.row ? getProcessNoteKeys(props.row) : []))

const pitchLabel = computed(() =>
  props.row?.unit === 'in'
    ? (displayUnit.value === 'mm' ? props.pt('colPitchMm') : props.pt('colPitchIn'))
    : props.pt('colPitch'),
)

const detailDisclaimer = computed(() =>
  props.row?.hasMetricCatalog ? props.pt('dataDisclaimer_metric') : props.pt('dataDisclaimer'),
)

function formatUm(v) {
  if (v == null || Number.isNaN(v)) return '—'
  return `${v} μm`
}

function systemLabel(id) {
  const v = props.pt(`system_${id}`)
  return v !== `calc.pages.thread-table.system_${id}` ? v : id
}

function subSeriesLabel(row) {
  if (row.system === 'metric') {
    return row.subSeries === 'fine' ? props.pt('tabFine') : props.pt('tabCoarse')
  }
  return systemLabel(row.system)
}

function dimensionLabel(kind) {
  if (props.row?.system !== 'metric') {
    return props.pt({
      major: 'colMajor',
      pitchDiameter: 'colPitchDia',
      minor: 'colMinor',
    }[kind])
  }
  return props.pt({
    major: 'colMajor_metric',
    pitchDiameter: 'colPitchDia_metric',
    minor: 'colMinor_metric',
  }[kind])
}

function dimensionTip(kind) {
  if (props.row?.system !== 'metric') {
    return props.pt({
      major: 'term_major',
      pitchDiameter: 'term_pitchDia',
      minor: 'term_minor',
    }[kind])
  }
  return props.pt({
    major: 'term_major_metric',
    pitchDiameter: 'term_pitchDia_metric',
    minor: 'term_minor_metric',
  }[kind])
}

function compatText(key) {
  const v = props.pt(`compat_${key}`)
  return v !== `calc.pages.thread-table.compat_${key}` ? v : key
}
</script>

<style scoped>
:deep(.el-drawer__header) {
  margin-bottom: 0.35rem;
  padding: 1rem 1.25rem 0.25rem;
}
:deep(.el-drawer__title) {
  font-size: 1.375rem;
  font-weight: 650;
  line-height: 1.2;
}
:deep(.el-drawer__body) {
  padding-top: 0.5rem;
}
.detail-section {
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.detail-heading {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}
.detail-subheading {
  margin: 0.85rem 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.detail-dl {
  display: grid;
  gap: 0.35rem 0.75rem;
  font-size: 0.8125rem;
}
.detail-dl > div {
  display: grid;
  grid-template-columns: 7rem 1fr;
  gap: 0.5rem;
}
.detail-dl dt {
  color: var(--el-text-color-secondary);
}
.detail-dl dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
</style>
