"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MonoValue } from "@/components/primitives/MonoValue";
import { CAMPAIGN_GOALS, type CampaignBrief } from "@/lib/campaign";
import { createCampaign } from "@/lib/api";

const EMPTY: CampaignBrief = {
  product_name: "",
  product_url: "",
  offer_summary: "",
  target_audience: "",
  campaign_goal: "",
  maximum_spend_usd: null,
  publication_window_start: "",
  publication_window_end: "",
};

type Field = keyof CampaignBrief;

/** New microcopy, flagged: the deck has no validation strings. */
function validate(brief: CampaignBrief, field: Field): string | null {
  switch (field) {
    case "product_name":
      return brief.product_name.trim() ? null : "Add a product or company name.";
    case "product_url":
      if (!brief.product_url.trim()) return "Add your website.";
      return /\.[a-z]{2,}/i.test(brief.product_url)
        ? null
        : "That does not look like a URL. Try apple.com.";
    case "offer_summary":
      return brief.offer_summary.trim()
        ? null
        : "Describe what you are offering in one sentence.";
    case "target_audience":
      return brief.target_audience.trim() ? null : "Describe who this is for.";
    case "campaign_goal":
      return brief.campaign_goal ? null : "Pick what this campaign should do.";
    case "maximum_spend_usd":
      if (brief.maximum_spend_usd === null) return "Set a maximum spend.";
      return brief.maximum_spend_usd > 0 ? null : "Enter an amount above zero.";
    case "publication_window_start":
      return brief.publication_window_start ? null : "Pick a start date.";
    case "publication_window_end":
      if (!brief.publication_window_end) return "Pick an end date.";
      return brief.publication_window_end >= brief.publication_window_start
        ? null
        : "The end date is before the start date.";
  }
}

const ALL_FIELDS: Field[] = [
  "product_name",
  "product_url",
  "offer_summary",
  "target_audience",
  "campaign_goal",
  "maximum_spend_usd",
  "publication_window_start",
  "publication_window_end",
];

function PrefillTag() {
  return (
    <MonoValue size="eyebrow" tone="muted" className="ml-2">
      from your site
    </MonoValue>
  );
}

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-body-sm text-red-bright">
      {message}
    </p>
  );
}

