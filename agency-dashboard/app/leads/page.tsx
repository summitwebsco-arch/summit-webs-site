import LeadFinder from "@/components/LeadFinder";

export default function LeadsPage() {
  return (
    <main className="page-bg-glow p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
          Lead Sourcing
        </p>
        <h1 className="text-3xl font-bold text-navy">Find &amp; Add Leads</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl">
          Search Google Maps for landscaping businesses in NE Ohio, then add them directly to
          the Agency CRM sheet — no copy-pasting between tabs.
        </p>
      </header>
      <LeadFinder />
    </main>
  );
}
