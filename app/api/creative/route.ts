import { NextResponse } from "next/server";

/**
 * Creative generation. The only server-side call in the product.
 *
 * The key is read from the environment here and never reaches the client, so
 * it cannot end up in the bundle. When it is absent, or the call fails, this
 * returns 503 and the caller falls back to a shipped asset — the demo still
 * runs with no key and no network.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Generation runs around fifteen seconds; the platform default is shorter. */
export const maxDuration = 60;

const WIDTH = 1536;
const HEIGHT = 1024;

interface Body {
  productName?: string;
  offerSummary?: string;
  targetAudience?: string;
  campaignGoal?: string;
  channel?: string;
}

function buildPrompt(b: Body): string {
  return [
    "Design a polished digital advertising creative for a paid media placement.",
    "",
    `Brand: ${b.productName ?? "the advertiser"}.`,
    b.offerSummary ? `Offer: ${b.offerSummary}` : "",
    b.targetAudience ? `Audience: ${b.targetAudience}` : "",
    b.campaignGoal ? `Campaign goal: ${b.campaignGoal}.` : "",
    b.channel ? `Placement: ${b.channel}, ${WIDTH} by ${HEIGHT} pixels.` : "",
    "",
    "Art direction: premium editorial photography, one strong focal subject,",
    "deliberate negative space on one side where a headline would sit, high",
    "contrast, cinematic lighting, contemporary colour grade.",
    "",
    // Generated lettering reads as garbled, and rendering a real mark would be
    // reproducing someone's trademark. Both are avoided at the prompt.
    "Do not render any logos, wordmarks, brand marks, or legible text.",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "No image key configured. Using the shipped asset instead." },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: buildPrompt(body),
        size: `${WIDTH}x${HEIGHT}`,
        quality: process.env.OPENAI_IMAGE_QUALITY ?? "low",
        n: 1,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("creative generation failed", response.status, detail.slice(0, 400));
      return NextResponse.json(
        { error: `Image service returned ${response.status}.` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as { data?: { b64_json?: string }[] };
    const b64 = payload.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "Image service returned no image." }, { status: 502 });
    }

    return NextResponse.json({
      assetUrl: `data:image/png;base64,${b64}`,
      w: WIDTH,
      h: HEIGHT,
    });
  } catch (error) {
    console.error("creative generation error", error);
    return NextResponse.json({ error: "Could not reach the image service." }, { status: 502 });
  }
}
