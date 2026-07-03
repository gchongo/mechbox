<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pf('tabPipe')" name="pipe">
        <CalcModePanel v-model="pipe.calcMode" page-key="structural" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <el-form-item :label="pf('fluid')">
                <el-select v-model="fluid" @change="applyFluid">
                  <el-option v-for="(f, k) in FLUID_PRESETS" :key="k" :label="f.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('innerDiameter')">
                <el-input-number v-model="pipe.diameter" :min="1" /> mm
              </el-form-item>
              <el-form-item :label="pf('pipeLength')">
                <el-input-number v-model="pipe.length" :min="0.1" /> m
              </el-form-item>
              <el-form-item :label="pf('flowRate')">
                <el-input-number v-model="pipe.flowRate" :min="0.1" /> L/min
              </el-form-item>
              <el-form-item :label="pf('roughness')">
                <el-input-number v-model="pipe.roughness" :min="0.001" :precision="3" /> mm
              </el-form-item>
              <el-form-item v-if="pipe.calcMode !== 'simple'" :label="pf('localLossK')">
                <el-input-number v-model="pipe.localLossK" :min="0" :precision="1" />
              </el-form-item>
              <template v-if="pipe.calcMode === 'professional'">
                <el-form-item :label="pf('maxVelocity')">
                  <el-input-number v-model="pipe.maxVelocity" :min="0.5" :max="10" :precision="1" />
                  <span class="ml-2 text-xs text-gray-500">m/s</span>
                </el-form-item>
                <el-form-item :label="pf('maxPressureDrop')">
                  <el-input-number v-model="pipe.maxPressureDropKPa" :min="1" :max="1000" />
                  <span class="ml-2 text-xs text-gray-500">kPa</span>
                </el-form-item>
              </template>
            </el-form>

            <StructuralDiagram variant="pipe" :diameter="pipe.diameter" :length="pipe.length" />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('velocity') }}</dt><dd class="font-mono">{{ pipeResult.velocity?.toFixed(3) }} m/s</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('reynolds') }}</dt><dd class="font-mono">{{ pipeResult.reynolds?.toFixed(0) }} ({{ pipeResult.flowRegime }})</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('frictionDrop') }}</dt><dd class="font-mono">{{ pipeResult.pressureDropKPa?.toFixed(2) }} kPa</dd>
              </div>
              <div v-if="pipeResult.methodCompare" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('hwCompare') }}</dt><dd class="font-mono">{{ pipeResult.methodCompare.hazenKPa?.toFixed(2) }} kPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('totalDrop') }}</dt><dd class="font-mono text-lg text-primary">{{ pipeResult.totalPressureDropKPa?.toFixed(2) }} kPa</dd>
              </div>
              <el-tag v-if="pipe.calcMode === 'professional'" class="mt-3" :type="pipeResult.pass ? 'success' : 'danger'">
                {{ pipeResult.pass ? pr('pipePass') : pr('pipeFail') }} · {{ pr('erosion') }} {{ pipeResult.erosionRisk }}
              </el-tag>
            </dl>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabPlate')" name="plate">
        <CalcModePanel v-model="plate.calcMode" page-key="structural" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <el-form-item :label="pf('edgeCondition')">
                <el-select v-model="plate.edgeCondition" class="w-full">
                  <el-option v-for="(e, k) in PLATE_EDGE_CONDITIONS" :key="k" :label="e.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pf('plateThickness')"><el-input-number v-model="plate.thickness" :min="0.1" /></el-form-item>
              <el-form-item :label="pf('plateWidth')"><el-input-number v-model="plate.width" :min="1" /></el-form-item>
              <el-form-item :label="pf('plateLength')"><el-input-number v-model="plate.length" :min="1" /></el-form-item>
              <el-form-item :label="pf('appliedStress')"><el-input-number v-model="plate.appliedStress" :min="0" /></el-form-item>
              <template v-if="plate.calcMode !== 'simple'">
                <el-form-item :label="pf('transverseStress')"><el-input-number v-model="plate.appliedStressTransverse" :min="0" /></el-form-item>
                <el-form-item :label="pf('imperfectionFactor')"><el-input-number v-model="plate.imperfectionFactor" :min="0.5" :max="1" :step="0.05" :precision="2" /></el-form-item>
              </template>
              <template v-if="plate.calcMode === 'professional'">
                <el-form-item :label="pf('inPlaneShear')"><el-input-number v-model="plate.appliedShear" :min="0" /></el-form-item>
              </template>
            </el-form>

            <StructuralDiagram variant="plate" :plate-length="plate.length" :plate-thickness="plate.thickness" />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('criticalStress') }}</dt><dd class="font-mono">{{ plateResult.criticalStress?.toFixed(1) }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('safetyFactor') }}</dt>
                <dd class="font-mono" :class="plateResult.pass ? 'text-success' : 'text-error'">
                  {{ plateResult.safetyFactor === Infinity ? '—' : plateResult.safetyFactor?.toFixed(2) }}
                </dd>
              </div>
              <div v-if="plateResult.utilization" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('utilization') }}</dt><dd class="font-mono">{{ (plateResult.utilization * 100).toFixed(1) }}%</dd>
              </div>
              <div v-if="plateResult.postBucklingReserve" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('postBuckling') }}</dt><dd class="font-mono">{{ plateResult.postBucklingReserve?.toFixed(1) }} MPa</dd>
              </div>
            </dl>
            <el-tag class="mt-4" :type="plateResult.pass ? 'success' : 'danger'">
              {{ plateResult.pass ? pr('bucklingSafe') : pr('bucklingUnsafe') }}
            </el-tag>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabModal')" name="modal">
        <CalcModePanel v-model="modal.calcMode" page-key="structural" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <el-form-item :label="pf('modelCase')">
                <el-select v-model="modal.caseId" class="w-full">
                  <el-option v-for="(c, k) in MODAL_CASES" :key="k" :label="c.label" :value="k" />
                </el-select>
              </el-form-item>
              <template v-if="modal.caseId === 'sdof'">
                <el-form-item :label="pf('stiffness')"><el-input-number v-model="modal.stiffness" :min="1" /></el-form-item>
                <el-form-item :label="pf('mass')"><el-input-number v-model="modal.mass" :min="0.001" :step="0.1" /></el-form-item>
              </template>
              <template v-else>
                <el-form-item :label="pf('spanLength')"><el-input-number v-model="modal.spanLength" :min="10" /></el-form-item>
                <el-form-item :label="pf('diameter')"><el-input-number v-model="modal.diameter" :min="1" /></el-form-item>
              </template>
              <el-form-item v-if="modal.calcMode === 'professional'" :label="pf('dampingRatio')">
                <el-input-number v-model="modal.dampingRatio" :min="0.001" :max="0.2" :step="0.005" :precision="3" />
              </el-form-item>
              <el-form-item v-if="modal.calcMode !== 'simple'" :label="fc('rpm')">
                <el-input-number v-model="modal.rpm" :min="0" :step="100" />
                <span class="ml-2 text-xs text-gray-500">{{ pf('rpmOptional') }}</span>
              </el-form-item>
              <el-form-item :label="pf('excitationFreq')">
                <el-input-number v-model="modal.excitationFreq" :min="0" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">{{ pf('hzOptional') }}</span>
              </el-form-item>
            </el-form>

            <StructuralDiagram variant="modal" :excitation-freq="modal.excitationFreq" />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <div class="rounded bg-primary/5 p-4 text-center">
              <dt class="text-sm text-gray-500">{{ pr('naturalFreq') }}</dt>
              <dd class="font-mono text-3xl text-primary">{{ modalResult.modal?.fn?.toFixed(2) ?? '—' }} Hz</dd>
              <p class="mt-1 text-xs">{{ modalResult.modal?.mode }}</p>
            </div>
            <template v-if="modalResult.resonance && !modalResult.resonance.error">
              <dl class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>{{ pr('resonanceMargin') }}</dt><dd class="font-mono">{{ modalResult.resonance.marginPercent?.toFixed(1) }}%</dd>
                </div>
                <div v-if="modalResult.amplificationFactor" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>{{ pr('amplification') }}</dt><dd class="font-mono">{{ modalResult.amplificationFactor?.toFixed(2) }}</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>{{ pr('assessment') }}</dt><dd :class="modalResult.resonance.pass ? 'text-success' : 'text-error'">{{ modalResult.resonance.assessment }}</dd>
                </div>
              </dl>
            </template>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { analyzePipeFlow, FLUID_PRESETS } from '@/utils/pipe-flow-calc'
