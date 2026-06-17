"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  getDigilockerDocuments,
  type DigilockerDoc,
} from "@/services/authService";

const DIGILOCKER_PENDING_DOCS_KEY = "digilocker_pending_docs";
const RETURN_PATH = "/pharmacy/fresh-registration";

type PageStatus = "loading" | "error" | "select";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [docs, setDocs] = useState<DigilockerDoc[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [digiName, setDigiName] = useState<string | null>(null);

  useEffect(() => {
    const urlStatus = searchParams.get("status") ?? "";
    const state = searchParams.get("state") ?? "";
    const urlError = searchParams.get("error");

    if (urlStatus === "FAILED" || urlError) {
      setErrorMessage(
        urlError === "access_denied"
          ? "You denied access to DigiLocker. Please try again."
          : urlError === "invalid_scope"
          ? "DigiLocker configuration error. Please contact support."
          : "DigiLocker verification failed. Please try again.",
      );
      setPageStatus("error");
      return;
    }

    if (!state) {
      setErrorMessage(
        "Invalid callback — missing verification state. Please try again.",
      );
      setPageStatus("error");
      return;
    }

    getDigilockerDocuments(state)
      .then((result) => {
        if (!result || result.status === "NOT_STARTED") {
          setErrorMessage(
            "Your DigiLocker session has expired. Please start again.",
          );
          setPageStatus("error");
          return;
        }
        setDocs(result.documents ?? []);
        if (result.name) setDigiName(result.name);
        setPageStatus("select");
      })
      .catch(() => {
        setErrorMessage("Could not fetch your documents. Please try again.");
        setPageStatus("error");
      });
  }, [searchParams]);

  const toggleDoc = (uri: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) next.delete(uri);
      else next.add(uri);
      return next;
    });
  };

  const handleAttach = () => {
    const chosen = docs.filter((d) => selectedDocs.has(d.uri));
    sessionStorage.setItem(DIGILOCKER_PENDING_DOCS_KEY, JSON.stringify(chosen));
    router.push(RETURN_PATH);
  };

  const handleGoBack = () => router.push(RETURN_PATH);

  if (pageStatus === "loading") {
    return (
      <div className="prts-digilocker-cb prts-digilocker-cb--loading">
        <div className="prts-digilocker-cb__spinner" aria-label="Loading" />
        <p className="prts-digilocker-cb__loading-text">
          Fetching your DigiLocker documents…
        </p>
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div className="prts-digilocker-cb prts-digilocker-cb--error">
        <div className="prts-digilocker-cb__error-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="22" stroke="#E53935" strokeWidth="2.5" />
            <path
              d="M16 16L32 32M32 16L16 32"
              stroke="#E53935"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h2 className="prts-digilocker-cb__error-title">Verification Failed</h2>
        <p className="prts-digilocker-cb__error-msg">{errorMessage}</p>
        <button
          type="button"
          className="prts-btn prts-btn--primary"
          onClick={handleGoBack}
        >
          Go Back to Application
        </button>
      </div>
    );
  }

  const selectedCount = selectedDocs.size;

  return (
    <div className="prts-digilocker-cb">
      <div className="prts-digilocker-cb__header">
        <div className="prts-digilocker-cb__header-left">
          <img
            src="/assets/fresh-registration/document.svg"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
          />
          <div>
            <h1 className="prts-digilocker-cb__title">DigiLocker Documents</h1>
            {digiName && (
              <p className="prts-digilocker-cb__subtitle">
                Verified as <strong>{digiName}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="prts-digilocker-cb__desc">
        The following documents were found in your DigiLocker account. Select
        the ones you want to attach to your application, then click{" "}
        <strong>Attach Selected</strong>.
      </p>

      {docs.length === 0 ? (
        <div className="prts-digilocker-cb__empty">
          <p>No documents were found in your DigiLocker account.</p>
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={handleGoBack}
          >
            Go Back to Application
          </button>
        </div>
      ) : (
        <>
          <div className="prts-digilocker-cb__list">
            {docs.map((doc) => {
              const checked = selectedDocs.has(doc.uri);
              return (
                <label
                  key={doc.uri}
                  className={`prts-digilocker-cb__item${
                    checked ? " prts-digilocker-cb__item--selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="prts-digilocker-cb__checkbox"
                    checked={checked}
                    onChange={() => toggleDoc(doc.uri)}
                  />
                  <div className="prts-digilocker-cb__item-info">
                    <span className="prts-digilocker-cb__item-name">
                      {doc.name}
                    </span>
                    {doc.issuedAt && (
                      <span className="prts-digilocker-cb__item-meta">
                        Issued: {doc.issuedAt}
                      </span>
                    )}
                  </div>
                  {checked && (
                    <svg
                      className="prts-digilocker-cb__item-check"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="10" cy="10" r="10" fill="#2563EB" />
                      <path
                        d="M5.5 10.5L8.5 13.5L14.5 7"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>

          <div className="prts-digilocker-cb__footer">
            <button
              type="button"
              className="prts-btn prts-btn--outline"
              onClick={handleGoBack}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`prts-btn prts-btn--primary${
                selectedCount === 0 ? " prts-btn--disabled" : ""
              }`}
              disabled={selectedCount === 0}
              onClick={handleAttach}
            >
              Attach Selected{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function DigilockerCallbackPage() {
  return (
    <div className="prts-digilocker-cb-page">
      <Suspense
        fallback={
          <div className="prts-digilocker-cb prts-digilocker-cb--loading">
            <div className="prts-digilocker-cb__spinner" aria-label="Loading" />
            <p className="prts-digilocker-cb__loading-text">Loading…</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
