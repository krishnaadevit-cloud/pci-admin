"use client";

interface EducationDetailsFooterProps {
  onReset: () => void;
  onBack: () => void;
  onContinue: () => void;
  isLoading?: boolean;
}

export default function EducationDetailsFooter({
  onReset,
  onBack,
  onContinue,
  isLoading = false,
}: EducationDetailsFooterProps) {
  return (
    <div className="prts-form-footer">
      <button
        type="button"
        className="prts-form-footer__reset"
        onClick={onReset}
        disabled={isLoading}
      >
        Reset all
      </button>
      <div className="prts-form-footer__actions">
        <button
          type="button"
          className="prts-btn prts-btn--outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </button>
        <button
          type="button"
          className="prts-btn prts-btn--primary"
          onClick={onContinue}
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Continue to Communication"}
        </button>
      </div>
    </div>
  );
}
