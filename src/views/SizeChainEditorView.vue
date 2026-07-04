<template>
  <div>
    <div class="mb-4 flex items-center gap-4">
      <el-button text @click="router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        {{ t('nav.home') }}
      </el-button>
      <h1 class="page-title !mb-0">{{ pt('title') }}</h1>
    </div>

    <StepProgress :current-step="currentStep" />

    <!-- 步骤 1 -->
    <section v-show="currentStep === 1" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">{{ pt('step1Title') }}</h2>
      <el-tabs v-model="activeGroup" @tab-click="onTabClick">
        <el-tab-pane
          v-for="group in ANALYSIS_GROUPS"
          :key="group.id"
          :label="groupLabel(group.id)"
          :name="group.id"
        >
          <div v-show="typeGridVisible" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="type in group.types"
              :key="type.id"
              class="w-full rounded-lg border-2 p-4 text-left transition-all"
              :class="
                selectedType?.id === type.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              "
              @click="selectType(type, group)"
            >
              <el-icon class="mb-2 text-primary"><component :is="type.icon || 'Document'" /></el-icon>
              <p class="font-medium">{{ typeName(type.id) }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ typeDesc(type.id) }}</p>
            </button>
          </div>
          <p v-if="!typeGridVisible" class="py-6 text-center text-sm text-gray-500">
            {{ pt('tabCollapseHint', { label: activeGroupLabel }) }}
          </p>
        </el-tab-pane>
      </el-tabs>
      <el-alert
        v-if="isExtendedAnalysis"
        class="mt-4"
        type="info"
        :closable="false"
        show-icon
        :title="pt('extendedAlertTitle')"
        :description="pt('extendedAlertDesc')"
      />
      <p v-if="selectedType" class="mt-4 text-sm text-success">
        {{ pt('typeSelected', { group: groupLabel(selectedType.groupId), name: typeName(selectedType.id) }) }}
      </p>
      <div class="mt-6 flex justify-end">
        <el-button type="primary" :disabled="!selectedType" @click="nextStep">
          {{ pt('next') }}
        </el-button>
      </div>
    </section>

    <!-- 步骤 2 -->
    <section v-show="currentStep === 2" class="card-panel">
      <h2 class="mb-2 text-lg font-semibold">{{ pt('step2Title') }}</h2>
      <p class="mb-4 text-sm text-gray-500">
        {{ pt('step2Desc') }}
      </p>
      <el-form label-width="130px" class="max-w-xl">
        <CalcFormItem required :error="fieldError('name')" :label="pf('name')">
          <el-input
            v-model="closedRing.name"
            :placeholder="pf('namePlaceholder')"
            maxlength="50"
            :class="{ 'ring-error': fieldError('name') }"
            @blur="touchField('name')"
          />
        </CalcFormItem>
        <CalcFormItem required :error="fieldError('min')" :label="pf('min')">
          <el-input-number
            v-model="closedRing.min"
            :precision="2"
            :step="0.01"
            @blur="touchField('min')"
          />
          <span class="ml-2 text-sm text-gray-500">{{ unit }}</span>
        </CalcFormItem>
        <CalcFormItem required :error="fieldError('max')" :label="pf('max')">
          <el-input-number
            v-model="closedRing.max"
            :precision="2"
            :step="0.01"
            @blur="touchField('max')"
          />
          <span class="ml-2 text-sm text-gray-500">{{ unit }}</span>
        </CalcFormItem>
        <CalcFormItem :label="pf('tolerance')">
          <span>{{ closedRingTolerance.toFixed(2) }} {{ unit }} {{ pt('toleranceAuto') }}</span>
        </CalcFormItem>
        <el-form-item v-if="isClosedRingValid" :label="pt('equivStatement')">
          <span class="text-sm">
            {{ pt('equivTarget', {
              target: closedRingDesign.target.toFixed(3),
              unit,
              es: closedRingDesign.es.toFixed(3),
              ei: closedRingDesign.ei.toFixed(3),
            }) }}
          </span>
        </el-form-item>
        <CalcFormItem :label="pf('direction')">
          <el-radio-group v-model="closedRing.direction" @change="syncAllRingTypes">
            <el-radio-button label="left">←</el-radio-button>
            <el-radio-button label="up">↑</el-radio-button>
            <el-radio-button label="right">→</el-radio-button>
            <el-radio-button label="down">↓</el-radio-button>
          </el-radio-group>
        </CalcFormItem>
        <CalcFormItem :label="pf('unit')">
          <el-radio-group v-model="closedRing.unit" @change="onUnitChange">
            <el-radio label="mm">mm</el-radio>
            <el-radio label="inch">inch</el-radio>
          </el-radio-group>
        </CalcFormItem>
      </el-form>
      <p class="text-sm text-gray-500">
        {{ pt('closedRingHint') }}
      </p>
      <div class="mt-6 flex justify-between">
        <el-button @click="clearClosedRing">{{ pt('clear') }}</el-button>
        <div class="flex gap-2">
          <el-button @click="prevStep">{{ pt('prev') }}</el-button>
          <el-button type="primary" @click="validateAndNext(2)">{{ pt('next') }}</el-button>
        </div>
      </div>
    </section>

    <!-- 步骤 3 -->
    <section v-show="currentStep === 3" class="card-panel">
      <h2 class="mb-2 text-lg font-semibold">{{ pt('step3Title') }}</h2>
      <p class="mb-4 text-sm text-gray-500">
        {{ pt('step3Desc') }}
      </p>

      <div class="mb-3 flex flex-wrap items-center gap-2">
        <el-button
          v-if="selectedType && getGdtCalcMode(selectedType.id)"
          plain
          @click="loadRingTemplate"
        >
          {{ pt('loadTemplate', { name: typeName(selectedType.id) }) }}
        </el-button>
        <el-button plain @click="loadDefaultDemo">{{ pt('loadDemo') }}</el-button>
        <p v-if="componentRings.length >= 50" class="text-sm text-warning">{{ pt('maxRings') }}</p>
      </div>

      <p v-if="isDemoLoaded" class="mb-2 text-xs text-gray-500">
        {{ pt('demoLoaded') }}
        <button type="button" class="text-primary hover:underline" @click="isDemoLoaded = false">{{ pt('hideDemoHint') }}</button>
      </p>

      <div class="space-y-4">
        <div class="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <SizeChainCanvas
            :closed-ring="closedRing"
            :component-rings="componentRings"
            :rss-tolerance="previewRssTolerance"
            :analysis-type-id="selectedType?.id"
          />
        </div>
        <div class="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
          <RingParameterTable
            v-model:advanced="advancedMode"
            :rings="componentRings"
            :unit="unit"
            :show-validation="ringValidation"
            :closed-direction="closedRing.direction"
            :show-fos="!!gdtModeInfo"
            @add="addRing"
            @remove="removeRing"
            @reorder="reorderRing"
          />
        </div>
      </div>

      <el-alert
        v-if="isExtendedAnalysis"
        class="mt-4"
        type="info"
        :closable="false"
        show-icon
        :title="gdtModeLabel ?? pt('gdtFallbackTitle')"
        :description="gdtModeDescBase"
      />
      <div class="mt-6 flex justify-between">
        <el-button @click="clearRings">{{ pt('clearList') }}</el-button>
        <div class="flex gap-2">
          <el-button @click="prevStep">{{ pt('prev') }}</el-button>
          <el-button type="primary" :disabled="!componentRings.length" @click="validateRingsAndNext">
            {{ pt('next') }}
          </el-button>
        </div>
      </div>
    </section>

    <!-- 步骤 4 -->
    <section v-show="currentStep === 4" class="card-panel">
      <h2 class="mb-3 text-lg font-semibold">{{ pt('step4Title') }}</h2>
      <el-radio-group v-model="method" class="method-grid">
        <el-radio value="worst" border class="method-card">
          <span class="method-card__title">{{ pt('methodCards.worstTitle') }}</span>
          <span class="method-card__hint">{{ pt('methodCards.worstHint') }}</span>
          <span class="method-card__formula"><MathContent :text="pt('methodCards.worstFormula')" /></span>
        </el-radio>
        <el-radio value="rss" border class="method-card">
          <span class="method-card__title">{{ pt('methodCards.rssTitle') }}</span>
          <span class="method-card__hint">{{ pt('methodCards.rssHint') }}</span>
          <span class="method-card__formula"><MathContent :text="pt('methodCards.rssFormula')" /></span>
        </el-radio>
        <el-radio value="modified-rss" border class="method-card">
          <span class="method-card__title">{{ pt('methodCards.modifiedTitle') }}</span>
          <span class="method-card__hint">{{ pt('methodCards.modifiedHint') }}</span>
          <span class="method-card__formula"><MathContent :text="pt('methodCards.modifiedFormula')" /></span>
        </el-radio>
        <el-radio value="sigma6-rss" border class="method-card">
          <span class="method-card__title"><MathContent :text="pt('methodCards.sigma6Title')" /></span>
          <span class="method-card__hint">{{ pt('methodCards.sigma6Hint') }}</span>
          <span class="method-card__formula"><MathContent :text="pt('methodCards.sigma6Formula')" /></span>
        </el-radio>
      </el-radio-group>
      <div v-if="method === 'modified-rss' || method === 'sigma6-rss'" class="mt-4 max-w-md">
        <el-form label-width="100px">
          <CalcFormItem :label="pf('distribution')">
            <el-select v-model="rssDistribution" class="w-full">
              <el-option
                v-for="(d, k) in DISTRIBUTIONS"
                :key="k"
                :label="ol('distributions', k)"
                :value="k"
              />
            </el-select>
          </CalcFormItem>
        </el-form>
        <p v-if="method === 'modified-rss'" class="mt-2 max-w-xl text-xs text-amber-700 dark:text-amber-300">
          {{ pt('methodCards.modifiedDisclaimer') }}
        </p>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <el-button @click="prevStep">{{ pt('prev') }}</el-button>
        <el-button type="primary" @click="nextStep">{{ pt('next') }}</el-button>
      </div>
    </section>

    <!-- 步骤 5 -->
    <section v-show="currentStep === 5" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">{{ pt('step5Title') }}</h2>

      <el-collapse v-if="gdtModeInfo" class="mb-4">
        <el-collapse-item :title="pt('gdtCollapseTitle')" name="mmc">
          <el-form label-width="120px" class="max-w-lg">
            <CalcFormItem :label="pf('materialCondition')">
              <el-radio-group v-model="gdtModifier">
                <el-radio value="RFS">{{ pt('gdtModifiers.RFS') }}</el-radio>
                <el-radio value="MMC">{{ pt('gdtModifiers.MMC') }}</el-radio>
                <el-radio value="LMC">{{ pt('gdtModifiers.LMC') }}</el-radio>
              </el-radio-group>
            </CalcFormItem>
            <CalcFormItem v-if="gdtModifier !== 'RFS'" :label="pf('autoBonus')">
              <el-switch v-model="gdtAutoBonus" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('autoBonusHint') }}</span>
            </CalcFormItem>
            <CalcFormItem v-if="gdtModifier !== 'RFS' && !gdtAutoBonus" :label="pf('bonusTolerance')">
              <el-input-number v-model="bonusTolerance" :min="0" :precision="4" :step="0.01" />
              <span class="ml-2 text-xs text-gray-500">{{ pf('bonusHint') }}</span>
            </CalcFormItem>
            <CalcFormItem
              v-if="gdtModifier !== 'RFS' && gdtAutoBonus && activeResult?.bonusApplied > 0"
              :label="pf('bonusTolerance')"
            >
              <span class="font-mono text-sm">{{ fmtNum(activeResult.bonusApplied) }} mm</span>
              <span class="ml-2 text-xs text-gray-500">{{ pf('bonusAutoLabel') }}</span>
            </CalcFormItem>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <div ref="resultPanelRef">
        <el-alert
          v-if="chainValidationMessage"
          class="mb-4"
          type="error"
          :closable="false"
          show-icon
          :title="pt('validation.chainBlocked')"
          :description="chainValidationMessage"
        />
        <ChainResultDashboard
          class="mb-6"
          :closed-ring="closedRing"
          :worst-result="worstResult"
          :rss-result="rssResult"
          :sigma-summary="sigmaSummary"
          :unit="unit"
        />

        <el-collapse class="mb-6">
          <el-collapse-item :title="pt('calcDetailTitle')" name="detail">
            <el-alert
              v-if="gdtModeInfo"
              class="mb-4"
              type="success"
              :closable="false"
              show-icon
              :title="pt('calcModeLabel', { mode: gdtModeLabel })"
              :description="gdtModeDesc"
            />

            <h3 class="mb-2 text-sm font-medium text-gray-600">{{ pt('vectorDiagram') }}</h3>
            <SizeChainCanvas
              ref="canvasRef"
              :closed-ring="closedRing"
              :component-rings="componentRings"
              :rss-tolerance="rssResult.totalTolerance"
              :analysis-type-id="selectedType?.id"
              class="mb-6"
            />

            <h3 class="mb-2 text-sm font-medium text-gray-600">{{ pt('formulaSection') }}</h3>
            <div class="mb-6 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <MathTex
                v-if="activeResult.formulaNote"
                :expr="activeResult.formulaNote"
                block
              />
              <MathTex
                v-for="(item, i) in formulaLatex"
                :key="i"
                :expr="item.latex"
                block
              />
            </div>

            <h3 class="mb-2 text-sm font-medium text-gray-600">{{ pt('compareSection') }}</h3>
            <el-table :data="resultTable" border>
              <el-table-column prop="method" :label="pr('method')" />
              <el-table-column prop="tolerance" :label="pr('totalTolerance', { unit })" />
              <el-table-column prop="upper" :label="pr('upper')" />
              <el-table-column prop="lower" :label="pr('lower')" />
              <el-table-column prop="pass" :label="pr('passCol')">
                <template #default="{ row }">
                  <span :class="row.pass ? (row.reviewOnly ? 'text-warning' : 'text-success') : 'text-error'">
                    {{ row.pass ? (row.reviewOnly ? fc('overallWarn') : pr('passMark')) : pr('failMark') }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="flex flex-wrap gap-2">
        <el-button @click="resetAll">{{ pt('reset') }}</el-button>
        <el-button type="primary" @click="saveResult">{{ pt('save') }}</el-button>
        <el-button
          v-if="savedId"
          :type="isFavorited ? 'warning' : 'default'"
          @click="toggleSavedFavorite"
        >
          {{ isFavorited ? pt('favorited') : pt('favorite') }}
        </el-button>
        <el-button @click="handleExportPdf">{{ pt('exportPdf') }}</el-button>
        <el-button @click="handleExportExcel">{{ pt('exportExcel') }}</el-button>
        <el-button @click="handleExportPng">{{ pt('exportPng') }}</el-button>
        <el-button @click="handleCopy">{{ pt('copyResult') }}</el-button>
        <el-button type="success" @click="goToMonteCarlo">{{ pt('monteCarlo') }}</el-button>
        <el-button v-if="gdtModeInfo" type="success" plain @click="goToGdtStack">{{ pt('gdtStack') }}</el-button>
      </div>

      <DecisionToolsPanel
        v-if="componentRings.length && closedRing.min != null"
        class="mt-6"
        :preset="decisionPreset"
        :snapshot="editorSnapshot"
        :base-inputs="editorBaseInputs"
        @apply="onEditorInverse"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StepProgress from '@/components/editor/StepProgress.vue'
import SizeChainCanvas from '@/components/editor/SizeChainCanvas.vue'
import RingParameterTable from '@/components/editor/RingParameterTable.vue'
import ChainResultDashboard from '@/components/editor/ChainResultDashboard.vue'
import { ANALYSIS_GROUPS, findAnalysisType } from '@/constants/analysis-types'
import { findCasePreset, prepareCaseForEditor, prepareEditorDemoState, CASE_STORAGE_KEY } from '@/constants/cases'
import { MC_STORAGE_KEY, GDT_STACK_STORAGE_KEY, serializeEditorForMonteCarlo, serializeEditorForGdtStack } from '@/constants/editor-bridge'
import {
  calculateChainResult,
  buildFormulaLines,
  buildFormulaLatex,
  buildSigmaSummary,
  getGdtCalcMode,
  isExtendedAnalysisType,
  DISTRIBUTIONS,
} from '@/utils/size-chain'
import { applyRingTemplate } from '@/constants/gdt-templates'
import { fmtNum } from '@/utils/format'
import { inferRingType } from '@/utils/ring-direction'
import { convertLength, convertRingList, unitLabel } from '@/utils/unit'
import {
  exportResultPdf,
  exportResultPng,
  exportCanvasPng,
  exportExcel,
  copyResultText,
  buildResultText,
} from '@/utils/export'
import { getAnalysisById, saveAnalysis } from '@/utils/storage'
import {
  getSettings,
  saveSettings,
} from '@/utils/settings'
import { isFavorite, toggleFavorite } from '@/utils/favorites'
import { closedRingAsDesign, ensureRingEsEi, validateComponentRingTolerances } from '@/utils/ring-tolerance'
import { useCalcPage } from '@/composables/useCalcPage'
import DecisionToolsPanel from '@/components/decision/DecisionToolsPanel.vue'
import { adaptSizeChain } from '@/utils/calc-adapters'
import { getCalcReviewStatus } from '@/utils/calc-result'
import { DECISION_PRESETS } from '@/utils/decision-presets'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useContentI18n } from '@/composables/useContentI18n'
import { ensureLoggedIn } from '@/utils/auth-guard'
import { casesEn, localizeEditorRingNames, translateRingName, translateClosedRingName } from '@/i18n/cases-i18n'

