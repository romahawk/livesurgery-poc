import { Archive } from "lucide-react";

export default function ArchiveTab({ sessions }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 inline-flex items-center gap-2">
        <Archive className="h-5 w-5" aria-hidden />
        <span>Session Archive</span>
      </h2>

      {(!sessions || sessions.length === 0) ? (
        <p className="text-gray-500">No past sessions found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="[&>th]:px-4 [&>th]:py-2 text-left">
                <th>Surgeon</th>
                <th>Procedure</th>
                <th>Date</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50">
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
