// Minimal, fake-but-plausible data to render charts.
// Swap this for real rollups later.

export const sessionsDaily = [
  { date: "2025-06-18", sessions: 3, avgDurationMin: 41 },
  { date: "2025-06-19", sessions: 4, avgDurationMin: 38 },
  { date: "2025-06-20", sessions: 2, avgDurationMin: 56 },
  { date: "2025-06-21", sessions: 5, avgDurationMin: 35 },
  { date: "2025-06-22", sessions: 3, avgDurationMin: 49 },
  { date: "2025-06-23", sessions: 6, avgDurationMin: 44 },
  { date: "2025-06-24", sessions: 4, avgDurationMin: 47 },
];

export const sourceUtilization = [
  // minutes-in-view per source (daily rollup)
  { date: "2025-06-18", Endoscope: 210, Microscope: 90, PTZ: 60, Monitor: 30 },
  { date: "2025-06-19", Endoscope: 260, Microscope: 60, PTZ: 70, Monitor: 20 },
  { date: "2025-06-20", Endoscope: 180, Microscope: 45, PTZ: 40, Monitor: 15 },
  { date: "2025-06-21", Endoscope: 320, Microscope: 80, PTZ: 55, Monitor: 25 },
  { date: "2025-06-22", Endoscope: 210, Microscope: 70, PTZ: 35, Monitor: 25 },
  { date: "2025-06-23", Endoscope: 340, Microscope: 120, PTZ: 85, Monitor: 40 },
  { date: "2025-06-24", Endoscope: 260, Microscope: 95, PTZ: 65, Monitor: 35 },
];

export const qosTrend = [
  // avg latency & stalls per day (aggregated across sources)
  { date: "2025-06-18", latencyMs: 290, stalls: 1 },
  { date: "2025-06-19", latencyMs: 330, stalls: 2 },
  { date: "2025-06-20", latencyMs: 270, stalls: 1 },
  { date: "2025-06-21", latencyMs: 360, stalls: 3 },
  { date: "2025-06-22", latencyMs: 310, stalls: 1 },
  { date: "2025-06-23", latencyMs: 380, stalls: 2 },
  { date: "2025-06-24", latencyMs: 300, stalls: 1 },
];

export const engagementDaily = [
  { date: "2025-06-18", messages: 42, participants: 11, medianResponseMs: 4200 },
  { date: "2025-06-19", messages: 28, participants: 7,  medianResponseMs: 6100 },
  { date: "2025-06-20", messages: 36, participants: 10, medianResponseMs: 4900 },
  { date: "2025-06-21", messages: 65, participants: 15, medianResponseMs: 3700 },
  { date: "2025-06-22", messages: 31, participants: 9,  medianResponseMs: 5200 },
  { date: "2025-06-23", messages: 58, participants: 14, medianResponseMs: 4100 },
  { date: "2025-06-24", messages: 49, participants: 12, medianResponseMs: 4500 },
];

export const layoutDistribution = [
  { name: "2×2 Grid", value: 58 },
  { name: "1+2",     value: 22 },
  { name: "1+3",     value: 12 },
  { name: "Single",  value: 8  },
];

export const errorsTable = [
  { ts: "2025-06-23 10:42", type: "Media decode", source: "Endoscope", count: 2 },
  { ts: "2025-06-23 12:15", type: "Permission",   source: "PTZ",       count: 1 },
  { ts: "2025-06-24 09:20", type: "Network",      source: "Microscope", count: 3 },
  { ts: "2025-06-24 11:02", type: "Rebuffer",     source: "Monitor",    count: 2 },
];

// Quick KPI rollup helpers
export const kpis = {
  activeSessions: 2,
  avgDurationMin: Math.round(
    sessionsDaily.reduce((a, d) => a + d.avgDurationMin, 0) / sessionsDaily.length
  ),
  avgLatencyMs: Math.round(
    qosTrend.reduce((a, d) => a + d.latencyMs, 0) / qosTrend.length
  ),
  stallsPerSession: (qosTrend.reduce((a, d) => a + d.stalls, 0) /
    sessionsDaily.reduce((a, d) => a + d.sessions, 0)
  ).toFixed(2),
};
