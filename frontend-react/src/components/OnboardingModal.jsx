import React, { useEffect, useState } from "react";
import {
  Play,
  LayoutDashboard,
  MessageSquare,
  Archive,
  BarChart3,
  Keyboard,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  {
    Icon: Play,
    title: "Control your session",
    desc: "Hit Start to begin recording. Pause freezes the clock without stopping — Resume picks right back up. Stop ends and saves the session.",
    tips: [
      { kbd: "S", label: "Start / Resume" },
      { kbd: "P", label: "Pause" },
      { kbd: "X", label: "Stop" },
      { label: "Timer survives a page refresh" },
    ],
  },
  {
    Icon: LayoutDashboard,
    title: "Place your video feeds",
    desc: "Click a source in the sidebar to select it, then click any empty panel to place it — or drag from the grip handle directly into the grid. Drag between panels to swap.",
    tips: [
      { label: "Endoscope · Microscope · PTZ · Monitor" },
      { label: "Double-click a panel → fullscreen" },
      { label: "Fit ↔ Fill toggle per panel" },
      { label: "2×2 · 1+3 · 3+1 · 1×1 layouts" },
    ],
  },
  {
    Icon: MessageSquare,
    title: "Side panels & roles",
    desc: "Log patient details and message the team from the right-side panels. Surgeons and admins control the session; viewers follow the presenter layout in real time.",
    tips: [
      { kbd: "I", label: "Patient info" },
      { kbd: "C", label: "Live chat" },
      { label: "Surgeon / Admin — full control" },
      { label: "Viewer — syncs to presenter" },
    ],
  },
  {
    Icon: Archive,
    title: "Review past sessions",
    desc: "Every completed session lands in Archive. Filter by surgeon, date range, or search by procedure name or session ID.",
    tips: [
      { label: "Filter by surgeon & date" },
      { label: "Search by procedure or ID" },
      { label: "KPIs: sessions · duration · storage" },
    ],
  },
  {
    Icon: BarChart3,
    title: "Analytics at a glance",
    desc: "Track source time-in-view, stream latency, stall counts, and team engagement across the last 7 days. Hover any chart for per-day detail.",
    tips: [
      { label: "Sessions & avg duration" },
      { label: "Latency · stalls per day" },
      { label: "Engagement & layout distribution" },
    ],
  },
  {
    Icon: Keyboard,
    title: "Keyboard shortcuts",
    desc: "Navigate the entire platform without touching the mouse. Press ? at any time to reopen this guide.",
    tips: [
      { kbd: "S · P · X", label: "Session" },
      { kbd: "I · C", label: "Panels" },
      { kbd: "← →", label: "Switch tabs" },
      { kbd: "?", label: "Reopen guide" },
    ],
  },
];

const teal = "var(--ls-teal, #15B8A6)";
const mint = "var(--ls-mint, #CFF4EC)";

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const { Icon, title, desc, tips } = STEPS[step];

  const finish = () => {
    try { localStorage.setItem("ls_onboarded", "1"); } catch { /* ignore */ }
    onClose();
  };

  // Keyboard: Esc closes, ← → navigate steps
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { finish(); return; }
      if (e.key === "ArrowRight") setStep((s) => Math.min(total - 1, s + 1));
      if (e.key === "ArrowLeft")  setStep((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Quick guide">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={finish}
        aria-hidden="true"
      />

      {/* card */}
      <div className="absolute inset-0 grid place-items-center px-4 py-8">
        <div className="w-full max-w-md theme-panel rounded-2xl shadow-2xl p-7 relative flex flex-col gap-5">

          {/* close */}
          <button
            onClick={finish}
            className="absolute right-4 top-4 text-subtle hover:opacity-90 rounded focus-visible:outline-none focus-visible:ring-2"
            style={{ "--tw-ring-color": teal }}
            aria-label="Close guide"
          >
            <X className="h-4 w-4" />
          </button>

          {/* step icon */}
          <div className="flex justify-center">
            <div
              className="grid place-items-center rounded-2xl p-4 border-2"
              style={{ background: mint, borderColor: teal, color: teal }}
            >
              <Icon className="h-9 w-9" aria-hidden />
            </div>
          </div>

          {/* text */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-default mb-2">{title}</h2>
            <p className="text-sm text-subtle leading-relaxed">{desc}</p>
          </div>

          {/* tips */}
          <div className="flex flex-wrap justify-center gap-2">
            {tips.map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-default bg-surface text-default"
              >
                {t.kbd && (
                  <kbd
                    className="font-mono font-bold tracking-wide"
                    style={{ color: teal }}
                  >
                    {t.kbd}
                  </kbd>
                )}
                {t.kbd && <span className="text-subtle opacity-50">—</span>}
                <span>{t.label}</span>
              </span>
            ))}
          </div>

          {/* progress — clickable dots + step counter */}
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-2 rounded-full transition-all focus-visible:outline-none ${
                  i === step ? "w-6" : "w-2 opacity-40 hover:opacity-60"
                }`}
                style={{ background: i === step ? teal : "var(--border)" }}
              />
            ))}
            <span className="ml-2 text-xs text-subtle tabular-nums select-none">
              {step + 1} / {total}
            </span>
          </div>

          {/* nav */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={finish}
              className="text-sm text-subtle hover:opacity-90 focus-visible:outline-none"
            >
              Skip
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-default px-3 py-1.5 text-sm text-default disabled:opacity-30 hover:enabled:opacity-80 focus-visible:outline-none focus-visible:ring-2"
                style={{ "--tw-ring-color": teal }}
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                Back
              </button>

              {step < total - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-white shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2"
                  style={{ background: teal, "--tw-ring-color": teal }}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-white shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2"
                  style={{ background: teal, "--tw-ring-color": teal }}
                >
                  Get started
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
