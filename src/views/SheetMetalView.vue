<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="sheet-metal" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">参数</h2>
        <el-form label-width="120px">
          <el-form-item label="计算方法">
            <el-radio-group v-model="form.method">
              <el-radio value="k_factor">K 因子法</el-radio>
              <el-radio value="bend_deduction">折弯扣除</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="板厚 T">
            <el-input-number v-model="form.thickness" :min="0.3" :max="20" :precision="2" :step="0.1" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="折弯半径 R">
            <el-input-number v-model="form.bendRadius" :min="0.1" :max="50" :precision="2" />
          </el-form-item>
          <el-form-item label="K 因子">
            <el-input-number v-model="form.kFactor" :min="0.2" :max="0.5" :precision="3" :step="0.01" />
            <el-select v-model="kPreset" class="ml-2 w-36" placeholder="预设" @change="applyK">
              <el-option v-for="(p, k) in K_FACTOR_PRESETS" :key="k" :label="p.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.method === 'bend_deduction'" label="外轮廓总长">
            <el-input-number v-model="form.outerSum" :min="1" :precision="2" />
            <span class="ml-2 text-xs text-gray-500">mm（直段外尺寸之和）</span>
          </el-form-item>
          <el-form-item v-if="calcMode === 'professional'" label="回弹系数">
            <el-input-number v-model="form.springbackFactor" :min="0" :max="3" :precision="1" :step="0.1" />
            <span class="ml-2 text-xs text-gray-500">°/90° 估算</span>
          </el-form-item>
        </el-form>

        <h3 class="mb-2 text-sm font-medium">段列表</h3>
        <div class="space-y-2">
          <div
            v-for="(seg, i) in segments"
            :key="i"
            class="flex flex-wrap items-center gap-2 rounded border border-gray-200 p-2 dark:border-gray-700"
          >
            <el-select v-model="seg.type" class="w-24" size="small">
              <el-option value="straight" label="直段" />
              <el-option value="bend" label="折弯" />
            </el-select>
            <template v-if="seg.type === 'straight'">
              <span class="text-xs text-gray-500">长度</span>
              <el-input-number v-model="seg.length" :min="0" :precision="1" size="small" />
            </template>
            <template v-else>
              <span class="text-xs text-gray-500">角度°</span>
              <el-input-number v-model="seg.angle" :min="1" :max="180" size="small" />
            </template>
            <el-button v-if="segments.length > 1" type="danger" link size="small" @click="removeSeg(i)">删</el-button>
          </div>
        </div>
        <el-button class="mt-2" size="small" @click="addSeg">+ 添加段</el-button>

        <SheetMetalBendDiagram
          :thickness="form.thickness"
          :bend-radius="form.bendRadius"
          :k-factor="form.kFactor"
          :bend-angle="firstBendAngle"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">展开结果</h2>
        <el-alert v-if="result.error" :title="result.error" type="error" show-icon />
        <template v-else>
          <div class="mb-4 rounded-lg bg-primary/5 p-4 text-center">
            <dt class="text-sm text-gray-500">展开长度</dt>
            <dd class="font-mono text-3xl text-primary">
              {{ (calcMode === 'professional' && result.compensatedFlatLength ? result.compensatedFlatLength : result.flatLength)?.toFixed(2) }} mm
            </dd>
            <p class="mt-1 text-xs text-gray-500">
              {{ result.bendCount }} 道折弯 · {{ form.method === 'k_factor' ? 'K 因子法' : '折弯扣除' }}
              <span v-if="calcMode === 'professional' && result.compensatedFlatLength">（含回弹补偿）</span>
            </p>
          </div>
          <dl v-if="calcMode !== 'simple'" class="mb-4 space-y-2 text-sm">
            <div v-if="result.minFlangeRule" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>最小法兰 (4T)</dt>
              <dd class="font-mono">{{ result.minFlangeRule?.toFixed(1) }} mm</dd>
            </div>
            <div v-if="result.minStraightLength != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>最短直段</dt>
              <dd class="font-mono" :class="result.flangePass ? 'text-success' : 'text-warning'">{{ result.minStraightLength?.toFixed(1) }} mm</dd>
            </div>
          </dl>
          <el-table :data="result.details" size="small" border>
            <el-table-column label="#" width="50">
              <template #default="{ row }">{{ row.index + 1 }}</template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="70">
              <template #default="{ row }">{{ row.type === 'straight' ? '直段' : '折弯' }}</template>
            </el-table-column>
            <el-table-column label="贡献 (mm)">
              <template #default="{ row }">
                <span class="font-mono">{{ row.contribution?.toFixed(3) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <el-tag v-if="calcMode === 'professional'" class="mt-3" :type="result.pass ? 'success' : 'warning'">
            {{ result.pass ? '工艺可行' : '法兰/半径需调整' }}
          </el-tag>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { analyzeSheetMetalUnfold, K_FACTOR_PRESETS } from '@/utils/sheet-metal-calc'
import SheetMetalBendDiagram from '@/components/sheet-metal/SheetMetalBendDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct } = useCalcPage('sheet-metal')

const calcMode = ref('simple')

const form = reactive({
  method: 'k_factor',
  thickness: 1.5,
  bendRadius: 1.5,
  kFactor: 0.33,
  outerSum: 200,
  springbackFactor: 0.5,
})

const segments = ref([
  { type: 'straight', length: 50 },
  { type: 'bend', angle: 90 },
  { type: 'straight', length: 80 },
  { type: 'bend', angle: 90 },
  { type: 'straight', length: 50 },
])

const kPreset = ref('')

function applyK(key) {
  if (K_FACTOR_PRESETS[key]) form.kFactor = K_FACTOR_PRESETS[key].k
}

function addSeg() {
  segments.value.push({ type: 'straight', length: 30 })
}

function removeSeg(i) {
  segments.value.splice(i, 1)
}

const firstBendAngle = computed(() => {
  const bend = segments.value.find((s) => s.type === 'bend')
  return bend?.angle ?? 90
})

const result = computed(() =>
  analyzeSheetMetalUnfold({
    calcMode: calcMode.value,
    ...form,
    segments: segments.value,
    bendRadius: form.bendRadius || form.thickness,
  }),
)
</script>
