import { Camera, Microscope, Video, Monitor, ArrowLeftRight, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const SOURCE_ICON = { endoscope: Camera, microscope: Microscope, ptz: Video, monitor: Monitor };
const STATUS_STYLES = {
  live: "border-green-600 text-green-700 bg-green-50",
  offline: "border-gray-300 text-gray-500 bg-gray-50",
  muted: "border-amber-500 text-amber-600 bg-amber-50",
};

function DraggableSource({ source }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `src-${source.id}`,
    data: { src: source.src, label: source.label }, // carried by dnd-kit (no dataTransfer)
  });

  const Icon = SOURCE_ICON[source.id] ?? Camera;
  const statusClass = STATUS_STYLES[source.status] ?? STATUS_STYLES.offline;
  const style = transform ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.7 : 1 } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white px-3 py-2 rounded-lg shadow-sm border hover:bg-blue-50 flex items-center gap-2 cursor-grab active:cursor-grabbing"
      title="Drag onto a display panel"
    >
      <GripVertical className="h-4 w-4 text-gray-400" aria-hidden />
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="truncate flex-1">{source.label}</span>
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusClass}`}>{source.status}</span>
    </div>
  );
}

export default function Sidebar({ role }) {
  // Example statuses; wire to real device state later
  const sources = [
    { id: "endoscope", label: "Endoscope", src: "endoscope.mp4", status: "live" },
    { id: "microscope", label: "Microscope", src: "microscope.mp4", status: "offline" },
    { id: "ptz", label: "PTZ Camera", src: "ptz.mp4", status: "muted" },
    { id: "monitor", label: "Monitor Capture", src: "vital_signs.mp4", status: "live" },
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
          {sources.map((s) => (
            <DraggableSource key={s.id} source={s} />
          ))}
        </div>
      )}
    </aside>
  );
}
