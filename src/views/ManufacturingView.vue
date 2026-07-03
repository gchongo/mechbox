<template>
  <div>
    <h1 class="page-title">制造工艺估算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">机加工余量与铸造拔模斜度快速估算</p>

    <el-tabs v-model="tab">
      <el-tab-pane label="机加工余量" name="machining">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="mach.calcMode">
              <el-radio-button label="simple">简化</el-radio-button>
              <el-radio-button label="complete">完整</el-radio-button>
              <el-radio-button label="professional">专业</el-radio-button>
            </el-radio-group>
            <p class="w-full text-xs text-gray-500">
              <template v-if="mach.calcMode === 'simple'">粗+精两工序，端面余量 1 mm。</template>
              <template v-else-if="mach.calcMode === 'complete'">三工序叠加 + 磨削余量与最小毛坯校核。</template>
              <template v-else>含材料去除率与估算加工工时。</template>
            </p>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="成品直径">
                <el-input-number v-model="mach.nominalDiameter" :min="5" />
                <span class="ml-2 text-sm text-gray-500">mm</span>
              </el-form-item>
              <el-form-item label="长度">
                <el-input-number v-model="mach.length" :min="1" />
              </el-form-item>
              <el-form-item label="精度等级">
                <el-select v-model="mach.toleranceGrade" class="w-full">
                  <el-option v-for="(g, k) in TOLERANCE_GRADES" :key="k" :label="g.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="mach.calcMode !== 'simple'" label="工序">
                <el-checkbox-group v-model="mach.operations">
                  <el-checkbox value="rough">粗车</el-checkbox>
                  <el-checkbox value="semi">半精</el-checkbox>
                  <el-checkbox value="finish">精车</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item v-else label="工序">
                <span class="text-sm text-gray-500">粗车 + 精车（固定）</span>
              </el-form-item>
              <el-form-item v-if="mach.calcMode === 'professional'" label="去除率">
                <el-input-number v-model="mach.removalRate" :min="10" :max="500" :step="10" />
                <span class="ml-2 text-xs text-gray-500">mm³/min</span>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <el-tag class="mb-3" size="small">{{ machResult.calcMode }} · {{ machResult.operations?.join(' + ') }}</el-tag>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>单面总余量</dt><dd class="font-mono">{{ machResult.totalRadialAllowance?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>推荐毛坯直径</dt><dd class="font-mono text-lg text-primary">{{ machResult.recommendedStockDiameter?.toFixed(1) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>推荐毛坯长度</dt><dd class="font-mono">{{ machResult.recommendedStockLength?.toFixed(1) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>端面余量</dt><dd class="font-mono">{{ machResult.endFaceAllowance }} mm / 面</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>切除体积（估算）</dt><dd class="font-mono">{{ (machResult.materialRemovalVolume / 1000).toFixed(1) }} cm³</dd>
              </div>
              <div v-if="mach.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>磨削余量（单面）</dt><dd class="font-mono">{{ machResult.grindingAllowance?.toFixed(2) }} mm</dd>
              </div>
              <div v-if="mach.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>最小毛坯直径</dt><dd class="font-mono">{{ machResult.minStockDiameter?.toFixed(1) }} mm</dd>
              </div>
              <div v-if="mach.calcMode === 'professional'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>估算工时</dt><dd class="font-mono text-primary">{{ machResult.estimatedMachiningMinutes?.toFixed(0) }} min</dd>
              </div>
            </dl>
            <el-table :data="machResult.details" size="small" border class="mt-4">
              <el-table-column prop="operation" label="工序" />
              <el-table-column label="单面余量 (mm)">
                <template #default="{ row }">{{ row.radialAllowance?.toFixed(2) }}</template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="铸造拔模斜度" name="casting">
        <section class="card-panel mb-4">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-medium">计算模型</span>
            <el-radio-group v-model="cast.calcMode">
              <el-radio-button label="simple">简化</el-radio-button>
              <el-radio-button label="complete">完整</el-radio-button>
              <el-radio-button label="professional">专业</el-radio-button>
            </el-radio-group>
          </div>
        </section>
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <el-form label-width="120px">
              <el-form-item label="铸造材料">
                <el-select v-model="cast.material" class="w-full">
                  <el-option v-for="(m, k) in CAST_MATERIALS" :key="k" :label="m.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="表面类型">
                <el-select v-model="cast.surfaceType" class="w-full">
                  <el-option v-for="(s, k) in SURFACE_TYPES" :key="k" :label="s.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item label="拔模高度">
                <el-input-number v-model="cast.depth" :min="1" :max="500" />
                <span class="ml-2 text-sm text-gray-500">mm</span>
              </el-form-item>
              <el-form-item label="粗面纹理">
                <el-switch v-model="cast.roughSurface" />
              </el-form-item>
              <el-form-item label="实际拔模角">
                <el-input-number v-model="cast.actualDraftAngle" :min="0" :max="15" :precision="2" />
                <span class="ml-2 text-xs text-gray-500">°（可选校核）</span>
              </el-form-item>
            </el-form>
          </section>
          <section class="card-panel">
            <div class="rounded bg-primary/5 p-4 text-center">
              <dt class="text-sm text-gray-500">推荐拔模角</dt>
              <dd class="font-mono text-3xl text-primary">{{ castResult.draftAngleDeg?.toFixed(2) }}°</dd>
            </div>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>单侧尺寸增量</dt><dd class="font-mono">{{ castResult.linearIncreasePerSide?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>总宽度增量</dt><dd class="font-mono">{{ castResult.totalWidthIncrease?.toFixed(2) }} mm</dd>
              </div>
            </dl>
            <p class="mt-3 text-xs text-gray-500">{{ castResult.note }}</p>
            <el-tag v-if="cast.actualDraftAngle > 0" class="mt-3" :type="verifyResult.pass ? 'success' : 'danger'">
              实际角 {{ cast.actualDraftAngle }}° — {{ verifyResult.pass ? '满足' : '不足' }}
            </el-tag>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { calcMachiningAllowance, TOLERANCE_GRADES, MACHINING_MODE_OPS } from '@/utils/machining-calc'
import { calcDraftAngle, verifyDraftAngle, CAST_MATERIALS, SURFACE_TYPES } from '@/utils/casting-calc'

const tab = ref('machining')

const mach = reactive({
  calcMode: 'simple',
  nominalDiameter: 50,
  length: 120,
  toleranceGrade: 'medium',
  operations: ['rough', 'semi', 'finish'],
  removalRate: 50,
})

const cast = reactive({
  calcMode: 'simple',
  material: 'sand_iron',
  surfaceType: 'external',
  depth: 80,
  roughSurface: false,
  actualDraftAngle: 0,
})

watch(
  () => mach.calcMode,
  (mode) => {
    mach.operations = [...MACHINING_MODE_OPS[mode]]
  },
  { immediate: true },
)

const machResult = computed(() => calcMachiningAllowance(mach))
const castResult = computed(() => calcDraftAngle(cast))
const verifyResult = computed(() =>
  cast.actualDraftAngle > 0 ? verifyDraftAngle(cast) : { pass: true },
)
</script>
