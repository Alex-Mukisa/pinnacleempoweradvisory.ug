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
2. Sign in to Render, open [New Blueprint](https://dashboard.render.com/blueprints/new), and connect `Alex-Mukisa/pinnacleempoweradvisory.ug` from GitHub. Select branch `main`; Render will read this repository's `render.yaml`.
3. Approve the web service and persistent disk plan in Render. The Blueprint requests the Starter service and a 1 GB disk, which may incur charges under Render's current pricing.
4. Set `CONTACT_EMAIL` to `pinnacleempoweradvisory@gmail.com`. Add private `RESEND_API_KEY` and `RESEND_FROM_EMAIL` values in Render after verifying the sender domain in Resend. Set `AI_API_KEY` if live model answers are required; the local FAQ works without it.
5. Deploy and check `/api/health`. Confirm it reports `contactEmail: "configured"`; it exposes readiness only, never secret values. The Render disk is mounted at `/var/data` so SQLite chat history persists across restarts.
6. Add `pinnacleempoweradvisory.ug` under the service's Custom Domains settings, then configure the exact DNS records Render provides at your registrar. Render provisions HTTPS after DNS verification.

The application, API, and database run on the same Node service. Do not publish only the `dist` folder: that would omit the chat API and database. The included Render plan uses a paid persistent disk/service; select an appropriate plan in the host dashboard before deployment.

The configured domain name does not itself register the domain or make the website public. Registration, DNS configuration, and a successful Render deployment are still required. The canonical and social-sharing URLs are set to `https://pinnacleempoweradvisory.ug/`.

## Checks

```sh
npm test
npm run lint
npm run build
```

For a real test enquiry after configuring the provider, run the site, submit the contact form with a mailbox you can check, confirm the success state, then check the recipient inbox and spam folder. Provider acceptance alone is not proof of inbox delivery.
