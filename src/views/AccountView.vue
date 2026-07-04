<template>
  <div class="mx-auto flex max-w-2xl flex-col items-center">
    <h1 class="page-title mb-6 w-full text-center">{{ ct('account.title') }}</h1>

    <section v-if="user" class="card-panel w-full max-w-md">
      <div class="mb-4 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <el-avatar :size="48" class="bg-primary" :src="user.avatarUrl || undefined">
          {{ user.username[0]?.toUpperCase() }}
        </el-avatar>
        <div>
          <p class="font-semibold">{{ user.name || user.username }}</p>
          <p class="text-xs text-gray-500">@{{ user.username }}</p>
          <p v-if="user.loggedInAt" class="text-xs text-gray-500">
            {{ ct('account.registered', { date: formatDate(user.loggedInAt) }) }}
          </p>
        </div>
      </div>
      <div class="flex flex-wrap justify-center gap-2 sm:justify-start">
        <el-button @click="handleBackup">{{ ct('account.exportBackup') }}</el-button>
        <el-button @click="router.push('/history')">{{ ct('account.myHistory') }}</el-button>
        <el-button type="warning" plain :loading="loggingOut" @click="handleLogout">
          {{ ct('account.logout') }}
        </el-button>
      </div>
    </section>

    <section v-else class="card-panel w-full max-w-md text-center">
      <p class="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {{ ct('account.loginHint') }}
      </p>
      <el-button type="primary" size="large" @click="handleLogin">
        {{ ct('account.loginWithCax') }}
      </el-button>
      <p class="mt-4 text-xs text-gray-500">
        <a
          :href="FORUM_REGISTER_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary hover:underline"
        >
          {{ ct('account.registerOnForum') }}
        </a>
      </p>
    </section>

    <p class="mt-6 w-full max-w-md text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
      <a
        :href="FORUM_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary hover:underline"
      >
        {{ ct('account.forumLink') }}
      </a>
    </p>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { startLogin, logout } from '@/utils/auth'
import { useAuth } from '@/composables/useAuth'
import { ensureLoggedIn } from '@/utils/auth-guard'
import { getFavorites } from '@/utils/favorites'
import { getHistory } from '@/utils/storage'
import { downloadBackup } from '@/utils/backup'
import { FORUM_URL } from '@/constants/external-links'
import { useContentI18n } from '@/composables/useContentI18n'

const FORUM_REGISTER_URL = `${FORUM_URL}/signup`

const router = useRouter()
const route = useRoute()
const { ct, locale } = useContentI18n()
const { user, refresh } = useAuth()
const loggingOut = ref(false)

const favoriteRecords = computed(() => {
  const favIds = getFavorites()
  return getHistory().filter((h) => favIds.includes(h.id))
})

onMounted(async () => {
  await refresh()
  if (route.query.auth_error) {
    ElMessage.error(ct('account.authError'))
  }
})

watch(
  () => route.query.redirect,
  async (redirect) => {
    if (redirect && !user.value) {
      await ensureLoggedIn(locale.value)
    }
  },
  { immediate: true },
)

function formatDate(iso) {
  const loc = locale.value === 'en' ? 'en-US' : 'zh-CN'
  return new Date(iso).toLocaleString(loc)
}

function handleLogin() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/account'
  startLogin(redirect)
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
    ElMessage.info(ct('account.loggedOut'))
  } finally {
    loggingOut.value = false
  }
}

async function handleBackup() {
  if (!(await ensureLoggedIn(locale.value))) return
  downloadBackup()
  ElMessage.success(ct('account.backupDownloaded'))
}

function openRecord(id) {
  router.push({ name: 'editor-detail', params: { id } })
}
</script>
