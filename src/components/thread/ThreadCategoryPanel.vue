<template>
  <div class="thread-catalog-panel">
    <div class="thread-catalog-layout">
      <aside class="thread-catalog-sidebar">
        <p class="thread-catalog-sidebar__intro">{{ pt(`cat_${purposeId}_intro`) }}</p>

        <nav class="thread-system-nav" :aria-label="pt('catalogSystemNav')">
          <button
            v-for="sys in systems"
            :key="sys.id"
            type="button"
            class="thread-system-nav__item"
            :class="{ 'is-active': selectedSystemId === sys.id }"
            @click="$emit('update:selectedSystemId', sys.id)"
          >
            <span class="thread-system-nav__name">{{ pt(`ts_${sys.id}_name`) }}</span>
            <el-tag
              v-if="sys.implemented"
              type="success"
              size="small"
              effect="plain"
              class="thread-system-nav__tag"
            >
              {{ pt('catalogBadge_yes') }}
            </el-tag>
            <el-tag v-else type="info" size="small" effect="plain" class="thread-system-nav__tag">
              {{ pt('catalogBadge_ref') }}
            </el-tag>
          </button>
        </nav>

        <el-collapse v-model="overviewOpen" class="thread-catalog-overview">
          <el-collapse-item :title="pt('catalogOverviewToggle')" name="overview">
            <ul class="thread-overview-list">
              <li v-for="row in overviewRows" :key="row.id">
                <span class="thread-overview-list__name">{{ row.name }}</span>
                <span class="thread-overview-list__use">{{ row.use }}</span>
              </li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </aside>

      <div v-if="selectedSystem" class="thread-catalog-main">
        <ThreadSystemMetaPanel :system-id="selectedSystem.id" :pt="pt" />

        <section v-if="selectedSystem.implemented && selectedSystem.catalog" class="thread-catalog-table-wrap">
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

        <section v-else-if="isWhitworthSystem" class="thread-catalog-table-wrap">
          <ThreadWhitworthRefTable
            :taxonomy-id="selectedSystem.id"
            :pt="pt"
            @row-click="$emit('row-click', $event)"
            @open-compare="$emit('open-compare', $event)"
          />
        </section>

        <section v-else class="thread-ref-guide card-panel">
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

const overviewOpen = ref([])

const systems = computed(() => getSystemsForPurpose(props.purposeId))

const selectedSystem = computed(() =>
  systems.value.find((s) => s.id === props.selectedSystemId) ?? systems.value[0],
)

const overviewRows = computed(() =>
  systems.value.map((s) => ({
    id: s.id,
    name: props.pt(`ts_${s.id}_name`),
    use: props.pt(`ts_${s.id}_use`),
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
