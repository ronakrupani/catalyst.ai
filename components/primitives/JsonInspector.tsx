"use client";

import { useCallback, useState } from "react";

/**
 * Collapsed by default. Machine output renders exactly as emitted, in mono.
 */
export function JsonInspector({
  title,
  value,
  className = "",
}: {
  title: string;
  value: unknown;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the text stays selectable.
    }
  }, [text]);

  return (
    <section className={`ct-elev-1 rounded-md ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-sm text-body font-medium text-slate-100"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className={`size-3 text-slate-400 transition-transform duration-[120ms] ease-ct ${open ? "rotate-90" : ""}`}
          >
            <path d="M4.5 2 8.5 6 4.5 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {title}
        </button>
        <button
          type="button"
          onClick={copy}
          className="ct-num rounded-xs px-2 py-1 text-label text-slate-300 transition-colors duration-[120ms] ease-ct hover:bg-ink-300 hover:text-slate-100"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {open && (
        <pre className="max-h-[420px] overflow-auto border-t border-border px-4 py-3 text-body-sm leading-relaxed text-slate-200">
          {text}
        </pre>
      )}
      <p aria-live="polite" className="sr-only">
        {copied ? "Bid payload copied to clipboard" : ""}
      </p>
    </section>
  );
}
