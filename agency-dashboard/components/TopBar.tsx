"use client";

import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { section: string; title: string }> = {
  "/":         { section: "Overview",    title: "Dashboard"        },
  "/agents":   { section: "Overview",    title: "Agent Team"       },
  "/chat":     { section: "Overview",    title: "AI Assistant"     },
  "/clients":  { section: "CRM",         title: "Clients & Leads"  },
  "/leads":    { section: "CRM",         title: "Find Leads"       },
  "/outreach": { section: "CRM",         title: "Outreach"         },
};

export default function TopBar() {
  const pathname  = usePathname();
  const meta      = PAGE_META[pathname] ?? { section: "Summit Webs", title: "Dashboard" };
  const today     = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-crumb">{meta.section}</span>
        <span className="topbar-sep">/</span>
        <span className="topbar-title">{meta.title}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-badge">Live</span>
        <span className="topbar-date">{today}</span>
      </div>
    </header>
  );
}
