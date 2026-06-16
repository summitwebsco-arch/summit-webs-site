"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm your business assistant for Summit Webs. Ask me about pricing, outreach, the agent team, or anything else about running the agency.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setError("Network error — is the dev server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-bg-glow p-8 max-w-3xl mx-auto flex flex-col h-screen">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
          Assistant
        </p>
        <h1 className="text-3xl font-bold text-navy">Business Chat</h1>
      </header>

      <div className="flex-1 overflow-y-auto bg-white border border-border rounded-2xl shadow-sm p-4 space-y-3 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "assistant" && (
              <div
                className="shrink-0 w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-md"
                style={{ background: "var(--grad-brand)" }}
              >
                S
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap shadow-sm ${
                m.role === "user"
                  ? "text-white rounded-br-sm"
                  : "bg-zinc-100 text-navy rounded-bl-sm"
              }`}
              style={
                m.role === "user" ? { background: "var(--grad-brand)" } : undefined
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div
              className="shrink-0 w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-md"
              style={{ background: "var(--grad-brand)" }}
            >
              S
            </div>
            <div className="bg-zinc-100 text-zinc-400 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm italic flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-3">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          placeholder="Ask about pricing, outreach, the agent team..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0"
          style={{ background: "var(--grad-brand)" }}
        >
          Send
        </button>
      </div>
    </main>
  );
}
