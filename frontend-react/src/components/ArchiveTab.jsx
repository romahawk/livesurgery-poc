import { useMemo, useState } from "react";
import {
  Archive,
  Search,
  Calendar,
  Clock,
  User,
  HardDrive,
  PlayCircle,
  Download,
  FileText,
  BarChart3,
  Video,
  Monitor,
  Microscope,
  Camera,
  X,
} from "lucide-react";
import { archiveSessions } from "../data/archiveMock";

// utils
const fmtDate = (iso) =>
  new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtDuration = (sec) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const fmtSize = (mb) =>
  mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;

const SOURCE_ICON = {
  Endoscope: Camera,
  Microscope: Microscope,
  "PTZ Camera": Video,
  Monitor: Monitor,
  "Monitor Capture": Monitor,
};

const normalizeSession = (raw) => ({
  id: raw.id,
  surgeon: raw.surgeon || raw.createdBy || "N/A",
  procedure: raw.procedure || raw.title || "Untitled Session",
  date: raw.date || raw.updatedAt || raw.createdAt || new Date().toISOString(),
  durationSec: Number.isFinite(raw.durationSec) ? raw.durationSec : 0,
  sizeMB: Number.isFinite(raw.sizeMB) ? raw.sizeMB : 0,
  sources: Array.isArray(raw.sources) ? raw.sources : [],
});

