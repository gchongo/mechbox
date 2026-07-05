<template>
  <div class="thread-catalog-content">
    <div v-if="selectedSystem" class="thread-catalog-content__body">
      <div class="thread-catalog-hero">
        <ThreadProfileDiagram
          v-if="showDiagram"
          :kind="diagramKind"
          :angle="diagramAngle"
          :title="diagramTitle"
          :formula="diagramFormula"
          :aria="pt('diagramAria')"
          :labels="{ external: pt('externalThread'), internal: pt('internalThread') }"
          :sample="diagramSample"
          :pt="pt"
          :param-hint="pt('diagramParamHint')"
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

      <section v-else-if="selectedSystem.id === 'uns'" class="thread-catalog-table-wrap">
        <ThreadUnsRefTable :pt="pt" @row-click="$emit('row-click', $event)" />
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
import { getThreadRows } from '@/constants/thread-standards'
import { formatPitchDisplay, formatDim } from '@/utils/thread-standards'
import { resolveDiagramKind } from '@/utils/thread-profile-diagram'
import ThreadProfileDiagram from '@/components/thread/ThreadProfileDiagram.vue'
import ThreadSystemMetaPanel from '@/components/thread/ThreadSystemMetaPanel.vue'
import ThreadCatalogTable from '@/components/thread/ThreadCatalogTable.vue'
import ThreadWhitworthRefTable from '@/components/thread/ThreadWhitworthRefTable.vue'
import ThreadUnsRefTable from '@/components/thread/ThreadUnsRefTable.vue'

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

const diagramKind = computed(() => resolveDiagramKind(activeSystemDef.value))

const diagramAngle = computed(() => activeSystemDef.value?.diagramAngle ?? 60)

const diagramTitle = computed(() => {
  if (!selectedSystem.value) return ''
  return props.pt(`ts_${selectedSystem.value.id}_name`)
})

const diagramFormula = computed(() => {
  const kind = diagramKind.value
  const def = activeSystemDef.value
  if (kind === 'trapezoidal_tr') return props.pt('formulaTrapezoidal')
  if (kind === 'trapezoidal_acme') return props.pt('formulaAcme')
  if (kind === 'triangular_55' || kind === 'triangular_55_taper') return props.pt('formulaWhitworth')
  if (kind === 'triangular_60_taper') return props.pt('formulaNptTaper')
  if (kind === 'square') return props.pt('formulaSquare')
  if (kind === 'buttress') return props.pt('formulaButtress')
  if (kind === 'round') return props.pt('formulaRound')
  if (kind === 'ball_screw') return props.pt('formulaBallScrew')
  if (def?.profile === 'trapezoidal') return props.pt('formulaTrapezoidal')
  return props.pt('formula60')
})

const diagramSample = computed(() => {
  if (!props.highlightRowId || !selectedSystem.value?.catalog) return null
  const rows = getThreadRows(
    selectedSystem.value.catalog.system,
    selectedSystem.value.catalog.subTab,
  )
  const row = rows.find((r) => r.id === props.highlightRowId)
  if (!row) return null
  const sealing =
    row.sealing && row.sealing !== '—'
      ? (() => {
          const k = props.pt(`sealing_${row.sealing}`)
          return k.includes('calc.pages.thread-table') ? row.sealing : k
        })()
      : null
  return {
    designation: row.designation,
    pitch: formatPitchDisplay(row),
    major: formatDim(row, row.major),
    pitchDia: formatDim(row, row.pitchDiameter),
    minor: formatDim(row, row.minor),
    tapDrill: row.tapDrill != null ? formatDim(row, row.tapDrill) : null,
    toleranceExt: row.toleranceExternal,
    toleranceInt: row.toleranceInternal,
    taper: row.taper && row.taper !== '—' ? row.taper : null,
    sealing,
    standard: row.standardRef,
  }
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
