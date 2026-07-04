import 'dotenv/config'

function required(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const isProd = process.env.NODE_ENV === 'production'

export const config = {
  port: Number(process.env.AUTH_PORT || process.env.PORT || 3001),
  discourseUrl: required('DISCOURSE_URL'),
  discourseSsoSecret: required('DISCOURSE_SSO_SECRET'),
  sessionSecret: required('SESSION_SECRET'),
  publicUrl: (process.env.MECHBOX_PUBLIC_URL || 'http://localhost:5173').replace(/\/$/, ''),
  isProd,
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : isProd,
}

export const callbackUrl = `${config.publicUrl}/api/auth/discourse/callback`
