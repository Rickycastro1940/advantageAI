import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 4 44 22v9L24 13 4 31v-9z" fill="#1f5fbf" />
      <path d="M24 19 44 37v9L24 28 4 46v-9z" fill="#1c3c6d" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Advantage AI Solutions home">
      <LogoMark />
      <span
        className={`font-display text-[15px] font-bold leading-[1.05] ${
          inverted ? "text-white" : "text-brand-deep"
        }`}
      >
        Advantage
        <br />
        AI Solutions
      </span>
    </Link>
  );
}
