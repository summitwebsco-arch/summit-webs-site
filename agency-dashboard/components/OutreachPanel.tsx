"use client";

import { useState } from "react";
import type { Lead } from "@/lib/sheets";

type DraftResult = {
  lead: { business: string; contact: string; email: string; notes: string; followUpDay?: number };
  subject?: string;
  body?: string;
  draftStatus?: "created" | "not_configured" | "skipped";
  error?: string;
};

type FollowUpLead = Lead & { daysSince: number; followUpDay: 3 | 7 | 14 };

function daysSinceDate(dateStr: string): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return Infinity;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function getFollowUpDay(days: number): 3 | 7 | 14 | null {
  if (days >= 2 && days <= 4) return 3;
  if (days >= 6 && days <= 9) return 7;
  if (days >= 13 && days <= 16) return 14;
  return null;
}

function DraftList({ results, gmailConfigured }: { results: DraftResult[]; gmailConfigured: boolean }) {
  return (
    <div className="space-y-4">
      {gmailConfigured && results.some((r) => r.draftStatus === "created") && (
        <a href="https://mail.google.com/mail/u/0/#drafts" target="_blank" rel="noopener"
          className="inline-block text-sm font-semibold text-primary hover:underline">
          Open Gmail Drafts &rarr;
        </a>
      )}
      {results.map((r, i) => (
        <div key={i} className="surface-card p-4">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <p className="font-bold text-navy">
              {r.lead.business}
              {r.lead.followUpDay ? <span className="ml-2 text-xs font-normal text-zinc-400">Day {r.lead.followUpDay} follow-up</span> : null}
            </p>
            {r.draftStatus === "created" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">Draft saved to Gmail</span>
            )}
            {r.draftStatus === "not_configured" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Gmail not connected — copy below</span>
            )}
            {r.draftStatus === "skipped" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">No email on file</span>
            )}
            {r.error && !r.subject && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Error</span>
            )}
          </div>
          {r.error && !r.subject && <p className="text-sm text-red-600">{r.error}</p>}
          {r.subject && (
            <>
              <p className="text-sm text-zinc-500 mb-1">To: {r.lead.email || "(no email)"}</p>
              <p className="text-sm font-semibold text-navy mb-2">Subject: {r.subject}</p>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">{r.body}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function InitialOutreachTab({ leads, gmailConfigured }: { leads: Lead[]; gmailConfigured: boolean }) {
  const [selected, setSelected] = useState<Set<number>>(new Set(leads.map((_, i) => i)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DraftResult[] | null>(null);

  function toggle(i: number) {
    setSelected((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  async function generate() {
    const chosen = leads.filter((_, i) => selected.has(i));
    if (!chosen.length) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: chosen.map((l) => ({ business: l.business, contact: l.contact, email: l.email, notes: l.notes })) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setResults(data.results);
    } catch { setError("Network error — is the dev server running?"); }
    finally { setLoading(false); }
  }

  if (leads.length === 0) {
    return <div className="surface-card p-6 text-center text-zinc-400 text-sm">No leads with status "New" right now. Add some via Find Leads or in the CRM sheet.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium w-10"></th>
              <th className="px-4 py-2.5 font-medium">Business</th>
              <th className="px-4 py-2.5 font-medium">Contact</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-2.5"><input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} className="w-4 h-4 accent-primary" /></td>
                <td className="px-4 py-2.5 font-medium text-navy">{lead.business}</td>
                <td className="px-4 py-2.5">{lead.contact}</td>
                <td className="px-4 py-2.5">{lead.email || <span className="text-zinc-400">—</span>}</td>
                <td className="px-4 py-2.5 text-zinc-500 max-w-xs truncate">{lead.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={generate} disabled={loading || selected.size === 0}
        className="text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 shadow-md transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--grad-brand)" }}>
        {loading ? "Generating..." : `Generate ${selected.size} draft${selected.size === 1 ? "" : "s"}`}
      </button>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      {results && <DraftList results={results} gmailConfigured={gmailConfigured} />}
    </div>
  );
}

function FollowUpsTab({ leads, gmailConfigured }: { leads: Lead[]; gmailConfigured: boolean }) {
  const due: FollowUpLead[] = leads
    .filter((l) => l.status === "Contacted" && l.email)
    .map((l) => ({ ...l, daysSince: daysSinceDate(l.lastContact), followUpDay: getFollowUpDay(daysSinceDate(l.lastContact))! }))
    .filter((l) => l.followUpDay !== null);

  const [selected, setSelected] = useState<Set<number>>(new Set(due.map((_, i) => i)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<DraftResult[] | null>(null);

  function toggle(i: number) {
    setSelected((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  async function generate() {
    const chosen = due.filter((_, i) => selected.has(i));
    if (!chosen.length) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: chosen.map((l) => ({ business: l.business, contact: l.contact, email: l.email, notes: l.notes, followUpDay: l.followUpDay })) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setResults(data.results);
    } catch { setError("Network error — is the dev server running?"); }
    finally { setLoading(false); }
  }

  const dayBadge = (day: 3 | 7 | 14) => {
    const colors: Record<number, string> = { 3: "bg-blue-100 text-blue-700", 7: "bg-amber-100 text-amber-700", 14: "bg-red-100 text-red-600" };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colors[day]}`}>Day {day}</span>;
  };

  if (due.length === 0) {
    return (
      <div className="surface-card p-6 text-sm text-zinc-500 space-y-2">
        <p className="font-semibold text-navy">No follow-ups due right now.</p>
        <p>Leads with status "Contacted" in the CRM will appear here when they hit the Day 3, Day 7, or Day 14 window since last contact.</p>
        <p className="text-xs text-zinc-400 mt-2">Windows: Day 3 (2–4 days), Day 7 (6–9 days), Day 14 (13–16 days).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-500 text-left">
            <tr>
              <th className="px-4 py-2.5 font-medium w-10"></th>
              <th className="px-4 py-2.5 font-medium">Business</th>
              <th className="px-4 py-2.5 font-medium">Email</th>
              <th className="px-4 py-2.5 font-medium">Last Contact</th>
              <th className="px-4 py-2.5 font-medium">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {due.map((lead, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-4 py-2.5"><input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} className="w-4 h-4 accent-primary" /></td>
                <td className="px-4 py-2.5 font-medium text-navy">{lead.business}</td>
                <td className="px-4 py-2.5">{lead.email}</td>
                <td className="px-4 py-2.5 text-zinc-500">{lead.lastContact} <span className="text-zinc-400 text-xs">({lead.daysSince}d ago)</span></td>
                <td className="px-4 py-2.5">{dayBadge(lead.followUpDay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={generate} disabled={loading || selected.size === 0}
        className="text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 shadow-md transition-transform hover:-translate-y-0.5"
        style={{ background: "var(--grad-brand)" }}>
        {loading ? "Generating..." : `Generate ${selected.size} follow-up draft${selected.size === 1 ? "" : "s"}`}
      </button>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      {results && <DraftList results={results} gmailConfigured={gmailConfigured} />}
    </div>
  );
}

export default function OutreachPanel({ leads, gmailConfigured }: { leads: Lead[]; gmailConfigured: boolean }) {
  const [tab, setTab] = useState<"initial" | "followup">("initial");

  const newLeads = leads.filter((l) => l.status === "New");
  const contactedLeads = leads.filter((l) => l.status === "Contacted");
  const followUpCount = contactedLeads
    .filter((l) => getFollowUpDay(daysSinceDate(l.lastContact)) !== null).length;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-zinc-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("initial")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "initial" ? "bg-white text-navy shadow-sm" : "text-zinc-500 hover:text-navy"}`}
        >
          Initial Outreach
          <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{newLeads.length}</span>
        </button>
        <button
          onClick={() => setTab("followup")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "followup" ? "bg-white text-navy shadow-sm" : "text-zinc-500 hover:text-navy"}`}
        >
          Follow-ups Due
          {followUpCount > 0 && (
            <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{followUpCount}</span>
          )}
        </button>
      </div>

      {tab === "initial"
        ? <InitialOutreachTab leads={newLeads} gmailConfigured={gmailConfigured} />
        : <FollowUpsTab leads={contactedLeads} gmailConfigured={gmailConfigured} />
      }
    </div>
  );
}
