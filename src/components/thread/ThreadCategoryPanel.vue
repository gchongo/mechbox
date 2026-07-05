<template>
  <div class="thread-catalog-content">
    <div v-if="selectedSystem" class="thread-catalog-content__body">
      <div class="thread-catalog-hero">
        <ThreadProfileDiagram
          v-if="showDiagram"
          :angle="diagramAngle"
          :title="diagramTitle"
          :formula="diagramFormula"
          :aria="pt('diagramAria')"
          :labels="{ external: pt('externalThread'), internal: pt('internalThread') }"
        />
        <div class="thread-catalog-hero__aside">
          <el-alert
            v-if="purposeId === 'pipe'"
            type="warning"
            :closable="false"
            show-icon
            :title="pt('pipeCompatibilityWarn')"
          />
          <ThreadSystemMetaPanel :system-id="selectedSystem.id" :pt="pt" />
        </div>
      </div>

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
</template>

<script setup>
import { computed } from 'vue'
import {
  getSystemsForPurpose,
  getThreadSystemDef,
  getReferenceCatalogAlternatives,
  catalogAlternativeToQuery,
} from '@/constants/thread-standards/taxonomy'
import ThreadProfileDiagram from '@/components/thread/ThreadProfileDiagram.vue'
import ThreadSystemMetaPanel from '@/components/thread/ThreadSystemMetaPanel.vue'
import ThreadCatalogTable from '@/components/thread/ThreadCatalogTable.vue'
import ThreadWhitworthRefTable from '@/components/thread/ThreadWhitworthRefTable.vue'

const props = defineProps({
  purposeId: { type: String, required: true },
  selectedSystemId: { type: String, required: true },
  pt: { type: Function, required: true },
  compareIds: { type: Array, default: () => [] },
  highlightRowId: { type: String, default: '' },
  showDiagram: { type: Boolean, default: true },
})

const emit = defineEmits(['row-click', 'toggle-compare', 'open-catalog', 'open-compare'])

const systems = computed(() => getSystemsForPurpose(props.purposeId))

const selectedSystem = computed(() =>
  systems.value.find((s) => s.id === props.selectedSystemId) ?? systems.value[0],
)

const activeSystemDef = computed(() =>
  selectedSystem.value ? getThreadSystemDef(selectedSystem.value.id) : null,
)

const diagramAngle = computed(() => activeSystemDef.value?.diagramAngle ?? 60)

const diagramTitle = computed(() => {
  if (!selectedSystem.value) return ''
  return props.pt(`ts_${selectedSystem.value.id}_name`)
})

const diagramFormula = computed(() => {
  if (activeSystemDef.value?.angle === 55) return props.pt('formula55')
  if (activeSystemDef.value?.profile === 'trapezoidal') return props.pt('formulaTrapezoidal')
  return props.pt('formula60')
})

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
