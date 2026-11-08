"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Container, Eyebrow } from "@/components/ui";

const CHAT_URL = "https://advantage-ai-solutions-api.vercel.app/chat";
const suggestions = [
  { label: "Document extraction", question: "Can you extract data from invoices?" },
  { label: "Connect my tools", question: "Can you connect our CRM and accounting tools?" },
  { label: "Scope & pricing", question: "What does a project cost?" },
];

type Answer = {
  answer: string;
  supported: boolean;
  sources: { title: string; url: string }[];
};

function readAnswer(value: unknown): Answer {
  if (!value || typeof value !== "object") throw new Error("Invalid service response");
  const data = value as Record<string, unknown>;
  if (data.business !== "Advantage AI Solutions" || data.mode !== "curated_retrieval" ||
      typeof data.answer !== "string" || typeof data.supported !== "boolean" || !Array.isArray(data.sources)) {
    throw new Error("Unexpected service response");
  }
  const sources = data.sources.flatMap((source: unknown) => {
    if (!source || typeof source !== "object") return [];
    const item = source as Record<string, unknown>;
    if (typeof item.title !== "string" || typeof item.url !== "string") return [];
    try {
      const url = new URL(item.url);
      return url.origin === "https://advantageaisolutions.pro" ? [{ title: item.title, url: url.href }] : [];
    } catch { return []; }
  });
  return { answer: data.answer, supported: data.supported, sources };
}

export function ServiceAssistant() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [asked, setAsked] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);

  useEffect(() => () => active.current?.abort(), []);

  async function ask(question: string) {
    if (active.current) return;
    const text = question.trim();
    if (text.length < 3 || text.length > 1000) {
      setError("Enter a question between 3 and 1,000 characters.");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    setPending(true); setError(""); setAnswer(null); setAsked(text);
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "omit", body: JSON.stringify({ message: text }), signal: controller.signal,
      });
      if (!response.ok) throw new Error("Service request failed");
      setAnswer(readAnswer(await response.json()));
    } catch {
      setError("We couldn’t reach the service assistant. Please try again, or request a Systems Evaluation below.");
    } finally {
      window.clearTimeout(timeout);
      active.current = null;
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(message);
  }

  return <section id="ask-advantage" className="section-space border-t border-line" aria-labelledby="assistant-heading">
    <Container className="grid items-start gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20">
      <div>
        <Eyebrow>Ask Advantage</Eyebrow>
        <h2 id="assistant-heading" className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">See where automation<br className="hidden sm:block" /> fits your work.</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">Ask about document intake, connected systems or your first project. Get a clear starting point, with links to the service information behind the answer.</p>
        <div className="mt-7 flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm leading-relaxed text-muted">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
          <p>Answers are retrieved from Advantage’s reviewed public information. This assistant does not use a generative AI model.</p>
        </div>
        <div className="mt-7"><Button href="/contact" variant="secondary">Request a Systems Evaluation</Button></div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-line px-5 py-5 sm:px-7">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white" aria-hidden="true">A+</span>
          <div><h3 className="text-sm font-semibold text-ink">Advantage service assistant</h3><p className="mt-1 text-xs text-muted">Public information. Sources included.</p></div>
        </div>
        <div className="px-5 pt-5 sm:px-7">
          <p className="text-xs font-medium text-muted">Start with a question</p>
          <div className="mt-3 flex flex-wrap gap-2">{suggestions.map(s => <button key={s.label} type="button" disabled={pending} onClick={() => { setMessage(s.question); void ask(s.question); }} className="min-h-10 rounded-full border border-line bg-canvas px-3 py-2 text-xs font-medium text-ink-soft transition hover:border-brand hover:text-brand disabled:cursor-wait disabled:opacity-50">{s.label}</button>)}</div>
        </div>
        <form onSubmit={submit} className="p-5 sm:px-7" aria-busy={pending}>
          <label htmlFor="advantage-question" className="mb-2 block text-sm font-semibold text-ink">What would you like to know?</label>
          <textarea id="advantage-question" name="message" rows={3} minLength={3} maxLength={1000} required value={message} onChange={event => setMessage(event.target.value)} aria-describedby="assistant-privacy" placeholder="e.g. Can you connect our CRM and accounting tools?" className="block min-h-28 w-full resize-y rounded-lg border border-line bg-canvas p-3 text-base leading-relaxed text-ink placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-offset-2 focus:outline-brand" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p id="assistant-privacy" className="max-w-xs text-xs leading-relaxed text-muted">Please leave out confidential details. Questions aren’t saved by this application.</p><button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:cursor-wait disabled:opacity-60">{pending ? "Finding an answer…" : "Ask Advantage"}<span aria-hidden="true">↗</span></button></div>
        </form>
        <div role="status" aria-live="polite" aria-atomic="true" className="border-t border-line bg-canvas/60 p-5 sm:px-7">
          {pending ? <p className="text-sm text-muted">Looking up Advantage’s service information…</p> : error ? <p className="text-sm leading-relaxed text-ink-soft">{error} <a className="font-semibold text-brand underline underline-offset-4" href="/contact">Contact Advantage</a></p> : answer ? <>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal">{answer.supported ? "From Advantage’s service information" : "Confirmation needed"}</p>
            <p className="mt-3 text-xs text-muted">Your question: {asked}</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-soft">{answer.answer}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{answer.sources.map(source => <a key={source.url + source.title} href={source.url} className="text-xs font-semibold text-brand underline decoration-brand/30 underline-offset-4">{source.title} <span aria-hidden="true">↗</span></a>)}{!answer.supported && <a href="/contact" className="text-sm font-semibold text-brand underline underline-offset-4">Contact Advantage →</a>}</div>
          </> : <p className="text-sm leading-relaxed text-muted">Choose a question above or describe the workflow you want to improve.</p>}
        </div>
      </div>
    </Container>
  </section>;
}
