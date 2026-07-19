<template>
  <div>
    <h1 class="page-title">{{ pt('title') }}</h1>
    <p class="mb-4 text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>

    <el-alert class="mb-4" type="info" show-icon :closable="false" :title="pr('disclaimer')" />

    <el-tabs v-model="tab">
      <el-tab-pane :label="pf('tabSymbols')" name="symbols">
        <div class="space-y-6">
          <section v-for="cat in GDT_CATEGORIES" :key="cat.id" class="card-panel">
            <h2 class="mb-3 font-semibold">{{ locale === 'en' ? cat.labelEn : cat.labelZh }}</h2>
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="s in cat.symbols"
                :key="s.id"
                class="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-gray-50 font-mono text-2xl dark:bg-gray-900"
                  aria-hidden="true"
                >
                  {{ s.glyph }}
                </div>
                <div class="min-w-0">
                  <p class="font-medium">{{ locale === 'en' ? s.nameEn : s.nameZh }}</p>
                  <p class="mt-1 text-xs text-gray-500">{{ locale === 'en' ? s.nameZh : s.noteZh }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabModifiers')" name="modifiers">
        <section class="card-panel">
          <el-table :data="GDT_MODIFIERS" size="small" border>
            <el-table-column :label="pr('colGlyph')" width="80" align="center">
              <template #default="{ row }">
                <span class="font-mono text-xl">{{ row.glyph }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="pr('colName')">
              <template #default="{ row }">
                {{ locale === 'en' ? row.nameEn : row.nameZh }}
              </template>
            </el-table-column>
          </el-table>
          <h3 class="mb-2 mt-6 font-semibold">{{ pf('datumTitle') }}</h3>
          <el-table :data="GDT_DATUM" size="small" border>
            <el-table-column :label="pr('colGlyph')" width="80" align="center">
              <template #default="{ row }">
                <span class="font-mono text-xl">{{ row.glyph }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="pr('colName')">
              <template #default="{ row }">
                {{ locale === 'en' ? row.nameEn : row.nameZh }}
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-tab-pane>

      <el-tab-pane :label="pf('tabFrame')" name="frame">
        <section class="card-panel">
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ pr('frameHint') }}</p>
          <svg class="mx-auto block max-w-full" viewBox="0 0 420 90" role="img" :aria-label="pr('frameAria')">
            <rect x="10" y="20" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="35" y="52" text-anchor="middle" font-size="28" fill="currentColor">⌖</text>
            <rect x="60" y="20" width="70" height="50" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="95" y="52" text-anchor="middle" font-size="18" fill="currentColor">Ø0.1</text>
            <rect x="130" y="20" width="40" height="50" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="150" y="52" text-anchor="middle" font-size="20" fill="currentColor">Ⓜ</text>
            <rect x="170" y="20" width="40" height="50" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="190" y="52" text-anchor="middle" font-size="20" fill="currentColor">A</text>
            <rect x="210" y="20" width="40" height="50" fill="none" stroke="currentColor" stroke-width="2" />
            <text x="230" y="52" text-anchor="middle" font-size="20" fill="currentColor">B</text>
            <text x="280" y="48" font-size="12" fill="#64748b">{{ pr('frameLegend') }}</text>
          </svg>
          <div class="mt-4 flex flex-wrap gap-2">
            <router-link class="text-sm text-primary" to="/gdt-stack">{{ pf('gotoGdtStack') }} →</router-link>
            <router-link class="text-sm text-primary" to="/editor">{{ pf('gotoEditor') }} →</router-link>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>

    <RelatedToolsPanel tool-id="gdt-symbols" class="mt-4" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { GDT_CATEGORIES, GDT_MODIFIERS, GDT_DATUM } from '@/constants/gdt-symbols'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, pf, pr } = useCalcPage('gdt-symbols')
const { locale: localeRef } = useI18n()
const locale = computed(() => (String(localeRef.value || 'zh').startsWith('en') ? 'en' : 'zh'))
const tab = ref('symbols')
</script>
