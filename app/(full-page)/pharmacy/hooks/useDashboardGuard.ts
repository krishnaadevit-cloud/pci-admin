"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData, selectDashboardData } from "@/store/slices";
import type { ApplicationStatus } from "@/types/dashboard";

/**
 * Guards a pharmacy flow page by checking application_status.<statusKey>.
 * If the status is false, redirects to /pharmacy/dashboard.
 * On hard refresh where dashboard data isn't in Redux yet, fetches it first.
 */
export function useDashboardGuard(statusKey: keyof ApplicationStatus) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const fetchedRef = useRef(false);
  const [isChecking, setIsChecking] = useState(!dashboardData);

  useEffect(() => {
    if (!dashboardData && !fetchedRef.current) {
      fetchedRef.current = true;
      dispatch(fetchDashboardData()).finally(() => setIsChecking(false));
    } else if (dashboardData) {
      setIsChecking(false);
    }
  }, [dashboardData, dispatch]);

  useEffect(() => {
    if (isChecking) return;
    const allowed = dashboardData?.application_status?.[statusKey] === true;
    if (!allowed) {
      router.replace("/pharmacy/dashboard");
    }
  }, [isChecking, dashboardData, statusKey, router]);

  const isAllowed =
    !isChecking && dashboardData?.application_status?.[statusKey] === true;

  return { isAllowed, isChecking };
}
