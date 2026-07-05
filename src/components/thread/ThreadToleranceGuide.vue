<template>
  <div class="thread-tolerance-guide">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('tolGuideIntro') }}</p>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card-panel">
        <el-form label-width="100px">
          <el-form-item :label="pt('detailSystem')">
            <el-select v-model="system" class="w-full">
              <el-option v-for="s in systems" :key="s" :label="systemLabel(s)" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item :label="pt('tolScenario')">
            <el-select v-model="scenarioId" class="w-full">
              <el-option
                v-for="sc in scenarios"
                :key="sc.id"
                :label="pt(sc.scenarioKey)"
                :value="sc.id"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <el-collapse class="mt-2">
          <el-collapse-item v-for="sc in scenarios" :key="sc.id" :title="pt(sc.scenarioKey)" :name="sc.id">
            <p class="text-sm">{{ pt(sc.detailKey) }}</p>
            <p class="mt-2 font-mono text-sm">
              {{ sc.internal }} / {{ sc.external }}
              <span v-if="sc.coatedExternal"> · {{ pt('tolCoated') }}: {{ sc.coatedExternal }}</span>
            </p>
          </el-collapse-item>
        </el-collapse>
      </section>

      <section ref="resultRef" class="card-panel">
        <template v-if="scenario">
          <h3 class="mb-3 font-semibold">{{ pt(scenario.scenarioKey) }}</h3>
          <dl class="tol-dl">
            <div><dt>{{ pt('detailSystem') }}</dt><dd>{{ systemLabel(system) }}</dd></div>
            <div><dt>{{ pt('colToleranceInt') }}</dt><dd class="font-mono">{{ scenario.internal }}</dd></div>
            <div><dt>{{ pt('colToleranceExt') }}</dt><dd class="font-mono">{{ scenario.external }}</dd></div>
            <div v-if="scenario.coatedExternal">
              <dt>{{ pt('tolCoatedExt') }}</dt><dd class="font-mono">{{ scenario.coatedExternal }}</dd>
            </div>
          </dl>
          <p class="mt-4 text-sm leading-relaxed">{{ pt(scenario.detailKey) }}</p>
          <p v-if="scenario.pitchHintKey" class="mt-2 text-sm text-warning">{{ pt(scenario.pitchHintKey) }}</p>
          <p class="mt-3 text-xs text-gray-500">{{ pt(scenario.standardKey) }}</p>
          <p class="mt-2 text-[10px] text-gray-400">{{ pt('tolDisclaimer') }}</p>
        </template>
        <el-button class="mt-4" type="primary" plain :disabled="!scenario" @click="exportPdf">
          {{ pt('exportPdf') }}
        </el-button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  getToleranceScenario,
  listScenariosForSystem,
} from '@/utils/thread-tolerance-guide'
import { exportToolReportPdf } from '@/utils/export'
import { buildTolerancePdfSections } from '@/utils/thread-table-report'

const props = defineProps({
  pt: { type: Function, required: true },
})

const systems = ['metric', 'unc', 'unf', 'npt', 'g', 'r']
const system = ref('metric')
const scenarioId = ref('general')
const resultRef = ref(null)

const scenarios = computed(() => listScenariosForSystem(system.value))

const scenario = computed(() => getToleranceScenario(scenarioId.value, system.value))

watch(system, (s) => {
  const list = listScenariosForSystem(s)
  if (!list.some((x) => x.id === scenarioId.value)) {
    scenarioId.value = list[0]?.id ?? 'general'
  }
})

function systemLabel(id) {
  const key = `system_${id}`
  const v = props.pt(key)
  return v !== `calc.pages.thread-table.${key}` ? v : id.toUpperCase()
}

async function exportPdf() {
  await exportToolReportPdf({
    title: props.pt('tolGuideTitle'),
    sections: buildTolerancePdfSections(scenario.value, system.value, props.pt),
    element: resultRef.value,
    filename: `thread_tolerance_${new Date().toISOString().slice(0, 10)}.pdf`,
  })
}
</script>

<style scoped>
.tol-dl {
  display: grid;
  gap: 0.5rem;
  font-size: 0.875rem;
}
.tol-dl > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.tol-dl dt {
  color: var(--el-text-color-secondary);
}
</style>
