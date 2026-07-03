<template>
  <div>
    <h1 class="page-title">结构/流体估算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      管路压降、薄板屈曲与固有频率/共振裕度前置验算
    </p>

    <el-tabs v-model="tab">
      <!-- 管路压降 -->
      <el-tab-pane label="管路压降" name="pipe">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="pipe.calcMode">
              <el-radio-button value="simple">简化</el-radio-button>
              <el-radio-button value="complete">完整</el-radio-button>
              <el-radio-button value="professional">专业</el-radio-button>
            </el-radio-group>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="流体">
                <el-select v-model="fluid" @change="applyFluid">
                  <el-option v-for="(f, k) in FLUID_PRESETS" :key="k" :label="f.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="内径">
                <el-input-number v-model="pipe.diameter" :min="1" /> mm
              </el-form-item>
              <el-form-item label="管长">
                <el-input-number v-model="pipe.length" :min="0.1" /> m
              </el-form-item>
              <el-form-item label="流量">
                <el-input-number v-model="pipe.flowRate" :min="0.1" /> L/min
              </el-form-item>
              <el-form-item label="粗糙度">
                <el-input-number v-model="pipe.roughness" :min="0.001" :precision="3" /> mm
              </el-form-item>
              <el-form-item v-if="pipe.calcMode !== 'simple'" label="局部损失 K">
                <el-input-number v-model="pipe.localLossK" :min="0" :precision="1" />
              </el-form-item>
              <template v-if="pipe.calcMode === 'professional'">
                <el-form-item label="最大流速">
                  <el-input-number v-model="pipe.maxVelocity" :min="0.5" :max="10" :precision="1" />
                  <span class="ml-2 text-xs text-gray-500">m/s</span>
                </el-form-item>
                <el-form-item label="允许压降">
                  <el-input-number v-model="pipe.maxPressureDropKPa" :min="1" :max="1000" />
                  <span class="ml-2 text-xs text-gray-500">kPa</span>
                </el-form-item>
              </template>
            </el-form>
          </section>
          <section class="card-panel">
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>流速</dt><dd class="font-mono">{{ pipeResult.velocity?.toFixed(3) }} m/s</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>Re</dt><dd class="font-mono">{{ pipeResult.reynolds?.toFixed(0) }} ({{ pipeResult.flowRegime }})</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>沿程压降</dt><dd class="font-mono">{{ pipeResult.pressureDropKPa?.toFixed(2) }} kPa</dd>
              </div>
              <div v-if="pipeResult.methodCompare" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>H-W 对比</dt><dd class="font-mono">{{ pipeResult.methodCompare.hazenKPa?.toFixed(2) }} kPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>总压降</dt><dd class="font-mono text-lg text-primary">{{ pipeResult.totalPressureDropKPa?.toFixed(2) }} kPa</dd>
              </div>
              <el-tag v-if="pipe.calcMode === 'professional'" class="mt-3" :type="pipeResult.pass ? 'success' : 'danger'">
                {{ pipeResult.pass ? '流速/压降合格' : '超限' }} · 冲蚀 {{ pipeResult.erosionRisk }}
              </el-tag>
            </dl>
          </section>
        </div>
      </el-tab-pane>

      <!-- 薄板屈曲 -->
      <el-tab-pane label="薄板屈曲" name="plate">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="plate.calcMode">
              <el-radio-button value="simple">简化</el-radio-button>
              <el-radio-button value="complete">完整</el-radio-button>
              <el-radio-button value="professional">专业</el-radio-button>
            </el-radio-group>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="边界条件">
                <el-select v-model="plate.edgeCondition" class="w-full">
                  <el-option v-for="(e, k) in PLATE_EDGE_CONDITIONS" :key="k" :label="e.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="板厚 t"><el-input-number v-model="plate.thickness" :min="0.1" /></el-form-item>
              <el-form-item label="宽度 b"><el-input-number v-model="plate.width" :min="1" /></el-form-item>
              <el-form-item label="长度 a"><el-input-number v-model="plate.length" :min="1" /></el-form-item>
              <el-form-item label="工作应力"><el-input-number v-model="plate.appliedStress" :min="0" /></el-form-item>
              <template v-if="plate.calcMode !== 'simple'">
                <el-form-item label="横向应力"><el-input-number v-model="plate.appliedStressTransverse" :min="0" /></el-form-item>
                <el-form-item label="缺陷系数"><el-input-number v-model="plate.imperfectionFactor" :min="0.5" :max="1" :step="0.05" :precision="2" /></el-form-item>
              </template>
              <template v-if="plate.calcMode === 'professional'">
                <el-form-item label="面内剪应力"><el-input-number v-model="plate.appliedShear" :min="0" /></el-form-item>
              </template>
            </el-form>
          </section>
          <section class="card-panel">
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>临界应力 σ_cr</dt><dd class="font-mono">{{ plateResult.criticalStress?.toFixed(1) }} MPa</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>安全系数</dt>
                <dd class="font-mono" :class="plateResult.pass ? 'text-success' : 'text-error'">
                  {{ plateResult.safetyFactor === Infinity ? '—' : plateResult.safetyFactor?.toFixed(2) }}
                </dd>
              </div>
              <div v-if="plateResult.utilization" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>应力利用率</dt><dd class="font-mono">{{ (plateResult.utilization * 100).toFixed(1) }}%</dd>
              </div>
              <div v-if="plateResult.postBucklingReserve" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>后屈曲储备</dt><dd class="font-mono">{{ plateResult.postBucklingReserve?.toFixed(1) }} MPa</dd>
              </div>
            </dl>
            <el-tag class="mt-4" :type="plateResult.pass ? 'success' : 'danger'">
              {{ plateResult.pass ? '屈曲安全' : '可能失稳' }}
            </el-tag>
          </section>
        </div>
      </el-tab-pane>

      <!-- 模态/共振 -->
      <el-tab-pane label="固有频率" name="modal">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="modal.calcMode">
              <el-radio-button value="simple">简化</el-radio-button>
              <el-radio-button value="complete">完整</el-radio-button>
              <el-radio-button value="professional">专业</el-radio-button>
            </el-radio-group>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="模型">
                <el-select v-model="modal.caseId" class="w-full">
                  <el-option v-for="(c, k) in MODAL_CASES" :key="k" :label="c.label" :value="k" />
                </el-select>
              </el-form-item>
              <template v-if="modal.caseId === 'sdof'">
                <el-form-item label="刚度 k"><el-input-number v-model="modal.stiffness" :min="1" /></el-form-item>
                <el-form-item label="质量 m"><el-input-number v-model="modal.mass" :min="0.001" :step="0.1" /></el-form-item>
              </template>
              <template v-else>
                <el-form-item label="跨度 L"><el-input-number v-model="modal.spanLength" :min="10" /></el-form-item>
                <el-form-item label="直径 d"><el-input-number v-model="modal.diameter" :min="1" /></el-form-item>
              </template>
              <el-form-item v-if="modal.calcMode === 'professional'" label="阻尼比 ζ">
                <el-input-number v-model="modal.dampingRatio" :min="0.001" :max="0.2" :step="0.005" :precision="3" />
              </el-form-item>
              <el-form-item v-if="modal.calcMode !== 'simple'" label="转速">
                <el-input-number v-model="modal.rpm" :min="0" :step="100" />
                <span class="ml-2 text-xs text-gray-500">rpm（可选）</span>
              </el-form-item>
              <el-form-item label="激励频率">
                <el-input-number v-model="modal.excitationFreq" :min="0" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">Hz（可选）</span>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <div class="rounded bg-primary/5 p-4 text-center">
              <dt class="text-sm text-gray-500">固有频率 fn</dt>
              <dd class="font-mono text-3xl text-primary">{{ modalResult.modal?.fn?.toFixed(2) ?? '—' }} Hz</dd>
              <p class="mt-1 text-xs">{{ modalResult.modal?.mode }}</p>
            </div>
            <template v-if="modalResult.resonance && !modalResult.resonance.error">
              <dl class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>共振裕度</dt><dd class="font-mono">{{ modalResult.resonance.marginPercent?.toFixed(1) }}%</dd>
                </div>
                <div v-if="modalResult.amplificationFactor" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>放大因子</dt><dd class="font-mono">{{ modalResult.amplificationFactor?.toFixed(2) }}</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                  <dt>评估</dt><dd :class="modalResult.resonance.pass ? 'text-success' : 'text-error'">{{ modalResult.resonance.assessment }}</dd>
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
