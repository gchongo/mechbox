<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="o-ring" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="148px">
          <CalcFormItem :label="pf('crossSection')">
            <div class="flex w-full flex-wrap items-center gap-2">
              <el-input-number
                v-model="form.crossSection"
                :min="0.5"
                :max="20"
                :precision="2"
                :step="0.01"
              />
              <span class="text-sm text-gray-500">mm</span>
            </div>
            <div class="mt-2 flex flex-wrap items-center gap-1">
              <span class="text-xs text-gray-500">{{ pf('as568') }}</span>
              <el-button
                v-for="s in ORING_SECTIONS"
                :key="s.id"
                link
                type="primary"
                size="small"
                @click="form.crossSection = s.cs"
              >
                {{ s.cs }}
              </el-button>
            </div>
          </CalcFormItem>
          <CalcFormItem :label="pf('grooveDiameter')">
            <el-input-number v-model="form.grooveDiameter" :min="1" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('grooveWidth')">
            <el-input-number v-model="form.grooveWidth" :min="0.5" :precision="2" />
          </CalcFormItem>
          <CalcFormItem :label="pf('compressionPercent')">
            <el-input-number v-model="form.compressionPercent" :min="5" :max="35" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">%</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('stretchPercent')">
            <el-input-number v-model="form.stretchPercent" :min="0" :max="8" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">%</span>
          </CalcFormItem>
          <CalcFormItem :label="pf('workingPressure')">
            <el-input-number v-model="form.pressure" :min="0" :max="50" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">{{ pf('pressureHint') }}</span>
          </CalcFormItem>
          <template v-if="form.calcMode !== 'simple'">
            <CalcFormItem :label="pf('extrusionGap')">
              <el-input-number v-model="form.extrusionGap" :min="0.05" :max="0.5" :precision="2" :step="0.01" />
            </CalcFormItem>
            <el-form-item :label="fc('material')">
              <el-select v-model="form.material" class="w-full">
                <el-option v-for="(m, k) in materials" :key="k" :label="m.label" :value="k" />
              </el-select>
            </el-form-item>
            <CalcFormItem :label="pf('operatingTemp')">
              <el-input-number v-model="form.operatingTemp" :min="-40" :max="250" />
            </CalcFormItem>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <CalcFormItem :label="pf('strokeSpeed')">
              <el-input-number v-model="form.strokeSpeed" :min="0" :max="2" :precision="2" :step="0.1" />
            </CalcFormItem>
          </template>
          <CalcFormItem :label="pf('boreRecommend')">
            <el-input-number v-model="boreForRec" :min="5" />
            <el-button class="ml-2" size="small" @click="applyRecommend">{{ pf('applyRecommendGroove') }}</el-button>
          </CalcFormItem>
        </el-form>

        <ORingSealDiagram
          :calc-mode="form.calcMode"
          :cross-section="form.crossSection"
          :groove-diameter="form.grooveDiameter"
          :groove-width="form.grooveWidth"
          :groove-depth="result.grooveDepth ?? 0"
          :compression="result.compression ?? 0"
          :compression-percent="result.compressionPercent ?? form.compressionPercent"
          :extrusion-gap="form.extrusionGap"
          :stretch-percent="form.stretchPercent"
          :pressure="form.pressure"
          :bore-diameter="boreForRec"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ fc('checkResults') }}</h2>
        <el-tag class="mb-4" :type="result.pass ? 'success' : 'warning'">
          {{ result.pass ? fc('designOk') : fc('designAdjust') }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('compressionAmount')" />
            <dd class="font-mono" :class="result.compressionOk ? 'text-success' : 'text-error'">
              {{ result.compression?.toFixed(3) }} mm ({{ result.compressionPercent?.toFixed(1) }}%)
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('grooveDepth')" />
            <dd class="font-mono">{{ result.grooveDepth?.toFixed(3) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('fillPercent')" />
            <dd class="font-mono" :class="result.fillOk ? 'text-success' : 'text-error'">
              {{ result.fillPercent?.toFixed(1) }}% (65–85%)
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('recommendedWidth')" />
            <dd class="font-mono">{{ result.recommendedWidth?.toFixed(2) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900"><ResultLabel :text="pr('widthCheck')" />
            <dd>{{ result.widthOk ? pr('widthOk') : pr('widthBad') }}</dd>
          </div>
          <div v-if="result.extrusionPass != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>{{ pr('extrusionGap') }}</dt>
            <dd>{{ result.extrusionGap }} / {{ result.maxExtrusionGap?.toFixed(2) }} mm {{ result.extrusionPass ? '✓' : '✗' }}</dd>
          </div>
          <div v-if="result.maxAllowPressure" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>{{ pr('maxPressure') }}</dt>
            <dd class="font-mono">{{ result.maxAllowPressure?.toFixed(1) }} MPa</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-gray-500">{{ rm('oRing', `notes_${result.notesKey}`) }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeORingSeal, recommendGroove, ORING_SECTIONS, ORING_MATERIALS } from '@/utils/o-ring-calc'
import ORingSealDiagram from '@/components/oring/ORingSealDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { useResultI18n } from '@/composables/useResultI18n'

const { pt, ct, pf, pr, fc } = useCalcPage('o-ring')
const { optionMap } = useOptionsI18n()
const { rm } = useResultI18n()

const materials = computed(() => optionMap(ORING_MATERIALS, 'oringMaterials'))
const form = reactive({
  calcMode: 'simple',
  crossSection: 3.53,
  grooveDiameter: 18.5,
  grooveWidth: 4.8,
  compressionPercent: 20,
  stretchPercent: 2,
  pressure: 0,
  extrusionGap: 0.15,
  material: 'nbr',
  operatingTemp: 25,
  strokeSpeed: 0,
})

const boreForRec = ref(25)

function applyRecommend() {
  const r = recommendGroove(boreForRec.value, form.crossSection)
  form.grooveDiameter = Number(r.grooveDiameter.toFixed(2))
  form.grooveWidth = Number(r.grooveWidth.toFixed(2))
  form.compressionPercent = r.compressionPercent
}

const result = computed(() => analyzeORingSeal(form))
</script>
