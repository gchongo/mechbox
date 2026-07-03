<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="gear" />

    <el-tabs v-model="mode" class="mb-6">
      <el-tab-pane label="ISO 6336" name="iso6336" />
      <el-tab-pane label="AGMA 2101" name="agma" />
      <el-tab-pane label="标准对比" name="compare" />
      <el-tab-pane label="Lewis 简化" name="simple" />
    </el-tabs>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <el-form-item label="模数 m (mm)">
            <el-input-number v-model="form.module" :min="0.5" :precision="2" :step="0.5" />
          </el-form-item>
          <el-form-item label="小齿轮齿数 z₁">
            <el-input-number v-model="form.pinionTeeth" :min="17" :step="1" />
          </el-form-item>
          <el-form-item v-if="mode !== 'simple'" label="大齿轮齿数 z₂">
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
          <template v-if="mode !== 'simple'">
            <el-form-item label="螺旋角 β (°)">
              <el-input-number v-model="form.helixAngle" :min="0" :max="30" :precision="1" />
            </el-form-item>
            <el-form-item label="小齿轮变位 x₁">
              <el-input-number v-model="form.profileShiftPinion" :min="-1" :max="1" :step="0.05" :precision="2" />
            </el-form-item>
            <el-form-item label="大齿轮变位 x₂">
              <el-input-number v-model="form.profileShiftGear" :min="-1" :max="1" :step="0.05" :precision="2" />
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
            <el-form-item label="ISO 1328 等级">
              <el-select v-model="form.iso1328Grade" class="w-full">
                <el-option v-for="g in iso1328Grades" :key="g" :label="gradeLabels[g]" :value="g" />
              </el-select>
            </el-form-item>
            <el-form-item label="精度等级 (6336)">
              <el-input-number v-model="form.accuracyGrade" :min="5" :max="12" :step="1" />
              <span class="ml-2 text-xs text-gray-500">与 1328 联动</span>
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

        <GearPairDiagram
          :module="form.module"
          :pinion-teeth="form.pinionTeeth"
          :gear-teeth="form.gearTeeth"
          :face-width="form.faceWidth"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <template v-if="mode === 'agma'">
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">接触应力 σc</dt>
              <dd class="font-mono">{{ agmaResult.contactStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">弯曲应力 σt</dt>
              <dd class="font-mono">{{ agmaResult.bendingStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">SH (Sac/σc)</dt>
              <dd class="font-mono text-lg" :class="agmaResult.contactPass ? 'text-success' : 'text-error'">
                {{ agmaResult.safetyContact.toFixed(2) }} {{ agmaResult.contactPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">SF (Sat/σt)</dt>
              <dd class="font-mono text-lg" :class="agmaResult.bendingPass ? 'text-success' : 'text-error'">
                {{ agmaResult.safetyBending.toFixed(2) }} {{ agmaResult.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
          </dl>
          <el-collapse class="mt-4">
            <el-collapse-item title="AGMA 系数 (Cp, I, J…)" name="agma-f">
              <dl class="grid grid-cols-2 gap-2 text-xs">
                <div v-for="(val, key) in agmaResult.factors" :key="key">
                  <dt class="text-gray-500">{{ key }}</dt>
                  <dd class="font-mono">{{ typeof val === 'number' ? val.toFixed(3) : val }}</dd>
                </div>
              </dl>
            </el-collapse-item>
          </el-collapse>
        </template>
        <template v-else-if="mode === 'compare'">
          <el-table :data="compareRows" border size="small" class="text-sm">
            <el-table-column prop="item" label="项目" />
            <el-table-column label="ISO 6336">
              <template #default="{ row }"><span class="font-mono">{{ row.iso }}</span></template>
            </el-table-column>
            <el-table-column label="AGMA 2101">
              <template #default="{ row }"><span class="font-mono">{{ row.agma }}</span></template>
            </el-table-column>
            <el-table-column label="差异">
              <template #default="{ row }">{{ row.diff }}</template>
            </el-table-column>
          </el-table>
          <el-tag class="mt-4" :type="compareResult.bothPass ? 'success' : 'warning'">
            {{ compareResult.bothPass ? '两标准均通过' : '至少一项未通过或存在差异' }}
          </el-tag>
        </template>
        <template v-else-if="mode === 'iso6336'">
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
              <dt class="text-gray-500">接触应力 <MathTex expr="\sigma_H" /></dt>
              <dd class="font-mono">{{ isoResult.contactStress.toFixed(1) }} MPa</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">弯曲应力 <MathTex expr="\sigma_F" /></dt>
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
            <el-collapse-item v-if="isoResult.iso1328" title="ISO 1328 精度公差" name="iso1328">
              <dl class="grid grid-cols-2 gap-2 text-xs">
                <div><dt class="text-gray-500">f_pt</dt><dd class="font-mono">{{ isoResult.iso1328.tolerances.f_pt.toFixed(1) }} μm</dd></div>
                <div><dt class="text-gray-500">F_pt</dt><dd class="font-mono">{{ isoResult.iso1328.tolerances.F_pt.toFixed(1) }} μm</dd></div>
                <div><dt class="text-gray-500">f_fα</dt><dd class="font-mono">{{ isoResult.iso1328.tolerances.f_falpha.toFixed(1) }} μm</dd></div>
                <div><dt class="text-gray-500">F_β</dt><dd class="font-mono">{{ isoResult.iso1328.tolerances.F_beta.toFixed(1) }} μm</dd></div>
              </dl>
              <ul class="mt-2 list-inside list-disc text-xs text-gray-500">
                <li v-for="(n, i) in isoResult.iso1328.notes" :key="i">{{ n }}</li>
              </ul>
            </el-collapse-item>
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
              <dt class="text-gray-500">弯曲应力 <MathTex expr="\sigma_F" /></dt>
              <dd class="font-mono" :class="simpleResult.bendingPass ? 'text-success' : 'text-error'">
                {{ simpleResult.bendingStress.toFixed(1) }} MPa {{ simpleResult.bendingPass ? '✓' : '✗' }}
              </dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">接触应力 <MathTex expr="\sigma_H" /></dt>
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
import { reactive, computed, ref, watch } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import { analyzeGearStrength } from '@/utils/gear-calc'
import { analyzeGearISO6336, GEAR_MATERIALS } from '@/utils/gear-iso6336'
import { analyzeGearAGMA, compareGearStandards } from '@/utils/gear-agma'
import { ISO1328_GRADES, ISO1328_GRADE_LABELS } from '@/utils/iso-1328'
import GearPairDiagram from '@/components/gear/GearPairDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct } = useCalcPage('gear')

const calcMode = ref('complete')
const mode = ref('iso6336')

watch(calcMode, (m) => {
  if (m === 'simple') mode.value = 'simple'
  else if (m === 'complete') mode.value = 'iso6336'
  else mode.value = 'compare'
})

watch(mode, (m) => {
  if (m === 'simple') calcMode.value = 'simple'
  else if (m === 'compare') calcMode.value = 'professional'
  else if (m !== 'agma') calcMode.value = 'complete'
})
const materials = Object.values(GEAR_MATERIALS)
const iso1328Grades = ISO1328_GRADES
const gradeLabels = ISO1328_GRADE_LABELS

const form = reactive({
  module: 2,
  pinionTeeth: 24,
  gearTeeth: 72,
  faceWidth: 20,
  torque: 50,
  rpm: 1500,
  pressureAngle: 20,
  helixAngle: 0,
  profileShiftPinion: 0,
  profileShiftGear: 0,
  pinionMaterial: 'st-soft',
  gearMaterial: 'st-soft',
  applicationFactor: 1.25,
  accuracyGrade: 6,
  iso1328Grade: 6,
  minSafetyContact: 1.0,
  minSafetyBending: 1.4,
  formFactor: 2.65,
  allowBending: 300,
  allowContact: 900,
  gearRatio: 3,
})

const isoResult = computed(() =>
  analyzeGearISO6336({ ...form, accuracyGrade: form.iso1328Grade }),
)
const agmaResult = computed(() =>
  analyzeGearAGMA({ ...form, qualityGrade: form.iso1328Grade }),
)
const compareResult = computed(() => compareGearStandards(isoResult.value, agmaResult.value))
const compareRows = computed(() => {
  const c = compareResult.value
  return [
    { item: '接触应力 (MPa)', iso: c.contactStress.iso.toFixed(1), agma: c.contactStress.agma.toFixed(1), diff: `${c.contactStress.diffPct.toFixed(1)}%` },
    { item: '弯曲应力 (MPa)', iso: c.bendingStress.iso.toFixed(1), agma: c.bendingStress.agma.toFixed(1), diff: `${c.bendingStress.diffPct.toFixed(1)}%` },
    { item: 'SH', iso: c.safetyContact.iso.toFixed(2), agma: c.safetyContact.agma.toFixed(2), diff: '—' },
    { item: 'SF', iso: c.safetyBending.iso.toFixed(2), agma: c.safetyBending.agma.toFixed(2), diff: '—' },
  ]
})
const simpleResult = computed(() =>
  analyzeGearStrength({
    ...form,
    teeth: form.pinionTeeth,
    gearRatio: form.gearTeeth / form.pinionTeeth,
  }),
)
</script>
