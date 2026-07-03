<template>
  <div>
    <h1 class="page-title">{{ ct('manual.title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">
      {{ ct('manual.subtitle') }}
    </p>

    <div class="mb-4 flex flex-wrap gap-2">
      <el-button
        v-for="cat in categoryKeys"
        :key="cat"
        size="small"
        :type="activeCategory === cat ? 'primary' : 'default'"
        @click="activeCategory = cat"
      >
        {{ manualCategoryLabel(cat) }}
      </el-button>
    </div>

    <el-input
      v-model="keyword"
      :placeholder="ct('manual.searchPlaceholder')"
      clearable
      class="mb-6 max-w-md"
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>

    <div class="grid gap-4 md:grid-cols-2">
      <div v-for="item in filtered" :key="item.id" class="card-panel">
        <div class="mb-1 flex items-center gap-2">
          <h3 class="font-medium text-primary">{{ item.name }}</h3>
          <el-tag v-if="item.category" size="small" effect="plain">{{ item.category }}</el-tag>
        </div>
        <div class="my-3 rounded-lg bg-gray-50 py-3 dark:bg-gray-900">
          <MathTex :expr="item.latex" block />
        </div>
        <p class="formula-desc text-sm text-gray-600 dark:text-gray-400">
          <MathContent :text="item.desc" />
        </p>
        <div class="mt-3 flex flex-wrap gap-1">
          <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
        </div>
        <div v-if="item.categoryKey === 'gear'" class="mt-3">
          <router-link to="/gear" class="text-sm text-primary hover:underline">{{ ct('manual.openGear') }}</router-link>
        </div>
        <div v-if="item.categoryKey === 'bearing'" class="mt-3">
          <router-link to="/bearing" class="text-sm text-primary hover:underline">{{ ct('manual.openBearing') }}</router-link>
        </div>
        <div v-if="item.categoryKey === 'thread'" class="mt-3">
          <router-link to="/thread" class="text-sm text-primary hover:underline">{{ ct('manual.openThread') }}</router-link>
        </div>
      </div>
    </div>
    <el-empty v-if="!filtered.length" :description="ct('manual.empty')" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useContentI18n } from '@/composables/useContentI18n'

const route = useRoute()
const categoryKeys = ['all', 'chain', 'stats', 'gear', 'bearing', 'thread', 'struct', 'drive', 'fluid', 'mfg', 'material', 'quality', 'fatigue', 'tol', 'strength']

const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const activeCategory = ref('all')

const { ct, formulas, manualCategoryLabel, filterFormulas } = useContentI18n()

const categoryKeyByLabel = computed(() => {
  const out = {}
  for (const key of categoryKeys) {
    if (key === 'all') continue
    out[manualCategoryLabel(key)] = key
  }
  return out
})

const localizedFormulas = computed(() =>
  formulas.value.map((f) => ({
    ...f,
    categoryKey: categoryKeyByLabel.value[f.category],
  })),
)

const filtered = computed(() =>
  filterFormulas(localizedFormulas.value, activeCategory.value, keyword.value),
)

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === 'string') keyword.value = q
  },
)
</script>

<style scoped>
.formula-desc :deep(.math-content) {
  line-height: 1.65;
}
</style>
