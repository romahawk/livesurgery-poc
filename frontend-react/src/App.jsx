import { useEffect, useRef, useState } from "react";
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
  createSession,
  endSession,
  getLayout,
  joinSession,
  listSessions,
  publishLayout,
  startSession,
} from "./api/sessions";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { UserCircle, MessageCircle } from "lucide-react";

const EMPTY_GRID = [null, null, null, null];

function gridToLayout(gridSources) {
  return {
    panels: gridSources.map((src, idx) => ({
      id: `p${idx + 1}`,
      streamId: src ?? null,
    })),
  };
}

function layoutToGrid(layout) {
  const panelMap = new Map((layout?.panels || []).map((p) => [p.id, p.streamId ?? null]));
  return [1, 2, 3, 4].map((index) => panelMap.get(`p${index}`) ?? null);
}

export default function App() {
  const [role, setRole] = useState("surgeon");
  const [currentTab, setCurrentTab] = useState("Live");

  const [showPatientInfoPanel, setShowPatientInfoPanel] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const [gridSources, setGridSources] = useState(EMPTY_GRID);
  const [selectedSource, setSelectedSource] = useState(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [layoutSyncError, setLayoutSyncError] = useState("");
  const [presenceCount, setPresenceCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const wsRef = useRef(null);
  const layoutVersionRef = useRef(0);
  const publishQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    layoutVersionRef.current = layoutVersion;
  }, [layoutVersion]);

  const applyRemoteLayout = (version, layout) => {
    layoutVersionRef.current = version;
    setLayoutVersion(version);
    setGridSources(layoutToGrid(layout));
  };

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

  useEffect(() => {
    if (activeSessionId || sessions.length === 0) return;
    const preferred = sessions.find((s) => s.status === "LIVE") || sessions[0];
    setActiveSessionId(preferred.id);
    if (preferred.status === "LIVE") setSessionStatus("running");
  }, [sessions, activeSessionId]);

  useEffect(() => {
    const run = async () => {
      if (!activeSessionId) {
        setWsConnected(false);
        setPresenceCount(0);
        return;
      }
      try {
        const join = await joinSession(role, activeSessionId);
        const layout = await getLayout(role, activeSessionId);
        applyRemoteLayout(layout.version, layout.layout);

        const wsBase = String(join?.realtime?.wsUrl || "").replace(/^http/i, "ws");
        const wsToken = join?.realtime?.token;
        if (!wsBase || !wsToken) return;

        const ws = new WebSocket(`${wsBase}?token=${encodeURIComponent(wsToken)}`);
        wsRef.current = ws;

        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => setWsConnected(false);
        ws.onerror = () => setWsConnected(false);
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "layout.snapshot" || message.type === "layout.updated") {
              const payload = message.payload || {};
              applyRemoteLayout(payload.version || 0, payload.layout || { panels: [] });
              setLayoutSyncError("");
            } else if (message.type === "layout.conflict") {
              const payload = message.payload || {};
              applyRemoteLayout(payload.version || 0, payload.layout || { panels: [] });
              setLayoutSyncError("Layout conflict resolved with latest server version.");
            } else if (message.type === "presence.updated") {
              setPresenceCount(Number(message?.payload?.participants || 0));
            }
          } catch {
            // ignore malformed messages
          }
        };
      } catch (err) {
        setLayoutSyncError(err instanceof Error ? err.message : "Realtime sync unavailable.");
      }
    };

    run();

    return () => {
      const ws = wsRef.current;
      if (ws) ws.close();
      wsRef.current = null;
      setWsConnected(false);
    };
  }, [activeSessionId, role]);

  const publishGridChange = async (previousGrid, nextGrid) => {
    if (!activeSessionId || role === "viewer") return;
    const baseVersion = layoutVersionRef.current;
    try {
      const response = await publishLayout(role, activeSessionId, baseVersion, gridToLayout(nextGrid));
      const nextVersion = response?.version ?? baseVersion;
      layoutVersionRef.current = nextVersion;
      setLayoutVersion(nextVersion);
      setLayoutSyncError("");
    } catch (err) {
      if ((err?.status === 409 || err?.code === "LAYOUT_VERSION_CONFLICT") && activeSessionId) {
        try {
          const latest = await getLayout(role, activeSessionId);
          applyRemoteLayout(latest.version, latest.layout);
          setLayoutSyncError("Layout conflict resolved with latest server version.");
          return;
        } catch {
          // fall through to rollback
        }
      }
      setGridSources(previousGrid);
      setLayoutSyncError(err instanceof Error ? err.message : "Failed to sync layout.");
    }
  };

  const queuePublish = (previousGrid, nextGrid) => {
    publishQueueRef.current = publishQueueRef.current.then(() =>
      publishGridChange(previousGrid, nextGrid)
    );
  };

  const updateGridSources = (updater, { publish = true } = {}) => {
    let previousSnapshot = null;
    let nextSnapshot = null;
    setGridSources((prev) => {
      previousSnapshot = [...prev];
      nextSnapshot = typeof updater === "function" ? updater(prev) : updater;
      return nextSnapshot;
    });

    if (!publish) return;
    Promise.resolve().then(() => {
      if (!nextSnapshot || !previousSnapshot) return;
      queuePublish(previousSnapshot, [...nextSnapshot]);
    });
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeData = active.data.current || {};
    const overData = over.data.current || {};
    const targetIndex = overData.panelIndex;
    if (typeof targetIndex !== "number") return;

    updateGridSources((prev) => {
      const next = [...prev];

      if (activeData.src && active.id.toString().startsWith("src-")) {
        const src = activeData.src;
        const prevIndex = next.findIndex((s) => s === src);
        if (prevIndex !== -1 && prevIndex !== targetIndex) next[prevIndex] = null;
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
    updateGridSources((prev) => {
      const next = [...prev];
      const prevIndex = next.findIndex((s) => s === selectedSource);
      if (prevIndex !== -1 && prevIndex !== index) next[prevIndex] = null;
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
      if (activeSessionId) await endSession(role, activeSessionId);
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
  });

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
                    <div className="text-xs text-subtle px-1">
                      <div>Session: {activeSessionId ? activeSessionId.slice(0, 8) : "none"}</div>
                      <div>Layout: v{layoutVersion}</div>
                      <div>Participants: {presenceCount}</div>
                      <div>Realtime: {wsConnected ? "connected" : "offline"}</div>
                    </div>
                    {layoutSyncError && <div className="text-xs text-red-500 px-1 mt-1">{layoutSyncError}</div>}
                  </div>
                </div>

                <div className="theme-panel p-3 sm:p-4 shadow flex flex-col flex-1 min-h-0 mt-4">
                  <div className="ls-live-grid-shell">
                    <DisplayGrid
                      gridSources={gridSources}
                      setGridSources={updateGridSources}
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
                    <div className="text-xs text-subtle px-1">
                      <div>Layout: v{layoutVersion}</div>
                      <div>Participants: {presenceCount}</div>
                    </div>
                    {layoutSyncError && <div className="text-xs text-red-500 px-1 mt-1">{layoutSyncError}</div>}
                  </div>

                  <div className="mt-3">
                    <DisplayGrid
                      gridSources={gridSources}
                      setGridSources={updateGridSources}
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
                  try {
                    localStorage.setItem("ls_onboarded", "1");
                    setHasOnboarded(true);
                  } catch {
                    // ignore
                  }
                }}
                onClose={() => setShowPatientInfoPanel(false)}
                onDirtyChange={() => {}}
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
