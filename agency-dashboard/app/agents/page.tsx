import { agentRoster } from "@/lib/business";

const levelClass: Record<string, string> = {
  "Mostly automated": "agent-level-auto",
  "Semi-automated":   "agent-level-semi",
  "Human-led":        "agent-level-human",
};

export default function AgentsPage() {
  return (
    <main className="page-content" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <header className="page-header">
        <div className="page-header-kicker">AI Workforce</div>
        <h1>Agent Team</h1>
        <p className="page-header-sub">
          Each role is a Claude-driven workflow that handles a piece of running the agency.
          You stay the founder — agents draft, you decide.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {agentRoster.map((agent, i) => (
          <div key={agent.id} className="agent-card">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="agent-card-num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h2 className="font-bold text-sm" style={{ color: "var(--color-navy)" }}>{agent.name}</h2>
                </div>
              </div>
              <span className={levelClass[agent.automationLevel] ?? "agent-level-human"}>
                {agent.automationLevel}
              </span>
            </div>
            <p className="text-sm mb-3" style={{ color: "#4b5563" }}>{agent.job}</p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              <span className="font-semibold" style={{ color: "#6b7280" }}>Tools: </span>
              {agent.tools}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
