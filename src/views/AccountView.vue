<template>
  <div class="mx-auto flex max-w-2xl flex-col items-center">
    <h1 class="page-title mb-6 w-full text-center">账号</h1>
    <!-- 已登录 -->
    <section v-if="user" class="card-panel w-full max-w-md">
      <div class="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <el-avatar :size="48" class="bg-primary">{{ user.username[0]?.toUpperCase() }}</el-avatar>
        <div>
          <p class="font-semibold">{{ user.username }}</p>
          <p class="text-xs text-gray-500">注册于 {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-2 sm:justify-start">
        <el-button @click="handleBackup">导出数据备份</el-button>
        <el-button @click="router.push('/history')">我的历史</el-button>
        <el-button type="warning" plain @click="logout">退出登录</el-button>
        <el-button type="danger" plain @click="confirmDelete">删除账号</el-button>
      </div>
    </section>

    <!-- 未登录 -->
    <section v-else class="card-panel w-full max-w-md">
      <el-tabs v-model="tab" class="account-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form label-width="80px" class="mt-2">
            <el-form-item label="用户名">
              <el-input v-model="loginForm.username" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" show-password />
            </el-form-item>
            <div class="text-center sm:text-left">
              <el-button type="primary" :loading="loading" @click="doLogin">登录</el-button>
            </div>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form label-width="80px" class="mt-2">
            <el-form-item label="用户名">
              <el-input v-model="registerForm.username" placeholder="至少 2 字符" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="registerForm.password" type="password" show-password placeholder="至少 4 字符" />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="registerForm.confirm" type="password" show-password />
            </el-form-item>
            <div class="text-center sm:text-left">
              <el-button type="primary" :loading="loading" @click="doRegister">注册</el-button>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- 收藏 -->
    <section v-if="user && favoriteRecords.length" class="card-panel mt-6 w-full">
      <h2 class="mb-4 text-center font-semibold sm:text-left">收藏的分析</h2>
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
          <el-button size="small" @click="openRecord(item.id)">打开</el-button>
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

const router = useRouter()
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
  return new Date(iso).toLocaleString('zh-CN')
}

async function doLogin() {
  loading.value = true
  try {
    user.value = await login(loginForm.value.username, loginForm.value.password)
    ElMessage.success('登录成功')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

async function doRegister() {
  if (registerForm.value.password !== registerForm.value.confirm) {
    ElMessage.error('两次密码不一致')
    return
  }
  loading.value = true
  try {
    user.value = await register(registerForm.value.username, registerForm.value.password)
    ElMessage.success('注册成功')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

function logout() {
  authLogout()
  user.value = null
  ElMessage.info('已退出登录')
}

async function confirmDelete() {
  await ElMessageBox.confirm('删除账号将清除登录信息（分析数据保留），确定？', '确认', {
    type: 'warning',
  })
  deleteAccount()
  user.value = null
  ElMessage.success('账号已删除')
}

function handleBackup() {
  downloadBackup()
  ElMessage.success('备份已下载')
}

function openRecord(id) {
  router.push({ name: 'editor-detail', params: { id } })
}
</script>
