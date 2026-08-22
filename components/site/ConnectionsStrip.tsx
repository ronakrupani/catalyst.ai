"use client";

import { CONNECTIONS } from "@/lib/connections";
import { formatDuration } from "@/lib/format";
import { MonoValue } from "@/components/primitives/MonoValue";
import { StatusPill } from "@/components/primitives/StatusPill";
import { useRun } from "./RunProvider";

/**
 * Act 5. The run finishes here: the last span closes on the docked rail and
 * the glow moves off it onto the done pill.
 */
export function ConnectionsStrip() {
  const { glowOwner } = useRun();

  return (
    <section
      aria-labelledby="connections-heading"
      className="border-t border-border"
    >
      <div className="ct-wrap flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <h2 id="connections-heading" className="ct-eyebrow">
            connections
          </h2>
          {CONNECTIONS.map((c) => (
            <div key={c.name} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${
                  c.operational ? "bg-green-base" : "bg-red-base"
                }`}
              />
              <span className="text-body text-slate-200">{c.name}</span>
              <MonoValue size="body-sm" tone="muted">
                {formatDuration(c.lastCallMs)}
              </MonoValue>
              <span className="sr-only">
                {c.operational ? "operational" : "unavailable"}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <MonoValue size="eyebrow" tone="muted">
            run
          </MonoValue>
          <StatusPill status="done" glow={glowOwner === "done"} />
        </div>
      </div>
    </section>
  );
}
