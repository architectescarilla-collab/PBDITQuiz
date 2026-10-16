"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "PBDIT Quiz Games", short: "Quiz Games", icon: "📚", match: (p: string) => !p.startsWith("/games") },
  { href: "/games", label: "Other Games", short: "Other Games", icon: "🕹️", match: (p: string) => p.startsWith("/games") },
];

/** Site-wide tabs: PBDIT learning games vs. just-for-fun games. */
export function SiteTabs() {
  const pathname = usePathname() ?? "/";
  return (
    <nav aria-label="Sections" className="border-b border-cream/10 bg-umber-dark/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl justify-center gap-1 px-2 pt-2 sm:justify-start sm:px-6">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-t-xl px-4 py-2 text-sm font-extrabold transition sm:px-5 ${
                active ? "bg-page text-accent" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <span aria-hidden>{t.icon}</span> <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
