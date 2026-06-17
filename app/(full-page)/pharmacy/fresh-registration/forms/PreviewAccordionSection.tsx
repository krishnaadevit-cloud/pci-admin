"use client";

import { Accordion, AccordionTab } from "primereact/accordion";
import { ReactNode } from "react";

interface PreviewAccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultActive?: boolean;
}

export default function PreviewAccordionSection({
  title,
  children,
  defaultActive = true,
}: PreviewAccordionSectionProps) {
  return (
    <Accordion
      className="prts-preview-subsection-accordion"
      activeIndex={defaultActive ? 0 : null}
      expandIcon={<i className="pi pi-chevron-down prts-preview-sub-accordion__chevron" />}
      collapseIcon={<i className="pi pi-chevron-up prts-preview-sub-accordion__chevron" />}
    >
      <AccordionTab
        header={
          <div className="prts-preview-sub-accordion__header">
            <span className="prts-preview-sub-accordion__title">{title}</span>
          </div>
        }
        pt={{ headerAction: { onClick: (e) => e.preventDefault() } }}
      >
        <div className="prts-preview-sub-accordion__body">{children}</div>
      </AccordionTab>
    </Accordion>
  );
}