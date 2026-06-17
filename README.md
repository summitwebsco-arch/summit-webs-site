# Summit Webs

A solo, AI-assisted website agency targeting landscaping & lawn care companies in Northeast Ohio (Twinsburg, Hudson, Solon, Macedonia, Aurora). This repo contains the agency marketing site, internal command-center dashboard, and all supporting tooling.

---

## Business model

**Build packages (one-time fee):**
- Starter Site — $97 (1-page: hero, services, about, contact form, click-to-call, Google Maps embed)
- Pro Site — $147 (up to 5 pages, custom copywriting, on-page SEO, Google Business Profile optimization, quote/booking form)
- Premium Site — $297 (everything in Pro + SEO blog section, online booking integration, automated review-request system, multi-location pages)

**Monthly care plans** (pairs with any build package):
- Care — $50/mo (hosting, SSL, uptime monitoring, security updates, 1 edit/month, monthly performance report)
- Growth — $150/mo (Care + 4 edits/month, 1 local SEO blog post/month, automated review-request system, quarterly strategy call)
- Growth+ — $250/mo (Growth + managed Google/Meta ad campaigns run from our own ad accounts, dedicated landing page, weekly reporting)

All business config (pricing, positioning, agent roles, system prompt) lives in **`agency-dashboard/lib/business.ts`** — this single file feeds the dashboard UI, the chat assistant, and the AI outreach prompts.

---

## Repo layout

```
agency-site/          Marketing site (static HTML/CSS/JS) — served on the live domain
agency-dashboard/     Next.js "Agency Command Center" — internal tool, localhost only
credentials.json      Google service account credentials (for Sheets API access)
PRODUCT.md            Strategic design brief for agency-site
DESIGN.md             Visual design system spec for agency-site
```

---

## agency-site/ — marketing site

Static site (`index.html`, `styles.css`, `script.js`) — no build step, open `index.html` in a browser or serve the folder.

**Contact:** summitwebsco@gmail.com · (216) 906-4498
**Calendly:** https://calendly.com/summitwebsco/30min

### Page sections

| # | Section | Notes |
|---|---|---|
| 01 | Hero | Headline, stats, CTA → `#contact` |
| 02 | Problem | Stat callout strip |
| 03 | Solution | Feature list — what we handle end-to-end |
| 04 | Our Work | 3 outcome cards + before/after comparison slider + "what we did" breakdown. Slider shows Ryan's Home Improvements (rhrenovationscle.com) — real text-based mockups, not placeholder blocks. |
| 05 | How It Works | 3-step process (mockup → build → manage) |
| 06 | Testimonials | 5 reviews — Ryan Howard (real), 4 placeholder until more clients |
| 07 | Pricing | Two-step layout: build package cards ($97/$147/$297) + monthly care plan cards ($50/$150/$250). All "Get Started" buttons open Gmail compose. |
| 08 | Contact / CTA | Two-column split: left = Calendly embed, right = Gmail compose button + email/phone |
| — | FAQ | 6 questions |
| — | Footer | Nav links + Privacy & Terms |

### Key files

- `index.html` — all content and section markup
- `styles.css` — all styles including CSS custom properties (design tokens), slider mock CSS (`.sm-new-*`, `.sm-old-*`), pricing grid, testimonial grid, contact split layout
- `script.js` — scroll-reveal, 3D tilt, cursor spotlight, compare slider drag logic, mobile nav, FAQ accordion, hero stat counter
- `privacy.html` — privacy policy + terms of service (CAN-SPAM compliant)

### Email buttons

All email CTAs use Gmail compose URLs (open in new tab) instead of `mailto:`:
```
https://mail.google.com/mail/?view=cm&fs=1&to=summitwebsco@gmail.com&subject=...
```
The main contact CTA pre-fills the body with a template the prospect can fill in.

### Brand

Forest green (`#1f5f3f`) + navy (`#1c2b3a`) + warm orange accent (`#f2a93b`). Poppins (headings) / Inter (body). Design tokens in `styles.css` `:root` block.

---

## agency-dashboard/ — Agency Command Center

Local Next.js app (Next.js 16, Tailwind v4, TypeScript). Internal tool — runs on localhost, never deployed publicly.

```bash
cd agency-dashboard
npm install
npm run dev
```

Open **http://localhost:3000**

### Pages

| Route | What it does |
|---|---|
| `/` | Overview — leads, clients, MRR, open tasks from CRM + pricing summary |
| `/agents` | 8-role AI agent roster |
| `/chat` | Claude chat assistant (knows pricing, packages, niche, agent team) |
| `/clients` | Full CRM table from Google Sheets |
| `/leads` | Lead Finder — NE Ohio Google Maps URL generator + quick-add form → writes directly to the Leads sheet |
| `/outreach` | AI Email Outreach — initial cold emails for "New" leads + Day 3/7/14 follow-up drafts for "Contacted" leads. All saved to Gmail Drafts. |

