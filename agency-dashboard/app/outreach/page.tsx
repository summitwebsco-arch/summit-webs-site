import { getCrmData } from "@/lib/sheets";
import { isGmailConfigured } from "@/lib/gmail";
import OutreachPanel from "@/components/OutreachPanel";

export default async function OutreachPage() {
  const crm             = await getCrmData();
  const allLeads        = crm?.leads ?? [];
  const gmailConfigured = isGmailConfigured();

  return (
    <main className="page-content" style={{ maxWidth: 900, margin: "0 auto" }}>
      <header className="page-header">
        <div className="page-header-kicker">Outreach</div>
        <h1>AI Email Outreach</h1>
        <p className="page-header-sub">
          Generate personalized cold emails and Day 3/7/14 follow-ups — saved as Gmail drafts for you to review.
        </p>
      </header>

      {!crm && (
        <div className="alert alert-amber">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>CRM not connected — set <code>GOOGLE_SHEETS_ID</code> in <code>.env.local</code> first.</span>
        </div>
      )}

      {!gmailConfigured && (
        <div className="alert alert-amber">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            Gmail not connected — drafts will display here for copy/paste until you add{" "}
            <code>GMAIL_CLIENT_ID</code>, <code>GMAIL_CLIENT_SECRET</code>, and{" "}
            <code>GMAIL_REFRESH_TOKEN</code> to <code>.env.local</code>.
          </span>
        </div>
      )}

      <OutreachPanel leads={allLeads} gmailConfigured={gmailConfigured} />
    </main>
  );
}
