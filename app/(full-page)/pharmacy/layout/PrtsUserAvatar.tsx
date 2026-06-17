"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { selectDashboardData } from "@/store/slices";

export default function PrtsUserAvatar() {
  const { user, logout, isAuthenticated } = useAuth();
  const dashboardData = useAppSelector(selectDashboardData);
  const profileImage =
    dashboardData?.fresh_app_details?.personalDetails?.profileImage || null;
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) return null;

  // Generate avatar with initials
  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate background color based on name
  const colors = ["#2B35D6", "#7C3AED", "#DC3545", "#28A745", "#B8860B"];
  const colorIndex = user.fullName.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="prts-user-avatar-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="prts-user-avatar"
        onClick={() => setOpenMenu(!openMenu)}
        aria-label="User menu"
      >
        <div
          className="prts-user-avatar__circle"
          style={{ backgroundColor: bgColor }}
        >
          {/* {initials} */}
          <Image
            src={profileImage ?? "/assets/header/userphoto.svg"}
            alt="profile"
            width={45}
            height={45}
            className="prts-user-avatar__image"
            />
        </div>
        <span className="prts-user-avatar__online-dot" />
      </button>

      {openMenu && (
        <div className="prts-user-avatar__dropdown">
          <div className="prts-user-avatar__user-info">
            <div
              className="prts-user-avatar__info-circle"
              style={{ backgroundColor: bgColor }}
            >
              {/* {initials} */}
              <Image
            src={profileImage ?? "/assets/header/userphoto.svg"}
            alt="profile"
            width={45}
            height={45}
            className="prts-user-avatar__image"
            />
            </div>
            <div>
              <p className="prts-user-avatar__name">{user.fullName}</p>
              <p className="prts-user-avatar__email">{user.email}</p>
            </div>
          </div>
          <hr className="prts-user-avatar__divider" />
          <button
            type="button"
            className="prts-user-avatar__logout"
            onClick={() => {
              setOpenMenu(false);
              logout();
            }}
          >
            <i className="pi pi-sign-out" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
