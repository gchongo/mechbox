<template>
  <div>
    <h1 class="page-title">焊缝强度</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">角焊缝/对接焊、三标准对照、疲劳与热影响区 (HAZ)</p>

    <el-tabs v-model="tab">
      <el-tab-pane label="角焊缝" name="fillet">
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
                <dd class="font-mono">{{ compare.throat?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>剪应力 τ</dt>
                <dd class="font-mono">{{ compare.shearStress?.toFixed(1) }} MPa</dd>
              </div>
            </dl>
            <el-table :data="compare.standards" size="small" border class="mt-4">
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
            <p class="mt-2 text-xs text-gray-500">
              最严标准: {{ compare.strictest?.standard }} (许用 {{ compare.strictest?.allowableShear?.toFixed(1) }} MPa)
            </p>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="对接焊" name="butt">
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
              <el-form-item label="钢材">
                <el-select v-model="butt.steelGrade" class="w-full">
                  <el-option v-for="(g, k) in WELD_STEEL_GRADES" :key="k" :label="g.label" :value="k" />
                </el-select>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <p class="mb-2 text-sm">正应力 σ = <span class="font-mono">{{ buttResult.normalStress?.toFixed(1) }}</span> MPa</p>
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
        :result="{ compare, fatigueResult, hazResult }"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import {
  compareWeldStandards,
  analyzeButtWeld,
  analyzeWeldFatigue,
  analyzeHAZ,
  WELD_STEEL_GRADES,
  WELD_DETAIL_CATEGORIES,
} from '@/utils/weld-calc'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'

const tab = ref('fillet')
const form = reactive({ legSize: 6, weldLength: 80, force: 12000, steelGrade: 'Q235' })
const butt = reactive({ thickness: 8, weldLength: 100, force: 50000, steelGrade: 'Q235' })
const fatigue = reactive({ stressRange: 40, cycles: 1e6, detailCategory: 'medium' })
const haz = reactive({
  heatInput: 1.5,
  plateThickness: 8,
  steelGrade: 'Q235',
  legSize: 6,
  force: 12000,
  weldLength: 80,
})

const compare = computed(() => compareWeldStandards(form))
const buttResult = computed(() => analyzeButtWeld(butt))
const fatigueResult = computed(() => analyzeWeldFatigue(fatigue))
const hazResult = computed(() => analyzeHAZ(haz))

const buttRows = computed(() => {
  const r = buttResult.value
  return [
    { standard: 'GB/T (简化)', allow: r.gb.allow, pass: r.gb.pass },
    { standard: 'EN 1993-1-8', allow: r.eurocode.allow, pass: r.eurocode.pass },
    { standard: 'AWS D1.1', allow: r.aws.allow, pass: r.aws.pass },
  ]
})

const saveStatus = computed(() => {
  if (tab.value === 'fillet') return compare.value.allPass ? 'pass' : 'fail'
  if (tab.value === 'fatigue') return fatigueResult.value?.pass ? 'pass' : 'fail'
  if (tab.value === 'haz') return hazResult.value?.pass ? 'pass' : 'fail'
  return buttResult.value.gb.pass ? 'pass' : 'fail'
})

const historySummary = computed(() => {
  if (tab.value === 'fillet') {
    return [
      { label: 'τ (MPa)', value: compare.value.shearStress?.toFixed(1) },
      { label: '三标准', value: compare.value.allPass ? '全部通过' : '有未通过' },
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
