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
      className="sticky top-0 flex h-dvh w-14 flex-col items-center border-r border-border bg-panel py-3"
    >
      <Link
        href="/"
        aria-label="Catalyst home"
        className="flex size-10 items-center justify-center rounded-sm"
      >
        <IconLogo />
      </Link>

      <ul className="mt-4 flex flex-col items-center gap-1">
        {ITEMS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                title={label}
                className={`flex size-11 items-center justify-center rounded-sm transition-colors duration-[120ms] ease-ct ${
                  active
                    ? "bg-ink-300 text-slate-100"
                    : "text-slate-400 hover:bg-ink-200 hover:text-slate-200"
                }`}
              >
                <Icon />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto w-full border-t border-border pt-3">
        <ul className="flex flex-col items-center gap-3">
          {CONNECTIONS.map((c) => (
            <li key={c.name} className="group relative flex flex-col items-center gap-1">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${c.operational ? "bg-green-base" : "bg-red-base"}`}
              />
              <MonoValue size="eyebrow" tone="muted" aria-hidden="true">
                {formatDuration(c.lastCallMs)}
              </MonoValue>
              <span className="pointer-events-none absolute bottom-0 left-full z-50 ml-2 hidden whitespace-nowrap rounded-sm border border-border-strong bg-card px-2 py-1 group-hover:block">
                <span className="text-body-sm text-slate-200">{c.name}</span>
              </span>
              <span className="sr-only">
                {c.name}, {c.operational ? "operational" : "unavailable"}, last call{" "}
                {formatDuration(c.lastCallMs)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
