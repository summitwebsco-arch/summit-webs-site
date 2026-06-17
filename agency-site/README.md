# Summit Webs — Agency Site

Marketing and sales site for **Summit Webs**, a web design agency specializing in landscaping and lawn care businesses across Northeast Ohio.

---

## Pages

| File | URL | Purpose |
|------|-----|---------|
| `index.html` | `/` | Main marketing site |
| `buy.html` | `/buy.html` | Payment / package selection page |
| `privacy.html` | `/privacy.html` | Privacy policy & terms |

---

## Pricing

### Build Packages (one-time fee)

| Package | Price | What's included |
|---------|-------|-----------------|
| **Basic** | $97 | 1-page site (hero, services, contact), click-to-call, contact form, Google Maps, mobile-optimised, free mockup, live ~1 week |
| **Pro** | $147 | Up to 5 pages, we write all copy, photo gallery, quote/booking form, on-page SEO, Google Business Profile setup, Google Analytics, free mockup, live 7–14 days |
| **Premium** | $197 | Everything in Pro + SEO blog, online booking calendar, automated review-request system, multi-city/service landing pages, competitor research, free mockup, live ~2 weeks |

### Monthly Care Plans

| Plan | Price | What's included |
|------|-------|-----------------|
| **Essential** | $50/mo | Hosting, SSL, weekly security monitoring, automatic backups, uptime monitoring, 1 edit/mo |
| **Growth** | $100/mo | Everything in Essential + up to 4 edits/mo, 1 local SEO blog post/mo (we write & publish), monthly Google Analytics report, quarterly strategy call |
| **Pro** | $150/mo | Everything in Growth + managed Google Ads campaigns, dedicated ad landing page, weekly performance reports, unlimited edit requests, 48-hr priority turnaround |

---

## Contact & Business Info

- **Email:** summitwebsco@gmail.com
- **Phone:** (216) 906-4498
- **Service area:** Twinsburg, Hudson, Solon, Macedonia, Aurora & surrounding NE Ohio

---

## Tech Stack

- **Pure HTML/CSS/JS** — no build step, no framework
- **Three.js r0.128.0** (CDN) — 3D MacBook + iPhone showcase on the homepage
- **Calendly** — embedded booking widget in the contact section
- **Stripe** — payment links on `buy.html` (see setup below)
- **Netlify** — hosting & deployment

---

## File Structure

```
agency-site/
├── index.html      # Main marketing site
├── buy.html        # Package selection & payment page
├── privacy.html    # Privacy policy
├── styles.css      # All styles for index.html
├── script.js       # Nav, scroll animations, counter animations
└── 3d-scene.js     # Three.js 3D device showcase
```

---

## Deployment (Netlify)

1. Push changes to the `master` branch on GitHub (`summitwebsco-arch` account)
2. Netlify auto-deploys from the repo — no manual steps needed
3. The site is static so no build command is required; set **Publish directory** to `/` (root)

To deploy manually:
1. Go to [app.netlify.com](https://app.netlify.com)
2. Connect the GitHub repo under the `summitwebsco@gmail.com` account
3. Build command: *(leave blank)*
4. Publish directory: `.`

---

## Stripe Setup (buy.html)

The buy page currently falls back to a pre-filled Gmail compose when Stripe isn't configured. To wire up real payments:

1. Create three one-time payment products in your [Stripe Dashboard](https://dashboard.stripe.com):
   - Basic Site — $97
   - Pro Site — $147
   - Premium Site — $197
2. Generate a **Payment Link** for each product
3. Open `buy.html` and find the `stripeLinks` object near the bottom:

```js
const stripeLinks = {
  basic:   '#',   // replace with 'https://buy.stripe.com/...'
  pro:     '#',   // replace with 'https://buy.stripe.com/...'
  premium: '#',   // replace with 'https://buy.stripe.com/...'
};
```

4. Replace each `'#'` with the corresponding Stripe payment link URL
5. Save and push — the CTA button will now route directly to Stripe checkout

---

## Calendly Setup

The contact section embeds a Calendly inline widget pointing to:

```
https://calendly.com/summitwebsco/30min
```

To change the link, search `index.html` for `calendly.com/summitwebsco` and update both occurrences (the inline widget `data-url` and the fallback `<a>` tag).

---

## URL Params (buy.html)

The pricing section on `index.html` passes a `?plan=` param so the right package is pre-selected when the user arrives on `buy.html`:

| Link | Pre-selects |
|------|------------|
| `buy.html?plan=basic` | Basic build card |
| `buy.html?plan=pro` | Pro build card |
| `buy.html?plan=premium` | Premium build card |

You can also pass `?care=essential`, `?care=growth`, or `?care=pro-care` to pre-select a care plan.

---

## 3D Scene (3d-scene.js)

The homepage portfolio section shows a live Three.js scene with a MacBook and iPhone displaying a demo landscaping site ("Green Lines Landscaping"). Key details:

- **Library:** Three.js r0.128.0 via CDN (global `THREE`)
- **MacBook canvas:** 1200×750, drawn every frame with `drawDesktop(scrollFrac)`
- **iPhone canvas:** 480×1032, drawn every frame with `drawMobile(scrollFrac)`
- **Camera sway:** gentle sine-wave motion + mouse parallax
- **Background:** nebula skybox, star field, dust planes, platform ring

---

## Making Content Changes

### Update pricing on the main site
Edit the `<!-- PRICING -->` section in `index.html` (around line 308).  
Keep prices in sync with `buy.html` — the `data-price` attributes on radio inputs drive the live order summary.

### Update packages on the payment page
Edit the build grid (`#buildGrid`) and care grid (`#careGrid`) in `buy.html`.  
Each radio input has `data-price` (number) and `data-label` (string) — update these when changing prices.

### Update contact info
Search both `index.html` and `buy.html` for `summitwebsco@gmail.com` and `(216) 906-4498`.

### Add new pages
Create the `.html` file in the root, add a link to the nav in `index.html`, and add it to the footer nav.
