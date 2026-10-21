import test from 'node:test'
import assert from 'node:assert/strict'
import { CONTACT_SUBJECT, createContactRateLimiter, deliverContactEmail, validateContactSubmission } from './contact.js'

const validSubmission = {
  name: 'Alex Mukisa',
  organisation: 'Pinnacle Group',
  email: 'visitor@example.com',
  phone: '+256 751 206 482',
  interest: 'Technology & IT Solutions',
  message: 'Please contact me about a new business enquiry.',
}
const mailEnvironment = {
  CONTACT_EMAIL: 'pinnacleempoweradvisory@gmail.com',
  RESEND_API_KEY: 'test-only-key',
  RESEND_FROM_EMAIL: 'Pinnacle Test <website@example.test>',
}

test('validates all required contact fields', () => {
  assert.deepEqual(validateContactSubmission(validSubmission), { ok: true, spam: false, value: validSubmission })
})

test('rejects invalid email, telephone and too-short message', () => {
  assert.equal(validateContactSubmission({ ...validSubmission, email: 'bad-address' }).ok, false)
  assert.equal(validateContactSubmission({ ...validSubmission, phone: '---' }).ok, false)
  assert.equal(validateContactSubmission({ ...validSubmission, message: 'short' }).ok, false)
})

test('rejects overlong message and malformed fields', () => {
  assert.equal(validateContactSubmission({ ...validSubmission, message: 'x'.repeat(5001) }).ok, false)
  assert.equal(validateContactSubmission({ ...validSubmission, name: 'A' }).ok, false)
})

test('accepts honeypot spam without treating it as an enquiry', () => {
  assert.deepEqual(validateContactSubmission({ website: 'https://spam.example' }), { ok: true, spam: true })
})

test('rate limiter permits five requests and throttles the next in a window', () => {
  let now = 1000
  const limited = createContactRateLimiter({ limit: 2, windowMs: 1000, now: () => now })
  assert.equal(limited('test-ip'), false)
  assert.equal(limited('test-ip'), false)
  assert.equal(limited('test-ip'), true)
  now += 1001
  assert.equal(limited('test-ip'), false)
})

test('reports missing mail configuration without calling provider', async () => {
  let called = false
  const result = await deliverContactEmail(validSubmission, {}, async () => { called = true })
  assert.deepEqual(result, { ok: false, kind: 'configuration' })
  assert.equal(called, false)
})

test('sends structured plaintext with fixed subject, verified sender and visitor reply-to', async () => {
  let request
  const result = await deliverContactEmail(validSubmission, mailEnvironment, async (url, options) => {
    request = { url, options }
    return new Response(JSON.stringify({ id: 'resend-test-id' }), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  const payload = JSON.parse(request.options.body)
  assert.deepEqual(result, { ok: true, id: 'resend-test-id' })
  assert.equal(request.url, 'https://api.resend.com/emails')
  assert.equal(request.options.headers.Authorization, 'Bearer test-only-key')
  assert.equal(payload.to[0], mailEnvironment.CONTACT_EMAIL)
  assert.equal(payload.from, mailEnvironment.RESEND_FROM_EMAIL)
  assert.equal(payload.reply_to, validSubmission.email)
  assert.equal(payload.subject, CONTACT_SUBJECT)
  assert.match(payload.text, /Telephone: \+256 751 206 482/)
  assert.match(payload.text, /Please contact me about a new business enquiry/)
})

test('reports provider rejection and network failure without exposing secrets', async () => {
  const rejected = await deliverContactEmail(validSubmission, mailEnvironment, async () => new Response('private provider detail', { status: 401 }))
  const networkFailure = await deliverContactEmail(validSubmission, mailEnvironment, async () => { throw new Error('test failure') })
  assert.deepEqual(rejected, { ok: false, kind: 'provider' })
  assert.deepEqual(networkFailure, { ok: false, kind: 'provider' })
})
