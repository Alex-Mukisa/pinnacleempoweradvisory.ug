import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import app from '../api/[...path].js'

let server
let baseUrl

before(async () => {
  server = app.listen(0, '127.0.0.1')
  await new Promise((resolve, reject) => {
    server.once('listening', resolve)
    server.once('error', reject)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('serverless health endpoint reports browser-local chat storage', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    database: 'browser-local',
    ai: process.env.AI_API_KEY ? 'configured' : 'local-faq',
    contactEmail: 'not-configured',
  })
})

test('serverless chat endpoint responds to supported questions', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What services do you offer?' }),
  })
  const result = await response.json()
  assert.equal(response.status, 200)
  assert.match(result.reply, /Investment & Business Profitability Analysis/)
  assert.equal(result.mode, 'local-faq')
  assert.match(result.conversationId, /^[0-9a-f-]{36}$/i)
})

test('serverless chat endpoint validates message length', async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: ' '.repeat(2001) }),
  })
  assert.equal(response.status, 400)
})

test('serverless contact endpoint rejects invalid enquiries', async () => {
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'invalid', phone: '1', message: 'short' }),
  })
  assert.equal(response.status, 400)
})
