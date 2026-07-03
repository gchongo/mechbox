<template>
  <div>
    <h1 class="page-title">O 型圈密封设计</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      沟槽尺寸、压缩率与填充率校核（Parker / ISO 3601 简化）
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="148px">
          <el-form-item label="截面直径">
            <el-select v-model="form.crossSection" class="w-full">
              <el-option v-for="s in ORING_SECTIONS" :key="s.id" :label="s.label" :value="s.cs" />
            </el-select>
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
          <el-form-item label="孔径推荐">
            <el-input-number v-model="boreForRec" :min="5" />
            <el-button class="ml-2" size="small" @click="applyRecommend">应用推荐沟槽</el-button>
          </el-form-item>
        </el-form>
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
        </dl>
        <p class="mt-4 text-xs text-gray-500">{{ result.notes }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { analyzeORingSeal, recommendGroove, ORING_SECTIONS } from '@/utils/o-ring-calc'

const form = reactive({
  crossSection: 3.53,
  grooveDiameter: 18.5,
  grooveWidth: 4.8,
  compressionPercent: 20,
  stretchPercent: 2,
  pressure: 0,
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
