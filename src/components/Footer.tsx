import Link from "next/link";
import { Logo } from "./Logo";
import { site, telHref } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:px-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">{site.tagline}</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Navigation</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Direct inquiry</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white">
                {site.email}
              </a>
            </li>
            {site.phone && (
              <li>
                <a href={telHref(site.phone)} className="hover:text-white">
                  {site.phone}
                </a>
              </li>
            )}
            <li>
              {site.location.city}, {site.location.region} · {site.location.serviceNote}
            </li>
            <li className="text-slate-400">Response time: {site.responseTime.toLowerCase()}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:justify-between sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Production-grade automations in weeks, not quarters.</p>
        </div>
      </div>
    </footer>
  );
}
