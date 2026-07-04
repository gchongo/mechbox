import express from 'express'
import cookieSession from 'cookie-session'
import { config, callbackUrl } from './config.js'
import { buildLoginRedirect, parseCallback, randomNonce } from './discourse-sso.js'

const app = express()

app.set('trust proxy', 1)

app.use(
  cookieSession({
    name: 'mechbox_sess',
    keys: [config.sessionSecret],
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'lax',
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ user: null })
  }
  res.json({ user: req.session.user })
})

app.get('/api/auth/login', (req, res) => {
  const returnPath = typeof req.query.return === 'string' ? req.query.return : '/'
  const safeReturn = returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/'

  const nonce = randomNonce()
  req.session.ssoNonce = nonce
  req.session.postLoginReturn = safeReturn

  const redirectUrl = buildLoginRedirect(
    config.discourseUrl,
    config.discourseSsoSecret,
    callbackUrl,
    nonce,
  )

  res.redirect(redirectUrl)
})

app.get('/api/auth/discourse/callback', (req, res) => {
  const { sso, sig } = req.query
  const nonce = req.session?.ssoNonce

  try {
    const user = parseCallback(
      typeof sso === 'string' ? sso : '',
      typeof sig === 'string' ? sig : '',
      config.discourseSsoSecret,
      nonce,
    )

    req.session.user = {
      ...user,
      loggedInAt: new Date().toISOString(),
    }
    delete req.session.ssoNonce

    const destination = req.session.postLoginReturn || '/account'
    delete req.session.postLoginReturn

    res.redirect(`${config.publicUrl}${destination}`)
  } catch (error) {
    console.error('[auth] Discourse SSO callback failed:', error.message)
    res.redirect(`${config.publicUrl}/account?auth_error=1`)
  }
})

app.post('/api/auth/logout', (req, res) => {
  req.session = null
  res.json({ ok: true })
})

app.use((err, _req, res, _next) => {
  console.error('[auth] Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`MechBox auth API listening on :${config.port}`)
  console.log(`Callback URL: ${callbackUrl}`)
})
