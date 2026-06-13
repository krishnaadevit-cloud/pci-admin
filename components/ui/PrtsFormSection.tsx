"use client";

import { ReactNode, useState } from "react";

interface PrtsFormSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
}

export default function PrtsFormSection({
  title,
  children,
  defaultOpen = true,
  action,
}: PrtsFormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`prts-form-section ${open ? "prts-form-section--open" : ""}`}>
      <div className="prts-form-section__header">
        <button
          type="button"
          className="prts-form-section__toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <span className="prts-form-section__icon">
            <i className={`pi ${open ? "pi-chevron-up" : "pi-chevron-down"}`} />
          </span>
          <span className="prts-form-section__title">{title}</span>
        </button>
        {action && <div className="prts-form-section__action">{action}</div>}
      </div>
      {open && <div className="prts-form-section__body">{children}</div>}
    </div>
  );
}
