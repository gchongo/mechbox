<template>
  <div>
    <h1 class="page-title">螺栓预紧力计算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      拧紧扭矩与预紧力换算、VDI 2230 分步校核与拉应力校核
    </p>

    <el-tabs v-model="pageTab">
      <el-tab-pane label="扭矩/预紧力" name="calc">
    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">计算模型</span>
        <el-radio-group v-model="form.calcMode" class="bolt-mode-group">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="vdi2230">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          <template v-if="form.calcMode === 'simple'">
            综合摩擦系数 μ，<MathTex expr="T = \mu d F / 1000" />，快速估算。
          </template>
          <template v-else-if="form.calcMode === 'vdi2230'">
            VDI 2230 扭矩分解（μ_G、μ_K、D_km），不含嵌入与刚度。
          </template>
          <template v-else>
            在 VDI 2230 基础上增加夹紧长度、螺栓/板柔度、嵌入损失与温差修正，用于估算
            <strong>拧紧预紧力 ↔ 嵌入后残余预紧力</strong>。
          </template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="148px">
          <el-form-item label="换算方向">
            <el-radio-group v-model="form.mode">
              <el-radio value="torque2force">已知扭矩 → 预紧力</el-radio>
              <el-radio value="force2torque">已知预紧力 → 扭矩</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="公称直径 d">
            <el-input-number v-model="form.diameter" :min="3" :max="48" :step="1" @change="onDiameterChange" />
            <span class="ml-2 text-sm text-gray-500">M{{ form.diameter }}</span>
          </el-form-item>
          <el-form-item label="螺距 P">
            <el-input-number v-model="form.pitch" :min="0.5" :max="4" :precision="2" :step="0.25" />
            <el-button v-if="suggestedPitch" class="ml-2" size="small" link @click="form.pitch = suggestedPitch">
              标准 {{ suggestedPitch }}
            </el-button>
          </el-form-item>
          <el-form-item label="性能等级">
            <el-select v-model="form.grade" class="w-full">
              <el-option v-for="(g, k) in grades" :key="k" :label="g.label" :value="k" />
            </el-select>
          </el-form-item>

          <template v-if="form.calcMode === 'simple'">
            <el-form-item label="摩擦系数 μ">
              <el-input-number v-model="form.frictionCoeff" :min="0.1" :max="0.5" :precision="2" :step="0.05" />
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="螺纹摩擦 μ_G">
              <el-input-number v-model="form.muG" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </el-form-item>
            <el-form-item label="头部摩擦 μ_K">
              <el-input-number v-model="form.muK" :min="0.05" :max="0.5" :precision="2" :step="0.02" />
            </el-form-item>
            <el-form-item label="摩擦直径 D_km">
              <el-input-number v-model="form.dKm" :min="5" :max="80" :precision="2" :step="0.5" />
              <el-button class="ml-1" size="small" link @click="resetDKm">{{ estimatedDKm.toFixed(1) }} mm</el-button>
            </el-form-item>
          </template>

          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">夹紧与嵌入</el-divider>
            <el-form-item label="夹紧长度 L_K">
              <el-input-number v-model="form.gripLength" :min="1" :max="500" :precision="1" />
              <el-button class="ml-1" size="small" link @click="resetGrip">{{ estimatedGrip }} mm</el-button>
            </el-form-item>
            <el-form-item label="孔径 d_h">
              <el-input-number v-model="form.holeDiameter" :min="1" :max="60" :precision="1" />
            </el-form-item>
            <el-form-item label="头部支承 d_W">
              <el-input-number v-model="form.headContactDiameter" :min="3" :max="80" :precision="1" />
            </el-form-item>
            <el-form-item label="替代外径 D_A">
              <el-input-number v-model="form.outerDiameter" :min="5" :max="200" :precision="1" />
              <el-button class="ml-1" size="small" link @click="resetOuter">{{ estimatedOuter.toFixed(1) }} mm</el-button>
            </el-form-item>
            <el-form-item label="嵌入量">
              <el-select v-model="form.embedmentPreset" class="w-full" @change="onEmbedmentPreset">
                <el-option
                  v-for="(p, key) in embedmentPresets"
                  :key="key"
                  :label="p.label"
                  :value="key"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.embedmentPreset === 'custom'" label="嵌入 f_Z">
              <el-input-number v-model="form.embedmentUm" :min="1" :max="50" :precision="1" />
              <span class="ml-2 text-sm text-gray-500">μm</span>
            </el-form-item>
            <el-form-item label="温差 ΔT">
              <el-input-number v-model="form.deltaT" :min="-200" :max="500" :precision="1" :step="10" />
              <span class="ml-2 text-xs text-gray-500">°C（相对拧紧态）</span>
            </el-form-item>
          </template>

          <el-form-item v-if="form.mode === 'torque2force'" label="拧紧扭矩 T">
            <el-input-number v-model="form.torque" :min="0" :precision="2" :step="1" />
            <span class="ml-2 text-sm text-gray-500">N·m</span>
          </el-form-item>
          <el-form-item v-else :label="preloadLabel">
            <el-input-number v-model="form.preload" :min="0" :step="500" />
            <span class="ml-2 text-sm text-gray-500">N</span>
          </el-form-item>
        </el-form>

        <BoltPreloadDiagram
          :calc-mode="form.calcMode"
          :mode="form.mode"
          :diameter="form.diameter"
          :pitch="form.pitch"
          :grip-length="form.gripLength"
          :hole-diameter="form.holeDiameter"
          :head-contact-diameter="form.headContactDiameter"
          :outer-diameter="form.outerDiameter"
          :d-km="form.dKm"
          :delta-t="form.deltaT"
        />
      </section>

      <section ref="resultPanelRef" class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">有效面积 <MathTex expr="A_s" /></dt>
            <dd class="font-mono">{{ result.stressArea.toFixed(2) }} mm²</dd>
          </div>

          <template v-if="form.calcMode !== 'simple'">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">中径 <MathTex expr="d_2" /></dt>
              <dd class="font-mono">{{ result.pitchDiameter.toFixed(3) }} mm</dd>
            </div>
          </template>

          <template v-if="form.calcMode === 'professional' && result.joint">
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">螺栓刚度 <MathTex expr="k_S" /></dt>
              <dd class="font-mono">{{ result.joint.kS.toFixed(1) }} N/mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">被夹紧件 <MathTex expr="k_P" /></dt>
              <dd class="font-mono">{{ result.joint.kP.toFixed(1) }} N/mm</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">载荷系数 <MathTex expr="\Phi" /></dt>
              <dd class="font-mono">{{ (result.joint.loadFactor * 100).toFixed(1) }}%</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">嵌入损失 <MathTex expr="F_Z" /></dt>
              <dd class="font-mono text-warning">{{ result.joint.embedmentLoss.toFixed(0) }} N</dd>
            </div>
            <div v-if="form.deltaT" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">温差修正 <MathTex expr="\Delta F_{VT}" /></dt>
              <dd class="font-mono">{{ result.joint.thermalDelta.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">拧紧预紧力 <MathTex expr="F_V" /></dt>
              <dd class="font-mono">{{ result.preloadTightening.toFixed(0) }} N</dd>
            </div>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">残余预紧力 <MathTex expr="F_M" /></dt>
              <dd class="font-mono text-primary">{{ result.preloadResidual.toFixed(0) }} N</dd>
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
              <dt class="text-gray-500">预紧力 <MathTex expr="F" /></dt>
              <dd class="font-mono">{{ result.preload.toFixed(0) }} N</dd>
            </div>
          </template>

          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拧紧扭矩 <MathTex expr="T" /></dt>
            <dd class="font-mono">{{ result.torque.toFixed(2) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">拉应力 <MathTex expr="\sigma" /></dt>
            <dd class="font-mono" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.stress.toFixed(1) }} MPa {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div
            v-if="form.calcMode === 'professional'"
            class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
          >
            <dt class="text-gray-500">残余应力 <MathTex expr="\sigma_M" /></dt>
            <dd class="font-mono" :class="result.passResidual ? 'text-success' : 'text-error'">
              {{ result.stressResidual.toFixed(1) }} MPa {{ result.passResidual ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">最大允许预紧力</dt>
            <dd class="font-mono">{{ result.maxPreload.toFixed(0) }} N</dd>
          </div>
        </dl>

        <div v-if="result.breakdown" class="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <p class="mb-2 font-medium">VDI 2230 扭矩分解（按 F_V）</p>
          <dl class="space-y-1.5 font-mono text-xs">
            <div class="flex justify-between">
              <dt class="text-gray-500">螺纹 M_G</dt>
              <dd>{{ result.breakdown.thread.toFixed(3) }} N·m</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">头部 M_K</dt>
              <dd>{{ result.breakdown.head.toFixed(3) }} N·m</dd>
            </div>
          </dl>
        </div>

        <p class="mt-3 text-xs text-gray-500">
          对照 {{ result.compareLabel }} ≈ {{ result.compareTorque.toFixed(2) }} N·m
        </p>

        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <template v-if="form.calcMode === 'simple'">
            <MathTex expr="T = \dfrac{\mu d F}{1000}" block />
          </template>
          <template v-else-if="form.calcMode === 'vdi2230'">
            <MathTex expr="M_A = F\left(0.16P + 0.58d_2\mu_G + \dfrac{D_{km}}{2}\mu_K\right)" block />
          </template>
          <template v-else>
            <MathTex expr="F_V = F_M + F_Z - \Delta F_{VT}" block />
            <MathTex expr="F_Z = \dfrac{f_Z}{\delta_S + \delta_P}" block />
            <MathTex expr="F_M = F_V - F_Z + \Delta F_{VT}" block />
          </template>
          <MathTex expr="\sigma = F / A_s" block />
        </div>
        <el-button class="mt-4" type="primary" plain @click="exportCalcPdf">导出 PDF</el-button>
      </section>
    </div>
      </el-tab-pane>

      <el-tab-pane label="VDI 2230 分步校核" name="wizard">
        <p class="mb-4 text-xs text-gray-500">
          基于专业模型，按 R0–R13 逐步输出校核结论（工程简化，非完整标准复现）。
        </p>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="140px">
              <el-form-item label="拧紧方法 (R0)">
                <el-select v-model="wizardForm.tighteningMethod" class="w-full">
                  <el-option v-for="(m, k) in tighteningMethods" :key="k" :label="m.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="轴向工作载荷">
                <el-input-number v-model="wizardForm.externalAxialLoad" :min="0" :step="500" />
                <span class="ml-2 text-xs text-gray-500">N</span>
              </el-form-item>
              <el-form-item label="交变载荷">
                <el-input-number v-model="wizardForm.alternatingLoad" :min="0" :step="100" />
              </el-form-item>
              <el-form-item label="要求夹紧力">
                <el-input-number v-model="wizardForm.requiredClampLoad" :min="0" :step="500" />
                <span class="ml-2 text-xs text-gray-500">N（0=自动）</span>
              </el-form-item>
              <el-form-item label="最大扭矩上限">
                <el-input-number v-model="wizardForm.maxTorque" :min="0" :precision="1" />
                <span class="ml-2 text-xs text-gray-500">N·m</span>
              </el-form-item>
            </el-form>
            <p class="text-xs text-gray-500">几何与摩擦参数与左侧「扭矩/预紧力」页共用。</p>
          </section>
          <section ref="wizardPanelRef" class="card-panel">
            <el-alert v-if="wizardResult?.error" :title="wizardResult.error" type="warning" show-icon />
            <template v-else-if="wizardResult">
              <el-tag class="mb-3" :type="wizardOverallType">
                总体: {{ wizardOverallLabel }}
              </el-tag>
              <el-collapse accordion>
                <el-collapse-item v-for="s in wizardResult.steps" :key="s.id" :name="s.id">
                  <template #title>
                    <span class="mr-2 font-mono text-xs">{{ s.id }}</span>
                    <span>{{ s.title }}</span>
                    <el-tag class="ml-2" size="small" :type="stepTagType(s.status)">{{ stepStatusLabel(s.status) }}</el-tag>
                  </template>
                  <p class="text-sm">{{ s.summary }}</p>
                  <p v-if="s.detail" class="text-xs text-gray-500">{{ s.detail }}</p>
                  <p v-if="s.formula" class="mt-1 font-mono text-xs text-primary">{{ s.formula }}</p>
                </el-collapse-item>
              </el-collapse>
            </template>
          </section>
        </div>
        <el-button class="mt-4" type="primary" plain @click="exportWizardPdf">导出校核 PDF</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import MathTex from '@/components/common/MathTex.vue'
import BoltPreloadDiagram from '@/components/bolt/BoltPreloadDiagram.vue'
import {
  analyzeBoltPreload,
  THREAD_GRADES,
  METRIC_THREAD_PITCH,
  suggestPitch,
  estimateHeadFrictionDiameter,
  estimateHeadContactDiameter,
  estimateHoleDiameter,
  estimateGripLength,
  estimateReplacementOuterDiameter,
  EMBEDMENT_PRESETS,
} from '@/utils/bolt-preload-calc'
import { runVdi2230Wizard, TIGHTENING_METHODS, buildWizardReportText } from '@/utils/vdi2230-wizard'
import { exportToolReportPdf } from '@/utils/export'

const pageTab = ref('calc')
const resultPanelRef = ref(null)
const wizardPanelRef = ref(null)
const tighteningMethods = TIGHTENING_METHODS

const grades = THREAD_GRADES
const embedmentPresets = EMBEDMENT_PRESETS

const form = reactive({
  calcMode: 'simple',
  mode: 'torque2force',
  diameter: 10,
  pitch: METRIC_THREAD_PITCH[10],
  grade: '8.8',
  frictionCoeff: 0.2,
  muG: 0.12,
  muK: 0.12,
  dKm: estimateHeadFrictionDiameter(10),
  gripLength: estimateGripLength(10),
  holeDiameter: estimateHoleDiameter(10),
  headContactDiameter: estimateHeadContactDiameter(10),
  outerDiameter: estimateReplacementOuterDiameter(estimateHeadContactDiameter(10), estimateGripLength(10)),
  embedmentPreset: 'steel_standard',
  embedmentUm: EMBEDMENT_PRESETS.steel_standard.value,
  deltaT: 0,
  torque: 50,
  preload: 25000,
})

const wizardForm = reactive({
  tighteningMethod: 'torque',
  externalAxialLoad: 5000,
  alternatingLoad: 0,
  requiredClampLoad: 0,
  maxTorque: 0,
})

const suggestedPitch = computed(() => suggestPitch(form.diameter))
const estimatedDKm = computed(() => estimateHeadFrictionDiameter(form.diameter))
const estimatedGrip = computed(() => estimateGripLength(form.diameter))
const estimatedOuter = computed(() =>
  estimateReplacementOuterDiameter(form.headContactDiameter, form.gripLength),
)

const preloadLabel = computed(() =>
  form.calcMode === 'professional' ? '目标残余 F_M（嵌入后）' : '预紧力 F',
)

const result = computed(() => analyzeBoltPreload({ ...form }))

const wizardResult = computed(() =>
  runVdi2230Wizard({
    ...form,
    ...wizardForm,
    calcMode: 'professional',
    mode: 'force2torque',
  }),
)

const wizardOverallType = computed(() => {
  const o = wizardResult.value?.overall
  return { ok: 'success', warn: 'warning', fail: 'danger' }[o] ?? 'info'
})

const wizardOverallLabel = computed(() => {
  const o = wizardResult.value?.overall
  return { ok: '通过', warn: '需关注', fail: '未通过' }[o] ?? '-'
})

function stepTagType(s) {
  return { ok: 'success', fail: 'danger', warn: 'warning', skip: 'info' }[s] ?? 'info'
}

function stepStatusLabel(s) {
  return { ok: '通过', fail: '未通过', warn: '关注', skip: '跳过' }[s] ?? s
}

async function exportCalcPdf() {
  const r = result.value
  await exportToolReportPdf({
    title: '螺栓预紧力计算报告',
    subtitle: `M${form.diameter} · ${form.grade} · ${form.calcMode}`,
    sections: [
      {
        heading: '结果',
        rows: [
          { label: '预紧力 (N)', value: r.preload.toFixed(0) },
          { label: '扭矩 (N·m)', value: r.torque.toFixed(2) },
          { label: '应力 (MPa)', value: r.stress.toFixed(1) },
          { label: '校核', value: r.pass ? '通过' : '未通过' },
        ],
      },
    ],
    element: resultPanelRef.value,
    filename: `螺栓预紧力_M${form.diameter}_${Date.now()}.pdf`,
  })
}

async function exportWizardPdf() {
  const w = wizardResult.value
  if (!w || w.error) return
  await exportToolReportPdf({
    title: 'VDI 2230 分步校核报告',
    subtitle: `M${form.diameter} · ${form.grade}`,
    sections: [
      {
        heading: '关键结果',
        rows: [
          { label: 'F_M (N)', value: w.keyResults.FM.toFixed(0) },
          { label: 'F_V (N)', value: w.keyResults.FV.toFixed(0) },
          { label: 'T (N·m)', value: w.keyResults.torque.toFixed(2) },
          { label: 'σ (MPa)', value: w.keyResults.sigmaRed.toFixed(1) },
        ],
      },
      {
        heading: '分步明细',
        text: buildWizardReportText(w),
      },
    ],
    element: wizardPanelRef.value,
    filename: `VDI2230_M${form.diameter}_${Date.now()}.pdf`,
  })
}

function onDiameterChange() {
  const d = form.diameter
  const p = suggestPitch(d)
  if (p) form.pitch = p
  form.dKm = estimateHeadFrictionDiameter(d)
  form.gripLength = estimateGripLength(d)
  form.holeDiameter = estimateHoleDiameter(d)
  form.headContactDiameter = estimateHeadContactDiameter(d)
  form.outerDiameter = estimateReplacementOuterDiameter(form.headContactDiameter, form.gripLength)
}

function resetDKm() {
  form.dKm = estimatedDKm.value
}

function resetGrip() {
  form.gripLength = estimatedGrip.value
  form.outerDiameter = estimatedOuter.value
}

function resetOuter() {
  form.outerDiameter = estimatedOuter.value
}

function onEmbedmentPreset(key) {
  const v = EMBEDMENT_PRESETS[key]?.value
  if (v != null) form.embedmentUm = v
}
</script>

<style scoped>
@media (max-width: 640px) {
  .bolt-mode-group :deep(.el-radio-button__inner) {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
