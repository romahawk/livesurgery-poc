import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayGrid from "./components/DisplayGrid";
import SessionControls from "./components/SessionControls";
import PatientInfoPanel, { PatientInfoButton } from "./components/PatientInfoPanel";
import LiveChatPanel, { LiveChatButton } from "./components/LiveChatPanel";
import ArchiveTab from "./components/ArchiveTab";
import AnalyticsTab from "./components/AnalyticsTab";
import OnboardingModal from "./components/OnboardingModal";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { UserCircle, MessageCircle } from "lucide-react";

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");

  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [patientHasUnsaved, setPatientHasUnsaved] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    id: "",
    age: "",
    notes: "",
  });

  const [sessionStatus, setSessionStatus] = useState("idle");
  const [chatMessages, setChatMessages] = useState([]);

  const [archiveSessions] = useState([
    {
      id: 1,
      surgeon: "Dr. Ivanov",
      procedure: "Laparoscopic Cholecystectomy",
      date: "2025-08-10",
      duration: "01:45:00",
    },
    {
      id: 2,
      surgeon: "Dr. Müller",
      procedure: "Neurosurgical Debridement",
      date: "2025-08-09",
      duration: "02:15:00",
    },
  ]);

  const [gridSources, setGridSources] = useState([null, null, null, null]);
  const [selectedSource, setSelectedSource] = useState(null); // src filename or null

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // onboarding
  useEffect(() => {
    try {
      const seen = localStorage.getItem("ls_onboarded") === "1";
      setHasOnboarded(seen);
      if (!seen) {
        const t = setTimeout(() => setShowOnboarding(true), 400);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  // drag & drop sensors
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeData = active.data.current || {};
    const overData = over.data.current || {};

    const targetIndex = overData.panelIndex;
    if (typeof targetIndex !== "number") return;

    setGridSources((prev) => {
      const next = [...prev];

      // 1) Drag from sidebar into panel
      if (activeData.src && active.id.toString().startsWith("src-")) {
        const src = activeData.src;

        // keep each source unique: remove from previous slot if exists
        const prevIndex = next.findIndex((s) => s === src);
        if (prevIndex !== -1 && prevIndex !== targetIndex) {
          next[prevIndex] = null;
        }

        next[targetIndex] = src;
        return next;
      }

      // 2) Drag between panels to rearrange
      if (typeof activeData.panelIndex === "number") {
        const from = activeData.panelIndex;
        const to = targetIndex;
        if (from === to) return prev;
        const tmp = next[from];
        next[from] = next[to];
        next[to] = tmp;
        return next;
      }

      return prev;
    });
  };

  // CLICK: select source in sidebar (always move highlight)
  const handleSelectSource = (src) => {
    setSelectedSource(src);
  };

  // CLICK: choose panel for selected source
  const handlePanelClick = (index) => {
    if (!selectedSource) return;

    setGridSources((prev) => {
      const next = [...prev];

      // keep source unique in matrix
      const prevIndex = next.findIndex((s) => s === selectedSource);
      if (prevIndex !== -1 && prevIndex !== index) {
        next[prevIndex] = null;
      }

      next[index] = selectedSource;
      return next;
    });
  };

  // session controls
  const handleStart = () => setSessionStatus("running");
  const handlePause = () => setSessionStatus("paused");
  const handleStop = () => setSessionStatus("stopped");

  // keyboard shortcuts (s / p / x / i / c) – ignore when typing
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.getAttribute?.("contenteditable") === "true"
      );
    };

    const onKey = (e) => {
      if (isTyping()) return;
      const key = e.key?.toLowerCase();
      if (key === "s") handleStart();
      else if (key === "p") handlePause();
      else if (key === "x") handleStop();
      else if (key === "i") setShowPatientInfoPanel(true);
      else if (key === "c") {
        setShowChatPanel(true);
        setUnreadCount(0);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-default flex flex-col">
      <Navbar
        role={role}
        setRole={setRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenOnboarding={() => setShowOnboarding(true)}
        showGuidePulse={!hasOnboarded}
      />

      {/* Mobile side buttons – bottom-right */}
      <div className="fixed right-3 bottom-3 z-30 flex flex-col gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setShowPatientInfoPanel(true)}
          className="rounded-full h-10 w-10 flex items-center justify-center theme-panel shadow"
          title="Patient Info"
        >
          <UserCircle className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setShowChatPanel(true);
            setUnreadCount(0);
          }}
          className="rounded-full h-10 w-10 flex items-center justify-center theme-panel shadow relative"
          title="Live Chat"
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-[10px] text-white px-1">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* MAIN SHELL */}
      <main className="flex-1 w-full px-4 py-4 sm:py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Outer layout */}
          <div className="flex flex-col gap-4 h-full min-h-[480px]">
            {/* LIVE tab: sources (2/3) + session (1/3) in one row on desktop */}
            {currentTab === "Live" && (
              <>
                {/* Header row */}
                <div className="grid gap-4 lg:grid-cols-3 items-stretch">
                  {/* Sources – 2/3 */}
                  <div className="lg:col-span-2">
                    <Sidebar
                      role={role}
                      selectedSource={selectedSource}
                      onSelectSource={handleSelectSource}
                    />
                  </div>

                  {/* Session – 1/3 (same height as Sources) */}
                  <div className="lg:col-span-1 theme-panel p-3 sm:p-4 shadow flex flex-col justify-center">
                    <SessionControls
                      onStart={handleStart}
                      onPause={handlePause}
                      onStop={handleStop}
                      status={sessionStatus}
                    />
                  </div>
                </div>

                {/* Patient / chat + 2×2 grid below, full width */}
                <div className="theme-panel p-3 sm:p-4 shadow flex flex-col flex-1 min-h-0 mt-4">
                  {/* Patient / Chat buttons */}
                  <div className="hidden lg:flex flex-wrap justify-end gap-2 mb-3">
                    <PatientInfoButton
                      onClick={() => setShowPatientInfoPanel(true)}
                      hasUnsaved={patientHasUnsaved}
                    />
                    <LiveChatButton
                      unread={unreadCount}
                      onClick={() => {
                        setShowChatPanel(true);
                        setUnreadCount(0);
                      }}
                    />
                  </div>

                  {/* 2×2 display grid */}
                  <div className="flex-1 min-h-0">
                    <DisplayGrid
                      gridSources={gridSources}
                      setGridSources={setGridSources}
                      selectedSource={selectedSource}
                      onPanelClick={handlePanelClick}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Archive / Analytics tabs keep old layout */}
            {currentTab === "Archive" && (
              <div className="flex flex-col lg:flex-row gap-4">
                <Sidebar
                  role={role}
                  selectedSource={selectedSource}
                  onSelectSource={handleSelectSource}
                />
                <div className="flex-1 theme-panel p-3 sm:p-4 shadow">
                  <ArchiveTab sessions={archiveSessions} />
                </div>
              </div>
            )}

            {currentTab === "Analytics" && (
              <div className="flex flex-col lg:flex-row gap-4">
                <Sidebar
                  role={role}
                  selectedSource={selectedSource}
                  onSelectSource={handleSelectSource}
                />
                <div className="flex-1 theme-panel p-3 sm:p-4 shadow">
                  <AnalyticsTab />
                </div>
              </div>
            )}
          </div>
        </DndContext>

        {/* Patient Info – slide from right */}
        {showPatientInfoPanel && (
          <div
            className="ls-slide-overlay"
            onClick={() => setShowPatientInfoPanel(false)}
          >
            <div
              className="ls-slide-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <PatientInfoPanel
                role={role}
                patientInfo={patientInfo}
                onUpdate={(info) => {
                  setPatientInfo(info);
                  setPatientHasUnsaved(false);
                  try {
                    localStorage.setItem("ls_onboarded", "1");
                    setHasOnboarded(true);
                  } catch {}
                }}
                onClose={() => setShowPatientInfoPanel(false)}
                onDirtyChange={setPatientHasUnsaved}
              />
            </div>
          </div>
        )}

        {/* Live Chat – slide from right */}
        {showChatPanel && (
          <div
            className="ls-slide-overlay"
            onClick={() => {
              setShowChatPanel(false);
              setUnreadCount(0);
            }}
          >
            <div
              className="ls-slide-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <LiveChatPanel
                role={role}
                messages={chatMessages}
                onSendMessage={(text) => {
                  const msg = { sender: role, text };
                  setChatMessages((prev) => [...prev, msg]);
                  if (!showChatPanel) setUnreadCount((n) => n + 1);
                  try {
                    localStorage.setItem("ls_onboarded", "1");
                    setHasOnboarded(true);
                  } catch {}
                }}
                onClose={() => {
                  setShowChatPanel(false);
                  setUnreadCount(0);
                }}
              />
            </div>
          </div>
        )}
      </main>

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
