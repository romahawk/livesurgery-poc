export default function Sidebar({ role }) {
  const sources = [
    { id: "endoscope", label: "🔍 Endoscope", src: "endoscope.mp4" },
    { id: "microscope", label: "🔬 Microscope", src: "microscope.mp4" },
    { id: "ptz", label: "📹 PTZ Camera", src: "ptz.mp4" },
    { id: "monitor", label: "🖥️ Monitor Capture", src: "monitor.mp4" },
  ];

  return (
    <aside className="w-64 bg-gray-200 p-4 rounded h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">🎛 Sources</h2>

      {role === "viewer" ? (
        <p className="text-sm text-gray-500">Viewing only</p>
      ) : (
        <div className="space-y-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-white p-2 rounded shadow cursor-move border hover:bg-blue-50"
              draggable
              data-src={source.src}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", source.src);
              }}
            >
              {source.label}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
