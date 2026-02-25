import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Activity, Video, MessageSquare, LayoutDashboard, AlertTriangle } from "lucide-react";
import {
  sessionsDaily,
  sourceUtilization,
  qosTrend,
  engagementDaily,
  layoutDistribution,
  errorsTable,
  kpis,
} from "../data/analyticsMock";
import { COLORS, SOURCE_COLORS, axisStyle, gridStyle, tooltipStyle } from "../data/analyticsTheme";

/* ---------- Small UI bits ---------- */
function Card({ title, icon: Icon, right, children }) {
  return (
    <section className="theme-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold inline-flex items-center gap-2 text-default">
          {Icon && <Icon className="h-4 w-4 text-subtle" aria-hidden />}
          <span>{title}</span>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="theme-panel p-4 flex items-center gap-3">
      <div
        className="rounded-lg border p-2"
        style={{ background: COLORS.mint, borderColor: COLORS.teal, color: COLORS.teal }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <div className="text-xs text-subtle">{label}</div>
        <div className="text-xl font-semibold text-default">{value}</div>
        {sub && <div className="text-xs text-subtle">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function AnalyticsTab() {
  return (
    <div className="p-4 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Activity} label="Active Sessions" value={kpis.activeSessions} />
        <KpiCard icon={Video} label="Avg Duration" value={`${kpis.avgDurationMin} min`} />
        <KpiCard icon={Activity} label="Avg Latency" value={`${kpis.avgLatencyMs} ms`} />
        <KpiCard icon={AlertTriangle} label="Stalls / Session" value={kpis.stallsPerSession} />
      </div>

      {/* Sessions & Avg Min */}
      <Card title="Sessions & Avg Time" icon={Activity}>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={sessionsDaily} margin={{ left: 10, right: 20 }}>
              <defs>
                <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis yAxisId="left" tick={axisStyle} />
              <YAxis yAxisId="right" orientation="right" tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="avgDurationMin"
                name="Avg Min"
                stroke={COLORS.teal}
                strokeWidth={2}
                fill="url(#avgFill)"
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke={COLORS.navy}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Source Time-in-View */}
      <Card title="Source Time-in-View (min/day)" icon={Video}>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={sourceUtilization} margin={{ left: 10, right: 20 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="date" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              {Object.keys(SOURCE_COLORS).map((key) => (
                <Bar key={key} dataKey={key} stackId="tiv" fill={SOURCE_COLORS[key]} name={key} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* QoS: Latency + Stalls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Latency (ms)">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={qosTrend} margin={{ left: 10, right: 20 }}>
                <defs>
                  <linearGradient id="latFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.navy} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLORS.navy} stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="latencyMs"
                  name="Latency"
                  stroke={COLORS.navy}
                  strokeWidth={2}
                  fill="url(#latFill)"
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Stalls (per day)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={qosTrend} margin={{ left: 10, right: 20 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis allowDecimals={false} tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="stalls" name="Stalls" fill={COLORS.slate} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Engagement + Layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Engagement (messages/day)" icon={MessageSquare}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={engagementDaily} margin={{ left: 10, right: 20 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="date" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="messages" name="Messages" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                <Bar dataKey="participants" name="Participants" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Layout Distribution" icon={LayoutDashboard}>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Pie
                  data={layoutDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {layoutDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={[COLORS.teal, COLORS.blue, COLORS.cyan, COLORS.violet, COLORS.slate][i % 5]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Errors table */}
      <Card title="Errors & Warnings" icon={AlertTriangle}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-default">
                <th>Time</th>
                <th>Type</th>
                <th>Source</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {errorsTable.map((e, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">{e.ts}</td>
                  <td className="px-3 py-2">{e.type}</td>
                  <td className="px-3 py-2">{e.source}</td>
                  <td className="px-3 py-2">{e.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
