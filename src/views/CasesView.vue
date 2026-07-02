<template>
  <div>
    <h1 class="page-title">案例库</h1>
    <p class="mb-6 text-gray-600">预设尺寸链分析案例，点击加载到编辑器</p>
    <div class="grid gap-4 md:grid-cols-2">
      <div
        v-for="item in cases"
        :key="item.id"
        class="card-panel cursor-pointer transition-shadow hover:shadow-md"
        @click="loadCase(item)"
      >
        <h3 class="font-medium">{{ item.title }}</h3>
        <p class="mt-2 text-sm text-gray-600">{{ item.desc }}</p>
        <el-tag size="small" class="mt-3">{{ item.type }}</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const cases = [
  {
    id: 1,
    title: '齿轮装配间隙',
    desc: '挡环 + 齿轮 + 轴径组成的典型 1D 尺寸链',
    type: '1D 线性',
    typeId: 'gear-gap',
  },
  {
    id: 2,
    title: '轴承配合公差',
    desc: '轴承内圈与轴的过盈配合分析',
    type: '1D 线性',
    typeId: 'bearing-fit',
  },
  {
    id: 3,
    title: '垫片厚度叠加',
    desc: '多垫片厚度叠加对间隙的影响',
    type: '1D 线性',
    typeId: 'shim-thickness',
  },
  {
    id: 4,
    title: '轴径公差链',
    desc: '阶梯轴各段尺寸公差叠加',
    type: '1D 线性',
    typeId: 'shaft-tolerance',
  },
]

function loadCase(item) {
  router.push({ name: 'editor', query: { type: item.typeId } })
}
</script>
