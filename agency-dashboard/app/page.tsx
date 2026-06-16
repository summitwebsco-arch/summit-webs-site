import { businessProfile } from "@/lib/business";
import { getCrmData } from "@/lib/sheets";
import Link from "next/link";

function IconLeads() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function IconClients() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconMrr() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function IconTasks() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

const statusColor: Record<string, string> = {
  active:    "badge-green",
  new:       "badge-blue",
  contacted: "badge-amber",
  cold:      "badge-gray",
  lost:      "badge-red",
};

export default async function Overview() {
  const crm = await getCrmData();

  const leadCount   = crm?.leads.length ?? 0;
  const clientCount = crm?.clients.length ?? 0;
  const mrr         = crm?.clients.reduce((s, c) => s + (Number(c.mrr) || 0), 0) ?? 0;
  const openTasks   = crm?.tasks.filter((t) => (t.status ?? "").toLowerCase() !== "done").length ?? 0;

  const statCards = [
    { label: "Active Leads",   value: leadCount,   hint: "in pipeline",      icon: IconLeads,   color: "from-blue-500 to-blue-600"    },
    { label: "Active Clients", value: clientCount, hint: "on retainer",      icon: IconClients, color: "from-emerald-600 to-emerald-700" },
    { label: "MRR",            value: `$${mrr}`,   hint: "monthly recurring", icon: IconMrr,    color: "from-amber-500 to-orange-500"  },
    { label: "Open Tasks",     value: openTasks,   hint: "not yet done",     icon: IconTasks,   color: "from-violet-500 to-violet-600" },
  ];

  const recentLeads   = crm?.leads.slice(0, 5) ?? [];
  const recentClients = crm?.clients.slice(0, 4) ?? [];

  return (
    <main className="page-bg-glow min-h-screen p-8">

      {/* Page header */}
      <header className="page-header mb-8">
        <div className="page-header-kicker">Dashboard</div>
        <h1 className="text-3xl font-black">
          <span className="text-gradient-brand">{businessProfile.name}</span>
        </h1>
        <p className="page-header-sub">{businessProfile.positioning}</p>
      </header>

      {/* Disconnected notice */}
      {!crm && (
        <div className="alert alert-amber mb-8">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            CRM not connected. Set <code>GOOGLE_SHEETS_ID</code> in <code>.env.local</code> and share the sheet with the service account to see live data.
          </span>
        </div>
      )}

      {/* Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className={`stat-card-icon bg-gradient-to-br ${card.color}`}>
                <Icon />
              </div>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-hint">{card.hint}</div>
            </div>
          );
        })}
      </section>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* Recent leads table */}
        <div className="lg:col-span-2">
          <div className="data-table-wrap">
            <div className="data-table-header">
              <div className="flex items-center gap-3">
                <span className="data-table-title">Recent Leads</span>
                <span className="data-table-count">{leadCount}</span>
              </div>
              <Link href="/clients" className="btn-dash btn-dash-outline flex items-center gap-1.5">
                View all <IconArrow />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7a52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                </div>
                <div className="empty-state-title">No leads yet</div>
                <div className="empty-state-sub">Connect the CRM sheet or add leads via Find Leads.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Last Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{lead.business}</td>
                      <td className="td-muted">{lead.contact}</td>
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
        </div>

        {/* Packages sidebar */}
        <div className="flex flex-col gap-4">
          <div className="surface-card p-5">
            <div className="section-head mb-4">
              <span className="section-head-accent" />
              Build Packages
            </div>
            <div className="space-y-3">
              {businessProfile.buildPackages.map((p) => (
                <div key={p.name} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--color-navy)" }}>{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{p.includes}</div>
                  </div>
                  <span className="font-bold text-sm shrink-0" style={{ color: "var(--color-primary)" }}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="section-head mb-4">
              <span className="section-head-accent" />
              Retainer Plans
            </div>
            <div className="space-y-3">
              {businessProfile.retainerPlans.map((p) => (
                <div key={p.name} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--color-border-soft)" }}>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "var(--color-navy)" }}>{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{p.includes}</div>
                  </div>
                  <span className="font-bold text-sm shrink-0" style={{ color: "var(--color-primary)" }}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Active clients strip */}
      {recentClients.length > 0 && (
        <div className="data-table-wrap">
          <div className="data-table-header">
            <div className="flex items-center gap-3">
              <span className="data-table-title">Active Clients</span>
              <span className="data-table-count">{clientCount}</span>
            </div>
            <Link href="/clients" className="btn-dash btn-dash-outline flex items-center gap-1.5">
              Manage <IconArrow />
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>MRR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((client, i) => (
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
        </div>
      )}

    </main>
  );
}
