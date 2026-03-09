// Minimal, fake-but-plausible data to render charts.
// Swap this for real rollups later.

// Generate an ISO date string for `offset` days ago (0 = today, 6 = 6 days ago).
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - offset));
  return d.toISOString().slice(0, 10);
};

export const sessionsDaily = [
  { date: day(0), sessions: 3, avgDurationMin: 41 },
  { date: day(1), sessions: 4, avgDurationMin: 38 },
  { date: day(2), sessions: 2, avgDurationMin: 56 },
  { date: day(3), sessions: 5, avgDurationMin: 35 },
  { date: day(4), sessions: 3, avgDurationMin: 49 },
  { date: day(5), sessions: 6, avgDurationMin: 44 },
  { date: day(6), sessions: 4, avgDurationMin: 47 },
];

export const sourceUtilization = [
  // minutes-in-view per source (daily rollup)
  { date: day(0), Endoscope: 210, Microscope: 90, PTZ: 60, Monitor: 30 },
  { date: day(1), Endoscope: 260, Microscope: 60, PTZ: 70, Monitor: 20 },
  { date: day(2), Endoscope: 180, Microscope: 45, PTZ: 40, Monitor: 15 },
  { date: day(3), Endoscope: 320, Microscope: 80, PTZ: 55, Monitor: 25 },
  { date: day(4), Endoscope: 210, Microscope: 70, PTZ: 35, Monitor: 25 },
  { date: day(5), Endoscope: 340, Microscope: 120, PTZ: 85, Monitor: 40 },
  { date: day(6), Endoscope: 260, Microscope: 95, PTZ: 65, Monitor: 35 },
];

export const qosTrend = [
  // avg latency & stalls per day (aggregated across sources)
  { date: day(0), latencyMs: 290, stalls: 1 },
  { date: day(1), latencyMs: 330, stalls: 2 },
  { date: day(2), latencyMs: 270, stalls: 1 },
  { date: day(3), latencyMs: 360, stalls: 3 },
  { date: day(4), latencyMs: 310, stalls: 1 },
  { date: day(5), latencyMs: 380, stalls: 2 },
  { date: day(6), latencyMs: 300, stalls: 1 },
];

export const engagementDaily = [
  { date: day(0), messages: 42, participants: 11, medianResponseMs: 4200 },
  { date: day(1), messages: 28, participants: 7,  medianResponseMs: 6100 },
  { date: day(2), messages: 36, participants: 10, medianResponseMs: 4900 },
  { date: day(3), messages: 65, participants: 15, medianResponseMs: 3700 },
  { date: day(4), messages: 31, participants: 9,  medianResponseMs: 5200 },
  { date: day(5), messages: 58, participants: 14, medianResponseMs: 4100 },
  { date: day(6), messages: 49, participants: 12, medianResponseMs: 4500 },
];

export const layoutDistribution = [
  { name: "2×2 Grid", value: 58 },
  { name: "1+2",     value: 22 },
  { name: "1+3",     value: 12 },
  { name: "Single",  value: 8  },
];

// Errors table uses relative timestamps too
const ts = (daysAgo, time) => `${day(6 - daysAgo)} ${time}`;

export const errorsTable = [
  { ts: ts(1, "10:42"), type: "Media decode", source: "Endoscope", count: 2 },
  { ts: ts(1, "12:15"), type: "Permission",   source: "PTZ",       count: 1 },
  { ts: ts(0, "09:20"), type: "Network",      source: "Microscope", count: 3 },
  { ts: ts(0, "11:02"), type: "Rebuffer",     source: "Monitor",    count: 2 },
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
