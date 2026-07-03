<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="fit" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="100px">
          <el-form-item :label="pf('nominalSize')">
            <el-input-number v-model="nominal" :min="1" :max="500" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item :label="pf('holeCode')">
            <el-input v-model="holeCode" placeholder="H7" class="w-32" />
          </el-form-item>
          <el-form-item :label="pf('shaftCode')">
            <el-input v-model="shaftCode" placeholder="g6" class="w-32" />
          </el-form-item>
          <template v-if="calcMode === 'professional'">
            <el-form-item :label="pf('assemblyDeltaT')">
              <el-input-number v-model="deltaT" :min="-200" :max="400" :step="10" />
              <span class="ml-2 text-xs text-gray-500">°C</span>
            </el-form-item>
          </template>
        </el-form>

        <p class="mb-2 text-xs font-medium text-gray-500">{{ pf('commonPresets') }}</p>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="(p, i) in COMMON_FITS"
            :key="i"
            size="small"
            :type="presetIndex === i ? 'primary' : 'default'"
            @click="applyPreset(i)"
          >
            {{ ol('commonFits', `${p.hole}_${p.shaft}`, 'label') }}
          </el-button>
        </div>
      </section>

      <section ref="resultRef" class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="result?.errorKey" :title="resultError(result)" type="warning" show-icon />
        <template v-else-if="result">
          <div class="mb-4 flex items-center gap-3">
            <el-tag :type="fitTagType">{{ fitTypeLabel }}</el-tag>
            <span class="text-sm text-gray-500">{{ presetUse }}</span>
          </div>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('maxClearance') }}</dt>
              <dd class="font-mono">{{ (result.maxClearance * 1000).toFixed(1) }} μm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('minClearance') }}</dt>
              <dd class="font-mono">{{ (result.minClearance * 1000).toFixed(1) }} μm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('holeLimits') }} {{ result.hole.designation }}</dt>
              <dd class="font-mono">{{ result.hole.minSize.toFixed(4) }} ~ {{ result.hole.maxSize.toFixed(4) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('shaftLimits') }} {{ result.shaft.designation }}</dt>
              <dd class="font-mono">{{ result.shaft.minSize.toFixed(4) }} ~ {{ result.shaft.maxSize.toFixed(4) }}</dd>
            </div>
            <div v-if="result.meanClearance != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('meanClearance') }}</dt>
              <dd class="font-mono">{{ (result.meanClearance * 1000).toFixed(1) }} μm</dd>
            </div>
            <div v-if="result.fitQuality != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('fitQuality') }}</dt>
              <dd class="font-mono">{{ result.fitQuality }}</dd>
            </div>
            <div v-if="result.thermalShift != null && deltaT !== 0" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>{{ pr('thermalShift') }}</dt>
              <dd class="font-mono">{{ (result.thermalShift * 1000).toFixed(1) }} μm</dd>
            </div>
            <div v-if="result.thermalRisk" class="rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20">
              {{ result.thermalRisk }}
            </div>
          </dl>
          <FitDiagram :fit="result" class="mx-auto mt-4" />
          <FitToleranceBand v-if="bandData && !bandData.errorKey" :band="bandData" class="mx-auto mt-4" />
        </template>
      </section>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-2 text-sm font-semibold">{{ pf('supportedCodes') }}</h2>
      <p class="mb-2 text-xs text-gray-500">{{ pf('holeLetters') }}: {{ holeLetters.join(', ') }}</p>
      <p class="text-xs text-gray-500">{{ pf('shaftLetters') }}: {{ shaftLetters.join(', ') }}</p>
    </section>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <el-button type="primary" plain @click="exportPdf">{{ fc('exportPdfReport') }}</el-button>
      <SaveHistoryButton
        tool="fit"
        :title="historyTitle"
        :status="result?.fitType === 'interference' ? 'fail' : 'pass'"
        :summary="historySummary"
        :input="{ nominal: nominal, holeCode, shaftCode }"
        :result="result"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { analyzeFit, COMMON_FITS, generateToleranceBandData, SUPPORTED_HOLE_LETTERS, SUPPORTED_SHAFT_LETTERS } from '@/utils/iso-286-calc'
import FitDiagram from '@/components/fit/FitDiagram.vue'
import FitToleranceBand from '@/components/fit/FitToleranceBand.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { exportToolReportPdf } from '@/utils/export'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useContentI18n } from '@/composables/useContentI18n'

const { pt, ct, pf, pr, fc, locale } = useCalcPage('fit')
const { exportFilename } = useContentI18n()
const { ol } = useOptionsI18n()
const { rm, resultError } = useResultI18n()

const nominal = ref(25)
const holeCode = ref('H7')
const shaftCode = ref('g6')
const calcMode = ref('simple')
const deltaT = ref(80)
const presetIndex = ref(0)
const resultRef = ref(null)
const holeLetters = SUPPORTED_HOLE_LETTERS
const shaftLetters = SUPPORTED_SHAFT_LETTERS

const preset = computed(() => COMMON_FITS[presetIndex.value])
const presetKey = computed(() => (preset.value ? `${preset.value.hole}_${preset.value.shaft}` : ''))
const presetUse = computed(() => ol('commonFits', presetKey.value, 'use'))
const fitTypeLabel = computed(() => {
  locale.value
  const ft = result.value?.fitType
  return ft ? rm('fit', `type_${ft}`) : ''
})

const result = computed(() =>
  analyzeFit(nominal.value, holeCode.value, shaftCode.value, {
    calcMode: calcMode.value,
    deltaT: deltaT.value,
  }),
)
const bandData = computed(() => generateToleranceBandData(nominal.value, holeCode.value, shaftCode.value))

const historySummary = computed(() => {
  const r = result.value
  if (!r || r.errorKey) return []
  return [
    { label: pf('fitType'), value: fitTypeLabel.value },
    { label: pr('maxClearance'), value: (r.maxClearance * 1000).toFixed(1) },
  ]
})

const historyTitle = computed(() => {
  const key = locale.value === 'en' ? 'fitHistoryTitleEn' : 'fitHistoryTitle'
  return exportFilename(key, { hole: holeCode.value, shaft: shaftCode.value, nominal: nominal.value })
})

const fitTagType = computed(() => {
  if (!result.value || result.value.errorKey) return 'info'
  return { clearance: 'success', interference: 'danger', transition: 'warning' }[result.value.fitType]
})

function applyPreset(i) {
  presetIndex.value = i
  const p = COMMON_FITS[i]
  holeCode.value = p.hole
  shaftCode.value = p.shaft
}

async function exportPdf() {
  const r = result.value
  if (!r || r.errorKey) return
  await exportToolReportPdf({
    title: `${pt('title')} — ${fc('exportPdfReport')}`,
    subtitle: `Ø${r.nominal} ${r.hole.designation}/${r.shaft.designation}`,
    sections: [
      {
        heading: ct('results'),
        rows: [
          { label: pf('fitType'), value: fitTypeLabel.value },
          { label: pr('maxClearance'), value: (r.maxClearance * 1000).toFixed(1) },
          { label: pr('minClearance'), value: (r.minClearance * 1000).toFixed(1) },
          { label: pr('holeLimits'), value: `${r.hole.minSize} ~ ${r.hole.maxSize}` },
          { label: pr('shaftLimits'), value: `${r.shaft.minSize} ~ ${r.shaft.maxSize}` },
        ],
      },
    ],
    element: resultRef.value,
    filename: exportFilename('fitPdf', { nominal: r.nominal, ts: Date.now() }),
  })
}
</script>
