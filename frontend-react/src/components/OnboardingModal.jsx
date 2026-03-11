import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

const TOUR_KEY = "ls_onboarded";
const MOBILE_TOUR_QUERY = "(max-width: 768px)";
const PAD = 10;

function isVisibleTarget(node) {
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  const styles = window.getComputedStyle(node);
  return styles.display !== "none" && styles.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
}

function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function buildSteps(role) {
  const baseSteps = [
    {
      id: "welcome",
      target: null,
      title: "Welcome to LiveSurgery",
      body:
        "Run, monitor, and review surgical sessions from one workspace. This short tour walks through the controls teams use during live procedures and post-op review.",
      position: "center",
    },
    {
      id: "live-status",
      target: '[data-tour="live-status"]',
      title: "Live session status",
      body:
        "Track the current session state, connected participants, sync health, and active layout version here. This is the first place to check before making changes during a procedure.",
      position: "bottom",
      tab: "Live",
    },
    {
      id: "layout-tools",
      target: '[data-tour="layout-tools"]',
      title: "Session and layout controls",
      body:
        "Join a session, create a draft, apply layout presets, and switch grid modes from this control strip. It is optimized for rapid changes while the procedure is in progress.",
      position: "bottom",
      tab: "Live",
    },
    {
      id: "sources",
      target: '[data-tour="sources-panel"]',
      title: "Source catalog",
      body:
        "Select or drag sources like the endoscope, microscope, PTZ camera, and monitor capture into the live grid. Status labels show which feeds are live, muted, or already in use.",
      position: "bottom",
      tab: "Live",
    },
    {
      id: "grid",
      target: '[data-tour="live-grid"]',
      title: "Live display grid",
      body:
        "This is the shared surgical canvas. Place sources into panels, swap them during the case, and sync the layout across participants in real time.",
      position: "top",
      tab: "Live",
    },
    {
      id: "utilities",
      target: '[data-tour="quick-actions"]',
      title: "Patient info, chat, and shortcuts",
      body:
        "The quick actions open patient notes, live chat, and the keyboard shortcut reference. These tools stay accessible without leaving the active procedure view.",
      position: "left",
      tab: "Live",
    },
  ];

  if (role !== "viewer") {
    baseSteps.push(
      {
        id: "archive",
        target: '[data-tour="archive-panel"]',
        title: "Session archive",
        body:
          "Review completed procedures, filter by surgeon and date, and inspect recorded sources. Archive is where teams revisit sessions for handoff, teaching, and documentation.",
        position: "center",
        tab: "Archive",
      },
      {
        id: "analytics",
        target: '[data-tour="analytics-panel"]',
        title: "Operational analytics",
        body:
          "Analytics summarizes session volume, source utilization, latency, stalls, and engagement so the team can spot quality trends across recent cases.",
        position: "center",
        tab: "Analytics",
      },
    );
  }

  baseSteps.push({
    id: "finish",
    target: "#tour-guide-button",
    title: "Replay this guide anytime",
    body:
      "Use the Guide button in the top bar to reopen this walkthrough. On first visit it starts automatically, and you can also force it with the ?tour=1 query parameter.",
    position: "bottom",
  });

  return baseSteps;
}

