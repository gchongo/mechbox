<template>
  <div>
    <h1 class="page-title">焊缝强度</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">角焊缝/对接焊、三标准对照、疲劳与热影响区 (HAZ)</p>

    <el-tabs v-model="tab">
      <el-tab-pane label="角焊缝" name="fillet">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="form.calcMode">
              <el-radio-button value="simple">简化</el-radio-button>
              <el-radio-button value="complete">完整</el-radio-button>
              <el-radio-button value="professional">专业</el-radio-button>
            </el-radio-group>
            <p class="w-full text-xs text-gray-500">
              <template v-if="form.calcMode === 'simple'">GB/T 单标准剪应力校核。</template>
              <template v-else-if="form.calcMode === 'complete'">GB / Eurocode / AWS 三标准对照。</template>
              <template v-else>偏心合成应力 + HAZ + 疲劳链式校核。</template>
            </p>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="焊脚 h">
                <el-input-number v-model="form.legSize" :min="3" :step="1" />
                <span class="ml-2 text-sm text-gray-500">mm</span>
              </el-form-item>
              <el-form-item label="焊缝长 L">
                <el-input-number v-model="form.weldLength" :min="10" />
              </el-form-item>
              <el-form-item label="载荷 F">
                <el-input-number v-model="form.force" :min="0" :step="100" />
                <span class="ml-2 text-sm text-gray-500">N</span>
              </el-form-item>
              <template v-if="form.calcMode === 'professional'">
                <el-form-item label="偏心距 e (mm)">
                  <el-input-number v-model="form.eccentricity" :min="0" :precision="1" />
                </el-form-item>
                <el-form-item label="热输入 (kJ/mm)">
                  <el-input-number v-model="form.heatInput" :min="0.5" :max="5" :precision="2" :step="0.1" />
                </el-form-item>
                <el-form-item label="板厚 (mm)">
                  <el-input-number v-model="form.plateThickness" :min="3" />
                </el-form-item>
                <el-form-item label="应力幅 Δτ">
                  <el-input-number v-model="form.stressRange" :min="0" :precision="1" />
                </el-form-item>
              </template>
              <el-form-item label="钢材等级">
                <el-select v-model="form.steelGrade" class="w-full">
                  <el-option v-for="(g, k) in WELD_STEEL_GRADES" :key="k" :label="g.label" :value="k" />
                </el-select>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>有效厚度 a</dt>
                <dd class="font-mono">{{ filletResult.throat?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>剪应力 τ</dt>
                <dd class="font-mono">{{ filletResult.shearStress?.toFixed(1) }} MPa</dd>
              </div>
              <template v-if="filletResult.combined">
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <dt>合成应力 σ_eq</dt>
                  <dd class="font-mono" :class="filletResult.combinedPass ? 'text-success' : 'text-error'">
                    {{ filletResult.combined.equivalentStress?.toFixed(1) }} MPa
                  </dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <dt>HAZ 许用 / 焊缝</dt>
                  <dd class="font-mono">{{ filletResult.haz?.hazAllowShear }} / {{ filletResult.haz?.weldStress }} MPa</dd>
                </div>
              </template>
            </dl>
            <el-table v-if="filletResult.standards?.length" :data="filletResult.standards" size="small" border class="mt-4">
              <el-table-column prop="standard" label="标准" />
              <el-table-column label="许用 (MPa)">
                <template #default="{ row }">{{ row.allowableShear?.toFixed(1) }}</template>
              </el-table-column>
              <el-table-column label="利用率">
                <template #default="{ row }">
                  <span :class="row.pass ? 'text-success' : 'text-error'">
                    {{ (row.utilization * 100).toFixed(1) }}% {{ row.pass ? '✓' : '✗' }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
            <p v-if="filletResult.strictest" class="mt-2 text-xs text-gray-500">
              最严标准: {{ filletResult.strictest?.standard }} (许用 {{ filletResult.strictest?.allowableShear?.toFixed(1) }} MPa)
            </p>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="对接焊" name="butt">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="butt.calcMode">
              <el-radio-button value="simple">简化</el-radio-button>
              <el-radio-button value="complete">完整</el-radio-button>
              <el-radio-button value="professional">专业</el-radio-button>
            </el-radio-group>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="板厚 t">
                <el-input-number v-model="butt.thickness" :min="3" />
              </el-form-item>
              <el-form-item label="焊缝长 L">
                <el-input-number v-model="butt.weldLength" :min="10" />
              </el-form-item>
              <el-form-item label="拉力 F">
                <el-input-number v-model="butt.force" :min="0" :step="500" />
              </el-form-item>
              <el-form-item v-if="butt.calcMode === 'professional'" label="熔透效率">
                <el-input-number v-model="butt.penetrationEfficiency" :min="0.5" :max="1" :step="0.05" :precision="2" />
              </el-form-item>
              <el-form-item v-if="butt.calcMode === 'professional'" label="应力集中 Kf">
                <el-input-number v-model="butt.stressConcentration" :min="1" :max="3" :step="0.1" :precision="1" />
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <p class="mb-2 text-sm">
              正应力 σ = <span class="font-mono">{{ buttResult.normalStress?.toFixed(1) }}</span> MPa
              <span v-if="buttResult.effectiveStress"> · 有效 σ = <span class="font-mono">{{ buttResult.effectiveStress?.toFixed(1) }}</span> MPa</span>
            </p>
            <el-table :data="buttRows" size="small" border>
              <el-table-column prop="standard" label="标准" />
              <el-table-column prop="allow" label="许用 (MPa)" />
              <el-table-column label="校核">
                <template #default="{ row }">
                  <el-tag :type="row.pass ? 'success' : 'danger'" size="small">{{ row.pass ? '通过' : '未通过' }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="焊缝疲劳" name="fatigue">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="应力幅 Δτ">
                <el-input-number v-model="fatigue.stressRange" :min="1" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">MPa</span>
              </el-form-item>
              <el-form-item label="循环次数 N">
                <el-input-number v-model="fatigue.cycles" :min="1000" :step="10000" />
              </el-form-item>
              <el-form-item label="细节类别">
                <el-select v-model="fatigue.detailCategory" class="w-full">
                  <el-option v-for="(d, k) in WELD_DETAIL_CATEGORIES" :key="k" :label="d.label" :value="k" />
                </el-select>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <el-alert v-if="fatigueResult?.error" :title="fatigueResult.error" type="warning" show-icon />
            <dl v-else class="space-y-2 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <dt>估算寿命</dt>
                <dd class="font-mono text-primary">{{ fatigueResult.estimatedLife?.toLocaleString() }} 次</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>N 下许用幅</dt>
                <dd class="font-mono">{{ fatigueResult.allowableAtCycles }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>疲劳极限</dt>
                <dd class="font-mono">{{ fatigueResult.enduranceLimit }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>校核</dt>
                <dd :class="fatigueResult.pass ? 'text-success' : 'text-error'">{{ fatigueResult.pass ? '通过' : '未通过' }}</dd>
              </div>
            </dl>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="热影响区 HAZ" name="haz">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="热输入 Q">
                <el-input-number v-model="haz.heatInput" :min="0.5" :max="5" :step="0.1" :precision="2" />
                <span class="ml-2 text-xs text-gray-500">kJ/mm</span>
              </el-form-item>
              <el-form-item label="板厚 t">
                <el-input-number v-model="haz.plateThickness" :min="3" />
              </el-form-item>
              <el-form-item label="钢材">
                <el-select v-model="haz.steelGrade" class="w-full">
                  <el-option v-for="(g, k) in WELD_STEEL_GRADES" :key="k" :label="g.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="焊脚 h">
                <el-input-number v-model="haz.legSize" :min="3" />
              </el-form-item>
              <el-form-item label="载荷 F">
                <el-input-number v-model="haz.force" :min="0" :step="100" />
              </el-form-item>
              <el-form-item label="焊缝长 L">
                <el-input-number v-model="haz.weldLength" :min="10" />
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between rounded bg-primary/5 p-3">
                <dt>HAZ 宽度 (估算)</dt>
                <dd class="font-mono text-primary">{{ hazResult.hazWidthMm }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>HAZ 许用剪应力</dt>
                <dd class="font-mono">{{ hazResult.hazAllowShear }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>母材许用</dt>
                <dd class="font-mono">{{ hazResult.baseAllowShear }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>焊缝应力</dt>
                <dd class="font-mono" :class="hazResult.pass ? 'text-success' : 'text-error'">
                  {{ hazResult.weldStress }} MPa
                </dd>
              </div>
            </dl>
            <p class="mt-3 text-xs text-gray-500">{{ hazResult.note }}</p>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="weld"
        :title="`焊缝 ${tab}`"
        :status="saveStatus"
        :summary="historySummary"
        :input="{ tab, form, butt, fatigue, haz }"
        :result="{ filletResult, fatigueResult, hazResult }"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import {
  analyzeFilletWeld,
  analyzeButtWeld,
  analyzeWeldFatigue,
  analyzeHAZ,
  WELD_STEEL_GRADES,
  WELD_DETAIL_CATEGORIES,
} from '@/utils/weld-calc'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'

const tab = ref('fillet')
const form = reactive({
  calcMode: 'complete',
  legSize: 6,
  weldLength: 80,
  force: 12000,
  steelGrade: 'Q235',
  eccentricity: 20,
  heatInput: 1.5,
  plateThickness: 8,
  stressRange: 35,
})
const butt = reactive({
  calcMode: 'complete',
  thickness: 8,
  weldLength: 100,
  force: 50000,
  steelGrade: 'Q235',
  penetrationEfficiency: 1,
  stressConcentration: 1.2,
})
const fatigue = reactive({ stressRange: 40, cycles: 1e6, detailCategory: 'medium' })
const haz = reactive({
  heatInput: 1.5,
  plateThickness: 8,
  steelGrade: 'Q235',
  legSize: 6,
  force: 12000,
  weldLength: 80,
})

const filletResult = computed(() => analyzeFilletWeld(form))
const buttResult = computed(() => analyzeButtWeld(butt))
const fatigueResult = computed(() => analyzeWeldFatigue(fatigue))
const hazResult = computed(() => analyzeHAZ(haz))

const buttRows = computed(() => {
  const r = buttResult.value
  if (butt.calcMode === 'simple') {
    return [{ standard: 'GB/T (简化)', allow: r.gb.allow, pass: r.gb.pass }]
  }
  return [
    { standard: 'GB/T (简化)', allow: r.gb.allow, pass: r.gb.pass },
    { standard: 'EN 1993-1-8', allow: r.eurocode.allow, pass: r.eurocode.pass },
    { standard: 'AWS D1.1', allow: r.aws.allow, pass: r.aws.pass },
  ]
})

const saveStatus = computed(() => {
  if (tab.value === 'fillet') return filletResult.value.allPass !== false && (filletResult.value.pass ?? filletResult.value.allPass) ? 'pass' : 'fail'
  if (tab.value === 'fatigue') return fatigueResult.value?.pass ? 'pass' : 'fail'
  if (tab.value === 'haz') return hazResult.value?.pass ? 'pass' : 'fail'
  return buttResult.value.gb.pass ? 'pass' : 'fail'
})

const historySummary = computed(() => {
  if (tab.value === 'fillet') {
    return [
      { label: 'τ (MPa)', value: filletResult.value.shearStress?.toFixed(1) },
      { label: '模式', value: form.calcMode },
      { label: '校核', value: (filletResult.value.allPass ?? filletResult.value.pass) ? '通过' : '未通过' },
    ]
  }
  if (tab.value === 'fatigue' && !fatigueResult.value?.error) {
    return [
      { label: 'Δτ', value: `${fatigue.stressRange} MPa` },
      { label: '寿命', value: fatigueResult.value.estimatedLife?.toLocaleString() },
    ]
  }
  if (tab.value === 'haz') {
    return [
      { label: 'HAZ 宽', value: `${hazResult.value.hazWidthMm} mm` },
      { label: 'HAZ 许用', value: `${hazResult.value.hazAllowShear} MPa` },
    ]
  }
  return [{ label: 'σ', value: `${buttResult.value.normalStress?.toFixed(1)} MPa` }]
})
</script>
