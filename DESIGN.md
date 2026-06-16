---
name: Buckeye Web Co.
description: Premium, locally-grounded marketing site for a NE Ohio landscaping-website agency
colors:
  pine: "#1f5f3f"
  pine-deep: "#143f29"
  fresh-cut: "#2d7a52"
  marigold: "#f2a93b"
  dusk-navy: "#1c2b3a"
  charcoal: "#2a2f33"
  stone: "#6b7280"
  morning-mist: "#f6f8f6"
  hairline-sage: "#e3e8e4"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "2.9rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Poppins, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.pine-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.pine}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-outline-hover:
    backgroundColor: "{colors.pine}"
    textColor: "#ffffff"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.lg}"
    padding: "32px"
  card-featured:
    backgroundColor: "{colors.morning-mist}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.lg}"
    padding: "32px"
---

# Design System: Buckeye Web Co.

## 1. Overview

**Creative North Star: "The Trusted Local Crew"**

Buckeye Web Co. should feel like the work of a small, sharp local outfit — the kind of operator a landscaping business owner already trusts to show up, do clean work, and not waste their time. The system pairs confident, generously-spaced Poppins headlines with calm Inter body text, set against soft sage-tinted neutrals and a single deep pine green that carries the brand. Pops of marigold orange mark the one thing that matters on any given screen: the call to action.

This system explicitly rejects the generic AI/SaaS-startup look: no cream or beige "parchment" backgrounds, no gradient text, no tiny uppercase tracked eyebrows stacked above every section, no identical three-card grids repeated section after section, no colored side-stripe borders on callouts, and no stock hero-metric templates. Every section should read as deliberately composed for this business, not assembled from a template library.

**Key Characteristics:**
- Deep pine green as the singular brand color, used sparingly and with intent
- Soft sage-neutral backgrounds (morning mist) alternating with white to create rhythm without borders
- Poppins for headlines (confident, geometric, slightly rounded), Inter for body (calm, legible)
- Layered, soft shadows rather than hard borders to convey depth
- Marigold orange reserved almost exclusively for primary CTAs and key accents

## 2. Colors

The palette is restrained: one dominant green, one warm accent, and a family of cool-toned neutrals that read as "fresh" rather than "corporate."

