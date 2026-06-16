export const businessProfile = {
  name: "Summit Webs",
  niche: "Landscaping & lawn care companies in Northeast Ohio (Twinsburg, Hudson, Solon, Macedonia, Aurora)",
  positioning:
    "We build and manage websites that turn local searches into booked jobs — for landscaping and lawn care businesses who don't have time to think about their website ever again.",
  buildPackages: [
    {
      name: "Starter Site",
      price: "$97",
      includes:
        "1-page mobile-friendly site: hero, services, about, testimonials, gallery, contact form, click-to-call, Google Maps embed.",
    },
    {
      name: "Pro Site",
      price: "$147",
      includes:
        "Up to 5 pages, custom copywriting, basic on-page SEO, Google Business Profile optimization, booking/quote-request form.",
    },
    {
      name: "Premium Site",
      price: "$297",
      includes:
        "Everything in Pro plus blog/content section for SEO, online booking, review-collection automation, multi-location pages.",
    },
  ],
  retainerPlans: [
    {
      name: "Care Plan",
      price: "$50/mo",
      includes:
        "Hosting, SSL, uptime monitoring, security updates, 1 content edit/month, monthly performance report. Everything runs on our infrastructure — no access to the client's accounts needed.",
    },
    {
      name: "Growth Plan",
      price: "$150/mo",
      includes:
        "Everything in Care + up to 4 edits/month, 1 local-SEO blog post/month (written & published by us on their site), an automated review-request system (we send customers a public Google review link via email/text — no Google Business login needed), and a quarterly strategy call.",
    },
    {
      name: "Growth+ Plan",
      price: "$250/mo",
      includes:
        "Everything in Growth + a managed Google/Meta ad campaign that we run from our own ad accounts (client only funds the ad spend budget — no account access needed), a dedicated landing page for the campaign, weekly performance reporting, and 48hr priority turnaround.",
    },
  ],
  upsells: [
    "Local SEO blog content packages (written & published by us)",
    "Automated review-request system (public review link via email/SMS — no Google Business access needed)",
    "Managed Google/Meta ad campaigns (run from our ad accounts; client only provides ad budget)",
    "Dedicated landing pages for ad campaigns",
    "Domain + professional email setup (registered/managed on our side)",
    "Additional pages",
    "Rebuild/redesign cycles every 2-3 years",
  ],
};

export type AgentRole = {
  id: string;
  name: string;
  job: string;
  automationLevel: "Mostly automated" | "Semi-automated" | "Human-led";
  tools: string;
};

export const agentRoster: AgentRole[] = [
  {
    id: "lead-research",
    name: "Lead Research Agent",
    job: "Finds local landscaping/lawn care businesses with weak or missing websites; compiles business name, owner, phone, email, and current site status into the CRM.",
    automationLevel: "Semi-automated",
    tools: "Claude + Google Maps/search, Google Sheets CRM",
  },
  {
    id: "outreach-copy",
    name: "Outreach Copy Agent",
    job: "Drafts personalized cold emails based on lead research notes, referencing specific issues with each prospect's current website.",
    automationLevel: "Semi-automated",
    tools: "Claude",
  },
  {
    id: "follow-up",
    name: "Follow-up Agent",
    job: "Generates follow-up sequence drafts (Day 3, Day 7-8, Day 14) and tracks who's been contacted and when.",
    automationLevel: "Semi-automated",
    tools: "Claude + Google Sheets CRM",
  },
  {
    id: "proposal",
    name: "Proposal Agent",
    job: "Drafts custom proposals and quotes immediately after discovery calls, based on the build packages and retainer plans.",
    automationLevel: "Semi-automated",
    tools: "Claude (template-based)",
  },
  {
    id: "project-manager",
    name: "Project Manager Agent",
    job: "Builds project checklists and timelines per client, tracks build status from kickoff to launch.",
    automationLevel: "Semi-automated",
    tools: "Claude + Google Sheets / Notion",
  },
  {
    id: "site-builder",
    name: "Site Builder Agent",
    job: "Generates copy, layout suggestions, and image prompts for client websites; builds the actual site code.",
    automationLevel: "Semi-automated",
    tools: "Claude + custom code / Netlify",
  },
  {
    id: "client-update",
    name: "Client Update Agent",
    job: "Drafts monthly report emails to retainer clients summarizing what was done and performance changes.",
    automationLevel: "Mostly automated",
    tools: "Claude + analytics data",
  },
  {
    id: "reporting-reviews",
    name: "Reporting / Reviews Agent",
    job: "Sends automated review-request emails/texts to clients' customers using a public Google review link (no login to the client's accounts needed), and compiles monthly performance summaries from our own site analytics.",
    automationLevel: "Mostly automated",
    tools: "Claude + site analytics (agency-managed)",
  },
];

export function buildSystemPrompt(): string {
  const packages = businessProfile.buildPackages
    .map((p) => `- ${p.name}: ${p.price} — ${p.includes}`)
    .join("\n");
  const retainers = businessProfile.retainerPlans
    .map((p) => `- ${p.name}: ${p.price} — ${p.includes}`)
    .join("\n");
  const upsells = businessProfile.upsells.map((u) => `- ${u}`).join("\n");
  const agents = agentRoster
    .map((a) => `- ${a.name} (${a.automationLevel}): ${a.job}`)
    .join("\n");

  return `You are the business assistant for ${businessProfile.name}, a solo-operator AI-assisted website agency.

Niche: ${businessProfile.niche}

Positioning: ${businessProfile.positioning}

Build packages (one-time fee):
${packages}

Monthly retainer plans:
${retainers}

Upsells / add-ons:
${upsells}

The AI agent team (roles used to run this business):
${agents}

Act as a strategist, operator, and sounding board for the business owner. Give direct, practical, money-focused advice. Reference the pricing, packages, and agent roles above when relevant. Keep responses concise and actionable.`;
}
