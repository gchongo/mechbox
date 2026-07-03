<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="belt" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item :label="pf('driverDiameter')"><el-input-number v-model="form.driverDiameter" :min="50" /></el-form-item>
          <el-form-item :label="pf('drivenDiameter')"><el-input-number v-model="form.drivenDiameter" :min="50" /></el-form-item>
          <el-form-item :label="pf('centerDistance')"><el-input-number v-model="form.centerDistance" :min="100" :step="50" /></el-form-item>
          <el-form-item :label="pf('rpm')"><el-input-number v-model="form.rpm" :min="0" /></el-form-item>
          <el-form-item :label="pf('power')"><el-input-number v-model="form.power" :min="0" :precision="2" /></el-form-item>
          <el-form-item v-if="form.calcMode === 'simple'" :label="pf('wrapAngle')"><el-input-number v-model="form.wrapAngle" :min="120" :max="180" /></el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item :label="pf('powerPerBelt')"><el-input-number v-model="form.powerPerBelt" :min="0.5" :precision="1" :step="0.5" /></el-form-item>
            <el-form-item :label="pf('maxBeltSpeed')"><el-input-number v-model="form.maxBeltSpeed" :min="10" :max="40" /></el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item :label="pf('serviceFactor')"><el-input-number v-model="form.serviceFactor" :min="1" :max="2" :step="0.1" :precision="1" /></el-form-item>
          </template>
        </el-form>

        <DriveLayoutDiagram
          variant="belt"
          :driver-diameter="form.driverDiameter"
          :driven-diameter="form.drivenDiameter"
          :center-distance="form.centerDistance"
          :wrap-angle="result.wrapAngle ?? form.wrapAngle"
        />
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('ratio') }}</dt><dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('beltLength') }}</dt><dd class="font-mono">{{ result.beltLength.toFixed(0) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('beltSpeedWrap') }}</dt><dd class="font-mono">{{ result.beltSpeed.toFixed(2) }} m/s · {{ result.wrapAngle?.toFixed(1) }}°</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('tightSide') }}</dt><dd class="font-mono">{{ result.F1.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('slackSide') }}</dt><dd class="font-mono">{{ result.F2.toFixed(0) }} N</dd></div>
          <div v-if="result.beltCount" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('beltCount') }}</dt><dd class="font-mono">{{ result.beltCount }} 根</dd></div>
          <div v-if="result.estimatedLifeHours" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('lifeHours') }}</dt><dd class="font-mono">{{ Math.round(result.estimatedLifeHours).toLocaleString() }} h</dd></div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="L = 2C + \frac{\pi(D_1+D_2)}{2} + \frac{(D_2-D_1)^2}{4C}" />
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeBeltDrive } from '@/utils/belt-calc'
import DriveLayoutDiagram from '@/components/drive/DriveLayoutDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct, pf, pr } = useCalcPage('belt')

const form = reactive({
  calcMode: 'simple',
  driverDiameter: 120,
  drivenDiameter: 300,
  centerDistance: 500,
  rpm: 1450,
  power: 5.5,
  wrapAngle: 180,
  powerPerBelt: 2.5,
  maxBeltSpeed: 30,
  serviceFactor: 1.2,
})

const result = computed(() => analyzeBeltDrive(form))
</script>
