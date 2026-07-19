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
              <CalcFormItem :label="pf('nominalDiameter')" unit="mm">
                <el-input-number v-model="mach.nominalDiameter" :min="5" />
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
            <el-tag class="mb-3" size="small">{{ machModeTag }}</el-tag>
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
                <ResultLabel :text="pr('grindingAllowance')" /><dd class="font-mono">{{ machResult.grindingAllowance?.toFixed(2) }} mm</dd>
              </div>
              <div v-if="mach.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('minStockDiameter')" /><dd class="font-mono">{{ machResult.minStockDiameter?.toFixed(1) }} mm</dd>
              </div>
              <div v-if="mach.calcMode === 'professional'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="pr('estimatedMachiningMinutes')" /><dd class="font-mono text-primary">{{ machResult.estimatedMachiningMinutes?.toFixed(0) }} min</dd>
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
            <FormulaPanel>
              <MathTex :expr="formulaStockD" block />
              <MathTex :expr="formulaStockL" block />
              <MathTex :expr="formulaVolume" block />
              <MathTex v-if="mach.calcMode === 'professional'" :expr="formulaTime" block />
              <template #hints>
                <ul>
                  <li><MathContent :text="pr('machHintRadial')" /></li>
                  <li><MathContent :text="pr('machHintVolume')" /></li>
                  <li v-if="mach.calcMode !== 'simple'"><MathContent :text="pr('machHintGrind')" /></li>
                  <li v-if="mach.calcMode === 'professional'"><MathContent :text="pr('machHintMrr')" /></li>
                </ul>
              </template>
            </FormulaPanel>
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
              <CalcFormItem :label="pfCast('draftDepth')" unit="mm">
                <el-input-number v-model="cast.depth" :min="1" :max="500" />
              </CalcFormItem>
              <el-form-item :label="pfCast('roughSurface')">
                <el-switch v-model="cast.roughSurface" />
              </el-form-item>
              <el-form-item v-if="cast.calcMode === 'professional'" :label="pfCast('imperfectionFactor')">
                <el-input-number v-model="cast.imperfectionFactor" :min="1" :max="1.3" :step="0.01" :precision="2" />
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
              <ResultLabel label-class="text-sm text-gray-500" :text="prCast('recommendedDraftAngle')" />
              <dd class="font-mono text-3xl text-primary">{{ castResult.draftAngleDeg?.toFixed(2) }}°</dd>
            </div>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="prCast('linearIncreasePerSide')" /><dd class="font-mono">{{ castResult.linearIncreasePerSide?.toFixed(2) }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="prCast('totalWidthIncrease')" /><dd class="font-mono">{{ castResult.totalWidthIncrease?.toFixed(2) }} mm</dd>
              </div>
              <div v-if="cast.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCast('baseAngle')" /><dd class="font-mono">{{ castResult.baseAngleDeg?.toFixed(2) }}°</dd>
              </div>
              <div v-if="cast.calcMode !== 'simple'" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCast('imperfectionFactor')" /><dd class="font-mono">× {{ castResult.imperfectionFactor?.toFixed(2) }}</dd>
              </div>
            </dl>
            <p class="mt-3 text-xs text-gray-500">{{ rm('casting', `note_${castResult.noteKey}`) }}</p>
            <el-tag v-if="cast.actualDraftAngle > 0" class="mt-3" :type="verifyResult.pass ? 'success' : 'danger'">
              {{ prCast('actualAngleLabel') }} {{ cast.actualDraftAngle }}° — {{ verifyResult.pass ? fc('satisfy') : fc('insufficient') }}
              <span v-if="cast.calcMode === 'professional' && verifyResult.margin != null" class="ml-1">
                ({{ prCast('margin') }} {{ verifyResult.margin >= 0 ? '+' : '' }}{{ verifyResult.margin.toFixed(2) }}°)
              </span>
            </el-tag>
            <FormulaPanel :columns="1">
              <MathTex :expr="formulaDraft" block />
              <MathTex :expr="formulaDelta" block />
              <template #hints>
                <ul>
                  <li><MathContent :text="prCast('castHintBase')" /></li>
                  <li><MathContent :text="prCast('castHintDelta')" /></li>
                  <li v-if="cast.calcMode !== 'simple'"><MathContent :text="prCast('castHintPhi')" /></li>
                  <li><MathContent :text="prCast('castHintNote')" /></li>
                </ul>
              </template>
            </FormulaPanel>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pfCut('tabCutting')" name="cutting">
        <CalcModePanel v-model="cut.calcMode" page-key="manufacturing-cutting" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="130px">
              <CalcFormItem :label="pfCut('materialId')">
                <el-select v-model="cut.materialId" class="w-full">
                  <el-option
                    v-for="(m, k) in CUTTING_MATERIALS"
                    :key="k"
                    :label="m.label"
                    :value="k"
                  />
                </el-select>
              </CalcFormItem>
              <CalcFormItem :label="pfCut('cuttingSpeed')" unit="m/min">
                <el-input-number v-model="cut.cuttingSpeed" :min="1" :step="10" />
              </CalcFormItem>
              <CalcFormItem :label="pfCut('feed')" unit="mm/r">
                <el-input-number v-model="cut.feed" :min="0.01" :step="0.05" :precision="3" />
              </CalcFormItem>
              <CalcFormItem :label="pfCut('depthOfCut')" unit="mm">
                <el-input-number v-model="cut.depthOfCut" :min="0.05" :step="0.1" :precision="2" />
              </CalcFormItem>
              <CalcFormItem :label="pfCut('diameter')" unit="mm">
                <el-input-number v-model="cut.diameter" :min="1" />
              </CalcFormItem>
              <CalcFormItem :label="pfCut('length')" unit="mm">
                <el-input-number v-model="cut.length" :min="1" />
              </CalcFormItem>
              <template v-if="cut.calcMode !== 'simple'">
                <CalcFormItem :label="pfCut('efficiency')">
                  <el-input-number v-model="cut.efficiency" :min="0.3" :max="1" :step="0.05" :precision="2" />
                </CalcFormItem>
                <CalcFormItem :label="pfCut('allowPower')" unit="kW">
                  <el-input-number v-model="cut.allowPower" :min="0.1" :step="0.5" :precision="1" />
                </CalcFormItem>
              </template>
              <template v-if="cut.calcMode === 'professional'">
                <CalcFormItem :label="pfCut('minToolLife')" unit="min">
                  <el-input-number v-model="cut.minToolLife" :min="1" :step="5" />
                </CalcFormItem>
              </template>
            </el-form>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag
              v-if="cut.calcMode !== 'simple'"
              class="mb-3"
              :type="cutResult.pass ? 'success' : 'danger'"
            >
              {{ cutResult.pass ? fc('overallPass') : fc('overallFail') }}
            </el-tag>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCut('cuttingForce')" />
                <dd class="font-mono">{{ cutResult.cuttingForce?.toFixed(0) }} N</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCut('cuttingPower')" />
                <dd class="font-mono">{{ cutResult.cuttingPower?.toFixed(2) }} kW</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCut('motorPower')" />
                <dd class="font-mono text-lg text-primary">{{ cutResult.motorPower?.toFixed(2) }} kW</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCut('rpm')" />
                <dd class="font-mono">{{ cutResult.rpm?.toFixed(0) }} rpm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCut('materialRemovalRate')" />
                <dd class="font-mono">{{ cutResult.materialRemovalRate?.toFixed(2) }} cm³/min</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prCut('machiningTimeMin')" />
                <dd class="font-mono">{{ cutResult.machiningTimeMin?.toFixed(2) }} min</dd>
              </div>
              <div
                v-if="cut.calcMode === 'professional' && cutResult.toolLifeMin != null"
                class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
              >
                <ResultLabel :text="prCut('toolLifeMin')" />
                <dd class="font-mono" :class="cutResult.lifePass ? 'text-success' : 'text-error'">
                  {{ cutResult.toolLifeMin.toFixed(1) }} min
                  {{ cutResult.lifePass ? '✓' : '✗' }}
                </dd>
              </div>
            </dl>
            <FormulaPanel :columns="1">
              <MathTex expr="F_c = k_c a_p f" block />
              <MathTex expr="P_c = F_c v_c / (60\times 10^3),\quad P_{\mathrm{m}}=P_c/\eta" block />
              <MathTex expr="n = 1000 v_c /(\pi d)" block />
            </FormulaPanel>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pfRa('tabRoughness')" name="roughness">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="120px">
              <CalcFormItem :label="pfRa('ra')" unit="μm">
                <el-input-number v-model="rough.ra" :min="0.05" :step="0.1" :precision="2" />
              </CalcFormItem>
              <CalcFormItem :label="pfRa('fit')">
                <el-select v-model="rough.fit" class="w-full" filterable allow-create>
                  <el-option v-for="row in FIT_RA_TABLE" :key="row.fit" :label="row.fit" :value="row.fit" />
                </el-select>
              </CalcFormItem>
            </el-form>
            <p class="mt-3 text-xs text-gray-500">{{ prRa('lookupHint') }}</p>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <dl class="space-y-3 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prRa('itRange')" />
                <dd class="font-mono">IT{{ roughResult.byRa?.itMin }}–IT{{ roughResult.byRa?.itMax }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prRa('process')" />
                <dd>{{ roughResult.byRa?.process }}</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                <ResultLabel :text="prRa('fitHint')" />
                <dd class="text-right">{{ roughResult.byRa?.fitHint }}</dd>
              </div>
              <template v-if="roughResult.byFit">
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="prRa('raHole')" />
                  <dd class="font-mono">≤ {{ roughResult.byFit.raHole }} μm</dd>
                </div>
                <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
                  <ResultLabel :text="prRa('raShaft')" />
                  <dd class="font-mono">≤ {{ roughResult.byFit.raShaft }} μm</dd>
                </div>
              </template>
            </dl>
            <el-table :data="roughResult.tableRaIt" size="small" border class="mt-4" max-height="220">
              <el-table-column prop="raMax" :label="prRa('colRaMax')" width="80" />
              <el-table-column :label="prRa('colIt')">
                <template #default="{ row }">IT{{ row.itMin }}–{{ row.itMax }}</template>
              </el-table-column>
              <el-table-column prop="process" :label="prRa('colProcess')" />
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pfInj('tabInjection')" name="injection">
        <CalcModePanel v-model="inj.calcMode" page-key="manufacturing-injection" />
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
            <el-form label-width="130px">
              <CalcFormItem :label="pfInj('materialId')">
                <el-select v-model="inj.materialId" class="w-full">
                  <el-option
                    v-for="(m, k) in INJECTION_MATERIALS"
                    :key="k"
                    :label="m.label"
                    :value="k"
                  />
                </el-select>
              </CalcFormItem>
              <CalcFormItem :label="pfInj('wallThickness')" unit="mm">
                <el-input-number v-model="inj.wallThickness" :min="0.1" :step="0.1" :precision="2" />
              </CalcFormItem>
              <CalcFormItem :label="pfInj('wallVariationPct')" unit="%">
                <el-input-number v-model="inj.wallVariationPct" :min="0" :max="100" />
              </CalcFormItem>
              <CalcFormItem :label="pfInj('draftAngle')" unit="°">
                <el-input-number v-model="inj.draftAngle" :min="0" :step="0.5" :precision="1" />
              </CalcFormItem>
              <CalcFormItem :label="pfInj('filletRadius')" unit="mm">
                <el-input-number v-model="inj.filletRadius" :min="0" :step="0.1" :precision="2" />
              </CalcFormItem>
              <el-form-item :label="pfInj('hasRibs')">
                <el-switch v-model="inj.hasRibs" />
              </el-form-item>
              <CalcFormItem v-if="inj.hasRibs" :label="pfInj('ribThickness')" unit="mm">
                <el-input-number v-model="inj.ribThickness" :min="0.1" :step="0.1" :precision="2" />
              </CalcFormItem>
            </el-form>
            <p class="mt-2 text-xs text-gray-500">
              {{ pfInj('wallRangeHint') }}:
              {{ injResult.material?.minWall }}–{{ injResult.material?.maxWall }} mm,
              {{ pfInj('minDraft') }} ≥ {{ injResult.material?.minDraft }}°
            </p>
          </section>
          <section class="card-panel">
            <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
            <el-tag
              v-if="inj.calcMode !== 'simple'"
              class="mb-3"
              :type="injResult.pass ? 'success' : 'danger'"
            >
              {{ injResult.pass ? fc('overallPass') : fc('overallFail') }}
              ({{ injResult.failCount }} {{ prInj('failCount') }})
            </el-tag>
            <ul class="space-y-2 text-sm">
              <li
                v-for="c in injResult.checks"
                :key="c.id"
                class="flex items-center justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"
              >
                <span>{{ locale === 'en' ? c.labelEn : c.labelZh }}</span>
                <span :class="c.pass ? 'text-success' : 'text-error'">{{ c.pass ? '✓' : '✗' }}</span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-gray-500">{{ injResult.tip }}</p>
          </section>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="mt-4 flex flex-wrap gap-2 tool-action-bar">
      <SaveHistoryButton
        tool="manufacturing"
        :title="historyTitle"
        :status="saveStatus"
        :summary="historySummary"
        :input="historyInput"
        :result="activeResult"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { calcMachiningAllowance, TOLERANCE_GRADES, MACHINING_MODE_OPS } from '@/utils/machining-calc'
import { calcDraftAngle, verifyDraftAngle, CAST_MATERIALS, SURFACE_TYPES } from '@/utils/casting-calc'
import { analyzeCutting, CUTTING_MATERIALS } from '@/utils/cutting-calc'
import { analyzeRoughnessFit, FIT_RA_TABLE } from '@/utils/roughness-fit-ref'
import { analyzeInjectionDfm, INJECTION_MATERIALS } from '@/utils/injection-dfm'
import MachiningAllowanceDiagram from '@/components/manufacturing/MachiningAllowanceDiagram.vue'
import CastingDraftDiagram from '@/components/manufacturing/CastingDraftDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import SaveHistoryButton from '@/components/common/SaveHistoryButton.vue'
import MathContent from '@/components/common/MathContent.vue'
import MathTex from '@/components/common/MathTex.vue'
import FormulaPanel from '@/components/common/FormulaPanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useCalcHistorySave } from '@/composables/useCalcHistorySave'
import { useHistoryReplay } from '@/composables/useHistoryReplay'
import { snapshotHistoryInput } from '@/utils/history-replay'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'
import { useLocale } from '@/composables/useLocale'

const { pt, ct, pf, pr, fc } = useCalcPage('manufacturing')
const { pf: pfCast, pr: prCast } = useCalcPage('manufacturing-cast')
const { pf: pfCut, pr: prCut } = useCalcPage('manufacturing-cutting')
const { pf: pfRa, pr: prRa } = useCalcPage('manufacturing-roughness')
const { pf: pfInj, pr: prInj } = useCalcPage('manufacturing-injection')
const { optionMap, ol } = useOptionsI18n()
const { rm } = useResultI18n()
const { locale } = useLocale()

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
  imperfectionFactor: 1.05,
  actualDraftAngle: 0,
})

