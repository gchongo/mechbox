<template>
  <div>
    <h1 class="page-title">{{ ct('materials.title') }}</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">{{ ct('materials.subtitle') }}</p>

    <section class="card-panel mb-6">
      <el-form inline>
        <el-form-item :label="ct('materials.workTemp')">
          <el-slider v-model="tempC" :min="20" :max="500" :step="10" class="w-48" show-input />
        </el-form-item>
      </el-form>
      <el-input v-model="query" :placeholder="ct('materials.searchPlaceholder')" clearable class="max-w-md">
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
          {{ categoryLabel(cat) }}
        </el-tag>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="m in filtered" :key="m.id" class="card-panel">
        <h3 class="font-medium">{{ m.name }}</h3>
          <el-tag size="small" class="mt-2">{{ m.displayCategory ?? categoryLabel(m.category) }}</el-tag>
        <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <ResultLabel label-class="text-gray-500" :text="'$\sigma_b$'" />
            <dd class="font-mono">{{ m.sigmaB }} MPa</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" :text="'$\sigma_s$'" />
            <dd class="font-mono">{{ m.sigmaS || '—' }} MPa</dd>
          </div>
          <div>
            <dt class="text-gray-500">
              <MathTex :expr="`[\\sigma] @ ${tempC}^\\circ\\mathrm{C}`" />
            </dt>
            <dd class="font-mono">{{ tempAllow(m).sigmaAllow }} MPa</dd>
          </div>
          <div>
            <dt class="text-gray-500">
              <MathTex :expr="`[\\tau] @ ${tempC}^\\circ\\mathrm{C}`" />
            </dt>
            <dd class="font-mono">{{ tempAllow(m).tauAllow }} MPa</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" :text="'$E$'" />
            <dd class="font-mono">{{ m.E }} MPa</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" :text="'$\rho$'" />
            <dd class="font-mono">{{ m.density }} g/cm³</dd>
          </div>
        </dl>
        <p class="mt-2 text-xs text-gray-500">{{ m.note }}</p>
      </div>
    </div>
    <el-empty v-if="!filtered.length" :description="ct('materials.empty')" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import MathTex from '@/components/common/MathTex.vue'
import { searchMaterials, getCategories, getAllowableAtTemp } from '@/constants/materials'
import { useContentI18n } from '@/composables/useContentI18n'
import { materialsEn } from '@/i18n/materials-i18n'

const { ct, locale } = useContentI18n()
const query = ref('')
const category = ref('')
const tempC = ref(20)
const categories = getCategories()

function categoryLabel(cat) {
  return ct(`materials.categories.${cat}`) || cat
}

function tempAllow(m) {
  return getAllowableAtTemp(m, tempC.value)
}

const filtered = computed(() => {
  let list = searchMaterials(query.value)
  if (locale.value === 'en') {
    list = list.map((m) => {
      const en = materialsEn[m.id]
      if (!en) return m
      return { ...m, name: en.name, note: en.note, displayCategory: en.category }
    })
  }
  if (category.value) list = list.filter((m) => m.category === category.value)
  return list
})
</script>
