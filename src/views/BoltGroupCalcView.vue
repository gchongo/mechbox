<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="bolt-group" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="140px">
          <el-form-item :label="pf('boltCount')">
            <el-input-number v-model="form.boltCount" :min="2" :max="24" />
          </el-form-item>
          <el-form-item :label="pf('boltCircleRadius')">
            <el-input-number v-model="form.boltCircleRadius" :min="10" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item :label="pf('shearX')">
            <el-input-number v-model="form.shearX" :step="100" />
          </el-form-item>
          <el-form-item :label="pf('shearY')">
            <el-input-number v-model="form.shearY" :step="100" />
          </el-form-item>
          <el-form-item :label="pf('moment')">
            <el-input-number v-model="form.moment" :step="1000" />
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" :label="pf('allowPerBolt')">
            <el-input-number v-model="form.allowPerBolt" :min="100" :step="500" />
          </el-form-item>
        </el-form>

        <BoltGroupDiagram
          :bolt-count="form.boltCount"
          :bolt-circle-radius="form.boltCircleRadius"
          :shear-x="form.shearX"
          :shear-y="form.shearY"
          :moment="form.moment"
          :critical-index="result.criticalBoltIndex ?? 0"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>{{ pr('directPerBolt') }}</dt>
            <dd class="font-mono">{{ result.directPerBolt?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>{{ pr('torsionPerBolt') }}</dt>
            <dd class="font-mono">{{ result.torsionPerBolt?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>{{ pr('maxBoltForce') }}</dt>
            <dd class="font-mono text-lg" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.maxBoltForce?.toFixed(0) }} N {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div v-if="result.criticalBoltIndex" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>{{ pr('criticalBolt') }}</dt>
            <dd class="font-mono">#{{ result.criticalBoltIndex }}</dd>
          </div>
        </dl>

        <template v-if="result.bolts?.length">
          <h3 class="mb-2 mt-4 text-sm font-semibold">{{ pr('perBoltLoads') }}</h3>
          <el-table :data="result.bolts" size="small" stripe class="w-full">
            <el-table-column prop="index" label="#" width="48" />
            <el-table-column prop="x" label="x (mm)" />
            <el-table-column prop="y" label="y (mm)" />
            <el-table-column prop="fx" label="Fx (N)" />
            <el-table-column prop="fy" label="Fy (N)" />
            <el-table-column prop="force" label="|F| (N)">
              <template #default="{ row }">
                <span :class="row.pass ? '' : 'text-error font-medium'">{{ row.force }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeBoltGroup } from '@/utils/bolt-group-calc'
import BoltGroupDiagram from '@/components/bolt/BoltGroupDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct, pf, pr } = useCalcPage('bolt-group')

const form = reactive({
  calcMode: 'simple',
  boltCount: 8,
  boltCircleRadius: 60,
  shearX: 5000,
  shearY: 2000,
  moment: 120000,
  allowPerBolt: 8000,
})

const result = computed(() => analyzeBoltGroup(form))
</script>
