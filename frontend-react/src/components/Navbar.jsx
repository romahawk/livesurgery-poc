import React, { useMemo } from "react";
import {
  PlayCircle,
  Archive as ArchiveIcon,
  BarChart3,
  TvMinimalPlay,
  CircleDot,
  Sun,
  Moon,
  HelpCircle,        // NEW
} from "lucide-react";

/** Brand logo (Clinical Trust palette: teal/mint/navy) */
function BrandLogo({ size = 40 }) {
  const iconSize = Math.round(size * 0.62);

  return (
    <a className="inline-flex items-center gap-2 select-none" href="/" aria-label="LiveSurgery">
      <span
        aria-hidden="true"
        className="grid place-items-center rounded-md border"
        style={{
          width: size,
          height: size,
          background: "var(--ls-mint, #CFF4EC)",
          borderColor: "var(--ls-teal, #15B8A6)",
        }}
      >
        <TvMinimalPlay size={iconSize} strokeWidth={2.5} style={{ color: "var(--ls-teal, #15B8A6)" }} />
      </span>
      <span
        className="leading-none tracking-tight"
        style={{ fontFamily: "'Manrope', Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 22 }}
      >
        <span style={{ color: "var(--ls-teal, #15B8A6)" }}>Live</span>
        <span style={{ color: "var(--ls-navy, #0E2A47)" }}>Surgery</span>
      </span>
    </a>
  );
}

export default function Navbar({
  role,
  setRole,
  currentTab,
  setCurrentTab,
  isRecording = false,
  theme = "light",
  onToggleTheme,
  onOpenOnboarding,   // NEW: pass from App
  showGuidePulse = false, // NEW: draw attention on first run
}) {
  const allTabs = [
    { id: "Live", label: "Live", icon: PlayCircle },
    { id: "Archive", label: "Archive", icon: ArchiveIcon },
    { id: "Analytics", label: "Analytics", icon: BarChart3 },
  ];

  const tabs = useMemo(() => (role === "viewer" ? allTabs.filter((t) => t.id === "Live") : allTabs), [role]);

  const handleRoleChange = (e) => setRole(e.target.value);

  const onTabsKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => t.id === currentTab);
    if (idx === -1) return;
    const next = e.key === "ArrowRight" ? tabs[(idx + 1) % tabs.length] : tabs[(idx - 1 + tabs.length) % tabs.length];
    setCurrentTab(next.id);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur relative">
      {/* Teal brand accent */}
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--ls-teal, #15B8A6)" }} />

      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <BrandLogo size={40} />

        {/* Center: Tabs */}
        <nav
          className="flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1"
          aria-label="Primary"
          onKeyDown={onTabsKeyDown}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = currentTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCurrentTab(id)}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]",
                  active ? "bg-blue-600 text-white shadow" : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          {/* Recording chip (optional) */}
          {isRecording && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium"
              style={{ borderColor: "#EF4444", color: "#B91C1C", background: "#FEE2E2" }}
              title="Recording"
            >
              <CircleDot className="h-3.5 w-3.5 text-red-600" />
              Recording
            </span>
          )}

          {/* Theme toggle (optional) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          {/* NEW: Onboarding / Guide button */}
          <button
            type="button"
            onClick={onOpenOnboarding}
            className={[
              "relative inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm",
              "text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]",
            ].join(" ")}
            title="Quick Guide"
            aria-label="Quick Guide"
          >
            <HelpCircle className="h-4 w-4 text-[var(--ls-teal,#15B8A6)]" />
            Guide
            {showGuidePulse && (
              <span className="absolute -top-1 -right-1 inline-flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ls-teal,#15B8A6)] opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--ls-teal,#15B8A6)]"></span>
              </span>
            )}
          </button>

          {/* Role selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="role" className="text-sm text-slate-600">
              Role:
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
            >
              <option value="surgeon">Surgeon</option>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