const route = useRoute()
const router = useRouter()
const { pt, pf, pr, t } = useCalcPage('editor')
const { ol } = useOptionsI18n()
const { exportFilename, locale } = useContentI18n()

const currentStep = ref(1)
const activeGroup = ref('1d')
const typeGridVisible = ref(true)
const lastTabClick = ref('')
const selectedType = ref(null)
const method = ref('rss')
const rssDistribution = ref('skewed')
const touched = ref({})
const showValidation = ref(false)
const ringValidation = ref(false)
const resultPanelRef = ref(null)
const canvasRef = ref(null)
const prevUnit = ref('mm')
const savedId = ref(route.params.id ? String(route.params.id) : null)
const advancedMode = ref(getSettings().editorAdvancedMode ?? false)
const isDemoLoaded = ref(false)

const closedRing = ref({
  name: '',
  min: null,
  max: null,
  direction: 'right',
  unit: 'mm',
})

const componentRings = ref([])

const gdtModifier = ref('RFS')
const gdtAutoBonus = ref(true)
const bonusTolerance = ref(0)

const unit = computed(() => unitLabel(closedRing.value.unit))

const isFavorited = computed(() => (savedId.value ? isFavorite(savedId.value) : false))

async function toggleSavedFavorite() {
  if (!savedId.value) return
  if (!(await ensureLoggedIn(locale.value))) return
  const added = toggleFavorite(savedId.value)
  ElMessage.success(added ? pt('msgFavoriteAdded') : pt('msgFavoriteRemoved'))
}

