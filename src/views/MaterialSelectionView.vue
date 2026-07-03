<template>
  <div>
    <h1 class="page-title">材料选型辅助</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      基于强度、重量、成本、可焊性与可加工性的加权综合推荐
    </p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="calcMode">
          <el-radio-button label="simple">简化</el-radio-button>
          <el-radio-button label="complete">完整</el-radio-button>
          <el-radio-button label="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="calcMode === 'simple'">硬约束过滤 + Top 5。</template>
          <template v-else-if="calcMode === 'complete'">全库排序与分项得分。</template>
          <template v-else>强度/重量/成本单项最优与权衡提示。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">需求与权重</h2>
        <el-form label-width="140px">
          <el-form-item label="最低许用应力">
            <el-input-number v-model="req.minSigmaAllow" :min="0" :step="50" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </el-form-item>
          <el-form-item label="最大密度">
            <el-input-number v-model="req.maxDensity" :min="1" :max="20" :precision="2" :step="0.5" />
            <span class="ml-2 text-sm text-gray-500">g/cm³</span>
          </el-form-item>
          <el-form-item label="工作温度">
            <el-input-number v-model="req.tempC" :min="20" :max="500" :step="10" />
            <span class="ml-2 text-sm text-gray-500">°C</span>
          </el-form-item>
          <el-form-item label="最低可焊性">
            <el-slider v-model="req.minWeldability" :min="1" :max="5" :step="1" show-stops />
          </el-form-item>
          <el-form-item label="最大成本指数">
            <el-input-number v-model="req.maxCostIndex" :min="0.5" :max="10" :step="0.5" />
          </el-form-item>
          <el-divider content-position="left">权重</el-divider>
          <el-form-item label="强度">
            <el-slider v-model="weights.strength" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item label="轻量化">
            <el-slider v-model="weights.weight" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item label="成本">
            <el-slider v-model="weights.cost" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item label="可焊性">
            <el-slider v-model="weights.weldability" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item label="可加工性">
            <el-slider v-model="weights.machinability" :min="0" :max="1" :step="0.05" />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">推荐结果</h2>
        <div v-if="result.topPick" class="mb-4 rounded-lg bg-primary/5 p-4">
          <p class="text-sm text-gray-500">首选材料</p>
          <p class="text-xl font-semibold text-primary">{{ result.topPick.name }}</p>
          <p class="mt-1 text-sm">综合得分 {{ result.topPick.totalScore.toFixed(1) }} · [σ] = {{ result.topPick.sigmaAllow }} MPa</p>
        </div>
        <div v-if="result.tradeoffNote" class="mb-3 rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
          {{ result.tradeoffNote }}
        </div>
        <div v-if="calcMode === 'professional' && result.bestStrength" class="mb-3 space-y-1 text-xs text-gray-500">
          <p>强度最优: {{ result.bestStrength.name }} · 最轻: {{ result.bestWeight?.name }} · 最低成本: {{ result.bestCost?.name }}</p>
        </div>
        <p class="mb-2 text-xs text-gray-500">符合硬约束 {{ result.filteredCount }} / {{ result.totalCount }} 种</p>
        <el-table :data="result.recommendations" size="small" border max-height="420">
          <el-table-column prop="rank" label="#" width="40" />
          <el-table-column prop="name" label="材料" min-width="120" />
          <el-table-column label="得分" width="70">
            <template #default="{ row }">{{ row.totalScore.toFixed(1) }}</template>
          </el-table-column>
          <el-table-column prop="sigmaAllow" label="[σ]" width="60" />
          <el-table-column prop="density" label="ρ" width="50" />
          <el-table-column prop="costIndex" label="成本" width="50" />
        </el-table>
        <router-link to="/materials" class="mt-3 inline-block text-xs text-primary hover:underline">
          → 材料库详情
        </router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { scoreMaterials } from '@/utils/material-selection-calc'

const calcMode = ref('complete')

const req = reactive({
  minSigmaAllow: 150,
  maxDensity: 8,
  tempC: 20,
  minWeldability: 2,
  maxCostIndex: 3,
})

const weights = reactive({
  strength: 0.35,
  weight: 0.2,
  cost: 0.2,
  weldability: 0.15,
  machinability: 0.1,
})

const result = computed(() => scoreMaterials({ ...req, calcMode: calcMode.value }, weights))
</script>
