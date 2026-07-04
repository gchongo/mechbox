import { buildLoginRedirect, parseCallback, randomNonce } from '../server/discourse-sso.js'
import { describe, expect, it } from 'vitest'

const SECRET = 'test-secret-key-123456'
const DISCOURSE = 'https://cax.do'
const RETURN_URL = 'https://mechbox.cax.do/api/auth/discourse/callback'

describe('discourse-sso', () => {
  it('builds a login redirect with signed payload', () => {
    const nonce = 'abc123nonce'
    const url = buildLoginRedirect(DISCOURSE, SECRET, RETURN_URL, nonce)
    expect(url).toContain('https://cax.do/session/sso_provider?')
    expect(url).toContain('sso=')
    expect(url).toContain('sig=')
  })

  it('round-trips callback verification', async () => {
    const nonce = randomNonce()
    const responsePayload = new URLSearchParams({
      nonce,
      external_id: '42',
      username: 'engineer',
      email: 'user@example.com',
      name: 'Test User',
    }).toString()
    const sso = Buffer.from(responsePayload, 'utf8').toString('base64')
    const sig = await awaitImportHmac(sso)

    const user = parseCallback(sso, sig, SECRET, nonce)
    expect(user.id).toBe('42')
    expect(user.username).toBe('engineer')
    expect(user.email).toBe('user@example.com')
  })

  it('rejects bad signature', () => {
    const nonce = randomNonce()
    const sso = Buffer.from(`nonce=${nonce}&external_id=1&username=u`, 'utf8').toString('base64')
    expect(() => parseCallback(sso, 'bad', SECRET, nonce)).toThrow(/signature/i)
  })
})

function awaitImportHmac(sso) {
  return import('node:crypto').then((crypto) =>
    crypto.createHmac('sha256', SECRET).update(sso).digest('hex'),
  )
}