function typeName(id) {
  return pt(`analysisTypes.${id}.name`)
}

function typeDesc(id) {
  return pt(`analysisTypes.${id}.desc`)
}

function groupLabel(id) {
  return t(`analysisGroups.${id}`)
}

const activeGroupLabel = computed(() => groupLabel(activeGroup.value))

const isExtendedAnalysis = computed(() =>
  isExtendedAnalysisType(selectedType.value?.id ?? ''),
)

const gdtModeInfo = computed(() => getGdtCalcMode(selectedType.value?.id))

const gdtModeLabel = computed(() => {
  const id = selectedType.value?.id
  if (!id || !gdtModeInfo.value) return null
  return ol('gdtCalcModes', id, 'label')
})

const gdtModeDescBase = computed(() => {
  const id = selectedType.value?.id
  if (!id || !gdtModeInfo.value) return pt('gdtFallbackDesc')
  return ol('gdtCalcModes', id, 'desc') || pt('gdtFallbackDesc')
})

const chainOpts = computed(() => ({
  typeId: selectedType.value?.id,
  closedDirection: closedRing.value.direction,
  distribution: rssDistribution.value,
  toleranceModifier: gdtModifier.value,
  autoBonus: gdtAutoBonus.value,
  bonusTolerance: bonusTolerance.value,
}))