export function IntakeStageB({
  initial,
  prefilled,
}: {
  initial: Partial<CampaignBrief>;
  prefilled: Field[];
}) {
  const router = useRouter();
  const [brief, setBrief] = useState<CampaignBrief>({ ...EMPTY, ...initial });
  const [tags, setTags] = useState<Set<Field>>(new Set(prefilled));
  const [errors, setErrors] = useState<Partial<Record<Field, string | null>>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends Field>(field: K, value: CampaignBrief[K]) {
    setBrief((b) => ({ ...b, [field]: value }));
    // The tag is a claim about provenance, so editing clears it.
    if (tags.has(field)) {
      const next = new Set(tags);
      next.delete(field);
      setTags(next);
    }
  }

  function blur(field: Field) {
    setErrors((e) => ({ ...e, [field]: validate(brief, field) }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<Field, string | null>> = {};
    let firstBad: Field | null = null;
    for (const f of ALL_FIELDS) {
      const message = validate(brief, f);
      next[f] = message;
      if (message && !firstBad) firstBad = f;
    }
    setErrors(next);
    if (firstBad) {
      document.getElementById(firstBad)?.focus();
      return;
    }
    setSubmitting(true);
    const campaign = await createCampaign(brief, [...tags]);
    router.push(`/app/campaigns/${campaign.id}/research`);
  }

  const help = (field: Field) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="ct-display text-headline text-slate-100">Your campaign brief</h1>
      <p className="mt-3 text-body-lg text-slate-300">
        Seven fields. We filled in what we could find.
      </p>

      <div className="mt-8 grid max-w-2xl gap-6">
        <div>
          <Label htmlFor="product_name">
            Product or company name
            {tags.has("product_name") && <PrefillTag />}
          </Label>
          <Input
            id="product_name"
            className="mt-2"
            value={brief.product_name}
            onChange={(e) => set("product_name", e.target.value)}
            onBlur={() => blur("product_name")}
            aria-invalid={Boolean(errors.product_name)}
            aria-describedby={help("product_name")}
          />
          <FieldError id="product_name-error" message={errors.product_name ?? null} />
        </div>

        <div>
          <Label htmlFor="product_url">
            Website
            {tags.has("product_url") && <PrefillTag />}
          </Label>
          <Input
            id="product_url"
            className="ct-num mt-2"
            inputMode="url"
            value={brief.product_url}
            onChange={(e) => set("product_url", e.target.value)}
            onBlur={() => blur("product_url")}
            aria-invalid={Boolean(errors.product_url)}
            aria-describedby={help("product_url")}
          />
          <FieldError id="product_url-error" message={errors.product_url ?? null} />
        </div>

        <div>
          <Label htmlFor="offer_summary">
            What are you offering?
            {tags.has("offer_summary") && <PrefillTag />}
          </Label>
          <Textarea
            id="offer_summary"
            className="mt-2 min-h-[88px]"
            value={brief.offer_summary}
            onChange={(e) => set("offer_summary", e.target.value)}
            onBlur={() => blur("offer_summary")}
            aria-invalid={Boolean(errors.offer_summary)}
            aria-describedby={errors.offer_summary ? "offer_summary-error" : "offer_summary-help"}
          />
          <p id="offer_summary-help" className="mt-1.5 text-body-sm text-slate-400">
            One sentence. The audience match is built from this.
          </p>
          <FieldError id="offer_summary-error" message={errors.offer_summary ?? null} />
        </div>

        <div>
          <Label htmlFor="target_audience">
            Who is it for?
            {tags.has("target_audience") && <PrefillTag />}
          </Label>
          <Textarea
            id="target_audience"
            className="mt-2 min-h-[88px]"
            value={brief.target_audience}
            onChange={(e) => set("target_audience", e.target.value)}
            onBlur={() => blur("target_audience")}
            aria-invalid={Boolean(errors.target_audience)}
            aria-describedby={
              errors.target_audience ? "target_audience-error" : "target_audience-help"
            }
          />
          <p id="target_audience-help" className="mt-1.5 text-body-sm text-slate-400">
            Plain language beats a demographic table.
          </p>
          <FieldError id="target_audience-error" message={errors.target_audience ?? null} />
        </div>

        <div>
          <Label htmlFor="campaign_goal">What should this campaign do?</Label>
          <Select
            id="campaign_goal"
            className="mt-2"
            value={brief.campaign_goal}
            onChange={(e) => set("campaign_goal", e.target.value as CampaignBrief["campaign_goal"])}
            onBlur={() => blur("campaign_goal")}
            aria-invalid={Boolean(errors.campaign_goal)}
            aria-describedby={help("campaign_goal")}
          >
            <option value="" disabled>
              Select a goal
            </option>
            {CAMPAIGN_GOALS.map((goal) => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </Select>
          <FieldError id="campaign_goal-error" message={errors.campaign_goal ?? null} />
        </div>

        <div>
          <Label htmlFor="maximum_spend_usd">Maximum spend</Label>
          <Input
            id="maximum_spend_usd"
            className="ct-num mt-2"
            inputMode="numeric"
            value={brief.maximum_spend_usd ?? ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              set("maximum_spend_usd", raw ? Number(raw) : null);
            }}
            onBlur={() => blur("maximum_spend_usd")}
            aria-invalid={Boolean(errors.maximum_spend_usd)}
            aria-describedby={
              errors.maximum_spend_usd ? "maximum_spend_usd-error" : "maximum_spend_usd-help"
            }
          />
          <p id="maximum_spend_usd-help" className="mt-1.5 text-body-sm text-slate-400">
            Catalyst plans against this. It never spends it.
          </p>
          <FieldError id="maximum_spend_usd-error" message={errors.maximum_spend_usd ?? null} />
        </div>

        <fieldset className="min-w-0">
          <legend className="text-body font-medium text-slate-200">Campaign dates</legend>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="publication_window_start" className="ct-eyebrow">
                Start
              </Label>
              <Input
                id="publication_window_start"
                type="date"
                className="ct-num mt-1.5"
                value={brief.publication_window_start}
                onChange={(e) => set("publication_window_start", e.target.value)}
                onBlur={() => blur("publication_window_start")}
                aria-invalid={Boolean(errors.publication_window_start)}
              />
              <FieldError
                id="publication_window_start-error"
                message={errors.publication_window_start ?? null}
              />
            </div>
            <div>
              <Label htmlFor="publication_window_end" className="ct-eyebrow">
                End
              </Label>
              <Input
                id="publication_window_end"
                type="date"
                className="ct-num mt-1.5"
                value={brief.publication_window_end}
                onChange={(e) => set("publication_window_end", e.target.value)}
                onBlur={() => blur("publication_window_end")}
                aria-invalid={Boolean(errors.publication_window_end)}
              />
              <FieldError
                id="publication_window_end-error"
                message={errors.publication_window_end ?? null}
              />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Button type="submit" disabled={submitting}>
          Find my channels
        </Button>
        <p className="text-body-sm text-slate-400">
          Nothing goes live until you approve the final campaign.
        </p>
      </div>
    </form>
  );
}
