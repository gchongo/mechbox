<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pf('tabMachining')" name="machining">
        <CalcModePanel v-model="mach.calcMode" page-key="manufacturing" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pf('nominalDiameter')">
                <el-input-number v-model="mach.nominalDiameter" :min="5" />
                <span class="ml-2 text-sm text-gray-500">mm</span>
              </CalcFormItem>
              <CalcFormItem :label="pf('length')">
                <el-input-number v-model="mach.length" :min="1" />
              </CalcFormItem>
              <CalcFormItem :label="pf('toleranceGrade')">
                <el-select v-model="mach.toleranceGrade" class="w-full">
                  <el-option v-for="(g, k) in toleranceGrades" :key="k" :label="g.label" :value="k" />
                </el-select>
              </CalcFormItem>
              <CalcFormItem v-if="mach.calcMode !== 'simple'" :label="pf('operations')">
                <el-checkbox-group v-model="mach.operations">
                  <el-checkbox value="rough">{{ pf('opRough') }}</el-checkbox>
                  <el-checkbox value="semi">{{ pf('opSemi') }}</el-checkbox>
                  <el-checkbox value="finish">{{ pf('opFinish') }}</el-checkbox>
                </el-checkbox-group>
              </CalcFormItem>
              <CalcFormItem v-else :label="pf('operations')">
                <span class="text-sm text-gray-500">{{ pf('operationsFixed') }}</span>
              </CalcFormItem>
              <CalcFormItem v-if="mach.calcMode === 'professional'" :label="pf('removalRate')">
                <el-input-number v-model="mach.removalRate" :min="10" :max="500" :step="10" />
                <span class="ml-2 text-xs text-gray-500">{{ pf('removalRateHint') }}</span>
              </CalcFormItem>
            </el-form>

            <MachiningAllowanceDiagram
              :nominal-diameter="mach.nominalDiameter"
              :length="mach.length"
              :stock-diameter="machResult.recommendedStockDiameter ?? mach.nominalDiameter"
              :radial-allowance="machResult.totalRadialAllowance ?? 0"
            />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag class="mb-3" size="small">{{ machResult.calcMode }} · {{ machResult.operations?.join(' + ') }}</el-tag>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('totalRadialAllowance')" /><dd class="font-mono">{{ machResult.totalRadialAllowance?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('recommendedStockDiameter')" /><dd class="font-mono text-lg text-primary">{{ machResult.recommendedStockDiameter?.toFixed(1) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('recommendedStockLength')" /><dd class="font-mono">{{ machResult.recommendedStockLength?.toFixed(1) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('endFaceAllowance')" /><dd class="font-mono">{{ machResult.endFaceAllowance }} mm {{ fc('perFace') }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('materialRemovalVolume')" /><dd class="font-mono">{{ (machResult.materialRemovalVolume / 1000).toFixed(1) }} cm³</dd>
              </div>
              <div v-if="mach.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('grindingAllowance') }}</dt><dd class="font-mono">{{ machResult.grindingAllowance?.toFixed(2) }} mm</dd>
              </div>
              <div v-if="mach.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('minStockDiameter') }}</dt><dd class="font-mono">{{ machResult.minStockDiameter?.toFixed(1) }} mm</dd>
              </div>
              <div v-if="mach.calcMode === 'professional'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <dt>{{ pr('estimatedMachiningMinutes') }}</dt><dd class="font-mono text-primary">{{ machResult.estimatedMachiningMinutes?.toFixed(0) }} min</dd>
              </div>
            </dl>
            <el-table :data="machResult.details" size="small" border class="mt-4">
              <el-table-column :label="fc('operation')">
                <template #default="{ row }">{{ ol('machiningOps', row.operation) }}</template>
              </el-table-column>
              <el-table-column :label="pr('radialAllowance')">
                <template #default="{ row }">{{ row.radialAllowance?.toFixed(2) }}</template>
              </el-table-column>
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pfCast('tabCasting')" name="casting">
        <CalcModePanel v-model="cast.calcMode" page-key="manufacturing-cast" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <el-form-item :label="pfCast('castMaterial')">
                <el-select v-model="cast.material" class="w-full">
                  <el-option v-for="(m, k) in castMaterials" :key="k" :label="m.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pfCast('surfaceType')">
                <el-select v-model="cast.surfaceType" class="w-full">
                  <el-option v-for="(s, k) in surfaceTypes" :key="k" :label="s.label" :value="k" />
                </el-select>
              </el-form-item>
              <el-form-item :label="pfCast('draftDepth')">
                <el-input-number v-model="cast.depth" :min="1" :max="500" />
                <span class="ml-2 text-sm text-gray-500">mm</span>
              </el-form-item>
              <el-form-item :label="pfCast('roughSurface')">
                <el-switch v-model="cast.roughSurface" />
              </el-form-item>
              <el-form-item :label="pfCast('actualDraftAngle')">
                <el-input-number v-model="cast.actualDraftAngle" :min="0" :max="15" :precision="2" />
                <span class="ml-2 text-xs text-gray-500">{{ pfCast('draftAngleHint') }}</span>
              </el-form-item>
            </el-form>

            <CastingDraftDiagram
              :depth="cast.depth"
              :draft-angle="castResult.draftAngleDeg ?? 0"
              :linear-increase="castResult.linearIncreasePerSide ?? 0"
            />
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <div class="rounded bg-primary/5 p-4 text-center">
              <dt class="text-sm text-gray-500">{{ prCast('recommendedDraftAngle') }}</dt>
              <dd class="font-mono text-3xl text-primary">{{ castResult.draftAngleDeg?.toFixed(2) }}°</dd>
            </div>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="prCast('linearIncreasePerSide')" /><dd class="font-mono">{{ castResult.linearIncreasePerSide?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="prCast('totalWidthIncrease')" /><dd class="font-mono">{{ castResult.totalWidthIncrease?.toFixed(2) }} mm</dd>
              </div>
            </dl>
            <p class="mt-3 text-xs text-gray-500">{{ rm('casting', `note_${castResult.noteKey}`) }}</p>
            <el-tag v-if="cast.actualDraftAngle > 0" class="mt-3" :type="verifyResult.pass ? 'success' : 'danger'">
              {{ prCast('actualAngleLabel') }} {{ cast.actualDraftAngle }}° — {{ verifyResult.pass ? fc('satisfy') : fc('insufficient') }}
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
import MachiningAllowanceDiagram from '@/components/manufacturing/MachiningAllowanceDiagram.vue'
import CastingDraftDiagram from '@/components/manufacturing/CastingDraftDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('manufacturing')
const { pf: pfCast, pr: prCast } = useCalcPage('manufacturing-cast')
const { optionMap, ol } = useOptionsI18n()
const { rm } = useResultI18n()

const toleranceGrades = computed(() => optionMap(TOLERANCE_GRADES, 'toleranceGrades'))
const castMaterials = computed(() => optionMap(CAST_MATERIALS, 'castMaterials'))
const surfaceTypes = computed(() => optionMap(SURFACE_TYPES, 'surfaceTypes'))

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
