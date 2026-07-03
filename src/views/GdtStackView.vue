<template>
  <div>
    <h1 class="page-title">GD&T 形位公差栈</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      位置度/平面度/同轴度等专用叠加、基准累积与贡献度分析
    </p>

    <section class="card-panel mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button label="simple">简化</el-radio-button>
          <el-radio-button label="complete">完整</el-radio-button>
          <el-radio-button label="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">RSS/极值叠加结果。</template>
          <template v-else-if="form.calcMode === 'complete'">贡献度与基准累积。</template>
          <template v-else>极值裕度与收紧建议。</template>
        </p>
      </div>
    </section>

    <el-alert
      v-if="fromEditor"
      class="mb-4"
      type="success"
      :closable="true"
      show-icon
      title="已从尺寸链编辑器导入"
      :description="`类型: ${importedTypeName ?? form.typeId}，${form.rings.length} 个组成环`"
    />

    <div class="mb-4 flex flex-wrap gap-2">
      <el-button
        v-for="(p, key) in GDT_STACK_PRESETS"
        :key="key"
        size="small"
        @click="loadPreset(key)"
      >
        {{ p.label }}
      </el-button>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="100px">
          <el-form-item label="GD&T 类型">
            <el-select v-model="form.typeId" class="w-full">
              <el-option v-for="(m, k) in GDT_CALC_MODES" :key="k" :label="m.label" :value="k" />
            </el-select>
          </el-form-item>
          <el-form-item label="叠加方法">
            <el-select v-model="form.method" class="w-full">
              <el-option value="rss" label="RSS" />
              <el-option value="worst" label="极值" />
              <el-option value="modified-rss" label="修正 RSS" />
            </el-select>
          </el-form-item>
          <el-form-item label="封闭环上限">
            <el-input-number v-model="form.closedMax" :min="0.001" :precision="4" :step="0.01" />
          </el-form-item>
          <el-form-item label="材料条件">
            <el-radio-group v-model="form.toleranceModifier">
              <el-radio label="RFS">RFS</el-radio>
              <el-radio label="MMC">MMC</el-radio>
              <el-radio label="LMC">LMC</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.toleranceModifier !== 'RFS'" label="奖励公差">
            <el-input-number v-model="form.bonusTolerance" :min="0" :precision="4" :step="0.005" />
          </el-form-item>
        </el-form>

        <h3 class="mb-2 text-sm font-semibold">组成环</h3>
        <div v-for="(ring, i) in form.rings" :key="i" class="mb-2 rounded border border-gray-100 p-2 dark:border-gray-700">
          <div class="flex flex-wrap gap-2">
            <el-input v-model="ring.name" placeholder="名称" class="w-28" size="small" />
            <el-input-number v-model="ring.tolerance" :min="0" :precision="4" :step="0.005" size="small" />
            <el-input-number v-model="ring.factor" :min="0" :max="2" :precision="2" :step="0.1" size="small" />
            <el-select v-if="needsDirection" v-model="ring.direction" size="small" class="w-20">
              <el-option value="right" label="X" />
              <el-option value="up" label="Y" />
            </el-select>
            <el-button size="small" type="danger" text @click="removeRing(i)">删</el-button>
          </div>
        </div>
        <el-button size="small" @click="addRing">+ 添加环</el-button>

        <h3 class="mb-2 mt-4 text-sm font-semibold">基准 (可选)</h3>
        <div v-for="(d, i) in form.datums" :key="i" class="mb-2 flex gap-2">
          <el-input v-model="d.label" size="small" placeholder="基准" class="flex-1" />
          <el-select v-model="d.priority" size="small" class="w-24">
            <el-option value="primary" label="主" />
            <el-option value="secondary" label="次" />
            <el-option value="tertiary" label="三" />
          </el-select>
          <el-input-number v-model="d.tolerance" :min="0" :precision="4" size="small" />
          <el-button size="small" type="danger" text @click="form.datums.splice(i, 1)">删</el-button>
        </div>
        <el-button size="small" @click="addDatum">+ 基准</el-button>
      </section>

      <section ref="resultRef" class="card-panel">
        <el-alert v-if="result?.errorKey" :title="resultError(result)" type="warning" show-icon />
        <template v-else-if="result">
          <div class="mb-4 flex items-center gap-2">
            <el-tag :type="result.pass ? 'success' : 'danger'">
              {{ result.pass ? '合格' : '不合格' }}
            </el-tag>
            <span class="text-sm text-gray-500">{{ result.mode.label }}</span>
          </div>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between rounded bg-primary/5 p-3">
              <dt>叠加公差</dt>
              <dd class="font-mono text-lg text-primary">{{ result.chainResult.totalTolerance?.toFixed(4) }} mm</dd>
            </div>
            <div v-if="result.modifier.effective !== result.chainResult.totalTolerance" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>含 {{ form.toleranceModifier }} 奖励</dt>
              <dd class="font-mono">{{ result.modifier.effective?.toFixed(4) }} mm</dd>
            </div>
            <div v-if="result.datumStack" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>含基准累积</dt>
              <dd class="font-mono" :class="result.passWithDatum ? 'text-success' : 'text-error'">
                {{ result.effectiveWithDatum?.toFixed(4) }} mm
              </dd>
            </div>
            <div v-if="result.worstCaseMargin != null" class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
              <dt>极值裕度</dt>
              <dd class="font-mono" :class="result.worstCaseMargin >= 0 ? 'text-success' : 'text-error'">
                {{ result.worstCaseMargin?.toFixed(4) }} mm
              </dd>
            </div>
          </dl>

          <h3 v-if="result.contributions?.length" class="mb-2 mt-4 text-sm font-semibold">贡献度</h3>
          <el-table v-if="result.contributions?.length" :data="result.contributions" size="small" border>
            <el-table-column prop="name" label="组成环" />
            <el-table-column label="公差 (mm)">
              <template #default="{ row }">{{ row.tolerance?.toFixed(4) }}</template>
            </el-table-column>
            <el-table-column label="贡献 (%)">
              <template #default="{ row }">
                <div class="flex items-center gap-2">
                  <div class="h-2 flex-1 rounded bg-gray-100 dark:bg-gray-800">
                    <div class="h-2 rounded bg-primary" :style="{ width: `${Math.min(row.percent, 100)}%` }" />
                  </div>
                  <span class="font-mono text-xs">{{ row.percent?.toFixed(1) }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </section>
    </div>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <el-button type="primary" plain @click="exportPdf">导出 PDF</el-button>
      <SaveHistoryButton
        tool="gdt-stack"
        :title="`GD&T ${form.typeId}`"
        :status="result?.pass ? 'pass' : 'fail'"
        :summary="historySummary"
        :input="form"
        :result="result"
      />
      <router-link to="/editor">
        <el-button plain>打开尺寸链编辑器</el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  analyzeGdtStack,
  GDT_STACK_PRESETS,
  GDT_CALC_MODES,
  buildGdtStackReportText,
} from '@/utils/gdt-stack-calc'
import { exportToolReportPdf } from '@/utils/export'
import { GDT_STACK_STORAGE_KEY, deserializeGdtStackPayload } from '@/constants/editor-bridge'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import { useResultI18n } from '@/composables/useResultI18n'

