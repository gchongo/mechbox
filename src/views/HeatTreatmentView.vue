<template>
  <div>
    <h1 class="page-title">热处理硬度预测</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      碳当量、Jominy 端淬曲线、截面淬透性与回火硬度工程估算
    </p>

    <el-tabs v-model="tab">
      <el-tab-pane label="成分与淬透性" name="hardenability">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="100px">
              <el-form-item label="钢种预设">
                <el-select v-model="preset" class="w-full" @change="applyPreset">
                  <el-option v-for="(p, k) in STEEL_PRESETS" :key="k" :label="p.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item v-for="el in elements" :key="el.key" :label="el.label">
                <el-input-number v-model="comp[el.key]" :min="0" :max="5" :step="0.01" :precision="2" />
                <span class="ml-2 text-xs text-gray-500">%</span>
              </el-form-item>
              <el-form-item label="奥氏体晶粒度">
                <el-input-number v-model="grainSize" :min="1" :max="8" />
                <span class="ml-2 text-xs text-gray-500">ASTM</span>
              </el-form-item>
              <el-form-item label="零件直径">
                <el-input-number v-model="partDiameter" :min="5" :max="300" />
                <span class="ml-2 text-xs text-gray-500">mm</span>
              </el-form-item>
            </el-form>
          </section>

          <section class="card-panel">
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <dt>碳当量 CE</dt>
                <dd class="font-mono text-lg text-primary">{{ result.carbonEquivalent }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>焊接性</dt>
                <dd>{{ result.weldability }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>理想临界直径 D<sub>I</sub></dt>
                <dd class="font-mono">{{ result.hardenability?.idealCriticalDiameter }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>表面 HRC（估算）</dt>
                <dd class="font-mono">{{ result.hardenability?.surfaceHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>心部 HRC（估算）</dt>
                <dd class="font-mono">{{ result.hardenability?.estimatedCoreHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>淬透性判定</dt>
                <dd>{{ result.hardenability?.verdict }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section class="card-panel mt-6">
          <h3 class="mb-2 font-semibold">Jominy 端淬曲线</h3>
          <div ref="jominyChartRef" class="min-h-[360px]" />
        </section>
      </el-tab-pane>

      <el-tab-pane label="回火硬度" name="temper">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="淬火硬度 HRC">
                <el-input-number v-model="asQuenchedHRC" :min="20" :max="65" :precision="1" />
              </el-form-item>
              <el-form-item label="回火温度">
                <el-input-number v-model="temperTemp" :min="150" :max="700" />
                <span class="ml-2 text-xs text-gray-500">°C</span>
              </el-form-item>
              <el-form-item label="保温时间">
                <el-input-number v-model="temperTime" :min="0.1" :max="24" :step="0.5" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">h</span>
              </el-form-item>
            </el-form>
            <p class="text-xs text-gray-500">
              基于 Hollomon-Jaffe 参数与温度/时间折减的简化模型，适用于调质范围估算。
            </p>
          </section>
          <section class="card-panel">
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <dt>回火后 HRC</dt>
                <dd class="font-mono text-lg text-primary">{{ temperResult.temperedHRC }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>硬度下降</dt>
                <dd class="font-mono">{{ temperResult.hardnessDrop }} HRC</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>H-J 参数</dt>
                <dd class="font-mono">{{ temperResult.hollomonJaffe }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>状态</dt>
                <dd>{{ temperResult.temperState }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  STEEL_PRESETS,
  analyzeHeatTreatment,
  calcTemperedHardness,
} from '@/utils/heat-treatment-calc'

const tab = ref('hardenability')
const preset = ref('4140')
const comp = ref({ ...STEEL_PRESETS['4140'] })
const grainSize = ref(7)
const partDiameter = ref(50)
const asQuenchedHRC = ref(55)
const temperTemp = ref(550)
const temperTime = ref(2)
const jominyChartRef = ref(null)
let plotly = null

const elements = [
  { key: 'C', label: 'C' },
  { key: 'Mn', label: 'Mn' },
  { key: 'Cr', label: 'Cr' },
  { key: 'Mo', label: 'Mo' },
  { key: 'V', label: 'V' },
  { key: 'Ni', label: 'Ni' },
  { key: 'Cu', label: 'Cu' },
]

const result = computed(() =>
  analyzeHeatTreatment({
    composition: comp.value,
    grainSize: grainSize.value,
    partDiameter: partDiameter.value,
    temperTemp: temperTemp.value,
    temperTime: temperTime.value,
  }),
)

const temperResult = computed(() => {
  const hrc = asQuenchedHRC.value || result.value.hardenability?.surfaceHRC || 55
  return calcTemperedHardness(hrc, temperTemp.value, temperTime.value)
})

function applyPreset(key) {
  const p = STEEL_PRESETS[key]
  if (p) comp.value = { ...p }
}

async function renderJominyChart() {
  if (!jominyChartRef.value) return
  const curve = result.value.jominyCurve ?? []
  if (!curve.length) return
  if (!plotly) plotly = await import('plotly.js-dist-min')
  await plotly.react(
    jominyChartRef.value,
    [
      {
        x: curve.map((p) => p.distance),
        y: curve.map((p) => p.hrc),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'HRC',
        line: { color: '#409eff' },
      },
    ],
    {
      xaxis: { title: '距淬火端距离 (mm)' },
      yaxis: { title: 'HRC' },
      height: 360,
      margin: { t: 24, l: 48, b: 40, r: 16 },
    },
    { responsive: true, displayModeBar: false },
  )
}

watch([result, tab], () => {
  if (tab.value === 'hardenability') renderJominyChart()
})

watch(
  () => result.value.hardenability?.surfaceHRC,
  (v) => {
    if (v) asQuenchedHRC.value = v
  },
  { immediate: true },
)

onMounted(renderJominyChart)
onBeforeUnmount(() => {
  if (jominyChartRef.value && plotly) plotly.purge(jominyChartRef.value)
})
</script>