import { calcPlateBucklingStress, PLATE_EDGE_CONDITIONS } from '@/utils/plate-buckling-calc'
import { analyzeModal, MODAL_CASES } from '@/utils/modal-calc'
import StructuralDiagram from '@/components/structural/StructuralDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct, pf, pr, fc } = useCalcPage('structural')

const tab = ref('pipe')
const fluid = ref('water')

const pipe = reactive({
  calcMode: 'simple',
  diameter: 25,
  length: 10,
  flowRate: 20,
  density: 998,
  viscosity: 1.002e-3,
  roughness: 0.045,
  localLossK: 2,
  maxVelocity: 3,
  maxPressureDropKPa: 200,
})

const plate = reactive({
  calcMode: 'simple',
  edgeCondition: 'ssss',
  thickness: 2,
  width: 200,
  length: 400,
  appliedStress: 50,
  appliedStressTransverse: 0,
  imperfectionFactor: 0.8,
  appliedShear: 0,
})

const modal = reactive({
  calcMode: 'simple',
  caseId: 'beam_ss',
  stiffness: 10000,
  mass: 5,
  spanLength: 500,
  diameter: 30,
  excitationFreq: 45,
  rpm: 2700,
  dampingRatio: 0.02,
})

function applyFluid(k) {
  const f = FLUID_PRESETS[k]
  if (f) {
    pipe.density = f.density
    pipe.viscosity = f.viscosity
  }
}

const pipeResult = computed(() => analyzePipeFlow(pipe))
const plateResult = computed(() => calcPlateBucklingStress(plate))
const modalResult = computed(() => analyzeModal(modal))
</script>