const route = useRoute()
const { resultError } = useResultI18n()
const resultRef = ref(null)
const fromEditor = ref(false)
const importedTypeName = ref('')

const form = reactive({
  calcMode: 'complete',
  typeId: 'position',
  method: 'rss',
  closedMax: 0.15,
  toleranceModifier: 'RFS',
  bonusTolerance: 0,
  rings: [...GDT_STACK_PRESETS.position.rings],
  datums: [...GDT_STACK_PRESETS.position.datums],
})

const needsDirection = computed(() => {
  const m = GDT_CALC_MODES[form.typeId]
  return m?.stack === '2d-position'
})

const result = computed(() =>
  analyzeGdtStack({
    calcMode: form.calcMode,
    typeId: form.typeId,
    method: form.method,
    closedRing: { min: 0, max: form.closedMax },
    rings: form.rings,
    datums: form.datums,
    toleranceModifier: form.toleranceModifier,
    bonusTolerance: form.bonusTolerance,
  }),
)

const historySummary = computed(() => {
  const r = result.value
  if (!r || r.errorKey) return []
  return [
    { label: '类型', value: r.mode.label },
    { label: '公差 (mm)', value: r.chainResult.totalTolerance?.toFixed(4) },
    { label: '合格', value: r.pass ? '是' : '否' },
  ]
})

function applyEditorPayload(payload) {
  form.typeId = payload.typeId
  form.method = payload.method
  form.closedMax = payload.closedMax
  form.toleranceModifier = payload.toleranceModifier
  form.bonusTolerance = payload.bonusTolerance
  form.rings = payload.rings.length ? payload.rings : form.rings
  form.datums = payload.datums ?? []
  importedTypeName.value = payload.typeName ?? payload.typeId
}

onMounted(() => {
  if (route.query.from === 'editor') {
    try {
      const raw = sessionStorage.getItem(GDT_STACK_STORAGE_KEY)
      const payload = deserializeGdtStackPayload(raw ? JSON.parse(raw) : null)
      if (payload) {
        applyEditorPayload(payload)
        fromEditor.value = true
        sessionStorage.removeItem(GDT_STACK_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }
})

function loadPreset(key) {
  const p = GDT_STACK_PRESETS[key]
  if (!p) return
  form.typeId = p.typeId
  form.closedMax = p.closedRing.max
  form.rings = p.rings.map((r) => ({ ...r }))
  form.datums = (p.datums ?? []).map((d) => ({ ...d }))
}

function addRing() {
  form.rings.push({
    name: `环${form.rings.length + 1}`,
    tolerance: 0.02,
    factor: 1,
    type: 'increasing',
    direction: 'right',
  })
}

function removeRing(i) {
  form.rings.splice(i, 1)
}

function addDatum() {
  form.datums.push({ label: `基准 ${String.fromCharCode(65 + form.datums.length)}`, priority: 'primary', tolerance: 0.02 })
}

async function exportPdf() {
  const r = result.value
  if (!r || r.error) return
  await exportToolReportPdf({
    title: 'GD&T 形位公差栈报告',
    subtitle: r.mode.label,
    sections: [
      {
        heading: '结果',
        rows: [
          { label: '叠加公差 (mm)', value: r.chainResult.totalTolerance?.toFixed(4) },
          { label: '合格', value: r.pass ? '是' : '否' },
          { label: '最大贡献', value: r.topContributor ?? '-' },
        ],
      },
      { heading: '明细', text: buildGdtStackReportText(r) },
    ],
    element: resultRef.value,
    filename: `GD&T栈_${form.typeId}_${Date.now()}.pdf`,
  })
}
</script>
