import type { Metadata } from "next";
import { Button, Container, CtaBand, Eyebrow, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Automated document parsing, pipeline orchestration and custom forecasting models that connect to your existing accounting, CRM and ERP software.",
  alternates: { canonical: "/services" },
};

const modules = [
  {
    tag: "Data Intake",
    title: "Automated Document Parsing",
    body: "Extract line items, invoices and unstructured PDFs into your existing databases with zero manual entry.",
    points: ["Invoices, POs, contracts, forms", "Field-level validation rules", "Human review for exceptions only"],
  },
  {
    tag: "Data Flow",
    title: "Pipeline Orchestration",
    body: "Sync records across CRM and accounting platforms in real time, with built-in error handling and alerts.",
    points: ["Event-driven and scheduled jobs", "Retry logic and audit logs", "Slack / email alerting"],
  },
  {
    tag: "Analytics",
    title: "Custom Forecasting Models",
    body: "Anticipate inventory bottlenecks and resource needs using your own historical operational data.",
    points: ["Built on your historical metrics", "Dashboards your team can read", "Retrained as your data grows"],
  },
];

const governance = [
  { title: "Your perimeter", body: "Client data stays inside your own secure cloud environment wherever possible." },
  { title: "Least-privilege access", body: "Integrations use scoped credentials you control and can revoke at any time." },
  { title: "Full ownership", body: "Every engagement ships with source code, documentation and staff runbooks." },
  { title: "Mutual NDA", body: "Signed before we review any proprietary process or system architecture." },
];

export default function ServicesPage() {
  return (
    <>
      <section id="integrations" className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <Container className="relative py-16 sm:py-24">
          <Eyebrow>Operational Automation</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-4xl font-light leading-[1.1] text-ink sm:text-5xl">
            Production-ready <span className="font-bold">systems integration</span> for modern operations
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            We deploy measurable automated workflows that connect to your existing accounting, CRM and ERP software.
          </p>
          <div className="mt-8">
            <Button href="/contact">Request a Systems Evaluation</Button>
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <Container className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
          <p className="font-display text-2xl font-medium leading-snug text-ink sm:text-3xl">
            Every automated system connects cleanly to your current tooling — without disrupting active throughput.
          </p>
          <p className="text-lg leading-relaxed text-ink-soft">
            Fixed-price, milestone-based engagements give you clear deliverables and dependable timelines from day one.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Core Modules" title="Targeted modules built for operational throughput" />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {modules.map((m) => (
              <article key={m.title} id={m.tag === "Data Intake" ? "document-parsing" : m.tag === "Data Flow" ? "pipeline-orchestration" : "forecasting"} className="flex flex-col rounded-2xl border border-line bg-surface p-7">
                <p className="text-xs font-semibold uppercase tracking-widest text-sky">{m.tag}</p>
                <h2 className="mt-3 text-xl font-semibold text-ink">{m.title}</h2>
                <p className="mt-3 leading-relaxed text-ink-soft">{m.body}</p>
                <ul className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-ink-soft">
                  {m.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-ink py-20 text-white sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky">Security &amp; Ownership</p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Strict data governance and complete client ownership</h2>
            <p className="mt-4 text-lg text-slate-300">
              Built so your team can run, audit and maintain every system independently.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {governance.map((g) => (
              <div key={g.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{g.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand
        title="Ready to map your automation requirements?"
        body="Tell us about your workflow. An engineer will reply with the next steps."
        cta="Request a Systems Evaluation"
      />
    </>
  );
}
