<template>
  <div>
    <h1 class="page-title">{{ ct('faq.title') }}</h1>
    <p class="mb-6 text-gray-600">{{ ct('faq.subtitle') }}</p>

    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item
        v-for="item in faqItems"
        :key="item.id"
        :title="item.q"
        :name="item.id"
      >
        <p class="leading-relaxed text-gray-600"><MathContent :text="item.a" /></p>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useContentI18n } from '@/composables/useContentI18n'

const { ct, faqItems } = useContentI18n()
const activeNames = ref(1)
</script>
