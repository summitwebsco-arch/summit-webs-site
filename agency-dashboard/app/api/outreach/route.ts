import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/business";
import { createGmailDraft, isGmailConfigured } from "@/lib/gmail";

type OutreachLead = {
  business: string;
  contact: string;
  email: string;
  notes: string;
  followUpDay?: 3 | 7 | 14;
};

function parseEmail(text: string): { subject: string; body: string } | null {
  const subjectMatch = text.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = text.match(/BODY:\s*([\s\S]*)/i);
  if (!subjectMatch || !bodyMatch) return null;
  return { subject: subjectMatch[1].trim(), body: bodyMatch[1].trim() };
}

function buildPrompt(lead: OutreachLead): { system: string; userMsg: string } {
  if (lead.followUpDay) {
    const dayLabel = `Day ${lead.followUpDay}`;
    const tone =
      lead.followUpDay === 3
        ? "a light, friendly check-in — very short (3-4 sentences), no pressure"
        : lead.followUpDay === 7
        ? "a slightly more direct follow-up — mention the free mockup offer again, still warm"
        : "a final short follow-up — polite, no guilt, leave the door open for the future";

    return {
      system:
        buildSystemPrompt() +
        "\n\nYou are the Follow-up Agent. Write brief follow-up emails to prospects who haven't replied. Keep them genuinely human — no hype, no filler phrases, plain text, signed 'The Summit Webs Team'. Do not use markdown.",
      userMsg: `Write a ${dayLabel} follow-up email for this prospect who hasn't replied to our first outreach:
Business: ${lead.business}
Contact: ${lead.contact || "Owner"}
Notes: ${lead.notes || "None"}

Tone: ${tone}. Under 80 words.

Respond in exactly this format:
SUBJECT: <subject line>
BODY:
<email body>`,
    };
  }

  return {
    system:
      buildSystemPrompt() +
      "\n\nYou are the Outreach Copy Agent. Write short, warm, no-hype cold outreach emails to local landscaping/lawn care business owners, offering a free website mockup. Reference specifics from the notes if useful. Keep it under 120 words, plain text, signed 'The Summit Webs Team'. Do not use markdown.",
    userMsg: `Write a cold outreach email for this prospect:
Business: ${lead.business}
Contact name: ${lead.contact || "Owner"}
Notes: ${lead.notes || "None"}

Respond in exactly this format with no extra commentary before or after:
SUBJECT: <subject line>
BODY:
<email body>`,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set. Add it to agency-dashboard/.env.local and restart the dev server." },
      { status: 500 }
    );
  }

  const { leads } = await request.json();
  if (!Array.isArray(leads) || leads.length === 0) {
    return Response.json({ error: "No leads provided." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });
  const gmailConfigured = isGmailConfigured();
  const fromEmail = process.env.GMAIL_USER_EMAIL || "summitwebsco@gmail.com";

  const results = await Promise.all(
    (leads as OutreachLead[]).map(async (lead) => {
      try {
        const { system, userMsg } = buildPrompt(lead);

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens: 600,
          system,
          messages: [{ role: "user", content: userMsg }],
        });

        const textBlock = response.content.find((b) => b.type === "text");
        const text = textBlock?.type === "text" ? textBlock.text : "";
        const parsed = parseEmail(text);

        if (!parsed) return { lead, error: "Could not parse a draft from Claude's response." };

        if (!lead.email) {
          return { lead, subject: parsed.subject, body: parsed.body, draftStatus: "skipped" as const, error: "Lead has no email address." };
        }

        if (!gmailConfigured) {
          return { lead, subject: parsed.subject, body: parsed.body, draftStatus: "not_configured" as const };
        }

        await createGmailDraft({ to: lead.email, from: fromEmail, subject: parsed.subject, body: parsed.body });

        return { lead, subject: parsed.subject, body: parsed.body, draftStatus: "created" as const };
      } catch (err) {
        return { lead, error: err instanceof Error ? err.message : "Unknown error" };
      }
    })
  );

  return Response.json({ results, gmailConfigured });
}
