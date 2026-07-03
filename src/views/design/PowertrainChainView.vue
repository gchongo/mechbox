<template>
  <div>
    <h1 class="page-title">{{ ct('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ ct('subtitle') }}</p>

    <section class="card-panel mb-6">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <el-select v-model="activeId" size="small" class="!w-64" :placeholder="ct('pickChain')">
          <el-option
            v-for="c in chains"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          >
            <span>{{ c.name }}</span>
            <span class="ml-2 text-xs text-gray-400">
              {{ chainStatusLabel(c) }}
            </span>
          </el-option>
        </el-select>
        <el-button size="small" type="primary" @click="createNew">{{ ct('newChain') }}</el-button>
        <el-button size="small" plain @click="renameCurrent" :disabled="!activeChain">
          {{ ct('rename') }}
        </el-button>
        <el-popconfirm :title="ct('confirmDelete')" @confirm="removeCurrent">
          <template #reference>
            <el-button size="small" plain type="danger" :disabled="!activeChain">
              {{ ct('delete') }}
            </el-button>
          </template>
        </el-popconfirm>
        <div class="ml-auto flex items-center gap-2">
          <el-tag :type="statusTagType">
            {{ ct('overall') }}: {{ overallLabel }}
          </el-tag>
          <el-button size="small" type="primary" plain :disabled="!activeChain" @click="exportChain">
            {{ ct('exportChainReport') }}
          </el-button>
        </div>
      </div>
    </section>

    <template v-if="!activeChain">
      <el-empty :description="ct('createFirst')" />
    </template>
    <template v-else>
      <!-- Shared inputs -->
      <section class="card-panel mb-6">
        <h2 class="mb-4 font-semibold">{{ ct('sharedInputs') }}</h2>
        <el-form label-width="140px" class="grid gap-3 lg:grid-cols-2">
          <el-form-item
            v-for="(spec, key) in sharedSchema"
            :key="key"
            :label="spec.label"
          >
            <el-input-number
              :model-value="activeChain.sharedInputs[key]"
              :min="spec.min ?? 0"
              :step="spec.step ?? 1"
              :precision="spec.precision"
              @change="updateShared(key, $event)"
            />
          </el-form-item>
        </el-form>
      </section>

      <!-- Steps -->
      <div class="grid gap-6 lg:grid-cols-3">
        <ChainStepCard
          v-for="step in activeChain.steps"
          :key="step.key"
          :step="step"
          :snapshot="stepSnapshots[step.key]"
          :meta="stepMeta(step.key)"
          @open-tool="openTool"
          @update-notes="updateStepNotes(step.key, $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  CHAIN_TYPES,
  createChain,
  deleteChain,
  getChain,
  listChains,
  renameChain,
  saveStep,
  updateSharedInputs,
  chainSummary,
} from '@/utils/design-context'
import { buildChainReport } from '@/utils/chain-report'
import { exportToolReportPdf } from '@/utils/export'
import { adaptShaftTorsion, adaptBearing, adaptKeyConnection } from '@/utils/calc-adapters'
import ChainStepCard from '@/components/design/ChainStepCard.vue'
import { useLocale } from '@/composables/useLocale'

const CHAIN_TYPE = 'powertrain'
const router = useRouter()
const { t } = useLocale()

function ct(key, params) {
  const path = `calc.design.powertrain.${key}`
  const v = t(path, params)
  return v === path ? key : v
}

const chains = ref([])
const activeId = ref(null)
const activeChain = computed(() => chains.value.find((c) => c.id === activeId.value) ?? null)
const sharedSchema = computed(() => CHAIN_TYPES[CHAIN_TYPE].sharedInputSchema)

function refresh() {
  chains.value = listChains(CHAIN_TYPE)
  if (!chains.value.find((c) => c.id === activeId.value)) {
    activeId.value = chains.value[0]?.id ?? null
  }
}

onMounted(refresh)

const stepSnapshots = computed(() => {
  if (!activeChain.value) return {}
  const shared = activeChain.value.sharedInputs
  return {
    shaft: adaptShaftTorsion({
      calcMode: 'complete',
      diameter: shared.shaftDiameter,
      torque: shared.torque,
      yieldStrength: shared.yieldStrength,
      length: 500,
    }),
    bearing: adaptBearing({
      calcMode: 'simple',
      dynamicLoad: 30000,
      radialLoad: shared.radialLoad,
      axialLoad: shared.axialLoad,
      x: 1,
      y: 0,
      rpm: shared.rpm,
      targetHours: shared.targetHours,
      shaftDiameter: shared.shaftDiameter,
    }),
    key: adaptKeyConnection({
      calcMode: 'complete',
      torque: shared.torque,
      shaftDiameter: shared.shaftDiameter,
      keyWidth: 8,
      keyHeight: 7,
      keyLength: 28,
      hubLength: 28,
      allowShear: 100,
      allowCrush: 150,
    }),
  }
})

watch(
  stepSnapshots,
  (snaps) => {
    if (!activeId.value) return
    for (const key of Object.keys(snaps)) {
      saveStep(activeId.value, key, { snapshot: snaps[key] })
    }
    refreshCurrent()
  },
  { deep: true },
)

function refreshCurrent() {
  const cur = getChain(activeId.value)
  if (cur) {
    const idx = chains.value.findIndex((c) => c.id === cur.id)
    if (idx >= 0) chains.value[idx] = cur
  }
}

const currentSummary = computed(() => chainSummary(activeChain.value))
const overallLabel = computed(() => {
  const s = currentSummary.value.status
  if (s === 'pass') return t('calc.decision.overallPass') !== 'calc.decision.overallPass' ? t('calc.decision.overallPass') : '通过'
  if (s === 'fail') return '不通过'
  if (s === 'incomplete') return '未完成'
  return '-'
})
const statusTagType = computed(() => {
  const s = currentSummary.value.status
  return s === 'pass' ? 'success' : s === 'fail' ? 'danger' : 'info'
})

function chainStatusLabel(c) {
  const s = chainSummary(c)
  return `${s.passCount}/${s.total}`
}

function stepMeta(key) {
  return CHAIN_TYPES[CHAIN_TYPE].steps.find((s) => s.key === key)
}

function createNew() {
  const c = createChain({ type: CHAIN_TYPE })
  refresh()
  activeId.value = c.id
  ElMessage.success(ct('created'))
}

async function renameCurrent() {
  if (!activeChain.value) return
  try {
    const { value } = await ElMessageBox.prompt(ct('renamePrompt'), ct('rename'), {
      inputValue: activeChain.value.name,
    })
    if (value) {
      renameChain(activeId.value, value)
      refresh()
    }
  } catch {
    /* cancelled */
  }
}

function removeCurrent() {
  if (!activeChain.value) return
  deleteChain(activeId.value)
  refresh()
  ElMessage.success(ct('deleted'))
}

function updateShared(key, value) {
  if (!activeChain.value) return
  updateSharedInputs(activeId.value, { [key]: Number(value) })
  refreshCurrent()
}

function updateStepNotes(stepKey, notes) {
  if (!activeChain.value) return
  saveStep(activeId.value, stepKey, { notes })
  refreshCurrent()
}

function openTool(toolId) {
  const routeMap = { shaft: '/shaft', bearing: '/bearing', key: '/key' }
  const target = routeMap[toolId]
  if (target) router.push(target)
}

async function exportChain() {
  if (!activeChain.value) return
  const report = buildChainReport(activeChain.value)
  await exportToolReportPdf({
    title: report.title,
    subtitle: report.subtitle,
    sections: report.sections,
  })
  ElMessage.success(ct('reportDone'))
}
</script>
