import { useCallback, useEffect, useRef, useState } from "react";
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
import { isFirebaseConfigured } from "./lib/firebase";
import {
  fbCreateSession,
  fbEndSession,
  fbGetLayout,
  fbJoinSession,
  fbListSessions,
  fbPublishLayout,
  fbStartSession,
  fbPauseSession,
  fbSubscribeLayout,
  fbSubscribeParticipants,
  getLocalUserId,
} from "./api/firebaseService";

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { UserCircle, MessageCircle, CheckCircle2, AlertCircle, Users, Wifi, WifiOff, LayoutDashboard, X, Keyboard } from "lucide-react";

const EMPTY_GRID = [null, null, null, null];
const CATALOG_SOURCES = ["endoscope.mp4", "microscope.mp4", "ptz.mp4", "vital_signs.mp4"];

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

function normalizeSessionStatus(rawStatus) {
  const normalized = String(rawStatus || "").trim().toUpperCase();
  if (normalized === "LIVE" || normalized === "ACTIVE" || normalized === "RUNNING") return "running";
  if (normalized === "PAUSED") return "paused";
  if (normalized === "ENDED" || normalized === "STOPPED" || normalized === "COMPLETED") return "stopped";
  if (normalized === "DRAFT" || normalized === "IDLE" || normalized === "CREATED" || normalized === "") return "idle";
  return normalized.toLowerCase();
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
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [gridSources, setGridSources] = useState(EMPTY_GRID);
  const [layoutMode, setLayoutMode] = useState("2x2");
  const [selectedSource, setSelectedSource] = useState(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [layoutSyncError, setLayoutSyncError] = useState("");
  const [presenceCount, setPresenceCount] = useState(0);
  const [, setWsConnected] = useState(false);
  const [wsState, setWsState] = useState("offline");
  const [wsReconnectCount, setWsReconnectCount] = useState(0);
  const [wsReconnectTick, setWsReconnectTick] = useState(0);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [canUndoLayout, setCanUndoLayout] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [followPresenter, setFollowPresenter] = useState(true);
  const [queuedPresenterLayout, setQueuedPresenterLayout] = useState(null);

  const wsRef = useRef(null);
  const layoutVersionRef = useRef(0);
  const publishQueueRef = useRef(Promise.resolve());
  const toastSeqRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const layoutHistoryRef = useRef([]);
  const followPresenterRef = useRef(followPresenter);
  const wsReconnectCountRef = useRef(wsReconnectCount);
  const canControlSession = role !== "viewer";
  const canEditLayout = role !== "viewer";
  const syncLabel =
    wsState === "connected"
      ? "Connected"
      : wsState === "connecting"
        ? "Connecting"
        : wsState === "reconnecting"
          ? `Reconnecting${wsReconnectCount > 0 ? ` (${wsReconnectCount})` : ""}`
          : "Offline";
  const syncClass =
    wsState === "connected"
      ? "text-emerald-300"
      : wsState === "connecting" || wsState === "reconnecting"
        ? "text-amber-300"
        : "text-red-400";

  useEffect(() => {
    followPresenterRef.current = followPresenter;
  }, [followPresenter]);

  useEffect(() => {
    layoutVersionRef.current = layoutVersion;
  }, [layoutVersion]);

  useEffect(() => {
    wsReconnectCountRef.current = wsReconnectCount;
  }, [wsReconnectCount]);

  const applyRemoteLayout = (version, layout) => {
    layoutVersionRef.current = version;
    setLayoutVersion(version);
    setGridSources(layoutToGrid(layout));
    layoutHistoryRef.current = [];
    setCanUndoLayout(false);
  };

  const pushToast = (kind, message) => {
    const id = `${Date.now()}-${toastSeqRef.current++}`;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const refreshSessions = useCallback(async (roleForRequest = role) => {
    setSessionsLoading(true);
    setSessionsError("");
    try {
      const data = isFirebaseConfigured
        ? await fbListSessions()
        : await listSessions(roleForRequest);
      setSessions(data.items || []);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Failed to load sessions");
    } finally {
      setSessionsLoading(false);
    }
  }, [role]);

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
  }, [role, refreshSessions]);

  useEffect(() => {
    if (role !== "viewer") {
      setFollowPresenter(true);
      setQueuedPresenterLayout(null);
    }
  }, [role]);

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedSessionId("");
      if (!activeSessionId) setSessionStatus("idle");
      return;
    }

    const hasSelected = sessions.some((s) => s.id === selectedSessionId);
    if (!hasSelected) {
      const preferred = sessions.find((s) => normalizeSessionStatus(s.status) === "running") || sessions[0];
      setSelectedSessionId(preferred.id);
    }

    if (activeSessionId) {
      const active = sessions.find((s) => s.id === activeSessionId);
      if (active) {
        setSessionStatus(normalizeSessionStatus(active.status));
      }
    }
  }, [sessions, selectedSessionId, activeSessionId]);

  useEffect(() => {
    // ── Firebase realtime path ──────────────────────────────────────────────
    if (isFirebaseConfigured) {
      if (!activeSessionId) {
        setWsState("offline");
        setPresenceCount(0);
        return;
      }

      setWsState("connecting");
      const uid = getLocalUserId(role);
      let unsubLayout = null;
      let unsubParticipants = null;
      let disposed = false;

      (async () => {
        try {
          // Register presence
          await fbJoinSession(activeSessionId, uid, role);
          if (disposed) return;

          // Load initial layout snapshot
          const initialLayout = await fbGetLayout(activeSessionId);
          if (disposed) return;
          applyRemoteLayout(initialLayout.version, initialLayout.layout);

          // Subscribe to live layout updates
          unsubLayout = fbSubscribeLayout(activeSessionId, (data) => {
            if (disposed) return;
            const nextRemote = { version: data.version || 0, layout: data.layout || { panels: [] } };
            if (role === "viewer" && !followPresenterRef.current) {
              setQueuedPresenterLayout(nextRemote);
              return;
            }
            applyRemoteLayout(nextRemote.version, nextRemote.layout);
            setQueuedPresenterLayout(null);
            setLayoutSyncError("");
          });

          // Subscribe to participant count
          unsubParticipants = fbSubscribeParticipants(activeSessionId, (count) => {
            if (!disposed) setPresenceCount(count);
          });

          if (!disposed) {
            setWsConnected(true);
            setWsState("connected");
          }
        } catch (err) {
          if (!disposed) {
            setWsState("disconnected");
            setLayoutSyncError(err instanceof Error ? err.message : "Firebase sync unavailable.");
            pushToast("error", "Firebase sync unavailable");
          }
        }
      })();

      return () => {
        disposed = true;
        if (unsubLayout) unsubLayout();
        if (unsubParticipants) unsubParticipants();
        setWsConnected(false);
      };
    }

    // ── Original WebSocket path (backend fallback) ──────────────────────────
    let disposed = false;

    const scheduleReconnect = () => {
      if (disposed || !activeSessionId) return;
      setWsState("reconnecting");
      setWsReconnectCount((prev) => {
        const next = prev + 1;
        const delayMs = Math.min(10000, 1000 * Math.pow(2, Math.max(0, next - 1)));
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          if (!disposed) setWsReconnectTick((tick) => tick + 1);
        }, delayMs);
        return next;
      });
    };

    const run = async () => {
      if (!activeSessionId) {
        setWsConnected(false);
        setWsState("offline");
        setPresenceCount(0);
        return;
      }

      setWsState(wsReconnectCountRef.current > 0 ? "reconnecting" : "connecting");
      try {
        const join = await joinSession(role, activeSessionId);
        const layout = await getLayout(role, activeSessionId);
        if (disposed) return;
        applyRemoteLayout(layout.version, layout.layout);

        const wsBase = String(join?.realtime?.wsUrl || "").replace(/^http/i, "ws");
        const wsToken = join?.realtime?.token;
        if (!wsBase || !wsToken) {
          setWsState("offline");
          return;
        }

        const ws = new WebSocket(`${wsBase}?token=${encodeURIComponent(wsToken)}`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (disposed) return;
          clearTimeout(reconnectTimerRef.current);
          setWsConnected(true);
          setWsState("connected");
          if (wsReconnectCountRef.current > 0) pushToast("success", "Realtime reconnected");
          setWsReconnectCount(0);
        };
        ws.onclose = () => {
          if (disposed) return;
          setWsConnected(false);
          scheduleReconnect();
        };
        ws.onerror = () => {
          if (disposed) return;
          setWsConnected(false);
        };
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "layout.snapshot" || message.type === "layout.updated") {
              const payload = message.payload || {};
              const nextRemote = { version: payload.version || 0, layout: payload.layout || { panels: [] } };
              if (role === "viewer" && message.type === "layout.updated" && !followPresenterRef.current) {
                setQueuedPresenterLayout(nextRemote);
                return;
              }
              applyRemoteLayout(nextRemote.version, nextRemote.layout);
              setQueuedPresenterLayout(null);
              setLayoutSyncError("");
            } else if (message.type === "layout.conflict") {
              const payload = message.payload || {};
              applyRemoteLayout(payload.version || 0, payload.layout || { panels: [] });
              setLayoutSyncError("Layout conflict resolved with latest server version.");
              pushToast("warning", "Layout conflict resolved to latest version");
            } else if (message.type === "presence.updated") {
              setPresenceCount(Number(message?.payload?.participants || 0));
            }
          } catch {
            // ignore malformed messages
          }
        };
      } catch (err) {
        if (disposed) return;
        setLayoutSyncError(err instanceof Error ? err.message : "Realtime sync unavailable.");
        if (wsReconnectCountRef.current === 0) pushToast("error", "Realtime sync unavailable");
        scheduleReconnect();
      }
    };

    run();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimerRef.current);
      const ws = wsRef.current;
      if (ws) ws.close();
      wsRef.current = null;
      setWsConnected(false);
    };
  }, [activeSessionId, role, wsReconnectTick]);

  const publishGridChange = async (previousGrid, nextGrid) => {
    if (!activeSessionId || role === "viewer") return;
    const baseVersion = layoutVersionRef.current;
    try {
      const response = isFirebaseConfigured
        ? await fbPublishLayout(activeSessionId, baseVersion, gridToLayout(nextGrid))
        : await publishLayout(role, activeSessionId, baseVersion, gridToLayout(nextGrid));
      const nextVersion = response?.version ?? baseVersion;
      layoutVersionRef.current = nextVersion;
      setLayoutVersion(nextVersion);
      setLayoutSyncError("");
    } catch (err) {
      if (!isFirebaseConfigured && (err?.status === 409 || err?.code === "LAYOUT_VERSION_CONFLICT") && activeSessionId) {
        try {
          const latest = await getLayout(role, activeSessionId);
          applyRemoteLayout(latest.version, latest.layout);
          setLayoutSyncError("Layout conflict resolved with latest server version.");
          pushToast("warning", "Layout conflict resolved with server state");
          return;
        } catch {
          // fall through to rollback
        }
      }
      setGridSources(previousGrid);
      setLayoutSyncError(err instanceof Error ? err.message : "Failed to sync layout.");
      pushToast("error", "Layout sync failed");
    }
  };

  const queuePublish = (previousGrid, nextGrid) => {
    publishQueueRef.current = publishQueueRef.current.then(() =>
      publishGridChange(previousGrid, nextGrid)
    );
  };

  const updateGridSources = (updater, { publish = true, trackHistory = true } = {}) => {
    let previousSnapshot = null;
    let nextSnapshot = null;
    setGridSources((prev) => {
      previousSnapshot = [...prev];
      nextSnapshot = typeof updater === "function" ? updater(prev) : updater;
      if (trackHistory && JSON.stringify(previousSnapshot) !== JSON.stringify(nextSnapshot)) {
        layoutHistoryRef.current = [...layoutHistoryRef.current.slice(-19), previousSnapshot];
        setCanUndoLayout(layoutHistoryRef.current.length > 0);
      }
      return nextSnapshot;
    });

    if (!publish) return;
    Promise.resolve().then(() => {
      if (!nextSnapshot || !previousSnapshot) return;
      queuePublish(previousSnapshot, [...nextSnapshot]);
    });
  };

  const resolvePrimarySource = () =>
    selectedSource || gridSources.find((s) => !!s) || "endoscope.mp4";

  const applyLayoutPreset = (presetId) => {
    if (!canEditLayout) return;
    const primary = resolvePrimarySource();
    const next =
      presetId === "quad"
        ? [...CATALOG_SOURCES]
        : presetId === "focus"
          ? [primary, primary, "vital_signs.mp4", null]
          : presetId === "teaching"
            ? ["endoscope.mp4", "vital_signs.mp4", "ptz.mp4", null]
            : EMPTY_GRID;
    const nextMode =
      presetId === "teaching" ? "3x1" : presetId === "focus" ? "1x1" : "2x2";
    setLayoutMode(nextMode);
    setActivePreset(presetId === "clear" ? null : presetId);
    updateGridSources(next, { publish: true, trackHistory: true });
    pushToast("success", `Layout preset applied: ${presetId}`);
  };

  const handleLayoutModeChange = (mode) => {
    if (!canEditLayout) return;
    setLayoutMode(mode);
    pushToast("success", `Layout mode set to ${mode}`);
  };

  const handleUndoLayout = () => {
    if (!canEditLayout || layoutHistoryRef.current.length === 0) return;
    const previous = layoutHistoryRef.current[layoutHistoryRef.current.length - 1];
    layoutHistoryRef.current = layoutHistoryRef.current.slice(0, -1);
    setCanUndoLayout(layoutHistoryRef.current.length > 0);
    setActivePreset(null);
    updateGridSources(previous, { publish: true, trackHistory: false });
    pushToast("success", "Layout undo applied");
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over) return;
    setActivePreset(null);

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
    if (!canEditLayout) return;
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
    if (!canControlSession) return;
    try {
      let sessionId = activeSessionId || selectedSessionId;
      if (!sessionId) {
        const created = isFirebaseConfigured
          ? await fbCreateSession(`Live Session ${new Date().toLocaleString()}`)
          : await createSession(role, `Live Session ${new Date().toISOString()}`);
        sessionId = created.id;
        setSelectedSessionId(sessionId);
        setActiveSessionId(sessionId);
      }
      if (isFirebaseConfigured) {
        await fbStartSession(sessionId);
      } else {
        await startSession(role, sessionId);
      }
      setSessionStatus("running");
      await refreshSessions(role);
      pushToast("success", "Session started");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not start session";
      console.error("[handleStart]", err);
      setSessionsError(msg);
      pushToast("error", msg);
    }
  };

  const handleJoinSelectedSession = async () => {
    if (!selectedSessionId) {
      pushToast("warning", "Select a session to join");
      return;
    }
    const selected = sessions.find((s) => s.id === selectedSessionId);
    setActiveSessionId(selectedSessionId);
    setWsReconnectCount(0);
    setWsReconnectTick((tick) => tick + 1);
    setSessionStatus(normalizeSessionStatus(selected?.status));
    pushToast("success", "Joined session");
  };

  const handleCreateSessionDraft = async () => {
    if (!canControlSession) return;
    try {
      const created = isFirebaseConfigured
        ? await fbCreateSession(`Live Session ${new Date().toLocaleString()}`)
        : await createSession(role, `Live Session ${new Date().toISOString()}`);
      await refreshSessions(role);
      setSelectedSessionId(created.id);
      setActiveSessionId(created.id);
      setSessionStatus("idle");
      pushToast("success", "New session created");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create session");
    }
  };

  const handlePause = async () => {
    setSessionStatus("paused");
    if (isFirebaseConfigured && activeSessionId) {
      try { await fbPauseSession(activeSessionId); } catch { /* non-critical */ }
    }
  };

  const handleStop = async () => {
    if (!canControlSession) return;
    try {
      if (activeSessionId) {
        if (isFirebaseConfigured) {
          await fbEndSession(activeSessionId);
        } else {
          await endSession(role, activeSessionId);
        }
      }
      setSessionStatus("stopped");
      await refreshSessions(role);
      pushToast("success", "Session stopped");
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : "Could not stop session");
      pushToast("error", "Could not stop session");
    }
  };

  const handleQuickAssign = (panelIndex) => {
    if (!canEditLayout || !selectedSource) return;
    handlePanelClick(panelIndex);
  };

  const handleToggleFollowPresenter = () => {
    if (role !== "viewer") return;
    const next = !followPresenter;
    setFollowPresenter(next);
    if (next && queuedPresenterLayout) {
      applyRemoteLayout(queuedPresenterLayout.version, queuedPresenterLayout.layout);
      setQueuedPresenterLayout(null);
      pushToast("success", "Synced to presenter layout");
    } else {
      pushToast("success", next ? "Presenter follow enabled" : "Presenter follow paused");
    }
  };

  const handleSyncNow = () => {
    if (!queuedPresenterLayout) return;
    applyRemoteLayout(queuedPresenterLayout.version, queuedPresenterLayout.layout);
    setQueuedPresenterLayout(null);
    pushToast("success", "Synced latest presenter layout");
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
      if (e.key === "Escape") { setShowShortcutsHelp(false); return; }
      if (isTyping()) return;
      const key = e.key?.toLowerCase();
      if (key === "s") handleStart();
      else if (key === "p") handlePause();
      else if (key === "x") handleStop();
      else if (key === "i") setShowPatientInfoPanel(true);
      else if (key === "c") {
        setShowChatPanel(true);
        setUnreadCount(0);
      } else if (key === "?") setShowShortcutsHelp((v) => !v);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-surface text-default flex flex-col">
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
          onClick={() => setShowShortcutsHelp((v) => !v)}
          className="rounded-full h-8 w-8 flex items-center justify-center theme-panel shadow text-subtle hover:text-default transition-colors"
          title="Keyboard shortcuts (?)"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>
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

      {/* WS disconnect / reconnect sticky banner */}
      {wsState !== "connected" && wsState !== "connecting" && (
        <div className={`sticky top-0 z-40 flex items-center justify-center gap-2 py-1 px-3 text-xs ${
          wsState === "reconnecting"
            ? "bg-amber-950/80 border-b border-amber-700/40 text-amber-300"
            : "bg-red-950/80 border-b border-red-700/40 text-red-300"
        } backdrop-blur-sm`}>
          <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {wsState === "reconnecting"
            ? `Reconnecting${wsReconnectCount > 0 ? ` (${wsReconnectCount})` : ""}… changes will not sync`
            : "WebSocket offline — changes will not sync"}
        </div>
      )}

      {/* Keyboard shortcuts help overlay */}
      {showShortcutsHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShortcutsHelp(false)}
        >
          <div
            className="theme-panel rounded-xl p-5 shadow-2xl w-72"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-subtle" aria-hidden />
                <h3 className="font-semibold text-default text-sm">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="text-subtle hover:text-default transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
              {[
                ["S", "Start session"],
                ["P", "Pause session"],
                ["X", "Stop session"],
                ["I", "Patient info"],
                ["C", "Live chat"],
                ["?", "Toggle this help"],
                ["Esc", "Close panels"],
              ].map(([key, desc]) => (
                <React.Fragment key={key}>
                  <kbd className="badge-btn font-mono text-xs text-center min-w-[2rem] justify-center">{key}</kbd>
                  <dd className="text-subtle self-center m-0">{desc}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </div>
      )}

      <main className="flex-1 w-full px-4 py-4 sm:py-6 lg:py-2 lg:overflow-hidden">
        {toasts.length > 0 && (
          <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`ls-toast pointer-events-auto rounded-lg shadow-lg border px-3 py-2.5 text-sm flex items-center gap-2.5 bg-surface ${
                  toast.kind === "error"
                    ? "border-red-500/40 text-red-400"
                    : toast.kind === "warning"
                      ? "border-amber-500/40 text-amber-300"
                      : "border-emerald-500/40 text-emerald-400"
                }`}
              >
                {toast.kind === "error" ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : toast.kind === "warning" ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                <span className="text-default flex-1 text-xs sm:text-sm">{toast.message}</span>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="shrink-0 text-subtle hover:text-default transition-colors"
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="hidden lg:flex flex-col gap-2 h-full min-h-0 overflow-hidden">
            {currentTab === "Live" && (
              <>
                <div className="theme-panel p-1.5 sm:p-2 border-default border">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
                    {/* Session status badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium ${sessionStatus === "running" ? "text-emerald-400 border-emerald-500/50" : "text-amber-300 border-amber-500/40"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sessionStatus === "running" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} aria-hidden />
                      {sessionStatus.toUpperCase()}
                    </span>
                    <span className="text-subtle">Role:</span>
                    <span className="badge-btn">{role}</span>
                    <span className="text-subtle">Session:</span>
                    <span className="font-mono text-default">{activeSessionId ? activeSessionId.slice(0, 8) : "none"}</span>
                    {/* Participants */}
                    <span className="inline-flex items-center gap-1 text-subtle">
                      <Users className="h-3 w-3" aria-hidden />
                      <span className="text-default">{presenceCount}</span>
                    </span>
                    {/* Sync status */}
                    <span className={`inline-flex items-center gap-1 ${syncClass}`}>
                      {wsState === "connected" ? (
                        <Wifi className="h-3 w-3" aria-hidden />
                      ) : (
                        <WifiOff className="h-3 w-3" aria-hidden />
                      )}
                      {syncLabel}
                    </span>
                    {/* Layout version */}
                    <span className="inline-flex items-center gap-1 text-subtle">
                      <LayoutDashboard className="h-3 w-3" aria-hidden />
                      <span className="text-default">v{layoutVersion} · {layoutMode}</span>
                    </span>
                  </div>
                  {layoutSyncError && <div className="text-xs text-red-400 mt-1">{layoutSyncError}</div>}
                  {role === "viewer" && (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs border-default border rounded-md px-2 py-1">
                      <span className="text-amber-300 font-medium">Read-only mode</span>
                      <span className="text-subtle">You can observe but not control session/layout.</span>
                      <button className="badge-btn text-xs" onClick={handleToggleFollowPresenter}>
                        {followPresenter ? "Presenter follow: ON" : "Presenter follow: OFF"}
                      </button>
                      <button
                        className="badge-btn text-xs"
                        onClick={handleSyncNow}
                        disabled={!queuedPresenterLayout}
                      >
                        Sync now
                      </button>
                    </div>
                  )}
                </div>

                <div className="theme-panel p-2 border-default border">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-subtle">Session</span>
                    <select
                      className="searchbar rounded px-2 py-1 text-xs min-w-[260px]"
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                    >
                      <option value="">Select session</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} [{s.status}] ({s.id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                    <button
                      className="badge-btn text-xs"
                      onClick={handleJoinSelectedSession}
                      disabled={!selectedSessionId}
                    >
                      Join
                    </button>
                    {canControlSession && (
                      <button
                        className="badge-btn text-xs"
                        onClick={handleCreateSessionDraft}
                        title="Create new draft session"
                      >
                        New Session
                      </button>
                    )}
                  </div>
                  {canEditLayout && (
                    <>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-subtle">Layout actions</span>
                        {[
                          { id: "quad", label: "Quad" },
                          { id: "focus", label: "Focus" },
                          { id: "teaching", label: "Teaching" },
                        ].map(({ id, label }) => (
                          <button
                            key={id}
                            className={`badge-btn text-xs ${activePreset === id ? "ring-1 ring-teal-400 text-teal-400" : ""}`}
                            onClick={() => applyLayoutPreset(id)}
                          >
                            {label}
                          </button>
                        ))}
                        <button className="badge-btn text-xs" onClick={() => applyLayoutPreset("clear")}>Reset</button>
                        <button className="badge-btn text-xs" onClick={handleUndoLayout} disabled={!canUndoLayout}>Undo</button>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-subtle">Grid</span>
                        {["2x2", "3x1", "1x3", "1x1"].map((mode) => (
                          <button
                            key={mode}
                            className={`badge-btn text-xs ${layoutMode === mode ? "ring-1 ring-teal-400" : ""}`}
                            onClick={() => handleLayoutModeChange(mode)}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="grid gap-2 lg:grid-cols-3 items-stretch">
                  <div className="lg:col-span-2">
                    <Sidebar
                      role={role}
                      selectedSource={selectedSource}
                      onSelectSource={handleSelectSource}
                    />
                    {selectedSource && canEditLayout && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-subtle">Assign:</span>
                        {[0, 1, 2, 3].map((idx) => (
                          <button
                            key={idx}
                            className="badge-btn text-xs"
                            onClick={() => handleQuickAssign(idx)}
                          >
                            P{idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1 theme-panel p-2 sm:p-2.5 shadow flex flex-col justify-center">
                    <SessionControls
                      onStart={handleStart}
                      onPause={handlePause}
                      onStop={handleStop}
                      status={sessionStatus}
                      canControl={canControlSession}
                      readOnlyReason="Viewer role cannot control the session."
                      hideActions={!canControlSession}
                    />
                  </div>
                </div>

                <div className="theme-panel p-2 sm:p-2.5 shadow flex flex-col flex-1 min-h-0 mt-2">
                  <div className="ls-live-grid-shell">
                    <DisplayGrid
                      gridSources={gridSources}
                      setGridSources={updateGridSources}
                      selectedSource={selectedSource}
                      onPanelClick={handlePanelClick}
                      readOnly={!canEditLayout}
                      layoutMode={layoutMode}
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
                <div className="theme-panel p-2 sm:p-3 border-default border">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
                    {/* Session status badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-medium ${sessionStatus === "running" ? "text-emerald-400 border-emerald-500/50" : "text-amber-300 border-amber-500/40"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sessionStatus === "running" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} aria-hidden />
                      {sessionStatus.toUpperCase()}
                    </span>
                    {/* Sync */}
                    <span className={`inline-flex items-center gap-1 ${syncClass}`}>
                      {wsState === "connected" ? <Wifi className="h-3 w-3" aria-hidden /> : <WifiOff className="h-3 w-3" aria-hidden />}
                      {syncLabel}
                    </span>
                    {/* Participants */}
                    <span className="inline-flex items-center gap-1 text-subtle">
                      <Users className="h-3 w-3" aria-hidden />
                      <span className="text-default">{presenceCount}</span>
                    </span>
                    {/* Layout */}
                    <span className="inline-flex items-center gap-1 text-subtle">
                      <LayoutDashboard className="h-3 w-3" aria-hidden />
                      <span className="text-default">v{layoutVersion} · {layoutMode}</span>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      className="searchbar rounded px-2 py-1 text-xs min-w-[220px]"
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                    >
                      <option value="">Select session</option>
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} [{s.status}]
                        </option>
                      ))}
                    </select>
                    <button
                      className="badge-btn text-xs"
                      onClick={handleJoinSelectedSession}
                      disabled={!selectedSessionId}
                    >
                      Join
                    </button>
                    {canEditLayout && (
                      <>
                        {[
                          { id: "quad", label: "Quad" },
                          { id: "focus", label: "Focus" },
                          { id: "teaching", label: "Teaching" },
                        ].map(({ id, label }) => (
                          <button
                            key={id}
                            className={`badge-btn text-xs ${activePreset === id ? "ring-1 ring-teal-400 text-teal-400" : ""}`}
                            onClick={() => applyLayoutPreset(id)}
                          >
                            {label}
                          </button>
                        ))}
                        <button className="badge-btn text-xs" onClick={() => applyLayoutPreset("clear")}>Reset</button>
                        <button className="badge-btn text-xs" onClick={handleUndoLayout} disabled={!canUndoLayout}>Undo</button>
                        {["2x2", "3x1", "1x3", "1x1"].map((mode) => (
                          <button
                            key={mode}
                            className={`badge-btn text-xs ${layoutMode === mode ? "ring-1 ring-teal-400" : ""}`}
                            onClick={() => handleLayoutModeChange(mode)}
                          >
                            {mode}
                          </button>
                        ))}
                      </>
                    )}
                    {role === "viewer" && (
                      <>
                        <button className="badge-btn text-xs" onClick={handleToggleFollowPresenter}>
                          {followPresenter ? "Follow ON" : "Follow OFF"}
                        </button>
                        <button className="badge-btn text-xs" onClick={handleSyncNow} disabled={!queuedPresenterLayout}>
                          Sync now
                        </button>
                      </>
                    )}
                  </div>
                  {role === "viewer" && (
                    <div className="mt-2 text-xs text-subtle">
                      Read-only mode enabled. Presenter controls layout.
                    </div>
                  )}
                </div>

                <Sidebar
                  role={role}
                  selectedSource={selectedSource}
                  onSelectSource={handleSelectSource}
                />
                {selectedSource && canEditLayout && (
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-subtle">Assign:</span>
                    {[0, 1, 2, 3].map((idx) => (
                      <button
                        key={idx}
                        className="badge-btn text-xs"
                        onClick={() => handleQuickAssign(idx)}
                      >
                        P{idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 theme-panel p-3 sm:p-4 shadow relative flex flex-col min-h-0">
                  <div className="theme-panel p-3 sm:p-4 mb-3">
                    <SessionControls
                      onStart={handleStart}
                      onPause={handlePause}
                      onStop={handleStop}
                      status={sessionStatus}
                      canControl={canControlSession}
                      readOnlyReason="Viewer role cannot control the session."
                      hideActions={!canControlSession}
                    />
                  </div>

                  <div className="mt-3">
                    <DisplayGrid
                      gridSources={gridSources}
                      setGridSources={updateGridSources}
                      selectedSource={selectedSource}
                      onPanelClick={handlePanelClick}
                      readOnly={!canEditLayout}
                      layoutMode={layoutMode}
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
