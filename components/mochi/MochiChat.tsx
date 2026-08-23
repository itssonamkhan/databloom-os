"use client";

import { FormEvent, useState } from "react";
import { Bot, LoaderCircle, RotateCcw, Send } from "lucide-react";

import { useMochiChat } from "@/hooks/useMochiChat";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getBuddyPresentation, personalizeBuddyText } from "@/lib/userPreferences";

export default function MochiChat() {
  const [message, setMessage] = useState("");
  const { answer, error, loading, ask } = useMochiChat();
  const preferences = useUserPreferences();
  const buddy = getBuddyPresentation(preferences);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextMessage = message.trim();
    if (!nextMessage || loading) return;
    const sent = await ask(nextMessage);
    if (sent) setMessage("");
  }

  return (
    <section
      className="min-w-0 rounded-3xl border border-[var(--databloom-border)] bg-[var(--databloom-card)] p-6 shadow-lg backdrop-blur-xl sm:p-8"
      aria-labelledby="mochi-ai-chat-title"
    >
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--databloom-accent-soft)] text-[var(--databloom-text-accent)]">
          <Bot size={22} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--databloom-text-accent)]">
            Local study companion
          </p>
          <h2 id="mochi-ai-chat-title" className="mt-1 text-2xl font-black text-[var(--databloom-text-primary)]">
            Ask {buddy.name} AI
          </h2>
          <p className="mt-1 text-sm font-medium leading-6 text-[var(--databloom-text-secondary)]">
            Learn the reasoning, not just the answer. Ask about Excel, SQL, Python, BI, statistics, or analytics.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        <label htmlFor="mochi-ai-message" className="sr-only">Ask Mochi AI a learning question</label>
        <textarea
          id="mochi-ai-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={2000}
          rows={4}
          disabled={loading}
          placeholder="Example: Explain SQL joins with a tiny sales example."
          className="w-full resize-y rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4 font-medium text-[var(--databloom-text-primary)] placeholder:text-[var(--databloom-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] disabled:cursor-wait disabled:opacity-70"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[var(--databloom-text-muted)]">Mochi&apos;s local learning brain is available without an API key.</p>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--databloom-action)] px-4 py-2 font-black text-[var(--databloom-text-on-accent)] shadow-sm transition hover:bg-[var(--databloom-action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--databloom-focus)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
            {loading ? "Mochi is thinking…" : "Ask Mochi"}
          </button>
        </div>
      </form>

      {error ? (
        <div className="mt-4 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-4" role="alert">
          <p className="font-semibold text-[var(--databloom-text-primary)]">{error}</p>
          <button type="button" onClick={() => void ask(message.trim())} disabled={loading || !message.trim()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--databloom-border)] px-3 py-2 font-bold text-[var(--databloom-text-secondary)] hover:bg-[var(--databloom-accent-soft)] disabled:opacity-50">
            <RotateCcw size={16} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : null}

      {answer ? (
        <div className="mt-5 rounded-2xl border border-[var(--databloom-border)] bg-[var(--databloom-glass)] p-5" aria-live="polite">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--databloom-text-accent)]">{answer.kind}</p>
          <p className="mt-2 whitespace-pre-wrap font-medium leading-7 text-[var(--databloom-text-primary)]">
            {personalizeBuddyText(answer.message, preferences)}
          </p>
          {answer.nextStep ? <p className="mt-3 border-t border-[var(--databloom-border)] pt-3 text-sm font-semibold text-[var(--databloom-text-secondary)]">Next step: {answer.nextStep}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
