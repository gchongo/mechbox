<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <section class="card-panel mb-6 thread-workflow-hub">
      <h2 class="mb-2 text-sm font-semibold">{{ pt('hubTitle') }}</h2>
      <p class="mb-3 text-xs text-gray-500">{{ pt('hubIntro') }}</p>
      <div class="flex flex-wrap gap-2">
        <el-button
          v-for="step in hubSteps"
          :key="`${step.featureTab}-${step.designSub || step.purpose || ''}`"
          size="small"
          :type="isHubActive(step) ? 'primary' : 'default'"
          @click="goHub(step)"
        >
          {{ pt(step.labelKey) }}
        </el-button>
        <router-link to="/thread">
          <el-button size="small" type="info" plain>{{ pt('hubStrength') }} →</el-button>
        </router-link>
      </div>
    </section>

    <section v-if="isPurposeTab" class="card-panel mb-6">
      <ThreadProfileDiagram
        :angle="diagramAngle"
        :title="diagramTitle"
        :formula="diagramFormula"
        :aria="pt('diagramAria')"
        :labels="{ external: pt('externalThread'), internal: pt('internalThread') }"
      />
      <el-alert
        v-if="featureTab === 'pipe'"
        class="mt-4"
        type="warning"
        :closable="false"
        show-icon
        :title="pt('pipeCompatibilityWarn')"
      />
    </section>

    <section class="card-panel">
      <el-tabs v-model="featureTab" class="mb-4">
        <el-tab-pane v-for="p in purposeTabs" :key="p" :label="pt(`cat_${p}`)" :name="p" />
        <el-tab-pane :label="pt('tabParse')" name="parse" />
        <el-tab-pane :label="pt('tabCompare')" name="compare">
          <template #label>
            <span>{{ pt('tabCompare') }}</span>
            <el-badge v-if="compareIds.length" :value="compareIds.length" class="ml-1" />
          </template>
        </el-tab-pane>
        <el-tab-pane :label="pt('tabDesignFlow')" name="design" />
      </el-tabs>

      <ThreadCategoryPanel
        v-if="isPurposeTab"
        v-model:selected-system-id="selectedSystemByPurpose[featureTab]"
        :purpose-id="featureTab"
        :pt="pt"
        :compare-ids="compareIds"
        :highlight-row-id="highlightRowId"
        @row-click="openDetail"
        @toggle-compare="toggleCompare"
        @open-catalog="onDesignOpenQuery"
        @open-compare="onMisconfigCompare"
      />

      <template v-else-if="featureTab === 'design'">
        <el-tabs v-model="designSubTab" class="mb-4" type="card">
          <el-tab-pane :label="pt('designSubWizard')" name="wizard" />
          <el-tab-pane :label="pt('devTabTolerance')" name="tolerance" />
          <el-tab-pane :label="pt('devTabEngagement')" name="engagement" />
          <el-tab-pane :label="pt('devTabTapDrill')" name="tapDrill" />
          <el-tab-pane :label="pt('devTabMisconfig')" name="misconfig" />
          <el-tab-pane :label="pt('devTabMfg')" name="mfg" />
        </el-tabs>
        <ThreadDesignWizard
          v-if="designSubTab === 'wizard'"
          :pt="pt"
          @open-query="onDesignOpenQuery"
          @open-row="navigateToCatalogRow"
          @open-compare="onMisconfigCompare"
        />
        <ThreadToleranceGuide v-else-if="designSubTab === 'tolerance'" :pt="pt" />
        <ThreadEngagementPanel v-else-if="designSubTab === 'engagement'" :pt="pt" />
        <ThreadTapDrillPanel v-else-if="designSubTab === 'tapDrill'" :pt="pt" />
        <ThreadMisconfigPanel
          v-else-if="designSubTab === 'misconfig'"
          :pt="pt"
          @open-compare="onMisconfigCompare"
        />
        <ThreadManufacturingPanel v-else-if="designSubTab === 'mfg'" :pt="pt" />
      </template>

      <ThreadParsePanel
        v-else-if="featureTab === 'parse'"
        :pt="pt"
        @locate="onLocateRow"
      />

      <ThreadComparePanel
        v-else-if="featureTab === 'compare'"
        v-model="compareIds"
        :pt="pt"
      />
    </section>

    <ThreadDetailDrawer
      :visible="detailVisible"
      :row="detailRow"
      :pt="pt"
      @close="detailVisible = false"
      @select-row="openDetailRow"
      @add-compare="addToCompare"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  THREAD_PURPOSE_ORDER,
  resolveTaxonomyFromCatalog,
  getThreadSystemDef,
} from '@/constants/thread-standards/taxonomy'
import { getComparePresets } from '@/utils/thread-standards'
import ThreadProfileDiagram from '@/components/thread/ThreadProfileDiagram.vue'
import ThreadCategoryPanel from '@/components/thread/ThreadCategoryPanel.vue'
import ThreadDetailDrawer from '@/components/thread/ThreadDetailDrawer.vue'
import ThreadParsePanel from '@/components/thread/ThreadParsePanel.vue'
import ThreadComparePanel from '@/components/thread/ThreadComparePanel.vue'
import ThreadDesignWizard from '@/components/thread/ThreadDesignWizard.vue'
import ThreadEngagementPanel from '@/components/thread/ThreadEngagementPanel.vue'
import ThreadTapDrillPanel from '@/components/thread/ThreadTapDrillPanel.vue'
import ThreadToleranceGuide from '@/components/thread/ThreadToleranceGuide.vue'
import ThreadMisconfigPanel from '@/components/thread/ThreadMisconfigPanel.vue'
import ThreadManufacturingPanel from '@/components/thread/ThreadManufacturingPanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt } = useCalcPage('thread-table')

