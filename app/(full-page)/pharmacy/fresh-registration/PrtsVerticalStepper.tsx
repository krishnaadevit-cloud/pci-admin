"use client";

import PrtsKycAccordian from "./forms/prtsKycAccordian";


export interface RegistrationStep {
  id: number;
  label: string;
}

interface PrtsVerticalStepperProps {
  steps: RegistrationStep[];
  activeStep: number;
  completedSteps: number[];
  onStepClick?: (stepId: number) => void;
  title?: string;
}

export default function PrtsVerticalStepper({
  steps,
  activeStep,
  completedSteps,
  onStepClick,
  title = "Fresh Registration",
}: PrtsVerticalStepperProps) {
  return (
    <PrtsKycAccordian
      title={title}
      accordionClassName="prts-kyc-accordion prts-kyc-accordion--stepper"
    >
      <div className="prts-vertical-stepper">
        <ol className="prts-vertical-stepper__list">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = activeStep === step.id;
            const isLast = index === steps.length - 1;
            const lineState = isCompleted ? "completed" : isActive ? "active" : "pending";

            const content = (
              <>
                <div className="prts-vertical-stepper__indicator-col">
                  <div
                    className={`prts-vertical-stepper__circle ${
                      isCompleted
                        ? "prts-vertical-stepper__circle--completed"
                        : isActive
                          ? "prts-vertical-stepper__circle--active"
                          : "prts-vertical-stepper__circle--pending"
                    }`}
                  >
                    {isCompleted ? <i className="pi pi-check" /> : step.id}
                  </div>
                  {!isLast && (
                    <div
                      className={`prts-vertical-stepper__line prts-vertical-stepper__line--${lineState}`}
                    />
                  )}
                </div>
                <span
                  className={`prts-vertical-stepper__label ${
                    isActive ? "prts-vertical-stepper__label--active" : ""
                  }`}
                >
                  {step.label}
                </span>
              </>
            );

            return (
              <li
                key={step.id}
                className={`prts-vertical-stepper__item prts-vertical-stepper__item--${lineState}`}
              >
                {onStepClick ? (
                  <button
                    type="button"
                    className="prts-vertical-stepper__button"
                    onClick={() => onStepClick(step.id)}
                    aria-current={isActive ? "step" : undefined}
                    aria-label={`Go to ${step.label}`}
                  >
                    {content}
                  </button>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </PrtsKycAccordian>
  );
}