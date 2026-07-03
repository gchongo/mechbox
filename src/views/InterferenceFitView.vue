<template>
  <div>
    <h1 class="page-title">过盈配合计算</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      DIN 7190 弹性理论简化：接触压力、压装力与摩擦传递扭矩估算
    </p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <h2 class="mb-4 font-semibold">输入参数</h2>
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
        </el-form>
        <el-alert v-if="result.thinWallWarning" type="warning" show-icon :closable="false" class="mt-2"
          title="轮毂壁厚较薄，结果仅供估算，建议校核或采用厚壁公式" />
      </section>

      <section class="card-panel">
        <h2 class="mb-4 font-semibold">计算结果</h2>
        <el-alert v-if="result.error" :title="result.error" type="error" show-icon />
        <dl v-else class="space-y-3 text-sm">
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>接触压力 p</dt>
            <dd class="font-mono">{{ result.pressure?.toFixed(1) }} MPa</dd>
          </div>
          <div class="flex justify-between rounded bg-gray-50 p-3 dark:bg-gray-900">
            <dt>轮毂切向应力</dt>
            <dd class="font-mono">{{ result.hoopHub?.toFixed(1) }} MPa</dd>
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
          基于厚壁圆筒 Lame 理论简化；实际压装力与扭矩受表面粗糙度、润滑及几何偏差影响。
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

const form = reactive({
  shaftDiameter: 50,
  holeDiameter: 49.975,
  hubOuterDiameter: 90,
  fitLength: 40,
  friction: 0.12,
  shaftE: 210000,
  hubE: 210000,
  shaftNu: 0.3,
  hubNu: 0.3,
})

const interference = computed(() => form.shaftDiameter - form.holeDiameter)
const suggestedOuter = computed(() => Math.round(form.shaftDiameter * 1.8))

function resetOuter() {
  form.hubOuterDiameter = suggestedOuter.value
}

const result = computed(() => analyzeInterferenceFit(form))
</script>
