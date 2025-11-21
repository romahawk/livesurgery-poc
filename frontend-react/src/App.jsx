import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DisplayGrid from "./components/DisplayGrid";
import SessionControls from "./components/SessionControls";
import PatientInfoPanel from "./components/PatientInfoPanel";
import LiveChatPanel from "./components/LiveChatPanel";
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

  const [gridSources, setGridSources] = useState([null, null, null, null]);
  const [selectedSource, setSelectedSource] = useState(null);

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

      // from sidebar → panel
      if (activeData.src && active.id.toString().startsWith("src-")) {
        const src = activeData.src;
        const prevIndex = next.findIndex((s) => s === src);
        if (prevIndex !== -1 && prevIndex !== targetIndex) {
          next[prevIndex] = null;
        }
        next[targetIndex] = src;
        return next;
      }

      // between panels
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

  // select source in sidebar
  const handleSelectSource = (src) => {
    setSelectedSource(src);
  };

  // click empty panel to place selected source
  const handlePanelClick = (index) => {
    if (!selectedSource) return;

    setGridSources((prev) => {
      const next = [...prev];
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

  // keyboard shortcuts
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

      {/* Patient Info & Chat – floating bottom-right for ALL breakpoints */}
      <div className="fixed right-3 bottom-3 z-30 flex flex-col gap-2">
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

      {/* MAIN */}
      <main className="flex-1 w-full px-4 py-4 sm:py-6 flex flex-col min-h-0 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex flex-col min-h-0">
            <div className="theme-panel p-3 sm:p-4 shadow flex flex-col gap-4 flex-1 min-h-0">
              {currentTab === "Live" && (
                <>
                  {/* TOP ROW: Sources (2/3) + Session controls (1/3) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2">
                      <Sidebar
                        role={role}
                        selectedSource={selectedSource}
                        onSelectSource={handleSelectSource}
                      />
                    </div>
                    <div>
                      <SessionControls
                        onStart={handleStart}
                        onPause={handlePause}
                        onStop={handleStop}
                        status={sessionStatus}
                      />
                    </div>
                  </div>

                  {/* GRID */}
                  <div className="flex-1 min-h-[260px] lg:min-h-0">
                    <DisplayGrid
                      gridSources={gridSources}
                      setGridSources={setGridSources}
                      selectedSource={selectedSource}
                      onPanelClick={handlePanelClick}
                    />
                  </div>
                </>
              )}
              {currentTab === "Archive" && <ArchiveTab />}
              {currentTab === "Analytics" && <AnalyticsTab />}
            </div>
          </div>
        </DndContext>
      </main>

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
