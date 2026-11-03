import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { ContactForm } from "./ContactForm";
import { site, telHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk directly with an engineer about your workflow bottlenecks. Written feasibility and scope evaluation within two business days.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Container className="relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Eyebrow>Initiate Discovery</Eyebrow>
          <h1 className="mt-5 text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
            <span className="font-bold">Direct engineering</span> scoping for your workflows
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft">
            Speak with the engineer who will build your system — not a sales rep. You&apos;ll receive a written
            feasibility and scope evaluation within two business days.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <dt className="text-sm text-muted">Scope evaluation</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">2 business days</dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-5">
              <dt className="text-sm text-muted">Standard protocol</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-ink sm:text-2xl">Mutual NDA</dd>
            </div>
          </dl>

          <div className="mt-10 rounded-2xl border border-teal/20 bg-teal/5 p-6">
            <h2 className="text-lg font-semibold text-ink">Strict confidentiality</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Mutual NDAs are signed before any proprietary process review or system architecture discussion.
            </p>
          </div>

          <ul className="mt-10 space-y-2 text-sm text-ink-soft">
            <li>
              Email:{" "}
              <a className="font-medium text-ink underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                Phone:{" "}
                <a className="font-medium text-ink underline-offset-4 hover:underline" href={telHref(site.phone)}>
                  {site.phone}
                </a>
              </li>
            )}
            <li>
              {site.location.city}, {site.location.region} · {site.location.serviceNote}
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-ink/5 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Scope your bottlenecks</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Submit your operational requirements</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Share your current software stack and target workflows. An engineer reviews every submission directly.
          </p>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
