"use client";

interface FeeItem {
  label: string;
  value: number;
}

interface PaymentConfirmDialogProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  feeStructure?: FeeItem[];
  total?: number;
  loading?: boolean;
}

export default function PaymentConfirmDialog({
  visible,
  onHide,
  onConfirm,
  feeStructure = [],
  total = 0,
  loading = false,
}: PaymentConfirmDialogProps) {
  if (!visible) return null;

  const formattedTotal = total.toLocaleString("en-IN");

  return (
    <div
      className="prts-payment-dialog-overlay"
      role="presentation"
      onClick={onHide}
      onKeyDown={(e) => e.key === "Escape" && onHide()}
    >
      <div
        className="prts-payment-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="prts-payment-dialog__content">
          <button
            type="button"
            className="prts-payment-dialog__close"
            onClick={onHide}
            aria-label="Close"
          >
            ×
          </button>
          <div className="prts-payment-dialog__icon" aria-hidden>
            ?
          </div>
          <h2 id="payment-dialog-title" className="prts-payment-dialog__title">
            Are you sure to Proceed to Payment?
          </h2>
          <p className="prts-payment-dialog__disclaimer">
            <strong>Disclaimer:</strong> The documents uploaded above are hereby
            treated as final and complete. No further modifications,
            corrections, or edits shall be permitted after submission. The
            payment process will be initiated and processed based on the
            documents submitted.
          </p>

          {feeStructure.length > 0 && (
            <div className="prts-payment-dialog__fee-list">
              {feeStructure.map((item, i) => (
                <div key={i} className="prts-payment-dialog__fee-row">
                  <span className="prts-payment-dialog__fee-label">{item.label}</span>
                  <span className="prts-payment-dialog__fee-value">
                    ₹ {item.value.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              <div className="prts-payment-dialog__fee-row prts-payment-dialog__fee-row--total">
                <span className="prts-payment-dialog__fee-label">Total</span>
                <span className="prts-payment-dialog__fee-value">₹ {formattedTotal}</span>
              </div>
            </div>
          )}

          <div className="prts-payment-dialog__actions">
            <button
              type="button"
              className="prts-btn prts-btn--outline"
              onClick={onHide}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`prts-btn prts-btn--primary${loading ? " prts-btn--disabled" : ""}`}
              disabled={loading}
              onClick={onConfirm}
            >
              {loading ? "Processing..." : `Continue to Payment | ₹ ${formattedTotal}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
