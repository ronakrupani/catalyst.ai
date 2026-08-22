import raw from "@/fixtures/demo-run.json";
import type { DemoRun } from "./types";

/**
 * One complete recorded run. JSON widens the literal unions on the way in
 * (stage `1 | 2`, span status, the format union), so the shape is asserted
 * here once rather than at every call site.
 */
export const demoRun = raw as unknown as DemoRun;
