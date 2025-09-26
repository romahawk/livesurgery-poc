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

/* === dnd-kit === */
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");

  // Panels
  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  // Badges
  const [unreadCount, setUnreadCount] = useState(0);
  const [patientHasUnsaved, setPatientHasUnsaved] = useState(false);

  // Patient info data
  const [patientInfo, setPatientInfo] = useState({ name: "", id: "", age: "", notes: "" });

  // Session state
  const [sessionStatus, setSessionStatus] = useState("idle"); // "idle" | "running" | "paused" | "stopped"

  // Chat messages
  const [chatMessages, setChatMessages] = useState([]);

  // Archive mock (visible on Archive tab)
  const [archiveSessions] = useState([
    { id: 1, surgeon: "Dr. Ivanov", procedure: "Laparoscopic Cholecystectomy", date: "2025-08-10", duration: "01:45:00" },
    { id: 2, surgeon: "Dr. Müller", procedure: "Neurosurgical Debridement", date: "2025-08-09", duration: "02:15:00" },
  ]);

  /* === GRID SOURCES LIVE STATE (connect Sidebar + Grid) === */
  const [gridSources, setGridSources] = useState([null, null, null, null]); // filenames: "endoscope.mp4", etc.

  /* === Onboarding state === */
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("ls_onboarded") === "1";
      setHasOnboarded(seen);
      if (!seen) {
        // Open once for first-time users
        const t = setTimeout(() => setShowOnboarding(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      /* no-op */
    }
  }, []);

  /* === dnd-kit sensors & handler === */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }) // small drag threshold
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    // Draggables set data: {src, label}; Droppables set data: {panelIndex}
    const filename = active?.data?.current?.src;
    const panelIndex = over?.data?.current?.panelIndex;

    if (filename && typeof panelIndex === "number") {
      setGridSources((prev) => {
        const next = [...prev];
        next[panelIndex] = filename;
        return next;
      });
    }
  };

  // Session controls
  const handleStart = () => setSessionStatus("running");
  const handlePause = () => setSessionStatus("paused");
  const handleStop = () => setSessionStatus("stopped");

  /* === Hotkeys: S(start) / P(pause) / X(stop) / I(info) / C(chat) === */
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
  }, [handleStart, handlePause, handleStop]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar
        role={role}
        setRole={setRole}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenOnboarding={() => setShowOnboarding(true)}
        showGuidePulse={!hasOnboarded}
      />

      <main className="flex-1 w-full flex px-4 py-6">
        {/* Wrap Sidebar + Grid in a single DndContext so they share drag state */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Sidebar role={role} />

          <div className="flex-1 bg-white ml-4 p-4 rounded shadow relative">
            {currentTab === "Live" && (
              <>
                {/* Session controls */}
                <SessionControls
                  onStart={handleStart}
                  onPause={handlePause}
                  onStop={handleStop}
                  status={sessionStatus}
                />

                {/* Header action buttons */}
                <div className="flex justify-end gap-2 mb-2">
                  <PatientInfoButton onClick={() => setShowPatientInfoPanel(true)} hasUnsaved={patientHasUnsaved} />
                  <LiveChatButton
                    onClick={() => {
                      setShowChatPanel(true);
                      setUnreadCount(0);
                    }}
                  />
                </div>

                {/* 2x2 grid */}
                <DisplayGrid gridSources={gridSources} setGridSources={setGridSources} />
              </>
            )}

            {currentTab === "Archive" && <ArchiveTab sessions={archiveSessions} />}
            {currentTab === "Analytics" && <AnalyticsTab />}
          </div>
        </DndContext>

        {/* Side panels */}
        {showPatientInfoPanel && (
          <PatientInfoPanel
            role={role}
            patientInfo={patientInfo}
            onUpdate={(info) => {
              setPatientInfo(info);
              setPatientHasUnsaved(false);
              try { localStorage.setItem("ls_onboarded", "1"); setHasOnboarded(true); } catch {}
            }}
            onClose={() => setShowPatientInfoPanel(false)}
            onDirtyChange={setPatientHasUnsaved}
          />
        )}

        {showChatPanel && (
          <LiveChatPanel
            role={role}
            messages={chatMessages}
            onSendMessage={(text) => {
              const msg = { sender: role, text };
              setChatMessages((prev) => [...prev, msg]);
              if (!showChatPanel) setUnreadCount((n) => n + 1);
              try { localStorage.setItem("ls_onboarded", "1"); setHasOnboarded(true); } catch {}
            }}
            onClose={() => {
              setShowChatPanel(false);
              setUnreadCount(0);
            }}
          />
        )}
      </main>

      {/* Onboarding modal */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
