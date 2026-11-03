import { Button, Container, CtaBand, Eyebrow, SectionHeading } from "@/components/ui";
import { PipelineVisual } from "@/components/PipelineVisual";

const commitments = [
  { value: "30 days", label: "Target to your first live workflow" },
  { value: "Fixed price", label: "Milestone-based scopes, no open-ended billing" },
  { value: "You own it", label: "Code, data and documentation stay with you" },
];

const capabilities = [
  {
    tag: "Ingestion",
    title: "Document Extraction",
    body: "Automate parsing of invoices, contracts and purchase orders. Fields are extracted, validated and routed straight into your financial ledgers.",
  },
  {
    tag: "Execution",
    title: "Pipeline Automation",
    body: "Remove repetitive cross-department data entry with event-driven validation scripts and scheduled batch processing.",
  },
  {
    tag: "Architecture",
    title: "System Synchronization",
    body: "Connect legacy databases, CRMs and ERPs to modern cloud reporting tools — without a major infrastructure overhaul.",
  },
];

const steps = [
  {
    title: "Workflow Audit",
    body: "We review friction points, volume logs and software dependencies to quantify what automation is actually worth to you.",
  },
  {
    title: "Architecture Map",
    body: "We draft data validation schemas and fallback rules tailored to your security and compliance requirements.",
  },
  {
    title: "Staged Integration",
    body: "Parallel test pipelines are benchmarked against verified historical records before anything touches production.",
  },
  {
    title: "Production Run",
    body: "Go live with end-to-end monitoring, written documentation and hands-on staff walkthroughs.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <Container className="relative grid items-center gap-14 py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Eyebrow>Pragmatic Automation</Eyebrow>
            <h1 className="mt-5 text-4xl font-light leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
              Production AI for <span className="font-bold">operational workflows</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              We integrate reliable AI and machine learning pipelines into the software you already use —
              cutting manual admin work and aiming to return measurable staff hours within the first 30 days.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact">Request Operations Review</Button>
              <Button href="/services" variant="secondary">
                Review Services
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted">Based in Miramar, FL · Serving South Florida and remote US clients</p>
          </div>
          <PipelineVisual />
        </Container>
      </section>

      {/* Commitments (replaces unverified stats) */}
      <section className="border-y border-line bg-surface">
        <Container className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {commitments.map((c) => (
            <div key={c.value} className="px-2 py-8 sm:px-8">
              <p className="font-display text-2xl font-semibold text-ink">{c.value}</p>
              <p className="mt-1 text-sm text-muted">{c.label}</p>
            </div>
          ))}
        </Container>
      </section>

      {/* Capabilities */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Core Capabilities"
            title="Targeted workflow integrations"
            intro="We replace manual handoffs with automated pipelines built on top of your existing databases, ERP systems and documentation tools."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {capabilities.map((c) => (
              <article key={c.title} className="rounded-2xl border border-line bg-surface p-7 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5">
                <p className="text-xs font-semibold uppercase tracking-widest text-sky">{c.tag}</p>
                <h3 className="mt-3 text-xl font-semibold text-ink">{c.title}</h3>
                <p className="mt-3 leading-relaxed text-ink-soft">{c.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* Delivery path */}
      <section className="bg-surface py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Delivery Path" title="Four steps to deployment" />
          <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-line bg-canvas p-7">
                <span className="font-display text-sm font-semibold text-teal">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Button href="/contact">Schedule Operational Review</Button>
          </div>
        </Container>
      </section>

      <CtaBand
        title="Modernize your operational throughput"
        body="Book a preliminary systems evaluation. We'll review your data pipelines and identify where automation pays off first."
        cta="Book a Systems Evaluation"
      />
    </>
  );
}
