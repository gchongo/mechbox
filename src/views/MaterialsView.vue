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
        <div class="mt-2 flex flex-wrap gap-1">
          <el-tag size="small">{{ m.displayCategory ?? categoryLabel(m.category) }}</el-tag>
          <el-tag v-if="m.standard" size="small" type="info">{{ m.standard }}</el-tag>
          <el-tag v-if="m.activeStateLabel" size="small" type="warning">{{ m.activeStateLabel }}</el-tag>
        </div>

        <el-select
          v-if="m.states?.length"
          class="mt-2 w-full"
          size="small"
          :model-value="stateOverrides[m.id] ?? m.activeState ?? m.defaultState"
          @update:model-value="(v) => setState(m.id, v)"
        >
          <el-option v-for="s in m.states" :key="s.id" :label="s.label" :value="s.id" />
        </el-select>

        <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <ResultLabel label-class="text-gray-500" text="σ_b" />
            <dd class="font-mono">{{ displayMaterial(m).sigmaB }} MPa</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" text="σ_s" />
            <dd class="font-mono">{{ displayMaterial(m).sigmaS || '—' }} MPa</dd>
          </div>
          <div>
            <dt class="text-gray-500">
              <MathTex :expr="`[\\sigma] @ ${tempC}^\\circ\\mathrm{C}`" />
            </dt>
            <dd class="font-mono">{{ tempAllow(displayMaterial(m)).sigmaAllow }} MPa</dd>
          </div>
          <div>
            <dt class="text-gray-500">
              <MathTex :expr="`[\\tau] @ ${tempC}^\\circ\\mathrm{C}`" />
            </dt>
            <dd class="font-mono">{{ tempAllow(displayMaterial(m)).tauAllow }} MPa</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" text="E" />
            <dd class="font-mono">{{ m.E }} MPa</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" text="ρ" />
            <dd class="font-mono">{{ m.density }} g/cm³</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" text="α" />
            <dd class="font-mono">{{ formatAlpha(m.alpha) }}</dd>
          </div>
          <div>
            <ResultLabel label-class="text-gray-500" text="k" />
            <dd class="font-mono">{{ m.kThermal ?? '—' }} W/(m·K)</dd>
          </div>
        </dl>
        <p class="mt-2 text-xs text-gray-500">{{ m.note }}</p>
      </div>
    </div>
    <el-empty v-if="!filtered.length" :description="ct('materials.empty')" />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import MathTex from '@/components/common/MathTex.vue'
import {
  searchMaterials,
  getCategories,
  getAllowableAtTemp,
  applyMaterialState,
} from '@/constants/materials'
import { useContentI18n } from '@/composables/useContentI18n'
import { materialsEn } from '@/i18n/materials-i18n'

const { ct, locale } = useContentI18n()
const query = ref('')
const category = ref('')
const tempC = ref(20)
const stateOverrides = reactive({})
const categories = getCategories()

function categoryLabel(cat) {
  return ct(`materials.categories.${cat}`) || cat
}

function tempAllow(m) {
  return getAllowableAtTemp(m, tempC.value)
}

function formatAlpha(alpha) {
  if (alpha == null) return '—'
  return `${(alpha * 1e6).toFixed(1)}×10⁻⁶ /K`
}

function setState(id, stateId) {
  stateOverrides[id] = stateId
}

function displayMaterial(m) {
  const sid = stateOverrides[m.id]
  if (sid && m.states?.length) return applyMaterialState(m, sid)
  return m
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
