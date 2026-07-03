<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="calcMode" page-key="material-selection" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pf('requirementsTitle') }}</h2>
        <el-form label-width="140px">
          <el-form-item :label="pf('minAllowStress')">
            <el-input-number v-model="req.minSigmaAllow" :min="0" :step="50" />
            <span class="ml-2 text-sm text-gray-500">MPa</span>
          </el-form-item>
          <el-form-item :label="pf('maxDensity')">
            <el-input-number v-model="req.maxDensity" :min="1" :max="20" :precision="2" :step="0.5" />
            <span class="ml-2 text-sm text-gray-500">g/cm³</span>
          </el-form-item>
          <el-form-item :label="pf('workingTemp')">
            <el-input-number v-model="req.tempC" :min="20" :max="500" :step="10" />
            <span class="ml-2 text-sm text-gray-500">°C</span>
          </el-form-item>
          <el-form-item :label="pf('minWeldability')">
            <el-slider v-model="req.minWeldability" :min="1" :max="5" :step="1" show-stops />
          </el-form-item>
          <el-form-item :label="pf('maxCostIndex')">
            <el-input-number v-model="req.maxCostIndex" :min="0.5" :max="10" :step="0.5" />
          </el-form-item>
          <el-divider content-position="left">{{ pf('dividerWeights') }}</el-divider>
          <el-form-item :label="pf('weightStrength')">
            <el-slider v-model="weights.strength" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item :label="pf('weightLight')">
            <el-slider v-model="weights.weight" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item :label="pf('weightCost')">
            <el-slider v-model="weights.cost" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item :label="pf('weightWeldability')">
            <el-slider v-model="weights.weldability" :min="0" :max="1" :step="0.05" />
          </el-form-item>
          <el-form-item :label="pf('weightMachinability')">
            <el-slider v-model="weights.machinability" :min="0" :max="1" :step="0.05" />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ pr('recommendationsTitle') }}</h2>
        <div v-if="result.topPick" class="mb-4 rounded-lg bg-primary/5 p-4">
          <p class="text-sm text-gray-500">{{ pr('topPick') }}</p>
          <p class="text-xl font-semibold text-primary">{{ result.topPick.name }}</p>
          <p class="mt-1 text-sm">{{ pr('totalScore') }} {{ result.topPick.totalScore.toFixed(1) }} · [σ] = {{ result.topPick.sigmaAllow }} MPa</p>
        </div>
        <div v-if="result.tradeoffNote" class="mb-3 rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
          {{ result.tradeoffNote }}
        </div>
        <div v-if="calcMode === 'professional' && result.bestStrength" class="mb-3 space-y-1 text-xs text-gray-500">
          <p>{{ pr('bestStrength') }}: {{ result.bestStrength.name }} · {{ pr('bestWeight') }}: {{ result.bestWeight?.name }} · {{ pr('bestCost') }}: {{ result.bestCost?.name }}</p>
        </div>
        <p class="mb-2 text-xs text-gray-500">{{ pr('filteredCount') }} {{ result.filteredCount }} / {{ result.totalCount }} {{ pr('ofTotal') }}</p>
        <el-table :data="result.recommendations" size="small" border max-height="420">
          <el-table-column prop="rank" label="#" width="40" />
          <el-table-column prop="name" :label="pr('material')" min-width="120" />
          <el-table-column :label="pr('totalScore')" width="70">
            <template #default="{ row }">{{ row.totalScore.toFixed(1) }}</template>
          </el-table-column>
          <el-table-column prop="sigmaAllow" label="[σ]" width="60" />
          <el-table-column prop="density" label="ρ" width="50" />
          <el-table-column prop="costIndex" :label="pr('cost')" width="50" />
        </el-table>
        <router-link to="/materials" class="mt-3 inline-block text-xs text-primary hover:underline">
          {{ pf('linkMaterials') }}
        </router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { scoreMaterials } from '@/utils/material-selection-calc'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, pf, pr } = useCalcPage('material-selection')

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
