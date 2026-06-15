"use client";
import React from "react";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Dashboard = () => {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    router.push("/pci-admin/dashboard");
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex align-items-center justify-content-center h-screen">
      <div className="text-center">
        <i className="pi pi-spin pi-spinner text-primary text-4xl mb-3"></i>
        <p className="text-xl font-medium">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
};

export default Dashboard;
