import React, { useState } from "react";
import { LayoutDashboard, X, Maximize2 } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

export default function DisplayGrid({ gridSources = [null, null, null, null], setGridSources }) {
  const [fitMode, setFitMode] = useState(["contain", "contain", "contain", "contain"]); // "contain" | "cover"

  const handleRemove = (index) => {
    setGridSources?.((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const toggleFit = (index) => {
    setFitMode((prev) => prev.map((m, i) => (i === index ? (m === "contain" ? "cover" : "contain") : m)));
  };

  const toggleFullscreen = (el) => {
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const Panel = ({ src, index }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `panel-${index}`,
      data: { panelIndex: index },
    });

    return (
      <div
        ref={setNodeRef}
        onDoubleClick={(e) => toggleFullscreen(e.currentTarget)}
        className={`relative rounded-xl h-64 flex items-center justify-center border-2 border-dashed transition theme-panel
          ${isOver ? "border-blue-400 bg-blue-50" : ""}`}
      >
        {src ? (
          <>
            <video
              key={src}
              src={`/videos/${src}`}
              className="w-full h-full rounded-xl"
              style={{ objectFit: fitMode[index] }}
              controls
              autoPlay
              muted
              playsInline
              loop
              onError={(e) => console.warn("Video failed:", `/videos/${src}`, e.currentTarget?.error)}
            />
            {/* Hover toolbar */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition">
              <button
                onClick={() => toggleFit(index)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border-default border bg-surface text-default hover:opacity-90"
                title={fitMode[index] === "contain" ? "Fill" : "Fit"}
              >
                {fitMode[index] === "contain" ? "Fill" : "Fit"}
              </button>
              <button
                onClick={(e) => toggleFullscreen(e.currentTarget.closest("div"))}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border-default border bg-surface text-default hover:opacity-90"
                title="Full screen (double-click)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleRemove(index)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border-default border text-red-600 bg-surface hover:bg-red-50"
                title="Remove source"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-subtle pointer-events-none select-none">
            <LayoutDashboard className="h-6 w-6 mb-1" aria-hidden />
            <span>{isOver ? "Release to place" : "Drop Source Here"}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 flex-1">
      {gridSources.map((src, index) => (
        <Panel key={index} src={src} index={index} />
      ))}
    </div>
  );
}
