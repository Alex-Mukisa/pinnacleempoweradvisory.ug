import express from 'express'
import { randomUUID } from 'node:crypto'
import { createContactRateLimiter, deliverContactEmail, validateContactSubmission } from '../server/contact.js'
import { generateReply } from '../server/assistant.js'

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '12kb' }))

const isContactRateLimited = createContactRateLimiter()

app.get('/api/health', (_request, response) => {
  const contactMailConfigured = Boolean(
    process.env.CONTACT_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.CONTACT_EMAIL) &&
    process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL,
  )
  response.json({
    ok: true,
    database: 'browser-local',
    ai: process.env.AI_API_KEY ? 'configured' : 'local-faq',
    contactEmail: contactMailConfigured ? 'configured' : 'not-configured',
  })
})

app.post('/api/contact', async (request, response) => {
  if (isContactRateLimited(request.ip || request.socket.remoteAddress || 'unknown')) {
    return response.status(429).json({ error: 'Too many enquiries were sent from this connection. Please wait a few minutes and try again.' })
  }
  const validation = validateContactSubmission(request.body || {})
  if (validation.spam) return response.status(200).json({ ok: true })
  if (!validation.ok) return response.status(400).json({ error: validation.error })

  const delivery = await deliverContactEmail(validation.value)
  if (delivery.kind === 'configuration') {
    return response.status(503).json({ error: 'Email delivery is not fully configured. Please use the prefilled email option below or call +256 751 206 482.' })
  }
  if (!delivery.ok) {
    return response.status(502).json({ error: 'The email provider could not accept your enquiry. Please retry or use the prefilled email option below.' })
  }
  response.json({ ok: true, messageId: delivery.id })
})

app.get('/api/conversations/:id', (request, response) => {
  if (!/^[0-9a-f-]{36}$/i.test(request.params.id)) {
    return response.status(400).json({ error: 'Invalid conversation id' })
  }
  response.json({ conversationId: request.params.id, messages: [] })
})

app.post('/api/chat', async (request, response) => {
  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : ''
  const requestedId = typeof request.body?.conversationId === 'string' ? request.body.conversationId : ''
  const conversationId = /^[0-9a-f-]{36}$/i.test(requestedId) ? requestedId : randomUUID()
  if (!message || message.length > 2000) {
    return response.status(400).json({ error: 'Enter a message of 1 to 2,000 characters.' })
  }

  const history = Array.isArray(request.body?.history)
    ? request.body.history
      .filter((item) => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .slice(-12)
      .map(({ role, content }) => ({ role, content: content.slice(0, 2000) }))
    : []

  try {
    const reply = await generateReply(message, history)
    response.json({ conversationId, reply, mode: process.env.AI_API_KEY ? 'ai' : 'local-faq' })
  } catch (error) {
    console.error('Assistant request failed:', error instanceof Error ? error.message : 'UnknownError')
    response.status(502).json({ error: 'The assistant is temporarily unavailable. Please try again or contact the Pinnacle team directly.' })
  }
})

app.use((error, request, response, next) => {
  if (!request.path.startsWith('/api/')) return next(error)
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request is too large. Please shorten your enquiry and try again.' })
  }
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'The request could not be read. Please check the form and try again.' })
  }
  console.error('API request failed:', error.name || 'Error')
  response.status(500).json({ error: 'The request could not be completed. Please try again.' })
})

export default app
