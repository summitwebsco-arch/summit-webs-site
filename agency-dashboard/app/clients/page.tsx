import { getCrmData } from "@/lib/sheets";

const statusColor: Record<string, string> = {
  active:    "badge-green",
  new:       "badge-blue",
  contacted: "badge-amber",
  cold:      "badge-gray",
  lost:      "badge-red",
};

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export default async function ClientsPage() {
  const crm = await getCrmData();
  const totalMrr = crm?.clients.reduce((s, c) => s + (Number(c.mrr) || 0), 0) ?? 0;

  return (
    <main className="page-bg-glow min-h-screen p-8">

      {/* Header */}
      <header className="page-header flex items-start justify-between gap-4">
        <div>
          <div className="page-header-kicker">CRM</div>
          <h1>Clients &amp; Leads</h1>
          <p className="page-header-sub">Your full CRM pipeline — synced from Google Sheets.</p>
        </div>
        <a href="/leads" className="btn-dash btn-dash-primary flex items-center gap-2 shrink-0 mt-1">
          + Find New Leads <IconArrow />
        </a>
      </header>

      {/* Disconnected notice */}
      {!crm && (
        <div className="alert alert-amber">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            CRM not connected. Create the &quot;Agency CRM&quot; Google Sheet with <code>Leads</code>, <code>Clients</code>, and <code>Tasks</code> tabs — then set <code>GOOGLE_SHEETS_ID</code> in <code>.env.local</code>.
          </span>
        </div>
      )}

      {/* Leads table */}
      <section className="mb-8">
        <div className="data-table-wrap">
          <div className="data-table-header">
            <div className="flex items-center gap-3">
              <span className="data-table-title">Leads Pipeline</span>
              <span className="data-table-count">{crm?.leads.length ?? 0} total</span>
            </div>
            <div className="data-table-actions">
              <a href="/leads" className="btn-dash btn-dash-outline">Find Leads</a>
              <a href="/outreach" className="btn-dash btn-dash-primary">Start Outreach</a>
            </div>
          </div>

          {(crm?.leads ?? []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7a52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              </div>
              <div className="empty-state-title">No leads yet</div>
              <div className="empty-state-sub">Use Find Leads to discover landscaping businesses in NE Ohio.</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {crm!.leads.map((lead, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{lead.business}</td>
                    <td className="td-muted">{lead.contact}</td>
                    <td className="td-muted">{lead.email}</td>
                    <td className="td-mono td-muted">{lead.phone}</td>
                    <td>
                      <span className={`badge ${statusColor[(lead.status ?? "").toLowerCase()] ?? "badge-gray"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="td-muted">{lead.lastContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Clients table */}
      <section>
        <div className="data-table-wrap">
          <div className="data-table-header">
            <div className="flex items-center gap-3">
              <span className="data-table-title">Active Clients</span>
              <span className="data-table-count">{crm?.clients.length ?? 0} clients</span>
              {totalMrr > 0 && (
                <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                  ${totalMrr}/mo MRR
                </span>
              )}
            </div>
          </div>

          {(crm?.clients ?? []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7a52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="empty-state-title">No clients yet</div>
              <div className="empty-state-sub">Convert a lead to a client to see them here.</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Retainer Tier</th>
                  <th>MRR</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {crm!.clients.map((client, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{client.business}</td>
                    <td className="td-muted">{client.contact}</td>
                    <td className="td-muted">{client.retainerTier}</td>
                    <td className="font-bold" style={{ color: "var(--color-primary)" }}>${client.mrr}</td>
                    <td>
                      <span className={`badge ${statusColor[(client.status ?? "").toLowerCase()] ?? "badge-green"}`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

    </main>
  );
}