const closedRingSpec = computed(() => ({
  min: closedRing.value.min,
  max: closedRing.value.max,
}))

const worstResult = computed(() =>
  calculateChainResult(closedRingSpec.value, componentRings.value, 'worst', chainOpts.value),
)

const rssResult = computed(() =>
  calculateChainResult(closedRingSpec.value, componentRings.value, 'rss', chainOpts.value),
)

const modifiedResult = computed(() =>
  calculateChainResult(closedRingSpec.value, componentRings.value, 'modified-rss', chainOpts.value),
)

const sigma6Result = computed(() =>
  calculateChainResult(closedRingSpec.value, componentRings.value, 'sigma6-rss', chainOpts.value),
)

const activeResult = computed(() => {
  if (method.value === 'worst') return worstResult.value
  if (method.value === 'modified-rss') return modifiedResult.value
  if (method.value === 'sigma6-rss') return sigma6Result.value
  return rssResult.value
})

const chainValidationMessage = computed(() => {
  const err = activeResult.value?.validationError
  if (!err) return ''
  const ring = activeResult.value?.validationRing ?? '?'
  const keyMap = {
    ring_direction_missing: 'validation.ringDirectionMissing',
    ring_type_missing: 'validation.ringTypeMissing',
    ring_type_direction_conflict: 'validation.ringTypeDirectionConflict',
    es_lt_ei: 'validation.esLtEi',
    negative_tolerance: 'validation.negativeTolerance',
  }
  const msgKey = keyMap[err] ?? 'validation.chainGeneric'
  return pt(msgKey, { ring })
})

