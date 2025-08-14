import React, { useState } from "react";

const sources = [
  { id: "endoscope", label: "🔍 Endoscope", src: "endoscope.mp4" },
  { id: "microscope", label: "🔬 Microscope", src: "microscope.mp4" },
  { id: "ptz", label: "📹 PTZ Camera", src: "ptz.mp4" },
  { id: "monitor", label: "🖥️ Monitor Capture", src: "vital_signs.mp4" },
];

export default function DisplayGrid() {
  const [gridSources, setGridSources] = useState([null, null, null, null]);

  const handleDrop = (index, e) => {
    e.preventDefault();
    const droppedSrc = e.dataTransfer.getData("text/plain");
    setGridSources((prev) => {
      const updated = [...prev];
      updated[index] = droppedSrc;
      return updated;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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
        className="w-full h-full object-contain rounded"
        controls
        autoPlay
        loop
      />
      <button
        onClick={() => handleRemove(index)}
        className="absolute top-1 right-1 bg-white rounded px-2 py-1 text-xs text-red-500 border hover:bg-red-100"
      >
        ✕ Remove
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
          className="border-2 border-dashed border-gray-400 rounded h-64 flex items-center justify-center bg-white relative"
        >
          {src ? renderVideo(src, index) : (
            <span className="text-gray-400">Drop Source Here</span>
          )}
        </div>
      ))}
    </div>
  );
}
