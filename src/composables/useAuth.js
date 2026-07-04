import { ref, onMounted, onUnmounted } from 'vue'
import {
  fetchCurrentUser,
  getCurrentUser,
  onAuthChanged,
  initAuth,
} from '@/utils/auth'

const bootstrapped = ref(false)

export function useAuth() {
  const user = ref(getCurrentUser())

  async function refresh() {
    user.value = await fetchCurrentUser({ force: true })
    bootstrapped.value = true
    return user.value
  }

  onMounted(() => {
    if (!bootstrapped.value) {
      initAuth().then((u) => {
        user.value = u
        bootstrapped.value = true
      })
    } else {
      user.value = getCurrentUser()
    }

    const off = onAuthChanged(() => {
      user.value = getCurrentUser()
    })
    onUnmounted(off)
  })

  return {
    user,
    refresh,
    isLoggedIn: () => !!user.value,
  }
}
