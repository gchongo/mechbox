<template>
  <div class="thread-misconfig-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('misIntro') }}</p>

    <div class="mb-4 flex flex-wrap gap-3">
      <el-input v-model="query" clearable class="max-w-xs" :placeholder="pt('misSearch')" />
      <el-select v-model="tagFilter" clearable class="w-36" :placeholder="pt('misTagAll')">
        <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag" />
      </el-select>
    </div>

    <div class="space-y-3">
      <article
        v-for="entry in filtered"
        :key="entry.id"
        class="mis-card rounded-lg border p-4 dark:border-gray-700"
        :class="severityClass(entry.severity)"
      >
        <div class="mb-2 flex flex-wrap items-center gap-2">
          <el-tag :type="severityTag(entry.severity)" size="small">{{ pt(`mis_sev_${entry.severity}`) }}</el-tag>
          <span v-for="t in entry.tags.slice(0, 4)" :key="t" class="text-[10px] text-gray-400">#{{ t }}</span>
        </div>
        <h3 class="font-semibold">{{ pt(entry.titleKey) }}</h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ pt(entry.descKey) }}</p>
        <p class="mt-2 text-sm text-primary">{{ pt(entry.fixKey) }}</p>
        <div v-if="entry.comparePreset" class="mt-3">
          <el-button size="small" type="primary" plain @click="$emit('open-compare', entry.comparePreset)">
            {{ pt('misOpenCompare') }}
          </el-button>
        </div>
      </article>
    </div>

    <el-empty v-if="!filtered.length" :description="pt('misEmpty')" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { filterMisconfigEntries, MISCONFIG_TAG_OPTIONS } from '@/constants/thread-standards/misconfig-lib'

defineProps({
  pt: { type: Function, required: true },
})

defineEmits(['open-compare'])

const query = ref('')
const tagFilter = ref('')
const tags = MISCONFIG_TAG_OPTIONS

const filtered = computed(() => filterMisconfigEntries(query.value, tagFilter.value))

function severityTag(s) {
  if (s === 'error') return 'danger'
  if (s === 'warning') return 'warning'
  return 'info'
}

function severityClass(s) {
  if (s === 'error') return 'border-red-200 dark:border-red-900'
  if (s === 'warning') return 'border-amber-200 dark:border-amber-900'
  return 'border-gray-200'
}
</script>
