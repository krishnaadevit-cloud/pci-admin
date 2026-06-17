"use client";

interface CommunicationDetailsFooterProps {
  onReset: () => void;
  onBack: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
}

export default function CommunicationDetailsFooter({
  onReset,
  onBack,
  onContinue,
  continueDisabled = false,
}: CommunicationDetailsFooterProps) {
  return (
    <div className="prts-form-footer">
      <button type="button" className="prts-form-footer__reset" onClick={onReset}>
        Reset all
      </button>
      <div className="prts-form-footer__actions">
        <button type="button" className="prts-btn prts-btn--outline" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="prts-btn prts-btn--primary"
          onClick={onContinue}
          disabled={continueDisabled}
        >
          Continue to Documents
        </button>
      </div>
    </div>
  );
}
