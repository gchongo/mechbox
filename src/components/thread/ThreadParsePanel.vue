<template>
  <div class="thread-parse-panel">
    <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pt('parseIntro') }}</p>

    <el-input
      v-model="input"
      type="textarea"
      :rows="2"
      :placeholder="pt('parsePlaceholder')"
      clearable
      class="mb-3"
    />

    <div class="mb-4 flex flex-wrap gap-2">
      <el-button
        v-for="ex in examples"
        :key="ex"
        size="small"
        @click="applyExample(ex)"
      >
        {{ ex }}
      </el-button>
    </div>

    <el-button type="primary" :disabled="!input.trim()" @click="runParse">{{ pt('parseBtn') }}</el-button>

    <template v-if="result">
      <el-alert
        v-if="!result.system && !result.matchedRows.length"
        class="mt-4"
        type="info"
        :closable="false"
        show-icon
        :title="pt('parseUnknown')"
      />

      <section v-else class="mt-6 card-panel !p-4">
        <h3 class="mb-3 font-semibold">{{ pt('parseResultTitle') }}</h3>

        <dl class="parse-fields">
          <div v-if="result.system">
            <dt>{{ pt('parseFieldSystem') }}</dt>
            <dd>{{ systemLabel(result.system) }}</dd>
          </div>
          <div v-if="result.nominal != null">
            <dt>{{ pt('detailNominal') }}</dt>
            <dd>{{ result.nominal }}</dd>
          </div>
          <div v-if="result.pitch != null">
            <dt>{{ pt('colPitch') }}</dt>
            <dd>{{ result.pitch }} mm</dd>
          </div>
          <div v-if="result.tpi != null">
            <dt>TPI</dt>
            <dd>{{ result.tpi }}（P ≈ {{ tpiToPitch(result.tpi) }} mm）</dd>
          </div>
          <div v-if="result.toleranceExternal">
            <dt>{{ pt('colToleranceExt') }}</dt>
            <dd>{{ result.toleranceExternal }}</dd>
          </div>
          <div v-if="result.toleranceInternal">
            <dt>{{ pt('colToleranceInt') }}</dt>
            <dd>{{ result.toleranceInternal }}</dd>
          </div>
          <div v-if="result.hand">
            <dt>{{ pt('parseFieldHand') }}</dt>
            <dd>{{ result.hand === 'LH' ? pt('parseLeftHand') : pt('parseRightHand') }}</dd>
          </div>
        </dl>

        <div v-if="result.segments.length" class="mt-4">
          <h4 class="mb-2 text-sm font-medium">{{ pt('detailMarkExplain') }}</h4>
          <div class="space-y-2">
            <div
              v-for="(seg, i) in result.segments"
              :key="i"
              class="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
            >
              <span class="font-mono text-primary">{{ seg.text }}</span>
              <p class="mt-1 text-xs text-gray-500">{{ pt(`parseRole_${seg.role}`) }}</p>
            </div>
          </div>
        </div>

        <div v-if="result.matchedRows.length" class="mt-4">
          <h4 class="mb-2 text-sm font-medium">{{ pt('parseMatches') }} ({{ result.matchedRows.length }})</h4>
          <div class="flex flex-wrap gap-2">
            <el-button
              v-for="row in result.matchedRows"
              :key="row.id"
              size="small"
              type="primary"
              plain
              @click="$emit('locate', row)"
            >
              {{ row.designation }}
            </el-button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { parseThreadMark, tpiToPitch } from '@/utils/thread-standards'

const props = defineProps({
  pt: { type: Function, required: true },
})

defineEmits(['locate'])

const input = ref('')
const result = ref(null)

const examples = [
  'M10×1.5-6g',
  'M10',
  '1/4-20 UNC-2A',
  '1/2-14 NPT',
  'G1/2',
  'R1/2',
]

function applyExample(ex) {
  input.value = ex
  runParse()
}

function runParse() {
  result.value = parseThreadMark(input.value)
}

function systemLabel(id) {
  const v = props.pt(`system_${id}`)
  return v !== `calc.pages.thread-table.system_${id}` ? v : id
}
</script>

<style scoped>
.parse-fields {
  display: grid;
  gap: 0.35rem;
  font-size: 0.8125rem;
}
.parse-fields > div {
  display: grid;
  grid-template-columns: 6rem 1fr;
  gap: 0.5rem;
}
.parse-fields dt {
  color: var(--el-text-color-secondary);
}
.parse-fields dd {
  margin: 0;
}
</style>
