<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="shaft" />

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane label="扭转" name="torsion" />
      <el-tab-pane label="弯扭合成" name="combined" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="130px">
          <el-form-item label="轴径 d (mm)"><el-input-number v-model="form.diameter" :min="1" /></el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" label="内径 d_i (mm)">
            <el-input-number v-model="form.innerDiameter" :min="0" :max="form.diameter - 1" />
            <span class="ml-2 text-xs text-gray-500">0 = 实心</span>
          </el-form-item>
          <el-form-item label="扭矩 T (N·m)"><el-input-number v-model="form.torque" :min="0" :precision="2" /></el-form-item>
          <el-form-item v-if="mode === 'torsion'" label="轴长 L (mm)"><el-input-number v-model="form.length" :min="10" :step="50" /></el-form-item>
          <el-form-item v-if="mode === 'combined'" label="弯矩 M (N·m)"><el-input-number v-model="form.bendingMoment" :min="0" :precision="2" /></el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" label="屈服强度 (MPa)">
            <el-input-number v-model="form.yieldStrength" :min="100" :step="50" />
          </el-form-item>
          <el-form-item :label="mode === 'combined' ? '许用合成 (MPa)' : '许用切应力 (MPa)'">
            <el-input-number v-model="form.allowable" :min="10" />
          </el-form-item>
          <template v-if="form.calcMode === 'professional' && mode === 'torsion'">
            <el-form-item label="扭转 K_τ">
              <el-input-number v-model="form.stressConcentrationTorsion" :min="1" :max="5" :step="0.1" :precision="1" />
            </el-form-item>
            <el-form-item label="扭矩幅值 (N·m)">
              <el-input-number v-model="form.torqueAmplitude" :min="0" :precision="2" />
            </el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional' && mode === 'combined'">
            <el-form-item label="弯曲 K_t">
              <el-input-number v-model="form.stressConcentrationBending" :min="1" :max="5" :step="0.1" :precision="1" />
            </el-form-item>
            <el-form-item label="扭转 K_τ">
              <el-input-number v-model="form.stressConcentrationTorsion" :min="1" :max="5" :step="0.1" :precision="1" />
            </el-form-item>
            <el-form-item label="弯矩幅值 (N·m)">
              <el-input-number v-model="form.bendingAmplitude" :min="0" :precision="2" />
            </el-form-item>
          </template>
        </el-form>

        <ShaftDiagram
          :diameter="form.diameter"
          :inner-diameter="form.innerDiameter"
          :mode="mode"
          :length="form.length"
        />
      </section>
      <section class="card-panel">
        <dl v-if="mode === 'torsion'" class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>切应力 <MathTex expr="\tau" /></dt><dd class="font-mono" :class="torsionResult.pass?'text-success':'text-error'">{{ torsionResult.shearStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>扭转角 <MathTex expr="\theta" /></dt><dd class="font-mono">{{ torsionResult.twistAngle.toFixed(4) }}°</dd></div>
          <div v-if="form.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>最小轴径</dt><dd class="font-mono">{{ torsionResult.minDiameter?.toFixed(1) }} mm</dd></div>
          <div v-if="form.calcMode === 'professional' && torsionResult.peakShearStress" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>峰值切应力</dt><dd class="font-mono">{{ torsionResult.peakShearStress.toFixed(2) }} MPa</dd></div>
          <div v-if="torsionResult.fatigueAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>疲劳幅值 / 持久限</dt><dd class="font-mono">{{ torsionResult.fatigueAmplitude?.toFixed(1) }} / {{ torsionResult.fatigueEndurance?.toFixed(0) }} MPa</dd></div>
        </dl>
        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>弯曲 <MathTex expr="\sigma" /></dt><dd class="font-mono">{{ combinedResult.bendingStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>扭转 <MathTex expr="\tau" /></dt><dd class="font-mono">{{ combinedResult.torsionStress.toFixed(2) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>合成 <MathTex expr="\sigma_{eq}" /></dt><dd class="font-mono" :class="combinedResult.pass?'text-success':'text-error'">{{ combinedResult.equivalentStress.toFixed(2) }} MPa {{ combinedResult.pass?'✓':'✗' }}</dd></div>
          <div v-if="combinedResult.utilization" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>利用率</dt><dd class="font-mono">{{ (combinedResult.utilization * 100).toFixed(1) }}%</dd></div>
        </dl>
        <div class="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex v-if="mode === 'combined'" expr="\sigma_{eq} = \sqrt{\sigma^2 + 3\tau^2}" block />
          <MathTex v-else expr="\tau = \frac{16T}{\pi d^3}" block />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeShaftTorsion } from '@/utils/shaft-calc'
import { analyzeShaftCombined } from '@/utils/shaft-combined'
import ShaftDiagram from '@/components/shaft/ShaftDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct } = useCalcPage('shaft')
const mode = ref('torsion')
const form = reactive({
  calcMode: 'simple',
  diameter: 30,
  innerDiameter: 0,
  torque: 200,
  length: 500,
  bendingMoment: 150,
  allowable: 60,
  yieldStrength: 235,
  stressConcentrationBending: 1.5,
  stressConcentrationTorsion: 1.3,
  torqueAmplitude: 80,
  bendingAmplitude: 60,
})
const torsionResult = computed(() =>
  analyzeShaftTorsion({
    ...form,
    allowableShear: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)
const combinedResult = computed(() =>
  analyzeShaftCombined({
    ...form,
    allowableStress: form.calcMode === 'simple' ? form.allowable : undefined,
  }),
)
</script>
