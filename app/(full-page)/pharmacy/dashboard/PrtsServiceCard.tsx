"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string | React.ReactNode;  
  compact?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
}

export default function PrtsServiceCard({
  title,
  description,
  icon,
  disabled = false,
  compact = false,
  href,
  onClick,
}: ServiceCardProps) {
  const cardClassName =
    `prts-service-card ${disabled ? "prts-service-card--disabled" : ""} ${compact ? "prts-service-card--compact" : ""}`.trim();
 
  const renderIcon = () => {
    if (!icon) return null;

    
    if (React.isValidElement(icon)) {
      return icon;
    }

    
    if (
      typeof icon === "string" &&
      (icon.startsWith("/") || icon.includes("."))
    ) {
      return (
        <Image
          src={icon}
          alt={`${title} icon`}
          width={28}
          height={28}
          style={{ objectFit: "contain" }}
        />
      );
    }
 
    return <i className={icon as string} />;
  };

  const content = (
    <>
      <div className="prts-service-card__icon">{renderIcon()}</div>
      <h3 className="prts-service-card__title">{title}</h3>
      <p className="prts-service-card__desc">{description}</p>
    </>
  );

  if (disabled) {
    return (
      <button
        type="button"
        className={cardClassName}
        disabled
        aria-disabled="true"
      >
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={cardClassName} onClick={onClick}>
      {content}
    </button>
  );
}
