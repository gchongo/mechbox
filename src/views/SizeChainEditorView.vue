<template>
  <div>
    <div class="mb-4 flex items-center gap-4">
      <el-button text @click="router.push('/')">
        <el-icon><ArrowLeft /></el-icon>
        首页
      </el-button>
      <h1 class="page-title !mb-0">尺寸链分析</h1>
    </div>

    <StepProgress :current-step="currentStep" />

    <!-- 步骤 1 -->
    <section v-show="currentStep === 1" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 1：选择类型</h2>
      <el-tabs v-model="activeGroup" @tab-click="onTabClick">
        <el-tab-pane
          v-for="group in ANALYSIS_GROUPS"
          :key="group.id"
          :label="group.label"
          :name="group.id"
        >
          <div v-show="typeGridVisible" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <el-tooltip
              v-for="type in group.types"
              :key="type.id"
              :content="type.desc"
              placement="top"
            >
              <button
                class="w-full rounded-lg border-2 p-4 text-left transition-all"
                :class="
                  selectedType?.id === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                "
                @click="selectType(type, group)"
              >
                <el-icon class="mb-2 text-primary"><component :is="type.icon || 'Document'" /></el-icon>
                <p class="font-medium">{{ type.name }}</p>
                <p class="mt-1 text-xs text-gray-500">{{ type.desc }}</p>
              </button>
            </el-tooltip>
          </div>
          <p v-if="!typeGridVisible" class="py-6 text-center text-sm text-gray-500">
            再次点击「{{ activeGroupLabel }}」Tab 可展开类型列表
          </p>
        </el-tab-pane>
      </el-tabs>
      <el-alert
        v-if="isExtendedAnalysis"
        class="mt-4"
        type="info"
        :closable="false"
        show-icon
        title="2D/3D/GD&T 分析提示"
        description="当前类型按 1D 线性尺寸链叠加计算；请用传递系数近似几何影响，或跳转 Monte Carlo 做随机验证。"
      />
      <p v-if="selectedType" class="mt-4 text-sm text-success">
        ✓ 已选择：{{ selectedType.groupLabel }} → {{ selectedType.name }}
      </p>
      <div class="mt-6 flex justify-end">
        <el-button type="primary" :disabled="!selectedType" @click="nextStep">
          下一步 →
        </el-button>
      </div>
    </section>

    <!-- 步骤 2 -->
    <section v-show="currentStep === 2" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 2：定义封闭环</h2>
      <el-form label-width="130px" class="max-w-xl">
        <el-form-item label="名称" required :error="fieldError('name')">
          <el-input
            v-model="closedRing.name"
            placeholder="如：间隙 L0"
            maxlength="50"
            :class="{ 'ring-error': fieldError('name') }"
            @blur="touchField('name')"
          />
        </el-form-item>
        <el-form-item label="最小值" required :error="fieldError('min')">
          <el-input-number
            v-model="closedRing.min"
            :precision="2"
            :step="0.01"
            @blur="touchField('min')"
          />
          <span class="ml-2 text-sm text-gray-500">{{ unit }}</span>
        </el-form-item>
        <el-form-item label="最大值" required :error="fieldError('max')">
          <el-input-number
            v-model="closedRing.max"
            :precision="2"
            :step="0.01"
            @blur="touchField('max')"
          />
          <span class="ml-2 text-sm text-gray-500">{{ unit }}</span>
        </el-form-item>
        <el-form-item label="公差">
          <span>{{ closedRingTolerance.toFixed(2) }} {{ unit }}（自动计算）</span>
        </el-form-item>
        <el-form-item label="方向">
          <el-radio-group v-model="closedRing.direction" @change="syncAllRingTypes">
            <el-radio-button label="left">←</el-radio-button>
            <el-radio-button label="up">↑</el-radio-button>
            <el-radio-button label="right">→</el-radio-button>
            <el-radio-button label="down">↓</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="单位">
          <el-radio-group v-model="closedRing.unit" @change="onUnitChange">
            <el-radio label="mm">mm</el-radio>
            <el-radio label="inch">inch</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <p class="text-sm text-gray-500">
        💡 封闭环是装配过程最终形成的尺寸（如间隙、过盈量）
      </p>
      <div class="mt-6 flex justify-between">
        <el-button @click="clearClosedRing">清除</el-button>
        <div class="flex gap-2">
          <el-button @click="prevStep">← 返回</el-button>
          <el-button type="primary" @click="validateAndNext(2)">下一步 →</el-button>
        </div>
      </div>
    </section>

    <!-- 步骤 3 -->
    <section v-show="currentStep === 3" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 3：添加组成环</h2>
      <el-button type="primary" plain :disabled="componentRings.length >= 50" @click="addRing">
        + 添加组成环
      </el-button>
      <el-button
        v-if="selectedType && getGdtCalcMode(selectedType.id)"
        plain
        @click="loadRingTemplate"
      >
        加载 {{ selectedType.name }} 推荐结构
      </el-button>
      <p v-if="componentRings.length >= 50" class="mt-2 text-sm text-warning">
        已达最大数量（50）
      </p>

      <el-table :data="componentRings" class="mt-4" empty-text="请添加组成环" row-key="uid">
        <el-table-column width="44" align="center">
          <template #default="{ $index }">
            <span
              class="cursor-grab select-none text-lg text-gray-400 active:cursor-grabbing"
              draggable="true"
              title="拖拽排序"
              @dragstart="onRingDragStart($index, $event)"
              @dragend="onRingDragEnd"
              @dragover.prevent
              @drop.prevent="onRingDrop($index)"
            >⠿</span>
          </template>
        </el-table-column>
        <el-table-column label="#" width="50">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column label="名称" min-width="110">
          <template #default="{ row }">
            <el-input
              v-model="row.name"
              placeholder="如：挡环厚度"
              size="small"
              :class="{ 'ring-error': ringFieldInvalid(row, 'name') }"
            />
          </template>
        </el-table-column>
        <el-table-column :label="`尺寸 (${unit})`" width="110">
          <template #default="{ row }">
            <el-input-number
              v-model="row.size"
              :precision="2"
              size="small"
              :class="{ 'ring-error': ringFieldInvalid(row, 'size') }"
            />
          </template>
        </el-table-column>
        <el-table-column :label="`公差 (${unit})`" width="110">
          <template #default="{ row }">
            <el-input-number
              v-model="row.tolerance"
              :precision="2"
              :min="0"
              size="small"
              :class="{ 'ring-error': ringFieldInvalid(row, 'tolerance') }"
            />
          </template>
        </el-table-column>
        <el-table-column label="传递系数" width="90">
          <template #default="{ row }">
            <el-input-number v-model="row.factor" :min="0" :max="10" :step="0.1" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="方向" width="180">
          <template #default="{ row }">
            <el-radio-group v-model="row.direction" size="small" @change="updateRingType(row)">
              <el-radio-button label="left">←</el-radio-button>
              <el-radio-button label="up">↑</el-radio-button>
              <el-radio-button label="right">→</el-radio-button>
              <el-radio-button label="down">↓</el-radio-button>
            </el-radio-group>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag :type="row.type === 'increasing' ? '' : 'success'" size="small">
              {{ row.type === 'increasing' ? '增环' : '减环' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="" width="50">
          <template #default="{ $index }">
            <el-button type="danger" text @click="removeRing($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <p class="mt-2 text-xs text-gray-400">⠿ 拖拽左侧手柄可调整组成环顺序</p>
      <el-alert
        v-if="isExtendedAnalysis"
        class="mt-3"
        type="info"
        :closable="false"
        show-icon
        :title="gdtModeInfo?.label ?? '2D/GD&T 分析'"
        :description="gdtModeInfo?.desc ?? '已启用专用公差叠加模型'"
      />
      <p class="mt-3 text-sm text-gray-500">
        💡 与封闭环同向 = 增环（蓝色），反向 = 减环（绿色），自动判断
      </p>
      <div class="mt-6 flex justify-between">
        <el-button @click="clearRings">清空列表</el-button>
        <div class="flex gap-2">
          <el-button @click="prevStep">← 返回</el-button>
          <el-button type="primary" :disabled="!componentRings.length" @click="validateRingsAndNext">
            下一步 →
          </el-button>
        </div>
      </div>
    </section>

    <!-- 步骤 4 -->
    <section v-show="currentStep === 4" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 4：选择计算方法</h2>
      <el-radio-group v-model="method" class="flex flex-col gap-4">
        <el-tooltip content="极值法：所有公差代数相加" placement="right">
          <el-radio value="worst" border class="!mr-0 !h-auto !p-4">
            <div>
              <p class="font-medium">极值法（最坏情况）</p>
              <div class="text-sm text-gray-500">
                <MathTex expr="T = \sum T_i" /> · 保守，100% 安全
              </div>
            </div>
          </el-radio>
        </el-tooltip>
        <el-tooltip content="RSS：独立误差平方和开方" placement="right">
          <el-radio value="rss" border class="!mr-0 !h-auto !p-4">
            <div>
              <p class="font-medium">RSS 法（概率法）</p>
              <div class="text-sm text-gray-500">
                <MathTex expr="T = \sqrt{\sum T_i^2}" /> · 合理，95% 合格
              </div>
            </div>
          </el-radio>
        </el-tooltip>
        <el-tooltip content="修正 RSS：考虑非正态分布修正系数" placement="right">
          <el-radio value="modified-rss" border class="!mr-0 !h-auto !p-4">
            <div>
              <p class="font-medium">修正 RSS 法</p>
              <div class="text-sm text-gray-500">
                <MathTex expr="T_{mod} = k \cdot \sqrt{\sum T_i^2}" /> · 偏态/均匀修正
              </div>
            </div>
          </el-radio>
        </el-tooltip>
        <el-tooltip content="6σ RSS：考虑各环分布 K 值的统计叠加" placement="right">
          <el-radio value="sigma6-rss" border class="!mr-0 !h-auto !p-4">
            <div>
              <p class="font-medium">6σ RSS 法</p>
              <div class="text-sm text-gray-500">
                <MathTex expr="T = 6\sqrt{\sum (T_i/K_i)^2}" /> · 统计公差法
              </div>
            </div>
          </el-radio>
        </el-tooltip>
      </el-radio-group>
      <div v-if="method === 'modified-rss' || method === 'sigma6-rss'" class="mt-4 max-w-md">
        <el-form label-width="100px">
          <el-form-item label="分布类型">
            <el-select v-model="rssDistribution" class="w-full">
              <el-option
                v-for="(d, k) in DISTRIBUTIONS"
                :key="k"
                :label="d.name"
                :value="k"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <el-button @click="prevStep">← 返回</el-button>
        <el-button type="primary" @click="nextStep">下一步 →</el-button>
      </div>
    </section>

    <!-- 步骤 5 -->
    <section v-show="currentStep === 5" class="card-panel">
      <h2 class="mb-4 text-lg font-semibold">步骤 5：查看结果</h2>

      <el-collapse v-if="gdtModeInfo" class="mb-4">
        <el-collapse-item title="GD&T 材料条件 (MMC / LMC / RFS)" name="mmc">
          <el-form label-width="120px" class="max-w-lg">
            <el-form-item label="材料条件">
              <el-radio-group v-model="gdtModifier">
                <el-radio value="RFS">RFS（无关）</el-radio>
                <el-radio value="MMC">MMC（最大实体）</el-radio>
                <el-radio value="LMC">LMC（最小实体）</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="gdtModifier !== 'RFS'" label="奖励公差">
              <el-input-number v-model="bonusTolerance" :min="0" :precision="4" :step="0.01" />
              <span class="ml-2 text-xs text-gray-500">mm · MMC 全额叠加，LMC 按 50%</span>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>

      <div ref="resultPanelRef">
        <el-alert
          v-if="gdtModeInfo"
          class="mb-4"
          type="success"
          :closable="false"
          show-icon
          :title="`计算模式：${gdtModeInfo.label}`"
          :description="gdtModeDesc"
        />

        <h3 class="mb-2 text-sm font-medium text-gray-600">1. 矢量图</h3>
        <SizeChainCanvas
          ref="canvasRef"
          :closed-ring="closedRing"
          :component-rings="componentRings"
          :rss-tolerance="rssResult.totalTolerance"
          :analysis-type-id="selectedType?.id"
          class="mb-6"
        />

        <h3 class="mb-2 text-sm font-medium text-gray-600">2. 计算公式</h3>
        <div class="mb-6 space-y-2 rounded-lg bg-gray-50 p-4">
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

        <h3 class="mb-2 text-sm font-medium text-gray-600">3. 结果对比</h3>
        <el-table :data="resultTable" border class="mb-6">
          <el-table-column prop="method" label="方法" />
          <el-table-column prop="tolerance" :label="`总公差 (${unit})`" />
          <el-table-column prop="upper" label="上限" />
          <el-table-column prop="lower" label="下限" />
          <el-table-column prop="pass" label="合格">
            <template #default="{ row }">
              <span :class="row.pass ? 'text-success' : 'text-error'">
                {{ row.pass ? '✓ 合格' : '✗ 不合格' }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <h3 class="mb-2 text-sm font-medium text-gray-600">4. 西格玛分析</h3>
        <SigmaSummary :summary="sigmaSummary" />
      </div>

      <div class="flex flex-wrap gap-2">
        <el-button @click="resetAll">← 重置</el-button>
        <el-button type="primary" @click="saveResult">💾 保存</el-button>
        <el-button
          v-if="savedId"
          :type="isFavorited ? 'warning' : 'default'"
          @click="toggleSavedFavorite"
        >
          {{ isFavorited ? '★ 已收藏' : '☆ 收藏' }}
        </el-button>
        <el-button @click="handleExportPdf">📄 导出 PDF</el-button>
        <el-button @click="handleExportExcel">📊 导出 Excel</el-button>
        <el-button @click="handleExportPng">🖼️ 导出图片</el-button>
        <el-button @click="handleCopy">📋 复制结果</el-button>
        <el-button type="success" @click="goToMonteCarlo">🎲 Monte Carlo 验证</el-button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StepProgress from '@/components/editor/StepProgress.vue'
import SizeChainCanvas from '@/components/editor/SizeChainCanvas.vue'
import SigmaSummary from '@/components/editor/SigmaSummary.vue'
import { ANALYSIS_GROUPS, findAnalysisType } from '@/constants/analysis-types'
import { findCasePreset, prepareCaseForEditor, CASE_STORAGE_KEY } from '@/constants/cases'
import { MC_STORAGE_KEY, serializeEditorForMonteCarlo } from '@/constants/editor-bridge'
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
import { getSettings } from '@/utils/settings'
import { isFavorite, toggleFavorite } from '@/utils/favorites'

const route = useRoute()
const router = useRouter()

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
const dragFromIndex = ref(null)
const savedId = ref(route.params.id ? String(route.params.id) : null)

const closedRing = ref({
  name: '',
  min: null,
  max: null,
  direction: 'right',
  unit: 'mm',
})

const componentRings = ref([])

const gdtModifier = ref('RFS')
const bonusTolerance = ref(0)

const unit = computed(() => unitLabel(closedRing.value.unit))

const isFavorited = computed(() => (savedId.value ? isFavorite(savedId.value) : false))

function toggleSavedFavorite() {
  if (!savedId.value) return
  const added = toggleFavorite(savedId.value)
  ElMessage.success(added ? '已加入收藏' : '已取消收藏')
}

const activeGroupLabel = computed(
  () => ANALYSIS_GROUPS.find((g) => g.id === activeGroup.value)?.label ?? '',
)

const isExtendedAnalysis = computed(() =>
  isExtendedAnalysisType(selectedType.value?.id ?? ''),
)

const gdtModeInfo = computed(() => getGdtCalcMode(selectedType.value?.id))

const chainOpts = computed(() => ({
  typeId: selectedType.value?.id,
  distribution: rssDistribution.value,
  toleranceModifier: gdtModifier.value,
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

const gdtModeDesc = computed(() => {
  const base = gdtModeInfo.value?.desc ?? '已启用专用公差叠加模型'
  const bonus = activeResult.value?.bonusApplied
  if (bonus && bonus > 0) {
    return `${base} · 材料条件奖励 +${fmtNum(bonus)} mm`
  }
  return base
})

const resultTable = computed(() => {
  const rows = [
    {
      method: '极值法',
      tolerance: fmtNum(worstResult.value.totalTolerance),
      upper: fmtNum(worstResult.value.upper),
      lower: fmtNum(worstResult.value.lower),
      pass: worstResult.value.pass,
    },
    {
      method: 'RSS 法',
      tolerance: fmtNum(rssResult.value.totalTolerance),
      upper: fmtNum(rssResult.value.upper),
      lower: fmtNum(rssResult.value.lower),
      pass: rssResult.value.pass,
    },
    {
      method: '修正 RSS',
      tolerance: fmtNum(modifiedResult.value.totalTolerance),
      upper: fmtNum(modifiedResult.value.upper),
      lower: fmtNum(modifiedResult.value.lower),
      pass: modifiedResult.value.pass,
    },
    {
      method: '6σ RSS',
      tolerance: fmtNum(sigma6Result.value.totalTolerance),
      upper: fmtNum(sigma6Result.value.upper),
      lower: fmtNum(sigma6Result.value.lower),
      pass: sigma6Result.value.pass,
    },
  ]
  if (gdtModeInfo.value) {
    return rows.map((r) => ({ ...r, method: `${r.method} (${gdtModeInfo.value.label})` }))
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

const closedRingTolerance = computed(() => {
  if (closedRing.value.min == null || closedRing.value.max == null) return 0
  return closedRing.value.max - closedRing.value.min
})

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
  }),
)

const formulaLatex = computed(() =>
  buildFormulaLatex(closedRing.value, componentRings.value, method.value, unit.value, {
    distribution: rssDistribution.value,
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
  applyEditorState(prepareCaseForEditor(preset))
  ElMessage.success(`已加载案例：${preset.title}`)
}

function applyEditorState(state) {
  if (state.selectedType) selectedType.value = state.selectedType
  if (state.activeGroup) activeGroup.value = state.activeGroup
  if (state.closedRing) {
    closedRing.value = { ...closedRing.value, ...state.closedRing }
    prevUnit.value = closedRing.value.unit
  }
  if (state.componentRings) {
    componentRings.value = state.componentRings.map((ring) => ({
      ...ring,
      uid: ring.uid ?? crypto.randomUUID(),
    }))
  }
  if (state.method) method.value = state.method
  if (state.rssDistribution) rssDistribution.value = state.rssDistribution
  if (state.currentStep) currentStep.value = state.currentStep
}

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
  if (field === 'name' && !closedRing.value.name.trim()) return '必填'
  if (field === 'min' && closedRing.value.min == null) return '必填'
  if (field === 'max') {
    if (closedRing.value.max == null) return '必填'
    if (closedRing.value.min != null && closedRing.value.max <= closedRing.value.min) {
      return '最大值须大于最小值'
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
    ElMessage.warning('请完善所有组成环的名称、尺寸和公差')
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
    ElMessage.warning('该分析类型暂无推荐结构')
    return
  }
  closedRing.value = { ...closedRing.value, ...tpl.closedRing, unit: closedRing.value.unit }
  componentRings.value = tpl.componentRings
  ElMessage.success(`已加载 ${selectedType.value.name} 推荐组成环`)
}

function selectType(type, group) {
  selectedType.value = { ...type, groupId: group.id, groupLabel: group.label }
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
  ring.type = inferRingType(ring.direction, closedRing.value.direction)
}

function syncAllRingTypes() {
  componentRings.value.forEach(updateRingType)
}

function addRing() {
  const index = componentRings.value.length
  const defaultDir = index % 2 === 0 ? 'left' : closedRing.value.direction
  const ring = {
    uid: crypto.randomUUID(),
    name: `环 ${index + 1}`,
    size: 0,
    tolerance: 0.05,
    factor: 1,
    direction: defaultDir,
    type: inferRingType(defaultDir, closedRing.value.direction),
  }
  componentRings.value.push(ring)
}

function onRingDragStart(index, event) {
  dragFromIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

function onRingDrop(toIndex) {
  const from = dragFromIndex.value
  if (from == null || from === toIndex) return
  const list = [...componentRings.value]
  const [item] = list.splice(from, 1)
  list.splice(toIndex, 0, item)
  componentRings.value = list
  dragFromIndex.value = null
}

function onRingDragEnd() {
  dragFromIndex.value = null
}

function removeRing(index) {
  componentRings.value.splice(index, 1)
}

function clearRings() {
  componentRings.value = []
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
  applyDefaultSettings()
}

const methodLabels = {
  worst: '极值法',
  rss: 'RSS 法',
  'modified-rss': '修正 RSS 法',
  'sigma6-rss': '6σ RSS 法',
}

function buildExportPayload() {
  return {
    typeName: selectedType.value?.name,
    closedRing: closedRing.value,
    unit: unit.value,
    componentRings: componentRings.value,
    methodLabel: methodLabels[method.value] ?? method.value,
    formulaLines: formulaLines.value,
    results: resultTable.value,
  }
}

function saveResult() {
  const title = `${selectedType.value?.name ?? '分析'} ${closedRing.value.name || 'L0'}`
  const entry = saveAnalysis({
    title,
    status: activeResult.value.pass ? 'pass' : 'fail',
    data: {
      selectedType: selectedType.value,
      closedRing: closedRing.value,
      componentRings: componentRings.value,
      method: method.value,
      rssDistribution: rssDistribution.value,
      currentStep: currentStep.value,
      results: {
        worst: worstResult.value,
        rss: rssResult.value,
        modifiedRss: modifiedResult.value,
        sigma6Rss: sigma6Result.value,
      },
    },
  })
  ElMessage.success('已保存到本地')
  router.replace({ name: 'editor-detail', params: { id: entry.id } })
  savedId.value = entry.id
}

async function handleExportPdf() {
  if (!resultPanelRef.value) return
  await exportResultPdf(resultPanelRef.value, undefined, {
    title: `${selectedType.value?.name ?? '分析'} ${closedRing.value.name || 'L0'}`,
  })
  ElMessage.success('PDF 已下载')
}

function handleExportExcel() {
  exportExcel(buildExportPayload())
  ElMessage.success('Excel 已下载')
}

function handleExportPng() {
  const canvas = canvasRef.value?.getCanvas?.()
  if (canvas) {
    exportCanvasPng(canvas)
  } else if (resultPanelRef.value) {
    exportResultPng(resultPanelRef.value)
  }
  ElMessage.success('图片已下载')
}

async function handleCopy() {
  await copyResultText(buildResultText(buildExportPayload()))
  ElMessage.success('已复制到剪贴板')
}
</script>

<style scoped>
:deep(.ring-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e74c3c inset;
}
</style>
