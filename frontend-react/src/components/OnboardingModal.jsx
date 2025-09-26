import React, { useEffect, useState } from "react";
import {
  Play,
  LayoutDashboard,
  User,
  MessageSquare,
  Archive,
  BarChart3,
  Keyboard,
  X,
} from "lucide-react";

const STEPS = [
  {
    title: "Start a session",
    desc: "Use Start / Pause / Stop to control the recording. Hotkeys: S, P, X.",
    Icon: Play,
  },
  {
    title: "Arrange video sources",
    desc: "Drag sources from the left into the 2×2 grid. Double-click a pane for full screen.",
    Icon: LayoutDashboard,
  },
  {
    title: "Patient Info & Live Chat",
    desc: "Open side panels to capture patient details and talk to the team. Hotkeys: I (Info), C (Chat).",
    Icon: MessageSquare,
  },
  {
    title: "Archive your work",
    desc: "Review past sessions and attachments in Archive.",
    Icon: Archive,
  },
  {
    title: "Analytics",
    desc: "See trends for time-in-view, latency, and engagement in Analytics.",
    Icon: BarChart3,
  },
  {
    title: "Shortcuts",
    desc: "S Start · P Pause · X Stop · I Patient Info · C Chat",
    Icon: Keyboard,
  },
];

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const { Icon, title, desc } = STEPS[step];

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const finish = () => {
    try { localStorage.setItem("ls_onboarded", "1"); } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={finish}
        aria-hidden="true"
      />
      {/* card */}
      <div className="absolute inset-0 grid place-items-center px-4">
        <div className="w-full max-w-lg rounded-2xl border bg-white p-5 shadow-xl relative">
          <button
            onClick={finish}
            className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
            aria-label="Close"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div
              className="grid place-items-center rounded-lg border p-2"
              style={{ background: "var(--ls-mint,#CFF4EC)", borderColor: "var(--ls-teal,#15B8A6)", color: "var(--ls-teal,#15B8A6)" }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600">{desc}</p>
            </div>
          </div>

          {/* progress dots */}
          <div className="flex items-center justify-center gap-2 my-4">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-[var(--ls-teal,#15B8A6)]" : "w-2 bg-slate-300"}`}
              />
            ))}
          </div>

          {/* actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={finish}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Skip
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
              >
                Back
              </button>
              {step < total - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                  className="rounded-md px-3 py-1 text-sm text-white shadow-sm bg-[var(--ls-teal,#15B8A6)] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finish}
                  className="rounded-md px-3 py-1 text-sm text-white shadow-sm bg-[var(--ls-teal,#15B8A6)] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ls-teal,#15B8A6)]"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
