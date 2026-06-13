import { Metadata } from "next";
import Layout from "../../layout/layout";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "PCI",
  // description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.',
  robots: { index: false, follow: false },

  openGraph: {
    type: "website",
    title: "PrimeReact Atlantis-REACT",
    url: "https://www.primefaces.org/Atlantis-react",
    description:
      "The ultimate collection of design-agnostic, flexible and accessible React UI Components.",
    images: ["https://www.primefaces.org/static/social/Atlantis-react.png"],
    ttl: 604800,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import React, { Suspense } from "react";

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Suspense fallback={null}>
      <Layout>{children}</Layout>
    </Suspense>
  );
}
