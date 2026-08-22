"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";

/**
 * Scroll layer for the acts in Part 9.
 *
 * Contract:
 * - Progress is a pure function of scroll position. Scrolling up rewinds
 *   exactly; there are no half-states and no timers.
 * - Pinning is `position: sticky` only. Nothing here touches the wheel event,
 *   scroll distance per tick, or scroll behavior, so trackpad, keyboard,
 *   spacebar and scrollbar drag all stay native.
 * - The continuous value is written to a CSS custom property and consumed by
 *   transform/opacity in CSS. React state is reserved for discrete steps
 *   (which span is live, how many placements have landed), so a 220vh act
 *   re-renders on the order of a dozen times rather than once per frame.
 * - The property defaults to 1 in CSS. With JavaScript off or before
 *   hydration every act therefore renders in its finished state; the layout
 *   effect below writes the real value before first paint.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Layout effect on the client so the first real progress value is written
 * before paint; plain effect during the server render pass to avoid React's
 * useLayoutEffect-on-server warning.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ActProgressOptions {
  /**
   * Called with progress 0..1 whenever it changes. Derive discrete state here
   * and only call setState when the derived value actually changes.
   */
  onProgress?: (progress: number) => void;
  /** CSS custom property to write. Defaults to `--p`. */
  property?: string;
}

/**
 * Maps a pinned section's scroll travel onto 0..1.
 *
 * `pinRef` is the tall outer container (the one with the extra viewport
 * heights). Progress reaches 0 when its top edge meets the top of the
 * viewport and 1 when its bottom edge does.
 */
export function useActProgress(
  pinRef: React.RefObject<HTMLElement | null>,
  options: ActProgressOptions = {},
) {
  const { onProgress, property = "--p" } = options;
  const reduced = usePrefersReducedMotion();

  // Kept in a ref so a caller passing an inline closure does not tear down and
  // reinstall the scroll listener on every render. Synced in a layout effect
  // rather than during render, which React forbids.
  const onProgressRef = useRef(onProgress);
  useIsomorphicLayoutEffect(() => {
    onProgressRef.current = onProgress;
  });

  const lastWritten = useRef<number>(-1);

  const write = useCallback(
    (element: HTMLElement, progress: number) => {
      // Quantise to 1/1000 so a sub-pixel scroll does not thrash style recalc.
      const q = Math.round(progress * 1000) / 1000;
      if (q === lastWritten.current) return;
      lastWritten.current = q;
      element.style.setProperty(property, String(q));
      onProgressRef.current?.(q);
    },
    [property],
  );

  useIsomorphicLayoutEffect(() => {
    const element = pinRef.current;
    if (!element) return;

    if (reduced) {
      // Pins collapse and every act renders resolved. Nothing to listen to.
      element.style.setProperty(property, "1");
      onProgressRef.current?.(1);
      return;
    }

    let frame = 0;
    let visible = false;

    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress =
        travel <= 0 ? 1 : clamp01(-rect.top / travel);
      write(element, progress);
    };

    const schedule = () => {
      if (frame || !visible) return;
      frame = requestAnimationFrame(measure);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        // will-change only while the act is on screen (Part 9 technical rules).
        element.style.willChange = visible ? "transform" : "";
        if (visible) schedule();
      },
      { rootMargin: "100px 0px" },
    );
    observer.observe(element);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    // Before first paint: honour the browser's restored scroll position, so a
    // deep link or a back navigation lands with the correct run state.
    visible = true;
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      element.style.willChange = "";
    };
  }, [pinRef, property, reduced, write]);
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Maps `value` from [inMin, inMax] onto [0, 1], clamped. */
export function range(value: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return value >= inMax ? 1 : 0;
  return clamp01((value - inMin) / (inMax - inMin));
}
