<template>
  <div>
    <h1 class="page-title">梁挠度与应力估算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      FEA 前置快速验算：简支梁 / 悬臂梁常用载荷下的最大挠度与弯曲应力
    </p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">解析解应力与挠度校核。</template>
          <template v-else-if="form.calcMode === 'complete'">最小截面需求、利用率、长细比预警。</template>
          <template v-else>动载系数、应力集中、疲劳应力幅。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="148px">
          <el-form-item label="梁型">
            <el-select v-model="form.caseId" class="w-full">
              <el-option v-for="c in caseOptions" :key="c.id" :label="c.label" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="截面类型">
            <el-select v-model="form.sectionType" class="w-full">
              <el-option v-for="(s, k) in SECTION_TYPES" :key="k" :label="s.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item v-for="p in sectionParams" :key="p.key" :label="p.label">
            <el-input-number v-model="form[p.key]" :min="p.min ?? 0.1" :precision="2" />
          </el-form-item>
          <el-form-item label="跨度 L">
            <el-input-number v-model="form.spanLength" :min="10" :max="10000" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item :label="loadLabel">
            <el-input-number v-model="form.load" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="弹性模量 E">
            <el-input-number v-model="form.elasticModulus" :min="1000" :step="10000" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </el-form-item>
          <el-form-item label="许用应力">
            <el-input-number v-model="form.allowableStress" :min="1" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </el-form-item>
          <el-form-item label="许用挠度">
            <el-input-number v-model="form.allowableDeflection" :min="0.001" :precision="4" :step="0.01" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item label="动载系数 K_d">
              <el-input-number v-model="form.dynamicFactor" :min="1" :max="3" :step="0.1" :precision="1" />
            </el-form-item>
            <el-form-item label="应力集中 K_t">
              <el-input-number v-model="form.stressConcentration" :min="1" :max="4" :step="0.1" :precision="1" />
            </el-form-item>
            <el-form-item label="载荷 F_min / F_max">
              <el-input-number v-model="form.loadMin" :min="0" class="w-28" />
              <el-input-number v-model="form.loadMax" :min="0" class="ml-2 w-28" />
            </el-form-item>
          </template>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <el-alert v-if="result.error" :title="result.error" type="error" show-icon />
        <template v-else>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>最大弯矩 M</dt>
              <dd class="font-mono">{{ result.moment?.toFixed(0) }} N·mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>弯曲应力 σ</dt>
              <dd class="font-mono" :class="result.stressPass ? 'text-success' : 'text-error'">
                {{ result.stress?.toFixed(1) }} MPa {{ result.stressPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>最大挠度 δ</dt>
              <dd class="font-mono" :class="result.deflectionPass ? 'text-success' : 'text-error'">
                {{ result.deflection?.toFixed(4) }} mm {{ result.deflectionPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>惯性矩 I</dt>
              <dd class="font-mono">{{ result.inertia?.toExponential(3) }} mm⁴</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>截面模量 W</dt>
              <dd class="font-mono">{{ result.sectionModulus?.toFixed(1) }} mm³</dd>
            </div>
            <template v-if="form.calcMode !== 'simple'">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>应力 / 挠度利用率</dt>
                <dd class="font-mono">{{ ((result.stressUtilization ?? 0) * 100).toFixed(1) }}% / {{ ((result.deflectionUtilization ?? 0) * 100).toFixed(1) }}%</dd>
              </div>
              <div v-if="result.slendernessWarning" class="text-xs text-amber-600">长细比 L/h 偏大，需考虑稳定性</div>
            </template>
            <div v-if="result.stressAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt>疲劳应力幅</dt>
              <dd class="font-mono">{{ result.stressAmplitude?.toFixed(1) }} MPa</dd>
            </div>
          </dl>
          <el-tag class="mt-4" :type="result.pass ? 'success' : 'danger'">
            {{ result.pass ? '强度与刚度均满足' : '未通过校核' }}
          </el-tag>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { analyzeBeam, BEAM_CASES, SECTION_TYPES } from '@/utils/beam-calc'

const form = reactive({
  calcMode: 'simple',
  caseId: 'simply_center',
  sectionType: 'solid_round',
  diameter: 30,
  innerDiameter: 20,
  width: 20,
  height: 30,
  spanLength: 500,
  load: 2000,
  elasticModulus: 210000,
  allowableStress: 160,
  allowableDeflection: 0.5,
  dynamicFactor: 1.2,
  stressConcentration: 1.5,
  loadMin: 500,
  loadMax: 2000,
})

const caseOptions = Object.values(BEAM_CASES)
const sectionParams = computed(() => SECTION_TYPES[form.sectionType]?.params ?? [])
const loadLabel = computed(() => BEAM_CASES[form.caseId]?.loadLabel ?? '载荷')

watch(
  () => form.spanLength,
  (L) => {
    if (form.allowableDeflection === 0.5 || form.allowableDeflection === form.spanLength / 1000) {
      form.allowableDeflection = L / 1000
    }
  },
)

const result = computed(() => analyzeBeam(form))
</script>
