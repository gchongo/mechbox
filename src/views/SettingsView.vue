<template>
  <div>
    <h1 class="page-title">设置</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">偏好设置保存在本地浏览器，无需登录</p>

    <section class="card-panel max-w-xl">
      <el-form label-width="140px">
        <el-form-item label="界面主题">
          <el-radio-group v-model="form.theme">
            <el-radio value="light">浅色</el-radio>
            <el-radio value="dark">深色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认单位">
          <el-radio-group v-model="form.defaultUnit">
            <el-radio value="mm">mm</el-radio>
            <el-radio value="inch">inch</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认计算方法">
          <el-select v-model="form.defaultMethod" class="w-full">
            <el-option label="RSS 法" value="rss" />
            <el-option label="极值法" value="worst" />
            <el-option label="修正 RSS 法" value="modified-rss" />
            <el-option label="6σ RSS 法" value="sigma6-rss" />
          </el-select>
        </el-form-item>
        <el-form-item label="Monte Carlo 次数">
          <el-input-number v-model="form.mcIterations" :min="1000" :max="100000" :step="1000" />
        </el-form-item>
        <el-form-item label="数值精度（小数位）">
          <el-input-number v-model="form.numberPrecision" :min="0" :max="4" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存设置</el-button>
          <el-button @click="reset">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="card-panel mt-6 max-w-xl">
      <h2 class="mb-3 font-semibold">数据同步</h2>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        导出完整备份（历史 + 收藏 + 设置），可导入到其他浏览器或设备。
      </p>
      <div class="flex flex-wrap gap-2">
        <el-button @click="handleExportBackup">导出完整备份</el-button>
        <el-button @click="triggerImport">导入备份</el-button>
        <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />
      </div>
    </section>

    <section class="card-panel mt-6 max-w-xl">
      <h2 class="mb-3 font-semibold">数据管理</h2>
      <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
        分析历史保存在 localStorage，可在「历史记录」页导出或删除。
      </p>
      <router-link to="/history">
        <el-button>打开历史记录 →</el-button>
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from '@/utils/settings'
import { downloadBackup, importFullBackup } from '@/utils/backup'

const form = reactive({ ...DEFAULT_SETTINGS })
const fileInput = ref(null)

onMounted(() => {
  Object.assign(form, getSettings())
})

function save() {
  saveSettings({ ...form })
  ElMessage.success('设置已保存')
}

function reset() {
  Object.assign(form, DEFAULT_SETTINGS)
  saveSettings(DEFAULT_SETTINGS)
  ElMessage.info('已恢复默认设置')
}

function handleExportBackup() {
  downloadBackup()
  ElMessage.success('备份已下载')
}

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const result = importFullBackup(reader.result, { merge: true })
      Object.assign(form, getSettings())
      ElMessage.success(`已导入 ${result.historyCount} 条历史、${result.favoritesCount} 条收藏`)
    } catch (e) {
      ElMessage.error(e.message || '导入失败')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>
