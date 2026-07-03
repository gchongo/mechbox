<template>
  <div>
    <h1 class="page-title">螺栓组受力</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      剪力与弯矩作用下螺栓组载荷分配（简化均分 / 矢量分解 / 逐栓校核）
    </p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500 dark:text-gray-400">
          <template v-if="form.calcMode === 'simple'">
            均分剪力 + 极惯性矩近似扭剪叠加。
          </template>
          <template v-else>
            各螺栓坐标矢量合成 F_i = F/n + M×r/I_p，专业模式输出逐栓表格与许用校核。
          </template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="140px">
          <el-form-item label="螺栓数量 n">
            <el-input-number v-model="form.boltCount" :min="2" :max="24" />
          </el-form-item>
          <el-form-item label="分布圆半径 R">
            <el-input-number v-model="form.boltCircleRadius" :min="10" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="剪力 Fx (N)">
            <el-input-number v-model="form.shearX" :step="100" />
          </el-form-item>
          <el-form-item label="剪力 Fy (N)">
            <el-input-number v-model="form.shearY" :step="100" />
          </el-form-item>
          <el-form-item label="弯矩 M (N·mm)">
            <el-input-number v-model="form.moment" :step="1000" />
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" label="单栓许用 (N)">
            <el-input-number v-model="form.allowPerBolt" :min="100" :step="500" />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>单栓直接剪力</dt>
            <dd class="font-mono">{{ result.directPerBolt?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>单栓扭剪分量</dt>
            <dd class="font-mono">{{ result.torsionPerBolt?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>最大螺栓力</dt>
            <dd class="font-mono text-lg" :class="result.pass ? 'text-success' : 'text-error'">
              {{ result.maxBoltForce?.toFixed(0) }} N {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
          <div v-if="result.criticalBoltIndex" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>最不利螺栓</dt>
            <dd class="font-mono">#{{ result.criticalBoltIndex }}</dd>
          </div>
        </dl>

        <template v-if="result.bolts?.length">
          <h3 class="mb-2 mt-4 text-sm font-semibold">逐栓载荷</h3>
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
