<template>
  <div class="thread-tap-drill-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('tapIntro') }}</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="120px">
          <el-form-item :label="pt('engPickRow')">
            <ThreadRowPicker
              v-model="rowId"
              :pt="pt"
              :fastener-only="true"
              :hint="pt('tapPickHint')"
            />
          </el-form-item>
          <el-form-item :label="pt('wiz_material_label')">
            <el-select v-model="material" class="w-full">
              <el-option v-for="m in materials" :key="m" :label="pt(`tapMat_${m}`)" :value="m" />
            </el-select>
          </el-form-item>
          <el-form-item :label="pt('tapHoleType')">
            <el-radio-group v-model="holeType">
              <el-radio value="through">{{ pt('tapHole_through') }}</el-radio>
              <el-radio value="blind">{{ pt('tapHole_blind') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="pt('engInputLength')">
            <el-input-number v-model="engagementLength" :min="0" :precision="2" :step="0.5" />
            <span class="ml-2 text-xs text-gray-500">mm / in</span>
          </el-form-item>
        </el-form>
      </section>

      <section ref="resultRef" class="card-panel">
        <el-alert v-if="!result.ok" type="warning" show-icon :closable="false" :title="pt(result.errorKey)" />
        <template v-else>
          <h3 class="mb-3 font-semibold">{{ result.row.designation }}</h3>
          <dl class="tap-dl">
            <div>
              <dt>{{ pt('tapBaseDrill') }}</dt>
              <dd>{{ result.baseDrill }} {{ result.unit }}</dd>
            </div>
            <div>
              <dt>{{ pt('tapRecommendDrill') }}</dt>
              <dd class="text-lg font-semibold text-primary">
                {{ result.recommendedDrill }} {{ result.unit }}
              </dd>
            </div>
            <div v-if="result.drillDelta">
              <dt>{{ pt('tapDelta') }}</dt>
              <dd>{{ result.drillDelta > 0 ? '+' : '' }}{{ result.drillDelta }} {{ result.unit }}</dd>
            </div>
            <div>
              <dt>{{ pt('tapChamfer') }}</dt>
              <dd>{{ result.chamferAngle }}</dd>
            </div>
            <div v-if="result.engagementLength">
              <dt>{{ pt('tapEffectiveLength') }}</dt>
              <dd>{{ result.engagementLength }} {{ result.unit }}</dd>
            </div>
          </dl>
          <ul class="mt-4 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li v-for="key in result.tipKeys" :key="key">{{ pt(key) }}</li>
          </ul>
          <p class="mt-3 text-[10px] text-gray-400">{{ pt('tapDisclaimer') }}</p>
        </template>
        <el-button class="mt-4" type="primary" plain :disabled="!result.ok" @click="exportPdf">
          {{ pt('exportPdf') }}
        </el-button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ThreadRowPicker from '@/components/thread/ThreadRowPicker.vue'
import { findThreadRowById } from '@/utils/thread-engagement-calc'
import { analyzeTapDrill, TAP_MATERIALS } from '@/utils/thread-tap-drill-calc'
import { exportToolReportPdf } from '@/utils/export'
import { buildTapDrillPdfSections } from '@/utils/thread-table-report'

const props = defineProps({
  pt: { type: Function, required: true },
})

const materials = Object.keys(TAP_MATERIALS)
const rowId = ref('')
const material = ref('steel')
const holeType = ref('through')
const engagementLength = ref(null)
const resultRef = ref(null)

const result = computed(() => {
  const row = rowId.value ? findThreadRowById(rowId.value) : null
  return analyzeTapDrill(row, {
    material: material.value,
    holeType: holeType.value,
    engagementLength: engagementLength.value ?? undefined,
  })
})

async function exportPdf() {
  await exportToolReportPdf({
    title: props.pt('tapTitle'),
    sections: buildTapDrillPdfSections(result.value, props.pt),
    element: resultRef.value,
    filename: `thread_tap_drill_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>

<style scoped>
.tap-dl {
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
}
.tap-dl > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 0.35rem;
}
.tap-dl dt {
  color: var(--el-text-color-secondary);
}
</style>
