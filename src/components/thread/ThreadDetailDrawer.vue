<template>
  <el-drawer
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
            <dd>{{ formatDim(row, row.nominal) }} {{ row.unit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="pt('colMajor')" :tip="pt('term_major')" /></dt>
            <dd>{{ formatDim(row, row.major) }} {{ row.unit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="pt('colPitchDia')" :tip="pt('term_pitchDia')" /></dt>
            <dd>{{ formatDim(row, row.pitchDiameter) }} {{ row.unit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="pt('colMinor')" :tip="pt('term_minor')" /></dt>
            <dd>{{ formatDim(row, row.minor) }} {{ row.unit }}</dd>
          </div>
          <div>
            <dt><ThreadFieldTip :label="pitchLabel" :tip="row.tpi ? pt('term_tpi') : pt('term_pitch')" /></dt>
            <dd>{{ formatPitchDisplay(row) }}</dd>
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
      </section>

      <!-- 5. 工艺参考 -->
      <section class="detail-section">
        <h3 class="detail-heading">{{ pt('detailProcess') }}</h3>
        <dl class="detail-dl">
          <div>
            <dt>{{ pt('colTapDrill') }}</dt>
            <dd>{{ formatDim(row, row.tapDrill) }} {{ row.unit }}</dd>
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

      <p class="mt-6 text-[10px] text-gray-400">{{ pt('dataDisclaimer') }}</p>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  formatDim,
  formatPitchDisplay,
  parseThreadMark,
  getThreadNeighbors,
} from '@/utils/thread-standards'
import { getUsageNoteKey, getProcessNoteKeys, getToleranceNoteKey } from '@/constants/thread-standards/notes'
import { isThreadFavorite, toggleThreadFavorite } from '@/utils/thread-favorites'
import ThreadFieldTip from '@/components/thread/ThreadFieldTip.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  row: { type: Object, default: null },
  pt: { type: Function, required: true },
})

const emit = defineEmits(['close', 'select-row', 'add-compare', 'favorite-changed'])

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
  props.row?.unit === 'in' ? props.pt('colTpiPitch') : props.pt('colPitch'),
)

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

function compatText(key) {
  const v = props.pt(`compat_${key}`)
  return v !== `calc.pages.thread-table.compat_${key}` ? v : key
}
</script>

<style scoped>
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
