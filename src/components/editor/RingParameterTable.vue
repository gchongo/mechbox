<template>
  <div class="flex h-full flex-col">
    <h3 class="mb-3 font-semibold text-gray-800 dark:text-gray-100">组成环参数 & 贡献度</h3>
    <p class="mb-3 text-xs text-gray-500">
      填写各环公称尺寸与上下偏差；类型决定增环(+)或减环(−)，贡献度表示该环对 RSS 总公差的影响比例
    </p>

    <div class="min-h-0 flex-1 overflow-x-auto">
      <el-table :data="rings" size="small" border empty-text="点击「添加组成环」开始">
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
        <el-table-column label="贡献%" min-width="120">
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
import { computed } from 'vue'
import { calcRingContributions, syncToleranceFromEsEi } from '@/utils/ring-tolerance'

const props = defineProps({
  rings: { type: Array, required: true },
  unit: { type: String, default: 'mm' },
  showValidation: { type: Boolean, default: false },
  closedDirection: { type: String, default: 'right' },
})

defineEmits(['add', 'remove', 'update-type'])

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
</script>
