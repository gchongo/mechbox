<template>
  <div>
    <h1 class="page-title">常见问题</h1>
    <p class="mb-6 text-gray-600">尺寸链分析与 MechBox 使用 FAQ</p>

    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item
        v-for="item in FAQ_ITEMS"
        :key="item.id"
        :title="item.q"
        :name="item.id"
      >
        <p class="leading-relaxed text-gray-600">{{ item.a }}</p>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { FAQ_ITEMS } from '@/constants/faq'

const activeNames = ref(1)
</script>
