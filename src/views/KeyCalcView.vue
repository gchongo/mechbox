<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <CalcModePanel v-model="form.calcMode" page-key="key" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <el-form-item :label="pf('torque')"><el-input-number v-model="form.torque" :min="0" /></el-form-item>
          <el-form-item :label="pf('shaftDiameter')"><el-input-number v-model="form.shaftDiameter" :min="10" /></el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('stdKey')">
            <span class="font-mono text-sm">{{ stdKey.width }} × {{ stdKey.height }} mm</span>
            <el-button class="ml-2" size="small" link @click="applyStdKey">{{ fc('apply') }}</el-button>
          </el-form-item>
          <el-form-item :label="pf('keyWidth')"><el-input-number v-model="form.keyWidth" :min="2" /></el-form-item>
          <el-form-item :label="pf('keyLength')"><el-input-number v-model="form.keyLength" :min="5" /></el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('hubLength')">
            <el-input-number v-model="form.hubLength" :min="5" />
          </el-form-item>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item :label="pf('keyCount')">
              <el-input-number v-model="form.keyCount" :min="1" :max="2" />
            </el-form-item>
            <el-form-item :label="pf('torqueAmplitude')">
              <el-input-number v-model="form.torqueAmplitude" :min="0" />
            </el-form-item>
          </template>
        </el-form>

        <KeyConnectionDiagram
          :shaft-diameter="form.shaftDiameter"
          :key-width="form.keyWidth"
          :key-length="form.keyLength"
          :key-height="stdKey.height"
        />
      </section>
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('tangentialForce') }}</dt><dd class="font-mono">{{ result.tangentialForce.toFixed(0) }} N</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('shearStress') }} <MathTex expr="\tau" /></dt><dd class="font-mono" :class="result.pass?'text-success':'text-error'">{{ result.shearStress.toFixed(1) }} MPa</dd></div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('crushStress') }} <MathTex expr="\sigma_c" /></dt><dd class="font-mono">{{ result.crushStress.toFixed(1) }} MPa {{ result.pass?'✓':'✗' }}</dd></div>
          <div v-if="result.recommendedLength" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('recommendedLength') }}</dt><dd class="font-mono">{{ result.recommendedLength.toFixed(1) }} mm</dd></div>
          <div v-if="result.shearAmplitude" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><dt>{{ pr('shearAmplitude') }}</dt><dd class="font-mono">{{ result.shearAmplitude?.toFixed(1) }} MPa</dd></div>
        </dl>
      </section>
    </div>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeKeyConnection, lookupKeySize } from '@/utils/key-calc'
import KeyConnectionDiagram from '@/components/key/KeyConnectionDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct, pf, pr, fc } = useCalcPage('key')

const form = reactive({
  calcMode: 'simple',
  torque: 200,
  shaftDiameter: 30,
  keyWidth: 8,
  keyLength: 28,
  hubLength: 28,
  keyCount: 1,
  torqueAmplitude: 80,
})

const stdKey = computed(() => lookupKeySize(form.shaftDiameter))
const result = computed(() => analyzeKeyConnection(form))

function applyStdKey() {
  form.keyWidth = stdKey.value.width
  form.keyLength = Math.round(stdKey.value.width * 3.5)
}
</script>