### Primary
- **Deep Pine** (#1f5f3f): The brand color. Used for primary buttons, links, icon strokes, price highlights, and the logo. Carries the "this is a real, trustworthy local business" feeling.
- **Pine Deep** (#143f29): Hover/active state for pine-colored elements — buttons darken into this on press/hover.
- **Fresh Cut** (#2d7a52): A lighter step of pine, used only in gradients (hero mockup title bar, step-number badges) to add dimension without introducing a second color.

### Secondary
- **Marigold** (#f2a93b): The single warm accent. Reserved for the hero floating badge, mockup "button" element, and pricing badges ("Most Popular"). Its rarity is what makes it land.

### Tertiary
- **Dusk Navy** (#1c2b3a): Used for headings (h1-h3) and the final-CTA section background. Reads as "ink," grounding the page without being pure black.

### Neutral
- **Charcoal** (#2a2f33): Default body text color.
- **Stone** (#6b7280): Muted/secondary text — subheads, captions, FAQ answers.
- **Morning Mist** (#f6f8f6): Alternate section background, replacing every other full-bleed section to create rhythm.
- **Hairline Sage** (#e3e8e4): Borders, dividers, and card outlines. Always 1px, never thicker.

### Named Rules
**The One Accent Rule.** Marigold (#f2a93b) appears in at most 2-3 places per page. If a page has more than one marigold element competing for attention, remove one.

## 3. Typography

**Display Font:** Poppins (with system sans-serif fallback)
**Body Font:** Inter (with system sans-serif fallback)

**Character:** Poppins' geometric, slightly rounded letterforms give headlines warmth and confidence without feeling corporate; Inter's neutrality keeps long-form copy calm and easy to scan. The pairing reads as "professional but human."

### Hierarchy
- **Display** (700, 2.9rem, line-height 1.2, letter-spacing -0.01em): Hero `<h1>` only. The single boldest statement on the page.
- **Headline** (700, 2rem, line-height 1.2): Section heads (`<h2>` for Problem, Solution, Pricing, Process, FAQ, Final CTA).
- **Title** (700, 1.15-1.25rem): Card/step titles (`<h3>` in solution cards, price cards, process steps).
- **Body** (400, 1rem-1.05rem, line-height 1.6, max ~65-70ch): Paragraph copy, FAQ answers, card descriptions. Color is stone (#6b7280) for secondary copy, charcoal (#2a2f33) for primary.
- **Label** (700, 0.8rem, letter-spacing 0.08em, uppercase): The hero eyebrow only — this treatment must NOT repeat above every section.

### Named Rules
**The One Eyebrow Rule.** Uppercase tracked labels are a hero-only device. No other section gets one — repeating it everywhere is the generic-template tell this system explicitly avoids.

## 4. Elevation

The system uses soft, diffuse shadows as the primary depth cue — there is no hard 1px-border-everywhere look, and no flat Material-style tonal layering. Shadows grow on hover to signal interactivity (cards lift, buttons lift), and shrink back at rest. Borders (hairline sage, 1px) are used only where a shadow would be too subtle against a white-on-white background.

### Shadow Vocabulary
- **Ambient small** (`box-shadow: 0 2px 8px rgba(28, 43, 58, 0.06)`): Resting state for cards, mockup tiles, and the scrolled header.
- **Ambient medium** (`box-shadow: 0 8px 24px rgba(28, 43, 58, 0.08)`): Hover state for solution cards, price cards, FAQ items, and the hero floating badge.
- **Ambient large** (`box-shadow: 0 20px 60px rgba(28, 43, 58, 0.15)`): The hero mockup frame — the single most "lifted" element on the page, establishing the visual focal point.
- **Tinted glow (pine)** (`box-shadow: 0 4px 14px rgba(31, 95, 63, 0.25)`, hover `0 8px 20px rgba(31, 95, 63, 0.32)`): Primary buttons — the shadow is tinted with the brand color rather than neutral gray.
- **Tinted glow (marigold)** (`box-shadow: 0 6px 16px rgba(242, 169, 59, 0.3)`): The mockup CTA element only, reinforcing marigold's "this is the button" signal even inside a miniature.

### Named Rules
**The Lift-on-Hover Rule.** Every interactive card or button increases its shadow depth and translates up 2-6px on hover/focus. A static card with no hover state feels unfinished in this system.

## 5. Components

### Buttons
- **Shape:** Gently rounded corners (8px radius).
- **Primary:** Deep pine background (#1f5f3f), white text, 14px/28px padding, tinted pine shadow at rest that deepens on hover; background darkens to pine-deep (#143f29) and the button lifts 2px on hover.
- **Outline:** Transparent background, 2px pine border and text; on hover, fills solid pine with white text and lifts 2px.
- **Ghost/Link:** No background or border; pine text with an animated underline that grows from 0% to 100% width on hover (0.25s ease).
- **Large variant:** 1.125rem text, 16px/36px padding — used for the primary hero and final-CTA buttons only.

### Cards
- **Corner Style:** 12px radius (solution cards, price cards), 14px for the hero mockup frame.
- **Background:** White by default. The "featured" pricing card uses a subtle top-down pine-tinted gradient (`rgba(31,95,63,0.04)` to white) instead of a flat fill, plus a pine border instead of sage.
- **Shadow Strategy:** Flat/bordered at rest (1px hairline sage border, ambient-small shadow optional); ambient-medium shadow + 6px lift on hover. The featured price card sits permanently 8px elevated with a tinted pine shadow, deepening further on hover.
- **Border:** 1px hairline sage (#e3e8e4) at rest; pine border on the featured price card and on FAQ-item hover.
- **Internal Padding:** 32px.

### Icon Tiles
- **Style:** 64x64px rounded square (16px radius), morning-mist background, pine-colored SVG stroke icons centered inside. Used for the three Solution-section capability icons. Icons are inline SVG (wrench, shield, chart) — never emoji.

### Stat Callout
- **Style:** A horizontal flex row (not a stripe-bordered box): a small white circular icon tile (shadow ambient-small, pine icon) sits beside bold navy stat text, on a morning-mist rounded (10px) background. This replaces any colored-left-border callout pattern.

### Navigation
- **Style:** Sticky header, 85%-opacity white with backdrop-blur(10px), 1px hairline-sage bottom border. On scroll past 8px, opacity increases to 95% and an ambient-small shadow appears.
- **Typography:** Logo in Poppins 800/1.4rem, pine-colored. Nav links in Inter 500, charcoal, turning pine on hover.
- **Mobile:** Collapses to a hamburger toggle (three navy bars); open state reveals links in a full-width white dropdown panel with a sage bottom border. Toggle carries `aria-expanded`.

### FAQ Items
- **Style:** White rounded (8px) cards with 1px hairline-sage border and 16px/20px padding, stacked with 12px gaps. A `+`/`−` glyph (not a chevron icon) indicates collapsed/expanded state, right-aligned, pine-colored.
- **State:** On hover, border turns pine and an ambient-small shadow appears. No layout shift on expand beyond the natural height change.

### Step Markers (Process section)
- **Style:** 48px circle with a pine-to-fresh-cut diagonal gradient, white bold Poppins numeral, tinted pine shadow (`0 6px 16px rgba(31,95,63,0.25)`). Used once per process step — this is the system's one permitted "numbered marker," and only because it represents an actual sequence (build steps), not decorative section numbering.

## 6. Do's and Don'ts

### Do:
- **Do** alternate section backgrounds between white and morning-mist (#f6f8f6) to create rhythm without adding borders or dividers.
- **Do** vary section layout structure — grids, horizontal splits, centered single-column, stat callouts — so no two consecutive sections share the same shape (per PRODUCT.md Design Principle 3: "Vary section rhythm").
- **Do** use marigold (#f2a93b) only for the hero badge, mockup CTA, and pricing "most popular" badge — 2-3 instances per page maximum.
- **Do** give every interactive element (cards, buttons, FAQ items, nav links) a hover and `:focus-visible` state with a 2px pine outline.
- **Do** use inline SVG icons (wrench, shield, chart, star, checkmark) at 24px in pine or white — never emoji.
- **Do** respect `prefers-reduced-motion`: scroll-reveal, float, and hover-lift animations must have a reduced/instant alternative.

### Don't:
- **Don't** use cream, beige, or parchment body backgrounds — the neutral palette is sage-tinted white/morning-mist only.
- **Don't** use gradient text anywhere, including headings or stat numbers.
- **Don't** stack a tiny uppercase tracked "eyebrow" label above every section — it's a hero-only device (The One Eyebrow Rule).
- **Don't** repeat an identical three-card grid in consecutive sections (e.g., Solution → Pricing → Process all as 3-up grids back to back). Each section earns its own structure.
- **Don't** use a colored left-border stripe on callouts — the stat callout uses an icon tile + flex row instead.
- **Don't** use stock "hero metric" templates (giant number + label in a box) — outcomes should be shown through copy and the mockup visual, not a metrics dashboard aesthetic.
- **Don't** use any border heavier than 1px, or any border color other than hairline sage (#e3e8e4) or pine (#1f5f3f) for featured/hover states.
