import React, { useState } from "react";
import { LayoutDashboard, X, Maximize2 } from "lucide-react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

export default function DisplayGrid({
  gridSources = [null, null, null, null],
  setGridSources,
  selectedSource,
  onPanelClick,
}) {
  const [fitMode, setFitMode] = useState([
    "contain",
    "contain",
    "contain",
    "contain",
  ]);

  const handleRemove = (index) => {
    setGridSources?.((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  const toggleFit = (index) => {
    setFitMode((prev) =>
      prev.map((m, i) =>
        i === index ? (m === "contain" ? "cover" : "contain") : m
      )
    );
  };

  const toggleFullscreen = (el) => {
    if (!document.fullscreenElement) el?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const Panel = ({ src, index }) => {
    const { isOver, setNodeRef: setDropRef } = useDroppable({
      id: `panel-${index}`,
      data: { panelIndex: index },
    });

    const {
      attributes,
      listeners,
      setNodeRef: setDragRef,
      transform,
      isDragging,
    } = useDraggable({
      id: `panel-drag-${index}`,
      data: { panelIndex: index },
      disabled: !src, // only draggable when filled
    });

    const style = transform
      ? {
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.85 : 1,
        }
      : undefined;

    const combinedRef = (node) => {
      setDropRef(node);
      setDragRef(node);
    };

    const handlePanelClick = () => {
      if (!src && selectedSource && onPanelClick) {
        onPanelClick(index);
      }
    };

    return (
      <div
        ref={combinedRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handlePanelClick}
        onDoubleClick={(e) => src && toggleFullscreen(e.currentTarget)}
        className={`
          relative rounded-xl flex items-center justify-center border-2 border-dashed transition theme-panel
          ${isOver ? "border-blue-400 bg-blue-50" : ""}
          ${src ? "cursor-move" : selectedSource ? "cursor-pointer" : "cursor-default"}
          min-h-[120px] sm:min-h-[160px] lg:min-h-0 lg:h-full
        `}
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
              onError={(e) =>
                console.warn(
                  "Video failed:",
                  `/videos/${src}`,
                  e.currentTarget?.error
                )
              }
            />

            {/* Toolbar */}
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => toggleFit(index)}
                className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border-default border bg-surface text-default hover:opacity-90"
                title={fitMode[index] === "contain" ? "Fill" : "Fit"}
              >
                {fitMode[index] === "contain" ? "Fill" : "Fit"}
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) =>
                  toggleFullscreen(e.currentTarget.closest("div"))
                }
                className="hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border-default border bg-surface text-default hover:opacity-90"
                title="Full screen (double-tap)"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => handleRemove(index)}
                className="inline-flex items-center justify-center rounded-md px-2 py-1 text-xs border-default border text-red-600 bg-surface hover:bg-red-50"
                title="Remove source"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-subtle pointer-events-none select-none px-2 text-xs sm:text-sm">
            <LayoutDashboard className="h-5 w-5 mb-1" aria-hidden />
            <span>
              {selectedSource
                ? "Tap to place selected source"
                : "Drop Source Here"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 h-auto lg:h-full lg:min-h-0 lg:[grid-template-rows:1fr_1fr]">
      {gridSources.map((src, index) => (
        <Panel key={index} src={src} index={index} />
      ))}
    </div>
  );
}
