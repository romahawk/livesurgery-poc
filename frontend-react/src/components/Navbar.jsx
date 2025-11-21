import React, { useMemo, useState } from "react";
import {
  PlayCircle,
  Archive as ArchiveIcon,
  BarChart3,
  TvMinimalPlay,
  CircleDot,
  Sun,
  Moon,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider.jsx";

/** Brand logo */
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
        <TvMinimalPlay
          size={iconSize}
          strokeWidth={2.5}
          style={{ color: "var(--ls-teal, #15B8A6)" }}
        />
      </span>
      <span
        className="leading-none tracking-tight"
        style={{
          fontFamily: "'Manrope', Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 22,
        }}
      >
        <span style={{ color: "var(--ls-teal, #15B8A6)" }}>Live</span>
        <span style={{ color: "var(--brand-word, var(--ls-navy, #0E2A47))" }}>Surgery</span>
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
  onOpenOnboarding,
  showGuidePulse = false,
}) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allTabs = [
    { id: "Live", label: "Live", icon: PlayCircle },
    { id: "Archive", label: "Archive", icon: ArchiveIcon },
    { id: "Analytics", label: "Analytics", icon: BarChart3 },
  ];

  const tabs = useMemo(
    () => (role === "viewer" ? allTabs.filter((t) => t.id === "Live") : allTabs),
    [role]
  );

  const onTabsKeyDown = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => t.id === currentTab);
    if (idx === -1) return;
    const next =
      e.key === "ArrowRight"
        ? tabs[(idx + 1) % tabs.length]
        : tabs[(idx - 1 + tabs.length) % tabs.length];
    setCurrentTab(next.id);
  };

  const nextMode = theme === "dark" ? "Light" : "Dark";
  const ModeIcon = theme === "dark" ? Sun : Moon;

  const RightCluster = () => (
    <div className="flex items-center gap-3">
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

      {/* Theme toggle pill */}
      <button
        type="button"
        onClick={toggle}
        className="mode-toggle"
        aria-label={`Switch to ${nextMode} mode`}
        title={`Switch to ${nextMode} mode`}
      >
        <ModeIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="mode-toggle__label">{nextMode}</span>
      </button>

      {/* Guide */}
      <button
        type="button"
        onClick={onOpenOnboarding}
        className="guide-pill"
        title="Quick Guide"
        aria-label="Quick Guide"
      >
        <span className="inline-flex items-center gap-2 text-default">
          <HelpCircle className="h-4 w-4 text-[var(--ls-teal,#15B8A6)]" />
          Guide
        </span>
        {showGuidePulse && (
          <span className="relative -top-2 -right-1 inline-flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--ls-teal,#15B8A6)] opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--ls-teal,#15B8A6)]"></span>
          </span>
        )}
      </button>

      {/* Role selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="role" className="text-sm text-default">
          Role:
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) =>
            typeof setRole === "function" ? setRole(e.target.value) : null
          }
          className="border-default border rounded-md px-2 py-1 text-sm bg-surface text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
        >
          <option value="surgeon">Surgeon</option>
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-surface/90 backdrop-blur relative">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "var(--ls-teal, #15B8A6)" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <BrandLogo size={40} />

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-2 overflow-x-auto whitespace-nowrap px-1"
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
                className={`tab-pill ${active ? "is-active" : ""}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Desktop cluster */}
        <div className="hidden md:flex">
          <RightCluster />
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md border border-default p-2 text-default"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu content */}
      {mobileOpen && (
        <div className="md:hidden border-t border-default bg-surface/95 backdrop-blur px-4 pb-3 space-y-3">
          <nav
            className="flex flex-wrap gap-2 pt-3"
            aria-label="Primary mobile"
            onKeyDown={onTabsKeyDown}
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = currentTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCurrentTab(id);
                    setMobileOpen(false);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`tab-pill w-full justify-center ${
                    active ? "is-active" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="pt-1">
            <RightCluster />
          </div>
        </div>
      )}
    </header>
  );
}
