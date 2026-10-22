const verifiedContext = `You are Pinnacle Empower Advisory's website assistant. Be concise, clear, and professional. Use only these verified company facts. Company: Pinnacle Empower Advisory Limited, Kampala, Uganda. Mission: To empower entrepreneurs and investors with the knowledge, financial insights, technology, and business tools they need to build, manage, and grow profitable enterprises. Services: Investment & Business Profitability Analysis; Return on Investment & Financial Projections; Strategic Pricing of Goods & Services; Tailor-Made Business Systems & ERP Solutions; Technology & IT Solutions. Strengths: Business Intelligence, Financial Analysis, and Technology. Contact: ${process.env.CONTACT_EMAIL || 'pinnacleempoweradvisory@gmail.com'}, +256 751 206 482, +256 775 674 134, 14 Katalima Rd, Kampala. CEO: Alex Mukisa. Do not invent prices, credentials, case studies, guarantees, or detailed capabilities. For advice requiring company confirmation, suggest contacting the team. Never present yourself as providing regulated financial advice.`

export function localReply(message) {
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

export async function generateReply(message, history = []) {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) return localReply(message)

  const endpoint = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
  const model = process.env.AI_MODEL || 'gpt-4o-mini'
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
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
