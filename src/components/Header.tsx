"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header border-b border-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {site.nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/#ask-advantage" className="text-sm font-medium text-brand transition-colors hover:text-brand-deep">Ask Advantage</Link>
          <Link
            href="/contact"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-deep"
          >
            Request an Evaluation
          </Link>
        </nav>

        <button
          type="button"
          className="-mr-2 rounded-md p-2 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-canvas px-4 pb-5 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col py-2">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className={`block py-3 text-base font-medium ${
                    pathname === item.href ? "text-ink" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li><Link href="/#ask-advantage" onClick={close} className="block py-3 text-base font-medium text-brand">Ask Advantage</Link></li>
          </ul>
          <Link
            href="/contact"
            onClick={close}
            className="block rounded-lg bg-ink px-4 py-3 text-center text-sm font-medium text-white"
          >
            Request an Evaluation
          </Link>
        </nav>
      )}
    </header>
  );
}
