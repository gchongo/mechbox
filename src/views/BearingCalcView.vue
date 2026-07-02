<template>
  <div>
    <h1 class="page-title">轴承寿命计算</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">
      ISO 281 额定寿命 + X/Y 系数自动查表（深沟球/角接触/滚子/推力）
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
        <el-form label-width="150px">
          <el-form-item label="X/Y 查表">
            <el-switch v-model="form.autoLookup" active-text="自动" inactive-text="手动" />
          </el-form-item>
          <el-form-item v-if="form.autoLookup" label="轴承系列">
            <el-select v-model="form.seriesId" class="w-full" filterable>
              <el-option v-for="s in seriesList" :key="s.id" :label="s.label" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.autoLookup" label="轴承型号">
            <el-input v-model="form.bearingModel" placeholder="如 6205、NU206（可选）" @change="onModelChange" />
          </el-form-item>
          <el-form-item v-if="!form.autoLookup" label="轴承类型">
            <el-select v-model="form.bearingType" class="w-full">
              <el-option label="球轴承 (ε=3)" value="ball" />
              <el-option label="滚子轴承 (ε=10/3)" value="roller" />
            </el-select>
          </el-form-item>
          <el-form-item label="额定动载荷 C (N)">
            <el-input-number v-model="form.dynamicLoad" :min="100" :step="1000" />
          </el-form-item>
          <el-form-item label="额定静载荷 C₀ (N)">
            <el-input-number v-model="form.staticLoad" :min="0" :step="1000" />
          </el-form-item>
          <el-form-item label="工况系数 aISO">
            <el-select v-model="form.lifeCondition" class="w-full">
              <el-option label="清洁润滑 (1.5)" value="clean" />
              <el-option label="标准 (1.0)" value="standard" />
              <el-option label="污染 (0.5)" value="contaminated" />
              <el-option label="恶劣 (0.3)" value="heavy" />
            </el-select>
          </el-form-item>
          <el-form-item label="径向载荷 Fr (N)">
            <el-input-number v-model="form.radialLoad" :min="0" :step="100" />
          </el-form-item>
          <el-form-item label="轴向载荷 Fa (N)">
            <el-input-number v-model="form.axialLoad" :min="0" :step="50" />
          </el-form-item>
          <el-form-item v-if="!form.autoLookup" label="系数 X">
            <el-input-number v-model="form.x" :min="0" :max="2" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item v-if="!form.autoLookup" label="系数 Y">
            <el-input-number v-model="form.y" :min="0" :max="4" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="转速 n (rpm)">
            <el-input-number v-model="form.rpm" :min="1" :step="100" />
          </el-form-item>
          <el-form-item label="可靠度 (%)">
            <el-select v-model="form.reliability" class="w-full">
              <el-option label="90% (L10, a₁=1.0)" :value="90" />
              <el-option label="95% (a₁=0.64)" :value="95" />
              <el-option label="96% (a₁=0.55)" :value="96" />
              <el-option label="97% (a₁=0.47)" :value="97" />
              <el-option label="98% (a₁=0.37)" :value="98" />
              <el-option label="99% (a₁=0.25)" :value="99" />
            </el-select>
          </el-form-item>
          <el-form-item label="目标寿命 (h)">
            <el-input-number v-model="form.targetHours" :min="100" :step="1000" />
          </el-form-item>
        </el-form>
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <el-alert
          v-if="result.xyInfo"
          class="mb-4"
          type="info"
          :closable="false"
          show-icon
          :title="result.xyInfo.series"
          :description="`${result.xyInfo.condition} → X=${result.x}, Y=${result.y}`"
        />
        <dl class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">当量动载荷 P</dt>
            <dd class="font-mono">{{ result.equivalentLoad.toFixed(1) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">L10 (百万转)</dt>
            <dd class="font-mono">{{ formatNum(result.l10MillionRev) }}</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">修正寿命 Lnm</dt>
            <dd class="font-mono">{{ formatNum(result.modifiedLifeMillionRev) }} (a₁×aISO={{ (result.reliabilityFactor * result.lifeConditionFactor).toFixed(2) }})</dd>
          </div>
          <div v-if="result.staticSafetyFactor != null" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">静载安全系数 S₀</dt>
            <dd class="font-mono" :class="result.staticPass ? 'text-success' : 'text-error'">
              {{ result.staticSafetyFactor.toFixed(2) }} {{ result.staticPass ? '✓' : '✗' }}
            </dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt class="text-gray-500">额定寿命</dt>
            <dd class="font-mono text-lg" :class="result.pass ? 'text-success' : 'text-error'">
              {{ formatHours(result.lifeHours) }} {{ result.pass ? '✓' : '✗' }}
            </dd>
          </div>
        </dl>
        <div class="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
          <MathTex expr="P = X \cdot F_r + Y \cdot F_a" />
          <MathTex expr="L_{10} = \left(\frac{C}{P}\right)^{\varepsilon} \quad (\text{百万转})" />
          <MathTex expr="L_{nm} = a_1 \cdot L_{10},\quad L_h = \frac{L_{nm} \times 10^6}{60 n}" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeBearingLife, listBearingSeries, resolveSeriesFromModel } from '@/utils/bearing-calc'

const seriesList = listBearingSeries()

const form = reactive({
  autoLookup: true,
  seriesId: 'deep-groove-medium',
  bearingModel: '6205',
  bearingType: 'ball',
  dynamicLoad: 35000,
  staticLoad: 18000,
  lifeCondition: 'standard',
  radialLoad: 5000,
  axialLoad: 1000,
  x: 1,
  y: 0,
  rpm: 1500,
  reliability: 90,
  targetHours: 10000,
})

const result = computed(() => analyzeBearingLife(form))

function onModelChange() {
  if (!form.bearingModel) return
  form.seriesId = resolveSeriesFromModel(form.bearingModel)
}

function formatNum(n) {
  if (!Number.isFinite(n)) return '∞'
  return n.toFixed(2)
}

function formatHours(h) {
  if (!Number.isFinite(h)) return '∞ h'
  if (h >= 10000) return `${(h / 1000).toFixed(1)}k h`
  return `${Math.round(h)} h`
}
</script>
