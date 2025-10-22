import { useState, useEffect } from "react";
import { Clock4, Play, Pause, Square } from "lucide-react";

export default function SessionControls({ onStart, onPause, onStop, status }) {
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    if (status === "running") {
      const id = setInterval(() => setTimer((prev) => prev + 1), 1000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
            onClick={onStart}
            disabled={status === "running"}
            title="Start (S)"
          >
            <Play className="h-4 w-4" />
            Start
          </button>

          <button
            className="btn btn-pause"
            onClick={onPause}
            disabled={status !== "running"}
            title="Pause (P)"
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>

          <button
            className="btn btn-stop"
            onClick={() => { onStop(); setTimer(0); }}
            title="Stop (X)"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