const cut = reactive({
  calcMode: 'complete',
  materialId: 'steel_soft',
  cuttingSpeed: 100,
  feed: 0.2,
  depthOfCut: 1.5,
  diameter: 40,
  length: 100,
  efficiency: 0.8,
  allowPower: 5,
  minToolLife: 15,
})

const rough = reactive({
  ra: 1.6,
  fit: 'H7/g6',
})

const inj = reactive({
  calcMode: 'complete',
  materialId: 'abs',
  wallThickness: 2,
  wallVariationPct: 10,
  draftAngle: 1,
  filletRadius: 1,
  hasRibs: true,
  ribThickness: 1,
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
const cutResult = computed(() => analyzeCutting(cut))
const roughResult = computed(() => analyzeRoughnessFit(rough))
const injResult = computed(() => analyzeInjectionDfm(inj))

const machModeTag = computed(() =>
  (machResult.value.operations ?? []).map((op) => ol('machiningOps', op)).join(' + '),
)

const formulaStockD = String.raw`D_s = D + 2\sum a_i`
const formulaStockL = String.raw`L_s = L + 2a_{\mathrm{end}}`
const formulaVolume = String.raw`V_{\mathrm{rem}} = \frac{\pi}{4}(D_s^{2} L_s - D^{2} L)`
const formulaTime = String.raw`t \approx V_{\mathrm{rem}} / \mathrm{MRR}`

const formulaDraft = String.raw`\alpha = (a_0 + k\sqrt{h})\,f_{\mathrm{surf}}\,f_{\mathrm{tex}}\,\varphi`
const formulaDelta = String.raw`\Delta = h\tan\alpha,\quad \Delta_{\mathrm{total}} = 2\Delta`

const activeResult = computed(() => {
  if (tab.value === 'casting') return castResult.value
  if (tab.value === 'cutting') return cutResult.value
  if (tab.value === 'roughness') return roughResult.value
  if (tab.value === 'injection') return injResult.value
  return machResult.value
})

const { saveStatus, historyTitle, historySummary } = useCalcHistorySave({
  form: mach,
  result: activeResult,
  buildTitle: () => pt('title'),
  buildSummary: () => {
    if (tab.value === 'casting') {
      const r = castResult.value
      return [
        { label: prCast('recommendedDraftAngle'), value: `${r.draftAngleDeg?.toFixed(2) ?? '-'}°` },
        { label: fc('check'), value: verifyResult.value.pass ? fc('satisfy') : fc('insufficient') },
      ]
    }
    if (tab.value === 'cutting') {
      const r = cutResult.value
      return [
        { label: prCut('motorPower'), value: `${r.motorPower?.toFixed(2) ?? '-'} kW` },
        { label: prCut('rpm'), value: `${r.rpm?.toFixed(0) ?? '-'} rpm` },
      ]
    }
    if (tab.value === 'roughness') {
      const r = roughResult.value
      return [
        { label: prRa('itRange'), value: `IT${r.byRa?.itMin}–IT${r.byRa?.itMax}` },
        { label: prRa('process'), value: r.byRa?.process ?? '-' },
      ]
    }
    if (tab.value === 'injection') {
      const r = injResult.value
      return [
        { label: prInj('failCount'), value: String(r.failCount ?? 0) },
        { label: fc('check'), value: r.pass ? fc('overallPass') : fc('overallFail') },
      ]
    }
    const r = machResult.value
    return [
      { label: pr('totalRadialAllowance'), value: `${r.totalRadialAllowance?.toFixed(2) ?? '-'} mm` },
      { label: pr('recommendedStockDiameter'), value: `${r.recommendedStockDiameter?.toFixed(1) ?? '-'} mm` },
    ]
  },
})
const historyInput = computed(() =>
  snapshotHistoryInput({
    tab: tab.value,
    mach: { ...mach },
    cast: { ...cast },
    cut: { ...cut },
    rough: { ...rough },
    inj: { ...inj },
  }),
)

function applyManufacturingReplay(input) {
  if (!input || typeof input !== 'object') return
  if (input.tab != null) tab.value = input.tab
  if (input.mach && typeof input.mach === 'object') Object.assign(mach, input.mach)
  if (input.cast && typeof input.cast === 'object') Object.assign(cast, input.cast)
  if (input.cut && typeof input.cut === 'object') Object.assign(cut, input.cut)
  if (input.rough && typeof input.rough === 'object') Object.assign(rough, input.rough)
  if (input.inj && typeof input.inj === 'object') Object.assign(inj, input.inj)
}
useHistoryReplay('manufacturing', null, { applyFn: applyManufacturingReplay })
</script>
