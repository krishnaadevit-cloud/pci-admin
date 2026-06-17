"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { useDashboardSidebar } from "../DashboardSidebarContext";
import { useState, useRef, useEffect } from "react";
import PrtsUserAvatar from "./PrtsUserAvatar";

export default function PrtsHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const sidebar = useDashboardSidebar();
  const sidebarOpen = sidebar?.isOpen ?? false;
  const isRegister = pathname.startsWith("/pharmacy/register");
  const isFreshRegistration = pathname.startsWith("/pharmacy/fresh-registration");

  const [openLang, setOpenLang] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenLang(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenu) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenu]);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--prts-header-height",
        `${headerEl.offsetHeight}px`,
      );
    };

    syncHeaderHeight();

    const resizeObserver = new ResizeObserver(syncHeaderHeight);
    resizeObserver.observe(headerEl);

    return () => resizeObserver.disconnect();
  }, []);

  const closeMobileMenu = () => setMobileMenu(false);

  return (
    <header ref={headerRef} className="prts-header">
      <div className="prts-header__topbar">
        <a
          href="https://www.india.gov.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="prts-header__gov"
        >
          <Image
            src="/assets/header/flag.svg"
            alt=""
            width={22}
            height={15}
            className="prts-header__flag"
            aria-hidden
          />
          <span>Government of India</span>
          <Image
            src="/assets/header/arrowsquareout.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden
          />
        </a>

        <button
          type="button"
          className="prts-header__accessibility-btn"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Open accessibility and settings menu"
          aria-expanded={mobileMenu}
        >
          <Image
            src="/assets/header/menuicon.svg"
            alt=""
            width={18}
            height={18}
            aria-hidden
          />
        </button>

        {mobileMenu && (
          <button
            type="button"
            className="prts-header__topbar-overlay"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          />
        )}

        <div
          className={`prts-header__topbar-actions ${
            mobileMenu ? "is-open" : ""
          }`}
        >
          <button
            type="button"
            className="prts-header__mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>

          <span className="prts-header__font-size">
            <button type="button">A-</button>
            <button type="button" className="is-active">
              A
            </button>
            <button type="button">A+</button>
          </span>

          <span className="prts-header__line" />

          <button type="button" className="prts-header__icon-btn">
            <Image
              src="/assets/header/theme.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
            />
            <span>Theme</span>
          </button>

          <span className="prts-header__line" />

          <a href="#" className="prts-header__help">
            <Image
              src="/assets/header/fi-rr-life-ring.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden
            />
            <span>Help</span>
          </a>

          <span className="prts-header__line" />

          <div className="prts-header__lang-wrapper" ref={langDropdownRef}>
            <button
              type="button"
              className="prts-header__lang"
              onClick={(e) => {
                e.stopPropagation();
                setOpenLang(!openLang);
              }}
            >
              <Image
                src="/assets/header/earth-americas.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden
              />
              <span>English</span>
              <Image
                src="/assets/header/dropdownarrow2.svg"
                alt="dropdown arrow"
                width={10}
                height={5}
                aria-hidden
                className={`arrow ${openLang ? "is-rotate" : ""}`}
              />
            </button>

            {openLang && (
              <ul className="prts-header__dropdown">
                <li onClick={() => setOpenLang(false)}>English</li>
                <li onClick={() => setOpenLang(false)}>Hindi</li>
                <li onClick={() => setOpenLang(false)}>Spanish</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="prts-header__main">
        <div className="prts-header__left">
          {isAuthenticated && (
            <button
              type="button"
              className={`prts-header__menu-btn${
                isFreshRegistration ? " prts-header__menu-btn--fresh-registration" : ""
              }`}
              onClick={() =>
                sidebarOpen ? sidebar?.setIsOpen(false) : sidebar?.toggle()
              }
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={sidebarOpen}
            >
              {sidebarOpen ? (
                <span aria-hidden>✕</span>
              ) : (
                <Image
                  src="/assets/dashboard/menuburger.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden
                />
              )}
            </button>
          )}

          <Link
            href={
              isAuthenticated ? "/pharmacy/dashboard" : "/pharmacy/register"
            }
            className="prts-header__brand"
          >
            <Image
              src="/assets/header/gov-emblem-pci.svg"
              alt="Pharmacy Council of India"
              width={80}
              height={50}
              className="prts-header__emblem"
              priority
            />
            <div className="prts-header__brand-text">
              <span className="prts-header__title">Pharmacy Council of India</span>
              <span className="prts-header__subtitle">
                A Statutory Body under Ministry of Health &amp; Family Welfare
              </span>
            </div>
          </Link>
        </div>

        <div className="prts-header__actions">
          {isAuthenticated ? (
            <PrtsUserAvatar />
          ) : (
            <>
              <Link href="/pharmacy/login" className="prts-header__login-link">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.4545 1.04175C11.3153 1.04175 10.3961 1.04175 9.67363 1.13925C8.92363 1.23925 8.29196 1.45591 7.7903 1.95675C7.35363 2.39425 7.13196 2.93175 7.01613 3.56341C6.90363 4.17758 6.88196 4.92841 6.87696 5.83008C6.87608 5.99584 6.94108 6.15516 7.05766 6.273C7.17425 6.39083 7.33287 6.45753 7.49863 6.45842C7.66439 6.4593 7.82371 6.3943 7.94155 6.27771C8.05938 6.16113 8.12608 6.00251 8.12696 5.83675C8.13196 4.92592 8.1553 4.28008 8.2453 3.78925C8.3328 3.31758 8.47196 3.04341 8.67446 2.84091C8.9053 2.61008 9.22946 2.46008 9.84113 2.37758C10.4703 2.29341 11.3045 2.29175 12.5003 2.29175H13.3336C14.5303 2.29175 15.3645 2.29341 15.9936 2.37758C16.6053 2.46008 16.9286 2.61091 17.1603 2.84091C17.392 3.07091 17.5403 3.39508 17.6228 4.00758C17.7078 4.63591 17.7086 5.47091 17.7086 6.66675V13.3334C17.7086 14.5292 17.7078 15.3642 17.6228 15.9934C17.5403 16.6051 17.3903 16.9284 17.1595 17.1592C16.9286 17.3901 16.6053 17.5401 15.9936 17.6226C15.3645 17.7067 14.5303 17.7084 13.3336 17.7084H12.5003C11.3045 17.7084 10.4703 17.7067 9.8403 17.6226C9.22946 17.5401 8.9053 17.3892 8.67446 17.1592C8.47196 16.9567 8.3328 16.6826 8.2453 16.2109C8.1553 15.7201 8.13196 15.0742 8.12696 14.1634C8.12652 14.0813 8.10992 14.0002 8.07811 13.9245C8.0463 13.8488 7.99989 13.7802 7.94155 13.7224C7.8832 13.6647 7.81406 13.6191 7.73806 13.588C7.66206 13.557 7.58071 13.5413 7.49863 13.5417C7.41655 13.5422 7.33537 13.5588 7.25971 13.5906C7.18404 13.6224 7.11539 13.6688 7.05766 13.7272C6.99994 13.7855 6.95427 13.8547 6.92326 13.9307C6.89226 14.0066 6.87652 14.088 6.87696 14.1701C6.88196 15.0717 6.90363 15.8226 7.01613 16.4367C7.1328 17.0684 7.35363 17.6059 7.79113 18.0434C8.29196 18.5451 8.92446 18.7601 9.67446 18.8617C10.3961 18.9584 11.3153 18.9584 12.4545 18.9584H13.3795C14.5195 18.9584 15.4378 18.9584 16.1603 18.8609C16.9103 18.7609 17.542 18.5442 18.0436 18.0434C18.5453 17.5417 18.7603 16.9101 18.862 16.1601C18.9586 15.4376 18.9586 14.5184 18.9586 13.3792V6.62091C18.9586 5.48175 18.9586 4.56258 18.862 3.84008C18.7611 3.09008 18.5453 2.45841 18.0436 1.95675C17.542 1.45508 16.9103 1.24008 16.1603 1.13925C15.4378 1.04175 14.5186 1.04175 13.3795 1.04175H12.4545Z" fill="currentColor"/>
                  <path d="M1.66797 9.37433C1.50221 9.37433 1.34324 9.44018 1.22603 9.55739C1.10882 9.6746 1.04297 9.83357 1.04297 9.99933C1.04297 10.1651 1.10882 10.3241 1.22603 10.4413C1.34324 10.5585 1.50221 10.6243 1.66797 10.6243H11.6455L10.0113 12.0243C9.94892 12.0777 9.89768 12.1429 9.86048 12.2161C9.82329 12.2893 9.80088 12.3691 9.79454 12.451C9.78172 12.6164 9.83511 12.78 9.94297 12.906C10.0508 13.032 10.2043 13.1099 10.3696 13.1228C10.535 13.1356 10.6987 13.0822 10.8246 12.9743L13.7413 10.4743C13.8099 10.4157 13.865 10.3428 13.9028 10.2608C13.9405 10.1788 13.9601 10.0896 13.9601 9.99933C13.9601 9.90905 13.9405 9.81984 13.9028 9.73784C13.865 9.65584 13.8099 9.583 13.7413 9.52433L10.8246 7.02433C10.6987 6.91647 10.535 6.86308 10.3696 6.87589C10.2043 6.88871 10.0508 6.96668 9.94297 7.09266C9.83511 7.21864 9.78172 7.3823 9.79454 7.54765C9.80735 7.71299 9.88532 7.86647 10.0113 7.97433L11.6446 9.37433H1.66797Z" fill="currentColor"/>
                </svg>
                Log in
              </Link>

              <Link
                href="/pharmacy/register"
                className={`prts-header__register-btn ${
                  isRegister ? "is-active" : ""
                }`}
              >
                Registration
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
