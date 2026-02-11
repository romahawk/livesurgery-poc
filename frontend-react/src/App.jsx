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
import { createSession, endSession, listSessions, startSession } from "./api/sessions";

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
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [gridSources, setGridSources] = useState([null, null, null, null]);
  const [selectedSource, setSelectedSource] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const refreshSessions = async (roleForRequest = role) => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const data = await listSessions(roleForRequest);
      setSessions(data.items || []);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    try {
      const seen = localStorage.getItem("ls_onboarded") === "1";
      setHasOnboarded(seen);
      if (!seen) {
        const t = setTimeout(() => setShowOnboarding(true), 400);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshSessions(role);
  }, [role]);

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

      if (activeData.src && active.id.toString().startsWith("src-")) {
        const src = activeData.src;
        const prevIndex = next.findIndex((s) => s === src);
        if (prevIndex !== -1 && prevIndex !== targetIndex) {
          next[prevIndex] = null;
        }
        next[targetIndex] = src;
        return next;
      }

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

  const handleSelectSource = (src) => {
    setSelectedSource(src);
  };

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

  const handleStart = async () => {
    try {
      let sessionId = activeSessionId;
      if (!sessionId) {
        const created = await createSession(role, `Live Session ${new Date().toISOString()}`);
        sessionId = created.id;
        setActiveSessionId(sessionId);
      }
      await startSession(role, sessionId);
      setSessionStatus("running");
      await refreshSessions(role);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Could not start session");
    }
  };

  const handlePause = () => setSessionStatus("paused");

  const handleStop = async () => {
    try {
      if (activeSessionId) {
        await endSession(role, activeSessionId);
      }
      setSessionStatus("stopped");
      await refreshSessions(role);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Could not stop session");
    }
  };

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
  }, [activeSessionId, role]);

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

      <main className="flex-1 w-full px-4 py-4 sm:py-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="hidden lg:flex flex-col gap-4 h-full min-h-[480px]">
            {currentTab === "Live" && (
              <>
                <div className="grid gap-4 lg:grid-cols-3 items-stretch">
                  <div className="lg:col-span-2">
                    <Sidebar
                      role={role}
                      selectedSource={selectedSource}
                      onSelectSource={handleSelectSource}
                    />
                  </div>

                  <div className="lg:col-span-1 theme-panel p-3 sm:p-4 shadow flex flex-col justify-center">
                    <SessionControls
                      onStart={handleStart}
                      onPause={handlePause}
                      onStop={handleStop}
                      status={sessionStatus}
                    />
                  </div>
                </div>

                <div className="theme-panel p-3 sm:p-4 shadow flex flex-col flex-1 min-h-0 mt-4">
                  <div className="ls-live-grid-shell">
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

            {currentTab === "Archive" && (
              <div className="theme-panel p-3 sm:p-4 shadow flex-1 min-h-0">
                <ArchiveTab
                  sessions={sessions}
                  loading={sessionsLoading}
                  error={sessionsError}
                />
              </div>
            )}

            {currentTab === "Analytics" && (
              <div className="theme-panel p-3 sm:p-4 shadow flex-1 min-h-0">
                <AnalyticsTab />
              </div>
            )}
          </div>

          <div className="flex flex-col lg:hidden gap-4 h-full min-h-[480px]">
            {currentTab === "Live" && (
              <>
                <Sidebar
                  role={role}
                  selectedSource={selectedSource}
                  onSelectSource={handleSelectSource}
                />

                <div className="flex-1 theme-panel p-3 sm:p-4 shadow relative flex flex-col min-h-0">
                  <div className="theme-panel p-3 sm:p-4 mb-3">
                    <SessionControls
                      onStart={handleStart}
                      onPause={handlePause}
                      onStop={handleStop}
                      status={sessionStatus}
                    />
                  </div>

                  <div className="mt-3">
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

            {currentTab === "Archive" && (
              <div className="flex-1 theme-panel p-3 sm:p-4 shadow flex flex-col min-h-0">
                <ArchiveTab
                  sessions={sessions}
                  loading={sessionsLoading}
                  error={sessionsError}
                />
              </div>
            )}

            {currentTab === "Analytics" && (
              <div className="flex-1 theme-panel p-3 sm:p-4 shadow flex flex-col min-h-0">
                <AnalyticsTab />
              </div>
            )}
          </div>
        </DndContext>

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
                  } catch {
                    // ignore
                  }
                }}
                onClose={() => setShowPatientInfoPanel(false)}
                onDirtyChange={setPatientHasUnsaved}
              />
            </div>
          </div>
        )}

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
                  } catch {
                    // ignore
                  }
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
