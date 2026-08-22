"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MonoValue } from "@/components/primitives/MonoValue";
import { scrapeSite, type ScrapeResult } from "@/lib/api";

const LOADING_STEPS = ["Fetching the page", "Pulling out your offer", "Filling in the brief"];

export function IntakeStageA({
  onDone,
  onSkip,
}: {
  onDone: (url: string, result: ScrapeResult | null) => void;
  onSkip: () => void;
}) {
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);

  const host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "apple.com";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setRunning(true);
    setFailed(null);
    const timers = [
      window.setTimeout(() => setStep(1), 700),
      window.setTimeout(() => setStep(2), 1500),
    ];
    try {
      const result = await scrapeSite(url.trim());
      timers.forEach(clearTimeout);
      onDone(url.trim(), result);
    } catch {
      timers.forEach(clearTimeout);
      setRunning(false);
      setFailed(host);
    }
  }

  if (running) {
    return (
      <div>
        <h1 className="ct-display text-headline text-slate-100">Reading {host}</h1>
        <ul className="mt-6 flex flex-col gap-3">
          {LOADING_STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex size-5 items-center justify-center rounded-full border ${
                  i < step
                    ? "border-green-dim bg-green-wash text-green-bright"
                    : i === step
                      ? "border-violet-dim bg-violet-wash"
                      : "border-ink-500"
                }`}
              >
                {i < step ? (
                  <svg viewBox="0 0 12 12" className="ct-check-in size-3" aria-hidden="true">
                    <path
                      d="M2.5 6.2 4.8 8.5 9.5 3.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              <span className={i <= step ? "text-body text-slate-200" : "text-body text-slate-400"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <h1 className="ct-display text-headline text-slate-100">Point Catalyst at your product.</h1>
      <p className="mt-3 max-w-xl text-body-lg leading-relaxed text-slate-300">
        Drop in a URL. We read the site, fill in what we can, and you correct the rest.
      </p>

      {failed && (
        <p className="mt-5 rounded-sm border border-red-dim bg-red-wash px-4 py-3 text-body text-red-bright">
          Could not read {failed}. Fill the brief in manually and we will carry on.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 max-w-xl">
        <Label htmlFor="product-url-stage-a">Website</Label>
        <div className="mt-2 flex gap-3">
          <Input
            id="product-url-stage-a"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="apple.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="ct-num"
          />
          <Button type="submit" disabled={!url.trim()}>
            Read my site
          </Button>
        </div>
      </form>

      <button
        type="button"
        onClick={onSkip}
        className="mt-4 rounded-sm text-body text-slate-300 underline underline-offset-4 transition-colors duration-[120ms] ease-ct hover:text-slate-100"
      >
        Skip, I will fill it in
      </button>

      <p className="mt-8 text-body-sm text-slate-400">
        Reads run through Bright Data.{" "}
        <MonoValue size="body-sm" tone="muted">
          {host}
        </MonoValue>
      </p>
    </div>
  );
}
