import { useState, useEffect } from "react";
import { Clock4, Play, Pause, Square } from "lucide-react";

export default function SessionControls({ onStart, onPause, onStop, status, onTogglePatientInfo }) {
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
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 bg-white rounded-xl border mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm inline-flex items-center gap-2">
          <Clock4 className="h-4 w-4" aria-hidden />
          <strong>Session Time:</strong>
          <span>{formatTime(timer)}</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            onClick={onStart}
            disabled={status === "running"}
          >
            <Play className="h-4 w-4" />
            Start
          </button>

          <button
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded"
            onClick={onPause}
            disabled={status !== "running"}
          >
            <Pause className="h-4 w-4" />
            Pause
          </button>

          <button
            className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded"
            onClick={() => {
              onStop();
              setTimer(0);
            }}
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
