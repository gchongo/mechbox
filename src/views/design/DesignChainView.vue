<template>
  <div>
    <h1 class="page-title">{{ ct('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ ct('subtitle') }}</p>

    <section class="card-panel mb-6">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <el-select v-model="activeId" size="small" class="!w-64" :placeholder="ct('pickChain')">
          <el-option v-for="c in chains" :key="c.id" :label="c.name" :value="c.id">
            <span>{{ c.name }}</span>
            <span class="ml-2 text-xs text-gray-400">{{ chainStatusLabel(c) }}</span>
          </el-option>
        </el-select>
        <el-button size="small" type="primary" @click="createNew">{{ ct('newChain') }}</el-button>
        <el-button size="small" plain @click="router.push('/design/projects')">{{ ct('projectsLink') }}</el-button>
        <el-button size="small" plain :disabled="!activeChain" @click="renameCurrent">{{ ct('rename') }}</el-button>
        <el-popconfirm :title="ct('confirmDelete')" @confirm="removeCurrent">
          <template #reference>
            <el-button size="small" plain type="danger" :disabled="!activeChain">{{ ct('delete') }}</el-button>
          </template>
        </el-popconfirm>
        <div class="ml-auto flex items-center gap-2">
          <el-tag :type="statusTagType">{{ ct('overall') }}: {{ overallLabel }}</el-tag>
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
      <section class="card-panel mb-6">
        <h2 class="mb-4 font-semibold">{{ ct('sharedInputs') }}</h2>
        <el-form label-width="160px" class="grid gap-3 lg:grid-cols-2 design-chain-form">
          <el-form-item v-for="(spec, key) in sharedSchema" :key="key">
            <template #label>
              <FormMathLabel :text="spec.label" />
            </template>
            <el-input-number
              class="design-chain-input"
              :model-value="activeChain.sharedInputs[key]"
              :min="spec.min ?? 0"
              :step="spec.step ?? 1"
              :precision="spec.precision"
              controls-position="right"
              @change="updateShared(key, $event)"
            />
          </el-form-item>
        </el-form>
      </section>

      <div class="grid gap-6" :class="gridClass">
        <ChainStepCard
          v-for="step in activeChain.steps"
          :key="step.key"
          :step="step"
          :snapshot="stepSnapshots[step.key]"
          :meta="stepMeta(step.key)"
          :chain-type="chainType"
          :shared-inputs="activeChain.sharedInputs"
          @open-tool="openTool(step.key, $event)"
          @update-notes="updateStepNotes(step.key, $event)"
          @apply-shared="onApplyShared"
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
import { buildChainSnapshots, buildStepInputs } from '@/utils/chain-snapshots'
import { writeChainHandoff } from '@/utils/chain-handoff'
import { buildChainReport } from '@/utils/chain-report'
import { exportToolReportPdf } from '@/utils/export'
import ChainStepCard from '@/components/design/ChainStepCard.vue'
import FormMathLabel from '@/components/common/FormMathLabel.vue'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  chainType: { type: String, required: true },
})

const router = useRouter()
const { t } = useLocale()

function ct(key, params) {
  const path = `calc.design.${props.chainType}.${key}`
  const v = t(path, params)
  if (v !== path) return v
  const fallback = `calc.design.common.${key}`
  const fv = t(fallback, params)
  return fv !== fallback ? fv : key
}

const chains = ref([])
const activeId = ref(null)
const activeChain = computed(() => chains.value.find((c) => c.id === activeId.value) ?? null)
const sharedSchema = computed(() => CHAIN_TYPES[props.chainType]?.sharedInputSchema ?? {})
const gridClass = computed(() =>
  (CHAIN_TYPES[props.chainType]?.steps?.length ?? 3) >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
)

function refresh() {
  chains.value = listChains(props.chainType)
  if (!chains.value.find((c) => c.id === activeId.value)) {
    activeId.value = chains.value[0]?.id ?? null
  }
}

onMounted(refresh)
watch(() => props.chainType, refresh)

const stepSnapshots = computed(() => {
  if (!activeChain.value) return {}
  return buildChainSnapshots(props.chainType, activeChain.value.sharedInputs)
})

/**
 * 仅在共享输入变化时落盘快照。
 * 旧实现 watch(stepSnapshots, { deep }) + refreshCurrent 会因每次
 * adapter 返回新对象引用而无限重入，导致页面卡死。
 */
watch(
  () => {
    const c = activeChain.value
    if (!c) return null
    return JSON.stringify({ id: c.id, ...c.sharedInputs })
  },
  (key) => {
    if (!key || !activeId.value || !activeChain.value) return
    const snaps = buildChainSnapshots(props.chainType, activeChain.value.sharedInputs)
    const chain = chains.value.find((c) => c.id === activeId.value)
    for (const stepKey of Object.keys(snaps)) {
      saveStep(activeId.value, stepKey, { snapshot: snaps[stepKey] })
      const step = chain?.steps.find((s) => s.key === stepKey)
      if (step) step.snapshot = snaps[stepKey]
    }
  },
)

function refreshCurrent() {
  const cur = getChain(activeId.value)
  if (cur) {
    const idx = chains.value.findIndex((c) => c.id === cur.id)
    if (idx >= 0) {
      // 保留当前 sharedInputs 引用，避免无谓触发共享输入 watch
      const prev = chains.value[idx]
      chains.value[idx] = {
        ...cur,
        sharedInputs: prev.sharedInputs,
      }
    }
  }
}

const currentSummary = computed(() => {
  const snaps = stepSnapshots.value
  const keys = Object.keys(snaps)
  if (!keys.length) return chainSummary(activeChain.value)
  const passCount = keys.filter((k) => snaps[k]?.pass).length
  const failCount = keys.length - passCount
  return {
    status: failCount === 0 ? 'pass' : 'fail',
    passCount,
    total: keys.length,
    failCount,
  }
})
const overallLabel = computed(() => {
  const s = currentSummary.value.status
  if (s === 'pass') return t('calc.decision.overallPass')
  if (s === 'fail') return t('calc.decision.overallFail')
  if (s === 'incomplete') return t('calc.decision.overallIncomplete')
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
  return CHAIN_TYPES[props.chainType]?.steps.find((s) => s.key === key)
}

function createNew() {
  const c = createChain({ type: props.chainType })
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
  const num = Number(value)
  updateSharedInputs(activeId.value, { [key]: num })
  // 就地写入，触发共享输入 watch；勿整体替换 chain（会丢引用或重入）
  activeChain.value.sharedInputs[key] = num
}

function onApplyShared({ field, value }) {
  if (field && Number.isFinite(value)) {
    updateShared(field, value)
    ElMessage.success(ct('applied'))
  }
}

function updateStepNotes(stepKey, notes) {
  if (!activeChain.value) return
  saveStep(activeId.value, stepKey, { notes })
  refreshCurrent()
}

function openTool(stepKey, toolId) {
  const routeMap = {
    shaft: '/shaft',
    bearing: '/bearing',
    key: '/key',
    'bolt-preload': '/bolt-preload',
    'bolt-group': '/bolt-group',
    weld: '/weld',
  }
  const target = routeMap[toolId]
  if (!target || !activeChain.value) return
  const inputs = buildStepInputs(props.chainType, stepKey, activeChain.value.sharedInputs)
  writeChainHandoff({
    chainId: activeChain.value.id,
    chainType: props.chainType,
    stepKey,
    toolId,
    inputs,
  })
  router.push(target)
}

async function exportChain() {
  if (!activeChain.value) return
  const snaps = stepSnapshots.value
  const chainForReport = {
    ...activeChain.value,
    steps: activeChain.value.steps.map((s) => ({
      ...s,
      snapshot: snaps[s.key] ?? s.snapshot,
    })),
  }
  const report = buildChainReport(chainForReport)
  const ok = await exportToolReportPdf({
    title: report.title,
    subtitle: report.subtitle,
    sections: report.sections,
  })
  if (ok) ElMessage.success(ct('reportDone'))
}
</script>
