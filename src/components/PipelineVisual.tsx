/** An explicitly illustrative workflow, not a live product or customer result. */
export function PipelineVisual() {
  return <div className="workflow-visual" role="img" aria-label="Illustrative document workflow: receive an invoice, extract and validate fields, review exceptions, and sync approved records to accounting.">
    <div className="workflow-topbar"><span className="workflow-mark">A<span>↗</span></span><span>WORKFLOW STUDIO</span><span className="demo-label">ILLUSTRATIVE</span></div>
    <div className="workflow-heading"><div><p>ACCOUNTS PAYABLE</p><h2>From inbox to accounting.</h2></div><span className="workflow-dots">•••</span></div>
    <div className="workflow-canvas">
      <div className="document-preview"><span className="document-icon">↳</span><div><strong>Invoice received</strong><span>invoice_0423.pdf</span></div><span className="file-tag">PDF</span></div>
      <div className="workflow-connector" />
      <div className="extract-node"><div className="node-icon">✳</div><div><strong>Extract &amp; validate</strong><span>Structured fields. Clear rules.</span></div><span className="node-check">✓</span></div>
      <div className="workflow-connector" />
      <div className="workflow-branches"><div><span className="branch-tag">APPROVED</span><div className="branch-node"><span>↔</span><strong>Sync to accounting</strong></div></div><div><span className="branch-tag">EXCEPTION</span><div className="branch-node"><span>◎</span><strong>Human review</strong></div></div></div>
    </div>
    <div className="workflow-bottom"><span className="status-dot" /><span>Validation at every handoff</span><span className="workflow-bottom-end">YOU STAY IN CONTROL ↗</span></div>
  </div>;
}
