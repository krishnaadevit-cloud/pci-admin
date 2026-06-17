"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DashboardSidebarContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
};

const DashboardSidebarContext =
  createContext<DashboardSidebarContextValue | null>(null);

export function DashboardSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ isOpen, setIsOpen, toggle }),
    [isOpen, toggle],
  );

  return (
    <DashboardSidebarContext.Provider value={value}>
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  return useContext(DashboardSidebarContext);
}
