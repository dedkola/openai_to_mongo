"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessage from "@/components/ChatMessage";

interface LogItem {
  sessionId?: string | null;
  question: string;
  answer: string;
  model: string;
  createdAt: string;
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load last logs on first render
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data) => {
        const mapped = (data.logs as LogItem[]).reverse().flatMap((l) => [
          { role: "user" as const, content: l.question },
          { role: "assistant" as const, content: l.answer },
        ]);
        setMessages(mapped);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const answer = data.answer || "(no answer)";
      setMessages((m) => [...m, { role: "assistant", content: answer }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl md:text-3xl font-light text-brand-800">
        Chat Logger
      </h1>

      <div
        ref={listRef}
        className="h-[60vh] overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3"
      >
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">
            Type a message below to start chatting. Previous logs will appear
            here.
          </p>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="text-xs text-zinc-400 italic">Thinking…</div>
        )}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
          className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300"
        />
        <button
          disabled={loading}
          className="rounded-xl bg-brand-400 px-5 py-3 text-sm font-medium text-white shadow hover:bg-brand-500 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
