<template>
  <div>
    <h1 class="page-title">齿轮强度计算</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      Lewis 简化估算 + ISO 6336 完整校核（接触 + 弯曲安全系数）
    </p>

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane label="ISO 6336 完整版" name="iso6336" />
      <el-tab-pane label="Lewis 简化版" name="simple" />
    </el-tabs>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="140px">
          <el-form-item label="模数 m (mm)">
            <el-input-number v-model="form.module" :min="0.5" :precision="2" :step="0.5" />
          </el-form-item>
          <el-form-item label="小齿轮齿数 z₁">
            <el-input-number v-model="form.pinionTeeth" :min="17" :step="1" />
          </el-form-item>
          <el-form-item v-if="mode === 'iso6336'" label="大齿轮齿数 z₂">
            <el-input-number v-model="form.gearTeeth" :min="17" :step="1" />
          </el-form-item>
          <el-form-item v-else label="齿数 z">
            <el-input-number v-model="form.pinionTeeth" :min="12" :step="1" />
          </el-form-item>
          <el-form-item label="齿宽 b (mm)">
            <el-input-number v-model="form.faceWidth" :min="1" :precision="1" />
          </el-form-item>
          <el-form-item label="扭矩 T (N·m)">
            <el-input-number v-model="form.torque" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="转速 n (rpm)">
            <el-input-number v-model="form.rpm" :min="0" :step="100" />
          </el-form-item>
          <el-form-item label="压力角 (°)">
            <el-input-number v-model="form.pressureAngle" :min="14.5" :max="25" :precision="1" />
          </el-form-item>
          <template v-if="mode === 'iso6336'">
            <el-form-item label="螺旋角 β (°)">
              <el-input-number v-model="form.helixAngle" :min="0" :max="30" :precision="1" />
            </el-form-item>
            <el-form-item label="小齿轮材料">
              <el-select v-model="form.pinionMaterial" class="w-full">
                <el-option v-for="m in materials" :key="m.id" :label="m.label" :value="m.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="大齿轮材料">
              <el-select v-model="form.gearMaterial" class="w-full">
                <el-option v-for="m in materials" :key="m.id" :label="m.label" :value="m.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="使用系数 KA">
              <el-input-number v-model="form.applicationFactor" :min="1" :max="2" :precision="2" :step="0.05" />
            </el-form-item>
            <el-form-item label="精度等级">
              <el-input-number v-model="form.accuracyGrade" :min="5" :max="12" :step="1" />
            </el-form-item>
            <el-form-item label="最小 SH">
              <el-input-number v-model="form.minSafetyContact" :min="0.8" :max="2" :precision="1" :step="0.1" />
            </el-form-item>
            <el-form-item label="最小 SF">
              <el-input-number v-model="form.minSafetyBending" :min="1" :max="2.5" :precision="1" :step="0.1" />
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="齿形系数 Y">
              <el-input-number v-model="form.formFactor" :min="1.5" :max="4" :precision="2" :step="0.1" />
            </el-form-item>
            <el-form-item label="许用弯曲 (MPa)">
              <el-input-number v-model="form.allowBending" :min="100" :step="10" />
            </el-form-item>
            <el-form-item label="许用接触 (MPa)">
              <el-input-number v-model="form.allowContact" :min="200" :step="50" />
            </el-form-item>
          </template>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <template v-if="mode === 'iso6336'">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">传动比 u</dt>
              <dd class="font-mono">{{ isoResult.geometry.gearRatio.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">端面重合度 εα</dt>
              <dd class="font-mono">{{ isoResult.geometry.contactRatio.toFixed(3) }}</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">接触应力 σH</dt>
              <dd class="font-mono">{{ isoResult.contactStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">弯曲应力 σF</dt>
              <dd class="font-mono">{{ isoResult.bendingStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">接触安全系数 SH</dt>
              <dd class="font-mono text-lg" :class="isoResult.contactPass ? 'text-success' : 'text-error'">
                {{ isoResult.safetyContact.toFixed(2) }} {{ isoResult.contactPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">弯曲安全系数 SF</dt>
              <dd class="font-mono text-lg" :class="isoResult.bendingPass ? 'text-success' : 'text-error'">
                {{ isoResult.safetyBending.toFixed(2) }} {{ isoResult.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
          </dl>
          <el-collapse class="mt-4">
            <el-collapse-item title="ISO 6336 系数明细" name="factors">
              <dl class="grid grid-cols-2 gap-2 text-xs">
                <div v-for="(val, key) in isoResult.factors" :key="key">
                  <dt class="text-gray-500">{{ key }}</dt>
                  <dd class="font-mono">{{ typeof val === 'number' ? val.toFixed(3) : val }}</dd>
                </div>
              </dl>
            </el-collapse-item>
          </el-collapse>
          <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <MathTex expr="\sigma_H = Z_B Z_H Z_E Z_\varepsilon \sqrt{\frac{F_t}{b d_1}\frac{u+1}{u} K_A K_V K_{H\beta} K_{H\alpha}}" />
            <MathTex expr="\sigma_F = \frac{F_t}{b m_n} Y_F Y_S Y_\beta K_A K_V K_{F\beta} K_{F\alpha}" />
            <MathTex expr="S_H = \sigma_{H\lim}/\sigma_H,\quad S_F = \sigma_{F\lim}/\sigma_F" />
          </div>
        </template>
        <template v-else>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">分度圆直径 d</dt>
              <dd class="font-mono">{{ simpleResult.geometry.pitchDiameter.toFixed(2) }} mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">弯曲应力 σF</dt>
              <dd class="font-mono" :class="simpleResult.bendingPass ? 'text-success' : 'text-error'">
                {{ simpleResult.bendingStress.toFixed(1) }} MPa {{ simpleResult.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">接触应力 σH</dt>
              <dd class="font-mono" :class="simpleResult.contactPass ? 'text-success' : 'text-error'">
                {{ simpleResult.contactStress.toFixed(1) }} MPa {{ simpleResult.contactPass ? '✓' : '✗' }}
              </dd>
            </div>
          </dl>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeGearStrength } from '@/utils/gear-calc'
import { analyzeGearISO6336, GEAR_MATERIALS } from '@/utils/gear-iso6336'

const mode = ref('iso6336')
const materials = Object.values(GEAR_MATERIALS)

const form = reactive({
  module: 2,
  pinionTeeth: 24,
  gearTeeth: 72,
  faceWidth: 20,
  torque: 50,
  rpm: 1500,
  pressureAngle: 20,
  helixAngle: 0,
  pinionMaterial: 'st-soft',
  gearMaterial: 'st-soft',
  applicationFactor: 1.25,
  accuracyGrade: 6,
  minSafetyContact: 1.0,
  minSafetyBending: 1.4,
  formFactor: 2.65,
  allowBending: 300,
  allowContact: 900,
  gearRatio: 3,
})

const isoResult = computed(() => analyzeGearISO6336(form))
const simpleResult = computed(() =>
  analyzeGearStrength({
    ...form,
    teeth: form.pinionTeeth,
    gearRatio: form.gearTeeth / form.pinionTeeth,
  }),
)
</script>
