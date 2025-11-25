import { useState, useEffect, useRef } from "react";
import { Clock4, Play, Pause, Square } from "lucide-react";

export default function SessionControls({ onStart, onPause, onStop, status }) {
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

  useEffect(() => {
    if (status === "running") {
      // If starting fresh, record the start time
      if (!localStorage.getItem("ls_session_start")) {
        localStorage.setItem("ls_session_start", Date.now().toString());
        localStorage.setItem("ls_session_offset", timer.toString());
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

  return (
    <div className="p-4 theme-panel mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm inline-flex items-center gap-2 text-default">
          <Clock4 className="h-4 w-4" aria-hidden />
          <strong>Session Time:</strong>
          <span>{formatTime(timer)}</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            className="btn btn-start"
            onClick={() => {
              onStart();
              // Record start timestamp only when session begins
              if (!localStorage.getItem("ls_session_start")) {
                localStorage.setItem("ls_session_start", Date.now().toString());
                localStorage.setItem("ls_session_offset", "0");
              }
            }}
            disabled={status === "running"}
          >
            <Play className="h-4 w-4" />
            Start
          </button>

          <button
            className="btn btn-pause"
            onClick={() => {
              onPause();
              // Save current time as offset for later resume
              localStorage.setItem("ls_session_offset", timer.toString());
              localStorage.removeItem("ls_session_start");
            }}
            disabled={status !== "running"}
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>

          <button className="btn btn-stop" onClick={handleStop}>
            <Square className="h-4 w-4" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
