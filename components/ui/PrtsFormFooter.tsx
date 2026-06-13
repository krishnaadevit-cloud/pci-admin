"use client";

import { Button } from "primereact/button";
import { ReactNode } from "react";

interface PrtsFormFooterProps {
  onBack?: () => void;
  onContinue?: () => void;
  onReset?: () => void;
  backLabel?: string;
  continueLabel?: string;
  showReset?: boolean;
  extraActions?: ReactNode;
  continueDisabled?: boolean;
}

export default function PrtsFormFooter({
  onBack,
  onContinue,
  onReset,
  backLabel = "Back",
  continueLabel = "Continue",
  showReset = false,
  extraActions,
  continueDisabled = false,
}: PrtsFormFooterProps) {
  return (
    <div className="prts-form-footer">
      {showReset && onReset ? (
        <button type="button" className="prts-form-footer__reset" onClick={onReset}>
          Reset all
        </button>
      ) : (
        <span />
      )}
      <div className="prts-form-footer__actions">
        {extraActions}
        {onBack && (
          <Button
            type="button"
            label={backLabel}
            outlined
            className="prts-btn prts-btn--outline"
            onClick={onBack}
          />
        )}
        {onContinue && (
          <Button
            type="button"
            label={continueLabel}
            className="prts-btn prts-btn--primary"
            onClick={onContinue}
            disabled={continueDisabled}
          />
        )}
      </div>
    </div>
  );
}
