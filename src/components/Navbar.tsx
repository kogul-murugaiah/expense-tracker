import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const desktopLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/add", label: "Add Expense" },
  { to: "/add-income", label: "Add Income" },
  { to: "/monthly", label: "Monthly" },
  { to: "/yearly", label: "Yearly" },
  { to: "/expenses", label: "Manage Expenses" },
];

const mobileLinks = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/add", label: "Expense", icon: MinusIcon },
  { to: "/add-income", label: "Income", icon: PlusIcon, fab: true },
  { to: "/monthly", label: "Monthly", icon: CalendarIcon },
  { to: "/yearly", label: "Yearly", icon: ChartIcon },
  { to: "/expenses", label: "Manage", icon: ListIcon },
];

// Helper function to get user initials from email
const getInitials = (email: string): string => {
  const parts = email.split("@")[0];
  if (parts.length >= 2) {
    return parts.substring(0, 2).toUpperCase();
  }
  return parts.substring(0, 1).toUpperCase();
};

// Helper function to truncate email
const truncateEmail = (email: string, maxLength: number = 20): string => {
  if (email.length <= maxLength) return email;
  return email.substring(0, maxLength - 3) + "...";
};

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  // Fetch user on mount and listen for auth changes
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node)
      ) {
        setDesktopDropdownOpen(false);
      }
    };

    if (desktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopDropdownOpen]);

  // Close mobile sheet when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileSheetRef.current &&
        !mobileSheetRef.current.contains(event.target as Node)
      ) {
        setMobileSheetOpen(false);
      }
    };

    if (mobileSheetOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileSheetOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDesktopDropdownOpen(false);
    setMobileSheetOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-40 hidden w-full bg-[#0F172A]/90 backdrop-blur md:block">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
              CASHAM
            </div>
            <span className="text-sm font-semibold text-slate-300">
              Expense Tracker
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
              {desktopLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      [
                        "rounded-full px-3 py-2 text-sm font-semibold transition duration-200",
                        isActive
                          ? "bg-slate-100 text-slate-900 shadow-sm"
                          : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            {/* User Profile Dropdown */}
            {!loading && user && (
              <div className="relative" ref={desktopDropdownRef}>
                <button
                  onClick={() => setDesktopDropdownOpen(!desktopDropdownOpen)}
                  className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-300 transition duration-200 hover:bg-slate-800/70 hover:text-white"
                  aria-label="User menu"
                  aria-expanded={desktopDropdownOpen}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    {getInitials(user.email || "")}
                  </div>
                  <span className="hidden sm:inline-block">
                    {truncateEmail(user.email || "")}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      desktopDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {desktopDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0F172A] shadow-lg ring-1 ring-slate-800/80 backdrop-blur-xl">
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                          {getInitials(user.email || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-400">Signed in as</p>
                          <p className="truncate text-sm font-semibold text-slate-200">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="my-3 border-t border-slate-800"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-lg bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-400 transition duration-200 hover:bg-red-600/30"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),14px)]">
        <div className="mx-auto mb-3 flex max-w-md items-center justify-between gap-1 rounded-3xl bg-[#0F172A]/80 px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl ring-1 ring-slate-800/80">
          {mobileLinks.map(({ to, label, icon: Icon, fab }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all duration-200",
                  isActive
                    ? "text-blue-300 scale-105"
                    : "text-slate-400 hover:text-slate-200",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      "grid place-items-center rounded-2xl border text-sm transition-all",
                      isActive
                        ? "border-blue-500/60 bg-blue-500/10 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.35)]"
                        : "border-slate-800 bg-[#0F172A] text-slate-300",
                      fab ? "h-12 w-12" : "h-11 w-11",
                    ].join(" ")}
                  >
                    <Icon active={isActive} />
                  </span>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* Profile button */}
          {!loading && user && (
            <button
              onClick={() => setMobileSheetOpen(true)}
              className="flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all duration-200 text-slate-400 hover:text-slate-200"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-800 bg-[#0F172A] text-slate-300 transition-all">
                <ProfileIcon />
              </span>
              <span className="leading-none">Profile</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Profile Bottom Sheet */}
      {mobileSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSheetOpen(false)}
          />
          {/* Sheet */}
          <div
            ref={mobileSheetRef}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-[#0F172A] shadow-2xl ring-1 ring-slate-800/80 md:hidden pb-[max(env(safe-area-inset-bottom),0px)]"
            style={{
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Drag handle */}
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-700"></div>
              
              {/* User Info */}
              {user && (
                <>
                  <div className="mb-6 flex flex-col items-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
                      {getInitials(user.email || "")}
                    </div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Signed in as</p>
                    <p className="text-base font-semibold text-slate-200 text-center break-all">
                      {user.email}
                    </p>
                  </div>

                  <div className="my-4 border-t border-slate-800"></div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl bg-red-600/20 px-6 py-4 text-base font-semibold text-red-400 transition duration-200 active:bg-red-600/30"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-blue-600" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-5H9v5H4a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function PlusIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-blue-600" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}

function MinusIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-blue-600" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-blue-600" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  );
}

function ListIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-blue-600" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function ChartIcon({ active }: { active?: boolean }) {
  return (
    <svg
      className={`h-5 w-5 ${active ? "text-blue-600" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 19h16M7 15V9m5 6V5m5 10V11" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default Navbar;
