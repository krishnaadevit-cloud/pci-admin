"use client";

import Image from "next/image";

export default function PrtsFooter() {
  return (
    <footer className="prts-footer">

      {/* ── Social Bar ── */}
      <div className="prts-footer__social-bar">
        <span className="prts-footer__social-label">
          Get connected with us on social networks:
        </span>
        <div className="prts-footer__social-icons">
          <a href="#" className="prts-footer__social-link" aria-label="Instagram">
            <Image src="/assets/footer/instagram.svg" alt="Instagram" width={36} height={36} />
          </a>
          <a href="#" className="prts-footer__social-link" aria-label="WhatsApp">
            <Image src="/assets/footer/whatsapp.svg" alt="WhatsApp" width={36} height={36} />
          </a>
          <a href="#" className="prts-footer__social-link" aria-label="X">
            <Image src="/assets/footer/x.svg" alt="X" width={36} height={36} />
          </a>
          <a href="#" className="prts-footer__social-link" aria-label="Facebook">
            <Image src="/assets/footer/facebook.svg" alt="Facebook" width={36} height={36} />
          </a>
        </div>
      </div>

      {/* ── Middle Bar ── */}
      <div className="prts-footer__middle-bar">
        <div className="prts-footer__links">
          <a href="#" className="prts-footer__link">Privacy Policy</a>
          <a href="#" className="prts-footer__link">Terms &amp; Conditions</a>
          <a href="#" className="prts-footer__link">Contact us</a>
        </div>
        <div className="prts-footer__gov-badges">
          <div className="prts-footer__gov-badge">
            <Image src="/assets/footer/negd.svg" alt="NeGD" width={100} height={52} />
          </div>
          <div className="prts-footer__gov-badge">
            <Image src="/assets/footer/clean_india.svg" alt="Clean India" width={100} height={52} />
          </div>
          <div className="prts-footer__gov-badge">
            <Image src="/assets/footer/goi.svg" alt="Government of India" width={100} height={52} />
          </div>
          <div className="prts-footer__gov-badge">
            <Image src="/assets/footer/digital_india.svg" alt="Digital India" width={100} height={52} />
          </div>
        </div>
      </div>

      <div className="prts-footer__border"></div>

      {/* ── Bottom Bar ── */}
      <div className="prts-footer__bottom-bar">
        <div className="prts-footer__brand">
          <div className="prts-footer__brand-logos">
             
            <Image src="/assets/footer/pci_logo.svg" alt="PCI Logo" width={80} height={50} />
          </div>
          <div className="prts-footer__brand-text">
            <span className="prts-footer__brand-name">Pharmacy Council of India</span>
            <span className="prts-footer__brand-sub">
              A STATUTORY BODY UNDER MINISTRY OF HEALTH &amp; FAMILY WELFARE
            </span>
          </div>
        </div>
        <p className="prts-footer__copyright">
          © 2026 Copyright: Pharmacy Council of India. Government of India®
        </p>
      </div>

    </footer>
  );
}