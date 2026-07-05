<template>
  <nav class="thread-nav" :aria-label="pt('navSidebarTitle')">
    <p class="thread-nav__hint">{{ pt('navSidebarHint') }}</p>

    <section v-if="favoriteItems.length" class="thread-nav-favorites">
      <p class="thread-nav-favorites__title">{{ pt('favSection') }}</p>
      <ul class="thread-nav-list">
        <li v-for="item in favoriteItems" :key="item.id">
          <button type="button" class="thread-nav-item" @click="onFavorite(item.id)">
            <span class="thread-nav-item__label">★ {{ item.label }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section v-for="group in groups" :key="group.id" class="thread-nav-group">
      <button
        type="button"
        class="thread-nav-group__head"
        :class="{ 'is-expanded': expanded[group.id] }"
        :aria-expanded="expanded[group.id]"
        @click="toggleGroup(group.id)"
      >
        <span class="thread-nav-group__icon" aria-hidden="true">{{ group.icon }}</span>
        <span class="thread-nav-group__title">{{ pt(group.titleKey) }}</span>
        <span class="thread-nav-group__chevron" aria-hidden="true">{{ expanded[group.id] ? '▾' : '▸' }}</span>
      </button>

      <div v-show="expanded[group.id]" class="thread-nav-group__body">
        <template v-if="group.id === 'catalog'">
          <div v-for="purpose in purposeOrder" :key="purpose" class="thread-nav-subgroup">
            <button
              type="button"
              class="thread-nav-subgroup__head"
              :class="{ 'is-expanded': expandedPurpose[purpose] }"
              :aria-expanded="expandedPurpose[purpose]"
              @click="togglePurpose(purpose)"
            >
              <span>{{ pt(`cat_${purpose}`) }}</span>
              <span class="thread-nav-subgroup__chevron" aria-hidden="true">
                {{ expandedPurpose[purpose] ? '▾' : '▸' }}
              </span>
            </button>
            <ul v-show="expandedPurpose[purpose]" class="thread-nav-list">
              <li v-for="sys in systemsByPurpose[purpose]" :key="sys.id">
                <button
                  type="button"
                  class="thread-nav-item"
                  :class="{ 'is-active': isCatalogActive(purpose, sys.id) }"
                  @click="selectCatalog(purpose, sys.id)"
                >
                  <span class="thread-nav-item__label">{{ pt(`ts_${sys.id}_name`) }}</span>
                  <span
                    class="thread-nav-item__dot"
                    :class="sys.implemented ? 'is-catalog' : 'is-ref'"
                    :title="sys.implemented ? pt('catalogBadge_yes') : pt('catalogBadge_ref')"
                  />
                </button>
              </li>
            </ul>
          </div>
        </template>

        <ul v-else-if="group.id === 'design'" class="thread-nav-list thread-nav-list--flat">
          <li v-for="item in designItems" :key="item.id">
            <button
              type="button"
              class="thread-nav-item"
              :class="{ 'is-active': isDesignActive(item.id) }"
              @click="selectDesign(item.id)"
            >
              <span class="thread-nav-item__step">{{ item.step }}</span>
              <span class="thread-nav-item__label">{{ pt(item.labelKey) }}</span>
            </button>
          </li>
        </ul>

        <ul v-else-if="group.id === 'tools'" class="thread-nav-list thread-nav-list--flat">
          <li v-for="item in toolItems" :key="item.id">
            <button
              type="button"
              class="thread-nav-item"
              :class="{ 'is-active': isToolsActive(item.id) }"
              @click="selectTools(item.id)"
            >
              <span class="thread-nav-item__label">{{ pt(item.labelKey) }}</span>
              <el-badge
                v-if="item.id === 'compare' && compareCount"
                :value="compareCount"
                class="thread-nav-item__badge"
              />
            </button>
          </li>
        </ul>
      </div>
    </section>

    <div class="thread-nav-footer">
      <router-link to="/thread" class="thread-nav-footer__link">
        {{ pt('hubStrength') }} →
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { THREAD_PURPOSE_ORDER, getSystemsForPurpose } from '@/constants/thread-standards/taxonomy'

const props = defineProps({
  modelValue: { type: String, required: true },
  compareCount: { type: Number, default: 0 },
  favoriteItems: { type: Array, default: () => [] },
  pt: { type: Function, required: true },
})

const emit = defineEmits(['update:modelValue', 'open-favorite', 'nav-selected'])

const purposeOrder = THREAD_PURPOSE_ORDER

const groups = [
  { id: 'catalog', icon: '📋', titleKey: 'navCatalog' },
  { id: 'design', icon: '🧭', titleKey: 'navDesign' },
  { id: 'tools', icon: '🔍', titleKey: 'navTools' },
]

const designItems = [
  { id: 'wizard', step: '1', labelKey: 'designSubWizard' },
  { id: 'tolerance', step: '2', labelKey: 'devTabTolerance' },
  { id: 'engagement', step: '3', labelKey: 'devTabEngagement' },
  { id: 'tapDrill', step: '4', labelKey: 'devTabTapDrill' },
  { id: 'mfg', step: '5', labelKey: 'devTabMfg' },
]

const toolItems = [
  { id: 'parse', labelKey: 'tabParse' },
  { id: 'compare', labelKey: 'tabCompare' },
  { id: 'misconfig', labelKey: 'devTabMisconfig' },
  { id: 'glossary', labelKey: 'tabGlossary' },
]

const systemsByPurpose = computed(() =>
  Object.fromEntries(purposeOrder.map((p) => [p, getSystemsForPurpose(p)])),
)

const expanded = reactive({
  catalog: true,
  design: false,
  tools: false,
})

const expandedPurpose = reactive(
  Object.fromEntries(purposeOrder.map((p) => [p, p === 'fastener'])),
)

function parseNav(key) {
  const parts = key.split('|')
  return { mode: parts[0], a: parts[1], b: parts[2] }
}

function syncExpansionFromNav(key) {
  const { mode, a } = parseNav(key)
  expanded.catalog = mode === 'catalog'
  expanded.design = mode === 'design'
  expanded.tools = mode === 'tools'
  if (mode === 'catalog' && a) {
    expandedPurpose[a] = true
  }
}

watch(
  () => props.modelValue,
  (key) => syncExpansionFromNav(key),
  { immediate: true },
)

function toggleGroup(id) {
  expanded[id] = !expanded[id]
}

function togglePurpose(purpose) {
  expandedPurpose[purpose] = !expandedPurpose[purpose]
}

function isCatalogActive(purpose, systemId) {
  const { mode, a, b } = parseNav(props.modelValue)
  return mode === 'catalog' && a === purpose && b === systemId
}

function isDesignActive(id) {
  const { mode, a } = parseNav(props.modelValue)
  return mode === 'design' && a === id
}

function isToolsActive(id) {
  const { mode, a } = parseNav(props.modelValue)
  return mode === 'tools' && a === id
}

function selectCatalog(purpose, systemId) {
  emit('update:modelValue', `catalog|${purpose}|${systemId}`)
  emit('nav-selected')
}

function selectDesign(id) {
  emit('update:modelValue', `design|${id}`)
  emit('nav-selected')
}

function selectTools(id) {
  emit('update:modelValue', `tools|${id}`)
  emit('nav-selected')
}

function onFavorite(id) {
  emit('open-favorite', id)
  emit('nav-selected')
}
</script>
