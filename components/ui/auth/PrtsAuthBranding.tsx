"use client";

import Image from "next/image";

export default function PrtsAuthBranding() {
  return (
    <aside className="prts-auth-branding">
      <div className="prts-auth-branding__overlay" aria-hidden />

      <div className="prts-auth-branding__top">
        <Image
          src="/assets/header/gov-emblem-pci.svg"
          alt="Government of India and PCI"
          width={100}
          height={42}
          className="prts-auth-branding__logo-left"
        />

        <ul className="prts-auth-branding__logo-list">
          <li className="prts-auth-branding__logo-item">
            <Image
              src="/assets/header/digital-india.svg"
              alt="Digital India"
              width={140}
              height={36}
              className="prts-auth-branding__logo-image"
            />
          </li>

          <li className="prts-auth-branding__logo-item">
            <Image
              src="/assets/header/gov-india.svg"
              alt="Government of India"
              width={140}
              height={36}
              className="prts-auth-branding__logo-image"
            />
          </li>

          <li className="prts-auth-branding__logo-item">
            <Image
              src="/assets/header/swachh-bharat.svg"
              alt="Swachh Bharat"
              width={140}
              height={36}
              className="prts-auth-branding__logo-image"
            />
          </li>
        </ul>

        <p className="prts-auth-branding__text">
          The Pharmacy Council of India is a statutory body under the Ministry
          of Health &amp; Family Welfare, Government of India. The PCI is
          responsible for regulating pharmacy education and practice in India to
          ensure the highest standards of professional competence.
        </p>
      </div>

      {/* Social Section */}
      <div className="prts-auth-branding__social">
        <p className="prts-auth-branding__social-text">
          Get connected with us on social networks:
        </p>

        <div className="prts-auth-branding__social-icons">
          <a
            href="#"
            className="prts-auth-branding__social-btn"
            aria-label="Instagram"
          >
            <Image
              src="/assets/footer/instagram.svg"
              alt="Instagram"
              width={18}
              height={18}
              aria-hidden="true"
            />
          </a>

          <a
            href="#"
            className="prts-auth-branding__social-btn"
            aria-label="YouTube"
          >
            <Image
              src="/assets/header/youtube.svg"
              alt="YouTube"
              width={18}
              height={18}
              aria-hidden="true"
            />
          </a>

          <a
            href="#"
            className="prts-auth-branding__social-btn"
            aria-label="Twitter"
          >
            <Image
              src="/assets/footer/x.svg"
              alt="Twitter"
              width={18}
              height={18}
              aria-hidden="true"
            />
          </a>

          <a
            href="#"
            className="prts-auth-branding__social-btn"
            aria-label="Facebook"
          >
            <Image
              src="/assets/footer/facebook.svg"
              alt="Facebook"
              width={18}
              height={18}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </aside>
  );
}
