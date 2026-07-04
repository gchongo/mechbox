import { ElMessageBox } from 'element-plus'
import { fetchCurrentUser, startLogin } from '@/utils/auth'
import { t } from '@/i18n'

export async function ensureLoggedIn(locale = 'zh') {
  const user = await fetchCurrentUser()
  if (user) return user

  try {
    await ElMessageBox.confirm(
      t('content.auth.loginRequiredBody', locale),
      t('content.auth.loginRequiredTitle', locale),
      {
        confirmButtonText: t('content.auth.loginWithCax', locale),
        cancelButtonText: t('content.auth.cancel', locale),
        type: 'info',
      },
    )
    startLogin()
  } catch {
    // dismissed
  }

  return null
}
