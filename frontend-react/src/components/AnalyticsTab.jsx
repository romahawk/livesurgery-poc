import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { Activity, Video, MessageSquare, LayoutDashboard, AlertTriangle } from "lucide-react";
import {
  sessionsDaily, sourceUtilization, qosTrend, engagementDaily,
  layoutDistribution, errorsTable, kpis
} from "../data/analyticsMock";

function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
      <div className="rounded-lg border p-2">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
    </div>
  );
}

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

      {/* Sessions over time */}
      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 font-semibold">Sessions (per day)</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={sessionsDaily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sessions" name="Sessions" />
              <Line yAxisId="right" type="monotone" dataKey="avgDurationMin" name="Avg Min" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Source utilization */}
      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 font-semibold inline-flex items-center gap-2">
          <Video className="h-4 w-4" />
          <span>Source Time-in-View (min/day)</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={sourceUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Endoscope" stackId="a" />
              <Bar dataKey="Microscope" stackId="a" />
              <Bar dataKey="PTZ" stackId="a" />
              <Bar dataKey="Monitor" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* QoS trend */}
      <section className="rounded-xl border bg-white p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64">
          <div className="mb-2 font-semibold">Latency (ms)</div>
          <ResponsiveContainer>
            <LineChart data={qosTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="latencyMs" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64">
          <div className="mb-2 font-semibold">Stalls (per day)</div>
          <ResponsiveContainer>
            <BarChart data={qosTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="stalls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Engagement + Layouts */}
      <section className="rounded-xl border bg-white p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64">
          <div className="mb-2 font-semibold inline-flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Engagement (messages/day)</span>
          </div>
          <ResponsiveContainer>
            <BarChart data={engagementDaily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" name="Messages" />
              <Bar dataKey="participants" name="Participants" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64">
          <div className="mb-2 font-semibold inline-flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Layout Distribution</span>
          </div>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={layoutDistribution} dataKey="value" nameKey="name" outerRadius="80%">
                {layoutDistribution.map((_, i) => <Cell key={i} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Errors table */}
      <section className="rounded-xl border bg-white p-4">
        <div className="mb-2 font-semibold inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Errors & Warnings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>Time</th><th>Type</th><th>Source</th><th>Count</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {errorsTable.map((e, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{e.ts}</td>
                  <td className="px-3 py-2">{e.type}</td>
                  <td className="px-3 py-2">{e.source}</td>
                  <td className="px-3 py-2">{e.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