export default function ArchiveTab({ sessions = archiveSessions, loading = false, error = null }) {
  const [query, setQuery] = useState("");
  const [surgeon, setSurgeon] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const surgeons = useMemo(
    () => ["all", ...Array.from(new Set(sessions.map((s) => normalizeSession(s).surgeon)))],
    [sessions]
  );

  // filters
  const filtered = useMemo(() => {
    let list = sessions.map(normalizeSession).sort((a, b) =>
      b.date.localeCompare(a.date)
    );
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.procedure.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }
    if (surgeon !== "all") list = list.filter((s) => s.surgeon === surgeon);
    if (from)
      list = list.filter(
        (s) => new Date(s.date).getTime() >= new Date(from).getTime()
      );
    if (to)
      list = list.filter(
        (s) =>
          new Date(s.date).getTime() <=
          new Date(to).getTime() + 86400000 - 1
      );
    return list;
  }, [query, surgeon, from, to, sessions]);

  // kpis from filtered
  const kpis = useMemo(() => {
    const totalDuration = filtered.reduce((a, s) => a + s.durationSec, 0);
    const totalSize = filtered.reduce((a, s) => a + s.sizeMB, 0);
    return {
      count: filtered.length,
      duration: fmtDuration(totalDuration),
      size: fmtSize(totalSize),
    };
  }, [filtered]);

  // pagination
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setQuery("");
    setSurgeon("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  // actions (mock)
  const onPlay = (row) => alert(`Play ${row.id}`);
  const onDownload = (row) => alert(`Download ${row.id}`);
  const onDetails = (row) => alert(`Details for ${row.id}`);
  const onAnalytics = (row) => alert(`Open analytics for ${row.id}`);

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold inline-flex items-center gap-2 text-default">
          <Archive className="h-5 w-5" aria-hidden />
          <span>Session Archive</span>
        </h2>
        {loading && <span className="text-xs text-subtle">Loading...</span>}
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Filters */}
      <div className="theme-panel p-3 sm:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
          {/* Search */}
          <div className="w-full lg:w-1/3">
            <label className="text-xs text-subtle mb-1 block">Search</label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-2.5 text-subtle" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Procedure or ID…"
                className="searchbar w-full rounded pl-8 pr-3 py-2"
              />
            </div>
          </div>

          {/* Surgeon */}
          <div className="w-full lg:w-1/4">
            <label className="text-xs text-subtle mb-1 block">Surgeon</label>
            <div className="relative">
              <User className="h-4 w-4 absolute left-2 top-2.5 text-subtle" />
              <select
                value={surgeon}
                onChange={(e) => {
                  setSurgeon(e.target.value);
                  setPage(1);
                }}
                className="searchbar w-full rounded pl-8 pr-3 py-2 bg-surface"
              >
                {surgeons.map((s) => (
                  <option key={s} value={s}>
                    {s === "all" ? "All" : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date from/to */}
          <div className="flex flex-col sm:flex-row w-full lg:w-1/3 gap-2">
            <div className="flex-1">
              <label className="text-xs text-subtle mb-1 block">From</label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-2 top-2.5 text-subtle" />
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  className="searchbar w-full rounded pl-8 pr-3 py-2"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-subtle mb-1 block">To</label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-2 top-2.5 text-subtle" />
                <input
                  type="date"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  className="searchbar w-full rounded pl-8 pr-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Clear */}
          <div className="flex gap-2 w-full lg:w-auto">
            <button
              onClick={clearFilters}
              className="badge-btn inline-flex items-center justify-center gap-2 w-full lg:w-auto"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Kpi icon={Archive} label="Sessions" value={kpis.count} />
        <Kpi icon={Clock} label="Total Duration" value={kpis.duration} />
        <Kpi icon={HardDrive} label="Total Size" value={kpis.size} />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {pageItems.map((row) => (
          <div key={row.id} className="theme-panel p-3 space-y-2">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-xs text-subtle font-mono">
                  {row.id}
                </div>
                <div className="text-sm font-semibold text-default">
                  {row.procedure}
                </div>
              </div>
              <div className="text-right text-xs text-subtle whitespace-nowrap">
                {fmtDate(row.date)}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-subtle gap-3">
              <div className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{row.surgeon}</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{fmtDuration(row.durationSec)}</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5" />
                <span>{fmtSize(row.sizeMB)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mt-1">
              {row.sources.map((s) => {
                const Icon = SOURCE_ICON[s] ?? Video;
                return (
                  <span
                    key={s}
                    className="badge-btn inline-flex items-center gap-1 text-[11px]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{s}</span>
                  </span>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <IconBtn
                icon={PlayCircle}
                label="Play"
                onClick={() => onPlay(row)}
              />
              <IconBtn
                icon={Download}
                label="Download"
                onClick={() => onDownload(row)}
              />
              <IconBtn
                icon={FileText}
                label="Details"
                onClick={() => onDetails(row)}
              />
              <IconBtn
                icon={BarChart3}
                label="Analytics"
                onClick={() => onAnalytics(row)}
              />
            </div>
          </div>
        ))}
        {pageItems.length === 0 && (
          <div className="theme-panel p-4 text-center text-subtle text-sm">
            No sessions match your filters.
          </div>
        )}
      </div>

      {/* Desktop / tablet table */}
      <div className="theme-panel overflow-x-auto hidden md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Procedure</th>
              <th>Surgeon</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Sources</th>
              <th>Size</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2 font-mono text-xs">{row.id}</td>
                <td className="px-3 py-2">{row.procedure}</td>
                <td className="px-3 py-2">{row.surgeon}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {fmtDate(row.date)}
                </td>
                <td className="px-3 py-2">
                  {fmtDuration(row.durationSec)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {row.sources.map((s) => {
                      const Icon = SOURCE_ICON[s] ?? Video;
                      return (
                        <span
                          key={s}
                          className="badge-btn inline-flex items-center gap-1"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="text-xs">{s}</span>
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-3 py-2">{fmtSize(row.sizeMB)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <IconBtn
                      icon={PlayCircle}
                      label="Play"
                      onClick={() => onPlay(row)}
                    />
                    <IconBtn
                      icon={Download}
                      label="Download"
                      onClick={() => onDownload(row)}
                    />
                    <IconBtn
                      icon={FileText}
                      label="Details"
                      onClick={() => onDetails(row)}
                    />
                    <IconBtn
                      icon={BarChart3}
                      label="Analytics"
                      onClick={() => onAnalytics(row)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-subtle"
                >
                  No sessions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-subtle">
          {filtered.length === 0 ? (
            <>Showing 0 of 0</>
          ) : (
            <>
              Showing {(page - 1) * pageSize + 1}
              {"–"}
              {Math.min(page * pageSize, filtered.length)} of{" "}
              {filtered.length}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="badge-btn disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <span className="text-sm text-default">
            Page {page} / {maxPage}
          </span>
          <button
            className="badge-btn disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// small presentational bits
function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="theme-panel p-4 flex items-center gap-3">
      <div className="rounded-lg border-default border p-2">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <div className="text-xs text-subtle">{label}</div>
        <div className="text-xl font-semibold text-default">{value}</div>
      </div>
    </div>
  );
}

function IconBtn({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="badge-btn inline-flex items-center gap-1 text-xs"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