const gdtModeDesc = computed(() => {
  const base = gdtModeDescBase.value
  const bonus = activeResult.value?.bonusApplied
  if (bonus && bonus > 0) {
    return `${base}${pt('gdtBonusSuffix', { bonus: fmtNum(bonus) })}`
  }
  return base
})

const resultTable = computed(() => {
  const rows = [
    {
      method: pt('methods.worst'),
      tolerance: fmtNum(worstResult.value.totalTolerance),
      upper: fmtNum(worstResult.value.upper),
      lower: fmtNum(worstResult.value.lower),
      pass: worstResult.value.pass,
      reviewOnly: false,
    },
    {
      method: pt('methods.rss'),
      tolerance: fmtNum(rssResult.value.totalTolerance),
      upper: fmtNum(rssResult.value.upper),
      lower: fmtNum(rssResult.value.lower),
      pass: rssResult.value.pass,
      reviewOnly: true,
    },
    {
      method: pt('methods.modified-rss'),
      tolerance: fmtNum(modifiedResult.value.totalTolerance),
      upper: fmtNum(modifiedResult.value.upper),
      lower: fmtNum(modifiedResult.value.lower),
      pass: modifiedResult.value.pass,
      reviewOnly: true,
    },
    {
      method: pt('methods.sigma6-rss'),
      tolerance: fmtNum(sigma6Result.value.totalTolerance),
      upper: fmtNum(sigma6Result.value.upper),
      lower: fmtNum(sigma6Result.value.lower),
      pass: sigma6Result.value.pass,
      reviewOnly: true,
    },
  ]
  if (gdtModeLabel.value) {
    return rows.map((r) => ({ ...r, method: `${r.method} (${gdtModeLabel.value})` }))
  }
  return rows
})

function onTabClick(tab) {
  const name = tab.paneName
  if (lastTabClick.value === name) {
    typeGridVisible.value = !typeGridVisible.value
  } else {
    typeGridVisible.value = true
  }
  lastTabClick.value = name
}

function goToMonteCarlo() {
  sessionStorage.setItem(
    MC_STORAGE_KEY,
    JSON.stringify(
      serializeEditorForMonteCarlo({
        closedRing: closedRing.value,
        componentRings: componentRings.value,
        method: method.value,
        rssDistribution: rssDistribution.value,
        selectedType: selectedType.value,
      }),
    ),
  )
  router.push({ path: '/monte-carlo', query: { from: 'editor' } })
}

