# Pinnacle Empower Advisory

React, TypeScript, Vite, and an Express API with SQLite-backed assistant conversations.

## Run locally

Use Node.js 22.13 or newer. From this directory:

```sh
npm ci
npm run dev:full
```

Open `http://localhost:5173`. The frontend proxies `/api` to Express on port 8000. The server creates `.data/pinnacle.sqlite` on first start.

## AI assistant configuration

Without an API key, the assistant answers common company questions using its built-in FAQ. For live AI responses, copy `.env.example` to `.env` and set `AI_API_KEY`. The key is read only by Express; never expose it through a `VITE_` variable or commit `.env`.

## Contact form email delivery

The React form sends JSON to the Express `/api/contact` endpoint. The backend validates every field, applies a 5-per-15-minute per-IP limit and honeypot, then sends plaintext email through Resend. The visitor's validated email is set as reply-to; the configured sender is never replaced with the visitor address. Success appears only after Resend accepts the request. An accepted request confirms provider handoff, not inbox placement.

Configure these server-only variables locally in `.env` and in the production host dashboard:

```dotenv
CONTACT_EMAIL=the-company-approved-recipient@example.com
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Pinnacle Empower Advisory <website@your-verified-domain.com>
```

Replace the recipient placeholder with the approved company enquiry mailbox; do not assume the visitor-facing address is the preferred recipient. In Resend, add a sending domain you control, publish its SPF/DKIM DNS records at the domain registrar, and wait for Resend to mark the domain verified. Use a sender on that verified domain for `RESEND_FROM_EMAIL`. Keep all values out of frontend code and never use a `VITE_` prefix for credentials. Restart the local server after editing `.env`. In Render, set the variables in the service environment settings and redeploy/restart.

When delivery is unconfigured or the provider fails, the form shows an error and a prefilled `mailto:` fallback; it does not claim that the message was delivered.

## Production deployment

A Render Blueprint is included in `render.yaml`. To publish:

1. Push this project to a Git repository that you control.
2. In Render, create a new Blueprint deployment and connect that repository.
3. Set `CONTACT_EMAIL` to the approved recipient, plus private `RESEND_API_KEY` and `RESEND_FROM_EMAIL` values in Render after verifying the sender domain in Resend. Set `AI_API_KEY` if live model answers are required; the local FAQ works without it.
4. Deploy and check `/api/health`. Confirm it reports `contactEmail: "configured"`; it exposes readiness only, never secret values. The Render disk is mounted at `/var/data` so SQLite chat history persists across restarts.
5. Register `pinnacleempoweradvisory.ug` with an accredited registrar if it is available, then configure the exact DNS records Render provides. Render provisions HTTPS after DNS verification.

The application, API, and database run on the same Node service. Do not publish only the `dist` folder: that would omit the chat API and database. The included Render plan uses a paid persistent disk/service; select an appropriate plan in the host dashboard before deployment.

The `.ug` registry WHOIS lookup currently reports `pinnacleempoweradvisory.ug` as **not registered**. Adding it to a hosting project does not purchase the domain. Until it is registered and DNS is configured, the canonical and social-sharing URLs use the working Vercel URL, `https://pinnacle-empower-advisory.vercel.app/`. Register the domain through an accredited `.ug` registrar, then configure the DNS records for the chosen host.

## Vercel deployment

The Vercel deployment uses `api/[...path].js` for the health, chat, and contact endpoints. Chat history is saved in the visitor's browser on this host; use the Render service when server-side, cross-device conversation storage is required. Contact email requires the same server-only Resend variables configured in the Vercel project settings.

The apex and `www` domains must be attached to the Vercel project, then pointed at Vercel at the domain registrar. Vercel may provide domain-specific DNS targets; use the exact records shown in its domain settings. If using the currently recommended targets, set apex A records `@` to `216.198.79.1` and `64.29.17.1`, and the `www` CNAME to `a7a8e61568d41a5e.vercel-dns-017.com`. Re-run domain verification after DNS propagates.

## Checks

```sh
npm test
npm run lint
npm run build
```

For a real test enquiry after configuring the provider, run the site, submit the contact form with a mailbox you can check, confirm the success state, then check the recipient inbox and spam folder. Provider acceptance alone is not proof of inbox delivery.
