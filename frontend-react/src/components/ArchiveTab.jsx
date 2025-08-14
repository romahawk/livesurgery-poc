export default function ArchiveTab({ sessions }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📂 Session Archive</h2>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No past sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Surgeon</th>
                <th className="px-4 py-2 text-left">Procedure</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.surgeon}</td>
                  <td className="px-4 py-2">{s.procedure}</td>
                  <td className="px-4 py-2">{s.date}</td>
                  <td className="px-4 py-2">{s.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
