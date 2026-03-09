"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar({ links }: { links: readonly { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <aside className="border-r border-slate-200 bg-brand-ink px-4 py-6 text-slate-100 lg:min-h-screen">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">HTSG</p>
        <h2 className="text-2xl font-semibold">Field Control</h2>
      </div>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href as Route}
            className={cn(
              "block rounded-xl px-4 py-3 text-sm font-medium transition",
              pathname === link.href ? "bg-white text-brand-ink" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
