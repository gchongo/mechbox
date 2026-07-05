<template>
  <div class="thread-category-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt(`cat_${purposeId}_intro`) }}</p>

    <el-table :data="overviewRows" size="small" border stripe class="mb-4">
      <el-table-column :label="pt('catOverviewType')" prop="name" min-width="140" />
      <el-table-column :label="pt('catOverviewUse')" prop="use" min-width="160" />
      <el-table-column :label="pt('metaField_catalog')" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.implemented ? 'success' : 'info'" size="small">
            {{ row.implemented ? '✓' : '—' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="pt('catOverviewNote')" prop="misconfig" min-width="180" show-overflow-tooltip />
    </el-table>

    <div class="mb-4 flex flex-wrap gap-2">
      <el-button
        v-for="sys in systems"
        :key="sys.id"
        size="small"
        :type="selectedSystemId === sys.id ? 'primary' : 'default'"
        @click="$emit('update:selectedSystemId', sys.id)"
      >
        {{ pt(`ts_${sys.id}_name`) }}
        <el-badge v-if="sys.implemented" is-dot class="ml-1" type="success" />
      </el-button>
    </div>

    <div v-if="selectedSystem" class="grid gap-6 xl:grid-cols-2">
      <ThreadSystemMetaPanel :system-id="selectedSystem.id" :pt="pt" />
      <section v-if="selectedSystem.implemented && selectedSystem.catalog" class="min-w-0">
        <ThreadCatalogTable
          :catalog-system="selectedSystem.catalog.system"
          :catalog-sub-tab="selectedSystem.catalog.subTab"
          :pt="pt"
          :compare-ids="compareIds"
          :highlight-row-id="highlightRowId"
          @row-click="$emit('row-click', $event)"
          @toggle-compare="$emit('toggle-compare', $event)"
        />
      </section>
      <section v-else-if="isWhitworthSystem" class="min-w-0">
        <ThreadWhitworthRefTable
          :taxonomy-id="selectedSystem.id"
          :pt="pt"
          @row-click="$emit('row-click', $event)"
          @open-compare="$emit('open-compare', $event)"
        />
      </section>
      <section v-else class="card-panel ref-guide">
        <el-alert type="info" show-icon :closable="false" :title="pt('refNoCatalogTitle')" />
        <p class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {{ refHint }}
        </p>
        <div v-if="catalogAlternatives.length" class="mt-4">
          <p class="mb-2 text-xs text-gray-500">{{ pt('refSuggestLabel') }}</p>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="alt in catalogAlternatives"
              :key="alt"
              size="small"
              type="primary"
              plain
              @click="openCatalogAlternative(alt)"
            >
              {{ catalogLabel(alt) }}
            </el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getSystemsForPurpose, getReferenceCatalogAlternatives, catalogAlternativeToQuery } from '@/constants/thread-standards/taxonomy'
import ThreadSystemMetaPanel from '@/components/thread/ThreadSystemMetaPanel.vue'
import ThreadCatalogTable from '@/components/thread/ThreadCatalogTable.vue'
import ThreadWhitworthRefTable from '@/components/thread/ThreadWhitworthRefTable.vue'

const props = defineProps({
  purposeId: { type: String, required: true },
  selectedSystemId: { type: String, required: true },
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
  highlightRowId: { type: String, default: '' },
})

const emit = defineEmits(['update:selectedSystemId', 'row-click', 'toggle-compare', 'open-catalog', 'open-compare'])

const systems = computed(() => getSystemsForPurpose(props.purposeId))

const selectedSystem = computed(() =>
  systems.value.find((s) => s.id === props.selectedSystemId) ?? systems.value[0],
)

const overviewRows = computed(() =>
  systems.value.map((s) => ({
    id: s.id,
    name: props.pt(`ts_${s.id}_name`),
    use: props.pt(`ts_${s.id}_use`),
    misconfig: props.pt(`ts_${s.id}_misconfig`),
    implemented: s.implemented,
  })),
)

const catalogAlternatives = computed(() =>
  selectedSystem.value && !selectedSystem.value.implemented && !isWhitworthSystem.value
    ? getReferenceCatalogAlternatives(selectedSystem.value.id)
    : [],
)

const isWhitworthSystem = computed(() =>
  ['whitworth', 'bsw', 'bsf'].includes(selectedSystem.value?.id ?? ''),
)

const refHint = computed(() => {
  if (!selectedSystem.value) return ''
  const key = `ref_hint_${selectedSystem.value.id}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : props.pt('refNoCatalogBody')
})

function catalogLabel(catalogSystem) {
  const key = catalogSystem === 'metric' ? 'system_metric' : `system_${catalogSystem}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : catalogSystem.toUpperCase()
}

function openCatalogAlternative(catalogSystem) {
  emit('open-catalog', catalogAlternativeToQuery(catalogSystem))
}
</script>
