import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayGrid from "./components/DisplayGrid";
import SessionControls from "./components/SessionControls";
import PatientInfoPanel, { PatientInfoButton } from "./components/PatientInfoPanel";
import LiveChatPanel, { LiveChatButton } from "./components/LiveChatPanel";
import ArchiveTab from "./components/ArchiveTab";
import AnalyticsTab from "./components/AnalyticsTab";

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

  /* === GRID SOURCES LIVE STATE (moved to App to connect Sidebar + Grid) === */
  const [gridSources, setGridSources] = useState([null, null, null, null]); // filenames: "endoscope.mp4", etc.

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar role={role} setRole={setRole} currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 w-full flex px-4 py-6">
        {/* Wrap Sidebar + Grid in a single DndContext so they share drag state */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Sidebar role={role} />

          <div className="flex-1 bg-white ml-4 p-4 rounded shadow relative">
            {currentTab === "Live" && (
              <>
                {/* Sticky controls with hotkeys (S/P/X and I/C) */}
                <SessionControls
                  onStart={handleStart}
                  onPause={handlePause}
                  onStop={handleStop}
                  status={sessionStatus}
                  onPatientInfo={() => setShowPatientInfoPanel(true)}
                  onLiveChat={() => {
                    setShowChatPanel(true);
                    setUnreadCount(0);
                  }}
                />

                {/* Header action buttons with badges */}
                <div className="flex justify-end gap-2 mb-2">
                  <PatientInfoButton onClick={() => setShowPatientInfoPanel(true)} hasUnsaved={patientHasUnsaved} />
                  <LiveChatButton
                    onClick={() => {
                      setShowChatPanel(true);
                      setUnreadCount(0);
                    }}
                    unreadCount={unreadCount}
                  />
                </div>

                {/* 2x2 grid (now controlled by App state) */}
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
            onUpdate={setPatientInfo}
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
            }}
            onClose={() => {
              setShowChatPanel(false);
              setUnreadCount(0);
            }}
          />
        )}
      </main>
    </div>
  );
}
