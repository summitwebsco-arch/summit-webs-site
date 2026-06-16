import { getCrmData } from "@/lib/sheets";
import { isGmailConfigured } from "@/lib/gmail";
import OutreachPanel from "@/components/OutreachPanel";

export default async function OutreachPage() {
  const crm = await getCrmData();
  const allLeads = crm?.leads ?? [];
  const gmailConfigured = isGmailConfigured();

  return (
    <main className="page-bg-glow p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
          Outreach
        </p>
        <h1 className="text-3xl font-bold text-navy">AI Email Outreach</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl">
          Generate personalized cold emails for new leads and automated Day 3/7/14 follow-ups
          for contacted leads — saved as drafts in Gmail for you to review and send.
        </p>
      </header>

      {!crm && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-sm">
          CRM not connected yet. Set up <code>GOOGLE_SHEETS_ID</code> in{" "}
          <code>.env.local</code> first (see README).
        </div>
      )}

      {!gmailConfigured && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-sm">
          Gmail isn&apos;t connected yet — drafts will be generated here for you to copy, but
          won&apos;t be saved to Gmail until you add{" "}
          <code>GMAIL_CLIENT_ID</code>, <code>GMAIL_CLIENT_SECRET</code>, and{" "}
          <code>GMAIL_REFRESH_TOKEN</code> to <code>.env.local</code>. Run{" "}
          <code>node scripts/gmail-auth.mjs</code> to get the refresh token (see README).
        </div>
      )}

      <OutreachPanel leads={allLeads} gmailConfigured={gmailConfigured} />
    </main>
  );
}
