# Summit Webs — Agency Command Center

Internal dashboard for running the agency day-to-day. Not public-facing — runs on localhost only.

```
cd agency-dashboard
npm install
npm run dev
```

Open **http://localhost:3000**

---

## Pages

| Route | What it does |
|---|---|
| `/` | Overview — leads, clients, MRR, open tasks pulled live from the CRM sheet |
| `/agents` | 8-role AI agent roster |
| `/chat` | Claude-powered assistant with full business context (pricing, niche, packages) |
| `/clients` | CRM table synced from Google Sheets |
| `/leads` | Lead Finder — generates Google Maps search URLs for NE Ohio areas + quick-add form to push new leads into the CRM sheet |
| `/outreach` | AI Email Outreach — two tabs: initial cold emails for "New" leads, and follow-up drafts for "Contacted" leads at Day 3 / Day 7 / Day 14 windows. All drafts saved to Gmail Drafts. |

To change business details (pricing, positioning, agent roles), edit **`lib/business.ts`** — the dashboard UI, the chat assistant, and the outreach prompts all pull from this one file.

---

## Environment variables (`agency-dashboard/.env.local`)

Copy `.env.local.example` to `.env.local` and fill in:

```
ANTHROPIC_API_KEY=
GOOGLE_SHEETS_ID=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
GMAIL_USER_EMAIL=summitwebsco@gmail.com
```

---

## 1. Anthropic API key (required for Chat + Outreach)

1. Go to https://console.anthropic.com
2. Create an API key
3. Paste it into `.env.local` as `ANTHROPIC_API_KEY`

The chat and outreach pages use `claude-sonnet-4-5`. Typical solo-agency usage (a few conversations + a batch of outreach drafts per week) runs a few dollars a month.

---

## 2. Google Sheets CRM (required for Overview + Clients & Leads + Find Leads + Outreach)

### Create the sheet

1. Create a new Google Sheet called **"Agency CRM"**
2. Add four tabs with these exact names and headers:

**Dashboard** tab — a summary tab with formulas referencing the other tabs:
```
Total Leads | New Leads | Quoted Leads | Won Leads | Active Clients | Total MRR | Open Tasks | Tasks Done
```

**Leads** tab (app reads columns A–G):
```
Business | Contact | Email | Phone | Status | Last Contact | Notes
```
Status dropdown: `New`, `Contacted`, `Quoted`, `Won`, `Lost`

**Clients** tab (app reads columns A–E):
```
Business | Contact | Retainer Tier | MRR | Status
```
Retainer Tier dropdown: `Starter`, `Pro`, `Premium`
Status dropdown: `Active`, `Paused`, `Churned`

**Tasks** tab (app reads columns A–D):
```
Task | Owner | Status | Due
```
Status dropdown: `Not Started`, `In Progress`, `Done`, `Blocked`

### Connect the service account

3. Share the sheet with **Viewer** access (Editor if you want Claude Code to help format it) to:

   `trade-journal@trade-journal-498619.iam.gserviceaccount.com`

   (This is the service account in `credentials.json` at the root of the repo.)

4. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/**THIS_PART**/edit`

5. Paste it into `.env.local` as `GOOGLE_SHEETS_ID`

Restart `npm run dev` after editing `.env.local`. If you skip this step the dashboard still works — Overview shows zeros and tables show empty with a setup banner.

### How the Lead Finder writes to the sheet

The `/leads` page has a quick-add form that POSTs to `/api/leads`. It appends a new row to the **Leads** tab with status `New` and today's date. For this write to work, the service account needs **Editor** access on the sheet.

---

## 3. Gmail OAuth (required for outreach drafts saving to Gmail)

The `/outreach` page generates AI-written emails and saves them directly to the **Drafts** folder of `summitwebsco@gmail.com`. This requires a separate OAuth client (not the Sheets service account).

### Setup (one-time)

1. In [Google Cloud Console](https://console.cloud.google.com), open project `trade-journal-498619`
2. Go to **APIs & Services > Library**, search **Gmail API**, click **Enable**
3. Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**
   - If prompted to configure the consent screen: User type **External**, app name "Summit Webs Dashboard", add `summitwebsco@gmail.com` as a test user, save. (Test mode is fine — this app is only ever used by you.)
   - Application type: **Desktop app**
4. Copy the **Client ID** and **Client Secret** into `.env.local`
5. Run the one-time auth flow:
   ```bash
   node scripts/gmail-auth.mjs
   ```
6. Open the URL it prints, sign in as `summitwebsco@gmail.com`, approve access
7. The terminal prints `GMAIL_REFRESH_TOKEN=...` — paste that into `.env.local`
8. Restart `npm run dev`

**This has already been done.** The `GMAIL_REFRESH_TOKEN` is already in `.env.local`. You only need to redo this if the token is revoked or the credentials change.

If Gmail isn't connected, the outreach page still works — it generates and displays email drafts on screen for you to copy/paste, but won't save them into Gmail.

---

## 4. Outreach & follow-up workflow

### Initial outreach (`/outreach` → "Initial Outreach" tab)

1. Add leads via the Find Leads page (`/leads`) or directly in the CRM sheet
2. Go to `/outreach` → "Initial Outreach" tab
3. All leads with status `New` appear in the table — uncheck any you want to skip
4. Click **Generate drafts** → Claude writes a personalized cold email for each lead
5. Drafts are saved to Gmail Drafts folder. Click "Open Gmail Drafts →" to review and send.
6. After sending, update the lead's status to `Contacted` and set `Last Contact` to today's date in the sheet

### Follow-ups (`/outreach` → "Follow-ups Due" tab)

The dashboard auto-detects leads with status `Contacted` that are in a follow-up window:
- **Day 3** (2–4 days since last contact) — light friendly check-in, ~3–4 sentences
- **Day 7** (6–9 days) — slightly more direct, re-mentions the free mockup offer
- **Day 14** (13–16 days) — final short follow-up, polite, leaves door open

When you open `/outreach`, the "Follow-ups Due" tab shows any leads currently in one of these windows. Select them, click Generate, and drafts are saved to Gmail.

---

## 5. Calendly (already connected)

The marketing site's Final CTA section (`agency-site/index.html`) embeds Calendly for self-scheduling.

Current link: `https://calendly.com/summitwebsco/30min`

To change it: search for `calendly.com/summitwebsco` in `agency-site/index.html` and replace both occurrences (the `data-url` on the widget and the fallback `href`).

---

## Pricing (current)

**Build packages (one-time):**
- Starter Site — $97
- Pro Site — $147
- Premium Site — $297

**Monthly care plans:**
- Care — $50/mo (hosting, SSL, security, uptime, 1 edit/mo, monthly report)
- Growth — $150/mo (Care + 4 edits/mo, 1 local SEO blog post/mo, review-request automation, quarterly call)
- Growth+ — $250/mo (Growth + managed Google/Meta ad campaigns, dedicated landing page, weekly reporting)

To update any of these, edit `lib/business.ts`. The overview page, chat assistant, and outreach prompts all read from that file.

---

## File structure

```
app/
  page.tsx              Overview dashboard
  agents/page.tsx       AI agent roster
  chat/page.tsx         Claude chat
  clients/page.tsx      CRM table
  leads/page.tsx        Lead finder
  outreach/page.tsx     AI outreach + follow-ups
  api/
    chat/route.ts       Chat API (Claude)
    leads/route.ts      Append row to Leads sheet
    outreach/route.ts   Generate drafts via Claude + save to Gmail
components/
  Sidebar.tsx           Nav sidebar
  LeadFinder.tsx        Google Maps URL generator + quick-add form
  OutreachPanel.tsx     Outreach tabs UI (initial + follow-ups)
lib/
  business.ts           All business config — pricing, packages, agent roles, system prompt
  sheets.ts             Google Sheets API wrapper (service account auth)
  gmail.ts              Gmail OAuth2 draft creation
scripts/
  gmail-auth.mjs        One-time OAuth flow to get Gmail refresh token
```
