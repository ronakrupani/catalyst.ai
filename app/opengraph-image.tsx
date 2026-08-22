import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { demoRun } from "@/lib/demo-run";
import { runSummary } from "@/lib/replay";
import { formatCpmRange, formatDuration } from "@/lib/format";

export const alt =
  "catalyst.ai — a pipeline run rendered as a waterfall rail, violet Stage 1 then amber Stage 2";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK_050 = "#0a0c12";
const INK_100 = "#10131b";
const INK_300 = "#1d222e";
const INK_500 = "#333a4b";
const SLATE_100 = "#edf0f7";
const SLATE_400 = "#6e7789";
const VIOLET = "#b14cff";
const SODIUM = "#ff9f1c";
const RED = "#ff4d64";
const SLATE_500 = "#4b5364";

/** The card is the rail, not a stock image. */
export default async function OpengraphImage() {
  const [archivo, mono] = await Promise.all([
    readFile(join(process.cwd(), "assets/og-fonts/Archivo-Bold.ttf")),
    readFile(join(process.cwd(), "assets/og-fonts/JetBrainsMono-Medium.ttf")),
  ]);

  const summary = runSummary(demoRun);
  const railWidth = 1080;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK_050,
          padding: 60,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Mono",
              fontSize: 20,
              letterSpacing: 2,
              color: SLATE_400,
              textTransform: "uppercase",
            }}
          >
            catalyst.ai
          </div>
          <div
            style={{
              fontFamily: "Archivo",
              fontSize: 68,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: SLATE_100,
              marginTop: 18,
              maxWidth: 900,
            }}
          >
            Find where your audience actually is
          </div>
        </div>

        {/* The waterfall rail. Violet where Stage 1 thinks, amber where
            Stage 2 scrapes; the failed span keeps its full width. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: railWidth,
              height: 56,
              background: INK_100,
              border: `1px solid ${INK_300}`,
              borderRadius: 8,
            }}
          >
            {demoRun.spans.map((span) => {
              const left = (span.startMs / demoRun.totalDurationMs) * railWidth;
              const w = Math.max(
                3,
                (span.durationMs / demoRun.totalDurationMs) * railWidth - 2,
              );
              const fill =
                span.status === "failed"
                  ? RED
                  : span.status === "cached"
                    ? SLATE_500
                    : span.stage === 1
                      ? VIOLET
                      : SODIUM;
              return (
                <div
                  key={span.id}
                  style={{
                    position: "absolute",
                    left,
                    top: 24,
                    width: w,
                    height: 8,
                    borderRadius: 4,
                    background: fill,
                    opacity: 0.9,
                    border:
                      span.status === "cached" ? `1px dashed ${INK_500}` : "none",
                  }}
                />
              );
            })}
          </div>

          <div
            style={{
              fontFamily: "Mono",
              fontSize: 26,
              color: SLATE_100,
              marginTop: 28,
              display: "flex",
            }}
          >
            {summary.placementCount} placements · {formatCpmRange(summary.cpmLow, summary.cpmHigh)} CPM
            {" · "}
            {summary.platformsSearched} platforms · {formatDuration(summary.totalDurationMs)}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: archivo, style: "normal", weight: 700 },
        { name: "Mono", data: mono, style: "normal", weight: 500 },
      ],
    },
  );
}
