/** Illustrative hero graphic: a document moving through an automated pipeline. */
export function PipelineVisual() {
  const fields = [
    ["Vendor", "Coastal Supply Co."],
    ["Invoice #", "INV-20481"],
    ["Due date", "Net 30"],
    ["Total", "$4,812.50"],
  ];

  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-sky/15 via-transparent to-brand/15 blur-2xl" />

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-xl shadow-ink/5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">Pipeline · AP intake</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Running
          </span>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Node label="Inbox" sub="invoice_0423.pdf" icon="doc" />
          <Arrow />
          <Node label="Extract" sub="Fields + validation" icon="spark" highlight />
        </div>
        <div className="my-1 flex justify-end pr-[22%]">
          <svg width="16" height="28" viewBox="0 0 16 28">
            <path d="M8 0v28" stroke="#0ea5e9" strokeWidth="2" className="flow-line" />
          </svg>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Node label="Ledger" sub="Posted to ERP" icon="db" />
          <Arrow reverse />
          <Node label="Review" sub="Exceptions only" icon="check" />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-canvas p-3 text-xs">
          {fields.map(([k, v]) => (
            <div key={k} className="rounded-lg bg-surface px-3 py-2">
              <dt className="text-muted">{k}</dt>
              <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Arrow({ reverse = false }: { reverse?: boolean }) {
  return (
    <svg width="36" height="12" viewBox="0 0 36 12" className={reverse ? "rotate-180" : ""}>
      <path d="M0 6h30" stroke="#0ea5e9" strokeWidth="2" className="flow-line" />
      <path d="M28 1l6 5-6 5" fill="none" stroke="#0ea5e9" strokeWidth="2" />
    </svg>
  );
}

function Node({
  label,
  sub,
  icon,
  highlight = false,
}: {
  label: string;
  sub: string;
  icon: "doc" | "spark" | "db" | "check";
  highlight?: boolean;
}) {
  const paths: Record<typeof icon, string> = {
    doc: "M7 3h7l5 5v13H7zM14 3v5h5",
    spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
    db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    check: "M5 12.5 10 17l9-10",
  };
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight ? "border-sky/40 bg-sky/5" : "border-line bg-surface"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-teal" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[icon]} />
      </svg>
      <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}
