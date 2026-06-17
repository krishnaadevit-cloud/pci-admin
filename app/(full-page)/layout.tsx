import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
// import "./globals.scss";
import PrtsHeader from "./pharmacy/layout/PrtsHeader";
import PrtsFooter from "./pharmacy/layout/PrtsFooter";
import PrtsGlobalSidebar from "./pharmacy/layout/PrtsGlobalSidebar";
import { AuthProvider } from "./pharmacy/AuthProvider";
import { DashboardSidebarProvider } from "./pharmacy/DashboardSidebarContext";
import FreshRegistrationProvider from "./pharmacy/fresh-registration/FreshRegistrationProvider";
import ReduxProvider from "./pharmacy/ReduxProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Pharmacy Council of India",
  description: "PCI Registration Portal",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} ${poppins.className}`}>
      {/* <FreshRegistrationProvider>
        <AuthProvider>
          <DashboardSidebarProvider>
            <div className="prts-layout-body">
              <PrtsHeader />
              <main className="prts-layout-main">{children}</main>
              <PrtsFooter />
            </div>
          </DashboardSidebarProvider>
        </AuthProvider>
      </FreshRegistrationProvider> */}
      {/* <FreshRegistrationProvider> */}
        <ReduxProvider>
          <AuthProvider>
            <DashboardSidebarProvider>
              <div className="prts-layout-body">
                <PrtsHeader />
                <PrtsGlobalSidebar />
                <main className="prts-layout-main">{children}</main>
                <PrtsFooter />
              </div>
            </DashboardSidebarProvider>
          </AuthProvider>
        </ReduxProvider>
      {/* </FreshRegistrationProvider> */}
    </div>
  );
}