function goToGdtStack() {
  sessionStorage.setItem(
    GDT_STACK_STORAGE_KEY,
    JSON.stringify(
      serializeEditorForGdtStack({
        closedRing: closedRing.value,
        componentRings: componentRings.value,
        method: method.value,
        selectedType: selectedType.value,
        gdtModifier: gdtModifier.value,
        gdtAutoBonus: gdtAutoBonus.value,
        bonusTolerance: bonusTolerance.value,
      }),
    ),
  )
  router.push({ path: '/gdt-stack', query: { from: 'editor' } })
}

const closedRingTolerance = computed(() => {
  if (closedRing.value.min == null || closedRing.value.max == null) return 0
  return closedRing.value.max - closedRing.value.min
})

const closedRingDesign = computed(() => closedRingAsDesign(closedRing.value))

const previewRssTolerance = computed(() => rssResult.value?.totalTolerance ?? 0)

const isClosedRingValid = computed(
  () =>
    closedRing.value.name.trim() &&
    closedRing.value.min != null &&
    closedRing.value.max != null &&
    closedRing.value.max > closedRing.value.min,
)

const formulaLines = computed(() =>
  buildFormulaLines(closedRing.value, componentRings.value, method.value, unit.value, {
    distribution: rssDistribution.value,
    closedDirection: closedRing.value.direction,
  }),
)

const formulaLatex = computed(() =>
  buildFormulaLatex(closedRing.value, componentRings.value, method.value, unit.value, {
    distribution: rssDistribution.value,
    closedDirection: closedRing.value.direction,
  }),
)

const sigmaSummary = computed(() =>
  buildSigmaSummary(
    { min: closedRing.value.min, max: closedRing.value.max },
    rssResult.value,
  ),
)

onMounted(() => {
  initFromRoute()
})

watch(
  () => [route.query.type, route.query.case, route.params.id],
  () => initFromRoute(),
)

function initFromRoute() {
  const caseId = route.query.case
  if (caseId) {
    loadCasePreset(String(caseId))
    return
  }

  const stored = sessionStorage.getItem(CASE_STORAGE_KEY)
  if (stored) {
    try {
      applyEditorState(JSON.parse(stored))
      sessionStorage.removeItem(CASE_STORAGE_KEY)
      return
    } catch {
      /* ignore */
    }
  }

  const typeId = route.query.type
  if (typeId) {
    const type = findAnalysisType(String(typeId))
    if (type) {
      selectedType.value = type
      activeGroup.value = type.groupId
    }
    applyDefaultSettings()
    return
  }

  const id = route.params.id
  if (id) {
    savedId.value = String(id)
    loadFromHistory(String(id))
    return
  }

  applyDefaultSettings()
  loadDefaultDemoIfEmpty()
}

function loadDefaultDemoIfEmpty() {
  if (selectedType.value || componentRings.value.length > 0) return
  const state = prepareEditorDemoState(locale.value)
  if (!state) return
  applyEditorState(state)
  isDemoLoaded.value = true
}

function loadDefaultDemo() {
  const state = prepareEditorDemoState(locale.value)
  if (!state) return
  applyEditorState(state)
  isDemoLoaded.value = true
  ElMessage.success(pt('msgDemoLoaded'))
}

function applyDefaultSettings() {
  const settings = getSettings()
  closedRing.value.unit = settings.defaultUnit
  prevUnit.value = settings.defaultUnit
  method.value = settings.defaultMethod
}

function loadCasePreset(caseId) {
  const preset = findCasePreset(caseId)
  if (!preset) return
  const displayTitle =
    locale.value === 'en' && casesEn[preset.id]?.title ? casesEn[preset.id].title : preset.title
  applyEditorState(prepareCaseForEditor(preset, locale.value))
  ElMessage.success(pt('msgCaseLoaded', { title: displayTitle }))
}

function applyEditorState(state) {
  const s = localizeEditorRingNames(state, locale.value)
  if (s.selectedType) selectedType.value = s.selectedType
  if (s.activeGroup) activeGroup.value = s.activeGroup
  if (s.closedRing) {
    closedRing.value = { ...closedRing.value, ...s.closedRing }
    prevUnit.value = closedRing.value.unit
  }
  if (s.componentRings) {
    componentRings.value = s.componentRings.map((ring) =>
      ensureRingEsEi({
        ...ring,
        uid: ring.uid ?? crypto.randomUUID(),
      }),
    )
  }
  if (s.method) method.value = s.method
  if (s.rssDistribution) rssDistribution.value = s.rssDistribution
  if (s.currentStep) currentStep.value = s.currentStep
}

watch(locale, (loc) => {
  if (!closedRing.value.name?.trim() && !componentRings.value.length) return
  if (closedRing.value.name?.trim()) {
    closedRing.value = {
      ...closedRing.value,
      name: translateClosedRingName(closedRing.value.name, loc),
    }
  }
  if (componentRings.value.length) {
    componentRings.value = componentRings.value.map((ring) => ({
      ...ring,
      name: translateRingName(ring.name, loc),
    }))
  }
})

