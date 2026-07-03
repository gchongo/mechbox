<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="chain" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="140px">
          <el-form-item :label="pf('pitch')"><el-input-number v-model="form.pitch" :min="5" :step="1.27" :precision="2" /></el-form-item>
          <el-form-item :label="pf('driverTeeth')"><el-input-number v-model="form.driverTeeth" :min="11" /></el-form-item>
          <el-form-item :label="pf('drivenTeeth')"><el-input-number v-model="form.drivenTeeth" :min="11" /></el-form-item>
          <el-form-item :label="pf('centerDistance')"><el-input-number v-model="form.centerDistance" :min="100" :step="50" /></el-form-item>
          <el-form-item :label="pf('rpm')"><el-input-number v-model="form.rpm" :min="0" /></el-form-item>
          <el-form-item :label="pf('power')"><el-input-number v-model="form.power" :min="0" :precision="2" /></el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item :label="pf('allowTension')"><el-input-number v-model="form.allowTension" :min="1000" :step="1000" /></el-form-item>
            <el-form-item :label="pf('maxChainSpeed')"><el-input-number v-model="form.maxChainSpeed" :min="5" :max="25" /></el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item :label="pf('serviceFactor')"><el-input-number v-model="form.serviceFactor" :min="1" :max="2" :step="0.1" :precision="1" /></el-form-item>
            <el-form-item :label="pf('strands')"><el-input-number v-model="form.strands" :min="1" :max="4" /></el-form-item>
          </template>
        </el-form>

        <DriveLayoutDiagram
          variant="chain"
          :driver-teeth="form.driverTeeth"
          :driven-teeth="form.drivenTeeth"
          :pitch="form.pitch"
          :center-distance="form.centerDistance"
        />
      </section>
      <section class="card-panel">
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('ratio') }}</dt><dd class="font-mono">{{ result.ratio.toFixed(2) }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('chainLength') }}</dt><dd class="font-mono">{{ result.chainLength.toFixed(0) }} mm</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('links') }}</dt><dd class="font-mono">{{ result.links }}</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('chainSpeed') }}</dt><dd class="font-mono" :class="result.speedPass === false ? 'text-error' : ''">{{ result.chainSpeed.toFixed(2) }} m/s</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('chainTension') }}</dt><dd class="font-mono" :class="result.tensionPass === false ? 'text-error' : ''">{{ result.chainTension.toFixed(0) }} N</dd></div>
          <div v-if="result.estimatedLifeHours" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('lifeHours') }}</dt><dd class="font-mono">{{ Math.round(result.estimatedLifeHours).toLocaleString() }} h</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { analyzeChainDrive } from '@/utils/chain-calc'
import DriveLayoutDiagram from '@/components/drive/DriveLayoutDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct, pf, pr } = useCalcPage('chain')
const form = reactive({
  calcMode: 'simple',
  pitch: 15.875,
  driverTeeth: 19,
  drivenTeeth: 57,
  centerDistance: 500,
  rpm: 720,
  power: 7.5,
  allowTension: 20000,
  maxChainSpeed: 15,
  serviceFactor: 1.3,
  strands: 1,
})
const result = computed(() => analyzeChainDrive(form))
</script>
