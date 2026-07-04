<template>
  <div class="mx-auto flex max-w-2xl flex-col items-center">
    <h1 class="page-title mb-6 w-full text-center">{{ t('settings.title') }}</h1>
    <section class="card-panel w-full max-w-xl">
      <el-form label-width="140px">
        <el-form-item :label="t('settings.theme')">
          <el-radio-group v-model="form.theme">
            <el-radio value="light">{{ t('settings.themeLight') }}</el-radio>
            <el-radio value="dark">{{ t('settings.themeDark') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('settings.language')">
          <el-radio-group v-model="form.locale">
            <el-radio value="zh">{{ t('settings.langZh') }}</el-radio>
            <el-radio value="en">{{ t('settings.langEn') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('settings.defaultUnit')">
          <el-radio-group v-model="form.defaultUnit">
            <el-radio value="mm">mm</el-radio>
            <el-radio value="inch">inch</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('settings.defaultMethod')">
          <el-select v-model="form.defaultMethod" class="w-full">
            <el-option
              v-for="(opt, key) in stackMethods"
              :key="key"
              :label="opt.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('settings.mcIterations')">
          <el-input-number v-model="form.mcIterations" :min="1000" :max="100000" :step="1000" />
        </el-form-item>
        <el-form-item :label="t('settings.precision')">
          <el-input-number v-model="form.numberPrecision" :min="0" :max="4" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">{{ t('settings.save') }}</el-button>
          <el-button @click="reset">{{ t('settings.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="card-panel mt-6 w-full max-w-xl">
      <h2 class="mb-3 text-center font-semibold sm:text-left">{{ t('settings.syncTitle') }}</h2>
      <p class="mb-4 text-center text-sm text-gray-600 dark:text-gray-400 sm:text-left">
        {{ t('settings.syncDesc') }}
      </p>
      <div class="flex flex-wrap justify-center gap-2 sm:justify-start">
        <el-button @click="handleExportBackup">{{ t('settings.exportBackup') }}</el-button>
        <el-button @click="triggerImport">{{ t('settings.importBackup') }}</el-button>
        <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />
      </div>
    </section>

    <section class="card-panel mt-6 w-full max-w-xl">
      <h2 class="mb-3 text-center font-semibold sm:text-left">{{ t('settings.dataTitle') }}</h2>
      <p class="mb-4 text-center text-sm text-gray-600 dark:text-gray-400 sm:text-left">
        {{ t('settings.dataDesc') }}
      </p>
      <div class="text-center sm:text-left">
        <router-link to="/history">
          <el-button>{{ t('settings.openHistory') }}</el-button>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from '@/utils/settings'
import { downloadBackup, importFullBackup } from '@/utils/backup'
import { useLocale } from '@/composables/useLocale'
import { useOptionsI18n } from '@/composables/useOptionsI18n'
import { ensureLoggedIn } from '@/utils/auth-guard'

const { locale, t } = useLocale()
const { optionMap } = useOptionsI18n()
const STACK_METHOD_KEYS = { rss: {}, worst: {}, 'modified-rss': {}, 'sigma6-rss': {} }
const stackMethods = computed(() => optionMap(STACK_METHOD_KEYS, 'stackMethods'))
const form = reactive({ ...DEFAULT_SETTINGS })
const fileInput = ref(null)

onMounted(() => {
  Object.assign(form, getSettings())
  window.addEventListener('mechbox-settings', syncFormFromSettings)
})

onUnmounted(() => {
  window.removeEventListener('mechbox-settings', syncFormFromSettings)
})

function syncFormFromSettings(e) {
  if (e.detail?.locale != null) form.locale = e.detail.locale
}

function save() {
  saveSettings({ ...form })
  ElMessage.success(t('settings.saved'))
}

function reset() {
  Object.assign(form, DEFAULT_SETTINGS)
  saveSettings(DEFAULT_SETTINGS)
  ElMessage.info(t('settings.resetDone'))
}

async function handleExportBackup() {
  if (!(await ensureLoggedIn(locale.value))) return
  downloadBackup()
  ElMessage.success(t('settings.backupExported'))
}

function triggerImport() {
  void ensureLoggedIn(locale.value).then((user) => {
    if (user) fileInput.value?.click()
  })
}

function handleImport(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const result = importFullBackup(reader.result, { merge: true })
      Object.assign(form, getSettings())
      ElMessage.success(`OK ${result.historyCount}/${result.favoritesCount}`)
    } catch (e) {
      ElMessage.error(e.message || 'Import failed')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}
</script>
