"use client";

import { Accordion, AccordionTab } from "primereact/accordion";
import { ReactNode } from "react";

interface PrtsRegistrationAccordionSectionProps {
  title: string;
  children: ReactNode;
  accordionClassName?: string;
  sectionClassName?: string;
  headerExtra?: ReactNode;
  defaultActive?: boolean;
}

export default function PrtsRegistrationAccordionSection({
  title,
  children,
  accordionClassName = "prts-personal-accordion",
  sectionClassName = "prts-personal-section",
  headerExtra,
  defaultActive = true,
}: PrtsRegistrationAccordionSectionProps) {
  return (
    <Accordion
      className={accordionClassName}
      activeIndex={defaultActive ? 0 : null}
      expandIcon={<i className="pi pi-chevron-down prts-personal-accordion__chevron" />}
      collapseIcon={<i className="pi pi-chevron-up prts-personal-accordion__chevron" />}
    >
      <AccordionTab
        header={
          <div className="prts-personal-accordion__header">
            <span className="prts-personal-accordion__title">{title}</span>
            {headerExtra ? (
              <div className="prts-personal-accordion__actions">{headerExtra}</div>
            ) : null}
          </div>
        }
        pt={{ headerAction: { onClick: (e) => e.preventDefault() } }}
      >
        <div className={sectionClassName}>{children}</div>
      </AccordionTab>
    </Accordion>
  );
}