function loadFromHistory(id) {
  const record = getAnalysisById(id)
  if (!record?.data) return
  applyEditorState(record.data)
}

function touchField(field) {
  touched.value[field] = true
}

function fieldError(field) {
  if (!showValidation.value && !touched.value[field]) return ''
  if (field === 'name' && !closedRing.value.name.trim()) return pt('validation.required')
  if (field === 'min' && closedRing.value.min == null) return pt('validation.required')
  if (field === 'max') {
    if (closedRing.value.max == null) return pt('validation.required')
    if (closedRing.value.min != null && closedRing.value.max <= closedRing.value.min) {
      return pt('validation.maxGtMin')
    }
  }
  return ''
}

function validateRingsAndNext() {
  ringValidation.value = true
  if (!componentRings.value.length) return
  const invalid = componentRings.value.some(
    (r) =>
      !r.name?.trim() ||
      r.size == null ||
      r.tolerance == null ||
      r.tolerance < 0,
  )
  if (invalid) {
    ElMessage.warning(pt('msgRingIncomplete'))
    return
  }
  const tolCheck = validateComponentRingTolerances(componentRings.value)
  if (!tolCheck.valid) {
    ElMessage.warning(pt('msgRingEsEiInvalid'))
    return
  }
  nextStep()
}

function ringFieldInvalid(row, field) {
  if (!ringValidation.value) return false
  if (field === 'name') return !row.name?.trim()
  if (field === 'size') return row.size == null
  if (field === 'tolerance') return row.tolerance == null || row.tolerance < 0
  return false
}

function validateAndNext(step) {
  if (step === 2) {
    showValidation.value = true
    if (!isClosedRingValid.value) return
  }
  nextStep()
}

function loadRingTemplate() {
  const typeId = selectedType.value?.id
  if (!typeId) return
  const tpl = applyRingTemplate(typeId, closedRing.value.direction)
  if (!tpl) {
    ElMessage.warning(pt('msgNoTemplate'))
    return
  }
  closedRing.value = { ...closedRing.value, ...tpl.closedRing, unit: closedRing.value.unit }
  componentRings.value = tpl.componentRings.map((ring) => ensureRingEsEi({ ...ring }))
  ElMessage.success(pt('msgTemplateLoaded', { name: typeName(selectedType.value.id) }))
}

function selectType(type, group) {
  selectedType.value = { ...type, groupId: group.id }
}