Full setup instructions (env vars, Google Sheets schema, Gmail OAuth) are in **`agency-dashboard/README.md`**.

---

## CRM (Google Sheets)

Sheet ID stored in `agency-dashboard/.env.local` as `GOOGLE_SHEETS_ID`.

Accessed via the service account in `credentials.json`:
`trade-journal@trade-journal-498619.iam.gserviceaccount.com`

### Sheet tabs

**Leads** — Business | Contact | Email | Phone | Status | Last Contact | Notes
- Status: `New` → `Contacted` → `Quoted` → `Won` / `Lost`
- The `/outreach` page reads status + last contact date to detect follow-up windows
- The `/leads` page writes new rows here via `/api/leads`

**Clients** — Business | Contact | Retainer Tier | MRR | Status
- Retainer Tier: `Starter` / `Pro` / `Premium`
- Status: `Active` / `Paused` / `Churned`

**Tasks** — Task | Owner | Status | Due

**Dashboard** — formula-driven summary tab (totals fed into the Overview page)

---

## AI outreach system

**Initial outreach:** `/outreach` → "Initial Outreach" tab shows all `New` leads. Select, click Generate — Claude writes a personalized cold email per lead, saved to Gmail Drafts for review before sending. After sending, change lead status to `Contacted` and set Last Contact date.

**Follow-up sequence** (on-demand, not auto-send):
- `/outreach` → "Follow-ups Due" tab auto-detects `Contacted` leads in these windows:
  - Day 3 (2–4 days since last contact) — short friendly check-in
  - Day 7 (6–9 days) — slightly more direct, re-mentions free mockup
  - Day 14 (13–16 days) — final polite follow-up, leaves door open
- Select leads in-window → Generate → drafts saved to Gmail

Prompt behavior (tone, word count, framing per day) lives in `agency-dashboard/app/api/outreach/route.ts`.

---

## Credentials & secrets

All in `agency-dashboard/.env.local` (not committed):

```
ANTHROPIC_API_KEY        Claude API — console.anthropic.com
GOOGLE_SHEETS_ID         ID from the CRM sheet URL
GMAIL_CLIENT_ID          OAuth client ID from Google Cloud Console
GMAIL_CLIENT_SECRET      OAuth client secret
GMAIL_REFRESH_TOKEN      Generated by running: node scripts/gmail-auth.mjs
GMAIL_USER_EMAIL         summitwebsco@gmail.com
```

`credentials.json` at the repo root holds the Google service account key for Sheets access (separate from Gmail OAuth).

---

## Next steps / open items

- Add Google Analytics + Search Console to agency-site
- Build real portfolio examples as client base grows (replace placeholder reviews with verified ones)
- Register agency domain and point it to agency-site
- Set up Google Workspace email if needed (or keep using summitwebsco@gmail.com)

---

## Changelog

### June 16, 2026

**Gmail auto-notification on lead form**
`submit-lead.js` now fires an email to `summitwebsco@gmail.com` every time someone submits the lead form. Uses OAuth2 refresh token flow (not a service account) — no external npm packages, just built-in `https`. Required adding `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` to Netlify environment variables.

**Netlify deploy fixes**
- Removed `ignore = "exit 1"` that was blocking all auto-deploys
- Deleted duplicate `agency-site/netlify.toml` that conflicted with the root-level one
- Added explicit `command = ""` to root `netlify.toml` so Netlify doesn't try to auto-detect a framework build
- Stripped `googleapis` and `stripe` from root `package.json` — functions use zero external deps

**Homepage copy cleanup**
Removed all 29 em dashes from `index.html` that made the copy read as AI-generated. Replaced with periods, commas, or colons depending on context.

**3D canvas showcase — full rewrite (`3d-scene.js`)**
Replaced a static/underutilized canvas with a showcase that demonstrates the agency's design range. Three website mockups cycle every 8 seconds with a crossfade transition:

- **GreenEdge Landscaping** — dark emerald, split hero, circular photo, floating stat cards, service strip
- **Sunrise Grounds** — warm earthy dark-brown, centered hero, gallery cards, stats bar
- **Apex Grounds** — deep navy + cyan, asymmetric hero, giant glowing "97%" satisfaction number, monospace nav

Each site has a matching mobile version rendered on the iPhone mesh. Background replaced with topographic contour lines — organic terrain curves in deep green radiating from behind the devices, referencing landscaping/land design. MacBook pulled closer (`-1.0, -0.8, 0`) and camera moved from z=10 to z=7 for better device visibility.