export default function OnboardingModal({ onClose, currentTab, setCurrentTab, role = "surgeon" }) {
  const steps = useMemo(() => buildSteps(role), [role]);
  const [stepIndex, setStepIndex] = useState(0);
  const [layout, setLayout] = useState({
    rect: null,
    tooltipStyle: {},
    showSpotlight: false,
  });
  const tooltipRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const focusables = getFocusableElements(tooltipRef.current);
    focusables[0]?.focus();

    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const currentStep = steps[stepIndex];
    if (!currentStep?.tab || currentTab === currentStep.tab) return;
    setCurrentTab?.(currentStep.tab);
  }, [currentTab, setCurrentTab, stepIndex, steps]);

  useEffect(() => {
    let cancelled = false;

    const syncLayout = async () => {
      const currentStep = steps[stepIndex];
      if (!currentStep) return;

      await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
      await new Promise((resolve) => setTimeout(resolve, currentStep.tab ? 120 : 0));

      const target = currentStep.target
        ? Array.from(document.querySelectorAll(currentStep.target)).find(isVisibleTarget) ||
          document.querySelector(currentStep.target)
        : null;

      if (target && isVisibleTarget(target)) {
        target.style.scrollMarginTop = window.matchMedia(MOBILE_TOUR_QUERY).matches ? "92px" : "120px";
        target.scrollIntoView({
          behavior: "smooth",
          block: window.matchMedia(MOBILE_TOUR_QUERY).matches ? "start" : "center",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, target ? 320 : 0));
      if (cancelled) return;

      const rect = target && isVisibleTarget(target) ? target.getBoundingClientRect() : null;
      const nextLayout = getLayout(rect, currentStep.position, tooltipRef.current);
      setLayout(nextLayout);
    };

    syncLayout();

    const handleResize = () => {
      syncLayout();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
    };
  }, [stepIndex, steps]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTour(onClose);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setStepIndex((current) => Math.min(current + 1, steps.length - 1));
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStepIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Tab") {
        const focusables = getFocusableElements(tooltipRef.current);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, steps.length]);

  const currentStep = steps[stepIndex];
  const spotlightStyle =
    layout.showSpotlight && layout.rect
      ? {
          top: `${layout.rect.top - PAD}px`,
          left: `${layout.rect.left - PAD}px`,
          width: `${layout.rect.width + PAD * 2}px`,
          height: `${layout.rect.height + PAD * 2}px`,
        }
      : undefined;

  return (
    <>
      <div className="ls-tour-blocker" aria-hidden="true" />
      <div
        className="ls-tour-spotlight"
        aria-hidden="true"
        style={{
          display: layout.showSpotlight ? "block" : "none",
          ...spotlightStyle,
        }}
      />

      <section
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
        aria-labelledby="ls-tour-title"
        aria-describedby="ls-tour-body"
        className="ls-tour-tooltip"
        style={layout.tooltipStyle}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#93c5fd]">
              Product Tour
            </div>
            <h2 id="ls-tour-title" className="mt-2 text-[15px] font-semibold text-slate-100">
              {currentStep.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => finishTour(onClose)}
            className="rounded-md border border-transparent bg-transparent p-0 text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          id="ls-tour-body"
          className="text-sm leading-6 text-slate-300"
        >
          {currentStep.body}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {stepIndex + 1} / {steps.length}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
              disabled={stepIndex === 0}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-slate-400 transition hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (stepIndex === steps.length - 1) {
                  finishTour(onClose);
                  return;
                }
                setStepIndex((current) => Math.min(current + 1, steps.length - 1));
              }}
              className="rounded-lg border border-[#2563eb] bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93c5fd]"
            >
              {stepIndex === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function getLayout(rect, position, tooltipElement) {
  const mobile = window.matchMedia(MOBILE_TOUR_QUERY).matches;

  if (mobile) {
    return {
      rect,
      showSpotlight: false,
      tooltipStyle: {
        inset: "auto 0 0 0",
        maxWidth: "none",
        width: "auto",
        borderRadius: "18px 18px 0 0",
        padding: "18px 18px calc(18px + env(safe-area-inset-bottom, 0px))",
        fontSize: "13px",
        maxHeight: "min(72vh, 620px)",
        overflow: "auto",
      },
    };
  }

  const tooltipWidth = tooltipElement?.offsetWidth || 360;
  const tooltipHeight = tooltipElement?.offsetHeight || 180;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top;
  let left;

  if (!rect || position === "center") {
    top = Math.max(16, (viewportHeight - tooltipHeight) / 2);
    left = Math.max(16, (viewportWidth - tooltipWidth) / 2);
  } else if (position === "top") {
    top = rect.top - PAD - tooltipHeight - 14;
    left = Math.max(16, Math.min(rect.left, viewportWidth - tooltipWidth - 16));
  } else if (position === "left") {
    top = Math.max(16, Math.min(rect.top, viewportHeight - tooltipHeight - 16));
    left = rect.left - tooltipWidth - PAD - 14;
  } else {
    top = rect.bottom + PAD + 14;
    left = Math.max(16, Math.min(rect.left, viewportWidth - tooltipWidth - 16));
  }

  top = Math.max(16, Math.min(top, viewportHeight - tooltipHeight - 16));
  left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));

  return {
    rect,
    showSpotlight: Boolean(rect),
    tooltipStyle: {
      top: `${top}px`,
      left: `${left}px`,
      width: "calc(100vw - 32px)",
      maxWidth: "360px",
    },
  };
}

function finishTour(onClose) {
  try {
    localStorage.setItem(TOUR_KEY, "1");
    const url = new URL(window.location.href);
    url.searchParams.delete("tour");
    window.history.replaceState({}, "", url);
  } catch {
    // ignore
  }

  onClose?.();
}