function nextStep() {
  if (currentStep.value < 5) currentStep.value++
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function clearClosedRing() {
  closedRing.value = { name: '', min: null, max: null, direction: 'right', unit: 'mm' }
  showValidation.value = false
  touched.value = {}
}

function onUnitChange(newUnit) {
  const oldUnit = prevUnit.value
  if (oldUnit === newUnit) return
  closedRing.value.min = convertLength(closedRing.value.min, oldUnit, newUnit)
  closedRing.value.max = convertLength(closedRing.value.max, oldUnit, newUnit)
  componentRings.value = convertRingList(componentRings.value, oldUnit, newUnit)
  prevUnit.value = newUnit
}

function updateRingType(ring) {
  const t = inferRingType(ring.direction, closedRing.value.direction)
  if (t) ring.type = t
}

function syncAllRingTypes() {
  componentRings.value.forEach(updateRingType)
}

function addRing() {
  const index = componentRings.value.length
  const defaultDir = index % 2 === 0 ? 'left' : closedRing.value.direction
  const ring = ensureRingEsEi({
    uid: crypto.randomUUID(),
    name: `A${index + 1}`,
    size: 10,
    tolerance: 0.05,
    es: 0.025,
    ei: -0.025,
    factor: 1,
    direction: defaultDir,
    type: inferRingType(defaultDir, closedRing.value.direction),
    featureKind: '',
    sizeTolerance: 0,
  })
  componentRings.value.push(ring)
}

function reorderRing({ from, to }) {
  if (from == null || from === to) return
  const list = [...componentRings.value]
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  componentRings.value = list
}

function removeRing(index) {
  componentRings.value.splice(index, 1)
}

function clearRings() {
  componentRings.value = []
  isDemoLoaded.value = false
}

function resetAll() {
  const settings = getSettings()
  currentStep.value = 1
  selectedType.value = null
  method.value = settings.defaultMethod
  rssDistribution.value = 'skewed'
  showValidation.value = false
  ringValidation.value = false
  touched.value = {}
  clearClosedRing()
  clearRings()
  isDemoLoaded.value = false
  applyDefaultSettings()
}

watch(advancedMode, (val) => {
  saveSettings({ editorAdvancedMode: val })
})

const methodLabels = computed(() => ({
  worst: pt('methods.worstExport'),
  rss: pt('methods.rssExport'),
  'modified-rss': pt('methods.modifiedExport'),
  'sigma6-rss': pt('methods.sigma6Export'),
}))

function buildExportPayload() {
  return {
    typeName: selectedType.value ? typeName(selectedType.value.id) : undefined,
    closedRing: closedRing.value,
    unit: unit.value,
    componentRings: componentRings.value,
    methodLabel: methodLabels.value[method.value] ?? method.value,
    formulaLines: formulaLines.value,
    results: resultTable.value,
  }
}

function saveResult() {
  const title = `${selectedType.value ? typeName(selectedType.value.id) : pt('saveTitleFallback')} ${closedRing.value.name || 'L0'}`
  const reviewStatus = getCalcReviewStatus(editorSnapshot.value)
  const historyStatus =
    reviewStatus === 'pass' ? 'pass' : reviewStatus === 'review' ? 'review' : 'fail'
  const methodResults = [
    { method: 'worst', ...worstResult.value },
    { method: 'rss', ...rssResult.value },
    { method: 'modified-rss', ...modifiedResult.value },
    { method: 'sigma6-rss', ...sigma6Result.value },
  ]
  const entry = saveAnalysis({
    title,
    status: historyStatus,
    data: {
      selectedType: selectedType.value,
      closedRing: closedRing.value,
      componentRings: componentRings.value,
      method: method.value,
      rssDistribution: rssDistribution.value,
      currentStep: currentStep.value,
      snapshot: editorSnapshot.value,
      results: {
        worst: worstResult.value,
        rss: rssResult.value,
        modifiedRss: modifiedResult.value,
        sigma6Rss: sigma6Result.value,
      },
      methodResults,
    },
  })
  ElMessage.success(pt('msgSaved'))
  router.replace({ name: 'editor-detail', params: { id: entry.id } })
  savedId.value = entry.id
}

async function handleExportPdf() {
  if (!resultPanelRef.value) return
  const date = new Date().toISOString().slice(0, 10)
  const ok = await exportResultPdf(
    resultPanelRef.value,
    exportFilename('stackPdf', { date }),
    {
      title: `${selectedType.value ? typeName(selectedType.value.id) : pt('saveTitleFallback')} ${closedRing.value.name || 'L0'}`,
      locale: locale.value,
    },
  )
  if (ok) ElMessage.success(pt('msgPdfOk'))
}

async function handleExportExcel() {
  const date = new Date().toISOString().slice(0, 10)
  const ok = await exportExcel(buildExportPayload(), exportFilename('stackXlsx', { date }), locale.value)
  if (ok) ElMessage.success(pt('msgExcelOk'))
}

function handleExportPng() {
  const date = new Date().toISOString().slice(0, 10)
  const canvas = canvasRef.value?.getCanvas?.()
  if (canvas) {
    exportCanvasPng(canvas, exportFilename('stackCanvasPng', { date }))
  } else if (resultPanelRef.value) {
    exportResultPng(resultPanelRef.value, exportFilename('stackPng', { date }), locale.value)
  }
  ElMessage.success(pt('msgPngOk'))
}

async function handleCopy() {
  await copyResultText(buildResultText(buildExportPayload(), locale.value))
  ElMessage.success(pt('msgCopied'))
}

const decisionPreset = DECISION_PRESETS.editor
const editorBaseInputs = computed(() => ({
  closedRing: { ...closedRing.value, unit: unit.value },
  componentRings: componentRings.value,
  method: method.value,
  chainOptions: chainOpts.value,
  criticalRingIndex: 0,
}))
const editorSnapshot = computed(() => adaptSizeChain(editorBaseInputs.value))

function onEditorInverse({ variable, value }) {
  if (variable === 'criticalTolerance' && componentRings.value.length) {
    const idx = 0
    const ring = componentRings.value[idx]
    ring.tolerance = Number(value.toFixed(4))
    ring.es = ring.tolerance / 2
    ring.ei = -ring.tolerance / 2
    ElMessage.success(pt('msgInverseApplied') !== 'calc.pages.editor.msgInverseApplied'
      ? pt('msgInverseApplied')
      : '已应用反算公差')
  }
}
</script>

<style scoped>
:deep(.ring-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e74c3c inset;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  width: 100%;
}

@media (min-width: 768px) {
  .method-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.method-grid :deep(.el-radio) {
  margin-right: 0 !important;
  height: auto !important;
  width: 100%;
  align-items: flex-start;
}

.method-grid :deep(.el-radio__input) {
  margin-top: 2px;
}

.method-grid :deep(.el-radio__label) {
  width: 100%;
  padding-left: 8px;
}

.method-card {
  @apply flex flex-col items-start py-3 pl-2;
}

.method-card__title {
  @apply block text-sm font-semibold text-gray-900 dark:text-gray-100;
}

.method-card__hint {
  @apply mt-1 block text-xs text-gray-500;
}

.method-card__formula {
  @apply mt-2 block w-full text-xs text-gray-500;
}
</style>
