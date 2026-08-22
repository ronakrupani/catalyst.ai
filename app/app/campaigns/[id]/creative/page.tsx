"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MonoValue } from "@/components/primitives/MonoValue";
import { AdUnitFrame } from "@/components/primitives/AdUnitFrame";
import { CampaignHeader } from "@/components/dashboard/CampaignHeader";
import { useCampaign } from "@/components/dashboard/CampaignProvider";
import { advance, attachCreative, generateCreative, previewUnitFor } from "@/lib/api";
import { topChannel, type Creative } from "@/lib/campaign";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CreativePage() {
  const { campaign } = useCampaign();
  const router = useRouter();
  const top = topChannel(campaign) ?? "your best-scoring channel";
  const unit = previewUnitFor(campaign);

  const [dragging, setDragging] = useState(false);
  const [upload, setUpload] = useState<{ name: string; size: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Creative | null>(null);
  const [failed, setFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function generate() {
    setGenerating(true);
    setFailed(false);
    try {
      const creative = await generateCreative(campaign.id);
      if (!creative) throw new Error("no creative");
      setGenerated(creative);
    } catch {
      setFailed(true);
    } finally {
      setGenerating(false);
    }
  }

  function takeFile(file: File | undefined) {
    if (!file) return;
    setUpload({ name: file.name, size: file.size });
  }

  function accept(creative: Creative) {
    attachCreative(campaign.id, creative);
  }

  const attached = campaign.creative;

  function next() {
    advance(campaign.id, "READY_FOR_REVIEW");
    router.push(`/app/campaigns/${campaign.id}/review`);
  }

  return (
    <>
      <CampaignHeader campaign={campaign} />

      <div className="mx-auto max-w-[1120px] px-8 py-10">
        <h1 className="ct-display text-headline text-slate-100">Add your ad</h1>
        <p className="mt-3 text-body-lg text-slate-300">
          Upload what you have, or have Catalyst make one.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* ---- Upload ---- */}
          <section className="ct-elev-2 rounded-md p-5">
            <h2 className="text-body font-medium text-slate-100">Upload an asset</h2>
            <p className="mt-1 text-body-sm text-slate-300">
              Any format. We link it to the campaign as is.
            </p>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                takeFile(e.dataTransfer.files?.[0]);
              }}
              className={`mt-4 flex min-h-[168px] flex-col items-center justify-center rounded-sm border border-dashed px-4 py-6 text-center transition-colors duration-[120ms] ease-ct ${
                dragging ? "border-violet-dim bg-violet-wash" : "border-ink-500"
              }`}
            >
              {upload ? (
                <div>
                  <MonoValue size="body-sm" tone="secondary" className="block break-all">
                    {upload.name}
                  </MonoValue>
                  <MonoValue size="body-sm" tone="muted" className="mt-1 block">
                    {formatBytes(upload.size)}
                  </MonoValue>
                </div>
              ) : (
                <p className="text-body text-slate-400">Drop a file, or browse</p>
              )}

              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                onChange={(e) => takeFile(e.target.files?.[0])}
              />
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => fileRef.current?.click()}
              >
                Browse
              </Button>
            </div>

            {upload && (
              <Button
                className="mt-4"
                variant="secondary"
                onClick={() =>
                  accept({
                    kind: "upload",
                    filename: upload.name,
                    sizeBytes: upload.size,
                    format: upload.name.toLowerCase().endsWith(".gif") ? "GIF" : "PNG",
                    adUnit: unit,
                  })
                }
              >
                Use this
              </Button>
            )}
          </section>

          {/* ---- Generate ---- */}
          <section className="ct-elev-2 rounded-md p-5">
            <h2 className="text-body font-medium text-slate-100">Catalyze one</h2>
            <p className="mt-1 text-body-sm text-slate-300">
              We generate a PNG briefed against {top}, your best-scoring channel.
            </p>

            <div className="mt-4">
              {generating ? (
                <AdUnitFrame unit={unit} loading label="" maxEdge={440} />
              ) : generated ? (
                <AdUnitFrame
                  unit={generated.adUnit}
                  src={generated.assetUrl}
                  alt={`Generated ad for ${campaign.brief.product_name}, briefed against ${top}`}
                  label={`${campaign.brief.product_name} · ${top}`}
                  maxEdge={440}
                />
              ) : (
                <AdUnitFrame unit={unit} label="" maxEdge={440} />
              )}
            </div>

            {generating && (
              <p className="mt-3 text-body text-slate-300">Building your ad</p>
            )}

            {failed && (
              <p className="mt-3 text-body text-red-bright">
                Creative generation failed. Upload an asset instead, or try again.
              </p>
            )}

            <p className="mt-3 text-body-sm text-slate-400">PNG and GIF only for now.</p>

            <div className="mt-4 flex gap-3">
              {generated ? (
                <>
                  <Button variant="secondary" onClick={generate} disabled={generating}>
                    Regenerate
                  </Button>
                  <Button onClick={() => accept(generated)}>Use this</Button>
                </>
              ) : (
                <Button onClick={generate} disabled={generating}>
                  {generating ? "Building your ad" : "Catalyze one"}
                </Button>
              )}
            </div>
          </section>
        </div>

        {attached && (
          <div className="mt-8 flex items-center gap-4 rounded-md border border-border-strong bg-ink-200 px-5 py-4">
            <span className="text-body text-slate-200">Attached</span>
            <MonoValue size="body-sm" tone="muted" className="min-w-0 flex-1 truncate">
              {attached.filename}
            </MonoValue>
            <Button onClick={next}>Review campaign</Button>
          </div>
        )}
      </div>
    </>
  );
}
