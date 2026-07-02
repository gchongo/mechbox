<template>
  <div class="flex h-full flex-col">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-semibold text-gray-800 dark:text-gray-100">组成环参数 & 贡献度</h3>
      <el-switch
        :model-value="advanced"
        size="small"
        inline-prompt
        active-text="高级"
        inactive-text="简洁"
        @change="$emit('update:advanced', $event)"
      />
    </div>
    <p class="mb-3 text-xs text-gray-500">
      填写各环公称尺寸与上下偏差；类型决定增环(+)或减环(−)。拖拽左侧 ⠿ 可调整顺序。
    </p>

    <div class="min-h-0 flex-1 overflow-x-auto">
      <el-table
        :data="rings"
        size="small"
        border
        row-key="uid"
        empty-text="点击「添加组成环」开始"
      >
        <el-table-column width="40" align="center" fixed>
          <template #default="{ $index }">
            <span
              class="cursor-grab select-none text-base text-gray-400 active:cursor-grabbing"
              draggable="true"
              title="拖拽排序"
              @dragstart="onDragStart($index, $event)"
              @dragend="onDragEnd"
              @dragover.prevent
              @drop.prevent="onDrop($index)"
            >⠿</span>
          </template>
        </el-table-column>
        <el-table-column label="环名" width="72" fixed>
          <template #default="{ row, $index }">
            <el-input
              v-model="row.name"
              size="small"
              :placeholder="`A${$index + 1}`"
              :class="{ 'ring-error': invalid(row, 'name') }"
            />
          </template>
        </el-table-column>
        <el-table-column :label="`公称 (${unit})`" width="88">
          <template #default="{ row }">
            <el-input-number
              v-model="row.size"
              size="small"
              :precision="2"
              :controls="false"
              class="!w-full"
              :class="{ 'ring-error': invalid(row, 'size') }"
            />
          </template>
        </el-table-column>
        <el-table-column label="ES" width="76">
          <template #default="{ row }">
            <el-input-number
              v-model="row.es"
              size="small"
              :precision="3"
              :step="0.01"
              :controls="false"
              class="!w-full"
              @change="onEsEiChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="EI" width="76">
          <template #default="{ row }">
            <el-input-number
              v-model="row.ei"
              size="small"
              :precision="3"
              :step="0.01"
              :controls="false"
              class="!w-full"
              @change="onEsEiChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="72">
          <template #default="{ row }">
            <el-select
              v-model="row.type"
              size="small"
              @change="onTypeChange(row)"
            >
              <el-option value="increasing" label="+ 增环" />
              <el-option value="decreasing" label="− 减环" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column v-if="advanced" label="系数 k" width="76">
          <template #default="{ row }">
            <el-input-number
              v-model="row.factor"
              size="small"
              :min="0"
              :max="10"
              :step="0.1"
              :precision="2"
              :controls="false"
              class="!w-full"
            />
          </template>
        </el-table-column>
        <el-table-column label="贡献%" min-width="110">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-progress
                :percentage="contributionMap[row.uid] ?? 0"
                :stroke-width="10"
                :show-text="false"
                class="flex-1"
              />
              <span class="w-10 text-right font-mono text-xs">
                {{ (contributionMap[row.uid] ?? 0).toFixed(0) }}%
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="44" fixed="right">
          <template #default="{ $index }">
            <el-button type="danger" text size="small" @click="$emit('remove', $index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-button
      type="primary"
      plain
      class="mt-4 w-full"
      :disabled="rings.length >= 50"
      @click="$emit('add')"
    >
      + 添加组成环
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { calcRingContributions, syncToleranceFromEsEi } from '@/utils/ring-tolerance'

const props = defineProps({
  rings: { type: Array, required: true },
  unit: { type: String, default: 'mm' },
  showValidation: { type: Boolean, default: false },
  closedDirection: { type: String, default: 'right' },
  advanced: { type: Boolean, default: false },
})

const emit = defineEmits(['add', 'remove', 'reorder', 'update:advanced'])

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
:deep(.ring-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e74c3c inset;
}
</style>
