"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileText, LogOut, Menu, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import AdminNotifications from "./AdminNotifications";
import styles from "./AdminHeader.module.css";

type ProfileMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const profileMenuItems: ProfileMenuItem[] = [
  { label: "Edit Profile", href: "/admin-dashboard/manage-users", icon: UserRound },
  { label: "Terms of Use", href: "/about", icon: FileText },
  { label: "Privacy Policy", href: "/about", icon: ShieldCheck },
  { label: "Log Out", href: "/", icon: LogOut },
];

type AdminHeaderProps = {
  isSidebarCollapsed: boolean;
  isDesktopCollapsed: boolean;
  isMobileViewport: boolean;
  isMobileNavOpen: boolean;
  onSidebarToggle: () => void;
  onCloseMobileNav: () => void;
  title: string;
  subtitle: string;
  eyebrow?: string;
  seniorFriendlyHeader?: boolean;
  headerActions?: React.ReactNode;
  titleIcon?: React.ReactNode;
  premiumHeader?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AdminHeader({
  isSidebarCollapsed,
  isDesktopCollapsed,
  isMobileViewport,
  isMobileNavOpen,
  onSidebarToggle,
  onCloseMobileNav,
  title,
  subtitle,
  eyebrow = "Admin panel",
  seniorFriendlyHeader = false,
  headerActions,
  titleIcon,
  premiumHeader = false,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const handleSignOut = () => {
    localStorage.removeItem("page_user_token");
    localStorage.removeItem("page_user_payload");
    window.location.href = "/";
  };
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [closeNotificationsSignal, setCloseNotificationsSignal] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const requestCloseNotifications = () => {
    setCloseNotificationsSignal((current) => current + 1);
  };

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;

      const target = event.target;
      if (!(target instanceof Node)) return;
      if (profileMenuRef.current.contains(target)) return;

      setIsProfileMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        requestCloseNotifications();
        onCloseMobileNav();
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onCloseMobileNav]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    requestCloseNotifications();
  }, [pathname]);

  const handleProfileToggle = () => {
    setIsProfileMenuOpen((current) => {
      const next = !current;
      if (next) {
        requestCloseNotifications();
      }
      return next;
    });
  };

  return (
    <>
      <header
        className={joinClasses(
          styles.header,
          isDesktopCollapsed && styles.headerCollapsed,
          isMobileViewport && styles.headerMobile,
        )}
      >
        <div className={styles.bar}>
          <button
            type="button"
            className={styles.sidebarToggle}
            onClick={onSidebarToggle}
            aria-label={
              isMobileViewport
                ? isMobileNavOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
                : isSidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
            }
            aria-expanded={isMobileViewport ? isMobileNavOpen : !isSidebarCollapsed}
            aria-controls="admin-navigation"
          >
            <Menu size={20} />
          </button>

          <div className={styles.brand}>
            <div className={styles.brandMark} aria-hidden="true">
              <img src="/PAGE-favicon.png" alt="PAGE" className={styles.brandMarkImg} />
            </div>
            <div className={styles.brandCopy}>
              <span className={styles.brandName}>PAGE</span>
              <span className={styles.brandSubtitle}>Admin Dashboard</span>
            </div>
          </div>

          <div className={styles.actions}>
            <AdminNotifications
              compact
              closeSignal={closeNotificationsSignal}
              onOpenChange={(open) => {
                if (open) {
                  setIsProfileMenuOpen(false);
                }
              }}
            />

            <div
              className={joinClasses(styles.profileMenu, isProfileMenuOpen && styles.profileMenuOpen)}
              ref={profileMenuRef}
              data-admin-profile-menu
            >
              <button
                type="button"
                className={styles.profileButton}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={handleProfileToggle}
                aria-haspopup="menu"
                aria-expanded={isProfileMenuOpen}
              >
                <div className={styles.profileAvatar} aria-hidden="true">
                  JD
                </div>
                <div className={styles.profileCopy}>
                  <span className={styles.profileName}>Dr. Juan Dela Cruz</span>
                  <span className={styles.profileRole}>Admin Panel</span>
                </div>
              </button>

              <div className={styles.profileDropdown} role="menu" aria-label="Account menu">
                {profileMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={joinClasses(
                      styles.profileMenuItem,
                      item.label === "Log Out" && styles.profileMenuItemDanger,
                    )}
                    role="menuitem"
                    onClick={(e) => {
                      setIsProfileMenuOpen(false);
                      if (item.label === "Log Out") {
                        e.preventDefault();
                        handleSignOut();
                      }
                    }}
                  >
                    <span className={styles.profileMenuIcon} aria-hidden="true">
                      <item.icon size={14} strokeWidth={2} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <section
        className={joinClasses(
          styles.intro,
          seniorFriendlyHeader && styles.introSeniorFriendly,
          (premiumHeader || title === "About Page Management") && styles.introPremium
        )}
      >
        <div className={styles.introContent}>
          <div className={styles.introLeft}>
            <p className={joinClasses(styles.eyebrow, seniorFriendlyHeader && styles.eyebrowSeniorFriendly)}>{eyebrow}</p>
            <h1
              className={joinClasses(
                styles.title,
                seniorFriendlyHeader && styles.titleSeniorFriendly,
                titleIcon ? styles.titleWithIcon : false,
              )}
            >
              {titleIcon ? <span className={styles.titleIconWrap}>{titleIcon}</span> : null}
              <span>{title}</span>
            </h1>
            <p className={joinClasses(styles.subtitle, seniorFriendlyHeader && styles.subtitleSeniorFriendly)}>{subtitle}</p>
            {headerActions && premiumHeader && (
              <div className={styles.introActionsSeniorFriendly} style={{ marginTop: "24px" }}>
                {headerActions}
              </div>
            )}
          </div>
          {headerActions && !premiumHeader && (
            <div className={joinClasses(styles.introActions, seniorFriendlyHeader && styles.introActionsSeniorFriendly)}>
              {headerActions}
            </div>
          )}
          {(premiumHeader || title === "About Page Management") && (
            <div className={styles.introIllustration} aria-hidden="true">
              {title === "All Chapters" ? (
                <svg
                  width="320"
                  height="220"
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.heroSvg}
                >
                  <circle cx="160" cy="110" r="90" fill="url(#hero-glow-chapters)" opacity="0.45" />
                  <circle cx="250" cy="100" r="50" fill="url(#hero-glow-blue-chapters)" opacity="0.35" />
                  <ellipse cx="160" cy="180" rx="105" ry="9" fill="#D3E2F4" opacity="0.8" />
                  
                  <rect
                    x="70"
                    y="60"
                    width="180"
                    height="114"
                    rx="14"
                    fill="#FFFFFF"
                    stroke="#1E538E"
                    strokeWidth="2.5"
                  />
                  <rect x="75" y="65" width="170" height="98" rx="10" fill="#F4F8FD" />
                  
                  <path d="M75 100h170M75 130h170M120 65v98M180 65v98" stroke="#E6EEF8" strokeWidth="1.5" />
                  
                  <g transform="translate(100, 80)">
                    <circle cx="12" cy="12" r="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" fill="#2563eb" />
                    <line x1="12" y1="22" x2="12" y2="28" stroke="#2563eb" strokeWidth="1.5" />
                  </g>
                  
                  <g transform="translate(150, 110)">
                    <circle cx="12" cy="12" r="10" fill="#fffbeb" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" fill="#d97706" />
                    <line x1="12" y1="22" x2="12" y2="28" stroke="#d97706" strokeWidth="1.5" />
                  </g>
                  
                  <g transform="translate(200, 90)">
                    <circle cx="12" cy="12" r="10" fill="#fff1f2" stroke="#e11d48" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" fill="#e11d48" />
                    <line x1="12" y1="22" x2="12" y2="28" stroke="#e11d48" strokeWidth="1.5" />
                  </g>

                  <path d="M120 95c20 0 20 20 40 20s20-20 40-20" stroke="#1E538E" strokeWidth="2.5" strokeDasharray="4 4" opacity="0.6" />
                  
                  <defs>
                    <radialGradient id="hero-glow-chapters" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#5BA3E8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#5BA3E8" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="hero-glow-blue-chapters" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1E538E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1E538E" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              ) : title === "All Conventions" ? (
                <svg
                  width="320"
                  height="220"
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.heroSvg}
                >
                  <circle cx="160" cy="110" r="90" fill="url(#hero-glow-conventions)" opacity="0.45" />
                  <circle cx="70" cy="130" r="50" fill="url(#hero-glow-blue-conventions)" opacity="0.35" />

                  <ellipse cx="160" cy="180" rx="105" ry="9" fill="#D3E2F4" opacity="0.8" />

                  {/* Lanyard Strap */}
                  <path
                    d="M160 48 C 160 22, 100 12, 100 -5 M 160 48 C 160 22, 220 12, 220 -5"
                    stroke="#5BA3E8"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.4"
                  />

                  {/* Convention Pass Card */}
                  <rect
                    x="90"
                    y="48"
                    width="140"
                    height="110"
                    rx="12"
                    fill="#FFFFFF"
                    stroke="#1E538E"
                    strokeWidth="2.5"
                  />
                  <rect x="95" y="53" width="130" height="100" rx="8" fill="#F4F8FD" />

                  {/* Lanyard Slot */}
                  <rect x="150" y="56" width="20" height="5" rx="2.5" fill="#D3E2F4" />

                  {/* Header/Ribbon on Pass */}
                  <rect x="95" y="70" width="130" height="22" fill="#1E538E" />
                  <rect x="110" y="79" width="100" height="4" rx="2" fill="#5BA3E8" />

                  {/* Pass Details */}
                  <circle cx="124" cy="118" r="14" fill="#E6EEF8" stroke="#1E538E" strokeWidth="1.5" />
                  {/* Person Silhouette inside avatar */}
                  <path d="M124 112c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-6 11c0-2 2-3.5 6-3.5s6 1.5 6 3.5v1.5h-12v-1.5z" fill="#1E538E" />

                  <rect x="146" y="112" width="65" height="5" rx="2.5" fill="#B8CDE5" />
                  <rect x="146" y="122" width="45" height="4" rx="2" fill="#E6EEF8" />
                  <rect x="146" y="130" width="55" height="4" rx="2" fill="#E6EEF8" />

                  {/* Floating Calendar on Left */}
                  <g filter="url(#drop-shadow-calendar)">
                    <rect x="36" y="90" width="48" height="48" rx="8" fill="#FFFFFF" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M36 90h48v14H36z" fill="#e11d48" />
                    {/* Calendar rings */}
                    <rect x="44" y="86" width="4" height="8" rx="2" fill="#475569" />
                    <rect x="68" y="86" width="4" height="8" rx="2" fill="#475569" />
                    <text x="60" y="128" fill="#1E538E" fontSize="18" fontWeight="800" textAnchor="middle">20</text>
                  </g>

                  {/* Microphone on Right */}
                  <g filter="url(#drop-shadow-mic)">
                    <line x1="262" y1="170" x2="262" y2="105" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
                    <path d="M250 170h24v4h-24z" fill="#475569" />
                    {/* Microphone head & joint */}
                    <path d="M262 105l-10-15" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                    <rect x="244" y="78" width="10" height="15" rx="5" fill="#5BA3E8" stroke="#1E538E" strokeWidth="1.5" transform="rotate(-30 249 85)" />
                    {/* Sound Waves */}
                    <path d="M232 75c-3 3-3 8 0 11M226 70c-5 5-5 13 0 18" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                  </g>

                  <defs>
                    <radialGradient id="hero-glow-conventions" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#5BA3E8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#5BA3E8" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="hero-glow-blue-conventions" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1E538E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1E538E" stopOpacity="0" />
                    </radialGradient>
                    <filter id="drop-shadow-calendar" x="24" y="80" width="72" height="72" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="2" dy="5" stdDeviation="4.5" floodColor="#143152" floodOpacity="0.09" />
                    </filter>
                    <filter id="drop-shadow-mic" x="220" y="65" width="70" height="120" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="2" dy="4" stdDeviation="3.5" floodColor="#143152" floodOpacity="0.08" />
                    </filter>
                  </defs>
                </svg>
              ) : (
                <svg
                  width="320"
                  height="220"
                  viewBox="0 0 320 220"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.heroSvg}
                >
                  <circle cx="160" cy="110" r="90" fill="url(#hero-glow)" opacity="0.45" />
                  <circle cx="70" cy="130" r="50" fill="url(#hero-glow-blue)" opacity="0.35" />

                  <ellipse cx="160" cy="180" rx="105" ry="9" fill="#D3E2F4" opacity="0.8" />

                  <path
                    d="M55 170h210l14 11H41l14-11z"
                    fill="#E2EBF6"
                    stroke="#B8CDE5"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path d="M140 170h40v3.5h-40v-3.5z" fill="#B8CDE5" />

                  <rect
                    x="70"
                    y="60"
                    width="180"
                    height="114"
                    rx="7"
                    fill="#FFFFFF"
                    stroke="#1E4F91"
                    strokeWidth="2.5"
                  />
                  <rect x="75" y="65" width="170" height="98" rx="4" fill="#F4F8FD" />

                  <rect x="87" y="77" width="55" height="7" rx="2.5" fill="#E6EEF8" />
                  <rect x="87" y="91" width="85" height="4.5" rx="2" fill="#E6EEF8" />
                  <rect x="87" y="100" width="105" height="4.5" rx="2" fill="#E6EEF8" />
                  <rect x="87" y="109" width="70" height="4.5" rx="2" fill="#E6EEF8" />
                  <circle cx="205" cy="88" r="11" fill="#E6EEF8" />

                  <g filter="url(#drop-shadow-doc)">
                    <rect x="180" y="48" width="60" height="50" rx="6" fill="#FFFFFF" stroke="#E6EEF8" strokeWidth="1" />
                    <line x1="190" y1="62" x2="220" y2="62" stroke="#5BA3E8" strokeWidth="3" strokeLinecap="round" />
                    <line x1="190" y1="71" x2="230" y2="71" stroke="#B8CDE5" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="190" y1="80" x2="212" y2="80" stroke="#B8CDE5" strokeWidth="2.5" strokeLinecap="round" />
                  </g>

                  <rect x="262" y="142" width="18" height="28" rx="2" fill="#B8CDE5" />
                  <ellipse cx="271" cy="142" rx="10" ry="3.5" fill="#A5BCD8" />
                  <path d="M271 138c-3-9-1-16-1-16s6 4 4 12c-1 3-3 4-3 4z" fill="#4299E1" opacity="0.85" />
                  <path d="M269 139c-8-6-11-11-11-11s7 1 10 8c1 2 1 3 1 3z" fill="#4299E1" opacity="0.65" />
                  <path d="M273 139c8-6 11-11 11-11s-7 1-10 8c-1 2-1 3-1 3z" fill="#4299E1" opacity="0.95" />

                  <g filter="url(#drop-shadow-shield)">
                    <circle cx="50" cy="110" r="25" fill="#FFFFFF" />
                    <path
                      d="M50 92c-8 0-11 5.5-11 5.5S38 114 50 124c12-10 11-26.5 11-26.5S58 92 50 92z"
                      fill="url(#shield-grad)"
                    />
                    <path
                      d="M45.5 108.5l3.5 3.5 6-6"
                      stroke="#FFFFFF"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>

                  <g transform="rotate(-30 210 120)">
                    <rect x="200" y="85" width="9" height="50" rx="2" fill="url(#pencil-grad)" />
                    <path d="M200 135l4.5 9 4.5-9h-9z" fill="#FFC085" />
                    <path d="M202.5 139.5l2 4.5 2-4.5h-4z" fill="#1E4F91" />
                    <rect x="200" y="83" width="9" height="4.5" fill="#E2EBF6" />
                    <rect x="200" y="80" width="9" height="3" fill="#F56565" />
                  </g>

                  <defs>
                    <radialGradient id="hero-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#5BA3E8" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#5BA3E8" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="hero-glow-blue" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#1E4F91" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1E4F91" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="shield-grad" x1="50" y1="92" x2="50" y2="124" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#5BA3E8" />
                      <stop offset="100%" stopColor="#1E4F91" />
                    </linearGradient>
                    <linearGradient id="pencil-grad" x1="200" y1="85" x2="209" y2="85" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#5BA3E8" />
                      <stop offset="100%" stopColor="#1E4F91" />
                    </linearGradient>
                    <filter id="drop-shadow-doc" x="168" y="40" width="84" height="74" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="2" dy="5" stdDeviation="3.5" floodColor="#143152" floodOpacity="0.09" />
                    </filter>
                    <filter id="drop-shadow-shield" x="20" y="80" width="60" height="60" filterUnits="userSpaceOnUse">
                      <feDropShadow dx="0" dy="4" stdDeviation="4.5" floodColor="#1E4F91" floodOpacity="0.18" />
                    </filter>
                  </defs>
                </svg>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
