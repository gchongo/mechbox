<template>
  <div class="thread-engagement-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('engIntro') }}</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="148px" class="thread-panel-form">
          <el-form-item :label="pt('engPickRow')">
            <ThreadRowPicker
              v-model="rowId"
              :pt="pt"
              :systems="['metric', 'unc', 'unf', 'unef', 'tr', 'acme']"
              :fastener-only="false"
              :hint="pt('engPickHint')"
              @update:model-value="onRowChange"
            />
          </el-form-item>
          <el-divider content-position="left">{{ pt('engOrManual') }}</el-divider>
          <CalcFormItem :label="pt('engDiameter')" unit="mm">
            <el-input-number v-model="form.diameter" :min="1" :max="100" :step="1" :disabled="!!selectedRow" />
          </CalcFormItem>
          <CalcFormItem :label="pt('colPitch')" unit="mm">
            <el-input-number v-model="form.pitch" :min="0.25" :max="6" :precision="2" :step="0.25" :disabled="!!selectedRow" />
          </CalcFormItem>
          <CalcFormItem :label="pt('engInputLength')" unit="mm">
            <el-input-number v-model="form.engagedLength" :min="0" :precision="1" :step="0.5" />
          </CalcFormItem>
          <CalcFormItem :label="pt('wiz_material_label')">
            <el-select v-model="form.jointMaterial" class="w-full">
              <el-option v-for="m in materials" :key="m" :label="pt(`engMat_${m}`)" :value="m" />
            </el-select>
          </CalcFormItem>
          <CalcFormItem :label="pt('engAxialForce')" unit="N">
            <el-input-number v-model="form.axialForce" :min="0" :step="500" />
          </CalcFormItem>
          <CalcFormItem :label="pt('engGrade')">
            <el-select v-model="form.grade" class="w-full">
              <el-option v-for="g in grades" :key="g" :label="g" :value="g" />
            </el-select>
          </CalcFormItem>
        </el-form>
        <router-link to="/thread" class="text-xs text-primary">{{ pt('engLinkStrength') }} →</router-link>
      </section>

      <section ref="resultRef" class="card-panel">
        <el-alert v-if="!result.ok" type="warning" show-icon :closable="false" :title="pt(result.errorKey)" />
        <template v-else>
          <el-alert
            v-if="result.needsLength"
            type="info"
            show-icon
            :closable="false"
            class="mb-3"
            :title="pt('engNeedLength')"
          />
          <div v-else class="mb-3 flex flex-wrap items-center gap-2">
            <el-tag :type="result.passMin ? 'success' : 'danger'">
              {{ pt('engPassMin') }}: {{ result.passMin ? pt('engPass') : pt('engFail') }}
            </el-tag>
            <el-tag :type="result.passRecommend ? 'success' : 'warning'">
              {{ pt('engPassRecommend') }}: {{ result.passRecommend ? pt('engPass') : pt('engWarn') }}
            </el-tag>
          </div>
          <dl class="eng-dl">
            <div><dt>{{ pt('engDesignation') }}</dt><dd>{{ result.designation }}</dd></div>
            <div><dt>{{ pt('engMinLength') }}</dt><dd>{{ fmt(result.minEngagement) }} mm</dd></div>
            <div><dt>{{ pt('engRecommendLength') }}</dt><dd>{{ fmt(result.recommendedEngagement) }} mm</dd></div>
            <div><dt>{{ pt('engMaxPractical') }}</dt><dd>{{ fmt(result.maxPracticalEngagement) }} mm</dd></div>
            <div><dt>{{ pt('engInputLength') }}</dt><dd class="font-medium">{{ result.hasLength ? `${fmt(result.engagedLength)} mm` : '—' }}</dd></div>
            <div v-if="result.hasLength"><dt>{{ pt('engMargin') }}</dt><dd>{{ fmt(result.marginToMin) }} mm</dd></div>
            <div v-if="result.shearStress != null">
              <dt>{{ pt('engShearStress') }}</dt>
              <dd>
                {{ fmt(result.shearStress, 1) }} MPa
                <el-tag size="small" class="ml-1" :type="result.shearPass ? 'success' : 'danger'">
                  {{ result.shearPass ? pt('engPass') : pt('engFail') }}
                </el-tag>
              </dd>
            </div>
          </dl>
          <p class="mt-3 text-[10px] text-gray-400">{{ pt('engDisclaimer') }}</p>
        </template>
        <el-button class="mt-4" type="primary" plain :disabled="!result.ok" @click="exportPdf">
          {{ pt('exportPdf') }}
        </el-button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import CalcFormItem from '@/components/calc/CalcFormItem.vue'
import ThreadRowPicker from '@/components/thread/ThreadRowPicker.vue'
import { analyzeThreadEngagement, findThreadRowById } from '@/utils/thread-engagement-calc'
import { THREAD_GRADES } from '@/utils/thread-calc'
import { exportToolReportPdf } from '@/utils/export'
import { buildEngagementPdfSections } from '@/utils/thread-table-report'

const props = defineProps({
  pt: { type: Function, required: true },
})

const materials = ['steel', 'stainless', 'aluminum', 'cast_iron', 'plastic']
const grades = Object.keys(THREAD_GRADES)

const rowId = ref('')
const selectedRow = ref(null)
const resultRef = ref(null)
const form = reactive({
  diameter: 10,
  pitch: 1.5,
  engagedLength: 0,
  jointMaterial: 'steel',
  axialForce: 0,
  grade: '8.8',
})

const result = computed(() =>
  analyzeThreadEngagement({
    row: selectedRow.value,
    diameter: form.diameter,
    pitch: form.pitch,
    engagedLength: form.engagedLength,
    jointMaterial: form.jointMaterial,
    axialForce: form.axialForce,
    grade: form.grade,
  }),
)

function onRowChange(id) {
  selectedRow.value = id ? findThreadRowById(id) : null
  const row = selectedRow.value
  if (!row) return
  if (row.system === 'metric' || row.system === 'tr') {
    form.diameter = row.nominal
    form.pitch = row.pitch
    return
  }
  if (['unc', 'unf', 'unef', 'acme'].includes(row.system) && row.nominal && row.tpi) {
    form.diameter = Math.round(row.nominal * 25.4 * 100) / 100
    form.pitch = Math.round((25.4 / row.tpi) * 1000) / 1000
  }
}

function fmt(n, p = 2) {
  if (n == null) return '—'
  return Number(n).toFixed(p)
}

async function exportPdf() {
  await exportToolReportPdf({
    title: props.pt('engTitle'),
    sections: buildEngagementPdfSections(result.value, props.pt),
    element: resultRef.value,
    filename: `thread_engagement_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>

<style scoped>
.eng-dl {
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
}
.eng-dl > div {
  display: grid;
  grid-template-columns: minmax(8.5rem, auto) 1fr;
  gap: 0.75rem 1rem;
  align-items: baseline;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 0.35rem;
}
.eng-dl dt {
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}
.eng-dl dd {
  margin: 0;
  text-align: right;
  word-break: break-word;
}
</style>
