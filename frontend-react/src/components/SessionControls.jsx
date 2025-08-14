import { useState, useEffect } from "react";

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
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 bg-white rounded shadow mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm">
          <strong>Session Time:</strong> <span>{formatTime(timer)}</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            onClick={onStart}
            disabled={status === "running"}
          >
            Start
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
            onClick={onPause}
            disabled={status !== "running"}
          >
            Pause
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            onClick={() => {
              onStop();
              setTimer(0);
            }}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
