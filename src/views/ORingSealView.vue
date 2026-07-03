<template>
  <div>
    <h1 class="page-title">O 型圈密封设计</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      沟槽尺寸、压缩率与填充率校核，支持静/动密封、挤出间隙与极限压力分析（Parker / ISO 3601 参考）
    </p>

    <section class="card-panel mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">计算模型</span>
        <el-radio-group v-model="form.calcMode">
          <el-radio-button value="simple">简化</el-radio-button>
          <el-radio-button value="complete">完整</el-radio-button>
          <el-radio-button value="professional">专业</el-radio-button>
        </el-radio-group>
        <p class="w-full text-xs text-gray-500">
          <template v-if="form.calcMode === 'simple'">静密封压缩率 / 填充率。</template>
          <template v-else-if="form.calcMode === 'complete'">动压密封、挤出间隙、材料/温度。</template>
          <template v-else>往复速度、极限压力、热膨胀修正。</template>
        </p>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="148px">
          <el-form-item label="截面直径">
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
              <span class="text-xs text-gray-500">AS568：</span>
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
          </el-form-item>
          <el-form-item label="沟槽底径">
            <el-input-number v-model="form.grooveDiameter" :min="1" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="沟槽宽度">
            <el-input-number v-model="form.grooveWidth" :min="0.5" :precision="2" />
          </el-form-item>
          <el-form-item label="压缩率">
            <el-input-number v-model="form.compressionPercent" :min="5" :max="35" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">%</span>
          </el-form-item>
          <el-form-item label="安装拉伸">
            <el-input-number v-model="form.stretchPercent" :min="0" :max="8" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">%</span>
          </el-form-item>
          <el-form-item label="工作压力">
            <el-input-number v-model="form.pressure" :min="0" :max="50" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">MPa（0=静密封）</span>
          </el-form-item>
          <template v-if="form.calcMode !== 'simple'">
            <el-form-item label="挤出间隙 (mm)">
              <el-input-number v-model="form.extrusionGap" :min="0.05" :max="0.5" :precision="2" :step="0.01" />
            </el-form-item>
            <el-form-item label="材料">
              <el-select v-model="form.material" class="w-full">
                <el-option v-for="(m, k) in materials" :key="k" :label="m.label" :value="k" />
              </el-select>
            </el-form-item>
            <el-form-item label="工作温度 (°C)">
              <el-input-number v-model="form.operatingTemp" :min="-40" :max="250" />
            </el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-form-item label="往复速度 (m/s)">
              <el-input-number v-model="form.strokeSpeed" :min="0" :max="2" :precision="2" :step="0.1" />
            </el-form-item>
          </template>
          <el-form-item label="孔径推荐">
            <el-input-number v-model="boreForRec" :min="5" />
            <el-button class="ml-2" size="small" @click="applyRecommend">应用推荐沟槽</el-button>
          </el-form-item>
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
        <h2 class="mb-4 font-semibold">校核结果</h2>
        <el-tag class="mb-4" :type="result.pass ? 'success' : 'warning'">
          {{ result.pass ? '设计合理' : '需调整沟槽或压缩率' }}
        </el-tag>
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>压缩量</dt>
            <dd class="font-mono" :class="result.compressionOk ? 'text-success' : 'text-error'">
              {{ result.compression?.toFixed(3) }} mm ({{ result.compressionPercent?.toFixed(1) }}%)
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>沟槽深度（估算）</dt>
            <dd class="font-mono">{{ result.grooveDepth?.toFixed(3) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>填充率</dt>
            <dd class="font-mono" :class="result.fillOk ? 'text-success' : 'text-error'">
              {{ result.fillPercent?.toFixed(1) }}% (65–85%)
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>推荐沟槽宽</dt>
            <dd class="font-mono">{{ result.recommendedWidth?.toFixed(2) }} mm</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>宽度校核</dt>
            <dd>{{ result.widthOk ? '✓ 合理' : '✗ 偏窄/宽' }}</dd>
          </div>
          <div v-if="result.extrusionPass != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>挤出间隙</dt>
            <dd>{{ result.extrusionGap }} / {{ result.maxExtrusionGap?.toFixed(2) }} mm {{ result.extrusionPass ? '✓' : '✗' }}</dd>
          </div>
          <div v-if="result.maxAllowPressure" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>极限压力</dt>
            <dd class="font-mono">{{ result.maxAllowPressure?.toFixed(1) }} MPa</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-gray-500">{{ result.notes }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeORingSeal, recommendGroove, ORING_SECTIONS, ORING_MATERIALS } from '@/utils/o-ring-calc'
import ORingSealDiagram from '@/components/oring/ORingSealDiagram.vue'

const materials = ORING_MATERIALS
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
