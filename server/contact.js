export const CONTACT_SUBJECT = 'New Website Enquiry — Pinnacle Empower Advisory'

export function validateContactSubmission(input) {
  if (typeof input?.website === 'string' && input.website.trim()) {
    return { ok: true, spam: true }
  }

  const name = typeof input?.name === 'string' ? input.name.trim() : ''
  const email = typeof input?.email === 'string' ? input.email.trim() : ''
  const phone = typeof input?.phone === 'string' ? input.phone.trim() : ''
  const organisation = typeof input?.organisation === 'string' ? input.organisation.trim() : ''
  const interest = typeof input?.interest === 'string' ? input.interest.trim() : 'General enquiry'
  const message = typeof input?.message === 'string' ? input.message.trim() : ''
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
  const validPhone = /^[+\d][\d\s().-]{6,24}$/.test(phone) && phone.replace(/\D/g, '').length >= 7

  if (name.length < 2 || name.length > 120 || !validEmail || !validPhone || organisation.length > 160 || interest.length > 120 || message.length < 10 || message.length > 5000) {
    return { ok: false, error: 'Please check your details. Enter your name, valid email address, telephone number, and a message between 10 and 5,000 characters.' }
  }

  return { ok: true, spam: false, value: { name, email, phone, organisation, interest: interest || 'General enquiry', message } }
}

export function createContactRateLimiter({ limit = 5, windowMs = 15 * 60 * 1000, now = Date.now } = {}) {
  const requests = new Map()
  return (key) => {
    const currentTime = now()
    const recent = (requests.get(key) || []).filter((timestamp) => currentTime - timestamp < windowMs)
    if (recent.length >= limit) {
      requests.set(key, recent)
      return true
    }
    recent.push(currentTime)
    requests.set(key, recent)
    if (requests.size > 1000) {
      for (const [ip, timestamps] of requests) {
        if (!timestamps.some((timestamp) => currentTime - timestamp < windowMs)) requests.delete(ip)
      }
    }
    return false
  }
}

export async function deliverContactEmail(enquiry, env = process.env, fetcher = fetch) {
  const recipient = env.CONTACT_EMAIL
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || !env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return { ok: false, kind: 'configuration' }
  }

  const text = [
    CONTACT_SUBJECT,
    '',
    `Full name: ${enquiry.name}`,
    `Organisation: ${enquiry.organisation || 'Not provided'}`,
    `Email address: ${enquiry.email}`,
    `Telephone: ${enquiry.phone}`,
    `Service of interest: ${enquiry.interest}`,
    '',
    'Enquiry message:',
    enquiry.message,
  ].join('\n')

  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [recipient],
        reply_to: enquiry.email,
        subject: CONTACT_SUBJECT,
        text,
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.error('Contact email provider rejected enquiry with HTTP', response.status)
      return { ok: false, kind: 'provider' }
    }
    const result = await response.json()
    return { ok: true, id: typeof result.id === 'string' ? result.id : undefined }
  } catch (error) {
    console.error('Contact email provider request failed:', error instanceof Error ? error.name : 'UnknownError')
    return { ok: false, kind: 'provider' }
  }
}
