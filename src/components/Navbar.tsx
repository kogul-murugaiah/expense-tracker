import { NavLink } from "react-router-dom";

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

const Navbar = () => {
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
        </div>
      </nav>
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

export default Navbar;
