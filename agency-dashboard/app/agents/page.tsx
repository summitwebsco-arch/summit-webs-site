import { agentRoster } from "@/lib/business";

const automationColor: Record<string, string> = {
  "Mostly automated": "bg-primary/10 text-primary",
  "Semi-automated": "bg-accent/15 text-accent",
  "Human-led": "bg-zinc-200 text-zinc-600",
};

export default function AgentsPage() {
  return (
    <main className="page-bg-glow p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
          Agent Team
        </p>
        <h1 className="text-3xl font-bold text-navy">Your AI Agent Roster</h1>
        <p className="text-zinc-500 mt-2 max-w-2xl">
          Each role below is a Claude-driven workflow that handles a piece of
          running the agency. You stay the founder/account manager — agents
          draft, you decide.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {agentRoster.map((agent, i) => (
          <div
            key={agent.id}
            className="surface-card p-5 relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: "var(--grad-brand)" }}
              aria-hidden
            />
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
                  style={{ background: "var(--grad-brand)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h2 className="font-bold text-navy">{agent.name}</h2>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                  automationColor[agent.automationLevel]
                }`}
              >
                {agent.automationLevel}
              </span>
            </div>
            <p className="text-sm text-zinc-600 mb-3">{agent.job}</p>
            <p className="text-xs text-zinc-400">
              <span className="font-medium text-zinc-500">Tools: </span>
              {agent.tools}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
