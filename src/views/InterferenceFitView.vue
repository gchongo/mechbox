<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ pt('subtitle') }}
    </p>

    <CalcModePanel v-model="form.calcMode" page-key="interference-fit" />

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('input') }}</h2>
        <el-form label-width="148px">
          <el-form-item label="轴径 d">
            <el-input-number v-model="form.shaftDiameter" :min="5" :max="200" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="孔径 D">
            <el-input-number v-model="form.holeDiameter" :min="4" :max="199" :precision="2" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="过盈量 i">
            <span class="font-mono text-primary">{{ interference.toFixed(3) }} mm</span>
            <span class="ml-2 text-xs text-gray-500">= d − D</span>
          </el-form-item>
          <el-form-item v-if="form.calcMode !== 'simple'" label="轴内径 d_i">
            <el-input-number v-model="form.shaftInnerDiameter" :min="0" :max="199" :precision="2" />
            <span class="ml-2 text-xs text-gray-500">0 = 实心轴</span>
          </el-form-item>
          <el-form-item label="轮毂外径 D_A">
            <el-input-number v-model="form.hubOuterDiameter" :min="10" :max="400" :precision="1" />
            <el-button class="ml-1" size="small" link @click="resetOuter">推荐 {{ suggestedOuter }} mm</el-button>
          </el-form-item>
          <el-form-item label="配合长度 L">
            <el-input-number v-model="form.fitLength" :min="1" :max="300" :precision="1" />
            <span class="ml-2 text-sm text-gray-500">mm</span>
          </el-form-item>
          <el-form-item label="摩擦系数 μ">
            <el-input-number v-model="form.friction" :min="0.05" :max="0.4" :precision="2" :step="0.02" />
          </el-form-item>
          <el-divider content-position="left">材料</el-divider>
          <el-form-item label="轴 E / ν">
            <el-input-number v-model="form.shaftE" :min="50000" :step="10000" class="w-28" />
            <el-input-number v-model="form.shaftNu" :min="0.2" :max="0.4" :precision="2" :step="0.01" class="ml-2 w-24" />
          </el-form-item>
          <el-form-item label="孔 E / ν">
            <el-input-number v-model="form.hubE" :min="50000" :step="10000" class="w-28" />
            <el-input-number v-model="form.hubNu" :min="0.2" :max="0.4" :precision="2" :step="0.01" class="ml-2 w-24" />
          </el-form-item>
          <template v-if="form.calcMode === 'complete' || form.calcMode === 'professional'">
            <el-form-item label="许用切向应力">
              <el-input-number v-model="form.shaftAllowHoop" :min="50" :step="50" class="w-28" />
              <span class="ml-1 text-xs text-gray-500">轴</span>
              <el-input-number v-model="form.hubAllowHoop" :min="50" :step="50" class="ml-2 w-28" />
              <span class="ml-1 text-xs text-gray-500">孔</span>
            </el-form-item>
          </template>
          <template v-if="form.calcMode === 'professional'">
            <el-divider content-position="left">温度修正</el-divider>
            <el-form-item label="温升 ΔT (K)">
              <el-input-number v-model="form.deltaT" :min="-300" :max="500" :step="10" />
            </el-form-item>
            <el-form-item label="轴 α / 孔 α">
              <el-input-number v-model="form.shaftAlpha" :min="1e-6" :max="30e-6" :step="0.5e-6" :precision="7" class="w-32" />
              <el-input-number v-model="form.holeAlpha" :min="1e-6" :max="30e-6" :step="0.5e-6" :precision="7" class="ml-2 w-32" />
            </el-form-item>
          </template>
        </el-form>
        <el-alert v-if="result.thinWallWarning" type="warning" show-icon :closable="false" class="mt-2"
          title="轮毂壁厚较薄，结果仅供估算，建议校核或采用厚壁公式" />

        <InterferenceFitDiagram
          :shaft-diameter="form.shaftDiameter"
          :hole-diameter="form.holeDiameter"
          :hub-outer-diameter="form.hubOuterDiameter"
          :fit-length="form.fitLength"
          :interference="interference"
          :shaft-inner-diameter="form.shaftInnerDiameter"
        />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">{{ ct('results') }}</h2>
        <el-alert v-if="result.error" :title="result.error" type="error" show-icon />
        <dl v-else class="space-y-3 text-sm">
          <div v-if="result.thermal" class="flex justify-between rounded bg-amber-50 p-3 dark:bg-amber-950">
            <dt>温变后过盈 i'</dt>
            <dd class="font-mono">{{ result.interference?.toFixed(4) }} mm (Δi {{ result.thermal.interferenceChange?.toFixed(4) }})</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>接触压力 p</dt>
            <dd class="font-mono">{{ result.pressure?.toFixed(1) }} MPa</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>轮毂 / 轴切向应力</dt>
            <dd class="font-mono" :class="result.hoopPass === false ? 'text-error' : ''">
              {{ result.hoopHub?.toFixed(1) }} / {{ result.hoopShaft?.toFixed(1) }} MPa
              <span v-if="form.calcMode !== 'simple'">{{ result.hoopPass ? ' ✓' : ' ✗' }}</span>
            </dd>
          </div>
          <div v-if="result.hollowShaft" class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>空心轴模型</dt>
            <dd class="font-mono">是</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>压装力 F</dt>
            <dd class="font-mono">{{ result.pressForce?.toFixed(0) }} N</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>传递扭矩 T</dt>
            <dd class="font-mono">{{ result.torqueCapacityNm?.toFixed(1) }} N·m</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>最小壁厚</dt>
            <dd class="font-mono">{{ result.minHubWall?.toFixed(2) }} mm</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs text-gray-500">
          基于厚壁圆筒 Lame 理论；实际压装力与扭矩受表面粗糙度、润滑及几何偏差影响。
        </p>
        <router-link to="/thermal-expansion" class="mt-3 inline-block text-xs text-primary hover:underline">
          → 热膨胀对过盈量的影响
        </router-link>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { analyzeInterferenceFit } from '@/utils/interference-fit-calc'
import InterferenceFitDiagram from '@/components/interference/InterferenceFitDiagram.vue'
import CalcModePanel from '@/components/calc/CalcModePanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, ct } = useCalcPage('interference-fit')

const form = reactive({
  calcMode: 'simple',
  shaftDiameter: 50,
  holeDiameter: 49.975,
  shaftInnerDiameter: 0,
  hubOuterDiameter: 90,
  fitLength: 40,
  friction: 0.12,
  shaftE: 210000,
  hubE: 210000,
  shaftNu: 0.3,
  hubNu: 0.3,
  shaftAllowHoop: 350,
  hubAllowHoop: 350,
  deltaT: 0,
  shaftAlpha: 11.5e-6,
  holeAlpha: 11.5e-6,
})

const interference = computed(() => form.shaftDiameter - form.holeDiameter)
const suggestedOuter = computed(() => Math.round(form.shaftDiameter * 1.8))

function resetOuter() {
  form.hubOuterDiameter = suggestedOuter.value
}

const result = computed(() => analyzeInterferenceFit(form))
</script>
