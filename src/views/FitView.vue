<template>
  <div>
    <h1 class="page-title">ISO 286 轴孔配合</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      公差带极限尺寸、间隙/过盈与配合类型分析
    </p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="calcMode">
          <el-radio-button label="simple">简化</el-radio-button>
          <el-radio-button label="complete">完整</el-radio-button>
          <el-radio-button label="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="calcMode === 'simple'">极限尺寸与配合类型。</template>
          <template v-else-if="calcMode === 'complete'">平均间隙、公差带宽与配合品质指数。</template>
          <template v-else>装配温差对间隙/过盈的影响评估。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="100px">
          <el-form-item label="公称尺寸">
            <el-input-number v-model="nominal" :min="1" :max="500" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="孔代号">
            <el-input v-model="holeCode" placeholder="H7" class="w-32" />
          </el-form-item>
          <el-form-item label="轴代号">
            <el-input v-model="shaftCode" placeholder="g6" class="w-32" />
          </el-form-item>
          <template v-if="calcMode === 'professional'">
            <el-form-item label="装配温差">
              <el-input-number v-model="deltaT" :min="-200" :max="400" :step="10" />
              <span class="ml-2 text-xs text-gray-500">°C</span>
            </el-form-item>
          </template>
        </el-form>

        <p class="mb-2 text-xs font-medium text-gray-500">常用配合预设</p>
        <div class="flex flex-wrap gap-2">
          <el-button
            v-for="(p, i) in COMMON_FITS"
            :key="i"
            size="small"
            :type="presetIndex === i ? 'primary' : 'default'"
            @click="applyPreset(i)"
          >
            {{ p.hole }}/{{ p.shaft }}
          </el-button>
        </div>
      </section>

      <section ref="resultRef" class="card-panel">
        <el-alert v-if="result?.error" :title="result.error" type="warning" show-icon />
        <template v-else-if="result">
          <div class="mb-4 flex items-center gap-3">
            <el-tag :type="fitTagType">{{ result.fitLabel }}</el-tag>
            <span class="text-sm text-gray-500">{{ preset?.use }}</span>
          </div>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>最大间隙 / 过盈</dt>
              <dd class="font-mono">{{ (result.maxClearance * 1000).toFixed(1) }} μm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>最小间隙 / 过盈</dt>
              <dd class="font-mono">{{ (result.minClearance * 1000).toFixed(1) }} μm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>孔 {{ result.hole.designation }}</dt>
              <dd class="font-mono">{{ result.hole.minSize.toFixed(4) }} ~ {{ result.hole.maxSize.toFixed(4) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>轴 {{ result.shaft.designation }}</dt>
              <dd class="font-mono">{{ result.shaft.minSize.toFixed(4) }} ~ {{ result.shaft.maxSize.toFixed(4) }}</dd>
            </div>
            <div v-if="result.meanClearance != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>平均间隙</dt>
              <dd class="font-mono">{{ (result.meanClearance * 1000).toFixed(1) }} μm</dd>
            </div>
            <div v-if="result.fitQuality != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>配合品质指数</dt>
              <dd class="font-mono">{{ result.fitQuality }}</dd>
            </div>
            <div v-if="result.thermalShift != null && deltaT !== 0" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>温升间隙变化</dt>
              <dd class="font-mono">{{ (result.thermalShift * 1000).toFixed(1) }} μm</dd>
            </div>
            <div v-if="result.thermalRisk" class="rounded bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20">
              {{ result.thermalRisk }}
            </div>
          </dl>
          <FitDiagram :fit="result" class="mx-auto mt-4" />
          <FitToleranceBand v-if="bandData && !bandData.error" :band="bandData" class="mx-auto mt-4" />
        </template>
      </section>
    </div>

    <section class="card-panel mt-6">
      <h2 class="mb-2 text-sm font-semibold">支持的公差代号</h2>
      <p class="mb-2 text-xs text-gray-500">孔 (大写): {{ holeLetters.join(', ') }}</p>
      <p class="text-xs text-gray-500">轴 (小写): {{ shaftLetters.join(', ') }}</p>
    </section>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <el-button type="primary" plain @click="exportPdf">导出 PDF 报告</el-button>
      <SaveHistoryButton
        tool="fit"
        :title="`配合 ${holeCode}/${shaftCode} Ø${nominal}`"
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

const result = computed(() =>
  analyzeFit(nominal.value, holeCode.value, shaftCode.value, {
    calcMode: calcMode.value,
    deltaT: deltaT.value,
  }),
)
const bandData = computed(() => generateToleranceBandData(nominal.value, holeCode.value, shaftCode.value))

const historySummary = computed(() => {
  const r = result.value
  if (!r || r.error) return []
  return [
    { label: '配合', value: r.fitLabel },
    { label: '最大间隙 (μm)', value: (r.maxClearance * 1000).toFixed(1) },
  ]
})

const fitTagType = computed(() => {
  if (!result.value || result.value.error) return 'info'
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
  if (!r || r.error) return
  await exportToolReportPdf({
    title: 'ISO 286 配合分析报告',
    subtitle: `Ø${r.nominal} ${r.hole.designation}/${r.shaft.designation}`,
    sections: [
      {
        heading: '配合结果',
        rows: [
          { label: '配合类型', value: r.fitLabel },
          { label: '最大间隙/过盈 (μm)', value: (r.maxClearance * 1000).toFixed(1) },
          { label: '最小间隙/过盈 (μm)', value: (r.minClearance * 1000).toFixed(1) },
          { label: '孔极限 (mm)', value: `${r.hole.minSize} ~ ${r.hole.maxSize}` },
          { label: '轴极限 (mm)', value: `${r.shaft.minSize} ~ ${r.shaft.maxSize}` },
        ],
      },
    ],
    element: resultRef.value,
    filename: `ISO286配合_${r.nominal}mm_${Date.now()}.pdf`,
  })
}
</script>
