"use client";
import { LayoutProvider } from "../layout/context/layoutcontext";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "../styles/layout/layout.scss";

if (typeof window !== "undefined") {
  (window as any).cn = (val: any) =>
    val === null ||
    val === undefined ||
    val === "" ||
    (Array.isArray(val) && val.length === 0);
  (window as any).cb = (val: any) =>
    typeof val === "string" && val.trim() === "";
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          id="theme-link"
          href={`/theme/theme-dark/blue/theme.css`}
          rel="stylesheet"
        ></link>
      </head>
      <body suppressHydrationWarning>
        <PrimeReactProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
