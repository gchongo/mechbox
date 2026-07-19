<template>
  <div class="std-catalog">
    <header class="mb-6">
      <h1 class="page-title">{{ pt('title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ pt('subtitle') }}</p>
    </header>

    <div class="std-toolbar card-panel mb-6">
      <el-input
        v-model="query"
        clearable
        size="large"
        class="std-toolbar__search"
        :placeholder="pf('searchPh')"
        prefix-icon="Search"
      />
      <div class="std-toolbar__row">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in priorityFilters"
            :key="p.value"
            type="button"
            class="std-pill"
            :class="{ 'std-pill--on': priority === p.value }"
            @click="priority = p.value"
          >
            {{ p.label }}
            <span v-if="p.count != null" class="std-pill__n">{{ p.count }}</span>
          </button>
        </div>
        <p class="shrink-0 text-sm text-gray-400">
          {{ pf('matchCount', { n: filtered.length, total: priorityStats.total }) }}
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside class="card-panel h-fit">
        <h2 class="mb-3 text-sm font-semibold text-gray-500">{{ pf('sections') }}</h2>
        <nav class="flex flex-col gap-0.5">
          <button
            type="button"
            class="std-nav"
            :class="{ 'std-nav--on': sectionId === 'all' }"
            @click="sectionId = 'all'"
          >
            {{ pf('secAll') }}
          </button>
          <button
            v-for="sec in navSections"
            :key="sec.id"
            type="button"
            class="std-nav"
            :class="{ 'std-nav--on': sectionId === sec.id }"
            @click="sectionId = sec.id"
          >
            <span class="std-nav__label">{{ sec.titleZh }}</span>
            <span class="std-nav__n">{{ sectionCounts[sec.id] || 0 }}</span>
          </button>
        </nav>
      </aside>

      <div class="min-w-0 space-y-6">
        <section v-if="showPriorityLegend" class="card-panel">
          <h2 class="mb-3 font-semibold">{{ pf('priorityLegend') }}</h2>
          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="row in priorityLegend"
              :key="row.priority"
              class="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
            >
              <el-tag :type="priorityTagType(row.priority)" size="small" class="mb-1">{{ row.priority }}</el-tag>
              <p class="text-sm font-medium">{{ row.labelZh }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ row.handleZh }}</p>
            </div>
          </div>
        </section>

        <section v-if="showRules && !query && priority === 'all' && (sectionId === 'all' || sectionId === 'rules')" class="card-panel">
          <h2 class="mb-3 font-semibold">{{ pf('rulesTitle') }}</h2>
          <ul class="list-inside list-disc space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li v-for="(r, i) in rules" :key="i">{{ r.textZh }}</li>
          </ul>
        </section>

        <section
          v-for="group in grouped"
          :key="group.id"
          :id="`sec-${group.id}`"
          class="card-panel"
        >
          <div class="std-sec-head">
            <div class="min-w-0">
              <h2 class="std-sec-head__title">{{ group.titleZh }}</h2>
              <p v-if="group.noteZh" class="mt-1 text-xs text-gray-500">{{ group.noteZh }}</p>
            </div>
            <span class="std-sec-head__count">{{ group.items.length }}</span>
          </div>

          <div v-if="group.kind === 'legacy'" class="overflow-x-auto">
            <table class="std-table">
              <thead>
                <tr>
                  <th>{{ pf('colTopic') }}</th>
                  <th>{{ pf('colLegacy') }}</th>
                  <th>{{ pf('colCurrent') }}</th>
                  <th>{{ pf('colNote') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="it in group.items" :key="it.id">
                  <td>{{ it.topicZh }}</td>
                  <td class="font-mono text-sm">{{ it.legacyZh }}</td>
                  <td class="font-mono text-sm text-primary">{{ it.currentZh }}</td>
                  <td class="text-gray-500">{{ it.noteZh }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ul v-else class="std-grid">
            <li v-for="it in group.items" :key="it.id" class="std-card">
              <div class="std-card__head">
                <p class="std-card__code">{{ it.code }}</p>
                <span class="std-badge" :class="priorityBadgeClass(it.priority)">{{ it.priority }}</span>
              </div>
              <p v-if="it.topicZh" class="std-card__topic">{{ it.topicZh }}</p>
              <p v-if="it.useZh" class="std-card__use">{{ it.useZh }}</p>
            </li>
          </ul>
        </section>

        <el-empty v-if="!grouped.length" :description="pf('empty')" />
      </div>
    </div>

    <RelatedToolsPanel tool-id="standards-catalog" class="mt-6" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  STANDARDS_CATALOG_SECTIONS,
  searchStandardsCatalog,
  countByPriority,
} from '@/constants/standards-catalog'
import RelatedToolsPanel from '@/components/calc/RelatedToolsPanel.vue'
import { useCalcPage } from '@/composables/useCalcPage'

const { pt, pf } = useCalcPage('standards-catalog')

const route = useRoute()
const router = useRouter()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const priority = ref(typeof route.query.p === 'string' ? route.query.p : 'all')
const sectionId = ref(typeof route.query.sec === 'string' ? route.query.sec : 'all')

const priorityStats = computed(() => countByPriority())
const priorityLegend = computed(
  () => STANDARDS_CATALOG_SECTIONS.find((s) => s.kind === 'priority')?.items ?? [],
)
const rules = computed(() => STANDARDS_CATALOG_SECTIONS.find((s) => s.kind === 'rules')?.items ?? [])

const navSections = computed(() =>
  STANDARDS_CATALOG_SECTIONS.filter((s) => s.kind !== 'priority' && s.kind !== 'rules'),
)

const priorityFilters = computed(() => [
  { value: 'all', label: pf('priAll'), count: priorityStats.value.total },
  { value: 'P0', label: 'P0', count: priorityStats.value.P0 },
  { value: 'P1', label: 'P1', count: priorityStats.value.P1 },
  { value: 'P2', label: 'P2', count: priorityStats.value.P2 },
  { value: '待核验', label: pf('priVerify'), count: priorityStats.value['待核验'] },
])

const filtered = computed(() =>
  searchStandardsCatalog({
    query: query.value,
    priority: priority.value,
    sectionId: sectionId.value === 'rules' ? 'all' : sectionId.value,
  }),
)

const sectionCounts = computed(() => {
  const base = searchStandardsCatalog({ query: query.value, priority: priority.value, sectionId: 'all' })
  const map = {}
  for (const it of base) {
    map[it.sectionId] = (map[it.sectionId] || 0) + 1
  }
  return map
})

const grouped = computed(() => {
  const map = new Map()
  for (const it of filtered.value) {
    if (!map.has(it.sectionId)) {
      const sec = STANDARDS_CATALOG_SECTIONS.find((s) => s.id === it.sectionId)
      map.set(it.sectionId, {
        id: it.sectionId,
        titleZh: it.sectionTitleZh,
        noteZh: sec?.noteZh || '',
        kind: it.kind,
        items: [],
      })
    }
    map.get(it.sectionId).items.push(it)
  }
  const order = navSections.value.map((s) => s.id)
  return [...map.values()].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
})

const showPriorityLegend = computed(
  () => !query.value && priority.value === 'all' && (sectionId.value === 'all' || sectionId.value === 'priority'),
)
const showRules = computed(() => true)

function priorityTagType(p) {
  if (p === 'P0') return 'danger'
  if (p === 'P1') return 'warning'
  if (p === 'P2') return 'info'
  return ''
}

function priorityBadgeClass(p) {
  if (p === 'P0') return 'std-badge--p0'
  if (p === 'P1') return 'std-badge--p1'
  if (p === 'P2') return 'std-badge--p2'
  return 'std-badge--verify'
}

watch([query, priority, sectionId], () => {
  const q = {}
  if (query.value) q.q = query.value
  if (priority.value !== 'all') q.p = priority.value
  if (sectionId.value !== 'all') q.sec = sectionId.value
  router.replace({ query: q })
})
</script>

<style scoped>
.std-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 999px;
  border: 1px solid rgb(209 213 219);
  background: transparent;
  padding: 0.35rem 0.85rem;
  font-size: 0.8125rem;
  color: rgb(75 85 99);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
:global(.dark) .std-pill {
  border-color: rgb(55 65 81);
  color: rgb(156 163 175);
}
.std-pill--on {
  border-color: rgb(64 158 255);
  background: rgb(64 158 255 / 0.12);
  color: rgb(64 158 255);
  font-weight: 600;
}
.std-pill__n {
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
  font-size: 0.75rem;
}
.std-nav {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  border-radius: 0.5rem;
  padding: 0.45rem 0.65rem;
  text-align: left;
  font-size: 0.8125rem;
  color: rgb(75 85 99);
  transition: background 0.15s, color 0.15s;
}
.std-nav__label {
  min-width: 0;
  line-height: 1.4;
  word-break: break-word;
}
.std-nav__n {
  margin-top: 0.1rem;
}
:global(.dark) .std-nav {
  color: rgb(156 163 175);
}
.std-nav:hover {
  background: rgb(243 244 246);
}
:global(.dark) .std-nav:hover {
  background: rgb(31 41 55);
}
.std-nav--on {
  background: rgb(64 158 255 / 0.12);
  color: rgb(64 158 255);
  font-weight: 600;
}
.std-nav__n {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-size: 0.7rem;
  opacity: 0.65;
}
.std-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.std-toolbar__search {
  max-width: 40rem;
}
.std-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}
.std-sec-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgb(229 231 235);
}
:global(.dark) .std-sec-head {
  border-color: rgb(55 65 81);
}
.std-sec-head__title {
  position: relative;
  padding-left: 0.75rem;
  font-weight: 600;
}
.std-sec-head__title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.2em;
  bottom: 0.2em;
  width: 3px;
  border-radius: 2px;
  background: rgb(64 158 255);
}
.std-sec-head__count {
  flex-shrink: 0;
  border-radius: 999px;
  background: rgb(64 158 255 / 0.1);
  color: rgb(64 158 255);
  font-size: 0.7rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  padding: 0.15rem 0.6rem;
}
.std-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 1fr;
}
@media (min-width: 768px) {
  .std-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.std-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.65rem;
  padding: 0.75rem 0.9rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.std-card:hover {
  border-color: rgb(64 158 255 / 0.55);
  box-shadow: 0 1px 6px rgb(64 158 255 / 0.08);
}
:global(.dark) .std-card {
  border-color: rgb(55 65 81);
}
:global(.dark) .std-card:hover {
  border-color: rgb(64 158 255 / 0.55);
}
.std-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.std-card__code {
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: rgb(64 158 255);
}
.std-card__topic {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.std-card__use {
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}
.std-badge {
  flex-shrink: 0;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  letter-spacing: 0.02em;
}
.std-badge--p0 {
  background: rgb(245 108 108 / 0.14);
  color: rgb(245 108 108);
}
.std-badge--p1 {
  background: rgb(230 162 60 / 0.16);
  color: rgb(217 140 30);
}
.std-badge--p2 {
  background: rgb(144 147 153 / 0.16);
  color: rgb(120 124 130);
}
:global(.dark) .std-badge--p2 {
  color: rgb(160 165 172);
}
.std-badge--verify {
  background: rgb(103 194 58 / 0.14);
  color: rgb(103 194 58);
}
.std-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.std-table th,
.std-table td {
  border-bottom: 1px solid rgb(229 231 235);
  padding: 0.65rem 0.5rem;
  text-align: left;
  vertical-align: top;
}
:global(.dark) .std-table th,
:global(.dark) .std-table td {
  border-color: rgb(55 65 81);
}
.std-table th {
  color: rgb(107 114 128);
  font-weight: 600;
  white-space: nowrap;
}
</style>
