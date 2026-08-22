"use client";

import { useCallback, useRef } from "react";
import { formatGrouped } from "@/lib/format";

const MAX_DIGITS = 12;

export interface MoneyInputProps {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  invalid?: boolean;
  "aria-describedby"?: string;
  className?: string;
}

/**
 * Money field. The symbol and the currency sit in the frame rather than in the
 * value, digits group as they are typed, and the figure is tabular so it does
 * not shift width while the number grows.
 */
export function MoneyInput({
  id,
  value,
  onChange,
  onBlur,
  invalid,
  className = "",
  ...rest
}: MoneyInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  /**
   * The digit path strips a decimal point immediately, so by the time a k or m
   * suffix arrives the field reads "15m" for what was typed as "1.5m". This
   * remembers that a point was typed so the suffix is not applied to a number
   * that already lost its scale.
   */
  const sawDecimal = useRef(false);

  const handle = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const el = event.target;
      const caret = el.selectionStart ?? el.value.length;
      // Count digits to the left of the caret so it can be restored after the
      // separators shift underneath it.
      const digitsBefore = el.value.slice(0, caret).replace(/\D/g, "").length;

      // Shorthand: 250k and 1.5m expand as soon as the suffix is typed, which
      // is how people say these numbers out loud.
      // Integer shorthand only. If a decimal point was typed the suffix is
      // ignored rather than guessed at: on a budget, landing visibly low is
      // recoverable, landing ten times high is not.
      if (el.value === "") sawDecimal.current = false;
      const hadDecimal = sawDecimal.current || el.value.includes(".");
      const shorthand = hadDecimal
        ? null
        : /^\s*\$?\s*([\d,]+)\s*([km])\s*$/i.exec(el.value);
      if (shorthand) {
        const magnitude = shorthand[2].toLowerCase() === "m" ? 1_000_000 : 1_000;
        const expanded = Number(shorthand[1].replace(/,/g, "")) * magnitude;
        onChange(Number.isFinite(expanded) ? expanded : null);
        requestAnimationFrame(() => {
          const node = ref.current;
          if (node) {
            const end = node.value.length;
            node.setSelectionRange(end, end);
          }
        });
        return;
      }

      const digits = el.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
      const next = digits ? Number(digits) : null;
      onChange(next);

      requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const formatted = next === null ? "" : formatGrouped(next);
        let seen = 0;
        let pos = formatted.length;
        if (digitsBefore === 0) {
          pos = 0;
        } else {
          for (let i = 0; i < formatted.length; i += 1) {
            if (/\d/.test(formatted[i])) seen += 1;
            if (seen === digitsBefore) {
              pos = i + 1;
              break;
            }
          }
        }
        node.setSelectionRange(pos, pos);
      });
    },
    [onChange],
  );

  const step = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === ".") {
        sawDecimal.current = true;
        event.preventDefault();
        return;
      }
      if (event.key === ",") {
        event.preventDefault();
        return;
      }
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      const size = event.shiftKey ? 10_000 : 1_000;
      const delta = event.key === "ArrowUp" ? size : -size;
      const base = value ?? 0;
      onChange(Math.max(0, base + delta));
    },
    [onChange, value],
  );

  return (
    <div
      className={`flex h-11 items-center rounded-sm border bg-ink-100 px-3 transition-colors duration-[120ms] ease-ct focus-within:border-violet-dim focus-within:shadow-[var(--ct-glow-focus)] ${
        invalid ? "border-red-dim" : "border-ink-400"
      } ${className}`}
    >
      <span aria-hidden="true" className="ct-num shrink-0 text-body-lg text-slate-200">
        $
      </span>
      {/* The frame carries the focus ring, so the field must not draw its own. */}
      <input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value === null ? "" : formatGrouped(value)}
        onChange={handle}
        onKeyDown={step}
        onFocus={() => {
          sawDecimal.current = false;
        }}
        onBlur={() => {
          sawDecimal.current = false;
          onBlur?.();
        }}
        aria-invalid={invalid || undefined}
        placeholder="0"
        data-no-focus-ring
        className="ct-num min-w-0 flex-1 bg-transparent px-2 text-body-lg text-slate-100 placeholder:text-slate-400 focus:outline-none"
        {...rest}
      />
      <span aria-hidden="true" className="ct-num shrink-0 text-label text-slate-400">
        USD
      </span>
    </div>
  );
}

export interface SpendPresetsProps {
  onPick: (value: number) => void;
  active: number | null;
}

const PRESETS = [10000, 50000, 250000, 1000000];

export function SpendPresets({ onPick, active }: SpendPresetsProps) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {PRESETS.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onPick(amount)}
          aria-pressed={active === amount}
          className={`ct-num rounded-full px-3 py-1.5 text-label transition-colors duration-[120ms] ease-ct ${
            active === amount
              ? "bg-ink-400 text-slate-100"
              : "bg-ink-200 text-slate-300 hover:bg-ink-300 hover:text-slate-100"
          }`}
        >
          {amount >= 1000000 ? `$${amount / 1000000}M` : `$${amount / 1000}k`}
        </button>
      ))}
    </div>
  );
}
