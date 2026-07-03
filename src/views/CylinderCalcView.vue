<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="cylinder" />

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane :label="pf('tabHydraulic')" name="hydraulic" />
      <el-tab-pane :label="pf('tabPneumatic')" name="pneumatic" />
    </el-tabs>
    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <CalcFormItem :label="pf('boreDiameter')"><el-input-number v-model="form.boreDiameter" :min="10" /></CalcFormItem>
          <CalcFormItem :label="pf('rodDiameter')"><el-input-number v-model="form.rodDiameter" :min="0" /></CalcFormItem>
          <el-form-item :label="mode === 'hydraulic' ? pf('pressureHydraulic') : pf('pressurePneumatic')">
            <el-input-number v-model="form.pressure" :min="0.1" :precision="2" :step="0.1" />
          </el-form-item>
          <CalcFormItem :label="pf('flowRate')"><el-input-number v-model="form.flowRate" :min="0" :precision="1" /></CalcFormItem>
          <CalcFormItem v-if="mode === 'pneumatic'" :label="pf('efficiency')">
            <el-input-number v-model="form.efficiency" :min="0.5" :max="1" :precision="2" :step="0.05" />
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('externalLoad')"><el-input-number v-model="form.externalLoad" :min="0" :step="100" /></CalcFormItem>
            <CalcFormItem :label="pf('strokeLength')"><el-input-number v-model="form.strokeLength" :min="0" :step="50" /></CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('loadMass')"><el-input-number v-model="form.loadMass" :min="0" :precision="1" /></CalcFormItem>
            <CalcFormItem :label="pf('acceleration')"><el-input-number v-model="form.acceleration" :min="0" :precision="2" /></CalcFormItem>
          </template>
        </el-form>

        <CylinderDiagram
          :variant="mode"
          :bore-diameter="form.boreDiameter"
          :rod-diameter="form.rodDiameter"
          :stroke-length="form.strokeLength"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('extendForce')" /><dd class="font-mono text-lg">{{ result.extendForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('retractForce')" /><dd class="font-mono">{{ result.retractForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('extendVelocity')" /><dd class="font-mono">{{ result.extendVelocity.toFixed(1) }} mm/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('retractVelocity')" /><dd class="font-mono">{{ result.retractVelocity.toFixed(1) }} mm/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('extendFlow')" /><dd class="font-mono">{{ result.extendFlow.toFixed(2) }} L/min</dd></div>
          <div v-if="result.bucklingLoad" class="flex justify-between rounded bg-gray-50 p-3"><ResultLabel :text="pr('bucklingLoad')" /><dd class="font-mono">{{ result.bucklingLoad?.toFixed(0) }} N {{ result.bucklingPass ? '✓' : '✗' }}</dd></div>
          <div v-if="result.cycleTimeExtend" class="flex justify-between rounded bg-gray-50 p-3"><ResultLabel :text="pr('cycleTime')" /><dd class="font-mono">{{ result.cycleTimeExtend?.toFixed(2) }} / {{ result.cycleTimeRetract?.toFixed(2) }} s</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <MathTex expr="F = p \cdot A / 1000" />
          <MathTex expr="v = \frac{Q \times 10^6}{60 A},\quad Q = \frac{A v \times 60}{10^6}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed, ref } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeHydraulicCylinder, analyzePneumaticCylinder } from '@/utils/hydraulic-calc'
import CylinderDiagram from '@/components/cylinder/CylinderDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct, pf, pr } = useCalcPage('cylinder')
const mode = ref('hydraulic')
const form = reactive({
  calcMode: 'simple',
  boreDiameter: 50,
  rodDiameter: 20,
  pressure: 16,
  flowRate: 20,
  efficiency: 0.85,
  externalLoad: 8000,
  strokeLength: 300,
  loadMass: 500,
  acceleration: 0.5,
})
const result = computed(() =>
  mode.value === 'pneumatic' ? analyzePneumaticCylinder(form) : analyzeHydraulicCylinder(form),
)
</script>
