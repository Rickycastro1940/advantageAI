import { Button, Container, CtaBand, Eyebrow, SectionHeading } from "@/components/ui";
import { PipelineVisual } from "@/components/PipelineVisual";
import { ServiceAssistant } from "@/components/ServiceAssistant";

const problems = [
  ["01", "Invoice intake", "/services#document-parsing"],
  ["02", "Purchase orders", "/services#document-parsing"],
  ["03", "Contract fields", "/services#document-parsing"],
  ["04", "CRM sync", "/services#pipeline-orchestration"],
  ["05", "Accounting handoff", "/services#pipeline-orchestration"],
  ["06", "Exception review", "/contact"],
  ["07", "Audit trail", "/services#pipeline-orchestration"],
  ["08", "Operational forecasts", "/services#forecasting"],
] as const;
const capabilities = [
  { number: "01", tag: "Document intelligence", title: "From document to usable data.", body: "Extract the fields that matter from invoices, purchase orders and contracts. Validate them before they reach your systems.", path: "Documents → Validation → Your database", href: "/services#document-parsing" },
  { number: "02", tag: "Workflow automation", title: "Let the handoffs handle themselves.", body: "Connect repetitive tasks with event-driven pipelines, clear exception handling and a record of what happened.", path: "Trigger → Process → Human review", href: "/services#pipeline-orchestration" },
  { number: "03", tag: "Systems integration", title: "Make your existing tools work together.", body: "Move information between your CRM, accounting software and databases, without replacing the systems your team knows.", path: "CRM ↔ Operations ↔ Reporting", href: "/services#integrations" },
];
const steps = [
  { title: "Find the right workflow", body: "Review the manual work, software dependencies and business value. Start with one clearly defined problem." },
  { title: "Design the handoffs", body: "Map your data, validation rules and human checkpoints before building the integration." },
  { title: "Test before going live", body: "Compare a staged pipeline with verified records. Review exceptions and agree on success criteria." },
  { title: "Launch with ownership", body: "Receive source code, documentation, monitoring and a walkthrough your team can use." },
];
const faqs = [
  ["Do we need to replace our current software?", "The focus is connecting to the software you already use. We assess APIs, data access and integration constraints during the evaluation, before agreeing on a scope."],
  ["Where should we start?", "Choose one repetitive workflow with clear inputs and outputs: invoice intake, record synchronization or a recurring reporting handoff. The evaluation helps determine feasibility and what to measure."],
  ["What happens after I request an evaluation?", "An engineer reviews your request and replies within one business day. We clarify the workflow and arrange next steps together. The form requests a conversation; it does not reserve a calendar slot."],
  ["Who owns the finished system?", "You retain the code, data and documentation. Engagements use defined milestones, with scope and pricing agreed before implementation."],
];

export default function Home() {
  return <>
    <section className="hero-section">
      <Container className="hero-layout">
        <div className="hero-copy">
          <Eyebrow>AI engineering for real operations</Eyebrow>
          <h1>Less busywork.<br />More <span className="text-brand">forward.</span></h1>
          <p className="hero-description">Production-ready AI, built into the tools you already use. Turn document intake, manual handoffs and disconnected data into workflows your team can rely on.</p>
          <div className="hero-actions"><Button href="/contact">Request a Systems Evaluation</Button><a href="#capabilities" className="text-link">Explore what we build <span aria-hidden="true">↗</span></a></div>
          <div className="hero-reassurance"><span className="status-dot" /> Direct access to your engineer <span className="reassurance-divider">/</span> You own the solution</div>
        </div>
        <PipelineVisual />
      </Container>
      <Container><div className="hero-footer"><p>Based in Miramar, Florida.<br /><strong>Built for South Florida &amp; remote US teams.</strong></p><p className="hero-footer-note">YOUR TOOLS. CONNECTED.<br /><span>Documents · CRM · Accounting · ERP</span></p></div></Container>
    </section>

    <section className="section-space bg-white" id="problems">
      <Container>
        <div className="section-intro">
          <SectionHeading eyebrow="Where to start" title={<>What should your team<br />stop doing manually?</>} />
          <p>Pick one repetitive handoff. We connect it to the software you already run, with validation and a person on the exceptions.</p>
        </div>
        <div className="problem-grid">
          {problems.map(([n, label, href]) => (
            <a key={n} href={href}><small>{n}</small><strong>{label}</strong></a>
          ))}
        </div>
      </Container>
    </section>

    <section id="capabilities" className="section-space bg-white">
      <Container>
        <div className="section-intro"><SectionHeading eyebrow="What we build" title={<>Practical systems.<br />A clearer way to work.</>} /><p>Start where the friction is. We connect AI to a specific business process, with the validation, visibility and human oversight it needs.</p></div>
        <div className="capability-grid">{capabilities.map(c=><article className="capability-card" key={c.number}><div className="capability-top"><span>{c.number}</span><span>{c.tag}</span></div><h3>{c.title}</h3><p>{c.body}</p><div className="capability-path">{c.path}</div><a href={c.href} className="text-link">Explore service <span aria-hidden="true">↗</span></a></article>)}</div>
      </Container>
    </section>

    <ServiceAssistant />

    <section className="ownership-section section-space">
      <Container className="ownership-grid">
        <div><Eyebrow>Built to be operated</Eyebrow><h2>Automation should make work simpler.<br /><span>Including the work of managing it.</span></h2><p>Useful AI is more than a model. It is a system that fits your operations and stays understandable after launch.</p><Button href="/services" variant="light">See our approach</Button></div>
        <div className="ownership-list">{[["01", "Human checkpoints", "Review exceptions and keep consequential decisions in the right hands."],["02","Defined milestones", "Agree on deliverables and fixed-price scope before the build begins."],["03","Your code. Your control.","Keep the source, documentation and runbooks your team needs to operate the system."]].map(([n,t,b])=><div key={n}><span>{n}</span><div><h3>{t}</h3><p>{b}</p></div></div>)}</div>
      </Container>
    </section>

    <section className="section-space process-section" id="approach"><Container><div className="section-intro"><SectionHeading eyebrow="From first conversation to production" title="One workflow. A clear path." /><p>A focused first integration gives you something concrete to evaluate, before expanding to the rest of your operations.</p></div><ol className="process-grid">{steps.map((s,i)=><li key={s.title}><span className="step-number">0{i+1}</span><h3>{s.title}</h3><p>{s.body}</p></li>)}</ol></Container></section>

    <section className="section-space bg-white"><Container className="faq-layout"><SectionHeading eyebrow="A few things to know" title="Clear answers before we build." /><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></Container></section>
    <CtaBand title="What could your team stop doing manually?" body="Tell us about one workflow. We’ll help you understand where AI fits, what it would take to build, and what to measure." cta="Request a Systems Evaluation" />
  </>;
}
