import type { ConnectionStatus } from "./types";

/**
 * The strip above the footer. There is no /api/health in this repo — the
 * marketing site is fully static — so these render as operational with the
 * last recorded call latency. Wire the strip to a health endpoint in the app
 * and these become live values; the component takes the same shape either way.
 */
export const CONNECTIONS: ConnectionStatus[] = [
  { name: "Bright Data", lastCallMs: 1740, operational: true },
  { name: "Port", lastCallMs: 96, operational: true },
  { name: "SigNoz", lastCallMs: 42, operational: true },
];
