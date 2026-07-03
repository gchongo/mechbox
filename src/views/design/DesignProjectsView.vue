<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <section class="card-panel mb-6">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <el-select v-model="activeId" size="small" class="!w-64" :placeholder="pt('pickProject')">
          <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id">
            <span>{{ p.name }}</span>
            <span class="ml-2 text-xs text-gray-400">{{ pt('chainCount', { n: p.chainRefs.length }) }}</span>
          </el-option>
        </el-select>
        <el-button size="small" type="primary" @click="createNew">{{ pt('newProject') }}</el-button>
        <el-button size="small" plain :disabled="!activeProject" @click="renameCurrent">{{ pt('rename') }}</el-button>
        <el-popconfirm :title="pt('confirmDelete')" @confirm="removeCurrent">
          <template #reference>
            <el-button size="small" plain type="danger" :disabled="!activeProject">{{ pt('delete') }}</el-button>
          </template>
        </el-popconfirm>
      </div>
    </section>

    <template v-if="!activeProject">
      <el-empty :description="pt('createFirst')" />
    </template>
    <template v-else>
      <section class="card-panel mb-6">
        <el-form label-width="100px">
          <el-form-item :label="pt('description')">
            <el-input
              v-model="descriptionDraft"
              type="textarea"
              :rows="2"
              :placeholder="pt('descriptionPlaceholder')"
              @change="saveDescription"
            />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-semibold">{{ pt('attachedChains') }}</h2>
          <el-button size="small" type="primary" plain :disabled="!availableChains.length" @click="showAttach = true">
            {{ pt('attachChain') }}
          </el-button>
        </div>

        <el-empty v-if="!linkedChains.length" :description="pt('noChains')" />
        <el-table v-else :data="linkedChains" size="small" border>
          <el-table-column prop="name" label="链名" min-width="160" />
          <el-table-column prop="typeLabel" label="类型" min-width="140" />
          <el-table-column label="状态" min-width="100">
            <template #default="{ row }">
              <el-tag :type="row.statusType" size="small">{{ row.statusLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="" width="160">
            <template #default="{ row }">
              <el-button size="small" text type="primary" @click="openChain(row)">{{ pt('openChain') }}</el-button>
              <el-button size="small" text type="danger" @click="detach(row.chainId)">{{ pt('detach') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </template>

    <el-dialog v-model="showAttach" :title="pt('attachPrompt')" width="420px">
      <el-select v-model="attachPick" class="w-full" :placeholder="pt('attachPrompt')">
        <el-option
          v-for="c in availableChains"
          :key="c.id"
          :label="`${c.name} (${chainTypeLabel(c.type)})`"
          :value="c.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="showAttach = false">{{ pt('cancel') }}</el-button>
        <el-button type="primary" :disabled="!attachPick" @click="confirmAttach">{{ pt('attachChain') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listProjects,
  createProject,
  renameProject,
  deleteProject,
  attachChain,
  detachChain,
  updateProject,
  getProject,
} from '@/utils/design-project'
import { listChains, getChain, CHAIN_TYPES, chainSummary } from '@/utils/design-context'
import { useLocale } from '@/composables/useLocale'

const router = useRouter()
const { t } = useLocale()

function pt(key, params) {
  const path = `calc.design.projects.${key}`
  const v = t(path, params)
  return v !== path ? v : key
}

const projects = ref([])
const activeId = ref(null)
const descriptionDraft = ref('')
const showAttach = ref(false)
const attachPick = ref(null)

const activeProject = computed(() => projects.value.find((p) => p.id === activeId.value) ?? null)

const allChains = computed(() => [
  ...listChains('powertrain'),
  ...listChains('bolt-joint'),
])

const availableChains = computed(() => {
  if (!activeProject.value) return []
  const linked = new Set(activeProject.value.chainRefs.map((r) => r.chainId))
  return allChains.value.filter((c) => !linked.has(c.id))
})

const linkedChains = computed(() => {
  if (!activeProject.value) return []
  return activeProject.value.chainRefs.map((ref) => {
    const chain = getChain(ref.chainId)
    const summary = chainSummary(chain)
    const statusLabel = summary.status === 'pass'
      ? t('calc.decision.overallPass')
      : summary.status === 'fail'
        ? t('calc.decision.overallFail')
        : t('calc.decision.overallIncomplete')
    const statusType = summary.status === 'pass' ? 'success' : summary.status === 'fail' ? 'danger' : 'info'
    return {
      chainId: ref.chainId,
      chainType: ref.chainType,
      name: chain?.name ?? ref.chainId,
      typeLabel: chainTypeLabel(ref.chainType),
      statusLabel,
      statusType,
    }
  })
})

function chainTypeLabel(type) {
  return CHAIN_TYPES[type]?.label ?? type
}

function refresh() {
  projects.value = listProjects()
  if (!projects.value.find((p) => p.id === activeId.value)) {
    activeId.value = projects.value[0]?.id ?? null
  }
}

onMounted(refresh)

watch(activeProject, (p) => {
  descriptionDraft.value = p?.description ?? ''
})

function createNew() {
  const p = createProject()
  refresh()
  activeId.value = p.id
  ElMessage.success(pt('created'))
}

async function renameCurrent() {
  if (!activeProject.value) return
  try {
    const { value } = await ElMessageBox.prompt(pt('renamePrompt'), pt('rename'), {
      inputValue: activeProject.value.name,
    })
    if (value) {
      renameProject(activeId.value, value)
      refresh()
    }
  } catch {
    /* cancelled */
  }
}

function removeCurrent() {
  if (!activeProject.value) return
  deleteProject(activeId.value)
  refresh()
  ElMessage.success(pt('deleted'))
}

function saveDescription() {
  if (!activeProject.value) return
  updateProject(activeId.value, { description: descriptionDraft.value })
  refresh()
}

function confirmAttach() {
  if (!activeProject.value || !attachPick.value) return
  const chain = allChains.value.find((c) => c.id === attachPick.value)
  if (!chain) return
  attachChain(activeId.value, { chainId: chain.id, chainType: chain.type })
  refresh()
  const cur = getProject(activeId.value)
  if (cur) {
    const idx = projects.value.findIndex((p) => p.id === cur.id)
    if (idx >= 0) projects.value[idx] = cur
  }
  showAttach.value = false
  attachPick.value = null
}

function detach(chainId) {
  detachChain(activeId.value, chainId)
  refresh()
  const cur = getProject(activeId.value)
  if (cur) {
    const idx = projects.value.findIndex((p) => p.id === cur.id)
    if (idx >= 0) projects.value[idx] = cur
  }
}

function openChain(row) {
  const routes = {
    powertrain: '/design/powertrain',
    'bolt-joint': '/design/bolt-joint',
  }
  const path = routes[row.chainType]
  if (path) router.push(path)
}
</script>
