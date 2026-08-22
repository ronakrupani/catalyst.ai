"use client";

import { useEffect } from "react";

export interface UndoToastProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  /** Auto-dismiss window, per the 3 to 5 second guidance. */
  timeoutMs?: number;
}

/**
 * Announced politely rather than grabbing focus, so it never interrupts what
 * the user is doing next.
 */
export function UndoToast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  timeoutMs = 6000,
}: UndoToastProps) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, timeoutMs);
    return () => window.clearTimeout(t);
  }, [onDismiss, timeoutMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border-strong bg-card px-4 py-2 shadow-[var(--ct-elev-3-shadow)]"
    >
      <span className="text-body text-slate-200">{message}</span>
      <button
        type="button"
        onClick={onAction}
        className="rounded-full px-3 py-1 text-body font-medium text-violet-bright transition-colors duration-[120ms] ease-ct hover:bg-ink-300"
      >
        {actionLabel}
      </button>
    </div>
  );
}
