"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CONNECTIONS } from "@/lib/connections";
import { formatDuration } from "@/lib/format";
import { MonoValue } from "@/components/primitives/MonoValue";
import { IconAudit, IconCampaigns, IconLogo, IconNewCampaign } from "./icons";

const ITEMS = [
  { href: "/app", label: "New campaign", Icon: IconNewCampaign, exact: true },
  { href: "/app/campaigns", label: "Campaigns", Icon: IconCampaigns, exact: false },
  { href: "/app/audit", label: "Audit", Icon: IconAudit, exact: false },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className="sticky top-0 flex h-dvh flex-col border-r border-border bg-panel"
    >
      <Link
        href="/"
        className="flex h-14 shrink-0 items-center gap-2.5 px-4"
        aria-label="Catalyst home"
      >
        <IconLogo />
        <span className="ct-display text-body-lg text-slate-100">catalyst.ai</span>
      </Link>

      <ul className="mt-2 flex flex-col gap-0.5 px-2">
        {ITEMS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center gap-3 rounded-sm px-3 text-body transition-colors duration-[120ms] ease-ct ${
                  active
                    ? "bg-ink-300 text-slate-100"
                    : "text-slate-300 hover:bg-ink-200 hover:text-slate-100"
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Bottom-pinned health strip. Not a route. */}
      <section aria-label="Connections" className="mt-auto border-t border-border px-4 py-4">
        <h2 className="ct-eyebrow">Connections</h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {CONNECTIONS.map((c) => (
            <li key={c.name} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={`size-1.5 shrink-0 rounded-full ${
                  c.operational ? "bg-green-base" : "bg-red-base"
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-body-sm text-slate-300">{c.name}</span>
              <MonoValue size="body-sm" tone="muted">
                {formatDuration(c.lastCallMs)}
              </MonoValue>
              <span className="sr-only">
                {c.operational ? "operational" : "unavailable"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </nav>
  );
}
