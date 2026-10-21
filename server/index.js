import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { createContactRateLimiter, deliverContactEmail, validateContactSubmission } from './contact.js'

const app = express()
app.set('trust proxy', 1)
const here = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(here, '..')
const environmentFile = path.join(projectRoot, '.env')
if (existsSync(environmentFile)) process.loadEnvFile(environmentFile)
const port = Number(process.env.PORT || 8000)
const databasePath = process.env.DATABASE_PATH || path.join(projectRoot, '.data', 'pinnacle.sqlite')
mkdirSync(path.dirname(databasePath), { recursive: true })

const database = new DatabaseSync(databasePath)
database.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id, id);
`)
database.exec('PRAGMA foreign_keys = ON;')

app.use(express.json({ limit: '12kb' }))
const isContactRateLimited = createContactRateLimiter()

const verifiedContext = `You are Pinnacle Empower Advisory's website assistant. Be concise, clear, and professional. Use only these verified company facts. Company: Pinnacle Empower Advisory Limited, Kampala, Uganda. Mission: To empower entrepreneurs and investors with the knowledge, financial insights, technology, and business tools they need to build, manage, and grow profitable enterprises. Services: Investment & Business Profitability Analysis; Return on Investment & Financial Projections; Strategic Pricing of Goods & Services; Tailor-Made Business Systems & ERP Solutions; Technology & IT Solutions. Strengths: Business Intelligence, Financial Analysis, and Technology. Contact: ${process.env.CONTACT_EMAIL || 'pinnacleempoweradvisory@gmail.com'}, +256 751 206 482, +256 775 674 134, 14 Katalima Rd, Kampala. CEO: Alex Mukisa. Do not invent prices, credentials, case studies, guarantees, or detailed capabilities. For advice requiring company confirmation, suggest contacting the team. Never present yourself as providing regulated financial advice.`

function localReply(message) {
  const text = message.toLowerCase()
  if (/service|offer|help|what do you do/.test(text)) {
    return 'Pinnacle lists five service areas: Investment & Business Profitability Analysis; Return on Investment & Financial Projections; Strategic Pricing of Goods & Services; Tailor-Made Business Systems & ERP Solutions; and Technology & IT Solutions. Contact the team to confirm the scope for your needs.'
  }
  if (/contact|email|phone|call|address|location|where/.test(text)) {
    return 'You can reach Pinnacle Empower Advisory at pinnacleempoweradvisory@gmail.com or +256 751 206 482 / +256 775 674 134. The office address is 14 Katalima Rd, Kampala.'
  }
  if (/mission|purpose|about|who/.test(text)) {
    return 'Pinnacle Empower Advisory Limited aims to empower entrepreneurs and investors with knowledge, financial insights, technology, and business tools to build, manage, and grow profitable enterprises.'
  }
  return 'Thanks for your question. I can help with information about Pinnacle’s services and how to get in touch. For a tailored response, email pinnacleempoweradvisory@gmail.com or call +256 751 206 482.'
}

async function generateReply(message, history) {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) return localReply(message)

  const endpoint = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
  const model = process.env.AI_MODEL || 'gpt-4o-mini'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: verifiedContext }, ...history, { role: 'user', content: message }],
      temperature: 0.35,
      max_tokens: 350,
    }),
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`)
  const result = await response.json()
  const answer = result.choices?.[0]?.message?.content
  if (typeof answer !== 'string' || !answer.trim()) throw new Error('AI provider returned an empty reply')
  return answer.trim()
}

app.get('/api/health', (_request, response) => {
  const contactMailConfigured = Boolean(
    process.env.CONTACT_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.CONTACT_EMAIL) &&
    process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL,
  )
  response.json({
    ok: true,
    database: 'connected',
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
  const id = request.params.id
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response.status(400).json({ error: 'Invalid conversation id' })
  const messages = database.prepare('SELECT role, content, created_at AS createdAt FROM messages WHERE conversation_id = ? ORDER BY id').all(id)
  response.json({ conversationId: id, messages })
})

app.post('/api/chat', async (request, response) => {
  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : ''
  const requestedId = typeof request.body?.conversationId === 'string' ? request.body.conversationId : ''
  const conversationId = /^[0-9a-f-]{36}$/i.test(requestedId) ? requestedId : randomUUID()
  if (!message || message.length > 2000) return response.status(400).json({ error: 'Enter a message of 1 to 2,000 characters.' })

  try {
    database.prepare('INSERT OR IGNORE INTO conversations (id) VALUES (?)').run(conversationId)
    const history = database.prepare('SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT 12').all(conversationId).reverse()
    const reply = await generateReply(message, history)
    database.exec('BEGIN IMMEDIATE')
    try {
      database.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'user', message)
      database.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(conversationId, 'assistant', reply)
      database.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId)
      database.exec('COMMIT')
    } catch (error) {
      database.exec('ROLLBACK')
      throw error
    }
    response.json({ conversationId, reply, mode: process.env.AI_API_KEY ? 'ai' : 'local-faq' })
  } catch (error) {
    console.error('Assistant request failed:', error.message)
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

const distDirectory = path.join(projectRoot, 'dist')
app.use(express.static(distDirectory))
app.get('*', (_request, response, next) => {
  response.sendFile(path.join(distDirectory, 'index.html'), (error) => {
    if (error) next()
  })
})

app.listen(port, () => {
  console.info(`Pinnacle web server listening on http://localhost:${port}`)
  console.info(`Assistant database: ${databasePath}`)
  console.info(`Assistant mode: ${process.env.AI_API_KEY ? 'AI provider' : 'local FAQ (set AI_API_KEY for live AI)'}`)
})
