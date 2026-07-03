<template>
  <div>
    <h1 class="page-title">梁挠度与应力估算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      FEA 前置快速验算：简支梁 / 悬臂梁常用载荷下的最大挠度与弯曲应力
    </p>

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
