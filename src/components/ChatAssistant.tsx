import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Bot, LoaderCircle, MessageCircle, Send, X } from 'lucide-react'
import './ChatAssistant.css'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type Health = { database: 'connected'; ai: 'configured' | 'local-faq' }

const greeting: ChatMessage = {
  role: 'assistant',
  content: 'Hello. I can answer questions about Pinnacle’s services and contact details. What would you like to know?',
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([greeting])
  const [conversationId, setConversationId] = useState(() => window.localStorage.getItem('pinnacle-chat-id') || '')
  const initialConversationId = useRef(conversationId)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [health, setHealth] = useState<Health | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedId = initialConversationId.current
    if (!savedId) return
    fetch(`/api/conversations/${savedId}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Conversation could not be restored.')))
      .then((data: { messages?: ChatMessage[] }) => {
        if (data.messages?.length) setMessages(data.messages)
      })
      .catch(() => {
        window.localStorage.removeItem('pinnacle-chat-id')
        setConversationId('')
      })
  }, [])

  useEffect(() => {
    if (!open) return
    fetch('/api/health')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Assistant is offline')))
      .then((data: Health) => setHealth(data))
      .catch(() => setHealth(null))
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy, open])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = message.trim()
    if (!content || busy) return
    setError('')
    setMessage('')
    setMessages((current) => [...current, { role: 'user', content }])
    setBusy(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversationId: conversationId || undefined }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The assistant could not respond.')
      setConversationId(result.conversationId)
      window.localStorage.setItem('pinnacle-chat-id', result.conversationId)
      setMessages((current) => [...current, { role: 'assistant', content: result.reply }])
      setHealth((current) => current ? { ...current, ai: result.mode } : current)
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Could not reach the assistant. Please try again.')
      setMessages((current) => current.at(-1)?.role === 'user' ? current.slice(0, -1) : current)
      setMessage(content)
    } finally {
      setBusy(false)
    }
  }

  return <>
    <button className="assistant-launcher" type="button" aria-label={open ? 'Close Pinnacle assistant' : 'Open Pinnacle assistant'} aria-expanded={open} onClick={() => setOpen(!open)}>
      {open ? <X size={21} /> : <><img src="/logo.gif" alt="" /><span>Ask Pinnacle</span><MessageCircle size={18} /></>}
    </button>
    {open && <section className="assistant-panel" aria-label="Pinnacle AI assistant">
      <header className="assistant-header">
        <img src="/logo.gif" alt="Pinnacle Empower Advisory logo" />
        <div><strong>Pinnacle Assistant</strong><small><i />{health ? health.ai === 'configured' ? 'AI connected · conversation saved' : 'Assistant connected · conversation saved' : 'Connecting to assistant…'}</small></div>
        <button type="button" aria-label="Close assistant" onClick={() => setOpen(false)}><X size={18} /></button>
      </header>
      <div className="assistant-messages" aria-live="polite" aria-relevant="additions text">
        {messages.map((item, index) => <div className={`assistant-message ${item.role}`} key={`${index}-${item.role}`}>
          {item.role === 'assistant' && <span className="assistant-avatar"><Bot size={15} /></span>}
          <p>{item.content}</p>
        </div>)}
        {busy && <div className="assistant-message assistant"><span className="assistant-avatar"><Bot size={15} /></span><p className="typing"><LoaderCircle size={15} /> Preparing a response…</p></div>}
        {error && <p className="assistant-error" role="alert">{error}</p>}
        <div ref={endRef} />
      </div>
      <form className="assistant-form" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor="assistant-message">Ask Pinnacle a question</label>
        <textarea id="assistant-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about our services…" rows={1} maxLength={2000} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} />
        <button type="submit" aria-label="Send message" disabled={!message.trim() || busy}><Send size={17} /></button>
      </form>
      <p className="assistant-disclaimer">General company information only. Not financial advice.</p>
    </section>}
  </>
}