const purposeTabs = THREAD_PURPOSE_ORDER
const featureTab = ref('fastener')
const designSubTab = ref('wizard')

const selectedSystemByPurpose = reactive({
  fastener: 'metric_coarse',
  pipe: 'npt',
  power: 'tr',
  special: 'rd',
})

const detailVisible = ref(false)
const detailRow = ref(null)
const compareIds = ref([])
const highlightRowId = ref(null)

const isPurposeTab = computed(() => purposeTabs.includes(featureTab.value))

const activeTaxonomyId = computed(() => {
  if (!isPurposeTab.value) return null
  return selectedSystemByPurpose[featureTab.value]
})

const activeSystemDef = computed(() =>
  activeTaxonomyId.value ? getThreadSystemDef(activeTaxonomyId.value) : null,
)

const diagramAngle = computed(() => activeSystemDef.value?.diagramAngle ?? 60)

const diagramTitle = computed(() => {
  if (!activeTaxonomyId.value) return ''
  return pt(`ts_${activeTaxonomyId.value}_name`)
})

const diagramFormula = computed(() => {
  if (activeSystemDef.value?.angle === 55) return pt('formula55')
  if (activeSystemDef.value?.profile === 'trapezoidal') return pt('formulaTrapezoidal')
  return pt('formula60')
})

const hubSteps = [
  { labelKey: 'hubStepDesign', featureTab: 'design', designSub: 'wizard' },
  { labelKey: 'hubStepTolerance', featureTab: 'design', designSub: 'tolerance' },
  { labelKey: 'hubStepEngagement', featureTab: 'design', designSub: 'engagement' },
  { labelKey: 'hubStepTap', featureTab: 'design', designSub: 'tapDrill' },
  { labelKey: 'hubStepFastener', featureTab: 'fastener' },
  { labelKey: 'hubStepPipe', featureTab: 'pipe' },
  { labelKey: 'hubStepMisconfig', featureTab: 'design', designSub: 'misconfig' },
]

function isHubActive(step) {
  if (featureTab.value !== step.featureTab) return false
  if (step.designSub) return designSubTab.value === step.designSub
  return true
}

function goHub(step) {
  featureTab.value = step.featureTab
  if (step.designSub) designSubTab.value = step.designSub
}

function onMisconfigCompare(presetId) {
  const preset = getComparePresets().find((p) => p.id === presetId)
  if (!preset?.rowIds?.length) return
  featureTab.value = 'compare'
  compareIds.value = preset.rowIds.slice(0, 3)
}

function openDetail(row) {
  detailRow.value = row
  detailVisible.value = true
}

function openDetailRow(row) {
  detailRow.value = row
  detailVisible.value = true
}

function addToCompare(row) {
  if (compareIds.value.includes(row.id)) return
  if (compareIds.value.length >= 3) {
    ElMessage.warning(pt('compareMax'))
    return
  }
  compareIds.value = [...compareIds.value, row.id]
  ElMessage.success(pt('compareAdded'))
}

function toggleCompare(row) {
  if (compareIds.value.includes(row.id)) {
    compareIds.value = compareIds.value.filter((id) => id !== row.id)
  } else {
    addToCompare(row)
  }
}

function navigateToCatalogRow(row) {
  if (row.referenceOnly && ['bsw', 'bsf'].includes(row.system)) {
    featureTab.value = 'fastener'
    selectedSystemByPurpose.fastener = row.system === 'bsf' ? 'bsf' : row.system === 'bsw' ? 'bsw' : 'whitworth'
    highlightRowId.value = row.id
    openDetail(row)
    return
  }
  const taxId = resolveTaxonomyFromCatalog(row.system, row.subSeries)
  if (taxId) {
    const def = getThreadSystemDef(taxId)
    if (def) {
      featureTab.value = def.purpose
      selectedSystemByPurpose[def.purpose] = taxId
    }
  }
  highlightRowId.value = row.id
  openDetail(row)
}

function onLocateRow(row) {
  navigateToCatalogRow(row)
}

function onDesignOpenQuery({ system, subSeries }) {
  const taxId = resolveTaxonomyFromCatalog(system, subSeries)
  if (!taxId) return
  const def = getThreadSystemDef(taxId)
  if (!def) return
  featureTab.value = def.purpose
  selectedSystemByPurpose[def.purpose] = taxId
  highlightRowId.value = ''
}
</script>
