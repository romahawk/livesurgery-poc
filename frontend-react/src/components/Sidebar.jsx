import {
  Camera,
  Microscope,
  Video,
  Monitor,
  ArrowLeftRight,
  GripVertical,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const SOURCE_ICON = {
  endoscope: Camera,
  microscope: Microscope,
  ptz: Video,
  monitor: Monitor,
};

const STATUS_DOT = {
  live: "bg-emerald-400",
  offline: "bg-red-500",
  muted: "bg-amber-400",
};

const STATUS_PILL = {
  live: "border-green-600 text-green-700 bg-green-50",
  offline: "border-gray-300 text-gray-500 bg-gray-50",
  muted: "border-amber-500 text-amber-600 bg-amber-50",
};

function DraggableSource({ source, selected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `src-${source.id}`,
      data: { src: source.src, label: source.label },
    });

  const Icon = SOURCE_ICON[source.id] ?? Camera;
  const dotClass = STATUS_DOT[source.status] ?? STATUS_DOT.offline;
  const pillClass = STATUS_PILL[source.status] ?? STATUS_PILL.offline;

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.7 : 1,
      }
    : undefined;

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(source.src)}
      className={`source-item flex-1 flex items-center gap-2 rounded-md px-2 py-1 lg:px-2 lg:py-1.5 cursor-pointer ${
        selected ? "ring-2 ring-teal-400 ring-offset-2 ring-offset-slate-900" : ""
      }`}
      className={`
        flex items-center justify-between gap-2
        rounded-lg border-default border px-3 py-2
        theme-panel text-sm
        w-full md:w-auto md:flex-none
        ${selected ? "ring-2 ring-teal-400" : ""}
    `}
      title="Click to select, drag from handle to a panel"
    >
      {/* Drag handle – only this part starts the drag */}
      <span
        {...listeners}
        {...attributes}
        className="hidden lg:inline-flex h-4 w-4 items-center justify-center text-subtle cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" aria-hidden />
      </span>

      {/* On mobile we don’t show handle separately, drag isn’t critical there */}
      <span className="lg:hidden">
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
      </span>

      {/* Icon again for desktop, next to handle */}
      <span className="hidden lg:inline-flex">
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
      </span>

      {/* Label – desktop only */}
      <span className="hidden lg:inline-flex flex-1 text-sm text-default truncate">
        {source.label}
      </span>

      {/* Mobile: status dot */}
      <span
        className={`block lg:hidden h-2.5 w-2.5 rounded-full ${dotClass}`}
        aria-hidden
      />

      {/* Desktop: status pill */}
      <span
        className={`hidden lg:inline-flex text-[10px] px-2 py-0.5 rounded-full border ${pillClass}`}
      >
        {source.status}
      </span>
    </button>
  );
}

export default function Sidebar({ role, selectedSource, onSelectSource }) {
  const sources = [
    { id: "endoscope", label: "Endoscope", src: "endoscope.mp4", status: "live" },
    { id: "microscope", label: "Microscope", src: "microscope.mp4", status: "offline" },
    { id: "ptz", label: "PTZ Camera", src: "ptz.mp4", status: "muted" },
    {
      id: "monitor",
      label: "Monitor Capture",
      src: "vital_signs.mp4",
      status: "live",
    },
  ];

  return (
    <aside className="sources-panel w-full rounded-xl px-2 py-2 lg:px-2 lg:py-2 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-default" aria-hidden />
          <h2 className="text-sm lg:text-base font-semibold text-default">
            Sources
          </h2>
        </div>
      </div>

      {role === "viewer" ? (
        <p className="text-sm text-subtle">Viewing only</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => (
            <DraggableSource
              key={s.id}
              source={s}
              selected={selectedSource === s.src}
              onSelect={onSelectSource}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
