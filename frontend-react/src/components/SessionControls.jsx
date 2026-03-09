import { useState, useEffect, useRef } from "react";
import { Clock4, Play, Pause, Square, Circle } from "lucide-react";

export default function SessionControls({
  onStart,
  onPause,
  onStop,
  status,
  canControl = true,
  readOnlyReason = "Only Surgeon/Admin can control the session.",
  hideActions = false,
}) {
  const [timer, setTimer] = useState(() => {
    const savedStart = localStorage.getItem("ls_session_start");
    const savedOffset = localStorage.getItem("ls_session_offset");

    if (savedStart) {
      // Session running earlier
      const start = parseInt(savedStart, 10);
      const offset = parseInt(savedOffset || "0", 10);
      return Math.floor((Date.now() - start) / 1000) + offset;
    }

    return 0;
  });

  const intervalRef = useRef(null);
  // Stable ref so the effect can read the current timer without re-running on every tick
  const timerRef = useRef(timer);
  timerRef.current = timer;

  useEffect(() => {
    if (status === "running") {
      // If starting fresh, record the start time
      if (!localStorage.getItem("ls_session_start")) {
        localStorage.setItem("ls_session_start", Date.now().toString());
        localStorage.setItem("ls_session_offset", timerRef.current.toString());
      }

      intervalRef.current = setInterval(() => {
        const start = parseInt(localStorage.getItem("ls_session_start"), 10);
        const offset = parseInt(localStorage.getItem("ls_session_offset"), 10);
        const elapsed = Math.floor((Date.now() - start) / 1000) + offset;
        setTimer(elapsed);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [status]);

  const handleStop = () => {
    onStop();
    setTimer(0);
    localStorage.removeItem("ls_session_start");
    localStorage.removeItem("ls_session_offset");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startLabel = status === "paused" ? "Resume" : "Start";

  return (
    <div className="controls-bar" data-status={status}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timer / status */}
        <div className="text-xs sm:text-sm inline-flex items-center gap-2 text-default">
          {status === "running" ? (
            <span className="inline-flex items-center gap-1.5 text-rose-400">
              <Circle className="h-2.5 w-2.5 fill-rose-500 text-rose-500 animate-pulse" aria-hidden />
              <span className="font-bold tracking-widest text-[10px] uppercase">Live</span>
            </span>
          ) : status === "paused" ? (
            <span className="inline-flex items-center gap-1.5 text-amber-400">
              <Pause className="h-3 w-3 fill-amber-400" aria-hidden />
              <span className="font-bold tracking-widest text-[10px] uppercase">Paused</span>
            </span>
          ) : (
            <Clock4 className="h-4 w-4 text-subtle" aria-hidden />
          )}
          <span className="text-subtle font-medium">Session</span>
          <span
            className={
              status === "running"
                ? "tabular-nums font-mono font-semibold text-emerald-400"
                : status === "paused"
                ? "tabular-nums font-mono font-semibold text-amber-300"
                : "tabular-nums font-mono text-subtle"
            }
          >
            {formatTime(timer)}
          </span>
        </div>

        {!hideActions && (
          <>
            {/* Divider */}
            <div className="hidden sm:block w-px self-stretch bg-border opacity-60" aria-hidden />

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                className={`btn btn-start${status !== "running" && canControl ? " btn-active" : ""}`}
                onClick={() => {
                  if (!canControl) return;
                  onStart();
                  if (!localStorage.getItem("ls_session_start")) {
                    localStorage.setItem("ls_session_start", Date.now().toString());
                    localStorage.setItem("ls_session_offset", "0");
                  }
                }}
                disabled={!canControl || status === "running"}
                title={!canControl ? readOnlyReason : `${startLabel} session (S)`}
                aria-label={startLabel}
              >
                <Play className="h-4 w-4" />
                {startLabel}
                <kbd className="btn-kbd">S</kbd>
              </button>

              <button
                className={`btn btn-pause${status === "running" && canControl ? " btn-active" : ""}`}
                onClick={() => {
                  if (!canControl) return;
                  onPause();
                  localStorage.setItem("ls_session_offset", timer.toString());
                  localStorage.removeItem("ls_session_start");
                }}
                disabled={!canControl || status !== "running"}
                title={!canControl ? readOnlyReason : "Pause session (P)"}
                aria-label="Pause"
              >
                <Pause className="h-4 w-4" />
                Pause
                <kbd className="btn-kbd">P</kbd>
              </button>

              <button
                className="btn btn-stop"
                onClick={() => canControl && handleStop()}
                disabled={!canControl}
                title={!canControl ? readOnlyReason : "End session (X)"}
                aria-label="Stop"
              >
                <Square className="h-4 w-4" />
                Stop
                <kbd className="btn-kbd">X</kbd>
              </button>
            </div>
          </>
        )}
        {hideActions && !canControl && (
          <div className="text-xs text-subtle">{readOnlyReason}</div>
        )}
      </div>
    </div>
  );
}
