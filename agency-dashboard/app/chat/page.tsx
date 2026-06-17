"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm your business assistant for Summit Webs. Ask me about pricing, outreach, the agent team, or anything about running the agency.",
    },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error — is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-content flex flex-col" style={{ height: "calc(100vh - 52px)" }}>
      <header className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-kicker">Assistant</div>
        <h1>Business Chat</h1>
      </header>

      {/* Message area */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl p-5 space-y-4 mb-4"
        style={{ background: "#fff", border: "1px solid var(--color-border-soft)", boxShadow: "var(--shadow-sm)", minHeight: 0 }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div
                className="shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black shadow-md"
                style={{ background: "var(--grad-brand)" }}
              >
                SW
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "text-white rounded-br-sm shadow-sm"
                  : "rounded-bl-sm"
              }`}
              style={
                m.role === "user"
                  ? { background: "var(--grad-brand)" }
                  : { background: "#f3f7f4", color: "var(--color-navy)", border: "1px solid var(--color-border-soft)" }
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2.5 justify-start">
            <div
              className="shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-black shadow-md"
              style={{ background: "var(--grad-brand)" }}
            >
              SW
            </div>
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1"
              style={{ background: "#f3f7f4", border: "1px solid var(--color-border-soft)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="alert alert-amber mb-3">
          <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pb-1">
        <input
          className="input-dash flex-1"
          placeholder="Ask about pricing, outreach, the agent team..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) sendMessage(); }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="btn-dash btn-dash-primary shrink-0"
          style={{ paddingLeft: 20, paddingRight: 20 }}
        >
          Send
        </button>
      </div>
    </main>
  );
}
