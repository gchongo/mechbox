<template>
  <div>
    <h1 class="page-title">材料强度查询</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">常用工程材料力学性能参考值（GB/T）</p>

    <section class="card-panel mb-6">
      <el-form inline>
        <el-form-item label="工作温度 (°C)">
          <el-slider v-model="tempC" :min="20" :max="500" :step="10" class="w-48" show-input />
        </el-form-item>
      </el-form>
      <el-input v-model="query" placeholder="搜索材料名称、牌号、类别…" clearable class="max-w-md">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <div class="mt-3 flex flex-wrap gap-2">
        <el-tag
          v-for="cat in categories"
          :key="cat"
          :type="category === cat ? 'primary' : 'info'"
          class="cursor-pointer"
          @click="category = category === cat ? '' : cat"
        >
          {{ cat }}
        </el-tag>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="m in filtered" :key="m.id" class="card-panel">
        <h3 class="font-medium">{{ m.name }}</h3>
        <el-tag size="small" class="mt-2">{{ m.category }}</el-tag>
        <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div><dt class="text-gray-500">σb</dt><dd class="font-mono">{{ m.sigmaB }} MPa</dd></div>
          <div><dt class="text-gray-500">σs</dt><dd class="font-mono">{{ m.sigmaS || '—' }} MPa</dd></div>
          <div><dt class="text-gray-500">[σ] @ {{ tempC }}°C</dt><dd class="font-mono">{{ tempAllow(m).sigmaAllow }} MPa</dd></div>
          <div><dt class="text-gray-500">[τ] @ {{ tempC }}°C</dt><dd class="font-mono">{{ tempAllow(m).tauAllow }} MPa</dd></div>
          <div><dt class="text-gray-500">E</dt><dd class="font-mono">{{ m.E }} MPa</dd></div>
          <div><dt class="text-gray-500">ρ</dt><dd class="font-mono">{{ m.density }} g/cm³</dd></div>
        </dl>
        <p class="mt-2 text-xs text-gray-500">{{ m.note }}</p>
      </div>
    </div>
    <el-empty v-if="!filtered.length" description="未找到匹配材料" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MATERIALS, searchMaterials, getCategories, getAllowableAtTemp } from '@/constants/materials'

const query = ref('')
const category = ref('')
const tempC = ref(20)
const categories = getCategories()

function tempAllow(m) {
  return getAllowableAtTemp(m, tempC.value)
}

const filtered = computed(() => {
  let list = searchMaterials(query.value)
  if (category.value) list = list.filter((m) => m.category === category.value)
  return list
})
</script>
