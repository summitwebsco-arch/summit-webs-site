"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconOverview() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function IconAgents() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="8.5" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="16" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 11V7" /><circle cx="12" cy="5" r="2" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.3-3.9A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  );
}
function IconClients() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconLeads() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function IconOutreach() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l8.4 5.6a3 3 0 0 0 3.2 0L22 7" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/",        label: "Dashboard",   icon: IconOverview },
      { href: "/agents",  label: "Agent Team",  icon: IconAgents   },
      { href: "/chat",    label: "AI Assistant",icon: IconChat     },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/clients",  label: "Clients & Leads", icon: IconClients  },
      { href: "/leads",    label: "Find Leads",      icon: IconLeads    },
      { href: "/outreach", label: "Outreach",        icon: IconOutreach },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative w-60 shrink-0 flex flex-col min-h-screen overflow-hidden" style={{ background: "linear-gradient(180deg, #0f2218 0%, #0a1810 100%)" }}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-20 -right-16 w-52 h-52 rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(45,122,82,0.5), transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-0 -left-12 w-44 h-44 rounded-full opacity-20" style={{ background: "radial-gradient(circle, rgba(242,169,59,0.4), transparent 70%)" }} />

      {/* Brand */}
      <div className="relative px-5 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 text-white text-sm font-black"
          style={{
            background: "linear-gradient(135deg, #2d7a52, #1f5f3f)",
            boxShadow: "0 4px 14px rgba(31,95,63,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
            transform: "perspective(120px) rotateX(6deg) rotateY(-6deg)",
          }}
        >
          SW
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Summit Webs</p>
          <p className="text-white/40 text-[10px] leading-none mt-0.5">Command Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active
                        ? "text-white"
                        : "text-white/55 hover:text-white/90 hover:bg-white/6"
                    }`}
                    style={active ? {
                      background: "linear-gradient(135deg, rgba(45,122,82,0.4), rgba(31,95,63,0.25))",
                      boxShadow: "inset 0 0 0 1px rgba(45,122,82,0.4), 0 2px 8px rgba(31,95,63,0.2)",
                    } : undefined}
                  >
                    <span className={active ? "text-emerald-400" : ""}><Icon /></span>
                    {item.label}
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-80" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick actions */}
      <div className="relative px-3 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">Quick Actions</p>
        <Link
          href="/clients"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500/20 text-emerald-400">
            <IconPlus />
          </span>
          New Lead
        </Link>
        <Link
          href="/outreach"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/20 text-amber-400">
            <IconPlus />
          </span>
          New Outreach
        </Link>
      </div>

      {/* Footer */}
      <div className="relative px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-white/25 text-[10px] leading-relaxed">NE Ohio Landscaping Web Design</p>
        <p className="text-white/20 text-[10px]">summitwebsco@gmail.com</p>
      </div>
    </aside>
  );
}
