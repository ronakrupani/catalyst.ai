import { STEPS } from "@/lib/campaign";
import type { MatchedChannel } from "@/lib/campaign";

export interface PipelineStepperProps {
  /** 0 intake, 1 research, 2 creative, 3 review. 4 means every step is done. */
  currentStep: number;
  /**
   * Research sub-spans. When the research segment is current these render
   * inside it, so the segment subdivides while it runs.
   */
  researchSpans?: { label: string; done: boolean }[];
  /** A step whose work partly failed keeps its segment visible, hatched. */
  failedStep?: number;
  className?: string;
}

const LABELS: Record<(typeof STEPS)[number], string> = {
  intake: "Intake",
  research: "Research",
  creative: "Creative",
  review: "Review",
};

/**
 * Four-segment progress device, in the waterfall rail's visual language.
 * Segments are equal width rather than duration-scaled, because the four
 * steps are stages of work, not spans of time. The research segment
 * subdivides into real spans while it runs.
 */
export function PipelineStepper({
  currentStep,
  researchSpans,
  failedStep,
  className = "",
}: PipelineStepperProps) {
  return (
    <div className={`ct-stepper ${className}`} role="group" aria-label="Campaign progress">
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const current = i === currentStep;
        const failed = i === failedStep;
        const subdivided = current && step === "research" && researchSpans?.length;

        return (
          <div
            key={step}
            className="ct-stepper__seg"
            data-state={failed ? "failed" : done ? "done" : current ? "current" : "future"}
          >
            <span className="ct-stepper__label ct-eyebrow">{LABELS[step]}</span>
            <span className="ct-stepper__bar">
              {subdivided ? (
                <span className="ct-stepper__spans">
                  {researchSpans!.map((span) => (
                    <span
                      key={span.label}
                      className="ct-stepper__span"
                      data-done={span.done || undefined}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
      <span className="sr-only">
        {`Step ${Math.min(currentStep + 1, STEPS.length)} of ${STEPS.length}`}
      </span>
    </div>
  );
}

/** Compact 24px rail for list rows: four segments, no labels. */
export function StepperRow({
  currentStep,
  className = "",
}: {
  currentStep: number;
  className?: string;
}) {
  return (
    <span className={`ct-steprow ${className}`} aria-hidden="true">
      {STEPS.map((step, i) => (
        <span
          key={step}
          className="ct-steprow__seg"
          data-state={i < currentStep ? "done" : i === currentStep ? "current" : "future"}
        />
      ))}
    </span>
  );
}

export type { MatchedChannel };
