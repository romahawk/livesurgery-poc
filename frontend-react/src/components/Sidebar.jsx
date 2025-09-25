import { Camera, Microscope, Video, Monitor, ArrowLeftRight } from "lucide-react";

const SOURCE_ICON = {
  endoscope: Camera,
  microscope: Microscope,
  ptz: Video,
  monitor: Monitor,
};

export default function Sidebar({ role }) {
  const sources = [
    { id: "endoscope", label: "Endoscope", src: "endoscope.mp4" },
    { id: "microscope", label: "Microscope", src: "microscope.mp4" },
    { id: "ptz", label: "PTZ Camera", src: "ptz.mp4" },
    { id: "monitor", label: "Monitor Capture", src: "vital_signs.mp4" },
  ];

  return (
    <aside className="w-64 bg-gray-50 p-4 rounded-xl h-full overflow-y-auto border">
      <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5" aria-hidden />
        <span>Sources</span>
      </h2>

      {role === "viewer" ? (
        <p className="text-sm text-gray-500">Viewing only</p>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => {
            const Icon = SOURCE_ICON[source.id] ?? Camera;
            return (
              <div
                key={source.id}
                className="bg-white px-3 py-2 rounded-lg shadow-sm cursor-grab active:cursor-grabbing border hover:bg-blue-50 flex items-center gap-2"
                draggable
                data-src={source.src}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", source.src);
                }}
                title="Drag onto a display panel"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{source.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
