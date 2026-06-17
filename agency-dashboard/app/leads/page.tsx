import LeadFinder from "@/components/LeadFinder";

export default function LeadsPage() {
  return (
    <main className="page-content" style={{ maxWidth: 900, margin: "0 auto" }}>
      <header className="page-header">
        <div className="page-header-kicker">Lead Sourcing</div>
        <h1>Find Leads</h1>
        <p className="page-header-sub">
          Search for landscaping businesses in NE Ohio and add them directly to your CRM — no copy-pasting.
        </p>
      </header>
      <LeadFinder />
    </main>
  );
}
