<template>
  <div class="mx-auto flex max-w-2xl flex-col items-center">
    <h1 class="page-title mb-6 w-full text-center">{{ ct('account.title') }}</h1>
    <section v-if="user" class="card-panel w-full max-w-md">
      <div class="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <el-avatar :size="48" class="bg-primary">{{ user.username[0]?.toUpperCase() }}</el-avatar>
        <div>
          <p class="font-semibold">{{ user.username }}</p>
          <p class="text-xs text-gray-500">{{ ct('account.registered', { date: formatDate(user.createdAt) }) }}</p>
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-2 sm:justify-start">
        <el-button @click="handleBackup">{{ ct('account.exportBackup') }}</el-button>
        <el-button @click="router.push('/history')">{{ ct('account.myHistory') }}</el-button>
        <el-button type="warning" plain @click="logout">{{ ct('account.logout') }}</el-button>
        <el-button type="danger" plain @click="confirmDelete">{{ ct('account.deleteAccount') }}</el-button>
      </div>
    </section>

    <section v-else class="card-panel w-full max-w-md">
      <el-tabs v-model="tab" class="account-tabs">
        <el-tab-pane :label="ct('account.loginTab')" name="login">
          <el-form label-width="80px" class="mt-2">
            <el-form-item :label="ct('account.username')">
              <el-input v-model="loginForm.username" />
            </el-form-item>
            <el-form-item :label="ct('account.password')">
              <el-input v-model="loginForm.password" type="password" show-password />
            </el-form-item>
            <div class="text-center sm:text-left">
              <el-button type="primary" :loading="loading" @click="doLogin">{{ ct('account.login') }}</el-button>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="ct('account.registerTab')" name="register">
          <el-form label-width="80px" class="mt-2">
            <el-form-item :label="ct('account.username')">
              <el-input v-model="registerForm.username" :placeholder="ct('account.usernameMin')" />
            </el-form-item>
            <el-form-item :label="ct('account.password')">
              <el-input v-model="registerForm.password" type="password" show-password :placeholder="ct('account.passwordMin')" />
            </el-form-item>
            <el-form-item :label="ct('account.confirmPassword')">
              <el-input v-model="registerForm.confirm" type="password" show-password />
            </el-form-item>
            <div class="text-center sm:text-left">
              <el-button type="primary" :loading="loading" @click="doRegister">{{ ct('account.register') }}</el-button>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </section>

    <section v-if="user && favoriteRecords.length" class="card-panel mt-6 w-full">
      <h2 class="mb-4 text-center font-semibold sm:text-left">{{ ct('account.favoritesTitle') }}</h2>
      <div class="space-y-2">
        <div
          v-for="item in favoriteRecords"
          :key="item.id"
          class="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-700"
        >
          <div>
            <p class="font-medium">{{ item.title }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(item.date) }}</p>
          </div>
          <el-button size="small" @click="openRecord(item.id)">{{ ct('account.open') }}</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCurrentUser,
  login,
  register,
  logout as authLogout,
  deleteAccount,
} from '@/utils/auth'
import { getFavorites } from '@/utils/favorites'
import { getHistory } from '@/utils/storage'
import { downloadBackup } from '@/utils/backup'
import { useContentI18n } from '@/composables/useContentI18n'

const router = useRouter()
const { ct, locale } = useContentI18n()
const user = ref(null)
const tab = ref('login')
const loading = ref(false)
const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '', confirm: '' })

const favoriteRecords = computed(() => {
  const favIds = getFavorites()
  return getHistory().filter((h) => favIds.includes(h.id))
})

onMounted(refresh)

function refresh() {
  user.value = getCurrentUser()
}

function formatDate(iso) {
  const loc = locale.value === 'en' ? 'en-US' : 'zh-CN'
  return new Date(iso).toLocaleString(loc)
}

async function doLogin() {
  loading.value = true
  try {
    user.value = await login(loginForm.value.username, loginForm.value.password)
    ElMessage.success(ct('account.loginSuccess'))
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

async function doRegister() {
  if (registerForm.value.password !== registerForm.value.confirm) {
    ElMessage.error(ct('account.passwordMismatch'))
    return
  }
  loading.value = true
  try {
    user.value = await register(registerForm.value.username, registerForm.value.password)
    ElMessage.success(ct('account.registerSuccess'))
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

function logout() {
  authLogout()
  user.value = null
  ElMessage.info(ct('account.loggedOut'))
}

async function confirmDelete() {
  await ElMessageBox.confirm(ct('account.deleteConfirm'), ct('account.deleteTitle'), {
    type: 'warning',
  })
  deleteAccount()
  user.value = null
  ElMessage.success(ct('account.accountDeleted'))
}

function handleBackup() {
  downloadBackup()
  ElMessage.success(ct('account.backupDownloaded'))
}

function openRecord(id) {
  router.push({ name: 'editor-detail', params: { id } })
}
</script>
