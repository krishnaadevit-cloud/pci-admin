"use client";

import { Accordion, AccordionTab } from "primereact/accordion";
import { ReactNode, useEffect, useState } from "react";

interface PrtsRegistrationAccordionSectionProps {
  title: string;
  children: ReactNode;
  accordionClassName?: string;
  sectionClassName?: string;
  headerExtra?: ReactNode;
  defaultActive?: boolean;
}

export default function PrtsKycAccordian({
  title,
  children,
  accordionClassName = "prts-kyc-accordion",
  sectionClassName = "prts-kyc-section",
  headerExtra,
  defaultActive = true,
}: PrtsRegistrationAccordionSectionProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Desktop → no accordion
  if (!isMobile) {
    return (
      <div className={accordionClassName}>
        <div className="prts-kyc-accordion__header"  >
          <span className="prts-kyc-accordion__title">{title}</span>

          {headerExtra ? (
            <div className="prts-kyc-accordion__actions">
              {headerExtra}
            </div>
          ) : null}
        </div>

        <div className={sectionClassName}>{children}</div>
      </div>
    );
  }

  // Mobile → accordion
  return (
    <Accordion
      className={accordionClassName}
      activeIndex={defaultActive ? 0 : null}
      expandIcon={
        <i className="pi pi-chevron-down prts-kyc-accordion__chevron" />
      }
      collapseIcon={
        <i className="pi pi-chevron-up prts-kyc-accordion__chevron" />
      }
    >
      <AccordionTab
        header={
          <div className="prts-kyc-accordion__header_mobile">
            <span className="prts-kyc-accordion__title">{title}</span>

            {headerExtra ? (
              <div className="prts-kyc-accordion__actions">
                {headerExtra}
              </div>
            ) : null}
          </div>
        }
      >
        <div className={sectionClassName}>{children}</div>
      </AccordionTab>
    </Accordion>
  );
}