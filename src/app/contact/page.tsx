import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { ContactForm } from "./ContactForm";
import { site, telHref } from "@/lib/site";

export const metadata: Metadata = { title: "Request a Systems Evaluation", description: "Tell us about one workflow. An engineer will review your request and reply with clear next steps.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <section className="relative overflow-hidden">
    <Container className="relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20">
      <div>
        <Eyebrow>Let’s find your first workflow</Eyebrow>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.12] text-ink sm:text-5xl">Start with the work<br />that slows you down.</h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft">Tell us what your team does manually today. We’ll review your workflow, discuss what is feasible and agree on the next step together.</p>
        <ol className="contact-steps">
          <li><span>1</span><div><strong>Share the workflow</strong><p>A short description is enough to get started.</p></div></li>
          <li><span>2</span><div><strong>Hear from an engineer</strong><p>We reply within one business day to clarify your needs.</p></div></li>
          <li><span>3</span><div><strong>Agree on the next step</strong><p>Arrange a conversation and map a focused evaluation.</p></div></li>
        </ol>
        <div className="mt-10 border-t border-line pt-6"><p className="text-sm font-semibold text-ink">Prefer a direct conversation?</p><ul className="mt-3 space-y-2 text-sm text-ink-soft"><li><a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a></li><li><a href={telHref(site.phone)} className="underline underline-offset-4">{site.phone}</a></li><li className="pt-2 text-xs text-muted">{site.location.city}, {site.location.region} · South Florida &amp; remote US</li></ul></div>
      </div>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-xl shadow-ink/5 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Systems evaluation</p>
        <h2 className="mt-3 text-2xl font-semibold">What would you like to improve?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">Three required fields. No technical specification needed. Your note is emailed to <a className="underline underline-offset-4" href={`mailto:${site.email}`}>{site.email}</a>.</p>
        <ContactForm />
        <p className="mt-5 text-xs leading-relaxed text-muted">This is an evaluation request, not a confirmed appointment. Please don’t include passwords, customer records or confidential files. We can arrange an NDA before reviewing proprietary information.</p>
      </div>
    </Container>
  </section>;
}
