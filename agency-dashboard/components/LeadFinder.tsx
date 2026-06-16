"use client";

import { useState } from "react";

const AREAS = [
  "Twinsburg, OH",
  "Hudson, OH",
  "Solon, OH",
  "Macedonia, OH",
  "Aurora, OH",
  "Stow, OH",
  "Cuyahoga Falls, OH",
  "Streetsboro, OH",
  "Northfield, OH",
  "Reminderville, OH",
];

const SEARCH_TERMS = [
  "landscaping company",
  "lawn care service",
  "lawn mowing service",
  "landscaping contractor",
  "lawn maintenance",
];

type LeadRow = {
  business: string;
  contact: string;
  email: string;
  phone: string;
  notes: string;
};

const blankLead = (): LeadRow => ({ business: "", contact: "", email: "", phone: "", notes: "" });

export default function LeadFinder() {
  const [area, setArea] = useState(AREAS[0]);
  const [term, setTerm] = useState(SEARCH_TERMS[0]);
  const [leads, setLeads] = useState<LeadRow[]>([blankLead()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(term + " " + area)}`;

  function updateLead(i: number, field: keyof LeadRow, value: string) {
    setLeads((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function addRow() {
    setLeads((prev) => [...prev, blankLead()]);
  }

  function removeRow(i: number) {
    setLeads((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function saveLeads() {
    const valid = leads.filter((l) => l.business.trim());
    if (valid.length === 0) return;

    setSaving(true);
    setError(null);
    setSaved(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: valid }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSaved(data.added);
      setLeads([blankLead()]);
    } catch {
      setError("Network error — is the dev server running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Google Maps search generator */}
      <div className="surface-card p-5">
        <h2 className="font-bold text-navy mb-1 text-sm uppercase tracking-wide">1. Find leads on Google Maps</h2>
        <p className="text-zinc-500 text-sm mb-4">
          Select an area and search type, open Maps, and paste business info into the form below.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SEARCH_TERMS.map((t) => <option key={t}>{t}</option>)}
          </select>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-transform"
            style={{ background: "var(--grad-brand)" }}
          >
            Open in Google Maps &rarr;
          </a>
        </div>
        <p className="text-xs text-zinc-400">
          Tip: in Maps, click a business → copy name, phone, and website URL into the form. Notes field is great for jotting "no website" or "site looks outdated."
        </p>
      </div>

      {/* Quick-add form */}
      <div className="surface-card p-5">
        <h2 className="font-bold text-navy mb-1 text-sm uppercase tracking-wide">2. Add to CRM</h2>
        <p className="text-zinc-500 text-sm mb-4">
          Fill in what you find — only Business Name is required. All leads are added with status "New."
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="pb-2 pr-3 font-medium">Business Name *</th>
                <th className="pb-2 pr-3 font-medium">Contact</th>
                <th className="pb-2 pr-3 font-medium">Email</th>
                <th className="pb-2 pr-3 font-medium">Phone</th>
                <th className="pb-2 pr-3 font-medium">Notes</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {leads.map((lead, i) => (
                <tr key={i}>
                  {(["business", "contact", "email", "phone", "notes"] as (keyof LeadRow)[]).map((field) => (
                    <td key={field} className="pr-3 pb-2">
                      <input
                        type={field === "email" ? "email" : "text"}
                        value={lead[field]}
                        onChange={(e) => updateLead(i, field, e.target.value)}
                        placeholder={field === "business" ? "Business name" : field}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[110px]"
                      />
                    </td>
                  ))}
                  <td className="pb-2">
                    {leads.length > 1 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="text-zinc-400 hover:text-red-500 transition-colors px-2"
                        aria-label="Remove row"
                      >
                        &times;
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={addRow}
            className="text-primary text-sm font-semibold hover:underline"
          >
            + Add another
          </button>
          <button
            onClick={saveLeads}
            disabled={saving || leads.every((l) => !l.business.trim())}
            className="text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: "var(--grad-brand)" }}
          >
            {saving ? "Saving..." : `Save ${leads.filter((l) => l.business.trim()).length} lead(s) to CRM`}
          </button>
        </div>

        {saved !== null && (
          <p className="mt-3 text-sm text-primary font-semibold">
            {saved} lead{saved === 1 ? "" : "s"} added to the Agency CRM sheet with status "New".
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
