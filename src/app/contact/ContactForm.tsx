"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

const input =
  "mt-1.5 block w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-ink placeholder:text-muted/70 focus:border-sky focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky/20";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6" role="status">
        <h3 className="text-lg font-semibold text-emerald-900">Request received</h3>
        <p className="mt-1 text-sm text-emerald-800">
          Thanks — an engineer will review your submission and reply {site.responseTime.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Full name <span className="text-sky">*</span>
          <input name="name" required autoComplete="name" className={input} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Work email <span className="text-sky">*</span>
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Direct phone
          <input name="phone" type="tel" autoComplete="tel" className={input} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Company
          <input name="company" autoComplete="organization" className={input} />
        </label>
      </div>

      <label className="block text-sm font-medium text-ink">
        Current software stack
        <input
          name="stack"
          placeholder="e.g. QuickBooks, HubSpot, Google Workspace"
          className={input}
        />
      </label>

      <label className="block text-sm font-medium text-ink">
        Primary workflow bottleneck <span className="text-sky">*</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What manual process is costing your team the most time?"
          className={input}
        />
      </label>

      {/* Honeypot — hidden from people, catches bots */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error} You can also email us at{" "}
          <a className="font-semibold underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-ink px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit Operations Query"}
      </button>
    </form>
  );
}
