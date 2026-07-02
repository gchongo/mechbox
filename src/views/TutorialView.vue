<template>
  <div>
    <h1 class="page-title">教程</h1>
    <p class="mb-6 text-gray-600">尺寸链分析视频教程（占位，V1.0 将接入实际视频）</p>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="video in videos" :key="video.id" class="card-panel">
        <div class="mb-3 flex h-32 items-center justify-center rounded-lg bg-gray-100">
          <el-icon :size="48" class="text-primary"><VideoPlay /></el-icon>
        </div>
        <h3 class="font-medium">{{ video.title }}</h3>
        <p class="text-sm text-gray-500">{{ video.duration }} · {{ video.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const videos = [
  { id: 1, title: '尺寸链基础', duration: '5 分钟', desc: '封闭环与组成环概念' },
  { id: 2, title: '齿轮装配案例', duration: '10 分钟', desc: '实际装配间隙分析' },
  { id: 3, title: 'RSS 法详解', duration: '8 分钟', desc: '概率统计方法' },
  { id: 4, title: '极值法 vs RSS', duration: '6 分钟', desc: '两种方法对比' },
  { id: 5, title: '西格玛水平', duration: '7 分钟', desc: '质量水平评估' },
]
</script>
