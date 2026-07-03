<template>
  <div class="flex h-full flex-col">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-semibold text-gray-800 dark:text-gray-100">{{ pt('ringTable.title') }}</h3>
      <el-switch
        :model-value="advanced"
        size="small"
        inline-prompt
        :active-text="pt('ringTable.advanced')"
        :inactive-text="pt('ringTable.simple')"
        @change="$emit('update:advanced', $event)"
      />
    </div>
    <p class="mb-2 text-xs text-gray-500">
      {{ pt('ringTable.hint') }}
    </p>

    <div class="min-h-0 flex-1 overflow-x-auto">
      <el-table
        :data="rings"
        size="default"
        border
        row-key="uid"
        class="ring-param-table"
        :empty-text="pt('ringTable.empty')"
        table-layout="auto"
      >
        <el-table-column width="40" align="center">
          <template #default="{ $index }">
            <span
              class="cursor-grab select-none text-lg text-gray-400 active:cursor-grabbing"
              draggable="true"
              :title="pt('ringTable.dragSort')"
              @dragstart="onDragStart($index, $event)"
              @dragend="onDragEnd"
              @dragover.prevent
              @drop.prevent="onDrop($index)"
            >⠿</span>
          </template>
        </el-table-column>
        <el-table-column :label="pt('ringTable.ringName')" min-width="80">
          <template #default="{ row, $index }">
            <el-input
              v-model="row.name"
              size="default"
              :placeholder="`A${$index + 1}`"
              :class="{ 'ring-error': invalid(row, 'name') }"
            />
          </template>
        </el-table-column>
        <el-table-column :label="pt('ringTable.nominal', { unit })" min-width="108">
          <template #default="{ row }">
            <el-input-number
              v-model="row.size"
              size="default"
              :precision="2"
              :controls="true"
              controls-position="right"
              class="ring-num-input"
              :class="{ 'ring-error': invalid(row, 'size') }"
            />
          </template>
        </el-table-column>
        <el-table-column label="ES" min-width="108">
          <template #default="{ row }">
            <el-input-number
              v-model="row.es"
              size="default"
              :precision="3"
              :step="0.01"
              :controls="true"
              controls-position="right"
              class="ring-num-input"
              @change="onEsEiChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="EI" min-width="108">
          <template #default="{ row }">
            <el-input-number
              v-model="row.ei"
              size="default"
              :precision="3"
              :step="0.01"
              :controls="true"
              controls-position="right"
              class="ring-num-input"
              @change="onEsEiChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="pt('ringTable.type')" min-width="108">
          <template #default="{ row }">
            <el-select
              v-model="row.type"
              size="default"
              class="ring-type-select"
              @change="onTypeChange(row)"
            >
              <el-option value="increasing" :label="pt('ringTable.increasing')" />
              <el-option value="decreasing" :label="pt('ringTable.decreasing')" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column v-if="advanced" :label="pt('ringTable.factorK')" min-width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.factor"
              size="default"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="2"
              :controls="true"
              controls-position="right"
              class="ring-num-input"
            />
          </template>
        </el-table-column>
        <el-table-column :label="pt('ringTable.contribution')" min-width="120">
          <template #default="{ row }">
            <div class="flex min-w-[100px] items-center gap-2">
              <el-progress
                :percentage="contributionMap[row.uid] ?? 0"
                :stroke-width="10"
                :show-text="false"
                class="min-w-[48px] flex-1"
              />
              <span class="shrink-0 font-mono text-xs">
                {{ (contributionMap[row.uid] ?? 0).toFixed(0) }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="44" align="center">
          <template #default="{ $index }">
            <el-button type="danger" text size="default" @click="$emit('remove', $index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-button
      type="primary"
      plain
      class="mt-3 w-full"
      :disabled="rings.length >= 50"
      @click="$emit('add')"
    >
      {{ pt('ringTable.addRing') }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { calcRingContributions, syncToleranceFromEsEi } from '@/utils/ring-tolerance'
import { useCalcPage } from '@/composables/useCalcPage'

const props = defineProps({
  rings: { type: Array, required: true },
  unit: { type: String, default: 'mm' },
  showValidation: { type: Boolean, default: false },
  closedDirection: { type: String, default: 'right' },
  advanced: { type: Boolean, default: false },
})

const emit = defineEmits(['add', 'remove', 'reorder', 'update:advanced'])

const { pt } = useCalcPage('editor')

const dragFromIndex = ref(null)

const contributionMap = computed(() => {
  const list = calcRingContributions(props.rings)
  return Object.fromEntries(list.map((c) => [c.uid, c.percent]))
})

function invalid(row, field) {
  if (!props.showValidation) return false
  if (field === 'name') return !row.name?.trim()
  if (field === 'size') return row.size == null
  return false
}

function onEsEiChange(row) {
  syncToleranceFromEsEi(row)
}

function onTypeChange(row) {
  row.direction = row.type === 'increasing' ? props.closedDirection : opposite(props.closedDirection)
}

function opposite(dir) {
  const map = { left: 'right', right: 'left', up: 'down', down: 'up' }
  return map[dir] ?? 'left'
}

function onDragStart(index, event) {
  dragFromIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
}

function onDrop(toIndex) {
  const from = dragFromIndex.value
  if (from == null || from === toIndex) return
  emit('reorder', { from, to: toIndex })
  dragFromIndex.value = null
}

function onDragEnd() {
  dragFromIndex.value = null
}
</script>

<style scoped>
.ring-param-table {
  width: 100%;
}

.dark .ring-param-table :deep(.el-table) {
  --el-table-bg-color: rgb(31 41 55);
  --el-table-tr-bg-color: rgb(31 41 55);
  --el-table-header-bg-color: rgb(17 24 39);
  --el-table-row-hover-bg-color: rgb(55 65 81);
  --el-table-border-color: rgb(75 85 99);
  --el-table-text-color: rgb(229 231 235);
  --el-table-header-text-color: rgb(156 163 175);
}

.dark .ring-param-table :deep(.el-input__wrapper) {
  background-color: rgb(31 41 55);
}

.ring-param-table :deep(.el-table__cell) {
  padding: 8px 6px;
}

.ring-param-table :deep(.ring-num-input) {
  width: 100%;
  min-width: 96px;
}

.ring-param-table :deep(.ring-num-input .el-input) {
  width: 100%;
}

.ring-param-table :deep(.ring-num-input .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 36px;
}

.ring-param-table :deep(.ring-num-input .el-input__inner) {
  text-align: left;
}

.ring-param-table :deep(.ring-type-select) {
  width: 100%;
  min-width: 96px;
}

:deep(.ring-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e74c3c inset;
}

@media (max-width: 768px) {
  .ring-param-table :deep(.ring-num-input) {
    min-width: 88px;
  }
}
</style>
