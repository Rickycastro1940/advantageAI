import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal">
      <span className="h-1.5 w-1.5 rounded-full bg-sky" />
      {children}
    </p>
  );
}

type ButtonProps = { href: string; children: ReactNode; variant?: "primary" | "secondary" | "light" };

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  const styles = {
    primary: "bg-ink text-white hover:bg-brand-deep",
    secondary: "border border-line bg-surface text-ink hover:border-ink/30",
    light: "bg-white text-ink hover:bg-slate-100",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${styles}`}
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

export function CtaBand({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-brand-deep px-6 py-14 text-center sm:px-12">
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-30 invert" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
            <p className="mt-4 text-lg text-slate-300">{body}</p>
            <div className="mt-8">
              <Button href="/contact" variant="light">
                {cta}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
