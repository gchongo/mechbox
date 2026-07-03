<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="spring" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item v-if="form.calcMode !== 'simple'" label="材料">
            <el-select v-model="form.material" class="w-full">
              <el-option v-for="(m, k) in materials" :key="k" :label="m.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item label="线径 d (mm)"><el-input-number v-model="form.wireDiameter" :min="0.5" :precision="2" :step="0.1" /></el-form-item>
          <el-form-item label="中径 D (mm)"><el-input-number v-model="form.meanDiameter" :min="2" :precision="1" /></el-form-item>
          <el-form-item label="有效圈数 n"><el-input-number v-model="form.activeCoils" :min="1" :step="0.5" :precision="1" /></el-form-item>
          <el-form-item label="工作载荷 F (N)"><el-input-number v-model="form.load" :min="0" :precision="1" /></el-form-item>
          <el-form-item label="许用切应力 (MPa)"><el-input-number v-model="form.allowableShear" :min="100" /></el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item label="自由高度 L₀">
              <el-input-number v-model="form.freeLength" :min="5" :precision="1" />
            </el-form-item>
            <el-form-item label="端部形式">
              <el-select v-model="form.endType" class="w-full">
                <el-option label="两端磨平 (固定)" value="fixed" />
                <el-option label="一端自由" value="free" />
              </el-select>
            </el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">变载荷</el-divider>
            <el-form-item label="最小载荷 F_min">
              <el-input-number v-model="form.loadMin" :min="0" :precision="1" />
            </el-form-item>
            <el-form-item label="最大载荷 F_max">
              <el-input-number v-model="form.loadMax" :min="0" :precision="1" />
            </el-form-item>
            <el-form-item label="目标循环">
              <el-input-number v-model="form.targetCycles" :min="1e4" :step="1e5" />
            </el-form-item>
          </template>
        </el-form>

        <SpringDiagram
          :wire-diameter="form.wireDiameter"
          :mean-diameter="form.meanDiameter"
          :active-coils="form.activeCoils"
          :free-length="form.calcMode !== 'simple' ? form.freeLength : 0"
        />
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>刚度 k</dt><dd class="font-mono">{{ result.springRate.toFixed(2) }} N/mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>变形量 δ</dt><dd class="font-mono">{{ result.deflection.toFixed(2) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>切应力 <MathTex expr="\tau" /></dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(1) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>旋绕比 C / Wahl K</dt><dd class="font-mono">{{ result.springIndex?.toFixed(2) }} / {{ result.wahlFactor.toFixed(3) }}</dd></div>
          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>稳定性 L₀/D</dt><dd class="font-mono" :class="result.buckling?.bucklingPass ? '' : 'text-error'">{{ result.buckling?.slenderness?.toFixed(2) }} (≤ {{ result.buckling?.criticalSlenderness }})</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>压并余量</dt><dd class="font-mono">{{ result.solidPass ? '足够 ✓' : '不足 ✗' }}</dd></div>
          </template>
          <template v-if="form.calcMode === 'professional' && result.fatigueLife">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>切应力幅 τ_a</dt><dd class="font-mono">{{ result.shearAmplitude?.toFixed(1) }} MPa</dd></div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>疲劳寿命 N</dt><dd class="font-mono">{{ result.fatigueLife?.toLocaleString() }} 次</dd></div>
          </template>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="k = \frac{G d^4}{8 D^3 n}" />
          <MathTex expr="\tau = \frac{8 F D}{\pi d^3} K" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, watch } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeSpring, SPRING_MATERIALS } from '@/utils/spring-calc'
import SpringDiagram from '@/components/spring/SpringDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct } = useCalcPage('spring')

const materials = SPRING_MATERIALS
const form = reactive({
  calcMode: 'simple',
  material: 'oil_tempered',
  wireDiameter: 2,
  meanDiameter: 16,
  activeCoils: 8,
  load: 150,
  allowableShear: 600,
  freeLength: 40,
  endType: 'fixed',
  loadMin: 50,
  loadMax: 200,
  targetCycles: 1e6,
})

watch(
  () => form.material,
  (m) => {
    const mat = SPRING_MATERIALS[m]
    if (mat && m !== 'custom') form.allowableShear = mat.allowableShear
  },
)

const result = computed(() => analyzeSpring(form))
</script>
