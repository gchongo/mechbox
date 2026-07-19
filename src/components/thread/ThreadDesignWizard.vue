<template>
  <div class="thread-design-wizard">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('wizIntro') }}</p>

    <el-steps :active="stepsActive" finish-status="success" align-center class="mb-6">
      <el-step v-for="id in activeSteps" :key="id" :title="pt(`wizStep_${id}`)" />
    </el-steps>

    <div v-if="!showResult" class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <!-- Step: purpose -->
        <div v-if="currentStepId === 'purpose'">
          <h3 class="mb-3 font-semibold">{{ pt('wizStep_purpose') }}</h3>
          <p class="mb-4 text-xs text-gray-500">{{ pt('wizStep_purpose_hint') }}</p>
          <el-radio-group v-model="answers.purpose" class="wiz-option-group">
            <el-radio v-for="opt in purposeOptions" :key="opt" :value="opt" border class="wiz-option">
              <span class="font-medium">{{ pt(`wiz_purpose_${opt}`) }}</span>
              <span class="mt-1 block text-xs text-gray-500">{{ pt(`wiz_purpose_${opt}_desc`) }}</span>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Step: sealing -->
        <div v-else-if="currentStepId === 'sealing'">
          <h3 class="mb-3 font-semibold">{{ pt('wizStep_sealing') }}</h3>
          <p class="mb-4 text-xs text-gray-500">{{ pt('wizStep_sealing_hint') }}</p>
          <el-radio-group v-model="answers.sealing" class="wiz-option-group">
            <el-radio v-for="opt in sealingOptions" :key="opt" :value="opt" border class="wiz-option">
              <span class="font-medium">{{ pt(`wiz_sealing_${opt}`) }}</span>
              <span class="mt-1 block text-xs text-gray-500">{{ pt(`wiz_sealing_${opt}_desc`) }}</span>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Step: power transmission system (Tr vs Acme) -->
        <div v-else-if="currentStepId === 'powerSystem'">
          <h3 class="mb-3 font-semibold">{{ pt('wizStep_powerSystem') }}</h3>
          <p class="mb-4 text-xs text-gray-500">{{ pt('wizStep_powerSystem_hint') }}</p>
          <el-radio-group v-model="answers.powerSystem" class="wiz-option-group">
            <el-radio v-for="opt in powerSystemOptions" :key="opt" :value="opt" border class="wiz-option">
              <span class="font-medium">{{ pt(`wiz_power_${opt}`) }}</span>
              <span class="mt-1 block text-xs text-gray-500">{{ pt(`wiz_power_${opt}_desc`) }}</span>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Step: unit -->
        <div v-else-if="currentStepId === 'unit'">
          <h3 class="mb-3 font-semibold">{{ pt('wizStep_unit') }}</h3>
          <p class="mb-4 text-xs text-gray-500">{{ pt('wizStep_unit_hint') }}</p>
          <el-radio-group v-model="answers.unit" class="wiz-option-group">
            <el-radio v-for="opt in unitOptions" :key="opt" :value="opt" border class="wiz-option">
              <span class="font-medium">{{ pt(`wiz_unit_${opt}`) }}</span>
              <span class="mt-1 block text-xs text-gray-500">{{ pt(`wiz_unit_${opt}_desc`) }}</span>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- Step: process -->
        <div v-else-if="currentStepId === 'process'">
          <h3 class="mb-3 font-semibold">{{ pt('wizStep_process') }}</h3>
          <p class="mb-4 text-xs text-gray-500">{{ pt('wizStep_process_hint') }}</p>
          <el-radio-group v-model="answers.process" class="wiz-option-group mb-4">
            <el-radio v-for="opt in processOptions" :key="opt" :value="opt" border class="wiz-option">
              <span class="font-medium">{{ pt(`wiz_process_${opt}`) }}</span>
            </el-radio>
          </el-radio-group>

          <el-collapse class="wiz-advanced">
            <el-collapse-item :title="pt('wizAdvanced')" name="adv">
              <el-form label-width="100px" class="text-sm">
                <el-form-item :label="pt('wiz_load_label')">
                  <el-select v-model="answers.load" class="w-full">
                    <el-option v-for="opt in loadOptions" :key="opt" :label="pt(`wiz_load_${opt}`)" :value="opt" />
                  </el-select>
                </el-form-item>
                <el-form-item :label="pt('wiz_material_label')">
                  <el-select v-model="answers.material" class="w-full">
                    <el-option v-for="opt in materialOptions" :key="opt" :label="pt(`wiz_material_${opt}`)" :value="opt" />
                  </el-select>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <el-button v-if="stepIndex > 0" @click="prevStep">{{ pt('wizPrev') }}</el-button>
          <el-button v-if="!isLastStep" type="primary" @click="nextStep">{{ pt('wizNext') }}</el-button>
          <el-button v-else type="primary" @click="finish">{{ pt('wizFinish') }}</el-button>
          <el-button link type="info" @click="reset">{{ pt('wizReset') }}</el-button>
        </div>
      </section>

      <section class="card-panel">
        <h3 class="mb-2 font-semibold">{{ pt('wizKnowledgeTitle') }}</h3>
        <p class="mb-3 text-xs text-gray-500">{{ pt('wizKnowledgeIntro') }}</p>
        <el-collapse accordion>
          <el-collapse-item v-for="sys in knowledgeSystems" :key="sys" :title="systemLabel(sys)" :name="sys">
            <p class="text-sm leading-relaxed">{{ pt(`wiz_know_${sys}`) }}</p>
          </el-collapse-item>
        </el-collapse>
      </section>
    </div>

    <!-- Result -->
    <section v-else ref="resultRef" class="card-panel">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-lg font-semibold">{{ pt('wizResultTitle') }}</h3>
        <div class="flex gap-2">
          <el-button @click="showResult = false">{{ pt('wizBackEdit') }}</el-button>
          <el-button type="primary" plain :disabled="!result.success && !result.unsupportedKey" @click="exportPdf">
            {{ pt('exportPdf') }}
          </el-button>
          <el-button type="primary" plain @click="reset">{{ pt('wizRestart') }}</el-button>
        </div>
      </div>

      <el-alert
        v-if="result.unsupportedKey"
        type="info"
        show-icon
        :closable="false"
        class="mb-4"
        :title="pt(result.unsupportedKey)"
      />

      <template v-if="result.success">
        <div class="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="result-card">
            <span class="result-label">{{ pt('wizResultSystem') }}</span>
            <span class="result-value">{{ recommendedSystemsLabel }}</span>
          </div>
          <div class="result-card">
            <span class="result-label">{{ pt('wizResultSizeRange') }}</span>
            <span class="result-value">{{ pt(result.sizeRangeKey) }}</span>
          </div>
          <div class="result-card">
            <span class="result-label">{{ pt('wizResultPitch') }}</span>
            <span class="result-value">
              {{ result.preferFinePitch ? pt('wiz_pitch_fine') : pt('wiz_pitch_coarse') }}
            </span>
          </div>
          <div class="result-card">
            <span class="result-label">{{ pt('wizResultTolerance') }}</span>
            <span class="result-value font-mono">
              {{ result.toleranceInternal }} / {{ result.toleranceExternal }}
            </span>
            <span class="mt-1 block text-xs text-gray-500">{{ pt(result.toleranceScenarioKey) }}</span>
          </div>
        </div>

        <p v-if="result.sealingNoteKey" class="mb-4 text-sm">{{ pt(result.sealingNoteKey) }}</p>

        <div v-if="result.warnings.length" class="mb-4 space-y-2">
          <el-alert
            v-for="(w, i) in result.warnings"
            :key="i"
            :type="w.level === 'error' ? 'error' : w.level === 'warning' ? 'warning' : 'info'"
            show-icon
            :closable="false"
            :title="pt(w.key)"
          />
        </div>

        <section v-if="result.comparePresetId" class="mb-4">
          <el-button type="primary" plain @click="openComparePreset">
            {{ pt('wizOpenPowerCompare') }}
          </el-button>
        </section>

        <section v-if="result.processTipKeys.length" class="mb-4">
          <h4 class="mb-2 font-semibold">{{ pt('wizResultProcess') }}</h4>
          <ul class="list-inside list-disc space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li v-for="key in result.processTipKeys" :key="key">{{ pt(key) }}</li>
          </ul>
        </section>

        <section v-if="result.alternatives.length" class="mb-4">
          <h4 class="mb-2 font-semibold">{{ pt('wizResultAlternatives') }}</h4>
          <ul class="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li v-for="(alt, i) in result.alternatives" :key="i">{{ pt(alt.key) }}</li>
          </ul>
        </section>

        <section v-if="result.standardRefKeys.length" class="mb-4">
          <h4 class="mb-2 font-semibold">{{ pt('wizResultStandards') }}</h4>
          <ul class="space-y-1 text-sm">
            <li v-for="key in result.standardRefKeys" :key="key">{{ pt(key) }}</li>
          </ul>
        </section>

        <section v-if="result.sampleRows.length" class="mb-4">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h4 class="font-semibold">{{ pt('wizResultSamples') }}</h4>
            <el-button
              v-if="result.primarySystem"
              size="small"
              type="primary"
              link
              @click="openQuery"
            >
              {{ pt('wizOpenQuery') }}
            </el-button>
          </div>
          <el-table
            :data="result.sampleRows"
            :max-height="THREAD_TABLE_MAX_HEIGHT"
            :fit="false"
            size="small"
            border
            stripe
            class="thread-data-table"
          >
            <el-table-column :label="pt('colDesignation')" prop="designation" :min-width="THREAD_TABLE_COL.designation" />
            <el-table-column v-if="result.showTapDrill" :label="pt('colTapDrill')" :min-width="THREAD_TABLE_COL.dim">
              <template #default="{ row }">{{ formatDim(row, row.tapDrill) }}</template>
            </el-table-column>
            <el-table-column :label="pt('colToleranceExt')" prop="toleranceExternal" :min-width="THREAD_TABLE_COL.tolerance" />
            <el-table-column :label="pt('colToleranceInt')" prop="toleranceInternal" :min-width="THREAD_TABLE_COL.tolerance" />
            <el-table-column :label="pt('colActions')" :min-width="THREAD_TABLE_COL.actionView">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="$emit('open-row', row)">
                  {{ pt('wizViewDetail') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <p class="mt-2 text-[10px] text-gray-400">{{ pt('dataDisclaimer') }}</p>
        </section>
      </template>

      <template v-else-if="!result.unsupportedKey">
        <el-alert type="warning" show-icon :closable="false" :title="pt('wizResultIncomplete')" />
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  DEFAULT_ANSWERS,
  getActiveWizardSteps,
  runThreadDesignWizard,
} from '@/utils/thread-design-wizard'
import { formatDim } from '@/utils/thread-standards'
import { THREAD_TABLE_COL, THREAD_TABLE_MAX_HEIGHT } from '@/constants/thread-table-columns'
import { exportToolReportPdf } from '@/utils/export'
import { buildDesignWizardPdfSections } from '@/utils/thread-table-report'

const props = defineProps({
  pt: { type: Function, required: true },
})

const emit = defineEmits(['open-query', 'open-row', 'open-compare'])

const purposeOptions = ['fastener', 'pipe', 'leadscrew']
const sealingOptions = ['gasket', 'thread_seal']
const powerSystemOptions = ['auto', 'tr', 'acme', 'compare']
const unitOptions = ['metric', 'inch_na', 'inch_legacy', 'match_existing']
const processOptions = ['bolt_nut', 'tapped_hole', 'pipe_fitting', 'sheet_metal', 'die_cast', 'plastic_insert']
const loadOptions = ['normal', 'vibration', 'high_load', 'frequent']
const materialOptions = ['steel', 'aluminum', 'stainless', 'plastic']
const knowledgeSystems = ['metric', 'unc', 'unef', 'tr', 'acme', 'npt', 'nptf', 'g', 'r']

const answers = reactive({ ...DEFAULT_ANSWERS })
const stepIndex = ref(0)
const showResult = ref(false)
const resultRef = ref(null)

const activeSteps = computed(() => getActiveWizardSteps(answers))
const currentStepId = computed(() => activeSteps.value[stepIndex.value] ?? 'purpose')
const isLastStep = computed(() => stepIndex.value >= activeSteps.value.length - 1)
/** 结果页时 active = 步数，三步全部显示为 success（绿勾） */
const stepsActive = computed(() =>
  showResult.value ? activeSteps.value.length : stepIndex.value,
)

const result = computed(() => runThreadDesignWizard(answers))

const recommendedSystemsLabel = computed(() => {
  if (!result.value.systems.length) return '—'
  return result.value.systems.map((id) => systemLabel(id)).join(' · ')
})

watch(
  () => answers.purpose,
  (p) => {
    if (p !== 'pipe') answers.sealing = 'none'
    if (p === 'pipe' && answers.sealing === 'none') answers.sealing = 'thread_seal'
    if (p === 'pipe') answers.process = 'pipe_fitting'
    if (p !== 'leadscrew') answers.powerSystem = 'auto'
  },
)

watch(activeSteps, (steps) => {
  if (stepIndex.value >= steps.length) stepIndex.value = steps.length - 1
})

function systemLabel(id) {
  const key = `system_${id}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : id.toUpperCase()
}

function nextStep() {
  if (stepIndex.value < activeSteps.value.length - 1) stepIndex.value += 1
}

function prevStep() {
  if (stepIndex.value > 0) stepIndex.value -= 1
}

function finish() {
  showResult.value = true
}

function reset() {
  Object.assign(answers, DEFAULT_ANSWERS)
  stepIndex.value = 0
  showResult.value = false
}

function openQuery() {
  const r = result.value
  emit('open-query', {
    system: r.primarySystem,
    subSeries: r.subSeries,
  })
}

function openComparePreset() {
  if (result.value.comparePresetId) {
    emit('open-compare', result.value.comparePresetId)
  }
}

async function exportPdf() {
  await exportToolReportPdf({
    title: props.pt('wizResultTitle'),
    sections: buildDesignWizardPdfSections(result.value, answers, props.pt),
    element: resultRef.value,
    filename: `thread_design_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>

<style scoped>
.wiz-option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  align-items: stretch;
}
.wiz-option-group :deep(.el-radio) {
  height: auto;
  margin-right: 0;
  padding: 0.75rem 1rem;
  white-space: normal;
}
.result-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}
.result-label {
  display: block;
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
  margin-bottom: 0.25rem;
}
.result-value {
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
