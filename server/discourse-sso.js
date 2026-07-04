import crypto from 'node:crypto'

export function randomNonce(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex')
}

export function buildLoginRedirect(discourseUrl, secret, returnSsoUrl, nonce) {
  const payload = new URLSearchParams({
    nonce,
    return_sso_url: returnSsoUrl,
  }).toString()

  const base64Payload = Buffer.from(payload, 'utf8').toString('base64')
  const sig = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex')
  const root = discourseUrl.replace(/\/$/, '')
  const sso = encodeURIComponent(base64Payload)

  return `${root}/session/sso_provider?sso=${sso}&sig=${sig}`
}

export function parseCallback(sso, sig, secret, expectedNonce) {
  if (!sso || !sig) {
    throw new Error('Missing SSO parameters')
  }

  const expectedSig = crypto.createHmac('sha256', secret).update(sso).digest('hex')
  if (expectedSig !== sig) {
    throw new Error('Invalid SSO signature')
  }

  const decoded = Buffer.from(sso, 'base64').toString('utf8')
  const fields = Object.fromEntries(new URLSearchParams(decoded))

  if (fields.failed === 'true') {
    throw new Error('Discourse SSO failed')
  }

  if (!fields.nonce || fields.nonce !== expectedNonce) {
    throw new Error('Invalid SSO nonce')
  }

  if (!fields.external_id || !fields.username) {
    throw new Error('Incomplete SSO user payload')
  }

  return {
    id: String(fields.external_id),
    username: fields.username,
    name: fields.name || fields.username,
    email: fields.email || '',
    avatarUrl: fields.avatar_url || '',
    admin: fields.admin === 'true',
    moderator: fields.moderator === 'true',
    groups: fields.groups ? fields.groups.split(',').map((g) => g.trim()).filter(Boolean) : [],
  }
}
