<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-tabs v-model="tab">
      <el-tab-pane :label="pf('tabKey')" name="key">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('shaftDiameter') }}</h2>
            <el-input-number v-model="shaftD" :min="6" :max="200" />
            <p class="mt-3 text-sm">
              {{ pf('suggestedKey') }}:
              <span class="font-mono text-primary">{{ keyRow.width }} × {{ keyRow.height }} mm</span>
            </p>
            <p class="mt-2 text-xs text-gray-500">{{ pr('keyNote') }}</p>
            <router-link class="mt-3 inline-block text-sm text-primary" to="/key">{{ pf('gotoKeyCalc') }} →</router-link>
          </section>
          <section class="card-panel">
            <el-table :data="KEY_SIZE_TABLE" size="small" border max-height="360">
              <el-table-column :label="pr('colShaftRange')" min-width="100">
                <template #default="{ row }">{{ row.dMin }}–{{ row.dMax }}</template>
              </el-table-column>
              <el-table-column prop="width" :label="pr('colKeyB')" width="80" />
              <el-table-column prop="height" :label="pr('colKeyH')" width="80" />
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabPin')" name="pin">
        <div class="grid gap-6 lg:grid-cols-2">
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('pinDiameter') }}</h2>
            <el-select v-model="pinD" class="w-40" filterable>
              <el-option v-for="d in PIN_DIAMETER_SERIES" :key="d" :label="`${d} mm`" :value="d" />
            </el-select>
            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('pinLength') }}</dt>
                <dd class="font-mono">
                  {{ pinLen.min.toFixed(1) }}–{{ pinLen.max.toFixed(1) }}
                  (≈ {{ pinLen.typical.toFixed(1) }}) mm
                </dd>
              </div>
            </dl>
            <el-table :data="PIN_FIT_HINTS" size="small" border class="mt-4">
              <el-table-column prop="fit" :label="pr('colFit')" width="100" />
              <el-table-column prop="use" :label="pr('colUse')" />
              <el-table-column prop="note" :label="pr('colNote')" />
            </el-table>
            <router-link class="mt-3 inline-block text-sm text-primary" to="/pin-retainer">{{ pf('gotoPinCalc') }} →</router-link>
          </section>
          <section class="card-panel">
            <h2 class="mb-3 font-semibold">{{ pf('tabRing') }}</h2>
            <el-input-number v-model="ringShaft" :min="8" :max="50" :step="1" />
            <dl class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('ringGroove') }}</dt>
                <dd class="font-mono">Ø {{ ringRow.grooveDia }} mm</dd>
              </div>
              <div class="flex justify-between rounded bg-gray-50 p-2 dark:bg-gray-900">
                <dt>{{ pr('ringThickness') }}</dt>
                <dd class="font-mono">{{ ringRow.thickness }} mm</dd>
              </div>
            </dl>
            <el-table :data="RETAINING_RING_SHAFT" size="small" border class="mt-4" max-height="280">
              <el-table-column prop="shaft" :label="pr('colShaft')" width="80" />
              <el-table-column prop="grooveDia" :label="pr('colGroove')" width="100" />
              <el-table-column prop="thickness" :label="pr('colThick')" width="80" />
            </el-table>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabOring')" name="oring">
        <section class="card-panel">
          <el-table :data="ORING_SECTION_GUIDE" size="small" border>
            <el-table-column prop="label" :label="pr('colSection')" min-width="160" />
            <el-table-column prop="cs" :label="pr('colCs')" width="90" />
            <el-table-column prop="staticCompression" :label="pr('colStatic')" width="110" />
            <el-table-column prop="dynamicCompression" :label="pr('colDynamic')" width="110" />
            <el-table-column prop="typicalGroove" :label="pr('colGrooveHint')" min-width="160" />
          </el-table>
          <p class="mt-3 text-xs text-gray-500">{{ pr('oringNote') }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <el-tag v-for="(m, id) in ORING_MATERIALS" :key="id" size="small">
              {{ m.label }} · ≤{{ m.maxTemp }}°C
            </el-tag>
          </div>
          <router-link class="mt-3 inline-block text-sm text-primary" to="/o-ring">{{ pf('gotoOringCalc') }} →</router-link>
        </section>
      </el-tab-pane>
    </el-tabs>

    <RelatedToolsPanel tool-id="standards-ref" class="mt-4" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  KEY_SIZE_TABLE,
  lookupKeySize,
  PIN_DIAMETER_SERIES,
  PIN_FIT_HINTS,
  ORING_SECTION_GUIDE,
  ORING_MATERIALS,
  RETAINING_RING_SHAFT,
  lookupPinLength,
  lookupRetainingRing,
} from '@/constants/standards-ref'
import { useCalcPage } from '@/composables/useCalcPage'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'

const { pt, pf, pr } = useCalcPage('standards-ref')
const tab = ref('key')
const shaftD = ref(30)
const pinD = ref(10)
const ringShaft = ref(20)

const keyRow = computed(() => lookupKeySize(shaftD.value))
const pinLen = computed(() => lookupPinLength(pinD.value))
const ringRow = computed(() => lookupRetainingRing(ringShaft.value))
</script>
