import React, { useState } from "react";
import { LayoutDashboard, X } from "lucide-react";

export default function DisplayGrid() {
  const [gridSources, setGridSources] = useState([null, null, null, null]);

  const handleDrop = (index, e) => {
    e.preventDefault();
    const droppedSrc = e.dataTransfer.getData("text/plain");
    if (!droppedSrc) return;
    setGridSources((prev) => {
      const updated = [...prev];
      updated[index] = droppedSrc;
      return updated;
    });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemove = (index) => {
    setGridSources((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const renderVideo = (src, index) => (
    <div className="relative w-full h-full">
      <video
        key={src}
        src={`videos/${src}`}
        className="w-full h-full object-contain rounded-xl"
        controls
        autoPlay
        loop
      />
      <button
        onClick={() => handleRemove(index)}
        className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 backdrop-blur rounded-md px-2 py-1 text-xs text-red-600 border hover:bg-red-50"
        aria-label="Remove source"
        title="Remove"
      >
        <X className="h-3.5 w-3.5" />
        Remove
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 p-4 flex-1">
      {gridSources.map((src, index) => (
        <div
          key={index}
          onDrop={(e) => handleDrop(index, e)}
          onDragOver={handleDragOver}
          className="rounded-xl h-64 flex items-center justify-center bg-white relative border-2 border-dashed border-gray-300"
        >
          {src ? (
            renderVideo(src, index)
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <LayoutDashboard className="h-6 w-6 mb-1" aria-hidden />
              <span>Drop Source Here</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
